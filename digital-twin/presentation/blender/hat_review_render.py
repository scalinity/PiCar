"""Review renders of the Robot HAT display model (Blender, headless).

Reads the meshes and scene.json written by twin_cad.fidelity.hat_review and the Studio material library, builds a
neutral studio scene (even, readable light; no depth of field) and renders the review views. `--registered` also
renders the orthographic top and underside at 40 px/mm over x -8..96, y -14..70 mm (the frame the owner-photo
comparisons are rectified into); those comparison overlays stay local and are never committed.

  <blender> -b --factory-startup -P digital-twin/presentation/blender/hat_review_render.py -- \
      --scene <hat_review output> --materials digital-twin/presentation/materials/studio-materials.json --out <dir> [--registered]
"""
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
opt = {argv[i][2:]: (argv[i + 1] if i + 1 < len(argv) and not argv[i + 1].startswith('--') else True) for i in range(len(argv)) if argv[i].startswith('--')}
scene_dir, out = Path(opt['scene']), Path(opt['out'])
lib = json.loads(Path(opt['materials']).read_text())['materials']
out.mkdir(parents=True, exist_ok=True)
MM = 0.001

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.samples = int(opt.get('samples', 256))
sc.cycles.use_adaptive_sampling = True
sc.cycles.adaptive_threshold = 0.01
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.render.film_transparent = False
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Punchy'
sc.view_settings.exposure = float(opt.get('ev', -0.9))  # the white mask lands near light grey, so saturated finishes keep their colour
for stamp in [a for a in dir(sc.render) if a.startswith('use_stamp')]:
    setattr(sc.render, stamp, False)  # no capture date, host or file name in the published renders
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    sc.cycles.device = 'GPU'
except Exception:
    pass

mats = {}
def material(mid):
    if mid not in mats:
        m = lib[mid]
        mat = bpy.data.materials.new('MAT-hat-' + mid)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes['Principled BSDF']
        bsdf.inputs['Base Color'].default_value = (*m['baseColor'], 1)
        bsdf.inputs['Metallic'].default_value = m['metallic']
        bsdf.inputs['Roughness'].default_value = m['roughness']
        if m.get('clearcoat'):
            bsdf.inputs['Coat Weight'].default_value = m['clearcoat']
        mats[mid] = mat
    return mats[mid]

objects = []
for row in json.loads((scene_dir / 'scene.json').read_text()):
    bpy.ops.wm.obj_import(filepath=str(scene_dir / row['file']), forward_axis='Y', up_axis='Z', global_scale=MM)
    o = bpy.context.selected_objects[0]
    o.name = row['name']
    o.data.materials.clear()
    o.data.materials.append(material(row['materialId']))
    for poly in o.data.polygons:
        poly.use_smooth = True
    objects.append(o)

world = bpy.data.worlds.new('hat-review')
world.use_nodes = True
nt = world.node_tree
ambient = nt.nodes['Background']
ambient.inputs['Color'].default_value = (0.62, 0.61, 0.59, 1)  # bright enough that metal finishes reflect a studio, not a void
ambient.inputs['Strength'].default_value = 0.55
backdrop = nt.nodes.new('ShaderNodeBackground')  # what the camera sees behind the board: a warm mid grey, not lighting
backdrop.inputs['Color'].default_value = (0.30, 0.29, 0.27, 1)
backdrop.inputs['Strength'].default_value = 1.6
path, mix = nt.nodes.new('ShaderNodeLightPath'), nt.nodes.new('ShaderNodeMixShader')
nt.links.new(path.outputs['Is Camera Ray'], mix.inputs['Fac'])
nt.links.new(ambient.outputs['Background'], mix.inputs[1])
nt.links.new(backdrop.outputs['Background'], mix.inputs[2])
nt.links.new(mix.outputs['Shader'], nt.nodes['World Output'].inputs['Surface'])
sc.world = world

