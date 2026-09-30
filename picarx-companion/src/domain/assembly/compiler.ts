import type {
  AssemblyOperation, AssemblyState, AssemblyStep, CableConnection, CompiledGraph,
  MechanicalConnection, PartInstance, RuntimeRegistry, VariantPatch, VerificationRule,
} from '../../generated/twin/contracts';
import type { PlannedAllocation, InventoryLot } from '../../generated/twin/inventory';
import { projectPrefix, stateHashes, validateEndpoint, validateState } from './reducer.ts';
import type { SemanticHash } from './reducer.ts';
import { validateGraphReferences } from './references.ts';

export interface AuthoringRecords {
  instances: PartInstance[];
  steps: AssemblyStep[];
  operations: AssemblyOperation[];
  mechanicalConnections: MechanicalConnection[];
  cableConnections: CableConnection[];
  verificationRules: VerificationRule[];
  patches: VariantPatch[];
  initialStates: Omit<AssemblyState,'graphHash'|'modelHash'|'stateHash'|'stockDispositionHash'>[];
  registry: RuntimeRegistry;
  semanticContract: unknown;
  sourceIntents: unknown;
  allocations: PlannedAllocation[];
  lots: InventoryLot[];
  groups: AssemblyState['subassemblies'];
}
export type ShapeCheck = (type: string, record: unknown) => void;
const require = (ok: unknown, code: string): void => { if(!ok)throw Error(code); };
const one = <T>(records: T[], predicate: (r:T)=>boolean, code:string): T => {
  const matches=records.filter(predicate);require(matches.length===1,code);return matches[0];
};

