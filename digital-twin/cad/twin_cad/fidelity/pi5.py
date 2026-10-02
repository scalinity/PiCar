"""Raspberry Pi 5 display-detail model, authored from the official mechanical drawing (Raspberry Pi Ltd, scale 1:1).

Registered to the M5/M7 board frame: x along the 85 mm edge from the GPIO-side corner, y along the 56 mm edge
(GPIO header at high y), z up from the PCB underside. Mounting holes and PCB match the instructional board exactly.

Display only. Assembly checks keep using the M7 instructional board revision; `relation` and `overlaps` record how
the two agree, bound to exact inputs (schema picar-studio-display-check/1): the display artifact, the instructional
artifact and every other placed part's artifact by SHA-256, and each checked closure by its canonical RFC 8785 hash
(the verifier's closureRfc8785Sha256). The Studio pack refuses the record for any state it does not name.
Positions are read from the drawing (stated values where dimensioned, scaled reads otherwise); heights are typical
part heights where the drawing gives none. Nothing here is copied from vendor CAD.

  PYTHONPATH=digital-twin/cad <env>/bin/python -m twin_cad.fidelity.pi5 --root <repo> --chain <chain-run> --output <dir>
"""
import argparse
import hashlib
import json
import math
from pathlib import Path

import cadquery as cq
import numpy as np
import rfc8785

SCHEMA = 'picar-studio-display-check/1'
BOARD = 'PX-V40-INS-PI5-001'
INSTRUCTIONAL = 'remediation/PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep'  # inside the chain run, as closure.shape_path resolves it
PCB_T = 1.6  # the instructional board's thickness, kept so bearing heights stay identical
HOLES = [(3.5, 3.5), (61.5, 3.5), (3.5, 52.5), (61.5, 52.5)]
TOP = PCB_T


def box(x0, x1, y0, y1, z0, z1):
    return cq.Workplane('XY').box(x1 - x0, y1 - y0, z1 - z0, centered=False).translate((x0, y0, z0)).val()


def pcb(length=85.0, width=56.0, r=3.0):
    # Rounded outline drawn explicitly (no edge selector, so the export is byte-stable across rebuilds).
    k = r * (1 - math.cos(math.pi / 4))
    plate = (cq.Workplane('XY').moveTo(r, 0).lineTo(length - r, 0).threePointArc((length - k, k), (length, r))
             .lineTo(length, width - r).threePointArc((length - k, width - k), (length - r, width))
             .lineTo(r, width).threePointArc((k, width - k), (0, width - r))
             .lineTo(0, r).threePointArc((k, k), (r, 0)).close().extrude(PCB_T))
    for x, y in HOLES:
        plate = plate.cut(cq.Workplane('XY').center(x, y).circle(1.35).extrude(PCB_T))
        # Pads sit flush in the top copper: recess the board so the pad top is the bearing plane, not above it.
        plate = plate.cut(cq.Workplane('XY').workplane(offset=TOP - PAD_T).center(x, y).circle(3.0).circle(1.35).extrude(PAD_T))
    return plate.val()


PAD_T = 0.035


def pads():
    rings = None
    for x, y in HOLES:
        ring = cq.Workplane('XY').workplane(offset=TOP - PAD_T).center(x, y).circle(3.0).circle(1.35).extrude(PAD_T)
        rings = ring if rings is None else rings.union(ring)
    return rings.val()


def header(cx, cy, cols, rows, base_h, pin_top):
    pitch = 2.54
    w, d = cols * pitch, rows * pitch
    base = box(cx - w / 2, cx + w / 2, cy - d / 2, cy + d / 2, TOP, TOP + base_h)
    pins = None
    for i in range(cols):
        for j in range(rows):
            x = cx - w / 2 + pitch / 2 + i * pitch
            y = cy - d / 2 + pitch / 2 + j * pitch
            pin = cq.Workplane('XY').workplane(offset=TOP).center(x, y).rect(0.64, 0.64).extrude(pin_top - TOP)
            pins = pin if pins is None else pins.union(pin)
    return base, pins.val()