# Product three-point light (key:fill:rim 5:1:1.5, neutral 5000 K), placed from the board's bounding box and aimed at
# its centre, plus a soft panel below so the underside views read as evenly as the top.
pts = [o.matrix_world @ Vector(c) for o in objects for c in o.bound_box]
lo = Vector([min(p[i] for p in pts) for i in range(3)]); hi = Vector([max(p[i] for p in pts) for i in range(3)])
centre, extent = (lo + hi) / 2, max(hi - lo)
dist = extent * 2.2
neutral = (1.0, 0.98, 0.95)
def area(name, offset, size, energy, colour=neutral):
    light = bpy.data.lights.new('LGT-' + name, 'AREA')
    light.size, light.energy, light.color = size, energy, colour
    o = bpy.data.objects.new('LGT-' + name, light)
    sc.collection.objects.link(o)
    o.location = centre + Vector(offset) * dist
    o.rotation_euler = (centre - o.location).to_track_quat('-Z', 'Y').to_euler()
    return o
key = 2.2 * float(opt.get('exposure', 1.0))
area('key', (0.6, -0.7, 0.9), extent * 1.6, key)
area('fill', (-0.75, -0.45, 0.45), extent * 2.4, key / 5, (0.97, 0.98, 1.0))
area('rim', (0.0, 0.95, 0.6), extent * 1.6, key * 0.3)
area('under', (0.2, -0.3, -1.0), extent * 2.4, key * 0.45)

cam_data = bpy.data.cameras.new('cam')
cam = bpy.data.objects.new('cam', cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
cam_data.clip_start, cam_data.clip_end = 0.001, 5


def shoot(name, *, ortho=None, eye=None, target=None, lens=50, res=(1600, 1200), up=None, rotation=None, shift=(0, 0)):
    if opt.get('only') and opt['only'] not in name:
        return
    sc.render.resolution_x, sc.render.resolution_y = res
    cam_data.shift_x, cam_data.shift_y = shift
    if ortho:
        cam_data.type, cam_data.ortho_scale = 'ORTHO', ortho
    else:
        cam_data.type, cam_data.lens, cam_data.sensor_width = 'PERSP', lens, 36
    if rotation is not None:
        cam.location, cam.rotation_euler = eye, rotation
    else:
        cam.location = eye
        cam.rotation_euler = (Vector(target) - Vector(eye)).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = str(out / f'{name}.png')
    bpy.ops.render.render(write_still=True)


def at(x, y, z):
    return Vector((x * MM, y * MM, z * MM))


def orbit(az, el, dist, tgt):
    a, e = math.radians(az), math.radians(el)
    return tgt + Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e))) * dist


if opt.get('registered'):
    w, h = 104, 84
    shoot('registered-top', ortho=w * MM, eye=at(44, 28, 200), rotation=(0, 0, 0), res=(w * 40, h * 40))
    shoot('registered-underside', ortho=w * MM, eye=at(44, 28, -200), rotation=(math.pi, 0, 0), res=(w * 40, h * 40))
else:
    c = at(42.5, 28, 2)
    shoot('01-top-orthographic', ortho=96 * MM, eye=at(42.5, 27.5, 200), rotation=(0, 0, 0), res=(1600, 1100))
    shoot('02-underside-orthographic', ortho=96 * MM, eye=at(42.5, 28.5, -200), rotation=(math.pi, 0, 0), res=(1600, 1100))
    shoot('03-top-front-three-quarter', eye=orbit(-30, 38, 0.2, c), target=c, lens=55)
    shoot('04-top-rear-three-quarter', eye=orbit(150, 38, 0.2, c), target=c, lens=55)
    hdr = at(46, 20, 6)
    shoot('05-low-header-angle', eye=orbit(-62, 10, 0.17, hdr), target=hdr, lens=60)
    shoot('06-underside-three-quarter', eye=orbit(-35, -38, 0.2, at(42.5, 28, -4)), target=at(42.5, 28, -4), lens=55)
    pins = at(46.5, 19, 6)
    shoot('07-pin-header-close-up', eye=orbit(-20, 32, 0.075, pins), target=pins, lens=70)
    left = at(4, 25, 3)
    shoot('08-connector-bank-close-up', eye=orbit(-115, 22, 0.085, left), target=left, lens=60)
    corner = at(77, 44, 4)
    shoot('09-speaker-and-motor-corner', eye=orbit(30, 34, 0.09, corner), target=corner, lens=60)
    spi = at(38, 46, 5)
    shoot('10-spi-uart-i2c-headers', eye=orbit(170, 30, 0.08, spi), target=spi, lens=60)
