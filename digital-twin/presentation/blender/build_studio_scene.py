"""Build or refresh the Assembly Studio Blender project from the current Studio pack.

Run through `node digital-twin/tools/studio/studio.mjs blender [--render] [--reset-presentation]`, which opens the
existing picar-studio.blend (if any) and runs this script inside it.

Ownership inside the .blend:
  STUDIO-SOURCE-DEFINITIONS  rebuilt every run: one mesh per part definition, imported from the pack's parts.glb
  STUDIO-SOURCE-INSTANCES    rebuilt every run: linked duplicates placed by the manifest poses of the hero state
  STUDIO-SOURCE-TRAY         rebuilt every run: the labelled parts-tray layout (hidden from render)
  STUDIO-PRESENTATION        created once: camera, lights, floor. Kept on later runs so deliberate edits survive.
  MAT-studio-* materials     created once from studio-materials.json. Kept on later runs (--reset-presentation rebuilds).

Geometry and poses are never edited here: meshes come from the pack (CAD tessellation) and placements from the
manifest (M7 closures). The glTF importer's Y-up to Z-up mapping B and its inverse are the only basis handling;
instance matrices use the same B, so the scene round-trips to the runtime basis exactly.

Presentation identity (presentation-receipt.json). The pack ID identifies geometry and poses; a presentation snapshot also
depends on the stage and material configuration, this builder, the Blender build and the presentation-owned state kept
between runs. The receipt records all of them, a fingerprint of that state, the .blend's bytes and the render it made, and
derives presentationId from them; `studio.mjs check` reports whether the snapshot is still current. Every object in the
scene must belong to an owned collection: a run refuses unowned objects unless --remove-unowned is given, which deletes
them and lists them in the receipt. --check verifies an existing .blend against its receipt without changing anything.
"""
import hashlib
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Quaternion, Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ROOT = Path(argv[argv.index('--root') + 1])
RENDER = '--render' in argv
RESET = '--reset-presentation' in argv
PREVIEW = '--preview' in argv  # quarter resolution, 64 samples, written to the ignored generated folder
CHECK = '--check' in argv
REMOVE_UNOWNED = '--remove-unowned' in argv


def option(name, default):
    return Path(argv[argv.index(name) + 1]) if name in argv else default


PACK = ROOT / 'picarx-companion/src/generated/studio'
BLEND = option('--blend', ROOT / 'digital-twin/presentation/blender/picar-studio.blend')
RECEIPT = option('--receipt', ROOT / 'digital-twin/presentation/blender/presentation-receipt.json')
RENDERS = option('--renders', ROOT / 'digital-twin/presentation/blender/renders')
REPORT = option('--report', ROOT / 'digital-twin/generated/studio/blender-report.json')
STAGE_PATH = 'digital-twin/assemblies/v40/presentation/studio/stage.json'
MATERIALS_PATH = 'digital-twin/presentation/materials/studio-materials.json'
BUILDER_PATH = 'digital-twin/presentation/blender/build_studio_scene.py'
MATERIALS = json.loads((ROOT / MATERIALS_PATH).read_text())
STAGE = json.loads((ROOT / STAGE_PATH).read_text())
SOURCE_COLLECTIONS = ('STUDIO-SOURCE-DEFINITIONS', 'STUDIO-SOURCE-INSTANCES', 'STUDIO-SOURCE-TRAY')
PRESENTATION = 'STUDIO-PRESENTATION'

# glTF (runtime) -> Blender basis, as the glTF importer maps it: (x, y, z) -> (x, -z, y).
B = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
B_INV = B.inverted()


def log(*parts):
    print('[studio]', *parts, flush=True)


def to_blender_point(p):
    return (B @ Vector((*p, 1.0))).xyz


def runtime_matrix(pose):
    x, y, z, w = pose['rotationXYZW']
    m = Quaternion((w, x, y, z)).to_matrix().to_4x4()
    m.translation = Vector(pose['translationM'])
    return m


