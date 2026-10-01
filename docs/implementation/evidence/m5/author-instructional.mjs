// Authored presentation estimates only. Does not parse opaque rivet codes or edit canonical records.
import fs from 'node:fs';
import path from 'node:path';
import {loadRegistry,root} from '../../../../digital-twin/tools/evidence/semantic.mjs';
import {fileHash} from '../../../../digital-twin/tools/evidence/hash.mjs';
import {purchased,protectedFacts,canonicalUnknowns,engineeringStatus,mustNotDrive,recipes} from '../../../../digital-twin/tools/evidence/m5-instructional.mjs';
const base='digital-twin/validation/expected/m5',r=loadRegistry(),candidates=JSON.parse(fs.readFileSync(base+'/candidate-sources.json'));
const strict=JSON.parse(fs.readFileSync(base+'/scope-receipts.json'));
const sources=[...r.evidence.filter(e=>e.id.startsWith('PX-EV-PHOTO-')).map(e=>({id:e.id,path:e.artifact.path,rawSha256:e.artifact.sha256,bytes:e.artifact.byteLength,privacy:'privateOwnerEvidence',limitations:e.limitations})),...candidates.records.map(e=>({id:e.id,path:e.artifact.path,rawSha256:e.artifact.sha256,bytes:e.artifact.byteLength,privacy:e.privacy,limitations:e.limitations}))];
for(const s of sources)if(fileHash(path.join(root,s.path))!==s.rawSha256)throw Error('SOURCE_DRIFT');
const dimensions={
 screw:null,washer:null,nut:{acrossFlats:5.8,boreDiameter:3,height:2.4},standoff:null,rivet:null,
 motor:{length:32,width:20,height:19,canLength:24,canRadius:9,shaftRadius:2.4,shaftExtension:9,shaftX:10},
 servo:{length:23,width:12,height:24,tabLength:32,tabThickness:2,bossRadius:4,bossHeight:3,shaftRadius:2.4,shaftHeight:3,shaftX:6,holeRadius:1.1},
 horn:{length:26,width:5,thickness:2,hubRadius:4,hubHeight:3,boreRadius:1.8,tipBoreRadius:0.8},
 wheel:{radius:33,innerRadius:28,width:20,hubRadius:6,boreRadius:2,spokeCount:5,spokeWidth:2.5},
 board:{length:85,width:56,thickness:1.6,holeRadius:1.4,mountX:58,mountY:49,mountOffset:3.5,portHeight:15,headerHeight:8},
 hat:{length:65,width:56,thickness:1.6,speakerRadius:10,speakerHeight:4,connectorHeight:5},
 camera:{length:25,width:23,thickness:1,lensRadius:4,lensHeight:8,holeRadius:1.2,mountOffset:2.5},
 ultrasonic:{length:46,width:20.5,thickness:1.6,transducerRadius:8,transducerBore:6.4,transducerHeight:12,holeRadius:1.1,mountOffset:2},
 grayscale:{length:55,width:22,thickness:1.6,sensorLength:5,sensorWidth:8,sensorHeight:2,connectorHeight:5,holeRadius:1.2,mountOffset:3},
 battery:{length:70,width:38,height:20},connector:{length:14,width:12,height:7,plugLength:10},schematic:{},abstract:{}
};
// Relative visual lengths from the printed illustrations, deliberately not code decoding.
const rivetLengths={'R2048':5,'R2056':6.5,'R3055':7.5,'R3065':9,'R3080':6,'R30185':19};
const definitions=purchased.map(def=>{
 const id=def.id,recipe={piBoard:'board',robotHat:'hat',cable:'schematic',consumable:'abstract'}[def.componentClass]??def.componentClass;
 const scope=strict.receipts.find(s=>s.definitionId===id);
 let params=structuredClone(dimensions[recipe]??{}),sourceRefs=['PX-EV-PHOTO-03'];
 if(['motor','servo','horn','wheel','battery','hat','camera','ultrasonic','grayscale','connector','schematic','abstract'].includes(recipe))sourceRefs.push(...['PX-EV-PHOTO-04','PX-EV-PHOTO-05','PX-EV-PHOTO-06']);
 if(recipe==='screw'){
  const match=def.name.match(/^M([0-9.]+)x([0-9.]+)/);
  params=match?{diameter:Number(match[1]),length:Number(match[2]),headDiameter:Number(match[1])*1.85,headHeight:Number(match[1])*.55}:{diameter:1.6,length:4,headDiameter:3,headHeight:1};
 }
 if(recipe==='standoff'){const m=def.name.match(/^M([0-9.]+)x([0-9.]+)(?:\+([0-9.]+))?/);params={diameter:Number(m[1])*2,length:Number(m[2]),extensionDiameter:Number(m[1]),extensionLength:Number(m[3]??0)};sourceRefs.push('PX-EV-PHOTO-04');}
 if(recipe==='washer')params=id.endsWith('WASHER-A')?{outerDiameter:7.5,boreDiameter:4,thickness:1,gapWidth:0}:id.endsWith('WASHER-B')?{outerDiameter:8,boreDiameter:2.4,thickness:1.3,gapWidth:0}:{outerDiameter:6,boreDiameter:3.1,thickness:.8,gapWidth:.8};
 if(recipe==='rivet'){const code=id.split('-').at(-2);params={diameter:3,stemLength:rivetLengths[code],headDiameter:5,headHeight:1,pinDiameter:1.4,pinLength:rivetLengths[code]+2,pinLift:3};}
 if(recipe==='horn'&&id.endsWith('STEERING'))params.length=20;
 if(recipe==='wheel'){params.spokeCount=id.endsWith('FRONT')?10:5;sourceRefs.push('PX-M5-EV-WHEEL-FORUM');}
 const boardVariant=({'PX-V40-DEF-PI4':'rpi4','PX-V40-DEF-PI5':'rpi5','PX-V40-DEF-ZERO2W':'rpi-zero-2-w'})[id]??null;
 if(recipe==='board'){sourceRefs.push(boardVariant==='rpi4'?'PX-M5-EV-PI4-DRAWING':boardVariant==='rpi5'?'PX-M5-EV-PI5-DRAWING':'PX-M5-EV-ZERO2W-DRAWING');if(boardVariant==='rpi5')sourceRefs.push('PX-M5-EV-PI5-STEP-ZIP');if(boardVariant==='rpi-zero-2-w')Object.assign(params,{length:65,width:30,mountY:23,portHeight:4,headerHeight:8});}
 if(recipe==='camera')sourceRefs.push('PX-M5-EV-CAMERA');if(recipe==='ultrasonic')sourceRefs.push('PX-M5-EV-ULTRASONIC');if(recipe==='battery')sourceRefs.push('PX-M5-EV-BATTERY-V4');
 sourceRefs=[...new Set(sourceRefs)];
 const blockerIds=[...new Set([...scope.blockerIds,...(recipe==='schematic'?['Q-09']:[])])];
 const displayRequirements=['Show exact definition/role/designation label next to proxy','Show presentation-only approximation notice; use the original source panel for physical alignment','Do not use proxy dimensions to select a replacement part'];
 if(recipe==='camera')displayRequirements.push('Camera dimensions conflict remains OPEN; selected prose envelope is presentation-only');
 if(['board','hat'].includes(recipe))displayRequirements.push('Actual supplied revision/header/cooler configuration remains unestablished');
 if(recipe==='ultrasonic'||recipe==='hat')displayRequirements.push('Ultrasonic 5V versus V40 3V3 remains OPEN; no voltage decision');
 if(recipe==='servo'||recipe==='horn')displayRequirements.push('Role marking and accepted P11/zeroing procedure remain required; no spline or neutral metrology');
 if(id.includes('SERVO-RETAINER'))displayRequirements.push('Select the smallest supplied package retaining screw; visual size is not selection authority');
 const kinds={schematic:'schematic_flexible',abstract:'abstract_consumable',board:'documentation_supported_proxy'};
 const approximations=Object.entries(params).map(([name,value])=>{
  let basis='Authored visual estimate of functional proportions from uncalibrated V40 printed imagery; no metric image measurement',approximationKind='visualEstimate';
  if(((recipe==='screw'&&['diameter','length'].includes(name))||(recipe==='standoff'&&['extensionDiameter','length','extensionLength'].includes(name)))&&!id.includes('SERVO-RETAINER')){basis='Nominal instructional transcription of printed metric designation; no pitch/tolerance/standard/physical claim';approximationKind='designationNominal';}
  if(recipe==='board'&&['length','width','mountX','mountY','mountOffset'].includes(name)){basis='Transcribed applicable official drawing for instructional reference only; source limitations retained';approximationKind='sourceLimitedReference';}
  if(recipe==='camera'&&['length','width','lensHeight','thickness'].includes(name)){basis='Selected 25x23x9 approximate prose envelope for presentation; PCB/lens split is authored; conflicting specification remains OPEN';approximationKind='conflictedPresentationSelection';}
  if(recipe==='rivet')basis='Authored proportional illustration estimate, not parsed or inferred from opaque rivet code';
  return{name,value,unit:name==='spokeCount'?'count':'mm',basis,sourceRefs,approximationKind,visualPurpose:'Recognizable '+def.name+' presentation; no engineering alignment or dimensional authority',nonEngineering:true,blockerIds};
 });
 return {definitionId:id,track:'instructional-only',engineeringStatus:engineeringStatus(id),representationKind:kinds[recipe]??'photo_supported_proxy',recipe,boardVariant,
  semanticRole:['motor','servo','horn'].includes(recipe)?id.split('-').at(-1).toLowerCase():null,
  sourceRefs,sourceLimitations:[...new Set(sourceRefs.flatMap(id=>sources.find(s=>s.id===id).limitations))],canonicalUnknowns:canonicalUnknowns(id),instructionalApproximations:approximations,
  protectedFacts:protectedFacts(id),mustNotDrive,blockerIds,exactOEMIdentity:'UNRESOLVED',coordinateScope:'Presentation origin only; no engineering datum/axis/frame',
  expectedRigidSolids:({schematic:0,abstract:0,rivet:2,motor:3,hat:11,grayscale:5,board:boardVariant==='rpi-zero-2-w'?6:boardVariant==='rpi5'?8:7,connector:2})[recipe]??1,
  displayRequirements,rightsStatus:{artifact:'Newly authored analytic functional proxy; no copied artwork/image/vendor bytes',sourcePublicationAllowed:false,privatePhotoInAsset:false,sourceUse:'Local reference only; retain source-specific limits and SunFounder notices'},
  notes:['No engineering datum/interface/fit or manufacturing claim','Tiny details, materials, exact thread/pitch, internal mechanisms and unsupported metric interfaces omitted','Presentation anchors and all unproved feature geometry are replaceable without changing PartDefinition identity','All recipe subfeature offsets/proportional subdivisions are authored schematic presentation choices, not measured interfaces',...(recipe==='rivet'?['Body/pin are an exploded ownership illustration, not a certified insertion/locking pose']:[]),...(recipe==='board'?['Cooler omitted; header is a schematic location marker, not proof of installed configuration']:[]),...(recipe==='schematic'?['Zero-solid endpoint schematic; no metric route, pin map, slack or bend-radius certificate']:[]),...(recipe==='abstract'?['Zero-solid stock abstraction; no fabricated thickness/length/capacity']:[])]};
});
const doc={policyId:'PX-OWNER-INSTRUCTIONAL-20260930',track:'instructional-only',unit:'mm',basis:'RH-XFORWARD-YLEFT-ZUP',sources,definitions,
 integralLeads:r.cableDefinitions.filter(c=>c.ownership==='integral').map(c=>({ownerDefinitionId:c.partDefinitionId,track:'instructional-only',representationKind:'schematic_flexible',generatedRigidSolids:0,purchasedItemIncrement:0,canonicalCable:c})),
 publication:{privatePhotos:false,vendorBytes:false,runtimePack:false}};
