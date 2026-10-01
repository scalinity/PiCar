"""Inspect real candidate BRep and independent second-view landmarks.

No generator imports. Shape correctness is separate from source fidelity/admission.
"""
import argparse
import json
import math
from pathlib import Path

import cadquery as cq
import numpy as np
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.BRepClass3d import BRepClass3d_SolidClassifier
from OCP.GeomAbs import GeomAbs_Cylinder, GeomAbs_Plane
from OCP.TopAbs import TopAbs_IN, TopAbs_OUT
from OCP.gp import gp_Pnt


TOL = 1e-6  # Authored construction agreement, never a photographic error budget.


def contains(shape, x, y, z):
    classifier = BRepClass3d_SolidClassifier(shape.wrapped)
    classifier.Perform(gp_Pnt(float(x),float(y),float(z)),TOL)
    if classifier.State() not in (TopAbs_IN,TopAbs_OUT):
        raise ValueError('AMBIGUOUS_POINT_CLASSIFICATION')
    return classifier.State() == TopAbs_IN


def inspect(definition, directory):
    shape = cq.Shape.importBrep(str(Path(directory)/(definition['definitionId']+'.brep')))
    if not BRepCheck_Analyzer(shape.wrapped).IsValid() or len(shape.Solids()) != 1 or shape.Volume() <= 0:
        raise ValueError('INVALID_BREP_SOLID')
    thickness = definition['thickness']['valueMm']
    bounds = shape.BoundingBox()
    if abs(bounds.zmin)>TOL or abs(bounds.zmax-thickness)>TOL:
        raise ValueError('STOCK_PLANES_OR_UNITS')
    cylinders, planar_wires = [], []
    for face in shape.Faces():
        surface = BRepAdaptor_Surface(face.wrapped, True)
        if surface.GetType()==GeomAbs_Cylinder:
            c=surface.Cylinder();p=c.Location();d=c.Axis().Direction()
            cylinders.append({'center':[p.X(),p.Y()],'radius':c.Radius(),'axis':[d.X(),d.Y(),d.Z()]})
        if surface.GetType()==GeomAbs_Plane:
            p=surface.Plane();d=p.Axis().Direction()
            if abs(abs(d.Z())-1)<TOL: planar_wires.append(len(face.Wires()))
    actual_holes=[]
    for hole in definition['holes']:
        x,y=hole['centerMm'];radius=hole['diameterMm']/2
        matches=[c for c in cylinders if abs(c['radius']-radius)<TOL and math.dist(c['center'],[x,y])<TOL and abs(abs(c['axis'][2])-1)<TOL]
        if len(matches)!=1: raise ValueError('MISSING_HOLE_OR_WRONG_AXIS')
        for z in [.1*thickness,.5*thickness,.9*thickness]:
            if contains(shape,x,y,z):raise ValueError('CAPPED_THROUGH_HOLE')
        actual_holes.append(matches[0])
    profile=definition['profile'];slots=profile.get('slots',[]);cutouts=profile.get('cutouts',[])
    for slot in slots:
        a,b=np.asarray(slot['endCentersMm']);mid=(a+b)/2
        for p in [a,b,mid]:
            if contains(shape,*p,thickness/2):raise ValueError('MISSING_THROUGH_SLOT')
        normal=np.array([-(b-a)[1],(b-a)[0]]);normal/=np.linalg.norm(normal)
        if not contains(shape,*(mid+normal*(slot['widthMm']/2+.2)),thickness/2):raise ValueError('SLOT_WIDTH_OR_MISSING_WEB')
    for cutout in cutouts:
        p=np.mean(cutout['verticesMm'],axis=0)
        if contains(shape,*p,thickness/2):raise ValueError('MISSING_THROUGH_CUTOUT')
    if 'notchVerticesMm' in profile:
        p=np.mean(profile['notchVerticesMm'],axis=0)
        if contains(shape,*p,thickness/2):raise ValueError('MISSING_OPEN_NOTCH')
    expected_wires=1+len(actual_holes)+len(slots)+len(cutouts)
    if sorted(planar_wires)!=[expected_wires,expected_wires]:raise ValueError('UNEXPECTED_OPENING_OR_NONFLAT')
    return {'definitionId':definition['definitionId'],'status':'PASS','scope':'Authored provisional BRep construction only',
            'solidCount':1,'volumeMm3':shape.Volume(),'flatStockPlanesMm':[bounds.zmin,bounds.zmax],
            'actualHoleCylinders':actual_holes,'actualTopBottomWireCounts':sorted(planar_wires),
            'slotCount':len(slots),'closedCutoutCount':len(cutouts),
            'openNotch':bool('notchVerticesMm' in profile),'engineeringAdmission':False,'instructionalAdmission':False}


