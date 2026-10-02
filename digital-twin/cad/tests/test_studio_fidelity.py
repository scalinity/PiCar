"""Studio fidelity revisions: reproducible bytes, unmoved datums, symmetric arc-true outlines, registered display detail.

Source mode: PYTHONPATH=digital-twin/cad <frozen-env>/bin/python -m pytest digital-twin/cad/tests/test_studio_fidelity.py
"""
import hashlib
import json
import re
from pathlib import Path

import cadquery as cq
import numpy as np
import pytest

from twin_cad.assemblies.instructional import revisions
from twin_cad.assemblies.instructional.verify import plate_a_artifact, purchased_artifact, shape_features
from twin_cad.components.plates.instructional.generate import make_candidate
from twin_cad.fidelity import pi5

ROOT = Path(__file__).resolve().parents[3]
STORE = ROOT / 'digital-twin/validation/expected/m7/instructional-revisions'
M6_PLATE_A_SHA = 'dfd87e50cc1ac5c87358a7c2495be00860c36e30d9534e54da2508804ca14137'
REVIEW = json.loads((ROOT / 'digital-twin/validation/expected/m7/fidelity/plate-a-outline-01.review.json').read_text())
DISPLAY = json.loads((ROOT / 'digital-twin/validation/expected/m7/fidelity/display/PX-V40-DEF-PI5.display.json').read_text())


def brep_bytes(shape, tmp_path, name):
    path = tmp_path / name
    shape.exportBrep(str(path))
    return path.read_bytes()


def test_generator_still_reproduces_the_accepted_m6_plate_a(tmp_path):
    params = json.loads((ROOT / 'digital-twin/validation/expected/plates/instructional/all-parameters.json').read_text())
    m6 = next(d for d in params['definitions'] if d['definitionId'] == 'PX-V40-DEF-PLATE-A')
    assert hashlib.sha256(brep_bytes(make_candidate(m6), tmp_path, 'm6.brep')).hexdigest() == M6_PLATE_A_SHA


@pytest.mark.parametrize('definition_id', [s['definitionId'] for s in revisions.specs(ROOT)])
def test_every_revision_rebuilds_to_its_recorded_bytes(tmp_path, definition_id):
    record = next(r for r in json.loads((STORE / 'revision-artifacts.json').read_text())['records'] if r['definitionId'] == definition_id)
    first = brep_bytes(revisions.build(ROOT, definition_id), tmp_path, 'a.brep')
    second = brep_bytes(revisions.build(ROOT, definition_id), tmp_path, 'b.brep')
    assert first == second, 'revision export must be byte-stable across rebuilds'
    assert hashlib.sha256(first).hexdigest() == record['newArtifactSha256'] == hashlib.sha256((STORE / record['newArtifact']).read_bytes()).hexdigest()


def test_the_chain_resolves_plate_a_to_the_fidelity_revision():
    assert plate_a_artifact(ROOT) == 'digital-twin/validation/expected/m7/instructional-revisions/PX-V40-DEF-PLATE-A.brep'


def test_plate_a_revision_keeps_every_hole_slot_and_cutout():
    old = cq.Shape.importBrep(str(ROOT / 'docs/implementation/evidence/m6/amendment-shapes-04/candidate-artifacts/PX-V40-DEF-PLATE-A.brep'))
    new = cq.Shape.importBrep(str(purchased_artifact(ROOT, 'PX-V40-DEF-PLATE-A')))
    arc_radii = [a['radiusMm'] for a in REVIEW['revision']['design']['arcs']]
    key = lambda f: (round(f['radius'], 4), *np.round(f['origin'][:2], 4))
    old_features = sorted(key(f) for f in shape_features(old) if f['radius'] < 5)
    new_features = sorted(key(f) for f in shape_features(new) if f['radius'] < 5 and not any(abs(f['radius'] - r) < 1e-6 for r in arc_radii))
    assert old_features == new_features


def test_plate_a_arms_are_mirror_images_with_true_round_ends():
    checks = REVIEW['revision']['checks']
    assert checks['outlineSegments']['arcs'] >= 6
    assert checks['freeEdgeMirrorDeviationMm']['mean'] < 0.1
    assert checks['photoEdgeDistanceMm']['revision']['mean'] < checks['photoEdgeDistanceMm']['m6Trace']['mean'] / 2
    ends = [a for a in REVIEW['revision']['design']['arcs'] if 'tangencyErrorMm' in a]
    assert len(ends) == 2 and max(max(a['tangencyErrorMm']) for a in ends) < 1e-9
    # The two end circles mirror each other about the measured plate axis.
    c, angle = REVIEW['mirrorAxis']['yInterceptMm'], np.radians(REVIEW['mirrorAxis']['angleDeg'])
    rot = np.array([[np.cos(angle), np.sin(angle)], [-np.sin(angle), np.cos(angle)]])
    a, b = [rot @ (np.array(e['centreMm']) - [0, c]) for e in ends]
    assert np.allclose(a, b * [1, -1], atol=1e-9) and ends[0]['radiusMm'] == ends[1]['radiusMm']


def test_no_m7_module_reads_a_part_by_hard_coded_path():
    sources = (ROOT / 'digital-twin/cad/twin_cad/assemblies/instructional').glob('*.py')
    offenders = [p.name for p in sources if re.search(r"M5_ARTIFACTS \+ definition|root / PLATE_A\b|candidate-artifacts/PX-V40-DEF-PLATE-A.brep'\)?$", p.read_text(), re.M)
                 and p.name not in ('verify.py',)]
    assert offenders == []


def test_pi5_display_detail_is_registered_deterministic_and_checked(tmp_path):
    shape = pi5.compound(pi5.build())
    data = brep_bytes(shape, tmp_path, 'pi5.brep')
    assert data == brep_bytes(pi5.compound(pi5.build()), tmp_path, 'pi5b.brep')
    assert hashlib.sha256(data).hexdigest() == DISPLAY['artifactSha256']
    assert len(DISPLAY['solids']) == len(shape.Solids())
    holes = sorted((round(f['origin'][0], 6), round(f['origin'][1], 6)) for f in shape_features(pi5.build()[0][2]) if abs(f['radius'] - 1.35) < 1e-6)
    assert holes == sorted(pi5.HOLES)
    offsets = [np.hypot(*p['centreOffsetXYMm']) for p in DISPLAY['vendorCrossCheck']['parts']
               if p.get('footprintIoU') and not re.search('tongue|pins|contacts|HDMI', p['part'])]
    assert len(offsets) >= 20 and max(offsets) < 0.3
    assert any(o['instanceId'] == 'PX-V40-INS-USB-MICROPHONE-001' for o in DISPLAY['overlaps']['positive']), 'the known microphone finding stays recorded'