def usb_stack(cy, shell_x0=70.5, front=88.0, height=15.6, width=13.15):
    """Two stacked USB-A receptacles: metal shell with two front openings, a plastic tongue in each."""
    shell = cq.Workplane('XY').box(front - shell_x0, width, height, centered=False).translate((shell_x0, cy - width / 2, TOP))
    tongues = []
    for z in (TOP + 1.9, TOP + 9.3):
        shell = shell.cut(cq.Workplane('XY').box(9.0, 12.0, 5.1, centered=False).translate((front - 9.0, cy - 6.0, z)))
        tongues.append(box(front - 8.5, front - 0.6, cy - 5.6, cy + 5.6, z + 1.8, z + 3.4))
    return shell.val(), tongues


def ethernet(cy=10.2, x0=66.6, front=88.0, height=13.5, width=16.0):
    shell = cq.Workplane('XY').box(front - x0, width, height, centered=False).translate((x0, cy - width / 2, TOP))
    opening = cq.Workplane('XY').box(12.0, 11.7, 8.0, centered=False).translate((front - 12.0, cy - 5.85, TOP + 2.2))
    shell = shell.cut(opening)
    jack = box(front - 12.0, front - 11.0, cy - 5.85, cy + 5.85, TOP + 2.2, TOP + 10.2)  # contact block at the back of the opening
    return shell.val(), jack


def stadium_port(cx, width, height, depth, y_front=-1.0):
    """USB-C style receptacle: stadium cross-section extruded inward from the board edge."""
    outer = cq.Workplane('XZ', origin=(0, y_front, 0)).center(cx, TOP + height / 2).slot2D(width, height).extrude(-depth)
    inner = cq.Workplane('XZ', origin=(0, y_front, 0)).center(cx, TOP + height / 2).slot2D(width - 0.6, height - 0.6).extrude(-depth * 0.6)
    return outer.cut(inner).val()


def micro_hdmi(cx, depth=7.5, y_front=-0.5):
    """Micro HDMI receptacle: trapezoid face (wide top), extruded inward from the board edge."""
    top_w, bottom_w, h = 6.4, 5.0, 3.5
    pts = [(cx - top_w / 2, TOP + h), (cx + top_w / 2, TOP + h), (cx + top_w / 2, TOP + 1.2), (cx + bottom_w / 2, TOP),
           (cx - bottom_w / 2, TOP), (cx - top_w / 2, TOP + 1.2)]
    outer = cq.Workplane('XZ', origin=(0, y_front, 0)).polyline(pts).close().extrude(-depth)
    inner_pts = [(x * 0.82 + cx * 0.18, (z - TOP) * 0.7 + TOP + 0.5) for x, z in pts]
    return outer.cut(cq.Workplane('XZ', origin=(0, y_front, 0)).polyline(inner_pts).close().extrude(-depth * 0.6)).val()


def fpc_connector(x0, x1, y0, y1, h=1.2, latch_h=0.5):
    body = box(x0, x1, y0, y1, TOP, TOP + h)
    latch = box(x0 + 0.2, x1 - 0.2, y0, y1, TOP + h, TOP + h + latch_h)
    return body, latch


def chip(x0, x1, y0, y1, h):
    return box(x0, x1, y0, y1, TOP, TOP + h)


def rotated_chip(cx, cy, side, h, angle=45):
    return cq.Workplane('XY').workplane(offset=TOP).center(cx, cy).rect(side, side).extrude(h).rotate((cx, cy, 0), (cx, cy, 1), angle).val()