def source_residual(definition, shape_report, calibration):
    view=next(v for v in calibration['views'] if v['plate']==definition['plate'] and v['index']==2)
    metric=view['metricCandidateFeatures'];observed=np.array([[-h['centerMm'][1],h['centerMm'][0]] for h in metric['holes']])
    actual=np.array([h['center'] for h in shape_report['actualHoleCylinders']])
    ends=[0,2] if definition['plate']=='G' else [0,1] if definition['plate']=='D' else [0,5]
    a,b=observed[ends];c,d=actual[ends]
    angle=math.atan2(*(d-c)[::-1])-math.atan2(*(b-a)[::-1])
    rotation=np.array([[math.cos(angle),-math.sin(angle)],[math.sin(angle),math.cos(angle)]])
    translation=(c+d)/2-rotation@((a+b)/2)
    transformed=observed@rotation.T+translation
    errors=np.linalg.norm(transformed-actual,axis=1)
    diameter_errors=[abs(h['diameterMm']-2*s['radius']) for h,s in zip(metric['holes'],shape_report['actualHoleCylinders'],strict=True)]
    return {'definitionId':definition['definitionId'],'status':'BLOCKED','scope':'Independent withheld second-view hole landmarks; full silhouette/source gate incomplete',
            'sourceImage':view['sourceImage'],'sourceRawSha256':view['sourceRawSha256'],
            'alignmentMethod':'Rigid 2D alignment on two outer holes; no fitted scale or reflection',
            'alignmentRotation':rotation.tolist(),'alignmentTranslationMm':translation.tolist(),
            'alignmentFitHoleIndices':ends,'withheldHoleIndices':[i for i in range(len(errors)) if i not in ends],
            'holeCenterResidualsMm':errors.tolist(),'maxHoleCenterResidualMm':float(max(errors)),
            'rmsHoleCenterResidualMm':float(np.sqrt(np.mean(errors**2))),
            'holeDiameterDifferencesMm':diameter_errors,'maxHoleDiameterDifferenceMm':max(diameter_errors),
            'blockers':['No joint bound for lens/card warpage, planar offset and feature extraction',
                        'Full independent silhouette/slot/cutout and installed-orientation projection gate not closed'],
            'engineeringAdmission':False,'instructionalAdmission':False}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--parameters',type=Path,required=True)
    parser.add_argument('--artifacts',type=Path,required=True)
    parser.add_argument('--calibration',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args();inputs=json.loads(args.parameters.read_text());cal=json.loads(args.calibration.read_text())
    results=[inspect(d,args.artifacts) for d in inputs['definitions']]
    residuals=[source_residual(d,r,cal) for d,r in zip(inputs['definitions'],results,strict=True)]
    args.output.write_text(json.dumps({'candidateShapeStatus':'PASS','sourceValidationStatus':'BLOCKED',
                            'results':results,'sourceResiduals':residuals,'engineeringAdmission':False,
                            'instructionalAdmission':False},indent=2,allow_nan=False)+'\n')
    print(json.dumps({'candidateBReps':len(results),'candidateShapeStatus':'PASS','sourceValidation':'BLOCKED',
                     'maxHoleResidualsMm':{d['definitionId']:d['maxHoleCenterResidualMm'] for d in residuals}}))


if __name__ == '__main__':
    main()