export function compileGraph(authoring: AuthoringRecords, variant: CompiledGraph['variantId'], hash: SemanticHash, shape: ShapeCheck): {graph:CompiledGraph; graphInput:unknown} {
  require(['rpi4','rpi5','rpi-zero-2-w'].includes(variant),'UNSUPPORTED_VARIANT');
  const a=structuredClone(authoring), registry=a.registry;
  shape('RuntimeRegistry',registry);
  const allIds = new Set<string>();
  const claimId=(id:string)=>{require(!allIds.has(id),'DUPLICATE_TYPED_ID');allIds.add(id);};
  for(const [type,records] of [
    ['AssemblyStep',a.steps],['AssemblyOperation',a.operations],['MechanicalConnection',a.mechanicalConnections],
    ['CableConnection',a.cableConnections],['VerificationRule',a.verificationRules],['VariantPatch',a.patches],
  ] as const) for(const r of records){shape(type,r);claimId(r.id);}
  require(a.steps.length===29 && a.steps.every((s,i)=>s.printedNumber===i+1),'PRINTED_STEP_ORDER');
  const steps=a.steps.map((s,index)=>{
    require(s.prerequisites.length===(index===0?0:1)&&s.prerequisites.every(id=>id===a.steps[index-1].id),'STEP_PREREQUISITE');
    const selected=a.patches.filter(p=>p.stepId===s.id&&p.variantId===variant);
    require(selected.length<=1,'PATCH_OVERLAP');
    for(const ref of s.variantPatchRefs)one(a.patches,p=>p.id===ref&&p.stepId===s.id,'PATCH_REFERENCE');
    for(const p of selected){
      require(s.variantPatchRefs.includes(p.id),'PATCH_REFERENCE');
      const pos=p.replaceOperationIds.map(id=>s.operationIds.indexOf(id));
      require(pos.length>0&&pos[0]>=0&&pos.every((x,i)=>x===pos[0]+i),'NONCONTIGUOUS_PATCH');
      require(!p.activeInstanceIds.some(id=>p.inactiveInstanceIds.includes(id)),'VARIANT_OVERLAP');
      for(const id of [...p.activeInstanceIds,...p.inactiveInstanceIds])one(a.instances,i=>i.id===id,'PATCH_INSTANCE');
      for(const id of p.connectionIds)require([...a.mechanicalConnections,...a.cableConnections].some(c=>c.id===id&&p.withOperationIds.includes(c.activationOperationId)),'PATCH_CONNECTION');
      for(const id of [...p.withOperationIds,...p.replaceOperationIds])one(a.operations,o=>o.id===id&&o.stepId===s.id,'PATCH_OPERATION');
      s.operationIds.splice(pos[0],pos.length,...p.withOperationIds);
    }
    require(s.operationIds.length>0,'EMPTY_STEP');s.variantPatchRefs=[];s.variantIds=[variant];
    s.warningIds=s.warningIds.filter(id=>one(registry.warnings,w=>w.id===id,'WARNING_ID').variantIds.includes(variant));
    if(variant==='rpi-zero-2-w'&&s.printedNumber===4)s.blockerIds=[...new Set([...s.blockerIds,'Q-14'])];
    return s;
  });
  for(const p of a.patches)one(a.steps,s=>s.id===p.stepId,'PATCH_STEP');
  const order=steps.flatMap(s=>s.operationIds);
  require(new Set(order).size===order.length,'DUPLICATE_OPERATION');
  const operations=order.map(id=>one(a.operations,o=>o.id===id,'OPERATION_ID'));
  const mechanicalConnections=a.mechanicalConnections.filter(c=>order.includes(c.activationOperationId));
  const cableConnections=a.cableConnections.filter(c=>order.includes(c.activationOperationId));
  const verificationRules=a.verificationRules.filter(r=>operations.some(o=>o.preconditionRuleIds.includes(r.id)||o.postconditionRuleIds.includes(r.id)||o.payload.conditionRuleId===r.id)||steps.some(s=>s.verificationRuleIds.includes(r.id)));
  const initial=one(a.initialStates,s=>s.variantId===variant,'INITIAL_STATE');
  require(initial.consumableLots.length===a.lots.length&&a.lots.every(l=>initial.consumableLots.filter(x=>x.lotId===l.id&&JSON.stringify(x.capacity)===JSON.stringify(l.quantity)).length===1),'INITIAL_LOT_DECLARATION');
  const sortedGroups=(gs:AssemblyState['subassemblies'])=>[...gs].sort((a,b)=>a.assemblyId<b.assemblyId?-1:a.assemblyId>b.assemblyId?1:0);
  require(JSON.stringify(sortedGroups(initial.subassemblies))===JSON.stringify(sortedGroups(a.groups)),'INITIAL_GROUP_DECLARATION');
  require(initial.completedOperationIds.length===0&&initial.activeMechanicalConnectionIds.length===0&&initial.activeCableConnectionIds.length===0&&initial.jointCoordinates.length===0&&initial.requiredConditionIds.length===0&&initial.cableRoutes.length===0&&initial.consumableAllocations.length===0,'INITIAL_SURFACE_DECLARATION');
  for(const s of initial.instances){const i=one(a.instances,i=>i.id===s.instanceId,'INITIAL_INSTANCE');const allocation=one(a.allocations,x=>x.variantId===variant&&x.instanceId===i.id,'INITIAL_ALLOCATION');const expected=allocation.disposition==='plannedInstalled'?'available':['consumable','unresolved'].includes(allocation.disposition)?i.disposition:allocation.disposition;require(s.location===expected&&s.parentAssemblyId===null,'INITIAL_DISPOSITION');const definition=one(registry.definitions,d=>d.id===i.definitionId,'DEFINITION_ID');require(s.ownedElementStates.every(e=>e.state===(definition.ownedElements.some(d=>d.id===e.elementId&&['integralLead','removableBacking'].includes(d.kind))?'active':'loose')),'INITIAL_OWNED_STATE');}
  const graph:CompiledGraph={contractVersion:2,id:'PX-V40-GRAPH-'+variant.toUpperCase().replace(/-/g,''),variantId:variant,modelHash:registry.modelHash,graphHash:'0'.repeat(64),instances:a.instances,steps,operations,mechanicalConnections,cableConnections,verificationRules,initialState:{...initial,graphHash:'0'.repeat(64),modelHash:registry.modelHash,stateHash:'0'.repeat(64),stockDispositionHash:'0'.repeat(64)},blockerIds:[...new Set(steps.flatMap(s=>s.blockerIds))].sort()};
  const inputs={graph,registry};
  validateGraphReferences(graph,registry);
  for(const c of mechanicalConnections){
    require(c.endpoints.length>=2,'CONNECTION_ENDPOINTS');
    for(const e of [...c.endpoints,...c.orderedContactStack])validateEndpoint(e,inputs);
    for(const constraint of c.constraints){require(constraint.endpointIndices.every(i=>i<c.endpoints.length),'CONSTRAINT_ENDPOINT');require(constraint.remainingDOF.every(d=>c.remainingDOF.includes(d)),'CONSTRAINT_DOF');}
    require(c.jointType!=='fixed'||c.remainingDOF.length===0,'FIXED_DOF');
    require(new Set(c.remainingDOF).size===c.remainingDOF.length,'DUPLICATE_DOF');
    for(const id of c.fastenerInstanceIds){const i=one(graph.instances,i=>i.id===id,'FASTENER_ID');require(registry.fastenerDefinitions.some(d=>d.partDefinitionId===i.definitionId),'NOT_FASTENER');}
  }
  for(const op of operations){
    const step=one(steps,s=>s.id===op.stepId&&s.operationIds.includes(op.id),'OPERATION_STEP');
    require(op.evidenceRefs.every(id=>step.sourceRefs.includes(id)),'OPERATION_SOURCE_SCOPE');
    for(const id of [...op.preconditionRuleIds,...op.postconditionRuleIds])one(verificationRules,r=>r.id===id,'RULE_ID');
    for(const id of op.evidenceRefs)one(registry.evidence,e=>e.id===id,'EVIDENCE_ID');
    for(const id of op.blockerIds)one(registry.unresolvedItems,b=>b.id===id,'BLOCKER_ID');
  }
  for(const s of steps){
    const selected=operations.filter(o=>o.stepId===s.id);
    s.introducedInstanceIds=[...new Set(selected.filter(o=>o.kind==='introduce').flatMap(o=>o.payload.instanceIds as string[]))].sort();
    s.usedInstanceIds=[...new Set(selected.flatMap(o=>o.parentAssignments.map(a=>a.instanceId)).concat(mechanicalConnections.filter(c=>selected.some(o=>o.id===c.activationOperationId)).flatMap(c=>c.endpoints.map(e=>e.instanceId)),cableConnections.filter(c=>selected.some(o=>o.id===c.activationOperationId)).flatMap(c=>[c.cableInstanceId,c.targetInstanceId])))].sort();
    s.zeroingConditionIds=selected.filter(o=>o.kind==='confirmZeroing').map(o=>o.payload.conditionRuleId as string);
    s.verificationRuleIds=verificationRules.filter(r=>selected.some(o=>o.payload.conditionRuleId===r.id)).map(r=>r.id);
  }
  const {modelHash:_binding,cameras:_cameras,visibility:_visibility,...registryValues}=registry;
  const registryInput={...registryValues,definitions:registry.definitions.map(({name:_name,appearanceRefs:_appearance,...d})=>d)};
  const graphInput={variantId:variant,steps,operations,mechanicalConnections,cableConnections,verificationRules,initialState:initial,registry:registryInput,semanticContract:a.semanticContract,sourceIntents:a.sourceIntents,allocations:a.allocations.filter(x=>x.variantId===variant),inventoryLots:a.lots};
  graph.graphHash=hash('graph',graphInput);
  graph.initialState=stateHashes({...graph.initialState,graphHash:graph.graphHash},hash);
  shape('CompiledGraph',graph);validateState(graph.initialState,inputs,hash);
  const final=projectPrefix(inputs,order.length,hash);
  const planned=a.allocations.filter(x=>x.variantId===variant&&x.disposition==='plannedInstalled').map(x=>x.instanceId);
  require(final.instances.every(i=>(i.location==='assembly')===planned.includes(i.instanceId)),'FINAL_INSTALLED_INVENTORY');
  validateSensitiveSource(graph,registry);
  require(!final.activeCableConnectionIds.some(id=>one(cableConnections,c=>c.id===id,'CABLE_ID').purpose==='temporaryZeroing'),'FINAL_P11');
  return {graph,graphInput};
}