const string={type:'string'},strings={type:'array',items:string,minItems:1};
const approximate={type:'object',additionalProperties:false,required:['name','value','unit','basis','sourceRefs','approximationKind','visualPurpose','nonEngineering','blockerIds'],properties:{name:string,value:{type:'number',minimum:0},unit:{enum:['mm','count']},basis:string,sourceRefs:strings,approximationKind:{enum:['visualEstimate','designationNominal','sourceLimitedReference','conflictedPresentationSelection']},visualPurpose:string,nonEngineering:{const:true},blockerIds:strings}};
const fields={definitionId:string,track:{const:'instructional-only'},engineeringStatus:{enum:['ENGINEERING_ADMITTED','PARTIAL','BLOCKED']},representationKind:{enum:['authoritative_vendor','nominal_standard_proxy','photo_supported_proxy','documentation_supported_proxy','simplified_visual_proxy','schematic_flexible','abstract_consumable']},recipe:{enum:Object.keys(recipes)},boardVariant:{enum:[null,'rpi4','rpi5','rpi-zero-2-w']},semanticRole:{type:['string','null']},sourceRefs:strings,sourceLimitations:strings,canonicalUnknowns:{type:'array',minItems:1},instructionalApproximations:{type:'array',items:approximate},protectedFacts:{type:'object'},mustNotDrive:strings,blockerIds:strings,exactOEMIdentity:{const:'UNRESOLVED'},coordinateScope:string,expectedRigidSolids:{type:'integer',minimum:0},displayRequirements:strings,rightsStatus:{type:'object'},notes:strings};
const sourceFields={id:string,path:string,rawSha256:{type:'string',pattern:'^[a-f0-9]{64}$'},bytes:{type:'integer',minimum:1},privacy:{enum:['publicSource','privateOwnerEvidence']},limitations:strings};
const top={policyId:{const:doc.policyId},track:{const:doc.track},unit:{const:doc.unit},basis:{const:doc.basis},sources:{type:'array',items:{type:'object',additionalProperties:false,required:Object.keys(sourceFields),properties:sourceFields}},definitions:{type:'array',minItems:50,maxItems:50,items:{type:'object',additionalProperties:false,required:Object.keys(fields),properties:fields}},integralLeads:{type:'array',minItems:6,maxItems:6},publication:{type:'object',additionalProperties:false,required:['privatePhotos','vendorBytes','runtimePack'],properties:{privatePhotos:{const:false},vendorBytes:{const:false},runtimePack:{const:false}}}};
for(const [name,value]of [['instructional-parameters.json',doc],['instructional-parameters.schema.json',{$schema:'https://json-schema.org/draft/2020-12/schema',type:'object',additionalProperties:false,required:Object.keys(top),properties:top}],['instructional-policy.json',{id:doc.policyId,gate:'G-INSTRUCTIONAL-COMPONENT',track:doc.track,strictGate:'G-COMPONENT',strictGateUnchanged:true,scopeDefinitions:50,integralLeadScopes:6,mustNotDrive,canonicalUnknownsMustRemainUnresolved:true,proxyAuthority:'Presentation only; never engineering solver/interface/measurement inputs',zeroTutorialCriticalBlockersRequired:true,sourcePublicationAuthorized:false,m6ConditionalOnly:true}]]){const p=path.join(base,name);if(fs.existsSync(p))throw Error('NO_OVERWRITE');fs.writeFileSync(p,JSON.stringify(value,null,2)+'\n');}
console.log({definitions:50,rigid:definitions.filter(d=>d.expectedRigidSolids>0).length,schematic:5,abstract:4,sources:sources.length});
