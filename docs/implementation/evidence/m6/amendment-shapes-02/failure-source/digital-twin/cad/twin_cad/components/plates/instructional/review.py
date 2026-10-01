"""Private source/CAD comparisons made from actual imported solids, not metadata."""
import argparse
import hashlib
import json
import math
from pathlib import Path

import cadquery as cq
import numpy as np
from PIL import Image, ImageDraw, ImageOps

from .image_analysis import manifest
from .calibration import project,undistort


def render(shape,plate):
    vertices,triangles=shape.tessellate(.12,.15)
    points=np.array([v.toTuple() for v in vertices])
    if plate in 'DGH':basis=np.array([[0,1,0],[-1,0,0],[0,0,1]])
    else:
        angle=-math.pi/4 if plate=='C' else math.pi/4
        right=[math.cos(angle),math.sin(angle),0]
        up=[-math.sin(angle)*.55,math.cos(angle)*.55,math.sqrt(1-.55**2)]
        basis=np.array([right,up,np.cross(right,up)])
    screen=points@basis.T
    lo=screen[:,:2].min(axis=0);hi=screen[:,:2].max(axis=0)
    scale=min(540/(hi[0]-lo[0]),480/(hi[1]-lo[1]));offset=(lo+hi)/2
    xy=(screen[:,:2]-offset)*[scale,-scale]+[300,300]
    image=Image.new('RGB',(600,600),'#f4f5f6');draw=ImageDraw.Draw(image)
    for indices in sorted(triangles,key=lambda t:screen[list(t),2].mean()):
        a,b,c=points[list(indices)];normal=np.cross(b-a,c-a);normal/=max(np.linalg.norm(normal),1e-12)
        shade=int(110+100*abs(np.dot(normal,np.array([.3,-.4,.866]))))
        draw.polygon([tuple(p) for p in xy[list(indices)]],fill=(shade,shade,shade+min(15,255-shade)))
    draw.text((15,15),f'Actual BRep {plate} / instructional approximation',fill='black')
    return image


def photo(package,row,crop):
    with Image.open(package/row['relative_path']) as original:
        image=ImageOps.exif_transpose(original).convert('RGB');w,h=image.size
        image=image.crop(tuple(int(v*s) for v,s in zip(crop,[w,h,w,h],strict=True)))
        image.thumbnail((580,540))
    tile=Image.new('RGB',(600,600),'white');tile.paste(image,((600-image.width)//2,35+(540-image.height)//2))
    ImageDraw.Draw(tile).text((10,10),row['new_filename'],fill='black')
    return tile


def distort(points,k,size):
    result=np.array(points,copy=True)
    for _ in range(8):result+=points-undistort(result,k,size)
    return result


def flat_projection(shape,definition,view,calibration,shape_report,package,destination):
    row=next(r for r in manifest(package) if r['relative_path']==view['sourceImage'])
    size=view['annotationSize']
    with Image.open(package/row['relative_path']) as im:image=ImageOps.exif_transpose(im).convert('RGB').resize(tuple(size))
    draw=ImageDraw.Draw(image);source_cal=next(v for v in calibration['views'] if v['plate']==definition['plate'] and v['index']==view['index'])
    h=np.linalg.inv(source_cal['perspective']['homographyUndistortedAnnotationPxToCardMm'])
    if view['index']==2:
        residual=next(r for r in shape_report['sourceResiduals'] if r['definitionId']==definition['definitionId'])
        rotation=np.array(residual['alignmentRotation']);translation=np.array(residual['alignmentTranslationMm'])
    for edge in shape.Edges():
        samples,_=edge.sample(32);local=np.array([[p.x,p.y] for p in samples])
        if view['index']==1:
            center=definition['presentationOrigin']['cardMetricCenterMm'];metric=np.c_[local[:,1]+center[0],-local[:,0]+center[1]]
        else:
            q=(local-translation)@rotation;metric=np.c_[q[:,1],-q[:,0]]
        pixels=distort(project(metric,h),source_cal['lens']['coefficient'],size)
        draw.line([tuple(p) for p in pixels],fill='#e82e00',width=2)
    image.save(destination)
    return {'sourceImage':row['relative_path'],'sourceRawSha256':row['sha256'],'index':view['index'],'method':'Actual imported BRep edge samples projected through primary calibration or independent rigid secondary alignment and inverse lens model','comparison':'REVIEW_REQUIRED','privateOutput':destination.name}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    for n in ['package','parameters','artifacts','views','calibration','shapes','output','receipt']:parser.add_argument('--'+n,type=Path,required=True)
    args=parser.parse_args();private=args.package.resolve().parents[2]/'digital-twin/evidence/private/m6'
    if not args.output.resolve().is_relative_to(private.resolve()):raise ValueError('PRIVATE_OUTPUT_REQUIRED')
    if args.output.exists():raise ValueError('FRESH_PRIVATE_OUTPUT_REQUIRED')
    args.output.mkdir(parents=True)
    rows=manifest(args.package);definitions=json.loads(args.parameters.read_text())['definitions'];views=json.loads(args.views.read_text());cal=json.loads(args.calibration.read_text());shapes=json.loads(args.shapes.read_text())
    results=[]
    for d in definitions:
        plate=d['plate'];shape=cq.Shape.importBrep(str(args.artifacts/(d['definitionId']+'.brep')));spec=views['plates'][plate]
        picture=Image.new('RGB',(1800,1200),'white');picture.paste(render(shape,plate),(600,0));refs=[]
        for index,item in enumerate(spec['comparisons']):
            row=next(r for r in rows if r['relative_path']==item['sourceImage'])
            picture.paste(photo(args.package,row,item['crop']),([0,1200,0,1200][index],0 if index<2 else 600))
            refs.append({'sourceImage':row['relative_path'],'sourceRawSha256':row['sha256'],'role':item['role'],'method':'Independent visual comparison of actual triangulated BRep and source view; no contour tolerance claim'})
        picture.save(args.output/(plate+'-comparison.png'))
        if plate in 'DGH':
            for view in views['flatViews']:
                if view['plate']==plate:refs.append(flat_projection(shape,d,view,cal,shapes,args.package,args.output/(plate+'-'+str(view['index'])+'-projection.png')))
        results.append({'definitionId':d['definitionId'],'status':'REVIEW_REQUIRED','comparisons':refs,'shapeRawSha256':hashlib.sha256((args.artifacts/(d['definitionId']+'.brep')).read_bytes()).hexdigest(),'limitations':spec['limitations']})
    args.receipt.write_text(json.dumps({'track':'instructional-only','status':'REVIEW_REQUIRED','results':results,'privatePixelsCopiedToReceipt':False},indent=2)+'\n')
    print(f'Prepared {len(results)} actual-solid comparisons, private pixels only')


if __name__=='__main__':main()
