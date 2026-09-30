// M4 synthetic source authoring only. Never writes a production/runtime manifest.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const twin=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const frame=(translationMm=[0,0,0],quaternionXYZW=[0,0,0,1])=>({translationMm,quaternionXYZW});
const id=frame();
const definitions=[
 {id:'TEST-DEF-A',dimensionScope:'SYNTHETIC_AUTHORED_NOT_MEASURED',parameters:{length:24,width:18,height:3,holeX:5,holeY:4,holeLength:4,holeWidth:6}},
 {id:'TEST-DEF-B',dimensionScope:'SYNTHETIC_AUTHORED_NOT_MEASURED',parameters:{length:17,width:13,height:2,holeX:3,holeY:6,holeLength:5,holeWidth:3}},
 {id:'TEST-DEF-C',dimensionScope:'SYNTHETIC_AUTHORED_NOT_MEASURED',parameters:{length:20,width:15,height:4,holeX:9,holeY:3,holeLength:3,holeWidth:5}},
];
const instances=definitions.map((d,n)=>({id:`TEST-INS-${'ABC'[n]}`,definitionId:d.id}));
const connection=(name,a,b,kind,frameA=id,frameB=id,extra={})=>({id:name,a:`TEST-INS-${a}`,b:`TEST-INS-${b}`,kind,frameA,frameB,...extra});
const source={id:'TEST-M4-PLANAR-ASSEMBLIES',scope:'TEST-ONLY',unit:'mm',basis:'RH-XFORWARD-YLEFT-ZUP',
 dimensionScope:'SYNTHETIC_AUTHORED_NOT_MEASURED',datum:'synthetic.x0-y0-z0',
 budgets:{criticalSurfaceMm:0.02,contextSurfaceMm:0.10,transformedInterfaceMm:0.01,transformedInterfaceRad:0.0001,sourceUncertainty:'NOT_A_MANUFACTURING_MEASUREMENT'},
 definitions,instances,assemblies:[
 {id:'TEST-FIXED',instanceIds:['TEST-INS-A','TEST-INS-B'],anchor:'TEST-INS-A',anchorPose:frame([100,7,11],[0,0,Math.SQRT1_2,Math.SQRT1_2]),expectedDOF:0,
  constraints:[connection('TEST-CONN-FIXED','A','B','fixed',frame([15,4,2]),frame([2,1,0],[0,0,Math.SQRT1_2,Math.SQRT1_2]))]},
 {id:'TEST-REVOLUTE',instanceIds:['TEST-INS-A','TEST-INS-B'],anchor:'TEST-INS-A',anchorPose:frame([2,3,5]),expectedDOF:1,
  constraints:[connection('TEST-CONN-REVOLUTE','A','B','revolute',frame([6,4,2]),frame([3,2,0]),{referenceRad:0.37,axisPolarity:'+Z',roll:'free physical DOF; sampled reference coordinate is a gauge'})]},
 {id:'TEST-CLOSED-LOOP',instanceIds:instances.map(i=>i.id),anchor:'TEST-INS-A',anchorPose:id,expectedDOF:0,
  constraints:[connection('TEST-LOOP-AB','A','B','fixed',frame([12,0,0])),connection('TEST-LOOP-BC','B','C','fixed',frame([0,7,0])),connection('TEST-LOOP-CA','C','A','fixed',id,frame([12,7,0]))]},
 ]};
const output=path.join(twin,'validation/fixtures/m4');fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'TEST-M4.json'),JSON.stringify(source,null,2)+'\n');
const read=p=>JSON.parse(fs.readFileSync(path.join(twin,p)));
const interfaces=read('components/interfaces/mechanical.json'),measurements=read('components/measurements/measurements.json');
const declarations={scope:'production-non-admitted',authority:'Existing canonical M1/M2 records only; no added metric values',
 productionDatum:{state:'unresolved',ownerMilestone:'M6',blockerIds:['Q-03'],convention:'Plate A center plane / named mounting and longitudinal datums; numerical selection unresolved'},
 definitions:read('components/definitions/parts.json').filter(d=>d.componentClass!=='tool').map(d=>({id:d.id,blockerIds:d.blockerIds,
  interfaceDeclarations:interfaces.filter(i=>i.definitionId===d.id).map(i=>({interfaceId:i.id,feature:i.feature,frame:i.frame})),
  parameterDeclarations:measurements.filter(m=>d.measurementRefs.includes(m.id)&&m.value.state==='unresolved').map(m=>({measurementId:m.id,value:m.value})),
  admission:'BLOCKED',defaultSolidAllowed:false})),};
fs.writeFileSync(path.join(twin,'cad/twin_cad/production-parameters.json'),JSON.stringify(declarations,null,2)+'\n');
console.log('Authored three TEST-only definitions/assemblies and unresolved production declarations; no solids or runtime manifests.');
