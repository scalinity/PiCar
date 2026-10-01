"""Independent inspection of imported bent plate topology and face features."""
import copy
import math
from pathlib import Path

import cadquery as cq
import numpy as np
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.GeomAbs import GeomAbs_Cylinder

from .oracle import contains, TOL


def declared_faces(definition):
    profile=definition['profile']
    faces=copy.deepcopy(profile.get('faces',profile.get('sourceFaces')))
    reflected=profile['kind']=='mirrored-bent-faces'
    for face in faces:
        face['normal']=np.cross(face['u'],face['v']).tolist()
        if reflected:
            for field in ['originMm','u','v','normal']:face[field][0]*=-1
    return faces


def world(face, point, depth=0):
    return np.asarray(face['originMm'])+np.asarray(face['u'])*point[0]+np.asarray(face['v'])*point[1]+np.asarray(face['normal'])*depth


def inspect_bent(definition,directory):
    shape=cq.Shape.importBrep(str(Path(directory)/(definition['definitionId']+'.brep')))
    if not BRepCheck_Analyzer(shape.wrapped).IsValid() or len(shape.Solids())!=1 or shape.Volume()<=0:
        raise ValueError('INVALID_BREP_SOLID')
    thickness=definition['thickness']['valueMm'];faces=declared_faces(definition)
    bounds=shape.BoundingBox()
    corners=np.array([world(face,p,d) for face in faces for p in face['outlineMm'] for d in [0,thickness]])
    actual=np.array([[bounds.xmin,bounds.ymin,bounds.zmin],[bounds.xmax,bounds.ymax,bounds.zmax]])
    expected=np.array([corners.min(axis=0),corners.max(axis=0)])
    if not np.allclose(actual,expected,atol=TOL,rtol=0):raise ValueError('BENT_BOUNDS_OR_UNITS')
    cylinders=[]
    for f in shape.Faces():
        surface=BRepAdaptor_Surface(f.wrapped,True)
        if surface.GetType()==GeomAbs_Cylinder:
            c=surface.Cylinder();p=c.Location();n=c.Axis().Direction();center=f.Center()
            cylinders.append({'lineOrigin':[p.X(),p.Y(),p.Z()],'axis':[n.X(),n.Y(),n.Z()],'radius':c.Radius(),'faceCenter':[center.x,center.y,center.z]})
    records=[]
    declared_cylinders=[]
    for face in faces:
        n=np.array(face['normal']);actual_holes=[]
        for hole in face['holes']:
            declared_cylinders.append((world(face,hole['centerMm'],thickness/2),n,hole['diameterMm']/2))
        for slot in face['slots']:
            for endpoint in slot['endCentersMm']:
                declared_cylinders.append((world(face,endpoint,thickness/2),n,slot['widthMm']/2))
        for hole in face['holes']:
            p=world(face,hole['centerMm'],thickness/2)
            matches=[]
            for c in cylinders:
                axis=np.array(c['axis']);delta=p-np.array(c['lineOrigin'])
                if abs(c['radius']-hole['diameterMm']/2)<TOL and abs(abs(np.dot(axis,n))-1)<TOL and np.linalg.norm(delta-axis*np.dot(delta,axis))<TOL and abs(np.dot(np.array(c['faceCenter'])-p,n))<TOL:matches.append(c)
            if len(matches)!=1:raise ValueError('MISSING_BENT_HOLE_OR_AXIS')
            for d in [.1*thickness,.5*thickness,.9*thickness]:
                if contains(shape,*world(face,hole['centerMm'],d)):raise ValueError('CAPPED_BENT_HOLE')
            actual_holes.append({'name':hole['name'],'centerMm':p.tolist(),'diameterMm':2*matches[0]['radius'],'axis':matches[0]['axis']})
        for slot in face['slots']:
            a,b=np.array(slot['endCentersMm']);mid=(a+b)/2
            for p in [a,b,mid]:
                try:occupied=contains(shape,*world(face,p,thickness/2))
                except ValueError as error:raise ValueError(f"{error}: {definition['plate']} {face['name']} {slot['name']} {p.tolist()}") from error
                if occupied:raise ValueError('MISSING_BENT_SLOT '+definition['plate']+' '+slot['name'])
            normal=np.array([-(b-a)[1],(b-a)[0]],dtype=float);normal/=np.linalg.norm(normal)
            witnesses=[world(face,mid+sign*normal*(slot['widthMm']/2+.3),thickness/2) for sign in [-1,1]]
            if not any(contains(shape,*p) for p in witnesses):raise ValueError('MISSING_BENT_SLOT_WEB_OR_FACE')
        for cutout in face['cutouts']:
            p=np.mean(cutout['verticesMm'],axis=0)
            if contains(shape,*world(face,p,thickness/2)):raise ValueError('MISSING_BENT_CUTOUT')
        records.append({'name':face['name'],'originMm':face['originMm'],'u':face['u'],'v':face['v'],'normal':face['normal'],'actualHoles':actual_holes,'slotCount':len(face['slots']),'cutoutCount':len(face['cutouts'])})
    for c in cylinders:
        axis=np.array(c['axis']);origin=np.array(c['lineOrigin'])
        if not any(abs(c['radius']-radius)<TOL and abs(abs(np.dot(axis,n))-1)<TOL and np.linalg.norm((p-origin)-axis*np.dot(p-origin,axis))<TOL and abs(np.dot(np.array(c['faceCenter'])-p,n))<TOL for p,n,radius in declared_cylinders):
            raise ValueError('UNDECLARED_BENT_OPENING')
    return {'definitionId':definition['definitionId'],'status':'PASS','scope':'Actual bent BRep validity, relative face bounds/axes and visible opening topology','solidCount':1,'volumeMm3':shape.Volume(),'boundsMm':actual.tolist(),'faceChecks':records,'engineeringAdmission':False,'instructionalAdmission':False}


def mirror_check(directory):
    e=cq.Shape.importBrep(str(Path(directory)/'PX-V40-DEF-PLATE-E.brep'))
    f=cq.Shape.importBrep(str(Path(directory)/'PX-V40-DEF-PLATE-F.brep'))
    expected=e.mirror('YZ')
    if not f.isValid() or len(f.Solids())!=1 or f.Volume()<=0:raise ValueError('INVALID_MIRRORED_TOPOLOGY')
    difference=expected.cut(f).Volume()+f.cut(expected).Volume()
    if difference>1e-7 or abs(e.Volume()-f.Volume())>1e-7:raise ValueError('MIRROR_SHAPE_MISMATCH')
    if e.cut(f).Volume()+f.cut(e).Volume()<1:raise ValueError('HANDED_ASYMMETRY_LOST')
    return {'status':'PASS','E':'RIGHT','F':'LEFT','method':'Actual reflected E compared to independently imported F using both boolean differences; nonmirrored E/F remain asymmetric','symmetricDifferenceMm3':difference,'volumeMm3':f.Volume(),'runtimeScale':[1,1,1],'exactManufacturingMirrorClaim':False}