def collection(name, parent=None, reset=True):
    existing = bpy.data.collections.get(name)
    if existing and reset:
        for obj in list(existing.objects):
            data = obj.data
            bpy.data.objects.remove(obj, do_unlink=True)
            if data is not None and data.users == 0 and isinstance(data, bpy.types.Mesh):
                bpy.data.meshes.remove(data)
        bpy.data.collections.remove(existing)
        existing = None
    if existing is None:
        existing = bpy.data.collections.new(name)
        (parent or bpy.context.scene.collection).children.link(existing)
    return existing


def exclude(name, value=True):
    def walk(layer):
        if layer.name == name:
            layer.exclude = value
        for child in layer.children:
            walk(child)
    walk(bpy.context.view_layer.layer_collection)


def studio_material(material_id):
    name = 'MAT-studio-' + material_id
    mat = bpy.data.materials.get(name)
    if mat is not None and not RESET:
        return mat
    spec = MATERIALS['materials'][material_id]
    if mat is None:
        mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    nodes.clear()
    out = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (-300, 0)
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    bsdf.inputs['Base Color'].default_value = (*spec['baseColor'], 1.0)
    bsdf.inputs['Metallic'].default_value = spec['metallic']
    bsdf.inputs['Roughness'].default_value = spec['roughness']
    if spec.get('clearcoat'):
        bsdf.inputs['Coat Weight'].default_value = spec['clearcoat']
        bsdf.inputs['Coat Roughness'].default_value = spec.get('clearcoatRoughness', 0.2)
    detail = spec.get('detail')
    if detail and 'blender' in detail.get('renderers', []):
        # Render-only micro detail: bead-blast roughness variation and a faint bump, in object space
        # (no UVs, no texture images, no change to geometry). The runtime keeps the base roughness.
        coords = nodes.new('ShaderNodeTexCoord')
        noise = nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 1.0 / (detail['scaleMm'] * 0.001)
        noise.inputs['Detail'].default_value = 2.0
        links.new(coords.outputs['Object'], noise.inputs['Vector'])
        rng = nodes.new('ShaderNodeMapRange')
        rng.inputs['To Min'].default_value = spec['roughness'] - detail['roughnessJitter']
        rng.inputs['To Max'].default_value = spec['roughness'] + detail['roughnessJitter']
        links.new(noise.outputs['Fac'], rng.inputs['Value'])
        links.new(rng.outputs['Result'], bsdf.inputs['Roughness'])
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = detail['bumpStrength']
        bump.inputs['Distance'].default_value = 0.00005
        links.new(noise.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
        for n, x in ((coords, -1100), (noise, -900), (rng, -650), (bump, -650)):
            n.location = (x, -300 if n is bump else 0)
    mat['picar_material_id'] = material_id
    mat['picar_basis'] = spec['basis']
    return mat


def import_definitions(manifest):
    glb = PACK / manifest['assets']['parts']['path']
    if hashlib.sha256(glb.read_bytes()).hexdigest() != manifest['assets']['parts']['sha256']:
        raise SystemExit('STALE_PACK: parts.glb does not match manifest.json')
    target = collection('STUDIO-SOURCE-DEFINITIONS')
    before = set(bpy.data.objects)
    before_materials = set(bpy.data.materials)
    bpy.ops.import_scene.gltf(filepath=str(glb), import_shading='NORMALS', merge_vertices=False)
    imported = [o for o in bpy.data.objects if o not in before]
    meshes = {}
    for obj in imported:
        for c in list(obj.users_collection):
            c.objects.unlink(obj)
        target.objects.link(obj)
        if obj.type != 'MESH':
            continue
        definition_id = obj.name
        if definition_id not in manifest['definitions']:
            raise SystemExit('UNKNOWN_DEFINITION_NODE ' + definition_id)
        for slot in obj.material_slots:
            slot.material = studio_material(slot.material['materialId'] if 'materialId' in slot.material else slot.material.name)
        obj.data.name = definition_id
        obj['picar_definition_id'] = definition_id
        meshes[definition_id] = obj
    for mat in set(bpy.data.materials) - before_materials:
        if mat.users == 0:
            bpy.data.materials.remove(mat)
    exclude('STUDIO-SOURCE-DEFINITIONS')
    return meshes


def place_instances(name, manifest, meshes, poses, hidden=False):
    target = collection(name)
    objects = {}
    for instance_id, pose in sorted(poses.items()):
        info = manifest['instances'][instance_id]
        obj = bpy.data.objects.new(instance_id, meshes[info['definitionId']].data)
        obj.matrix_world = B @ runtime_matrix(pose) @ B_INV
        obj['picar_instance_id'] = instance_id
        obj['picar_definition_id'] = info['definitionId']
        obj['picar_pack_id'] = manifest['packId']
        target.objects.link(obj)
        objects[instance_id] = obj
    if hidden:
        target.hide_render = True
        exclude(name)
    return objects


def validate(manifest, meshes, objects, poses):
    report = {'packId': manifest['packId'], 'definitions': {}, 'instances': {}}
    worst_bounds = worst_pose = 0.0
    for definition_id, obj in meshes.items():
        pts = [B_INV @ v.co for v in obj.data.vertices]
        lo = [min(p[i] for p in pts) for i in range(3)]
        hi = [max(p[i] for p in pts) for i in range(3)]
        expected = manifest['definitions'][definition_id]['boundsM']
        err = max(max(abs(lo[i] - expected['min'][i]), abs(hi[i] - expected['max'][i])) for i in range(3))
        worst_bounds = max(worst_bounds, err)
        report['definitions'][definition_id] = {'boundsErrorM': err, 'vertices': len(obj.data.vertices), 'objectMatrixIdentity': obj.matrix_world == Matrix.Identity(4)}
    for instance_id, obj in objects.items():
        back = B_INV @ obj.matrix_world @ B
        expected = runtime_matrix(poses[instance_id])
        err = max(abs(back[i][j] - expected[i][j]) for i in range(3) for j in range(4))
        worst_pose = max(worst_pose, err)
        report['instances'][instance_id] = {'poseErrorM': err}
    report['worstBoundsErrorM'], report['worstPoseError'] = worst_bounds, worst_pose
    ok = worst_bounds < 1e-6 and worst_pose < 1e-9 and all(d['objectMatrixIdentity'] for d in report['definitions'].values())
    report['status'] = 'PASS' if ok else 'FAIL'
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=1, sort_keys=True))
    log(f'validation {report["status"]}: {len(meshes)} definitions (worst bounds error {worst_bounds:.2e} m), '
        f'{len(objects)} instances (worst pose error {worst_pose:.2e})')
    if not ok:
        raise SystemExit('BLENDER_VALIDATION_FAILED')


