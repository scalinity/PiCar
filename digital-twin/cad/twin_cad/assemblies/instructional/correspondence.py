"""Independent primary-source/topology correspondence; never imports remediation.

Vendor geometry is inspected locally, never copied into derived instructional CAD.
"""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from OCP.BRepCheck import BRepCheck_Analyzer
from ...contracts import load
from ...vendor.pi5_candidate import source_check
from .verify import require, digest, rigid, shape_features, verify


PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
ARTIFACT = 'PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep'
OLD = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-PI5.brep'


def bounds(solid):
    b = solid.BoundingBox()
    return [b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax]


def actual_features(shape, variant):
    solids = shape.Solids()
    require(BRepCheck_Analyzer(shape.wrapped).IsValid() and all(s.Volume() > 0 for s in solids), 'VALID_POSITIVE_VOLUME_BOARD')
    length, width = (85, 56) if variant == 'rpi5' else (65, 30)
    pcbs = [s for s in solids if np.max(abs(np.array(bounds(s)) - [0, 0, 0, length, width, 1.6])) < 1e-6]
    require(len(pcbs) == 1, 'ACTUAL_PCB_OUTLINE_AND_COMPONENT_SIDE')
    headers = [s for s in solids if bounds(s)[4] > width * .8 and bounds(s)[3]-bounds(s)[0] > length*.5 and bounds(s)[2] > 1]
    require(len(headers) == 1 and bounds(headers[0])[2] >= 1.6-1e-6, 'ACTUAL_GPIO_TOP_HIGH_Y')
    holes = shape_features(pcbs[0])
    holes = sorted({(round(c['origin'][0], 8), round(c['origin'][1], 8)) for c in holes
                    if abs(c['radius']-1.4) < 1e-6 and abs(c['axis'][2]) > .999999})
    require(len(holes) == 4, 'ACTUAL_FOUR_MOUNTING_BORES')
    return {'pcb': pcbs[0], 'header': headers[0], 'holes': holes, 'solids': solids,
            'componentNormal': [0, 0, 1], 'gpioSide': [0, 1, 0]}