def build():
    """Ordered (name, materialId, solid) parts; order is stable so the export is deterministic.
    Positions follow the drawing; sizes and heights were refined against the vendor STEP as guidance (numbers only).
    The vendor STEP models no micro-HDMI bodies, so those two rest on the drawing's dimensioned centres alone."""
    parts = [('pcb', 'pcb-green', pcb()), ('mounting pads', 'contact-gold', pads())]
    base, pins = header(32.5, 52.5, 20, 2, 2.5, TOP + 8.5)
    parts += [('GPIO header', 'header-black', base), ('GPIO pins', 'contact-gold', pins)]
    for label, cy, tongue, height in (('USB 2.0 ports', 47.0, 'header-black', 16.1), ('USB 3.0 ports', 29.1, 'usb3-blue', 16.2)):
        shell, tongues = usb_stack(cy, height=height, width=14.5)
        parts.append((label, 'port-nickel', shell))
        parts += [(f'{label} tongue {k + 1}', tongue, t) for k, t in enumerate(tongues)]
    shell, jack = ethernet(height=13.33)
    parts += [('Ethernet jack', 'port-nickel', shell), ('Ethernet contacts', 'header-black', jack)]
    parts.append(('USB-C power', 'port-nickel', stadium_port(11.2, 8.94, 3.26, 7.35)))
    parts += [(f'micro HDMI {i}', 'port-nickel', micro_hdmi(x)) for i, x in enumerate((25.8, 39.2))]
    for label, (x0, x1) in (('camera/display 0', (47.1, 50.1)), ('camera/display 1', (53.4, 56.4))):
        body, latch = fpc_connector(x0, x1, 0.14, 16.84, h=3.0, latch_h=1.0)
        parts += [(label, 'header-black', body), (label + ' latch', 'speaker-dark', latch)]
    body, latch = fpc_connector(1.1, 4.1, 23.14, 36.84, h=3.0, latch_h=1.0)
    parts += [('PCIe FFC', 'header-black', body), ('PCIe FFC latch', 'speaker-dark', latch)]
    base, pins = header(61.5, 9.5, 2, 2, 2.5, TOP + 6.0)
    parts += [('PoE header', 'header-black', base), ('PoE pins', 'contact-gold', pins)]
    parts += [('fan connector', 'connector-cream', chip(65.5, 68.0, 49.0, 54.9, 4.2)),
              ('UART connector', 'connector-cream', chip(66.3, 68.7, 40.35, 47.65, 1.0)),
              ('RTC battery connector', 'connector-cream', chip(55.28, 56.88, 46.45, 49.45, 1.5))]
    parts += [('SoC package', 'pcb-green', chip(24.65, 41.65, 14.25, 31.25, 0.75)),
              ('SoC metal lid', 'port-nickel', box(24.7, 41.6, 14.3, 31.2, TOP + 0.75, TOP + 1.0)),
              ('LPDDR4X memory', 'header-black', chip(25.9, 40.4, 34.2, 44.2, 1.0)),
              ('RP1 I/O controller', 'header-black', chip(52.5, 64.5, 29.1, 41.1, 1.23)),
              ('power management IC', 'header-black', chip(8.7, 13.7, 12.7, 17.7, 0.58)),
              ('wireless module shield', 'port-nickel', chip(6.9, 17.7, 36.2, 49.2, 1.73)),
              ('Ethernet PHY', 'header-black', rotated_chip(64.0, 23.5, 6.1, 0.9)),
              ('power button', 'header-black', chip(0.35, 2.95, 16.35, 20.45, 3.3)),
              ('microSD socket', 'port-nickel', box(2.25, 13.65, 22.12, 34.07, -1.3, 0.0))]
    return parts


def compound(parts):
    return cq.Compound.makeCompound([p[2] for p in parts])


