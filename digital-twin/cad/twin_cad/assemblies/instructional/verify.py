"""Independent BRep/source observations, never imports the assembly generator."""
import argparse
import hashlib
import itertools
import math
from pathlib import Path
import numpy as np
import cadquery as cq
import rfc8785
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GeomAbs import GeomAbs_Cylinder
from OCP.gp import gp_Trsf
from ...contracts import load, Invalid

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'


def require(condition, reason):
    if not condition:
        raise Invalid(reason)


def digest(root, path):
    data = (root / path).read_bytes()
    return {'path': path, 'rawSha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


REVISION_DIR = 'digital-twin/validation/expected/m7/instructional-revisions/'
REVISION_RECORDS = REVISION_DIR + 'revision-artifacts.json'
M5_DIR = 'digital-twin/validation/expected/m5/instructional-artifacts/'
M6_DIR = 'docs/implementation/evidence/m6/amendment-shapes-04/candidate-artifacts/'


def purchased_artifact(root, definition_id):
    """The accepted M5 artifact, or its additive M7 revision when one is tracked; a revision must match its recorded bytes."""
    root = Path(root)
    revised = root / (REVISION_DIR + definition_id + '.brep')
    if not revised.is_file():
        return root / ((M6_DIR if '-PLATE-' in definition_id else M5_DIR) + definition_id + '.brep')
    record = next((r for r in load(root / REVISION_RECORDS)['records'] if r['definitionId'] == definition_id), None)
    require(record is not None and hashlib.sha256(revised.read_bytes()).hexdigest() == record['newArtifactSha256'], 'REVISED_ARTIFACT_BYTES')
    old = root / record['supersedesPath']
    require(hashlib.sha256(old.read_bytes()).hexdigest() == record['supersededArtifactSha256'], 'SUPERSEDED_ARTIFACT_CHANGED')
    return revised


PLATE_A_ID = 'PX-V40-DEF-PLATE-A'


def plate_a_artifact(root):
    """Root-relative path of the Plate A artifact the chain uses: the accepted M6 artifact or its tracked revision."""
    return Path(purchased_artifact(root, PLATE_A_ID)).relative_to(Path(root)).as_posix()


def rigid(pose):
    require(set(pose) == {'instanceId', 'translationMm', 'rotation', 'featureRef', 'role'}, 'CLOSED_RIGID_POSE')
    r = np.array(pose['rotation'], dtype=np.float64)
    t = np.array(pose['translationMm'], dtype=np.float64)
    require(r.shape == (3, 3) and t.shape == (3,) and np.isfinite(r).all() and np.isfinite(t).all(), 'FINITE_FLOAT64_RIGID')
    require(np.max(np.abs(r.T @ r - np.eye(3))) < 1e-10 and abs(np.linalg.det(r)-1) < 1e-10, 'PROPER_ROTATION_NO_SCALE_SHEAR_REFLECTION')
    return r, t


def shape_features(shape):
    result = []
    for face in shape.Faces():
        adapter = BRepAdaptor_Surface(face.wrapped, True)
        if adapter.GetType() == GeomAbs_Cylinder:
            cyl = adapter.Cylinder()
            result.append({'radius': cyl.Radius(), 'origin': np.array(cyl.Location().Coord()),
                           'axis': np.array(cyl.Axis().Direction().Coord())})
    return result


def load_shape(root, path):
    shape = cq.Shape.importBrep(str(root / path))
    require(BRepCheck_Analyzer(shape.wrapped).IsValid() and len(shape.Solids()) == 1 and shape.Volume() > 0, 'VALID_ACTUAL_SOLID')
    return shape


def placed(shape, rotation, translation):
    matrix = np.eye(4)
    matrix[:3, :3] = rotation
    matrix[:3, 3] = translation
    transform = gp_Trsf()
    transform.SetValues(*[float(v) for v in matrix[:3, :].flat])
    return shape.transformShape(cq.Matrix(transform))


def verify(root, solution):
    scope = load(root / PRESENTATION / 'product-scope.json')
    variant = solution['variantId']
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(solution['track'] == 'instructional-only' and solution['engineeringAdmission'] is False and solution['runtimeAdmission'] is False, 'ENGINEERING_FIREWALL')
    require(solution['basis'] == 'RH-XFORWARD-YLEFT-ZUP' and solution['unit'] == 'mm' and solution['numericType'] == 'float64', 'BASIS_UNIT')
    require(solution['printedNumber'] == 1 and solution['stepId'] == 'PX-V40-STEP-01', 'IMPLEMENTED_SCOPE_ONLY_S01')
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    source = load(root / PRESENTATION / 'step01-source-review-02.json')
    plate_params = load(root / 'digital-twin/validation/expected/plates/instructional/all-parameters.json')
    a = next(d for d in plate_params['definitions'] if d['plate'] == 'A')
    deck = next(f for f in a['profile']['faces'] if f['name'] == 'deck')
    m5 = load(root / 'digital-twin/validation/expected/m5/instructional-parameters.json')
    definitions = {d['definitionId']: d for d in m5['definitions']}
    registry = {i['id']: i for i in graph['instances']}
    step = graph['steps'][0]
    require(solution['graphHash'] == graph['graphHash'] and solution['modelHash'] == graph['modelHash'], 'GRAPH_MODEL_BINDING')
    require(solution['operationIds'] == step['operationIds'], 'OPERATION_ORDER_OR_OWNERSHIP')
    connections = [c for c in graph['mechanicalConnections'] if c['activationOperationId'] in step['operationIds']]
    require(solution['connectionIds'] == [c['id'] for c in connections], 'PROTECTED_CONNECTION_SEMANTICS')
    require(solution['remainingDOF'] == [] and all(c['remainingDOF'] == [] and c['jointType'] == 'fixed' for c in connections), 'UNDECLARED_DOF_OR_DRIFT')
    expected = sorted(step['introducedInstanceIds'])
    require(sorted(p['instanceId'] for p in solution['after']) == expected, 'MISSING_OR_DUPLICATE_PHYSICAL_INSTANCE')
    require(solution['before'] == [{'instanceId': i, 'location': 'available', 'pose': None,
             'reason': 'Unstaged stock has no installed or implicit identity transform'} for i in expected], 'BEFORE_STATE_OR_IDENTITY_FALLBACK')
    require(len(solution['recipes']) == 8 and sorted(p['instanceId'] for p in solution['recipes']) == [i for i in expected if 'PLATE-A' not in i], 'RECIPE_OWNERSHIP')
    required_bindings = {
        f'digital-twin/validation/m2/{variant}/compiled-graph.json',
        'digital-twin/validation/expected/m5/instructional-parameters.json',
        'digital-twin/validation/expected/plates/instructional/all-parameters.json',
        PRESENTATION+'/step01-source-review-02.json', PRESENTATION+'/product-scope.json',
        PRESENTATION+'/gate-policy.json', 'digital-twin/toolchain.lock.json',
        'digital-twin/cad/twin_cad/assemblies/instructional/generate.py',
        'digital-twin/cad/twin_cad/assemblies/instructional/verify.py'}
    for definition_id in {registry[i]['definitionId'] for i in expected}:
        receipt_path = ('digital-twin/validation/expected/plates/instructional/receipts/' if definition_id.endswith('PLATE-A')
                        else 'digital-twin/validation/expected/m5/instructional-receipts/')+definition_id+'.json'
        receipt = load(root/receipt_path)
        required_bindings.add(receipt_path)
        required_bindings.add(receipt['proofs']['brep']['path'] if definition_id.endswith('PLATE-A')
                              else next(p for p in receipt['artifactPaths'] if p.endswith('.brep')))
    require({b['path'] for b in solution['inputBindings']} == required_bindings and len(solution['inputBindings']) == len(required_bindings), 'EXACT_INPUT_BINDING_CLOSURE')
    for b in solution['inputBindings']:
        require(digest(root, b['path']) == b, 'INPUT_BYTES_CHANGED')
    require(solution['anchor'] == source['plateAAnchor'] and solution['anchor']['engineeringDatum'] is False, 'REPLACEABLE_ANCHOR_FIREWALL')
    require(solution['claims']['installationSweep'] == 'BLOCKED' and solution['claims']['physicalFit'] == 'BLOCKED', 'UNTESTED_SWEEP_OR_PHYSICAL_PROMOTION')
    require(solution['sourceLimitations'] == source['uncertainty']['sourceLimitations'], 'LIMITATION_REMOVAL')
    pose_by_id = {p['instanceId']: p for p in solution['after']}
    anchor_r, anchor_t = rigid(pose_by_id['PX-V40-INS-PLATE-A-001'])
    require(np.max(abs(anchor_r-np.eye(3))) < 1e-10 and np.max(abs(anchor_t)) < 1e-10, 'UNDECLARED_ANCHOR_DRIFT')
    plate_path = plate_a_artifact(root)
    plate_shape = load_shape(root, plate_path)
    plate_cylinders = shape_features(plate_shape)
    shapes = {'PX-V40-INS-PLATE-A-001': plate_shape}
    artifact_bindings = [digest(root, plate_path)]
    residuals = []
    wanted_contacts = []
    for allocation in source['variantAllocations'][variant]:
        feature = next(f for f in source['positions'] if f['name'] == allocation['position'])
        hole = next(h for h in deck['holes'] if h['name'] == feature['plateFeature'])
        target = np.array([*hole['centerMm'], 0.])
        require(np.max(abs(target-np.array(feature['centerMm']))) < 1e-10, 'SOURCE_FEATURE_BINDING')
        require(any(abs(c['radius']-hole['diameterMm']/2) < 1e-6 and np.linalg.norm((c['origin']-target)[:2]) < 1e-6 and abs(c['axis'][2]) > .999999 for c in plate_cylinders), 'ACTUAL_PLATE_HOLE_ABSENT_OR_SHIFTED')
        wanted_contacts.append({'instances': sorted([allocation['screwInstanceId'], allocation['standoffInstanceId']]),
                                'kind': 'explicit instructional shaft overlap for omitted standoff bore',
                                'maximumOverlapMm3': 20., 'physicalEngagement': 'UNRESOLVED'})
        for key, kind, z in [('screwInstanceId', 'screw', 0.), ('standoffInstanceId', 'standoff', a['thickness']['valueMm'])]:
            ident = allocation[key]
            p = pose_by_id[ident]
            r, t = rigid(p)
            definition = definitions[registry[ident]['definitionId']]
            require(p['featureRef'] == hole['name'] and p['role'] == kind and definition['recipe'] == kind, 'SWAPPED_INSTANCE_OR_FEATURE')
            q = {v['name']: v['value'] for v in definition['instructionalApproximations']}
            shape_path = 'digital-twin/validation/expected/m5/instructional-artifacts/'+definition['definitionId']+'.brep'
            shape = load_shape(root, shape_path)
            artifact_bindings.append(digest(root, shape_path))
            cylinder = next((c for c in shape_features(shape) if abs(c['radius']-q['diameter']/2) < 1e-6), None)
            require(cylinder is not None and np.linalg.norm(cylinder['origin'][:2]) < 1e-6, 'ACTUAL_PART_AXIS')
            # The independently extracted circular axis has sign ambiguity; source polarity
            # is supplied by the bearing face / declared part-local extrusion convention.
            world_axis = r @ np.array([0., 0., 1.])
            angular = math.acos(float(np.clip(world_axis @ np.array([0., 0., 1.]), -1., 1.)))
            roll = math.acos(float(np.clip((r @ np.array([1., 0., 0.])) @ np.array([1., 0., 0.]), -1., 1.)))
            location = np.array([target[0], target[1], z])
            translation = float(np.linalg.norm(t-location))
            require(translation <= .001 and angular <= .00001 and roll <= .00001, 'SOURCE_AXIS_POLARITY_ROLL_OR_SEATING_RESIDUAL')
            recipe = next(v for v in solution['recipes'] if v['instanceId'] == ident)
            sr, st = rigid(recipe['stagedStart'])
            offset = source['approachOffsetMm'][kind]
            require(recipe['anchor'] == {'instanceId': 'PX-V40-INS-PLATE-A-001', 'localFeature': hole['name']} and recipe['axis'] == [0,0,1] and recipe['approachOffsetMm'] == offset and recipe['stagingOnly'] is True and recipe['installationSweep']['status'] == 'BLOCKED', 'FEATURE_RELATIVE_RECIPE_OR_SWEEP')
            require(np.max(abs(sr-r)) < 1e-10 and np.max(abs(st-(t+[0,0,offset]))) < 1e-10, 'ALTERED_APPROACH')
            shapes[ident] = placed(shape, r, t)
            residuals.append({'instanceId': ident, 'feature': hole['name'], 'translationMm': translation, 'axisRad': angular, 'rollRad': roll, 'remainingDOF': []})
    require(solution['contactPolicy'] == wanted_contacts, 'GLOBAL_OR_UNDECLARED_CONTACT_EXEMPTION')
    allowed = {tuple(c['instances']): c for c in wanted_contacts}
    contacts, forbidden = [], []
    for left, right in itertools.combinations(sorted(shapes), 2):
        volume = shapes[left].intersect(shapes[right]).Volume()
        policy = allowed.get((left, right))
        if policy:
            require(volume <= policy['maximumOverlapMm3']+1e-6, 'EXCESSIVE_ALLOWED_OVERLAP')
            contacts.append({'instances': [left,right], 'intersectionMm3': volume, 'classification': 'ALLOWED_PRESENTATION_THREAD_PROXY_OVERLAP', 'physicalEngagement': 'UNRESOLVED'})
        elif volume > 1e-6:
            forbidden.append({'instances':[left,right], 'intersectionMm3':volume})
    require(not forbidden, 'FORBIDDEN_PRESENTATION_PENETRATION')
    return {'variantId':variant, 'stepId':step['id'], 'staticInstructionalStatus':'PASS',
            'scope':'Actual S01 static nine-instance BRep relationship only; not complete M7 or installation sweep',
            'engineeringAdmission':False, 'runtimeAdmission':False, 'solidInstanceCount':len(shapes),
            'inputSolution':solution['id'], 'artifactBindings':sorted({v['path']:v for v in artifact_bindings}.values(),key=lambda v:v['path']),
            'residuals':residuals, 'declaredRemainingDOF':[],
            'constraintObservation':'Eight source axis/roll/seating placements; fixed relation DOF observed 0 by complete rigid frame; no mechanism solver or full steering travel claim',
            'allowedContacts':contacts, 'forbiddenPenetrations':forbidden, 'pairChecks':36,
            'physicalClearance':{'status':'BLOCKED','reason':'Unknown tolerances and engagement; intersection checks prove only authored static representation'},
            'installationSweep':{'status':'BLOCKED','reason':'No independently bounded path test'},
            'sourceLimitations':source['uncertainty']['sourceLimitations']}


def board_direction_probe(root):
    review_path = PRESENTATION+'/pi5-board-direction-review.json'
    review = load(root/review_path)
    shape_path = review['acceptedProxyPath']
    shape = cq.Shape.importBrep(str(root/shape_path))
    require(BRepCheck_Analyzer(shape.wrapped).IsValid(), 'BOARD_ACTUAL_BREP_INVALID')
    bounds=[]
    for s in shape.Solids():
        b=s.BoundingBox()
        bounds.append([b.xmin,b.ymin,b.zmin,b.xmax,b.ymax,b.zmax])
    # Dimensions distinguish actual authored separate solid groups, not face indices
    # or the generator's success flags. The observations are explicit proxy geometry.
    pcb=next(b for b in bounds if abs(b[0])<1e-6 and abs(b[1])<1e-6 and abs(b[5]-b[2]-1.6)<1e-6 and b[3]-b[0]>80)
    header=next(b for b in bounds if b[3]-b[0]>50 and 3<b[4]-b[1]<5 and abs(b[5]-b[2]-8)<1e-6)
    bank=[b for b in bounds if b[0]>60 and b[3]-b[0]>15 and b[5]-b[2]>10]
    require(len(bank)==3, 'BOARD_PORT_BANK_IDENTIFICATION')
    require(header[1]>pcb[4]/2 and all(b[0]>pcb[3]/2 for b in bank) and min(header[2],*(b[2] for b in bank))>=pcb[5]-1e-6, 'BOARD_SIGNED_SIDES')
    actual = np.eye(3)  # port +X, header +Y, component +Z, extracted above
    desired = np.array([review['requiredInstalledDirections'][k] for k in ['usbEthernetOutward','gpioSide','pcbComponentNormal']],dtype=np.float64).T
    candidate = desired @ actual.T
    determinant=float(np.linalg.det(candidate))
    require(abs(determinant+1)<1e-10, 'DIRECTION_PROBE_EXPECTED_REFLECTED_ALTERNATIVE')
    return {'variantId':'rpi5','stepId':'PX-V40-STEP-02','status':'BLOCKED',
            'blockerId':'M7-PI5-BOARD-CHIRALITY', 'sourceReviewBinding':digest(root,review_path),
            'brepBinding':digest(root,shape_path),'actualSolidCount':len(bounds),
            'actualPCB':pcb,'actualHeader':header,'actualUSBPortBank':bank,
            'actualLocalDirections':{'usbEthernetOutward':[1,0,0],'gpioSide':[0,1,0],'pcbComponentNormal':[0,0,1]},
            'requiredInstalledDirections':review['requiredInstalledDirections'],
            'uniqueOrthogonalMapping':candidate.tolist(),'determinant':determinant,
            'properRigidSolutionExists':False,'reflectionAllowed':False,'engineeringAdmission':False,
            'reason':'Actual proxy and printed installed direction triples have opposite chirality. A proper rigid rotation cannot align all three. Rotating 180 around Z preserves top and rear ports but moves GPIO to robot right; leaving roll unchanged puts ports forward.',
            'remediation':review['remediationIfBlocked']}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--root',type=Path,required=True)
    parser.add_argument('--solutions',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    results=[verify(args.root,load(p)) for p in sorted(args.solutions.glob('*-S01.json'))]
    require(len(results)==2 and {r['variantId'] for r in results}=={'rpi5','rpi-zero-2-w'}, 'EXACT_ACTIVE_STATIC_SCOPE')
    args.output.write_bytes(rfc8785.dumps({'status':'PASS','scope':'Two revised S01 static observations; retained rejected direction review is historical only. Current orientation proof is correspondence.json; not M7 acceptance',
          'results':results,'historicalRejectedSourceDirectionProbe':board_direction_probe(args.root), 'engineeringAdmission':False})+b'\n')


if __name__=='__main__':
    main()
