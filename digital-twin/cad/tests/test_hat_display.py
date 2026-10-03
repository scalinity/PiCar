"""Robot HAT V4 display model: reproducible bytes, the adopted frame and bores, individual pins, the GPIO relation.

Source mode: PYTHONPATH=digital-twin/cad <frozen-env>/bin/python -m pytest digital-twin/cad/tests/test_hat_display.py
"""
import hashlib
import json
import math
from pathlib import Path

import cadquery as cq
import numpy as np
import pytest
from OCP.BRepMesh import BRepMesh_IncrementalMesh

from twin_cad.fidelity import hat, hat_board, hat_review, pi5

ROOT = Path(__file__).resolve().parents[3]
DISPLAY = ROOT / 'digital-twin/validation/expected/m7/fidelity/display'
RECORD = json.loads((DISPLAY / 'PX-V40-DEF-ROBOT-HAT.display.json').read_text())
REVIEW = json.loads((ROOT / hat.REVIEW).read_text())
MATERIALS = json.loads((ROOT / 'digital-twin/presentation/materials/studio-materials.json').read_text())['materials']
CHAIN = ROOT / 'digital-twin/generated/studio/chain' / RECORD['overlaps']['chain']


@pytest.fixture(scope='module')
def shape():
    return cq.Shape.importBrep(str(DISPLAY / RECORD['artifact']))


def solid(shape, material):
    rows = [r['index'] for r in RECORD['solids'] if r['materialId'] == material]
    assert len(rows) >= 1
    return [shape.Solids()[i] for i in rows]


def test_display_rebuilds_to_its_recorded_bytes(tmp_path):
    first, second = tmp_path / 'a.brep', tmp_path / 'b.brep'
    pi5.compound(hat.build(ROOT, CHAIN)[1]).exportBrep(str(first))
    pi5.compound(hat.build(ROOT, CHAIN)[1]).exportBrep(str(second))
    assert first.read_bytes() == second.read_bytes()
    assert hashlib.sha256(first.read_bytes()).hexdigest() == RECORD['artifactSha256'] == pi5.sha256_file(DISPLAY / RECORD['artifact'])


def test_record_rows_match_the_artifact_and_every_material_exists(shape):
    assert shape.isValid()
    assert len(shape.Solids()) == len(RECORD['solids'])
    assert [r['index'] for r in RECORD['solids']] == list(range(len(RECORD['solids'])))
    assert all(r['materialId'] in MATERIALS for r in RECORD['solids'])
    assert all(s.isValid() for s in shape.Solids())


def test_board_keeps_the_adopted_frame_plane_and_bores(shape):
    core, top, bottom = shape.Solids()[:3]
    adopted = hat.adopted_bores(CHAIN)
    assert pi5.hole_centres(core, 1.4) == adopted == sorted(map(tuple, REVIEW['mountingHoles']['centres']))
    assert RECORD['relation']['mountingHoles']['maxCentreDeviationMm'] == 0
    board = cq.Compound.makeCompound([core, top, bottom]).BoundingBox()
    assert (board.xmin, board.ymin, board.zmin, board.xmax, board.ymax, board.zmax) == pytest.approx((0, 0, 0, 85, 56, 1.6), abs=1e-6)
    assert top.BoundingBox().zmax == pytest.approx(hat_board.TOP, abs=1e-9)


def test_header_pins_are_individual_solids_of_the_photographed_banks(shape):
    (gold,) = solid(shape, 'contact-gold')
    section = gold.intersect(cq.Workplane('XY').box(200, 200, 0.01).translate((42.5, 28, 8.0)).val())
    faces = [f for f in section.Faces() if abs(f.normalAt().z) > 0.99 and f.Center().z > 8.0]
    servo = sum(len(b['rows']) * 3 for b in REVIEW['servo']['banks'])
    headers = sum(len(REVIEW['headers'][k]['labels']) for k in ('spi', 'i2c', 'uart'))
    assert servo == 60 and headers == 15
    assert len(faces) == servo + headers
    size = REVIEW['pins']['size']
    assert all(f.Area() == pytest.approx(size * size, rel=1e-6) for f in faces)
    centres = sorted((round(f.Center().x, 2), round(f.Center().y, 2)) for f in faces)
    assert min(math.dist(a, b) for i, a in enumerate(centres) for b in centres[i + 1:]) == pytest.approx(2.54, abs=0.02)


def test_pins_stay_separate_after_studio_tessellation(shape):
    (gold,) = solid(shape, 'contact-gold')
    BRepMesh_IncrementalMesh(gold.wrapped, hat_review.LINEAR, False, hat_review.ANGULAR, True)
    verts = np.array(hat_review.mesh(gold)[0])
    above = verts[verts[:, 2] > 4.2]  # above every housing
    axes = np.array(sorted({(round(x, 2), round(y, 2)) for x, y in above[:, :2].round(1).tolist()}))
    S, H = REVIEW['servo'], REVIEW['headers']
    expected = [(x, S['y0'] + 2.54 * j) for b in S['banks'] for x in S['columnsX'][b['side']] for j in b['rows']]
    expected += [(H[k]['x0'] + 2.54 * i, H[k]['y']) for k in ('spi', 'i2c', 'uart') for i in range(len(H[k]['labels']))]
    d = np.min(np.hypot(above[:, None, 0] - np.array(expected)[None, :, 0], above[:, None, 1] - np.array(expected)[None, :, 1]), axis=1)
    assert d.max() <= REVIEW['pins']['size'] / math.sqrt(2) + 1e-3  # every mesh vertex belongs to one pin's own column
    assert len(axes) > 0


def test_gpio_pads_and_socket_sit_on_the_pi_header_axis():
    rel = RECORD['relation']['gpio']
    assert rel['padCentreMm'] == pytest.approx([32.5, 52.5], abs=1e-3)
    x0, y0, z0, x1, y1, z1 = rel['socketBoxMm']
    assert ((x0 + x1) / 2, (y0 + y1) / 2) == pytest.approx((32.5, 52.5), abs=1e-3)
    pi_base, _ = pi5.header(32.5, 52.5, 20, 2, 2.5, pi5.TOP + 8.5)
    pb = pi_base.BoundingBox()
    assert ((pb.xmin + pb.xmax) / 2, (pb.ymin + pb.ymax) / 2) == pytest.approx((32.5, 52.5), abs=1e-6)


def test_every_dimension_names_its_basis_and_none_claims_a_caliper():
    for key in ('pcb', 'mountingHoles', 'gpio', 'pins', 'servo', 'headers', 'ics', 'inductors', 'speakerBody', 'leads', 'leds', 'passives', 'silkscreen'):
        assert 'basis' in REVIEW[key], key
    for unit in REVIEW['connectors'].values():
        assert 'basis' in unit
    assert REVIEW['measuredByCaliper'] == []
    assert REVIEW['boardIdentity']['revisionMarking'] == 'Robot Hat V4'
    assert REVIEW['engineeringAdmission'] is False and REVIEW['runtimeAdmission'] is False and REVIEW['privateSourcePixelsCopied'] is False


def test_display_draw_calls_stay_bounded(shape):
    assert len(shape.Solids()) <= 40  # one mesh per solid: finishes are joined through the board's inner plates