function validateSensitiveSource(graph: CompiledGraph, registry: RuntimeRegistry): void {
  const iid=(name:string,n=1)=>'PX-V40-INS-'+name+'-'+String(n).padStart(3,'0');
  const at=(n:number)=>graph.operations.filter(o=>o.stepId==='PX-V40-STEP-'+String(n).padStart(2,'0'));
  const connections=(n:number)=>graph.mechanicalConnections.filter(c=>at(n).some(o=>o.id===c.activationOperationId));
  const contains=(c:MechanicalConnection,id:string)=>c.endpoints.some(e=>e.instanceId===id);
  const introduced=(n:number)=>at(n).filter(o=>o.kind==='introduce').flatMap(o=>o.payload.instanceIds as string[]);
  const board=graph.variantId==='rpi4'?'PI4':graph.variantId==='rpi5'?'PI5':'ZERO2W';
  require(introduced(2).includes(iid(board))&&!introduced(2).some(id=>['PI4','PI5','ZERO2W'].some(b=>b!==board&&id===iid(b))),'SELECTED_BOARD');
  const expectedSupport=graph.variantId==='rpi-zero-2-w'?['M25X30-STANDOFF','M25X30-STANDOFF','M25X11-STANDOFF','M25X11-STANDOFF']:Array(4).fill('M25X18PLUS6-STANDOFF');
  const actualSupport=introduced(1).filter(id=>id.includes('STANDOFF')).map(id=>id.replace('PX-V40-INS-','').slice(0,-4)).sort();
  require(JSON.stringify(actualSupport)===JSON.stringify(expectedSupport.sort()),'S01_BRANCH_SUPPORT');
  for(const n of [1,4])require(at(n).filter(o=>o.kind==='installFastener'&&String(o.payload.fastenerInstanceId).includes('M25X6-SCREW')).length===4,'S01_S04_FOUR_SCREWS');
  const ribbon=graph.variantId==='rpi4'?'FFC':'FPC';
  for(const [n,target,point,end] of [[3,board,board,'A'],[11,'CAMERA','CAMERA','B']] as const){const cs=graph.cableConnections.filter(c=>at(n).some(o=>o.id===c.activationOperationId));require(cs.length===1&&cs[0].cableInstanceId===iid('RIBBON-'+ribbon)&&cs[0].targetInstanceId===iid(target)&&cs[0].connectionPointId==='PX-V40-CP-'+point+'-CONNECTOR'&&cs[0].endpointLabel==='PX-V40-CP-RIBBON-'+ribbon+'-END-'+end,'RIBBON_TWO_ENDS');}
  const route=one(at(16),o=>o.kind==='routeCable','S16_ROUTE');require(route.payload.cableInstanceId===iid('RIBBON-'+ribbon)&&(route.payload.guideEndpoints as {instanceId:string}[]).every(e=>e.instanceId===iid('PLATE-B')),'S16_GIMBAL_GUIDE');
  const battery=one(graph.cableConnections,c=>at(7).some(o=>o.id===c.activationOperationId),'S07_BATTERY');require(battery.cableInstanceId===iid('BATTERY')&&battery.connectionPointId==='PX-V40-CP-ROBOT-HAT-BATTERY','S07_INTEGRAL_LEAD');
  for(const [cable,sensor] of [['4PIN','ULTRASONIC'],['5PIN','GRAYSCALE']]){const c=one(graph.cableConnections,c=>at(28).some(o=>o.id===c.activationOperationId)&&c.cableInstanceId===iid('CABLE-'+cable),'S28_CABLE');require(c.targetInstanceId===iid(sensor)&&c.endpointLabel==='PX-V40-CP-CABLE-'+cable+'-END-A'&&c.connectionPointId==='PX-V40-CP-'+sensor+'-CONNECTOR','S28_SENSOR_ONLY');}
  if(graph.variantId==='rpi-zero-2-w')require(!graph.operations.some(o=>o.parentAssignments.some(a=>a.instanceId===iid('USB-MICROPHONE')))&&registry.unresolvedItems.some(b=>b.id==='Q-14'&&b.status==='OPEN'),'ZERO2W_ACCESSORY_HEADER');
  const supports=[iid('M3X26-STANDOFF',1),iid('M3X26-STANDOFF',2)];
  require(supports.every(id=>connections(10).some(c=>contains(c,id))&&connections(23).some(c=>contains(c,id))),'S10_S23_SUPPORT_REUSE');
  require(at(10).filter(o=>o.kind==='installFastener'&&String(o.payload.fastenerInstanceId).includes('M3X6')).length===2&&at(23).filter(o=>o.kind==='installFastener'&&String(o.payload.fastenerInstanceId).includes('M3X6')).length===2,'S10_S23_SCREW_COUNTS');
  require(connections(19).some(c=>contains(c,iid('WASHER-A')))&&!connections(19).some(c=>c.endpoints.some(e=>e.instanceId.includes('WASHER-B'))),'S19_WASHER_A');
  require(connections(21).every(c=>c.jointType==='revolute'&&c.remainingDOF.length===1&&c.remainingDOF[0]==='rz'),'S21_FREE_PIVOT');
  for(const [carrier,side] of [[iid('PLATE-E'),'RIGHT'],[iid('PLATE-F'),'LEFT']]) {
    const cs=connections(25).filter(c=>contains(c,carrier));require(cs.length===3,'S25_THREE_PER_SIDE');
    for(const base of ['PLATE-A','PLATE-D','PLATE-G'])require(cs.filter(c=>contains(c,iid(base))).length===1,'S25_INCIDENCE');
    require(cs.every(c=>c.jointType==='revolute'&&c.fastenerInstanceIds.length===1&&c.fastenerInstanceIds[0].includes('R3065')&&c.endpoints.some(e=>e.instanceId===carrier&&e.interfaceId.includes(side))),'S25_HANDEDNESS');
  }
  const wheels=connections(26);require(wheels.length===2,'S26_AXLE_COUNT');
  for(let n=1;n<=2;n++) {
    const c=one(wheels,c=>contains(c,iid('WHEEL-FRONT',n)),'S26_FRONT_IDENTITY');
    const washers=c.endpoints.filter(e=>e.instanceId.includes('WASHER-B')).map(e=>e.instanceId);
    require(washers.length===3&&new Set(washers).size===3&&c.fastenerInstanceIds.length===1&&c.fastenerInstanceIds[0]===iid('R30185-RIVET',n)&&c.jointType==='revolute','S26_STACK');
    require(contains(c,iid(n===1?'PLATE-E':'PLATE-F')),'S26_CARRIER');
  }
  for(let n=1;n<=2;n++) {
    const c=one(connections(27),c=>contains(c,iid('WHEEL-REAR',n)),'S27_REAR_IDENTITY');
    require(contains(c,iid(n===1?'MOTOR-LEFT':'MOTOR-RIGHT'))&&c.fastenerInstanceIds.length===0&&c.jointType==='fixed','S27_SHAFT');
    const op=one(at(27),o=>o.id===c.activationOperationId,'S27_OPERATION');
    require(op.parentAssignments.length===1&&op.parentAssignments[0].instanceId===iid('WHEEL-REAR',n)&&op.parentAssignments[0].parentAssemblyId==='PX-V40-GROUP-CHASSIS-REAR-DRIVE','S27_TARGET');
  }
  for(const [step,role] of [[18,'TILT'],[19,'PAN'],[22,'STEERING']] as const) {
    const zero=one(at(step),o=>o.kind==='confirmZeroing','ZEROING_SCOPE');
    const attach=one(at(step),o=>o.id===zero.payload.validForOperationId,'ZEROING_ATTACHMENT');
    require(zero.payload.servoInstanceId===iid('SERVO-'+role)&&attach.preconditionRuleIds.includes(zero.payload.conditionRuleId as string),'ZEROING_SCOPE');
  }
  for(const [owner,port] of [['SERVO-PAN','P0'],['SERVO-TILT','P1'],['SERVO-STEERING','P2'],['MOTOR-LEFT','MOTOR1'],['MOTOR-RIGHT','MOTOR2'],['CABLE-4PIN','ULTRASONIC'],['CABLE-5PIN','GRAYSCALE']]) {
    const cs=graph.cableConnections.filter(c=>at(29).some(o=>o.id===c.activationOperationId)&&c.cableInstanceId===iid(owner));
    require(cs.length===1&&cs[0].connectionPointId==='PX-V40-CP-ROBOT-HAT-'+port&&cs[0].targetInstanceId===iid('ROBOT-HAT'),'S29_PORT_ROLE');
  }
  require(graph.cableConnections.every(c=>c.pinMapping.state==='unresolved'),'UNSUPPORTED_PIN_MAPPING');
  require(registry.conflicts.filter(c=>c.status==='open').length===2,'OPEN_CONFLICTS');
}
