"""S03 camera connector endpoint frames: derived from observation, re-measured from the guidance sources."""
import copy
import os
from pathlib import Path
import numpy as np
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import camera, camera_verify


ROOT = Path(os.environ['PICAR_M7_ROOT'])
SOURCE_ROOT = Path(os.environ.get('PICAR_M7_SOURCE_ROOT', ROOT))
ARTIFACTS = Path(os.environ['PICAR_M7_REMEDIATION'])
BOARDS = ARTIFACTS.parent / 'anchor/boards'
VARIANTS = ['rpi5', 'rpi-zero-2-w']


@pytest.fixture(scope='module')
def records():
    return {v: camera.build(ROOT, v, boards=BOARDS) for v in VARIANTS}


def verify(record):
    return camera_verify.verify(ROOT, record, boards=BOARDS, artifacts=ARTIFACTS, source_root=SOURCE_ROOT)


def test_independent_oracle_is_installed_and_does_not_import_generator():
    assert 'site-packages' in str(Path(camera_verify.__file__).resolve())
    assert 'site-packages' in str(Path(camera.__file__).resolve())
    text = Path(camera_verify.__file__).read_text()
    assert 'from .camera import' not in text and 'import camera\n' not in text


def test_pi4_and_unknown_variants_are_refused():
    for variant in ['rpi4', 'pico']:
        with pytest.raises(Invalid):
            camera.build(ROOT, variant, boards=BOARDS)


def test_pi5_frame_is_a_top_entry_lowering_with_contacts_toward_the_minus_x_side_of_the_slot(records):
    result = verify(records['rpi5'])
    assert result['status'] == 'PASS' and result['engineeringAdmission'] is False and result['physicalFit'] == 'NOT_CLAIMED'
    assert result['source']['leafCount'] == 22 and result['source']['contactSide'] == '-X' and result['source']['flapSide'] == '+X'
    assert abs(result['source']['slotPlaneXMm'] - 48.455) < 0.001 and abs(result['source']['contactRowCenterYMm'] - 8.5) < 0.02
    frame = records['rpi5']['endpointFrame']
    assert frame['boardLocal']['insertionAxis'] == [0, 0, -1] and frame['boardLocal']['contactNormal'] == [-1, 0, 0]
    # Board is Rz180: installed contact normal flips to +X, insertion stays straight down.
    assert frame['installed']['insertionAxis'] == [0, 0, -1] and frame['installed']['contactNormal'] == [1, 0, 0]
    assert result['residualMm'] < 1e-6


def test_zero_frame_is_a_horizontal_side_entry_with_contacts_down(records):
    result = verify(records['rpi-zero-2-w'])
    assert result['status'] == 'PASS' and result['source']['footprintBoundsMm'] == [61.56, 6.9, 65.0, 23.1]
    frame = records['rpi-zero-2-w']['endpointFrame']
    assert frame['boardLocal']['insertionAxis'] == [-1, 0, 0] and frame['boardLocal']['contactNormal'] == [0, 0, -1]
    assert frame['installed']['insertionAxis'] == [-1, 0, 0] and frame['installed']['contactNormal'] == [0, 0, -1]
    assert result['residualMm'] < 1e-6


def test_the_two_variants_never_share_a_frame(records):
    assert records['rpi5']['endpointFrame'] != records['rpi-zero-2-w']['endpointFrame']
    assert records['rpi5']['endpointFrame']['boardLocal']['insertionAxis'] != records['rpi-zero-2-w']['endpointFrame']['boardLocal']['insertionAxis']


def test_frames_are_right_handed_orthonormal_and_staged_outside_every_solid(records):
    for variant, record in records.items():
        result = verify(record)
        assert result['handedness'] == 1 and result['orthonormalResidual'] < 1e-12
        assert result['stagedOriginClearOfSolids'] is True


def flip(frame, *names):
    for name in names:
        frame[name] = [-c + 0.0 for c in frame[name]]


