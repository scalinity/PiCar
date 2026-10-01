"""Provisional flat plate candidates. No engineering or instructional release."""
import argparse
import json
import math
from pathlib import Path

import cadquery as cq


def polygon(points, thickness):
    return cq.Workplane('XY').polyline(points).close().extrude(thickness).val()


def capsule(a, b, width, thickness):
    dx, dy = b[0]-a[0], b[1]-a[1]
    distance = math.hypot(dx, dy)
    if distance <= 0 or width <= 0 or thickness <= 0:
        raise ValueError('DEGENERATE_CAPSULE')
    angle = math.degrees(math.atan2(dy, dx))
    return (cq.Workplane('XY').slot2D(distance+width, width)
            .extrude(thickness).val().rotate((0,0,0),(0,0,1),angle)
            .translate(((a[0]+b[0])/2,(a[1]+b[1])/2,0)))


def make_candidate(definition):
    if definition['track'] != 'instructional-only' or definition['purpose'] != 'provisional-review':
        raise ValueError('PROVISIONAL_SCOPE_REQUIRED')
    if definition['presentationOrigin']['engineeringDatum']:
        raise ValueError('ENGINEERING_DATUM_FORBIDDEN')
    if definition['thickness']['confidence'] != 'PROBABLE':
        raise ValueError('THICKNESS_PROMOTION')
    thickness = definition['thickness']['valueMm']
    profile = definition['profile']
    if profile['kind'] == 'sampled-outline':
        shape = polygon(profile['verticesMm'], thickness)
        for slot in profile['slots']:
            shape = shape.cut(capsule(*slot['endCentersMm'],slot['widthMm'],thickness))
        for cutout in profile['cutouts']:
            shape = shape.cut(polygon(cutout['verticesMm'],thickness))
    elif profile['kind'] == 'capsule-bar':
        shape = capsule(*profile['endCentersMm'],profile['widthMm'],thickness)
    elif profile['kind'] == 'rounded-notched-rectangle':
        x0,x1,y0,y1 = [profile[n] for n in ('xMin','xMax','yMin','yMax')]
        shape = (cq.Workplane('XY').box(x1-x0,y1-y0,thickness,centered=(True,True,False))
                 .edges('|Z').fillet(profile['cornerRadiusMm']).val()
                 .translate(((x0+x1)/2,(y0+y1)/2,0)))
        # Extend the open notch beyond the plate boundary, avoiding a microscopic lip.
        notch = profile['notchVerticesMm']
        xmin = min(p[0] for p in notch); ymax = max(p[1] for p in notch); ymin = min(p[1] for p in notch)
        xmax = max(p[0] for p in notch)
        # Primary H photograph opens toward image bottom = local negative X.
        shape = shape.cut(polygon([(x0-1,ymin),(xmax,ymin),(xmax,ymax),(x0-1,ymax)],thickness))
    else:
        raise ValueError('UNSUPPORTED_PLATE_PROFILE')
    for hole in definition['holes']:
        x,y = hole['centerMm']
        tool = cq.Workplane('XY').center(x,y).circle(hole['diameterMm']/2).extrude(thickness).val()
        shape = shape.cut(tool)
    if not shape.isValid() or len(shape.Solids()) != 1 or shape.Volume() <= 0:
        raise ValueError('INVALID_CANDIDATE_SOLID')
    return shape


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--parameters', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    inputs = json.loads(args.parameters.read_text())
    if not inputs['candidateOnly'] or inputs['engineeringAdmission'] or inputs['instructionalAdmission']:
        raise ValueError('CANDIDATE_FIREWALL')
    args.output.mkdir(parents=True, exist_ok=True)
    records = []
    for definition in inputs['definitions']:
        shape = make_candidate(definition)
        ident = definition['definitionId']
        shape.exportBrep(str(args.output/(ident+'.brep')))
        svg = cq.exporters.getSVG(shape,{'projectionDir':(0,0,1),'width':800,'height':600,
                                        'marginLeft':30,'marginTop':30,'showAxes':False,'showHidden':False})
        (args.output/(ident+'.svg')).write_text(svg)
        records.append({'definitionId':ident,'engineeringStatus':'BLOCKED','instructionalStatus':'BLOCKED',
                        'artifactNames':[ident+'.brep',ident+'.svg'],'scope':'PROVISIONAL REVIEW ONLY'})
    (args.output/'generation.json').write_text(json.dumps({'track':'instructional-only','candidateOnly':True,
                            'definitions':records,'engineeringAdmission':False,'instructionalAdmission':False,
                            'meshesGenerated':0,'assemblySolutionsGenerated':0},indent=2)+'\n')
    print('Generated three PROVISIONAL REVIEW candidates; no plate admission')


if __name__ == '__main__':
    main()