def spherical(center, azimuth, elevation, distance):
    az, el = math.radians(azimuth), math.radians(elevation)
    cad = (math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el))
    runtime = (cad[1], cad[2], cad[0])
    return center + to_blender_point(runtime) * distance


def aim(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat('-Z', 'Y').to_euler()


def build_presentation(manifest, step):
    existing = bpy.data.collections.get('STUDIO-PRESENTATION')
    if existing is not None and not RESET:
        log('presentation collection kept (camera, lights, floor); pass --reset-presentation to rebuild it')
        return 'kept'
    built = 'reset' if existing is not None else 'created'
    target = collection('STUDIO-PRESENTATION')
    camera_spec = step['camera']
    center = to_blender_point(camera_spec['targetM'])
    cam_data = bpy.data.cameras.new('CAM-studio-hero')
    cam_data.sensor_fit = 'VERTICAL'
    cam_data.angle_y = math.radians(camera_spec['verticalFovDeg'])
    cam_data.clip_start, cam_data.clip_end = 0.005, 20.0
    cam = bpy.data.objects.new('CAM-studio-hero', cam_data)
    cam.location = to_blender_point(camera_spec['positionM'])
    aim(cam, center)
    target.objects.link(cam)
    bpy.context.scene.camera = cam
    lighting = manifest['lighting']
    for light in lighting['lights']:
        data = bpy.data.lights.new('LGT-studio-' + light['id'], 'AREA')
        data.shape = 'RECTANGLE'
        data.size, data.size_y = light['sizeM']
        data.energy = light['blenderPowerW']
        data.spread = math.radians(light.get('spreadDeg', 180))
        data.color = light['color']
        obj = bpy.data.objects.new('LGT-studio-' + light['id'], data)
        obj.location = spherical(center, light['azimuthDeg'], light['elevationDeg'], light['distanceM'])
        aim(obj, center)
        target.objects.link(obj)
    floor_z = manifest['variants'][STAGE['hero']['variant']]['floorYM']
    bpy.ops.mesh.primitive_plane_add(size=6.0, location=(center.x, center.y, floor_z))
    floor = bpy.context.active_object
    floor.name = 'GEO-studio-floor'
    for c in list(floor.users_collection):
        c.objects.unlink(floor)
    target.objects.link(floor)
    mat = bpy.data.materials.get('MAT-studio-floor') or bpy.data.materials.new('MAT-studio-floor')
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*lighting['floor']['baseColor'], 1.0)
    bsdf.inputs['Roughness'].default_value = lighting['floor']['roughness']
    floor.data.materials.append(mat)
    floor.is_shadow_catcher = True  # same structure as the runtime: flat background, shadow-only floor
    world = bpy.context.scene.world or bpy.data.worlds.new('WLD-studio')
    bpy.context.scene.world = world
    world.use_nodes = True
    hexcolor = lighting['background'].lstrip('#')
    srgb = [int(hexcolor[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (*linear, 1.0)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
    return built


def by_id(sockets, identifier):
    return next(s for s in sockets if s.identifier == identifier)


def background_composite(scene):
    # Same structure as the runtime: transparent film (subject + shadow-catcher shadows) over one flat background
    # colour. The colour is entered scene-linear and then passes the AgX view transform like everything else.
    scene.render.film_transparent = True
    scene.view_layers[0].cycles.use_pass_shadow_catcher = True
    group = bpy.data.node_groups.get('CMP-studio-background') or bpy.data.node_groups.new('CMP-studio-background', 'CompositorNodeTree')
    group.nodes.clear()
    if not any(s.in_out == 'OUTPUT' for s in group.interface.items_tree):
        group.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
    layers = group.nodes.new('CompositorNodeRLayers')
    pool = STAGE['lighting']['pool']
    edge = group.nodes.new('CompositorNodeRGB')
    edge.outputs[0].default_value = (*STAGE['lighting']['backgroundSceneLinear'], 1.0)
    centre = group.nodes.new('CompositorNodeRGB')
    centre.outputs[0].default_value = (*pool['sceneLinear'], 1.0)
    mask = group.nodes.new('CompositorNodeEllipseMask')
    mask.inputs['Position'].default_value = (pool['centre'][0], 1.0 - pool['centre'][1])
    mask.inputs['Size'].default_value = pool['size']
    blur = group.nodes.new('CompositorNodeBlur')
    blur.inputs['Size'].default_value = [int(pool['blurFraction'] * r) for r in STAGE['hero']['resolution']]
    blend = group.nodes.new('ShaderNodeMix')
    blend.data_type = 'RGBA'
    group.links.new(mask.outputs['Mask'], blur.inputs['Image'])
    group.links.new(blur.outputs['Image'], by_id(blend.inputs, 'Factor_Float'))
    group.links.new(edge.outputs[0], by_id(blend.inputs, 'A_Color'))
    group.links.new(centre.outputs[0], by_id(blend.inputs, 'B_Color'))
    color = blend
    shadow = group.nodes.new('ShaderNodeMix')
    shadow.data_type, shadow.blend_type = 'RGBA', 'MULTIPLY'
    by_id(shadow.inputs, 'Factor_Float').default_value = 1.0
    over = group.nodes.new('CompositorNodeAlphaOver')
    out = group.nodes.new('NodeGroupOutput')
    group.links.new(by_id(color.outputs, 'Result_Color'), by_id(shadow.inputs, 'A_Color'))
    group.links.new(layers.outputs['Shadow Catcher'], by_id(shadow.inputs, 'B_Color'))
    group.links.new(by_id(shadow.outputs, 'Result_Color'), over.inputs['Background'])
    group.links.new(layers.outputs['Image'], over.inputs['Foreground'])
    group.links.new(over.outputs[0], out.inputs[0])
    scene.compositing_node_group = group


def render_settings():
    # Blender writes the producer's absolute project filename into PNG text metadata even without a visible stamp.
    bpy.context.scene.render.use_stamp_filename = False
    scene = bpy.context.scene
    background_composite(scene)
    scene.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    try:
        prefs.compute_device_type = 'METAL'
        prefs.get_devices()
        for device in prefs.devices:
            device.use = True
        scene.cycles.device = 'GPU'
    except Exception as error:  # CPU fallback keeps the render reproducible on any Mac
        log('GPU unavailable, rendering on CPU:', error)
        scene.cycles.device = 'CPU'
    scene.cycles.samples = 64 if PREVIEW else STAGE['hero']['samples']
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = STAGE['hero']['resolution']
    scene.render.resolution_percentage = 25 if PREVIEW else 100
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'None'
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_depth = '8'
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.length_unit = 'MILLIMETERS'


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False)


def rounded(value):
    """Plain JSON values for the fingerprint: floats to 1e-6, Blender vectors and colours as lists."""
    if isinstance(value, float):
        return round(value, 6) + 0.0
    if isinstance(value, (bool, int, str)) or value is None:
        return value
    try:
        return [rounded(v) for v in value]
    except TypeError:
        return str(value)


def ownership(expected):
    """Every scene object must sit in exactly one owned collection; source collections hold exactly what this run built."""
    owned = {name: bpy.data.collections.get(name) for name in (*SOURCE_COLLECTIONS, PRESENTATION)}
    homes = {}
    for name, coll in owned.items():
        for obj in (coll.all_objects if coll else []):
            homes.setdefault(obj.name, []).append(name)
    scene = bpy.context.scene
    problems = [f'UNOWNED_SCENE_OBJECT {o.name}' for o in sorted(scene.objects, key=lambda o: o.name) if o.name not in homes]
    problems += [f'OBJECT_IN_TWO_OWNED_COLLECTIONS {n}' for n, h in sorted(homes.items()) if len(h) > 1]
    top = [c.name for c in scene.collection.children if c.name not in owned]
    problems += [f'UNOWNED_COLLECTION {n}' for n in sorted(top)]
    counts = {name: len(coll.all_objects) if coll else 0 for name, coll in owned.items()}
    problems += [f'SOURCE_COUNT {n} {counts[n]} expected {v}' for n, v in expected.items() if counts[n] != v]
    # Hero and tray copies share instance IDs, so Blender suffixes object names; identity is the tag each object carries,
    # which must be present and unique within its collection.
    for name in SOURCE_COLLECTIONS:
        key = 'picar_definition_id' if name == 'STUDIO-SOURCE-DEFINITIONS' else 'picar_instance_id'
        objs = list(owned[name].objects) if owned[name] else []
        ids = [o.get(key) for o in objs]
        problems += [f'UNTAGGED_SOURCE_OBJECT {name} {o.name}' for o in objs if o.get(key) is None]
        problems += [f'DUPLICATE_SOURCE_OBJECT {name} {i}' for i in sorted({i for i in ids if i is not None and ids.count(i) > 1})]
    return {'counts': counts, 'problems': problems}


def remove_unowned():
    """Delete scene objects and top-level collections outside the owned collections (for example Blender's factory
    startup Cube, Light and Camera). Only with --remove-unowned; every removal is listed in the receipt."""
    owned = {n for n in (*SOURCE_COLLECTIONS, PRESENTATION)}
    keep = {o.name for n in owned if bpy.data.collections.get(n) for o in bpy.data.collections[n].all_objects}
    removed = []
    for obj in [o for o in bpy.context.scene.objects if o.name not in keep]:
        removed.append(f'object {obj.name} ({obj.type})')
        bpy.data.objects.remove(obj, do_unlink=True)
    for coll in [c for c in bpy.context.scene.collection.children if c.name not in owned]:
        removed.append(f'collection {coll.name}')
        bpy.data.collections.remove(coll)
    return removed


def presentation_state():
    """Fingerprint of the presentation-owned state a rebuild keeps or derives: STUDIO-PRESENTATION objects and their
    data, the MAT-studio-* node trees, the world and the render settings."""
    scene = bpy.context.scene
    objects = []
    coll = bpy.data.collections.get(PRESENTATION)
    for obj in sorted(coll.all_objects if coll else [], key=lambda o: o.name):
        row = {'name': obj.name, 'type': obj.type, 'matrix': rounded([list(r) for r in obj.matrix_world]), 'hideRender': obj.hide_render,
               'shadowCatcher': obj.is_shadow_catcher}
        data = obj.data
        if obj.type == 'LIGHT':
            row['light'] = {k: rounded(getattr(data, k, None)) for k in ('type', 'energy', 'color', 'shape', 'size', 'size_y', 'spread')}
        elif obj.type == 'CAMERA':
            row['camera'] = {k: rounded(getattr(data, k)) for k in ('lens', 'sensor_fit', 'angle_y', 'clip_start', 'clip_end')}
        elif obj.type == 'MESH':
            row['mesh'] = {'vertices': len(data.vertices), 'materials': [m.name if m else None for m in data.materials]}
        objects.append(row)
    materials = []
    for mat in sorted((m for m in bpy.data.materials if m.name.startswith('MAT-studio-')), key=lambda m: m.name):
        nodes = sorted(mat.node_tree.nodes, key=lambda n: n.name) if mat.use_nodes and mat.node_tree else []
        materials.append({
            'name': mat.name,
            'nodes': [{'name': n.name, 'type': n.bl_idname,
                       'inputs': {s.identifier: rounded(s.default_value) for s in n.inputs if hasattr(s, 'default_value') and not s.is_linked}} for n in nodes],
            'links': sorted(f'{l.from_node.name}.{l.from_socket.identifier}>{l.to_node.name}.{l.to_socket.identifier}' for l in (mat.node_tree.links if nodes else [])),
        })
    world = scene.world
    background = world.node_tree.nodes.get('Background') if world and world.use_nodes else None
    render = scene.render
    return {
        'objects': objects, 'materials': materials,
        'world': {'color': rounded(background.inputs['Color'].default_value), 'strength': rounded(background.inputs['Strength'].default_value)} if background else None,
        'render': {'engine': render.engine, 'samples': scene.cycles.samples, 'resolution': [render.resolution_x, render.resolution_y],
                   'viewTransform': scene.view_settings.view_transform, 'look': scene.view_settings.look, 'filmTransparent': render.film_transparent},
    }


def recipe_for(pack_id, hero, state):
    build_hash = bpy.app.build_hash.decode() if isinstance(bpy.app.build_hash, bytes) else str(bpy.app.build_hash)
    return {'packId': pack_id, 'hero': {'variant': hero['variant'], 'step': hero['step']},
            'inputs': {p: sha256((ROOT / p).read_bytes()) for p in (STAGE_PATH, MATERIALS_PATH, BUILDER_PATH)},
            'blender': {'version': bpy.app.version_string, 'buildHash': build_hash},
            'presentationStateSha256': sha256(canonical(state).encode())}


def presentation_id(recipe):
    return sha256(('picar-studio:presentation\n' + canonical(recipe)).encode())


def check_only():
    """Verify the open .blend against its receipt: same presentation state, same ownership, nothing unowned."""
    receipt = json.loads(RECEIPT.read_text())
    state = presentation_state()
    own = ownership({n: receipt['ownership']['counts'][n] for n in SOURCE_COLLECTIONS})
    problems = list(own['problems'])
    actual = sha256(canonical(state).encode())
    if actual != receipt['recipe']['presentationStateSha256']:
        problems.append(f"PRESENTATION_STATE_CHANGED expected={receipt['recipe']['presentationStateSha256']} actual={actual}")
    if bpy.context.scene.get('picar_presentation_id') != receipt['presentationId']:
        problems.append('PRESENTATION_ID_NOT_IN_BLEND')
    print('[studio] check ' + json.dumps({'presentationId': receipt['presentationId'], 'problems': problems}), flush=True)
    if problems:
        raise SystemExit('PRESENTATION_CHECK_FAILED')


def main():
    if CHECK:
        return check_only()
    manifest = json.loads((PACK / 'manifest.json').read_text())
    hero = STAGE['hero']
    variant = manifest['variants'][hero['variant']]
    step = variant['steps'][hero['step'] - 1]
    if not step['operable']:
        raise SystemExit('HERO_STEP_NOT_DISPLAY_READY')
    # A new .blend starts as Blender's factory scene, none of which is presentation work; an existing one is only cleaned
    # on request, so nothing someone placed there deliberately disappears silently.
    removed = remove_unowned() if REMOVE_UNOWNED or not bpy.data.filepath else []
    for item in removed:
        log('removed unowned', item)
    meshes = import_definitions(manifest)
    objects = place_instances('STUDIO-SOURCE-INSTANCES', manifest, meshes, step['placements'])
    tray = place_instances('STUDIO-SOURCE-TRAY', manifest, meshes, {k: v for k, v in variant['tray']['instances'].items()}, hidden=True)
    validate(manifest, meshes, objects, step['placements'])
    built = build_presentation(manifest, step)
    render_settings()
    owned = ownership({'STUDIO-SOURCE-DEFINITIONS': len(meshes), 'STUDIO-SOURCE-INSTANCES': len(objects), 'STUDIO-SOURCE-TRAY': len(tray)})
    if owned['problems']:
        raise SystemExit('SCENE_OWNERSHIP ' + '; '.join(owned['problems']) + ' (pass --remove-unowned to delete objects outside the owned collections)')
    state = presentation_state()
    recipe = recipe_for(manifest['packId'], hero, state)
    pid = presentation_id(recipe)
    scene = bpy.context.scene
    scene['picar_pack_id'] = manifest['packId']
    scene['picar_presentation_id'] = pid
    scene['picar_state'] = f"{hero['variant']} S{hero['step']:02d} after (M7 closure, display {step['display']})"
    # File-browser UI state is not a dependency; keep the shared project free of the producer's home directory.
    for screen in bpy.data.screens:
        for area in screen.areas:
            for space in area.spaces:
                if space.type == 'FILE_BROWSER' and space.params:
                    space.params.directory = b'//'
    BLEND.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND), compress=True)
    log('saved', BLEND, 'presentation', pid)
    render = None
    if RENDER or PREVIEW:
        folder = ROOT / 'digital-twin/generated/studio/previews' if PREVIEW else RENDERS
        folder.mkdir(parents=True, exist_ok=True)
        out = folder / f"{manifest['packId'][:12]}-{pid[:12]}-{hero['variant']}-S{hero['step']:02d}.png"
        scene.render.filepath = str(out)
        bpy.ops.render.render(write_still=True)
        log('rendered', out)
        render = {'path': out.relative_to(ROOT).as_posix() if out.is_relative_to(ROOT) else str(out), 'sha256': sha256(out.read_bytes()),
                  'preview': PREVIEW, 'samples': scene.cycles.samples, 'resolutionPercentage': scene.render.resolution_percentage}
    receipt = {
        'contract': 'picar-studio-presentation/1', 'presentationId': pid, 'recipe': recipe,
        'presentation': {'built': built, 'removedUnowned': removed},
        'ownership': {'counts': owned['counts'], 'unowned': []},
        'blend': {'path': BLEND.relative_to(ROOT).as_posix() if BLEND.is_relative_to(ROOT) else str(BLEND), 'sha256': sha256(BLEND.read_bytes())},
        'render': render,
    }
    RECEIPT.parent.mkdir(parents=True, exist_ok=True)
    RECEIPT.write_text(json.dumps(receipt, indent=1, sort_keys=True) + '\n')
    log('receipt', RECEIPT, json.dumps({'presentationId': pid, 'built': built, 'counts': owned['counts']}))


main()