def primary_step(root, source_root):
    records = load(root / 'digital-twin/validation/expected/m5/candidate-sources.json')['records']
    members = load(root / 'docs/implementation/evidence/m5/pi5-zip-members.json')
    step = next(m for m in members if m['path'].endswith('.step'))
    license_file = next(m for m in members if m['member'] == 'LICENSE.txt')
    inputs = []
    for r in records:
        if r['id'] in ['PX-M5-EV-PI5-DRAWING', 'PX-M5-EV-PI5-STEP-ZIP', 'PX-M5-EV-ZERO2W-DRAWING']:
            b = digest(source_root, r['artifact']['path'])
            require(b['rawSha256'] == r['artifact']['sha256'] and b['bytes'] == r['artifact']['byteLength'], 'EXACT_PRIMARY_SOURCE_BYTES')
            inputs.append(b)
    for m in members:
        b = digest(source_root, m['path'])
        require(b['rawSha256'] == m['rawSha256'] and b['bytes'] == m['bytes'], 'EXACT_STEP_MEMBER_BYTES')
        inputs.append(b)
    source_check(source_root / step['path'], source_root / license_file['path'])
    shape = cq.importers.importStep(str(source_root / step['path'])).val()
    solids = shape.Solids()
    require(len(solids) == 2689 and all(BRepCheck_Analyzer(s.wrapped).IsValid() and s.Volume() > 0 for s in solids), 'ACTUAL_VENDOR_TOPOLOGY')
    # Select from actual extents and surfaces, not STEP names or generator flags.
    pcb = [s for s in solids if np.max(abs(np.array(bounds(s)) - [0, 0, .03, 85, 56, 1.306])) < 1e-5]
    header = [s for s in solids if bounds(s)[3]-bounds(s)[0] > 45 and 4 < bounds(s)[4]-bounds(s)[1] < 6 and bounds(s)[1] > 49 and bounds(s)[2] > 1]
    usb = [s for s in solids if bounds(s)[0] > 70 and bounds(s)[3] > 87 and bounds(s)[5] > 17 and s.Volume() > 1000]
    ethernet = [s for s in solids if bounds(s)[0] > 66 and bounds(s)[3] > 87 and 2 < bounds(s)[1] < 3 and 14 < bounds(s)[5] < 15 and s.Volume() > 3000]
    require(len(pcb) == 1 and len(header) == 1 and len(usb) == 2 and len(ethernet) == 1, 'UNIQUE_PRIMARY_FEATURE_CLASSIFICATION')
    holes = sorted({(round(c['origin'][0], 8), round(c['origin'][1], 8)) for c in shape_features(pcb[0]) if abs(c['radius']-1.35) < 1e-6})
    require(holes == [(3.5, 3.5), (3.5, 52.5), (61.5, 3.5), (61.5, 52.5)], 'OFFICIAL_MOUNT_PATTERN')
    require(bounds(ethernet[0])[4] < min(bounds(s)[1] for s in usb), 'ETHERNET_LOW_Y_USB_HIGH_Y')
    return {'status': 'PASS', 'primaryBindings': inputs, 'actualImportedSolidCount': len(solids),
            'validPositiveVolumeSolidCount': len(solids), 'pcbBoundsMm': bounds(pcb[0]),
            'headerBoundsMm': bounds(header[0]), 'usbShellBoundsMm': sorted(bounds(s) for s in usb),
            'ethernetBodyBoundsMm': bounds(ethernet[0]), 'mountingCentersMm': holes,
            'signedDirections': {'bank': [1, 0, 0], 'gpio': [0, 1, 0], 'components': [0, 0, 1]},
            'coordinateScope': 'Vendor right-handed component-side coordinates; no engineering datum adopted',
            'limits': 'Guidance-only manufacturer source, topology features classified for relative side/ordering only; actual supplied revision remains Q-10',
            'sourcePixelsOrVendorCADCopied': False, 'engineeringAdmission': False}


