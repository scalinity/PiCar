"""Independent board/source correspondence for installed anchor revision03."""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load
from .verify import require, digest, rigid
from .anchor_verify import verify
from .correspondence import actual_features, bounds
from OCP.BRepCheck import BRepCheck_Analyzer

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
ARTIFACT = 'PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep'


ZERO = 'PX-V40-DEF-ZERO2W-INSTRUCTIONAL-02.brep'


def verify_zero(root, boards):
    record = load(boards / 'zero-header-candidate.json')
    require(set(record)=={'id','track','definitionId','definitionRevision','instructionalArtifactRevision','status','oldArtifact','artifact','oldReceipt','inputBindings','scope','sourceLimitations','blockerIds','mustNotDrive','engineeringAdmission','runtimeAdmission','physicalFit','headerReadiness','inventoryItemIncrement'},'CLOSED_ZERO_CANDIDATE')
    require(record['id']=='PX-M7-ZERO2W-HEADER-CANDIDATE-03' and record['track']=='instructional-only' and record['definitionId']=='PX-V40-DEF-ZERO2W' and record['definitionRevision']==1 and record['instructionalArtifactRevision']==2 and record['status']=='CANDIDATE_REQUIRES_INDEPENDENT_ADOPTION','ZERO_IDENTITY_SCOPE')
    review_path = PRESENTATION + '/zero-header-review-03.json'
    review = load(root / review_path)
    old_path = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-ZERO2W.brep'
    old = cq.Shape.importBrep(str(root / old_path))
    new = cq.Shape.importBrep(str(boards / ZERO))
    require(record['oldArtifact'] == digest(root, old_path) and record['artifact'] == digest(boards,ZERO),'ZERO_ARTIFACT_DRIFT')
    old_receipt_path = 'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-ZERO2W.json'
    old_receipt = load(root / old_receipt_path)
    require(record['oldReceipt']==digest(root,old_receipt_path),'ZERO_RECEIPT_DRIFT')
    expected_inputs=[review_path,'digital-twin/cad/twin_cad/assemblies/instructional/anchor_boards.py','digital-twin/cad/twin_cad/assemblies/instructional/anchor_correspondence.py']
    require(record['inputBindings']==[digest(root,p) for p in expected_inputs],'ZERO_INPUT_DRIFT')
    require(record['blockerIds']==old_receipt['blockerIds'] and record['mustNotDrive']==old_receipt['mustNotDrive'] and record['sourceLimitations']==[*old_receipt['sourceLimitations'],*review['sourceLimitations']],'ZERO_LIMITS_DRIFT')
    require(record['scope']==review['scope'] and record['engineeringAdmission'] is False and record['runtimeAdmission'] is False and record['physicalFit']=='BLOCKED' and record['headerReadiness']=='Q-14_UNRESOLVED' and record['inventoryItemIncrement']==0,'ZERO_FIREWALL')
    os_, ns = old.Solids(), new.Solids()
    require(len(os_)==len(ns)==6 and all(BRepCheck_Analyzer(s.wrapped).IsValid() and s.Volume()>0 for s in ns),'ZERO_ACTUAL_SOLID_VALIDITY')
    previous=next(s for s in os_ if abs(s.BoundingBox().xlen-39)<1e-6 and abs(s.BoundingBox().zlen-8)<1e-6)
    header=next(s for s in ns if abs(s.BoundingBox().zlen-8)<1e-6)
    require(np.max(abs(np.array(bounds(header))-[7.1,25.5,1.6,57.9,27.6,9.6]))<1e-6,'ZERO_SOURCE_CENTERED_HEADER')
    require(abs((header.BoundingBox().xmin+header.BoundingBox().xmax)/2-32.5)<1e-6,'ZERO_FOOTPRINT_MIDPOINT')
    unchanged=[]
    for s in os_:
        if s.isSame(previous): continue
        matches=[n for n in ns if np.max(abs(np.array(bounds(n))-bounds(s)))<1e-6 and s.cut(n).Volume()+n.cut(s).Volume()<1e-7]
        require(len(matches)==1,'ZERO_UNCHANGED_SOLID_DRIFT')
        unchanged.append(bounds(s))
    require(len(unchanged)==5 and len(actual_features(new,'rpi-zero-2-w')['holes'])==4,'ZERO_UNCHANGED_PCB_AND_BORE_COUNT')
    return {'status':'PASS_SCOPED_ZERO_HEADER_REPRESENTATION','validPositiveSolids':6,'unchangedSolids':5,'actualHeaderBoundsMm':bounds(header),'artifact':record['artifact'],'Q14':'UNRESOLVED','physicalFit':'BLOCKED','engineeringAdmission':False}


def verify_board(root, solutions, artifacts, candidate):
    require(set(candidate) == {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'graphHash', 'modelHash', 'operationIds', 'connectionIds', 'before', 'after', 'boardPose', 'scale', 'inputBindings', 'artifactBinding', 'remainingDOF', 'completeAssemblyOutput', 'engineeringAdmission', 'runtimeAdmission', 'approximationFlags', 'recipe', 'claims', 'accessoryStatus', 'headerStatus', 'engineeringBlockerIds'}, 'CLOSED_BOARD_RECORD')
    variant = candidate['variantId']
    require(variant in ['rpi5', 'rpi-zero-2-w'], 'EXACT_ACTIVE_BOARD')
    review_path = PRESENTATION + '/step02-source-review-03.json'
    review = load(root / review_path)
    branch = review['variants'][variant]
    for binding in candidate['inputBindings']:
        source = solutions if binding['path'].endswith('-S01.json') else root
        require(binding == digest(source, binding['path']), 'BOARD_INPUT_DRIFT')
    require(sorted(b['path'] for b in candidate['inputBindings']) == sorted([review_path, f'digital-twin/validation/m2/{variant}/compiled-graph.json', variant + '-S01.json', 'digital-twin/cad/twin_cad/assemblies/instructional/anchor_boards.py', 'digital-twin/cad/twin_cad/assemblies/instructional/anchor_correspondence.py']), 'BOARD_EXACT_INPUTS')
    require(candidate['track'] == 'instructional-only' and candidate['completeAssemblyOutput'] is False and candidate['engineeringAdmission'] is False and candidate['runtimeAdmission'] is False, 'PARTIAL_BOARD_FIREWALL')
    require(candidate['scale'] == [1, 1, 1] and candidate['remainingDOF'] == [], 'SCALE_AND_DOF')
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    step = graph['steps'][1]
    require(candidate['stepId'] == step['id'] and candidate['printedNumber'] == 2 and candidate['revision'] == 3, 'BOARD_STEP_IDENTITY')
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
    path = ARTIFACT if variant == 'rpi5' else ZERO
    where = artifacts if variant == 'rpi5' else artifacts.parent / 'anchor/boards'
    if variant == 'rpi-zero-2-w': verify_zero(root, where)
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



def main():
    parser=argparse.ArgumentParser()
    for n in ['root','solutions','artifacts','boards','output']: parser.add_argument('--'+n,type=Path,required=True)
    a=parser.parse_args()
    results=[verify_board(a.root,a.solutions,a.artifacts,load(a.boards/(v+'-S02-board.json'))) for v in ['rpi5','rpi-zero-2-w']]
    a.output.write_bytes(rfc8785.dumps({'status':'PASS','scope':'New installed PlateA anchor and board direction correspondence only','boardObservations':results,'zeroHeaderRevision':verify_zero(a.root,a.boards),'fullM7Gate':'BLOCKED'})+b'\n')


if __name__=='__main__': main()
