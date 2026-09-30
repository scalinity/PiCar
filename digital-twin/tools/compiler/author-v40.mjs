// Authoring transcription of the locked 29 panels, not a runtime lookup.
// Emits only the named graph families and source-backed interface additions.
import fs from 'node:fs';
import path from 'node:path';
import {loadRegistry,root,twin,validateShape} from '../evidence/semantic.mjs';
import {read,jcs} from '../evidence/hash.mjs';
const r=loadRegistry(), seed=read(path.join(twin,'components/inventory/planning-steps.json')).steps;
const variants=['rpi4','rpi5','rpi-zero-2-w'];
const iid=(name,n=1)=>`PX-V40-INS-${name}-${String(n).padStart(3,'0')}`;
const group=name=>`PX-V40-GROUP-${name}`;
const groups=['ROBOT','TRAY','BASE-ELECTRONICS','DRIVE-BASE','FRONT-BASE','PAN-TILT','CAMERA-C','STEERING-FRONT','G-HORN','CHASSIS-REAR-DRIVE','WIRING'];
const groupForStep=['BASE-ELECTRONICS','BASE-ELECTRONICS','BASE-ELECTRONICS','BASE-ELECTRONICS','DRIVE-BASE','DRIVE-BASE','DRIVE-BASE','FRONT-BASE','FRONT-BASE','FRONT-BASE','CAMERA-C','CAMERA-C','CAMERA-C','PAN-TILT','PAN-TILT','PAN-TILT','PAN-TILT','PAN-TILT','PAN-TILT','STEERING-FRONT','G-HORN','STEERING-FRONT','STEERING-FRONT','STEERING-FRONT','STEERING-FRONT','STEERING-FRONT','CHASSIS-REAR-DRIVE','WIRING','WIRING'];
const unresolved=(ids)=>({state:'unresolved',blockerIds:[...new Set(ids)]});
const no=(reason)=>({state:'notApplicable',reason});
const operations=new Map(), mechanical=new Map(), cables=new Map(), rules=new Map();
const put=(map,record)=>{if(map.has(record.id)&&!jcs(map.get(record.id)).equals(jcs(record)))throw Error('AUTHOR_ID_COLLISION: '+record.id);map.set(record.id,record);};
const byVariant={};
const board={rpi4:'PI4',rpi5:'PI5','rpi-zero-2-w':'ZERO2W'};
const major={1:['PLATE-A'],2:[],3:[],4:['ROBOT-HAT'],5:['MOTOR-LEFT','MOTOR-RIGHT'],6:['BATTERY'],7:[],8:['HORN-PAN'],9:['ULTRASONIC','PLATE-H'],10:[],11:['CAMERA'],12:['PLATE-C'],13:['HORN-TILT'],14:['PLATE-B','SERVO-PAN'],15:['SERVO-TILT'],16:[],17:[],18:[],19:[],20:['SERVO-STEERING'],21:['PLATE-G','HORN-STEERING'],22:[],23:['PLATE-D'],24:['GRAYSCALE'],25:['PLATE-E','PLATE-F'],26:[],27:[],28:['CABLE-4PIN','CABLE-5PIN'],29:[]};
function endpoint(target,feature,step){
 const i=r.instances.find(i=>i.id===target);if(!i)throw Error('AUTHOR_INSTANCE: '+target);
 const d=r.definitions.find(d=>d.id===i.definitionId);
 const id=d.id.replace('-DEF-','-IF-')+'-'+feature;
 if(!r.interfaces.some(x=>x.id===id)) {
  const blockers=d.blockerIds.length?d.blockerIds:seed[step-1].geometryBlockerIds;
  const record={id,definitionId:d.id,feature:feature.toLowerCase(),kind:'datum',frame:unresolved(blockers),measurementRefs:[],permittedDOF:[],matingRuleIds:[],toleranceRefs:[],evidenceRefs:[seed[step-1].evidenceRef],blockerIds:blockers};
  validateShape('MechanicalInterface',record);r.interfaces.push(record);d.interfaceRefs.push(id);
 }
 return {instanceId:target,interfaceId:id};
}
for(const variant of variants){
 const orderByStep=[];
 for(let n=1;n<=29;n++){
  const source=seed[n-1];let suffix=n<=4?board[variant]:(n===11||n===16?(variant==='rpi4'?'FFC':'FPC'):'COMMON');
  if(n===1&&variant!=='rpi-zero-2-w')suffix='PI45';
  const prefix=`PX-V40-OP-${String(n).padStart(2,'0')}-${suffix}`;
  const connectionPrefix=prefix.replace('-OP-','-CONN-');
  const ids=[],g=group(groupForStep[n-1]);
  const op=(label,kind,payload,targets=[],extra={})=>{
   const record={id:prefix+'-'+label,stepId:source.id,kind,payload,preconditionRuleIds:[],postconditionRuleIds:[],solutionRef:unresolved(source.geometryBlockerIds),inversePolicy:'restoreCapturedBeforeState',evidenceRefs:[source.evidenceRef],blockerIds:source.geometryBlockerIds,parentAssignments:targets.map(instanceId=>({instanceId,parentAssemblyId:g})),...extra};
   validateShape('AssemblyOperation',record);put(operations,record);ids.push(record.id);return record;
  };
  const conn=(label,ends,activation,joint='fixed',fasteners=[],stack=[])=>{
   const id=connectionPrefix+'-'+label,dof=joint==='revolute'?['rz']:[];
   const record={id,endpoints:ends,jointType:joint,constraints:[{id:id.replace('-CONN-','-CONSTRAINT-'),kind:joint==='revolute'?'revolute':'fixedFrame',endpointIndices:ends.map((_,i)=>i),parameterMeasurementRefs:[],remainingDOF:dof,evidenceRefs:[source.evidenceRef],blockerIds:source.geometryBlockerIds}],fastenerInstanceIds:fasteners,orderedContactStack:stack,allowedContactRuleIds:[],clearanceRuleIds:[],remainingDOF:dof,activationOperationId:activation,evidenceRefs:[source.evidenceRef],blockerIds:source.geometryBlockerIds};
   validateShape('MechanicalConnection',record);put(mechanical,record);return id;
  };
  const attach=(label,pairs,targets,joint='fixed',extra={})=>{
   const ends=pairs.map(([id,feature])=>endpoint(id,feature,n));const oid=prefix+'-'+label;
   const cid=conn(label,ends,oid,joint);
   return op(label,joint==='fixed'?'attachRigid':'attachJoint',joint==='fixed'?{connectionId:cid}:{connectionId:cid,jointCoordinates:[{connectionId:cid,dof:'rz',coordinate:{state:'unresolved',unit:'rad',confidence:'UNRESOLVED',blockerIds:source.geometryBlockerIds}}]},targets,extra);
  };
  const condition=(label,predicate,targets,dependencies=[])=>{
   const id=`PX-V40-RULE-${String(n).padStart(2,'0')}-${suffix}-${label}`;
   const record={id,predicate,predicateVersion:1,evaluationPhase:'physicalCommand',targetIds:targets,observability:{class:'notCameraObservable',requiredFeatureIds:[],requiredViews:[],calibrationRequired:false,eligibilityRuleIds:[],limitations:['User statement only; no sensed power, angle, electrical or geometry certification.']},evidenceRequirementIds:[source.evidenceRef],comparator:'allTrue',toleranceRef:no('Procedure condition; no numeric tolerance.'),onUnknown:'BLOCKED',onContradiction:'FAIL',humanAcknowledgment:'required',invalidationDependencyIds:[source.evidenceRef,...dependencies],expected:{kind:'boolean',value:true}};
   validateShape('VerificationRule',record);put(rules,record);return id;
  };
  const power=()=>op('POWER-OFF','acknowledgeProcedure',{conditionRuleId:condition('POWER-OFF','powerAcknowledgment',[iid('ROBOT-HAT')])});
  const connect=(label,owner,endpointLabel,target,point,purpose='permanent',disconnectLabel=null)=>{
   const id=connectionPrefix+'-'+label;const record={id,cableInstanceId:owner,endpointLabel,targetInstanceId:target,connectionPointId:point,pinMapping:unresolved(['Q-09',...(label.includes('ULTRASONIC')?['Q-08']:[])]),purpose,powerPrecondition:purpose==='temporaryZeroing'?'onForZeroing':'off',activationOperationId:prefix+'-'+label,deactivationOperationRef:disconnectLabel?{state:'known',ref:prefix+'-'+disconnectLabel}:no('Permanent connection remains active in final projection.'),routingState:'endpointConnected',evidenceRefs:[source.evidenceRef],blockerIds:[...new Set([...source.geometryBlockerIds,'Q-09'])]};
   validateShape('CableConnection',record);put(cables,record);op(label,'connectCableEnd',{cableConnectionId:id},[],{preconditionRuleIds:ids.map(id=>operations.get(id)).filter(o=>o.kind==='acknowledgeProcedure').map(o=>o.payload.conditionRuleId)});return id;
  };
  const hardware=[...new Set([...r.plannedUses.filter(u=>u.variantId===variant&&u.stepId===source.id).map(u=>u.instanceId),...r.allocations.filter(a=>a.variantId===variant&&a.stepId===source.id&&a.disposition==='plannedInstalled'&&r.fastenerDefinitions.some(d=>d.partDefinitionId===r.instances.find(i=>i.id===a.instanceId).definitionId)).map(a=>a.instanceId)])];
  const introduced=(major[n]??[]).map(name=>iid(name));
  if(n===2){introduced.push(iid(board[variant]));if(variant!=='rpi-zero-2-w')introduced.push(iid('USB-MICROPHONE'));}
  if(n===3)introduced.push(iid(variant==='rpi4'?'RIBBON-FFC':'RIBBON-FPC'));
  if(n===26)introduced.push(iid('WHEEL-FRONT',1),iid('WHEEL-FRONT',2));
  if(n===27)introduced.push(iid('WHEEL-REAR',1),iid('WHEEL-REAR',2));
  const stage=[...new Set([...introduced,...hardware])];
  if(stage.length)op('INTRODUCE','introduce',{instanceIds:stage,trayGroupId:group('TRAY')});
  const supports=n===1?hardware.filter(id=>id.includes('STANDOFF')):[];
  if(n===1)attach('SUPPORTS',[[iid('PLATE-A'),'REAR-DECK-SUPPORT-PATTERN'],...supports.map((id,i)=>[id,'LOWER-BEARING-'+String(i+1).padStart(2,'0')])],[iid('PLATE-A'),...supports]);
  if(n===2){
   const previous=r.plannedUses.filter(u=>u.variantId===variant&&u.stepId===seed[0].id&&u.instanceId.includes('STANDOFF')&&(variant!=='rpi-zero-2-w'||u.instanceId.includes('M25X11'))).map(u=>u.instanceId);
   attach('BOARD',[[iid(board[variant]),'MOUNT-PATTERN'],...previous.map(id=>[id,'UPPER-BEARING'])],[iid(board[variant])]);
   if(variant!=='rpi-zero-2-w')attach('MICROPHONE',[[iid('USB-MICROPHONE'),'USB-PLUG'],[iid(board[variant]),'USB-PORT']],[iid('USB-MICROPHONE')]);
  }
  if(n===3){power();connect('RIBBON-PI',iid(variant==='rpi4'?'RIBBON-FFC':'RIBBON-FPC'),`PX-V40-CP-RIBBON-${variant==='rpi4'?'FFC':'FPC'}-END-A`,iid(board[variant]),`PX-V40-CP-${board[variant]}-CONNECTOR`);}
  if(n===4){power();attach('HAT',[[iid('ROBOT-HAT'),'GPIO-AND-MOUNT'],[iid(board[variant]),'GPIO-HEADER']],[iid('ROBOT-HAT')]);}
  if(n===5)for(const role of ['LEFT','RIGHT'])attach('MOTOR-'+role,[[iid('MOTOR-'+role),'CHASSIS-MOUNT'],[iid('PLATE-A'),'MOTOR-'+role+'-MOUNT']],[iid('MOTOR-'+role)]);
  if(n===6)for(const material of ['HOOK','LOOP']){
   const piece=iid(material,2),a=r.allocations.find(a=>a.variantId===variant&&a.instanceId===piece);
   op('ALLOCATE-'+material,'allocateConsumable',{sourceLotId:a.sourceLotId,pieceInstanceId:piece,allocatedAmount:a.allocatedAmount});
   const target=iid(material==='HOOK'?'BATTERY':'PLATE-A'),label='APPLY-'+material;
   const cid=conn(label,[endpoint(piece,'ADHESIVE-SURFACE',n),endpoint(target,material+'-CONTACT-SURFACE',n)],prefix+'-'+label);
   op(label,'applyConsumable',{pieceInstanceId:piece,connectionId:cid},[piece]);
  }
  if(n===7){attach('BATTERY-MOUNT',[[iid('BATTERY'),'HOOK-CONTACT-SURFACE'],[iid('PLATE-A'),'LOOP-CONTACT-SURFACE']],[iid('BATTERY')]);power();connect('BATTERY',iid('BATTERY'),'PX-V40-CP-BATTERY-CONNECTOR',iid('ROBOT-HAT'),'PX-V40-CP-ROBOT-HAT-BATTERY');}
  const mounts={8:[['HORN-PAN','CHASSIS-MOUNT'],['PLATE-A','PAN-HORN-MOUNT']],9:[['ULTRASONIC','MOUNT-PATTERN'],['PLATE-A','ULTRASONIC-MOUNT'],['PLATE-H','BACKING-MOUNT']],10:[],12:[['CAMERA','MOUNT-PATTERN'],['PLATE-C','CAMERA-MOUNT']],13:[['HORN-TILT','PLATE-MOUNT'],['PLATE-C','TILT-HORN-MOUNT']],14:[['SERVO-PAN','MOUNT-TABS'],['PLATE-B','PAN-MOUNT']],15:[['SERVO-TILT','MOUNT-TABS'],['PLATE-B','TILT-MOUNT']],20:[['SERVO-STEERING','MOUNT-TABS'],['PLATE-A','STEERING-MOUNT']],23:[],24:[['GRAYSCALE','MOUNT-PATTERN'],['PLATE-D','GRAYSCALE-MOUNT']]};
  if(mounts[n]?.length)attach('MOUNT',mounts[n].map(([id,f])=>[iid(id),f]),mounts[n].filter(([id])=>!['PLATE-A','PLATE-B','PLATE-C','PLATE-D'].includes(id)||major[n].includes(id)).map(([id])=>iid(id)));
  if(n===10)attach('FRONT-SUPPORTS',[[iid('PLATE-A'),'FRONT-SUPPORT-PATTERN'],[iid('M3X26-STANDOFF',1),'UPPER-BEARING'],[iid('M3X26-STANDOFF',2),'UPPER-BEARING']],[iid('M3X26-STANDOFF',1),iid('M3X26-STANDOFF',2)]);
  if(n===11){power();connect('RIBBON-CAMERA',iid(variant==='rpi4'?'RIBBON-FFC':'RIBBON-FPC'),`PX-V40-CP-RIBBON-${variant==='rpi4'?'FFC':'FPC'}-END-B`,iid('CAMERA'),'PX-V40-CP-CAMERA-CONNECTOR');}
  if(n===16)op('RIBBON-GAP','routeCable',{cableInstanceId:iid(variant==='rpi4'?'RIBBON-FFC':'RIBBON-FPC'),representation:'schematic',guideEndpoints:[endpoint(iid('PLATE-B'),'PAN-TILT-GIMBAL-GAP',n)]});
  if(n===17)op('PRINTED-ZERO-PROCEDURE','acknowledgeProcedure',{conditionRuleId:condition('POWER-ZERO-P11','powerAcknowledgment',[iid('ROBOT-HAT')])});
  if(n===21)attach('G-HORN-PIVOT',[[iid('PLATE-G'),'CENTER-PIVOT'],[iid('HORN-STEERING'),'OFFSET-PIVOT']],[iid('PLATE-G'),iid('HORN-STEERING')],'revolute');
  if(n===23)attach('PLATE-D',[[iid('PLATE-D'),'SUPPORT-MOUNT-PATTERN'],[iid('M3X26-STANDOFF',1),'LOWER-BEARING'],[iid('M3X26-STANDOFF',2),'LOWER-BEARING']],[iid('PLATE-D')]);
  if([18,19,22].includes(n)){
   op('ZERO-PROCEDURE','acknowledgeProcedure',{conditionRuleId:condition('ZERO-PROCEDURE','powerAcknowledgment',[iid('ROBOT-HAT')])});
   const role={18:'TILT',19:'PAN',22:'STEERING'}[n],servo=iid('SERVO-'+role),horn=iid('HORN-'+role),attachment=prefix+'-SPLINE';
   const c=connect('P11-'+role,servo,`PX-V40-CP-SERVO-${role}-CONNECTOR`,iid('ROBOT-HAT'),'PX-V40-CP-ROBOT-HAT-P11','temporaryZeroing','P11-DISCONNECT');
   op('ZERO-'+role,'confirmZeroing',{servoInstanceId:servo,conditionRuleId:condition('ZERO-'+role,'zeroingAcknowledgment',[servo],[attachment]),validForOperationId:attachment});
   if(n===18||n===22)op('MOVE-GROUP','moveSubassembly',{assemblyId:group(n===18?'CAMERA-C':'G-HORN')});
   if(n===19)op('MOVE-GROUP','moveSubassembly',{assemblyId:group('PAN-TILT')});
   attach('SPLINE',[[horn,'OUTPUT-SPLINE'],[servo,'OUTPUT-SPLINE']],[],'fixed',{preconditionRuleIds:[...rules.values()].filter(r=>r.predicate==='zeroingAcknowledgment'&&r.invalidationDependencyIds.includes(attachment)).map(r=>r.id).concat(ids.map(id=>operations.get(id)).filter(o=>o.kind==='acknowledgeProcedure').map(o=>o.payload.conditionRuleId))});
   op('P11-DISCONNECT','disconnectCableEnd',{cableConnectionId:c});
  }
  if(n===27)for(const [side,idx] of [['LEFT',1],['RIGHT',2]])attach('REAR-WHEEL-'+side,[[iid('WHEEL-REAR',idx),'DRIVE-BORE'],[iid('MOTOR-'+side),'OUTPUT-SHAFT']],[iid('WHEEL-REAR',idx)]);
  if(n===28){power();for(const [type,module] of [['4PIN','ULTRASONIC'],['5PIN','GRAYSCALE']])connect(module+'-SENSOR',iid('CABLE-'+type),`PX-V40-CP-CABLE-${type}-END-A`,iid(module),`PX-V40-CP-${module}-CONNECTOR`);}
  if(n===29){power();for(const [role,port] of [['PAN','P0'],['TILT','P1'],['STEERING','P2']])connect(role+'-FINAL',iid('SERVO-'+role),`PX-V40-CP-SERVO-${role}-CONNECTOR`,iid('ROBOT-HAT'),`PX-V40-CP-ROBOT-HAT-${port}`);
   for(const [role,port] of [['LEFT','MOTOR1'],['RIGHT','MOTOR2']])connect(role+'-FINAL',iid('MOTOR-'+role),`PX-V40-CP-MOTOR-${role}-CONNECTOR`,iid('ROBOT-HAT'),`PX-V40-CP-ROBOT-HAT-${port}`);
   for(const [type,module] of [['4PIN','ULTRASONIC'],['5PIN','GRAYSCALE']])connect(module+'-FINAL',iid('CABLE-'+type),`PX-V40-CP-CABLE-${type}-END-B`,iid('ROBOT-HAT'),`PX-V40-CP-ROBOT-HAT-${module}`);
  }
  // Each purchased hardware instance has an independent authored operation.
  // Rivet body/pin are owned elements, never extra stock.
  if(n===26)for(let index=1;index<=6;index++)op('BACKING-'+index,'removeOwnedBacking',{instanceId:iid('WASHER-B',index),elementId:'PX-V40-EL-WASHER-B-BACKING',disposition:'consumedOrDiscarded'});
  for(const target of hardware){
   const inst=r.instances.find(i=>i.id===target),d=r.fastenerDefinitions.find(d=>d.partDefinitionId===inst.definitionId);
   const label='HARDWARE-'+target.replace('PX-V40-INS-',''), ends=[endpoint(target,'BEARING-OR-GRIP',n)];
   let participants=[];let joint='fixed';
   if(n===1)participants=[[iid('PLATE-A'),'REAR-DECK-SUPPORT-PATTERN'],[target.includes('STANDOFF')?target:supports[Number(target.slice(-3))-1],'LOWER-BEARING']];
   if(n===2){const index=Number(target.slice(-3));const support=iid(variant==='rpi-zero-2-w'?'M25X11-STANDOFF':'M25X18PLUS6-STANDOFF',index);participants=[[iid(board[variant]),'MOUNT-PATTERN'],[support,'UPPER-BEARING']];}
   if(n===4){const index=Number(target.slice(-3))-5;const support=variant==='rpi-zero-2-w'?[iid('M25X30-STANDOFF',1),iid('M25X30-STANDOFF',2),iid('M25X18PLUS6-STANDOFF',1),iid('M25X18PLUS6-STANDOFF',2)][index]:iid('M25X18-STANDOFF',index+1);participants=[[iid('ROBOT-HAT'),'GPIO-AND-MOUNT'],[support,'UPPER-BEARING']];}
   if(n===5){const index=Number(target.slice(-3));const side=index<=2?'LEFT':'RIGHT';participants=[[iid('M3X25-SCREW',index),'BEARING-OR-GRIP'],[iid('PLATE-A'),'MOTOR-'+side+'-MOUNT'],[iid('MOTOR-'+side),'CHASSIS-MOUNT'],[iid('SPRING-WASHER',index),'BEARING-OR-GRIP'],[iid('M3-NUT',index),'BEARING-OR-GRIP']];}
   if(mounts[n]?.length)participants=mounts[n].map(([id,f])=>[iid(id),f]);
   if(n===10)participants=[[iid('PLATE-A'),'FRONT-SUPPORT-PATTERN'],[iid('M3X26-STANDOFF',Number(target.slice(-3))<=2?Number(target.slice(-3)):1),'UPPER-BEARING']];
   if(n===18)participants=[[iid('HORN-TILT'),'OUTPUT-SPLINE'],[iid('SERVO-TILT'),'OUTPUT-SPLINE']];
   if(n===19)participants=[[iid('HORN-PAN'),'OUTPUT-SPLINE'],[iid('WASHER-A',1),'PAN-RETAINER-BEARING'],[iid('SERVO-PAN'),'OUTPUT-SPLINE']];
   if(n===21){participants=[[iid('PLATE-G'),'CENTER-PIVOT'],[iid('HORN-STEERING'),'OFFSET-PIVOT']];joint='revolute';}
   if(n===22)participants=[[iid('HORN-STEERING'),'OUTPUT-SPLINE'],[iid('SERVO-STEERING'),'OUTPUT-SPLINE']];
   if(n===23)participants=[[iid('PLATE-D'),'SUPPORT-MOUNT-PATTERN'],[iid('M3X26-STANDOFF',Number(target.slice(-3))-2),'LOWER-BEARING']];
   if(n===25){const index=Number(target.slice(-3)),side=index<=3?'RIGHT':'LEFT',carrier=iid(side==='RIGHT'?'PLATE-E':'PLATE-F');const base=['PLATE-A','PLATE-D','PLATE-G'][(index-1)%3];participants=[[carrier,side+'-'+base+'-PIVOT'],[iid(base),side+'-CARRIER-PIVOT']];joint='revolute';}
   if(n===26){
    if(d.category==='washer')continue;
    const index=Number(target.slice(-3)),carrier=iid(index===1?'PLATE-E':'PLATE-F');
    participants=[[iid('WHEEL-FRONT',index),'AXLE-BORE'],...Array.from({length:3},(_,i)=>[iid('WASHER-B',(index-1)*3+i+1),'WHEEL-SPACER']),[carrier,'WHEEL-AXLE']];joint='revolute';
   }
   ends.push(...participants.map(([id,f])=>endpoint(id,f,n)).filter(e=>!ends.some(x=>x.instanceId===e.instanceId&&x.interfaceId===e.interfaceId)));
   if(ends.length<2)throw Error('MISSING_SOURCE_CONNECTION: '+target);
   const stack=n===5?participants.map(([id,f])=>endpoint(id,f,n)):ends;
   const cid=conn(label,ends,prefix+'-'+label,joint,[target],stack);
   if(d.category==='pushRivet'){
    const def=r.definitions.find(d=>d.id===inst.definitionId),body=def.ownedElements.find(e=>e.kind==='rigidBody'),pin=def.ownedElements.find(e=>e.kind==='movingBody');
    const targets=[target,...(n===25?[participants[0][0]]:n===26?participants.slice(0,-1).map(([id])=>id):[])];
    op(label,'insertRivet',{rivetInstanceId:target,bodyElementId:body.id,connectionId:cid},targets);
    op(label+'-LOCK','lockRivet',{rivetInstanceId:target,pinElementId:pin.id,connectionId:cid});
   }else op(label,'installFastener',{fastenerInstanceId:target,connectionId:cid,orderedContactStack:stack},[target]);
  }
  if([12,13,14,15,21].includes(n)){
   const label=n===12||n===13?'CAMERA-C':n===21?'G-HORN':'PAN-TILT';
   const members={12:[iid('CAMERA'),iid('PLATE-C')],13:[iid('HORN-TILT')],14:[iid('PLATE-B'),iid('SERVO-PAN')],15:[iid('SERVO-TILT')],21:[iid('PLATE-G'),iid('HORN-STEERING')]}[n];
   op('GROUP','groupSubassembly',{assemblyId:group(label),memberInstanceIds:members},[],{parentAssignments:members.map(instanceId=>({instanceId,parentAssemblyId:group(label)}))});
  }
  orderByStep.push(ids);
 }
 byVariant[variant]=orderByStep;
}
const orientationWarnings=seed.map(s=>({id:'PX-V40-WARN-STEP-'+String(s.printedNumber).padStart(2,'0'),severity:'caution',text:s.orientation,evidenceRefs:[s.evidenceRef],operationIds:[],variantIds:variants,triggerRuleIds:[],acknowledgmentRequired:false,blocks:['metricMotion','certification'],blockerIds:s.geometryBlockerIds}));
const headerWarning={id:'PX-V40-WARN-ZERO2W-HEADER',severity:'critical',text:'Zero2W GPIO header readiness and supplied microphone compatibility remain unresolved under Q-14. No header or adapter installation is inferred; reference projection does not authorize physical electrical completion.',evidenceRefs:[seed[3].evidenceRef],operationIds:[],variantIds:['rpi-zero-2-w'],triggerRuleIds:[],acknowledgmentRequired:false,blocks:['physicalCompletion','certification'],blockerIds:['Q-14']};
for(const w of [...orientationWarnings,headerWarning]){validateShape('Warning',w);const i=r.warnings.findIndex(x=>x.id===w.id);if(i<0)r.warnings.push(w);else r.warnings[i]=w;}
const patches=[],steps=seed.map((s,i)=>({id:s.id,printedNumber:s.printedNumber,title:s.title,revision:'Z0104V40',sourceRefs:[s.evidenceRef],sourcePanel:s.sourcePanel,variantIds:variants,variantPatchRefs:[],prerequisites:s.prerequisites,operationIds:byVariant.rpi4[i],introducedInstanceIds:[],usedInstanceIds:[],toolRequirementIds:r.tools.filter(t=>s.tools.toLowerCase().includes(t.category)).map(t=>t.id),warningIds:[orientationWarnings[i].id,...(i===3?[headerWarning.id]:[]),...(i>=27?['PX-V40-WARN-ELECTRICAL-CONFLICT']:[])],zeroingConditionIds:[],motionInstructionIds:[],cameraInstructionIds:[],verificationRuleIds:[],referenceLinks:['docs/digital-twin/V40_ASSEMBLY_LEDGER.md#'+String(i+1).padStart(2,'0')],blockerIds:s.geometryBlockerIds}));
const stagedBy=ids=>ids.map(id=>operations.get(id)).filter(o=>o.kind==='introduce').flatMap(o=>o.payload.instanceIds);
for(const variant of variants.slice(1))for(let i=0;i<29;i++)if(!jcs(byVariant[variant][i]).equals(jcs(byVariant.rpi4[i]))){const base=stagedBy(byVariant.rpi4[i]),selected=stagedBy(byVariant[variant][i]);const patch={id:`PX-V40-PATCH-${board[variant]}-${String(i+1).padStart(2,'0')}`,variantId:variant,stepId:seed[i].id,replaceOperationIds:byVariant.rpi4[i],withOperationIds:byVariant[variant][i],activeInstanceIds:selected.filter(id=>!base.includes(id)),inactiveInstanceIds:base.filter(id=>!selected.includes(id)),connectionIds:[...mechanical.values(),...cables.values()].filter(c=>byVariant[variant][i].includes(c.activationOperationId)).map(c=>c.id)};validateShape('VariantPatch',patch);patches.push(patch);steps[i].variantPatchRefs.push(patch.id);}
const write=(p,v)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),JSON.stringify(v,null,2)+'\n');};
const records={steps,operations:[...operations.values()],mechanicalConnections:[...mechanical.values()],cableConnections:[...cables.values()],patches,verificationRules:[...rules.values()],groups:groups.map(name=>({assemblyId:group(name),parentAssemblyId:name==='ROBOT'||name==='TRAY'?null:group(name==='CAMERA-C'?'PAN-TILT':name==='G-HORN'?'STEERING-FRONT':'ROBOT'),memberInstanceIds:[],solutionRef:unresolved(['Q-03'])})),sourceSeed:seed};
for(const [family,p] of [['steps','steps/base.json'],['operations','operations/operations.json'],['mechanicalConnections','connections/mechanical.json'],['cableConnections','connections/cables.json'],['patches','variants/patches.json'],['verificationRules','operations/verification-rules.json'],['groups','operations/groups.json'],['sourceSeed','steps/source-intents.json']])write('digital-twin/assemblies/v40/'+p,records[family]);
for(const d of r.definitions)d.interfaceRefs.sort();r.interfaces.sort((a,b)=>a.id.localeCompare(b.id));
write('digital-twin/components/definitions/parts.json',r.definitions);write('digital-twin/components/interfaces/mechanical.json',r.interfaces);
write('digital-twin/evidence/records/warnings.json',r.warnings);
console.log('Authored '+operations.size+' operations; '+mechanical.size+' mechanical connections; '+cables.size+' cable-end records; '+patches.length+' patches. Not a gate PASS.');
