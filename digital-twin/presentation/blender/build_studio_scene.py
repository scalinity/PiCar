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
PACK = ROOT / 'picarx-companion/src/generated/studio'
BLEND = ROOT / 'digital-twin/presentation/blender/picar-studio.blend'
RENDERS = ROOT / 'digital-twin/presentation/blender/renders'
REPORT = ROOT / 'digital-twin/generated/studio/blender-report.json'
MATERIALS = json.loads((ROOT / 'digital-twin/presentation/materials/studio-materials.json').read_text())
STAGE = json.loads((ROOT / 'digital-twin/assemblies/v40/presentation/studio/stage.json').read_text())

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
        return
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


def main():
    manifest = json.loads((PACK / 'manifest.json').read_text())
    hero = STAGE['hero']
    variant = manifest['variants'][hero['variant']]
    step = variant['steps'][hero['step'] - 1]
    if not step['operable']:
        raise SystemExit('HERO_STEP_NOT_DISPLAY_READY')
    meshes = import_definitions(manifest)
    objects = place_instances('STUDIO-SOURCE-INSTANCES', manifest, meshes, step['placements'])
    place_instances('STUDIO-SOURCE-TRAY', manifest, meshes, {k: v for k, v in variant['tray']['instances'].items()}, hidden=True)
    validate(manifest, meshes, objects, step['placements'])
    build_presentation(manifest, step)
    render_settings()
    bpy.context.scene['picar_pack_id'] = manifest['packId']
    bpy.context.scene['picar_state'] = f"{hero['variant']} S{hero['step']:02d} after (M7 closure, display {step['display']})"
    BLEND.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND), compress=True)
    log('saved', BLEND.relative_to(ROOT))
    if RENDER or PREVIEW:
        folder = ROOT / 'digital-twin/generated/studio/previews' if PREVIEW else RENDERS
        folder.mkdir(parents=True, exist_ok=True)
        out = folder / f"{manifest['packId'][:12]}-{hero['variant']}-S{hero['step']:02d}.png"
        bpy.context.scene.render.filepath = str(out)
        bpy.ops.render.render(write_still=True)
        log('rendered', out.relative_to(ROOT))


main()