def sha256_file(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def hole_centres(shape, radius):
    """XY centres of the vertical cylinder features of one radius, measured from the shape itself."""
    from twin_cad.assemblies.instructional.verify import shape_features
    return sorted({(round(float(f['origin'][0]), 6), round(float(f['origin'][1]), 6)) for f in shape_features(shape)
                   if abs(f['radius'] - radius) < 1e-6 and abs(abs(f['axis'][2]) - 1) < 1e-9})


def relation(detail_parts, chain):
    """Compare the detail with the instructional board: measured holes, PCB envelope and every instructional solid's box."""
    board_path = chain / INSTRUCTIONAL
    board = cq.Shape.importBrep(str(board_path))
    solids = board.Solids()
    pcb_detail = detail_parts[0][2].BoundingBox()
    boxes = []
    for i, s in enumerate(solids):
        b = s.BoundingBox()
        # The detail parts whose boxes overlap this instructional solid most.
        best, best_iou = None, 0.0
        for name, _, shape in detail_parts[2:]:
            d = shape.BoundingBox()
            ix = max(0.0, min(b.xmax, d.xmax) - max(b.xmin, d.xmin)); iy = max(0.0, min(b.ymax, d.ymax) - max(b.ymin, d.ymin))
            iz = max(0.0, min(b.zmax, d.zmax) - max(b.zmin, d.zmin))
            inter = ix * iy * iz
            union = (b.xlen * b.ylen * b.zlen) + (d.xlen * d.ylen * d.zlen) - inter
            iou = inter / union if union else 0.0
            if iou > best_iou:
                best, best_iou = (name, d), iou
        row = {'instructionalSolid': i, 'boxMm': [round(v, 3) for v in (b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax)]}
        if best:
            name, d = best
            row.update({'nearestDetail': name, 'boxIoU': round(best_iou, 3),
                        'centreOffsetMm': [round(v, 3) for v in ((d.center.x - b.center.x), (d.center.y - b.center.y), (d.center.z - b.center.z))]})
        boxes.append(row)
    display_holes, board_holes = hole_centres(detail_parts[0][2], 1.35), hole_centres(board, 1.4)
    deviation = max(min(math.dist(h, b) for b in board_holes) for h in display_holes) if display_holes and board_holes else None
    return {'instructionalArtifact': {'definitionId': 'PX-V40-DEF-PI5', 'path': 'chain:' + INSTRUCTIONAL, 'sha256': sha256_file(board_path)},
            'pcbBoxMm': [round(v, 3) for v in (pcb_detail.xmin, pcb_detail.ymin, pcb_detail.zmin, pcb_detail.xmax, pcb_detail.ymax, pcb_detail.zmax)],
            'mountingHoles': {'method': 'vertical cylinder features measured on each artifact, centres in the shared board frame',
                              'displayRadiusMm': 1.35, 'instructionalRadiusMm': 1.4, 'display': display_holes, 'instructional': board_holes,
                              'maxCentreDeviationMm': None if deviation is None else round(deviation, 6)},
            'instructionalSolids': boxes}


def overlaps(root, chain, detail):
    """Place the detail board in every closure that holds the board and intersect it with every other placed part.
    Each checked closure is named by its canonical hash and every other part by its artifact hash, so a record cannot
    stand for a state it did not measure. Positive volumes are display conflicts the instructional checks could not
    see; they are reported, never hidden."""
    from twin_cad.assemblies.instructional.closure import shape_path
    from twin_cad.assemblies.instructional.verify import placed, rigid
    dirs = {'root': root, 'artifacts': chain / 'remediation', 'boards': chain / 'anchor' / 'boards'}
    cache, parts, closures, rows = {}, {}, [], []
    for closure in sorted((chain / 'chain' / 'closures').glob('*-closure.json')):
        record = json.loads(closure.read_text())
        poses = {p['instanceId']: p for p in record['placements']}
        if BOARD not in poses:
            continue
        variant = record['variantId']
        graph = json.loads((root / f'digital-twin/validation/m2/{variant}/compiled-graph.json').read_text())
        definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
        identity = {'variantId': variant, 'step': record['printedNumber'], 'closureRfc8785Sha256': hashlib.sha256(rfc8785.dumps(record)).hexdigest()}
        closures.append(identity)
        board = placed(detail, *rigid(poses[BOARD]))
        bb = board.BoundingBox()
        for iid, pose in sorted(poses.items()):
            if iid == BOARD:
                continue
            d = definition_of[iid]
            if d not in cache:
                path = shape_path(d, dirs)
                cache[d], parts[d] = cq.Shape.importBrep(str(path)), sha256_file(path)
            other = placed(cache[d], *rigid(pose))
            ob = other.BoundingBox()
            if ob.xmin > bb.xmax or ob.xmax < bb.xmin or ob.ymin > bb.ymax or ob.ymax < bb.ymin or ob.zmin > bb.zmax or ob.zmax < bb.zmin:
                continue
            volume = board.intersect(other).Volume()
            if volume > 1e-3:
                rows.append({**identity, 'instanceId': iid, 'volumeMm3': round(volume, 4)})
    return {'partArtifacts': dict(sorted(parts.items())), 'closures': closures, 'positive': rows}


def vendor_crosscheck(root, parts):
    """Compare each detail part with the vendor STEP (same board frame as M7's correspondence check establishes).
    Records numbers only; no vendor geometry leaves this function."""
    members = json.loads((root / 'docs/implementation/evidence/m5/pi5-zip-members.json').read_text())
    step = next(m for m in members if m['path'].endswith('.step'))
    vendor = cq.importers.importStep(str(root / step['path'])).val().Solids()
    vb = np.array([[b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax] for b in (s.BoundingBox() for s in vendor)])
    vvol = np.array([s.Volume() for s in vendor])
    vendor_top = 1.306  # vendor PCB top; detail PCB top is 1.6, so heights are compared above each board's top
    rows = []
    for name, _, shape in parts[2:]:
        b = shape.BoundingBox()
        d = np.array([b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax])
        lo, hi = np.maximum(vb[:, :2], d[:2]), np.minimum(vb[:, 3:5], d[3:5])
        inter = np.prod(np.clip(hi - lo, 0, None), axis=1)
        area_v = np.prod(vb[:, 3:5] - vb[:, :2], axis=1)
        area_d = (d[3] - d[0]) * (d[4] - d[1])
        iou = inter / np.maximum(area_v + area_d - inter, 1e-9)
        iou[vvol < 0.5] = 0  # ignore tiny vendor solids (pins, passives) when matching a part
        i = int(np.argmax(iou))
        if iou[i] <= 0:
            rows.append({'part': name, 'vendorMatch': None})
            continue
        v = vb[i]
        rows.append({'part': name, 'footprintIoU': round(float(iou[i]), 3),
                     'centreOffsetXYMm': [round(float((v[0] + v[3]) / 2 - (d[0] + d[3]) / 2), 2), round(float((v[1] + v[4]) / 2 - (d[1] + d[4]) / 2), 2)],
                     'sizeDeltaXYMm': [round(float((v[3] - v[0]) - (d[3] - d[0])), 2), round(float((v[4] - v[1]) - (d[4] - d[1])), 2)],
                     'topAboveBoardDeltaMm': round(float((v[5] - vendor_top) - (d[5] - TOP)), 2)})
    return {'vendorSolids': len(vendor), 'method': 'footprint IoU of each detail part with the best-matching vendor solid; numbers only', 'parts': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--chain', type=Path, required=True, help='chain run whose remediation holds the instructional board')
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--vendor-crosscheck', action='store_true', help='also measure against the vendor STEP (slow)')
    args = parser.parse_args()
    parts = build()
    shape = compound(parts)
    if not shape.isValid():
        raise ValueError('INVALID_DETAIL')
    args.output.mkdir(parents=True, exist_ok=True)
    path = args.output / 'PX-V40-DEF-PI5.display.brep'
    shape.exportBrep(str(path))
    display_sha = sha256_file(path)
    rel = relation(parts, args.chain)
    record = {'schema': SCHEMA, 'definitionId': 'PX-V40-DEF-PI5', 'kind': 'display-detail', 'track': 'presentation-only',
              'source': 'Raspberry Pi 5 mechanical drawing (Raspberry Pi Ltd), drawing SHA-256 5dd680d6c1f5e7aa9c7b020695e315d04aac862df82ff01d4e9041cd0668d7f2, read at 1:1',
              'assemblyEnvelope': 'M7 instructional board revision 2 (PX-V40-DEF-PI5-INSTRUCTIONAL-02); assembly checks use it, not this model',
              'artifact': path.name, 'artifactSha256': display_sha,
              'solids': [{'index': i, 'name': n, 'materialId': m} for i, (n, m) in enumerate((n, m) for n, m, s in parts for _ in s.Solids())],  # one row per solid, compound order
              'relation': rel,
              'overlaps': {'chain': args.chain.name, 'method': 'boolean common of the placed detail board with every other placed part in each closure that places the board',
                           'displayArtifactSha256': display_sha, 'instructionalArtifactSha256': rel['instructionalArtifact']['sha256'],
                           **overlaps(args.root, args.chain, shape)}}
    if args.vendor_crosscheck:
        record['vendorCrossCheck'] = vendor_crosscheck(args.root, parts)
    (args.output / 'PX-V40-DEF-PI5.display.json').write_text(json.dumps(record, indent=1) + '\n')
    print(json.dumps({'solids': len(parts), 'sha256': record['artifactSha256']}))


if __name__ == '__main__':
    main()