def verify_revision(root, artifacts):
    receipt = load(artifacts / 'pi5-revision-candidate.json')
    require(set(receipt) == {'id', 'instructionalArtifactRevision', 'definitionId', 'definitionRevision', 'variantId', 'track', 'instructionalStatus', 'engineeringStatus', 'engineeringAdmission', 'runtimeAdmission', 'reason', 'oldArtifact', 'oldReceipt', 'artifactRelativePath', 'newArtifact', 'changedBankMembers', 'unchanged', 'inputBindings', 'scale', 'rightHandedPartLocalFrame', 'blockerIds', 'sourceLimitations', 'mustNotDrive', 'revisionLimits'}, 'CLOSED_REVISION_RECORD')
    require(receipt['instructionalStatus'] == 'CANDIDATE_REQUIRES_INDEPENDENT_ADOPTION' and receipt['track'] == 'instructional-only' and receipt['variantId'] == 'rpi5', 'CANDIDATE_NOT_SELF_ADMITTED')
    original_receipt_path = 'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-PI5.json'
    historical = load(root / original_receipt_path)
    require(receipt['oldArtifact'] == digest(root, OLD) and receipt['oldReceipt'] == digest(root, original_receipt_path), 'HISTORICAL_BINDINGS')
    require(receipt['newArtifact'] == digest(artifacts, ARTIFACT), 'NEW_ARTIFACT_BINDING')
    for b in receipt['inputBindings']:
        require(b == digest(root, b['path']), 'REVISION_INPUT_DRIFT')
    require(sorted(b['path'] for b in receipt['inputBindings']) == sorted([PRESENTATION + '/pi5-board-direction-review-02.json', 'digital-twin/cad/twin_cad/assemblies/instructional/remediate.py']), 'REVISION_EXACT_INPUTS')
    require(receipt['definitionId'] == 'PX-V40-DEF-PI5' and receipt['definitionRevision'] == 1 and receipt['instructionalArtifactRevision'] == 2, 'IDENTITY_PRESERVATION')
    require(receipt['engineeringStatus'] == 'BLOCKED' and receipt['engineeringAdmission'] is False and receipt['runtimeAdmission'] is False and receipt['scale'] == [1, 1, 1], 'REVISION_FIREWALL')
    for field in ['sourceLimitations', 'blockerIds', 'mustNotDrive']:
        require(receipt[field] == historical[field], 'HISTORICAL_LIMIT_REMOVAL')
    old = cq.Shape.importBrep(str(root / OLD))
    new = cq.Shape.importBrep(str(artifacts / ARTIFACT))
    a, b = actual_features(old, 'rpi5'), actual_features(new, 'rpi5')
    require(len(b['solids']) == 8 and b['holes'] == a['holes'] and abs(old.Volume()-new.Volume()) < 1e-7, 'EXACT_TOPOLOGY_COUNTS_VOLUME_AND_HOLES')
    unchanged = []
    for s in a['solids']:
        box = bounds(s)
        if box[0] < 67:
            matches = [n for n in b['solids'] if np.max(abs(np.array(bounds(n))-box)) < 1e-7]
            require(len(matches) == 1 and s.cut(matches[0]).Volume()+matches[0].cut(s).Volume() < 1e-7, 'UNCHANGED_PCB_HEADER_AND_OTHER_CONNECTORS')
            unchanged.append(box)
    require(len(unchanged) == 5, 'UNCHANGED_FIVE_SOLIDS')
    bank = [s for s in b['solids'] if bounds(s)[0] > 67 and bounds(s)[5] > 14]
    ethernet = [s for s in bank if bounds(s)[5] < 16]
    usb = [s for s in bank if bounds(s)[5] > 16]
    require(len(ethernet) == 1 and len(usb) == 2 and bounds(ethernet[0])[4] < min(bounds(s)[1] for s in usb), 'CORRECT_PI5_BANK_ROLE_ORDER')
    require(abs(bounds(ethernet[0])[1]-2.8) < 1e-6, 'ETHERNET_AT_SOURCE_SUPPORTED_LOW_Y')
    return {'status': 'PASS', 'scope': 'Pi5 additive instructional revision only; original fifty receipts and strict gate unchanged',
            'oldArtifact': digest(root, OLD), 'newArtifact': digest(artifacts, ARTIFACT),
            'oldReceipt': digest(root, original_receipt_path), 'candidateReceipt': digest(artifacts, 'pi5-revision-candidate.json'),
            'solidCount': 8, 'allValidPositiveVolume': True, 'volumeMm3': new.Volume(),
            'unchangedSolidBoundsMm': unchanged, 'mountingCentersMm': b['holes'],
            'newEthernetBoundsMm': bounds(ethernet[0]), 'newUSBPairBoundsMm': sorted(bounds(s) for s in usb),
            'gpioBoundsMm': bounds(b['header']), 'engineeringAdmission': False, 'strictGComponent': 'BLOCKED'}


