// Deterministic ingestion of audited M0 source data. Does not observe owner stock.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';
import { read, fileHash, rawHash } from './hash.mjs';
const repo = new URL('../../../', import.meta.url).pathname;
process.chdir(repo);
const spec='docs/digital-twin/MACHINE_READABLE_SCHEMAS/';
const variants=['rpi4','rpi5','rpi-zero-2-w'];
const write=(p,v)=>{fs.mkdirSync(dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
const unknown=(q,unit)=>({state:'unresolved',...(unit?{unit,confidence:'UNRESOLVED'}:{}),blockerIds:[q]});
const na=reason=>({state:'notApplicable',reason});
const known=ref=>({state:'known',ref});
const artifact=p=>({state:'available',path:p,sha256:fileHash(p),byteLength:fs.statSync(p).size,mediaType:p.endsWith('.pdf')?'application/pdf':p.endsWith('.jpeg')?'image/jpeg':'application/json'});
const confidenceValue=(value,unit,ev)=>({state:'known',value,unit,confidence:'VERIFIED',evidenceRefs:[ev],uncertainty:{state:'bounded',minus:0,plus:0}});
const lock=read('picarx-companion/tools/content-pipeline/documentation-source-lock.json');
const allocation=read('docs/implementation/evidence/m0/spec-allocation.json');
const seed=read(spec+'v40-step-seed.json');
const ledger=read(spec+'printed-hardware-ledger.json');
const arrays={evidence:[],claims:[],definitions:[],instances:[],measurements:[],interfaces:[],connectionPoints:[],fastenerDefinitions:[],cableDefinitions:[],derivations:[],conflicts:[],geometrySources:[],frames:[],tools:[],warnings:[],variants:[],unresolvedItems:[],verificationRules:[],lots:[],allocations:[]};
const ev=(id,title,kind,tier,p,app,limitations,extra={})=>({id,sourceKind:kind,tier,title,revision:'Z0104V40',retrievedOn:'2026-09-29',locator:{file:p},artifact:artifact(p),applicability:app,engineeringUse:'referenceOnly',limitations,privacy:'publicSource',redistribution:'unresolved',conflictIds:[],supersedes:[],...extra});
for(let i=1;i<=6;i++){
 const id=`PX-EV-PHOTO-0${i}`;const src=allocation.files.find(f=>f.private&&f.source.startsWith(`EVIDENCE/originals/0${i}_`));
 arrays.evidence.push(ev(id,`Owner photograph ${i} of packaging/printed instructions`,'ownerPhoto',1,src.destination,['Z0104V40','printedDesignation','printedInventory','procedure'],['Uncalibrated photograph of printed imagery, not loose physical stock or measured geometry.'],{privacy:'private',redistribution:'privateUseOnly'}));
}
arrays.evidence.push(ev('PX-EV-V40-PDF','M0 byte-verified V40 assembly manual','officialManual',2,'picarx-companion/public/content/pdf/picar-x-assembly.pdf',['Z0104V40','printedDesignation','printedInventory','procedure'],['Instructional illustrations are not dimensioned manufacturing drawings.'],{gitBlobSha1:lock.pdfGitBlob}));
arrays.evidence.push(ev('PX-EV-M0-SOURCE-LOCK','Accepted M0 panel mapping and source identity','repositoryFile',2,'picarx-companion/tools/content-pipeline/documentation-source-lock.json',['Z0104V40','procedure'],['Documentary correspondence only. No physical hardware certification.']));
for(const [id,name] of [['CAMERA','cpn_camera'],['ULTRASONIC','cpn_ultrasonic'],['HAT','cpn_robot_hat']]){
 const path=`picarx-companion/src/content/pages/hardware/${name}.json`;
 arrays.evidence.push(ev('PX-EV-DOC-'+id,`Pinned companion ${id} documentation`,'officialDocumentation',3,path,['documentaryTranscription','referenceApproximation'],['Generic documentation does not establish supplied V40 component identity.'],{revision:'repository '+lock.repositoryHead}));
}
const sourceRegister=read(spec+'source-register.json');
for(const s of sourceRegister.externalSources){arrays.evidence.push({id:'PX-EV-'+s.id,sourceKind:'officialDocumentation',tier:9,title:s.title,revision:'audited snapshot 2026-09-29',retrievedOn:'2026-09-29',locator:{url:s.url},artifact:unknown(s.id==='W15'||s.id==='W14'||s.id==='W16'?'Q-10':'Q-15'),applicability:['candidateOnly'],engineeringUse:'referenceOnly',limitations:[s.scope,'Located/audited reference only; original source bytes unavailable in M1.'],privacy:'publicSource',redistribution:'unresolved',conflictIds:[],supersedes:[]});}
const claim=(id,subject,property,statement,evs,q=[],scope='printedDesignation',confidence='VERIFIED')=>{
 const limitations=[...new Set(evs.flatMap(e=>arrays.evidence.find(x=>x.id===e)?.limitations??[]))];
 const c={id,subjectId:subject,property,statement,confidence,evidenceRefs:evs,inputClaimIds:[],method:'Scoped transcription of source at retained locator',assumptions:[],scope,sourceLimitations:limitations,conflictIds:[],blockerIds:q,supersedes:[]}; arrays.claims.push(c);return c;
};
function part(key,name,cls,q,variantIds=variants,ev='PX-EV-PHOTO-03',scope='printedDesignation'){
 const id='PX-V40-DEF-'+key,cid='PX-CLAIM-'+key+'-DESIGNATION';
 claim(cid,id,'printedDesignation',`Printed role/designation: ${name}. Does not establish OEM identity, exact geometry or actual inventory.`,[ev],[],scope);
 const d={id,revision:1,name,componentClass:cls,identityClaimId:cid,quantityUnit:cls==='consumable'?'mm':'count',variantIds,geometrySourceRefs:[],measurementRefs:[],interfaceRefs:[],connectionPointRefs:[],ownedElements:[],appearanceRefs:[],blockerIds:[...q]};arrays.definitions.push(d);
 const lid='PX-V40-LOT-'+key;arrays.lots.push({id:lid,definitionId:id,scope:'printedPlanning',quantity:unknown('Q-13',cls==='consumable'?'mm':'count'),evidenceRefs:[ev],blockerIds:['Q-13']});return d;
}
function instance(d,i,role,origin='kit',disposition='available'){
 const id=d.id.replace('-DEF-','-INS-')+'-'+String(i).padStart(3,'0');const r={id,definitionId:d.id,definitionRevision:1,role,supplyOrigin:origin,inventoryLotId:d.id.replace('-DEF-','-LOT-'),variantIds:d.variantIds,disposition,ownerInstanceRef:na('Standalone planned stock; owned elements stay within the parent definition.'),installedByOperationRef:na('M1 authoring inventory; no M2 operation authored.'),blockerIds:[...new Set([...d.blockerIds,'Q-01','Q-13'])]};arrays.instances.push(r);return r;
}
function measurement(d,feature,value,q,inputClaims,kind='nominal'){
 const id=d.id.replace('-DEF-','-MEAS-')+'-'+feature.toUpperCase().replaceAll('.','-');
 const m={id,subjectId:d.id,feature,kind,value,originalNotation:kind==='derived'?'primary + backup':feature,method:kind==='derived'?'Sum of source-scoped printed depiction counts':'Transcribed count or explicit absence of measured geometry',datumRef:na('Count or unresolved geometry has no known metrology datum.'),sourceTolerance:unknown(q),measurementUncertainty:unknown(q),modelDeviationBudget:unknown(q,value.unit),inputClaimIds:inputClaims,blockerIds:value.state==='unresolved'?[q]:[]};arrays.measurements.push(m);d.measurementRefs.push(id);return m;
}
const slug=name=>name.toUpperCase().replace(/\+/g,'PLUS').replace(/\./g,'').replace(/[^A-Z0-9]+/g,'-');
const hardwareRows=[];
for(const row of ledger.rows){
 const key=slug(row.designation);const cls=row.designation.includes('screw')?'screw':row.designation.includes('standoff')?'standoff':row.designation.includes('rivet')?'rivet':row.designation.includes('nut')?'nut':'washer';
 const d=part(key,row.designation,cls,['Q-06']);
 if(cls==='rivet')for(const [element,kind] of [['BODY','rigidBody'],['PIN','movingBody']])d.ownedElements.push({id:'PX-V40-EL-'+key+'-'+element,name:element.toLowerCase(),kind,independentlyAddressable:true,inventoryCountedSeparately:false});
 if(row.designation==='Washer B')d.ownedElements.push({id:'PX-V40-EL-WASHER-B-BACKING',name:'Protective paper',kind:'removableBacking',independentlyAddressable:true,inventoryCountedSeparately:false});
 const cid='PX-CLAIM-'+key+'-PRINTED-STOCK';claim(cid,d.id,'printedInventory',`Source-scoped printed primary ${row.printedPrimary}; backup ${row.printedBackup}; total ${row.printedTotal}. Not observed owner stock.`,['PX-EV-PHOTO-03'],[],'printedInventory');
 const primary=measurement(d,'stock.printed-primary',confidenceValue(row.printedPrimary,'count','PX-EV-PHOTO-03'),'Q-13',[cid]);
 const backup=measurement(d,'stock.printed-backup',confidenceValue(row.printedBackup,'count','PX-EV-PHOTO-03'),'Q-13',[cid]);
 const derivId='PX-DERIV-'+key+'-PRINTED-TOTAL';const total=measurement(d,'stock.printed-total',{...confidenceValue(row.printedTotal,'count','PX-EV-PHOTO-03'),confidence:'DERIVED',derivationRef:derivId},'Q-13',[cid],'derived');
 arrays.derivations.push({id:derivId,subjectId:d.id,feature:total.feature,inputClaimIds:[cid],inputMeasurementIds:[primary.id,backup.id],method:'sum-v1',methodArtifact:artifact('digital-twin/tools/evidence/sum-v1.json'),outputMeasurementId:total.id,uncertaintyMethod:'worst-case interval sum; no independence assumption',assumptions:[],sourceLimitations:arrays.claims.find(c=>c.id===cid).sourceLimitations,blockerIds:[]});
 measurement(d,'geometry.length',unknown('Q-06','mm'),'Q-06',[d.identityClaimId]);
 const lot=arrays.lots.find(l=>l.definitionId===d.id);lot.quantity=total.value;
 const ids=[];for(let i=1;i<=row.printedTotal;i++)ids.push(instance(d,i,'printed-stock-'+i,'kit',i>row.printedPrimary?'backup':'available').id);
 const planned={};for(const v of variants){let steps;
 if(row.designation==='M2.5x18+6 standoff')steps=v==='rpi-zero-2-w'?[[2,2]]:[[1,4]];
 else if(row.designation==='M2.5x18 standoff')steps=v==='rpi-zero-2-w'?[]:[[2,4]];
 else if(['M2.5x11 standoff','M2.5x30 standoff'].includes(row.designation))steps=v==='rpi-zero-2-w'?[[1,2]]:[];
 else steps=[...row.stepUse.matchAll(/S(\d+)×(\d+)/g)].map(m=>[+m[1],+m[2]]);
 planned[v]=[];for(const [n,c]of steps)for(let j=0;j<c;j++){const id=ids[planned[v].length];planned[v].push({instanceId:id,stepId:'PX-V40-STEP-'+String(n).padStart(2,'0'),useId:'PX-V40-USE-'+key+'-'+v.toUpperCase().replaceAll('-','')+'-'+String(planned[v].length+1).padStart(3,'0')});}
 for(let i=0;i<ids.length;i++)arrays.allocations.push({instanceId:ids[i],variantId:v,disposition:i>=row.printedPrimary?'backup':i<row.plannedUse[v]?'plannedInstalled':'variantUnused',stepId:planned[v][i]?.stepId??null,useId:planned[v][i]?.useId??null});
 }
 hardwareRows.push({...row,definitionId:d.id,instanceIds:ids,plannedAllocations:planned,observedPhysicalStock:unknown('Q-13','count')});
}
const specs=[];
for(const letter of 'ABCDEFGH')specs.push(['PLATE-'+letter,'Plate '+letter,'plate',['Q-03'],1]);
for(const side of ['LEFT','RIGHT'])specs.push(['MOTOR-'+side,`TT Motor ${side.toLowerCase()} role`,'motor',['Q-04'],1]);
for(const role of ['PAN','TILT','STEERING']){
 specs.push(['SERVO-'+role,`Servo ${role.toLowerCase()} role; OEM equivalence unresolved`,'servo',['Q-05'],1]);
 specs.push(['HORN-'+role,`Horn ${role.toLowerCase()} role`,'horn',['Q-05'],1]);
 specs.push(['SERVO-RETAINER-'+role,`Smallest package retaining screw for ${role.toLowerCase()}`,'screw',['Q-05','Q-06'],1]);
}
for(const role of ['FRONT','REAR'])specs.push(['WHEEL-'+role,role.toLowerCase()+' wheel','wheel',['Q-12'],2]);
specs.push(['BATTERY','Battery','battery',['Q-11'],1],['ROBOT-HAT','Robot HAT revision unresolved','robotHat',['Q-07'],1],['CAMERA','Camera module','camera',['Q-08'],1],['ULTRASONIC','Ultrasonic module','ultrasonic',['Q-08'],1],['GRAYSCALE','Grayscale module','grayscale',['Q-08'],1],['CABLE-4PIN','4-pin wire assembly','cable',['Q-09','Q-13'],1],['CABLE-5PIN','5-pin wire assembly','cable',['Q-09','Q-13'],1],['RIBBON-FPC','FPC camera ribbon','cable',['Q-09','Q-13'],1],['RIBBON-FFC','FFC camera ribbon','cable',['Q-09','Q-13'],1],['USB-CABLE','USB-C cable','cable',['Q-09','Q-13'],1],['USB-MICROPHONE','USB mini microphone accessory','connector',['Q-14'],1],['WRENCH','Wrench','tool',['Q-06'],1],['SCREWDRIVER-01','First depicted screwdriver','tool',['Q-06'],1],['SCREWDRIVER-02','Second depicted screwdriver','tool',['Q-06'],1]);
for(const [key,name,cls,q,n]of specs){
 const vs=key==='RIBBON-FPC'?['rpi5','rpi-zero-2-w']:key==='RIBBON-FFC'?['rpi4']:variants;
 const d=part(key,name,cls,q,vs);
 if(['servo','motor','battery'].includes(cls))d.ownedElements.push({id:'PX-V40-EL-'+key+'-LEAD',name:'Integrated lead; no separately supplied stock',kind:'integralLead',independentlyAddressable:true,inventoryCountedSeparately:false});
 const supplied=['USB-CABLE','WRENCH','SCREWDRIVER-01','SCREWDRIVER-02'].includes(key)?(cls==='tool'?'tool':'accessory'):'available';
 for(let i=1;i<=n;i++){
 const ins=instance(d,i,name,cls==='tool'?'tool':'kit',supplied);
 for(const v of variants)arrays.allocations.push({instanceId:ins.id,variantId:v,disposition:!vs.includes(v)?'variantUnused':key==='USB-MICROPHONE'&&v==='rpi-zero-2-w'?'accessory':supplied==='available'?'plannedInstalled':supplied,stepId:null,useId:null});
 }
}
for(const [v,key,name]of [['rpi4','PI4','Raspberry Pi4'],['rpi5','PI5','Raspberry Pi5'],['rpi-zero-2-w','ZERO2W','Raspberry Pi Zero2W']]){
 const d=part(key,`${name}; user-supplied revision/header/cooler unresolved`,'piBoard',['Q-10'],[v],'PX-EV-PHOTO-04');const ins=instance(d,1,'selected user board','user');
 for(const variantId of variants)arrays.allocations.push({instanceId:ins.id,variantId,disposition:v===variantId?'plannedInstalled':'variantUnused',stepId:null,useId:null});
 arrays.variants.push({id:'PX-V40-VARIANT-'+key,variantId:v,boardIdentityClaimIds:[d.identityClaimId],patches:[],applicabilityRuleIds:[],forbiddenCombinationRuleIds:[],migrationPolicy:'forkWithoutPhysicalConfirmations',blockerIds:['Q-10',...(v==='rpi-zero-2-w'?['Q-14']:[])]});
}
for(const [key,name]of [['HOOK','Hook tape stock'],['LOOP','Loop tape stock'],['ELECTRICAL-TAPE','Electrical tape stock'],['CABLE-WRAP','Cable wrap stock']]){
 const d=part(key,name,'consumable',['Q-11','Q-13']);
 const ins=instance(d,1,'source lot identity, length unknown','consumable','accessory');
 for(const v of variants)arrays.allocations.push({instanceId:ins.id,variantId:v,disposition:'consumable',stepId:null,useId:null});
 if(['HOOK','LOOP'].includes(key)){const piece=instance(d,2,'preallocated S06 cut piece; amount unknown','consumable');for(const v of variants)arrays.allocations.push({instanceId:piece.id,variantId:v,disposition:'plannedInstalled',stepId:'PX-V40-STEP-06',useId:null,sourceLotId:ins.inventoryLotId,allocatedAmount:unknown('Q-11','mm')});}
}
// One explicit unresolved record per ambiguous package/cable depiction family.
const unresolvedAllocations=['SERVO-PACKAGE-SPARE-HORNS','SERVO-PACKAGE-SPARE-SCREWS','REPEATED-4PIN-VIEWS','REPEATED-5PIN-VIEWS','REPEATED-RIBBON-VIEWS'].map(k=>({id:'PX-V40-UNALLOC-'+k,scope:'printedPlanning',quantity:unknown('Q-13','count'),evidenceRefs:['PX-EV-PHOTO-03'],reason:'Audited Q-13: illustration/package multiplicity is unproven; no additional physical instances invented.'}));
for(const d of arrays.definitions){
 const key=d.id.slice('PX-V40-DEF-'.length),q=d.blockerIds[0];
 if(!d.measurementRefs.some(id=>id.endsWith('GEOMETRY-LENGTH')))measurement(d,'geometry.length',unknown(q,'mm'),q,[d.identityClaimId]);
 const feature=d.componentClass==='servo'?'mount.spline':d.componentClass==='motor'?'output.shaft':d.componentClass==='wheel'?'mount.axle':d.componentClass==='standoff'?'mount.axis':'datum.reference';
 const i={id:'PX-V40-IF-'+key+'-REFERENCE',definitionId:d.id,feature,kind:d.componentClass==='servo'?'spline':d.componentClass==='motor'?'shaftAxis':d.componentClass==='wheel'?'bearing':d.componentClass==='standoff'?'shaftAxis':'datum',frame:unknown(q),measurementRefs:[],permittedDOF:[],matingRuleIds:[],toleranceRefs:[],evidenceRefs:[d.componentClass==='piBoard'?'PX-EV-PHOTO-04':'PX-EV-PHOTO-03'],blockerIds:[q]};arrays.interfaces.push(i);d.interfaceRefs.push(i.id);
 if(['screw','nut','washer','standoff','rivet'].includes(d.componentClass))arrays.fastenerDefinitions.push({partDefinitionId:d.id,designationClaimId:d.identityClaimId,category:d.componentClass==='rivet'?'pushRivet':d.componentClass==='screw'?(key.startsWith('SERVO-RETAINER')?'servoRetainer':'machineScrew'):d.componentClass==='washer'?(key==='SPRING-WASHER'?'springWasher':'washer'):d.componentClass,diameterRef:unknown(q),lengthRef:unknown(q),pitchRef:unknown(q),headStandardRef:unknown(q),driveStandardRef:unknown(q),materialClaimRef:unknown(q),threadFormRef:unknown(q),gripRangeRefs:[],insertionBehavior:d.componentClass==='rivet'?'pushThenLock':d.componentClass==='washer'?'plainPlace':'unresolved',unspecifiedProperties:['thread/pitch/head/drive/material/grip geometry not established by printed designation'],blockerIds:[q]});
 if(['servo','motor','battery','cable','robotHat','camera','ultrasonic','grayscale','piBoard'].includes(d.componentClass)){
  const labels=d.componentClass==='robotHat'?['P0','P1','P2','P11','MOTOR1','MOTOR2','ULTRASONIC','GRAYSCALE','BATTERY']:d.componentClass==='cable'?['END-A','END-B']:['CONNECTOR'];
  for(const label of labels){const connectorEvidence=d.componentClass==='robotHat'?'PX-EV-PHOTO-06':'PX-EV-PHOTO-03';const cpId='PX-V40-CP-'+key+'-'+label,cid='PX-CLAIM-'+key+'-'+label+'-CONNECTOR';claim(cid,d.id,'connectorIdentity',`Connector role ${label}; exact keying, pin geometry and V40 applicability remain unresolved.`,[connectorEvidence],['Q-09'],'identity','UNRESOLVED');arrays.connectionPoints.push({id:cpId,definitionId:d.id,kind:'electrical',connectorIdentityClaimId:cid,frame:unknown('Q-09'),cavities:[],keyingClaimIds:[],netClaimIds:[],evidenceRefs:[connectorEvidence],blockerIds:['Q-09']});d.connectionPointRefs.push(cpId);}
 }
 if(['cable','servo','motor','battery'].includes(d.componentClass))arrays.cableDefinitions.push({partDefinitionId:d.id,ownership:d.componentClass==='cable'?'loose':'integral',conductorCount:unknown('Q-09','count'),endpointConnectorRefs:d.connectionPointRefs,contactMapping:unknown('Q-09'),lengthRef:unknown('Q-09'),widthRef:unknown('Q-09'),thicknessRef:unknown('Q-09'),minimumBendRadiusRef:unknown('Q-09'),routingGuideRefs:[],strainReliefRuleIds:[],routingCapability:'schematic',blockerIds:['Q-09','Q-13']});
}
const conflict=(key,def,property,statements,evs,q,scope)=>{
 const id='PX-CONFLICT-'+key,subject='PX-V40-DEF-'+def;
 const claims=statements.map((s,i)=>{const c=claim('PX-CLAIM-'+key+'-'+String(i+1),subject,property,s,[evs[i]],[],scope);c.conflictIds=[id];return c;});
 arrays.conflicts.push({id,claimIds:claims.map(c=>c.id),subjectId:subject,property,status:'open',resolution:unknown(q),reason:'Source statements preserved; no applicability or numerical resolution inferred.'});
 for(const e of evs){const r=arrays.evidence.find(x=>x.id===e);if(!r.conflictIds.includes(id))r.conflictIds.push(id);}
};
conflict('CAMERA-DIMENSIONS','CAMERA','referenceDimensions',['Documentation prose approximately 25 x 23 x 9 mm.','Documentation specification 24 x 23.5 x 8 mm.'],['PX-EV-DOC-CAMERA','PX-EV-DOC-CAMERA'],'Q-08','referenceApproximation');
conflict('ULTRASONIC-SUPPLY','ULTRASONIC','supplyApplicability',['Generic ultrasonic documentation says 5 V; not evidence of supplied V40 identity.','V40 final wiring depiction labels 3V3; does not close generic documentation applicability.'],['PX-EV-DOC-ULTRASONIC','PX-EV-PHOTO-06'],'Q-08','procedure');
// Generic HAT document attribution is retained as a probable identity, never accepted.
claim('PX-CLAIM-HAT-GENERIC-V4','PX-V40-DEF-ROBOT-HAT','genericRevision','Generic latest Robot HAT v4 family; actual supplied revision unproven.',['PX-EV-DOC-HAT'],['Q-07'],'identity','PROBABLE');
claim('PX-CLAIM-PI5-REFERENCE-LIMIT','PX-V40-DEF-PI5','sourceLimit','Audited Pi5 drawing explicitly marks dimensions approximate/reference-only; no production dimensional authority.',['PX-EV-W15'],['Q-10'],'referenceApproximation','UNRESOLVED');
for(const q of read(spec+'blocker-register.json').items){const resolved=q.id==='Q-02';arrays.unresolvedItems.push({id:q.id,title:q.title,missingClaim:q.missingEvidence,affectedFeatureIds:[],affectedStepIds:seed.steps.filter(s=>s.geometryBlockerIds.includes(q.id)).map(s=>s.id),variantIds:variants,severity:q.classification.includes('Future')?'future':q.classification.includes('Critical')?'critical':'scoped',permittedWork:[q.permittedWork],forbiddenClaims:['Do not infer missing identity, geometry, applicability or actual inventory from printed/reference evidence.'],searchRecords:[],resolutionCriteria:[q.resolutionCriteria],ownerMilestone:q.ownerMilestone.split('/')[0],status:resolved?'RESOLVED':'OPEN',resolutionEvidenceRefs:resolved?['PX-EV-M0-SOURCE-LOCK','PX-EV-V40-PDF']:[],supersedes:[]});}
for(const cls of ['screwdriver','wrench'])arrays.tools.push({id:'PX-V40-TOOL-'+cls.toUpperCase(),category:cls,sizeClaimRef:unknown('Q-06'),quantity:unknown('Q-13','count'),purpose:'Printed assembly tool; driver size/torque unspecified',operationIds:[],evidenceRefs:['PX-EV-PHOTO-03'],blockerIds:['Q-06','Q-13']});
arrays.warnings.push({id:'PX-V40-WARN-ELECTRICAL-CONFLICT',severity:'critical',text:'Printed V40 rail labels and generic ultrasonic documentation conflict; electrical certification remains BLOCKED.',evidenceRefs:['PX-EV-PHOTO-06','PX-EV-DOC-ULTRASONIC'],operationIds:[],variantIds:variants,triggerRuleIds:[],acknowledgmentRequired:false,blocks:['certification'],blockerIds:['Q-08']});
for(const d of arrays.definitions){
 const key=d.id.slice('PX-V40-DEF-'.length),q=d.blockerIds[0],ev=d.componentClass==='piBoard'?'PX-EV-PHOTO-04':'PX-EV-PHOTO-03';
 const gid='PX-V40-GEOM-'+key;
 arrays.geometrySources.push({id:gid,representation:'unresolved',sourceRefs:[ev],artifact:unknown(q),sourceRevision:'Z0104V40',generatorArtifact:unknown(q),coveredFeatures:[],omittedFeatures:['geometry.length'],presentationOnlyFeatures:[],maturity:'RECORDED',validationReportIds:[],blockerIds:[q]});d.geometrySourceRefs.push(gid);
 arrays.frames.push({id:'PX-V40-FRAME-'+key,frame:unknown(q),evidenceRefs:[ev]});
}
for(const lot of arrays.lots.filter(l=>l.quantity.state==='known'))arrays.verificationRules.push({id:lot.id.replace('-LOT-','-RULE-')+'-PRINTED-QUANTITY',predicate:'quantity',targetIds:[lot.id],observability:{class:'notCameraObservable',requiredFeatureIds:[],requiredViews:[],calibrationRequired:false,eligibilityRuleIds:[],limitations:['Printed planning projection, not observed physical stock.']},evidenceRequirementIds:['PX-EV-PHOTO-03'],comparator:'equals',toleranceRef:na('Exact count of printed depictions; no metric tolerance.'),onUnknown:'BLOCKED',onContradiction:'FAIL',humanAcknowledgment:'notApplicable',invalidationDependencyIds:[lot.id,'PX-EV-PHOTO-03'],predicateVersion:1,evaluationPhase:'projection',expected:{kind:'numeric',value:lot.quantity}});
arrays.plannedUses=hardwareRows.flatMap(row=>Object.entries(row.plannedAllocations).flatMap(([variantId,uses])=>uses.map(u=>({id:u.useId,instanceId:u.instanceId,definitionId:row.definitionId,variantId,stepId:u.stepId}))));
const firstUse={'PLATE-A':1,'PLATE-B':14,'PLATE-C':12,'PLATE-D':23,'PLATE-E':25,'PLATE-F':25,'PLATE-G':21,'PLATE-H':9,'MOTOR-LEFT':5,'MOTOR-RIGHT':5,'HORN-PAN':8,'HORN-TILT':13,'HORN-STEERING':21,'SERVO-PAN':14,'SERVO-TILT':15,'SERVO-STEERING':20,'SERVO-RETAINER-PAN':19,'SERVO-RETAINER-TILT':18,'SERVO-RETAINER-STEERING':22,'WHEEL-FRONT':26,'WHEEL-REAR':27,'BATTERY':6,'ROBOT-HAT':4,'CAMERA':11,'ULTRASONIC':9,'GRAYSCALE':24,'CABLE-4PIN':28,'CABLE-5PIN':28,'RIBBON-FPC':3,'RIBBON-FFC':3,'USB-MICROPHONE':2,'PI4':2,'PI5':2,'ZERO2W':2};
for(const a of arrays.allocations){const ins=arrays.instances.find(i=>i.id===a.instanceId),key=ins.definitionId.slice('PX-V40-DEF-'.length);if(a.disposition==='plannedInstalled'&&a.stepId===null&&firstUse[key])a.stepId='PX-V40-STEP-'+String(firstUse[key]).padStart(2,'0');}
const folderMap={plannedUses:'components/inventory/planned-uses.json',evidence:'evidence/records/evidence.json',claims:'evidence/records/claims.json',conflicts:'evidence/conflicts/conflicts.json',derivations:'components/measurements/derivations.json',definitions:'components/definitions/parts.json',instances:'components/instances/planned-stock.json',measurements:'components/measurements/measurements.json',interfaces:'components/interfaces/mechanical.json',connectionPoints:'components/interfaces/connection-points.json',fastenerDefinitions:'components/definitions/fasteners.json',cableDefinitions:'components/definitions/cables.json',geometrySources:'components/definitions/geometry-sources.json',frames:'components/interfaces/frames.json',unresolvedItems:'evidence/records/blockers.json',variants:'components/inventory/variants.json',tools:'components/inventory/tools.json',warnings:'evidence/records/warnings.json',verificationRules:'components/interfaces/verification-rules.json',lots:'components/inventory/lots.json',allocations:'components/inventory/allocations.json'};
for(const [family,p]of Object.entries(folderMap))write('digital-twin/'+p,arrays[family]);
write('digital-twin/components/inventory/printed-hardware.json',{...ledger,rows:hardwareRows});
write('digital-twin/components/inventory/unresolved-allocations.json',unresolvedAllocations);
write('digital-twin/components/inventory/planning-steps.json',seed);
// Immutable audit provenance retains full impact and multi-milestone ownership; production status is in blockers.json.
write('digital-twin/evidence/records/blocker-source-records.json',read(spec+'blocker-register.json'));
write('digital-twin/components/inventory/registry-index.json',{contractVersion:2,families:folderMap,scope:'M1 authoring only; no live state or compiled graph'});
write('digital-twin/evidence/sources.lock.json',{contractVersion:2,m0BaselineSha:read('digital-twin/validation/baseline.json').m0BaselineSha,m0GateReport:artifact('M0_GATE_REPORT.json'),documentaryLock:artifact('picarx-companion/tools/content-pipeline/documentation-source-lock.json'),kitRevision:'Z0104V40',pdfRawSha256:lock.pdfSha256,pdfGitBlobSha1:lock.pdfGitBlob,sourceEvidenceIds:arrays.evidence.map(e=>e.id).sort(),packageRawSha256:allocation.originalZip.sha256,planningSeed:artifact(spec+'v40-step-seed.json'),printedLedger:artifact(spec+'printed-hardware-ledger.json'),privatePolicy:'Private bytes remain ignored; local hash/locator metadata only.'});
console.log(Object.fromEntries(Object.entries(arrays).map(([k,v])=>[k,v.length])));
