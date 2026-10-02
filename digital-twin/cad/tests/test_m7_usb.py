"""Pi5 S02 microphone plug frame: authored from the V40 detail, re-measured from the adopted board bytes."""
import copy
import json
import os
from pathlib import Path
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import usb, usb_verify


ROOT = Path(os.environ['PICAR_M7_ROOT'])
ARTIFACTS = Path(os.environ['PICAR_M7_REMEDIATION'])
BOARDS = ARTIFACTS.parent / 'anchor/boards'


@pytest.fixture(scope='module')
def record():
    return usb.build(ROOT, 'rpi5', boards=BOARDS, artifacts=ARTIFACTS)


def test_independent_oracle_is_installed_and_does_not_import_generator():
    assert 'site-packages' in str(Path(usb_verify.__file__).resolve())
    assert 'site-packages' in str(Path(usb.__file__).resolve())
    text = Path(usb_verify.__file__).read_text()
    assert 'from .usb import' not in text and 'import usb\n' not in text


def test_only_the_pi5_has_this_microphone_frame():
    for variant in ['rpi-zero-2-w', 'rpi4', 'pico']:
        with pytest.raises(Invalid):
            usb.build(ROOT, variant, boards=BOARDS, artifacts=ARTIFACTS)


def test_plug_is_seated_flush_in_the_upper_opening_of_the_gpio_side_usb_stack(record):
    result = usb_verify.verify(ROOT, record, boards=BOARDS, artifacts=ARTIFACTS)
    assert result['status'] == 'PASS' and result['physicalFit'] == 'NOT_CLAIMED' and result['engineeringAdmission'] is False
    assert result['insertionAxisWorld'] == [1.0, 0.0, 0.0]
    assert abs(result['plugDepthMm'] - 10.0) < 1e-6 and abs(result['bodyMouthGapMm']) < 1e-6
    assert result['openingCenterResidualMm'] < 1e-6
    assert abs(result['plugBlockOverlapMm3'] - 504.0) < 1e-3
    assert result['selectedBlockBoardLocalBoundsMm'] == [68.0, 39.2, 1.6, 85.0, 53.2, 16.6]
    assert result['q10'] == 'UNRESOLVED' and result['choiceKind'] == 'PRESENTATION_CHOICE_AMONG_EQUIVALENT_OPENINGS'


def test_pose_is_a_proper_identity_rotation_with_positive_unit_scale(record):
    assert record['pose']['rotation'] == [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    assert record['scale'] == [1, 1, 1]
    assert record['pose']['role'] == 'microphone'


def mutate(record, mutation):
    r = copy.deepcopy(record)
    pose = r['pose']
    if mutation == 'ethernet-block': pose['translationMm'][1] += 35.28
    elif mutation == 'other-usb-block': pose['translationMm'][1] += 17.92
    elif mutation == 'lower-opening': pose['translationMm'][2] -= 7.5
    elif mutation == 'shifted-sideways': pose['translationMm'][1] += 3.0
    elif mutation == 'flipped-plug':
        pose['rotation'] = [[-1, 0, 0], [0, -1, 0], [0, 0, 1]]
    elif mutation == 'rolled-quarter': pose['rotation'] = [[1, 0, 0], [0, 0, -1], [0, 1, 0]]
    elif mutation == 'upside-down': pose['rotation'] = [[1, 0, 0], [0, -1, 0], [0, 0, -1]]
    elif mutation == 'too-deep': pose['translationMm'][0] += 5.0
    elif mutation == 'too-shallow': pose['translationMm'][0] -= 3.0
    elif mutation == 'reflection': pose['rotation'] = [[1, 0, 0], [0, 1, 0], [0, 0, -1]]
    elif mutation == 'identity-fallback': pose['translationMm'] = [0., 0., 0.]
    elif mutation == 'engineering-promotion': r['engineeringAdmission'] = True
    elif mutation == 'q10-resolved': r['selection']['q10'] = 'RESOLVED'
    elif mutation == 'limitation-removed': r['limitations'].pop()
    elif mutation == 'binding-drift': r['inputBindings'][0]['rawSha256'] = '0' * 64
    elif mutation == 'sweep-claim': r['recipe']['installationSweep'] = 'PASS'
    return r


REASON = {'ethernet-block': 'OPENING_CENTER_RESIDUAL', 'other-usb-block': 'OPENING_CENTER_RESIDUAL', 'lower-opening': 'OPENING_CENTER_RESIDUAL',
          'shifted-sideways': 'OPENING_CENTER_RESIDUAL', 'flipped-plug': 'PLUG_NOT_POINTING_INTO_PORT', 'rolled-quarter': 'PLUG_ROLL',
          'upside-down': 'PLUG_ROLL', 'too-deep': 'PLUG_NOT_SEATED_FLUSH', 'too-shallow': 'PLUG_NOT_SEATED_FLUSH',
          'reflection': 'PROPER_ROTATION', 'identity-fallback': 'OPENING_CENTER_RESIDUAL', 'engineering-promotion': 'ENGINEERING_FIREWALL',
          'q10-resolved': 'SELECTION_NOT_FROM_REVIEW', 'limitation-removed': 'LIMITATION_REMOVAL', 'binding-drift': 'INPUT_BYTES_CHANGED',
          'sweep-claim': 'UNTESTED_CLAIM'}


@pytest.mark.parametrize('mutation', sorted(REASON))
def test_corrupted_microphone_frame_is_rejected(record, mutation):
    with pytest.raises(Invalid, match=REASON[mutation]):
        usb_verify.verify(ROOT, mutate(record, mutation), boards=BOARDS, artifacts=ARTIFACTS)


def test_board_pose_drift_is_rejected(tmp_path, record):
    # The mic frame is derived from the board pose; a moved board must not leave a stale plug frame accepted.
    moved = load(BOARDS / 'rpi5-S02-board.json')
    moved['boardPose']['translationMm'][0] += 1.0
    (tmp_path / 'rpi5-S02-board.json').write_text(json.dumps(moved))
    with pytest.raises(Invalid):
        usb_verify.verify(ROOT, record, boards=tmp_path, artifacts=ARTIFACTS)