def verify_board(root, solutions, artifacts, candidate):
    require(set(candidate) == {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'graphHash', 'modelHash', 'operationIds', 'connectionIds', 'before', 'after', 'boardPose', 'scale', 'inputBindings', 'artifactBinding', 'remainingDOF', 'completeAssemblyOutput', 'engineeringAdmission', 'runtimeAdmission', 'approximationFlags', 'recipe', 'claims', 'accessoryStatus', 'headerStatus', 'engineeringBlockerIds'}, 'CLOSED_BOARD_RECORD')
    variant = candidate['variantId']
    require(variant in ['rpi5', 'rpi-zero-2-w'], 'EXACT_ACTIVE_BOARD')
    review_path = PRESENTATION + '/step02-source-review-02.json'
    review = load(root / review_path)
    branch = review['variants'][variant]
    for binding in candidate['inputBindings']:
        source = solutions if binding['path'].endswith('-S01.json') else root
        require(binding == digest(source, binding['path']), 'BOARD_INPUT_DRIFT')
    require(sorted(b['path'] for b in candidate['inputBindings']) == sorted([review_path, f'digital-twin/validation/m2/{variant}/compiled-graph.json', variant + '-S01.json', 'digital-twin/cad/twin_cad/assemblies/instructional/remediate.py', 'digital-twin/cad/twin_cad/assemblies/instructional/correspondence.py']), 'BOARD_EXACT_INPUTS')
    require(candidate['track'] == 'instructional-only' and candidate['completeAssemblyOutput'] is False and candidate['engineeringAdmission'] is False and candidate['runtimeAdmission'] is False, 'PARTIAL_BOARD_FIREWALL')
    require(candidate['scale'] == [1, 1, 1] and candidate['remainingDOF'] == [], 'SCALE_AND_DOF')
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    step = graph['steps'][1]
    require(candidate['stepId'] == step['id'] and candidate['printedNumber'] == 2 and candidate['revision'] == 2, 'BOARD_STEP_IDENTITY')
    require(candidate['operationIds'] == step['operationIds'] and candidate['graphHash'] == graph['graphHash'] and candidate['modelHash'] == graph['modelHash'], 'EXACT_STEP_GRAPH')
    require(candidate['connectionIds'] == [c['id'] for c in graph['mechanicalConnections'] if c['activationOperationId'] in step['operationIds']], 'CONNECTION_PRESERVATION')
    s01 = load(solutions / (variant + '-S01.json'))
    verify(root, s01)
    require(candidate['before'] == s01['after'], 'BEFORE_DRIFT')
    expected_ids = sorted([p['instanceId'] for p in s01['after']] + step['introducedInstanceIds'])
    require(sorted(p['instanceId'] for p in candidate['after']) == expected_ids, 'MISSING_DUPLICATE_OR_INVENTED_INSTANCE')
    board_poses = [p for p in candidate['after'] if p['instanceId'] == branch['instanceId']]
    require(len(board_poses) == 1 and board_poses[0] == candidate['boardPose'], 'WHOLE_BOARD_ONE_POSE')
    require(all(p in candidate['after'] for p in s01['after']), 'S01_POSE_DRIFT')
    for p in candidate['after']:
        if p['instanceId'] in step['introducedInstanceIds'] and p['instanceId'] != branch['instanceId']:
            require(p == {'instanceId': p['instanceId'], 'pose': None, 'status': 'BLOCKED', 'reason': 'Upper-support/USB engagement is pending independent contact and source-frame closure'}, 'UNVERIFIED_INSTANCE_POSE')
    pose = candidate['boardPose']
    require(pose['instanceId'] == branch['instanceId'], 'CORRECT_BOARD_INSTANCE')
    r, t = rigid(pose)
    path = ARTIFACT if variant == 'rpi5' else 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-ZERO2W.brep'
    where = artifacts if variant == 'rpi5' else root
    require(candidate['artifactBinding'] == digest(where, path), 'BOARD_ARTIFACT_DRIFT')
    actual = actual_features(cq.Shape.importBrep(str(where / path)), variant)
    ports_direction = [1, 0, 0] if variant == 'rpi5' else [0, -1, 0]
    if variant == 'rpi-zero-2-w':
        require(sum(bounds(s)[1] < 1e-6 and bounds(s)[2] > 1 for s in actual['solids']) == 3, 'ACTUAL_ZERO_LONG_EDGE_PORTS')
    require(np.max(abs(r @ ports_direction - branch['portsDirection'])) < 1e-10, 'SOURCE_BANK_DIRECTION')
    require(np.max(abs(r @ actual['gpioSide'] - branch['gpioRobotSide'])) < 1e-10, 'SOURCE_GPIO_SIDE')
    require(np.max(abs(r @ actual['componentNormal'] - [0, 0, 1])) < 1e-10, 'COMPONENTS_UP')
    # Direction triple fixes roll and polarity uniquely; no under-board flip.
    expected_r = np.diag([-1, -1, 1]) if variant == 'rpi5' else np.eye(3)
    require(np.max(abs(r-expected_r)) < 1e-10, 'SOURCE_POLARITY_AND_ROLL')
    require(abs(t[2]-branch['pcbBottomHeightMm']) < 1e-10, 'PCB_BEARING_HEIGHT')
    supports = {p['instanceId']: p for p in s01['after']}
    residuals, translation_targets = [], []
    board_conn = next(c for c in graph['mechanicalConnections'] if c['activationOperationId'].endswith('-BOARD') and c['activationOperationId'] in step['operationIds'])
    require([p['supportId'] for p in branch['supportPairings']] == [e['instanceId'] for e in board_conn['endpoints'][1:]], 'BOARD_SUPPORT_OWNERSHIP')
    for p in branch['supportPairings']:
        require(tuple(p['localHole']) in actual['holes'], 'ACTUAL_BOARD_BORE_NOT_INVENTED')
        target = np.array(supports[p['supportId']]['translationMm'][:2])
        point = (r @ [*p['localHole'], 0] + t)[:2]
        delta = point-target
        translation_targets.append(target-r[:2, :2] @ p['localHole'])
        residuals.append({'supportId': p['supportId'], 'localHoleMm': p['localHole'], 'worldHoleXYMm': point.tolist(), 'supportXYMm': target.tolist(), 'rawDeltaMm': delta.tolist(), 'radialResidualMm': float(np.linalg.norm(delta))})
    require(np.max(abs(t[:2]-np.mean(translation_targets, axis=0))) < 1e-10, 'NO_UNDECLARED_BOARD_TRANSLATION')
    require(max(p['radialResidualMm'] for p in residuals) < review['placementPolicy']['maximumSchematicCenterResidualMm'], 'PRESENTATION_CENTER_MATCH_BUDGET')
    require(candidate['claims']['fullStep'] == 'BLOCKED' and candidate['claims']['physicalFit'] == 'BLOCKED' and candidate['claims']['installationSweep'] == 'BLOCKED', 'PARTIAL_PROMOTION')
    require(candidate['accessoryStatus'] == branch['microphone'] and candidate['headerStatus'] == branch.get('headerReadiness', 'Owner configuration unresolved Q-10') and candidate['engineeringBlockerIds'] == step['blockerIds'], 'ACCESSORY_HEADER_AND_BLOCKERS')
    require(candidate['recipe'] == {'instanceId': branch['instanceId'], 'anchorInstances': [p['supportId'] for p in branch['supportPairings']], 'localFeature': 'actualPCB.mountingBores', 'approachAxis': [0, 0, -1], 'stagingOffsetMm': [0, 0, 30], 'stagingOnly': True, 'installationSweep': 'BLOCKED'}, 'FEATURE_RELATIVE_RECIPE')
    return {'variantId': variant, 'stepId': step['id'], 'status': 'PASS_BOARD_DIRECTION_AND_APPROXIMATE_CENTER_CORRESPONDENCE',
            'completeStep': False, 'boardInstanceId': pose['instanceId'], 'rotation': r.tolist(), 'determinant': float(np.linalg.det(r)), 'scale': [1, 1, 1],
            'translationMm': t.tolist(), 'actualGPIOBoundsMm': bounds(actual['header']), 'mountResiduals': residuals,
            'sourceSupportedGPIO': branch['gpioRobotSide'], 'sourceSupportedPorts': branch['portsDirection'], 'componentNormalWorld': (r @ actual['componentNormal']).tolist(),
            'headerIndependentlyMoved': False, 'actualHoleCount': len(actual['holes']), 'supportCount': len(residuals),
            'unsolvedInstances': [p['instanceId'] for p in candidate['after'] if p.get('status') == 'BLOCKED'],
            'artifactBinding': candidate['artifactBinding'], 'sourceReview': digest(root, review_path),
            'physicalFit': 'BLOCKED; center mismatch is not certified tolerance', 'installationSweep': 'BLOCKED',
            'contactAndPenetration': 'NOT_QUALIFIED for S02; only prior S01 pair checks qualified', 'engineeringAdmission': False}