def mutate(record, mutation):
    r = copy.deepcopy(record)
    local, installed = r['endpointFrame']['boardLocal'], r['endpointFrame']['installed']
    rotation = np.array(load(BOARDS / (record['variantId'] + '-S02-board.json'))['boardPose']['rotation'])

    def move(delta):
        # A coherent corruption: the installed frame follows the board pose, so only the measured-connector check can notice.
        local['originMm'] = [a + b for a, b in zip(local['originMm'], delta)]
        installed['originMm'] = [a + float(b) for a, b in zip(installed['originMm'], rotation @ np.array(delta))]
    if mutation == 'other-connector': move([6.2, 0, 0])
    elif mutation == 'contact-side-flipped':
        # Coherent: the width axis follows (w = insertion x contact), so the frame stays right-handed.
        flip(local, 'contactNormal', 'widthAxis'); flip(installed, 'contactNormal', 'widthAxis')
    elif mutation == 'insertion-flipped':
        flip(local, 'insertionAxis', 'widthAxis'); flip(installed, 'insertionAxis', 'widthAxis')
    elif mutation == 'left-handed':
        flip(local, 'widthAxis'); flip(installed, 'widthAxis')
    elif mutation == 'origin-off-slot': move([0, 2.0, 0])
    elif mutation == 'installed-not-from-board-pose': installed['originMm'][2] += 1.0
    elif mutation == 'wrong-cable': r['cableInstanceId'] = 'PX-V40-INS-RIBBON-FFC-001'
    elif mutation == 'engineering-promotion': r['engineeringAdmission'] = True
    elif mutation == 'limitation-removed': r['limitations'].pop()
    elif mutation == 'binding-drift': r['inputBindings'][0]['rawSha256'] = '0' * 64
    elif mutation == 'staged-inside-board':
        r['approach']['stagedOriginMm'] = list(installed['originMm'])
    elif mutation == 'sweep-claim': r['claims']['installationSweep'] = 'PASS'
    return r


REASON = {'other-connector': 'FRAME_NOT_AT_MEASURED_CONNECTOR', 'contact-side-flipped': 'CONTACT_SIDE', 'insertion-flipped': 'INSERTION_AXIS',
          'left-handed': 'FRAME_NOT_RIGHT_HANDED', 'origin-off-slot': 'FRAME_NOT_AT_MEASURED_CONNECTOR',
          'installed-not-from-board-pose': 'INSTALLED_FRAME_NOT_BOARD_POSE_OF_LOCAL', 'wrong-cable': 'EXACT_SEMANTIC_OWNERSHIP',
          'engineering-promotion': 'ENGINEERING_FIREWALL', 'limitation-removed': 'LIMITATION_REMOVAL', 'binding-drift': 'INPUT_BYTES_CHANGED',
          'staged-inside-board': 'STAGED_ORIGIN', 'sweep-claim': 'UNTESTED_CLAIM'}


@pytest.mark.parametrize('mutation', sorted(REASON))
@pytest.mark.parametrize('variant', VARIANTS)
def test_corrupted_frame_is_rejected(records, variant, mutation):
    with pytest.raises(Invalid, match=REASON[mutation]):
        verify(mutate(records[variant], mutation))


def test_pi5_record_carrying_the_zero_frame_is_rejected(records):
    r = copy.deepcopy(records['rpi5'])
    r['endpointFrame'] = copy.deepcopy(records['rpi-zero-2-w']['endpointFrame'])
    with pytest.raises(Invalid, match='INSTALLED_FRAME_NOT_BOARD_POSE_OF_LOCAL|FRAME_NOT_AT_MEASURED_CONNECTOR|INSERTION_AXIS|CONTACT_SIDE'):
        verify(r)


def test_missing_source_vault_blocks_instead_of_passing(records, tmp_path):
    with pytest.raises(Invalid, match='SOURCE_REQUIRED'):
        camera_verify.verify(ROOT, records['rpi5'], boards=BOARDS, artifacts=ARTIFACTS, source_root=tmp_path)