def downstream_boundary(root):
    path = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-ROBOT-HAT.brep'
    shape = cq.Shape.importBrep(str(root / path))
    pcb = [s for s in shape.Solids() if np.max(abs(np.array(bounds(s))-[0, 0, 0, 65, 56, 1.6])) < 1e-6]
    require(len(pcb) == 1, 'ACTUAL_HAT_PCB')
    bores = shape_features(pcb[0])
    require(len(bores) == 0, 'CURRENT_HAT_MISSING_MOUNT_BORES')
    pi5 = cq.Shape.importBrep(str(root / OLD))
    camera = [bounds(s) for s in pi5.Solids() if 28 < bounds(s)[0] < 41 and 10 < bounds(s)[1] < 12 and 4 < bounds(s)[5] < 5]
    require(len(camera) == 2, 'ACTUAL_SCHEMATIC_CAMERA_GROUPS')
    return {'status': 'BLOCKED', 'blockers': [
        {'id': 'M7-S03-CAMERA-CONNECTOR-FRAMES', 'steps': [3, 11, 16], 'variants': ['rpi5', 'rpi-zero-2-w'],
         'reason': 'Accepted board proxies do not identify latch/contact/stiffener insertion frames. Pi5 has two interior schematic blocks instead of qualified named CAM/DISP endpoints. Source panel is shared Pi4 depiction with Pi5 FPC label. No qualified choice/contact-face mapping to actual Pi5 endpoint has been authored.',
         'pi5SchematicBlockBoundsMm': camera, 'remediation': 'Use locked per-variant S03 closeups and acquired official source to author/adopt only evidenced instructional endpoint frames; record exact connector choice and contact/stiffener side. Derive schematic cable connection without inventing sockets or metric cable route. Pending source correspondence is not proof of a source conflict.'},
        {'id': 'M7-S04-HAT-MATING-FEATURES', 'steps': [4], 'variants': ['rpi5', 'rpi-zero-2-w'],
         'artifactBinding': digest(root, path), 'actualPCBCylindricalHoleCount': 0,
         'reason': 'Actual accepted HAT PCB is an unpierced box; no four mounting bores or underside GPIO socket topology. Source S04 calls for four mounting screws and aligned GPIO engagement. Inventing hidden feature frames on this box would falsely claim actual-feature closure.',
         'remediation': 'Before S04, add a source-backed instructional HAT feature/representation revision with visible holes and underside GPIO correspondence, independently verify it, preserve original receipt. No engineering datum or supplied revision claim.'}],
        'geometryInspectionScope': 'Actual imported instructional proxy topology; not physical hardware or proof that no source can remedy it', 'engineeringAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--source-root', required=True, type=Path)
    parser.add_argument('--solutions', required=True, type=Path)
    parser.add_argument('--artifacts', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    require(not args.output.exists(), 'RETAIN_PRIOR_OBSERVATIONS')
    primary = primary_step(args.root, args.source_root)
    revision = verify_revision(args.root, args.artifacts)
    boards = [verify_board(args.root, args.solutions, args.artifacts, load(args.artifacts / (v + '-S02-board.json'))) for v in ['rpi5', 'rpi-zero-2-w']]
    report = {'status': 'PASS_SCOPED_REMEDIATION_OBSERVATIONS', 'rootCause': 'C. V40_SOURCE_INTERPRETATION_ERROR',
              'chiralityBlocker': 'RESOLVED', 'primarySTEP': primary, 'pi5Revision': revision, 'boardObservations': boards,
              'downstreamBoundary': downstream_boundary(args.root), 'M7Gate': 'BLOCKED', 'engineeringAdmission': False}
    args.output.write_bytes(rfc8785.dumps(report) + b'\n')


if __name__ == '__main__':
    main()
