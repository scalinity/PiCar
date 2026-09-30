import type {
  AssemblyOperation, AssemblyState, CompiledGraph, Endpoint, InstanceState,
  MechanicalConnection, NumericValue, OperationUndo, RuntimeRegistry, VerificationRule,
} from '../../generated/twin/contracts';

// Hashing is an explicit, deterministic port. Projection has no filesystem,
// clock, storage, renderer, hardware, or acknowledgment dependency.
export type SemanticHash = (kind: string, value: unknown) => string;
export interface ReplayInputs { graph: CompiledGraph; registry: RuntimeRegistry }
const require = (ok: unknown, code: string): void => { if (!ok) throw Error(code); };
const unique = (ids: string[], code: string): void => require(new Set(ids).size === ids.length, code);
const clone = <T>(value: T): T => structuredClone(value);
const find = <T>(xs: T[], predicate: (x: T) => boolean, code: string): T => {
  const matches = xs.filter(predicate); require(matches.length === 1, code); return matches[0];
};
const instance = (s: AssemblyState, id: string): InstanceState => find(s.instances, x => x.instanceId === id, 'INSTANCE_ID');
const staged = (i: InstanceState): void => require(i.location === 'tray' || i.location === 'assembly', 'UNSTAGED_INSTALLATION');
const key = (e: Endpoint): string => e.instanceId + '/' + e.interfaceId;
const compare = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
const knownAmount = (v: NumericValue): number => {
  if (v.state !== 'known' || !('value' in v) || typeof v.value !== 'number') throw Error('KNOWN_AMOUNT_REQUIRED');
  return v.value;
};

export function stateHashes(state: AssemblyState, hash: SemanticHash): AssemblyState {
  const s = clone(state);
  s.instances.sort((a,b) => compare(a.instanceId,b.instanceId));
  for (const i of s.instances) { i.activeOwnedElements.sort(); i.ownedElementStates.sort((a,b)=>compare(a.elementId,b.elementId)); }
  s.consumableLots.sort((a,b)=>compare(a.lotId,b.lotId));
  s.consumableAllocations.sort((a,b)=>compare(a.pieceInstanceId,b.pieceInstanceId));
  s.subassemblies.sort((a,b)=>compare(a.assemblyId,b.assemblyId));
  for (const g of s.subassemblies) g.memberInstanceIds.sort();
  s.cableRoutes.sort((a,b)=>compare(a.cableInstanceId,b.cableInstanceId));
  s.jointCoordinates.sort((a,b)=>compare(a.connectionId+'/'+a.dof,b.connectionId+'/'+b.dof));
  s.activeMechanicalConnectionIds.sort(); s.activeCableConnectionIds.sort(); s.requiredConditionIds.sort();
  s.stockDispositionHash = hash('stock', {
    instances: s.instances.map(({instanceId,location,parentAssemblyId,activeOwnedElements,ownedElementStates}) =>
      ({instanceId,location,parentAssemblyId,activeOwnedElements,ownedElementStates})),
    consumableLots: s.consumableLots, consumableAllocations: s.consumableAllocations,
  });
  const {stateHash: _previous, ...payload} = s;
  s.stateHash = hash('state', payload); return s;
}

export function validateState(s: AssemblyState, inputs: ReplayInputs, hash: SemanticHash): void {
  const {graph,registry} = inputs;
  require(registry.modelHash===graph.modelHash,'REGISTRY_BINDING');
  require(s.graphHash === graph.graphHash && s.modelHash === graph.modelHash && s.variantId === graph.variantId, 'STATE_BINDING');
  unique(s.instances.map(i=>i.instanceId),'DUPLICATE_INSTANCE');
  require(s.instances.length === graph.instances.length, 'ORPHAN_INVENTORY');
  unique(s.subassemblies.map(g=>g.assemblyId),'DUPLICATE_GROUP');
  for (const i of s.instances) {
    const declared = find(graph.instances,x=>x.id===i.instanceId,'INSTANCE_ID');
    const definition = find(registry.definitions,x=>x.id===declared.definitionId,'DEFINITION_ID');
    unique(i.ownedElementStates.map(e=>e.elementId),'DUPLICATE_OWNED_ELEMENT');
    require(i.ownedElementStates.length===definition.ownedElements.length && i.ownedElementStates.every(e=>definition.ownedElements.some(d=>d.id===e.elementId)), 'OWNED_ELEMENT_SET');
    require(JSON.stringify([...i.activeOwnedElements].sort())===JSON.stringify(i.ownedElementStates.filter(e=>['active','inserted','locked'].includes(e.state)).map(e=>e.elementId).sort()),'ACTIVE_OWNED_SET');
    const memberships=s.subassemblies.filter(g=>g.memberInstanceIds.includes(i.instanceId));
    require(i.parentAssemblyId === null ? memberships.length===0 : memberships.length===1 && memberships[0].assemblyId===i.parentAssemblyId,'MEMBERSHIP_MISMATCH');
  }
  for (const g of s.subassemblies) {
    unique(g.memberInstanceIds,'DUPLICATE_MEMBER');
    for (const id of g.memberInstanceIds) instance(s,id);
    const visited = new Set([g.assemblyId]); let p = g.parentAssemblyId;
    while(p!==null) { require(!visited.has(p),'GROUP_CYCLE'); visited.add(p); p=find(s.subassemblies,x=>x.assemblyId===p,'GROUP_PARENT').parentAssemblyId; }
  }
  for(const [ids,records,code] of [
    [s.activeMechanicalConnectionIds,graph.mechanicalConnections,'MECHANICAL_ID'],
    [s.activeCableConnectionIds,graph.cableConnections,'CABLE_ID'],
  ] as const) { unique(ids,code); for(const id of ids) require(records.some(c=>c.id===id),code); }
  unique(graph.mechanicalConnections.filter(c=>s.activeMechanicalConnectionIds.includes(c.id)).flatMap(c=>c.fastenerInstanceIds),'DOUBLE_FASTENER_USE');
  unique(s.requiredConditionIds,'DUPLICATE_CONDITION');
  require(s.requiredConditionIds.every(id=>graph.verificationRules.some(r=>r.id===id&&r.evaluationPhase==='physicalCommand')),'CONDITION_ID');
  unique(s.jointCoordinates.map(c=>c.connectionId+'/'+c.dof),'DUPLICATE_DOF');
  for(const c of s.jointCoordinates) {
    const connection=find(graph.mechanicalConnections,x=>x.id===c.connectionId,'MECHANICAL_ID');
    require(connection.jointType!=='fixed' && connection.remainingDOF.includes(c.dof),'UNDECLARED_DOF');
    require(c.coordinate.unit===(c.dof.startsWith('r')?'rad':'mm'),'JOINT_UNIT');
  }
  unique(s.consumableAllocations.map(a=>a.pieceInstanceId),'DUPLICATE_ALLOCATION');
  unique(s.consumableLots.map(l=>l.lotId),'DUPLICATE_LOT');
  require(JSON.stringify([...s.consumableLots].sort((a,b)=>compare(a.lotId,b.lotId)))===JSON.stringify([...graph.initialState.consumableLots].sort((a,b)=>compare(a.lotId,b.lotId))),'LOT_CAPACITY_WRITE');
  require(s.subassemblies.length===graph.initialState.subassemblies.length&&s.subassemblies.every(g=>graph.initialState.subassemblies.some(d=>d.assemblyId===g.assemblyId&&d.parentAssemblyId===g.parentAssemblyId)),'GROUP_DECLARATION');
  for(const a of s.consumableAllocations){
    const piece=find(graph.instances,i=>i.id===a.pieceInstanceId,'PIECE_ID');
    require(piece.supplyOrigin==='consumable'&&piece.inventoryLotId===a.sourceLotId,'PIECE_SOURCE_LOT');
    find(s.consumableLots,l=>l.lotId===a.sourceLotId,'SOURCE_LOT');
    require(graph.operations.some(o=>o.id===a.allocationOperationId&&o.kind==='allocateConsumable'&&o.payload.pieceInstanceId===a.pieceInstanceId),'ALLOCATION_OPERATION');
    if(a.appliedConnectionRef.state==='known')require(s.activeMechanicalConnectionIds.includes(a.appliedConnectionRef.ref),'APPLIED_CONNECTION');
  }
  for(const lot of s.consumableLots) {
    const amounts=s.consumableAllocations.filter(a=>a.sourceLotId===lot.lotId).map(a=>a.allocatedAmount);
    for(const a of amounts) require(a.unit===lot.capacity.unit,'CONSUMABLE_UNIT');
    for(const a of amounts) if(a.state==='known') require(knownAmount(a)>=0,'NEGATIVE_ALLOCATION');
    if(lot.capacity.state==='known'&&amounts.every(a=>a.state==='known'))
      require(amounts.reduce((n,a)=>n+knownAmount(a),0)<=knownAmount(lot.capacity),'CAPACITY_EXCEEDED');
  }
  const cables=s.activeCableConnectionIds.map(id=>find(graph.cableConnections,c=>c.id===id,'CABLE_ID'));
  unique(cables.map(c=>c.targetInstanceId+'/'+c.connectionPointId),'PORT_OCCUPANCY');
  unique(cables.map(c=>c.cableInstanceId+'/'+c.endpointLabel),'ENDPOINT_OCCUPANCY');
  for(const c of cables) {
    const owner=find(graph.instances,i=>i.id===c.cableInstanceId,'CABLE_OWNER');
    const d=find(registry.cableDefinitions,d=>d.partDefinitionId===owner.definitionId,'CABLE_DEFINITION');
    require(d.endpointConnectorRefs.includes(c.endpointLabel),'CABLE_ENDPOINT');
    const target=find(graph.instances,i=>i.id===c.targetInstanceId,'CABLE_TARGET');
    require(registry.connectionPoints.some(p=>p.id===c.connectionPointId&&p.definitionId===target.definitionId),'PORT_OWNER');
    if(d.ownership==='loose') require(instance(s,owner.id).location==='assembly','LOOSE_CABLE_LOCATION');
    else require(registry.definitions.find(x=>x.id===owner.definitionId)?.ownedElements.some(e=>e.kind==='integralLead'),'INTEGRAL_OWNER');
  }
  unique(s.cableRoutes.map(r=>r.cableInstanceId),'DUPLICATE_ROUTE');
  for(const r of s.cableRoutes) { instance(s,r.cableInstanceId); for(const e of r.guideEndpoints) validateEndpoint(e,inputs); }
  const ordered=graph.steps.flatMap(step=>step.operationIds);
  require(s.completedOperationIds.every((id,i)=>ordered[i]===id),'NON_PREFIX');
  require(stateHashes(s,hash).stateHash===s.stateHash && stateHashes(s,hash).stockDispositionHash===s.stockDispositionHash,'STATE_HASH');
}

export function validateEndpoint(e: Endpoint, {graph,registry}: ReplayInputs): void {
  const i=find(graph.instances,x=>x.id===e.instanceId,'ENDPOINT_INSTANCE');
  require(registry.interfaces.some(x=>x.id===e.interfaceId&&x.definitionId===i.definitionId),'ENDPOINT_OWNER');
}

export function ruleCapability(rule:VerificationRule,state:AssemblyState,inputs:ReplayInputs): 'PASS'|'FAIL'|'BLOCKED' {
  if(rule.evaluationPhase!=='projection')return 'BLOCKED';
  const ids=(xs:string[])=>JSON.stringify([...xs].sort());
  const expected=rule.expected;
  switch(rule.predicate){
    case 'presence': {
      const present=rule.targetIds.every(id=>state.instances.some(i=>i.instanceId===id&&['tray','assembly'].includes(i.location))||inputs.registry.definitions.some(d=>d.id===id)&&inputs.graph.instances.some(i=>i.definitionId===id&&['tray','assembly'].includes(instance(state,i.id).location)));
      return expected.kind==='boolean'&&present===expected.value?'PASS':'FAIL';
    }
    case 'identity':return expected.kind==='idSet'&&ids(rule.targetIds)===ids(expected.ids)?'PASS':'FAIL';
    case 'cableEndpoint':return expected.kind==='idSet'&&ids(state.activeCableConnectionIds.filter(id=>rule.targetIds.includes(id)))===ids(expected.ids)?'PASS':'FAIL';
    case 'quantity': {
      if(expected.kind!=='numeric'||expected.value.state!=='known')return 'BLOCKED';
      const lots=rule.targetIds.map(id=>find(state.consumableLots,l=>l.lotId===id,'QUANTITY_LOT'));
      if(lots.some(l=>l.capacity.state!=='known'))return 'BLOCKED';
      return lots.every(l=>l.capacity.unit==='count')&&lots.reduce((sum,l)=>sum+knownAmount(l.capacity),0)===knownAmount(expected.value)?'PASS':'FAIL';
    }
    case 'inventoryConservation':return state.instances.length===inputs.graph.instances.length&&new Set(state.instances.map(i=>i.instanceId)).size===inputs.graph.instances.length?'PASS':'FAIL';
    default:return 'BLOCKED';
  }
}

export function applyOperation(before: AssemblyState, operation: AssemblyOperation, inputs: ReplayInputs, hash: SemanticHash): {state: AssemblyState; inverse: OperationUndo} {
  validateState(before,inputs,hash);
  const {graph,registry} = inputs;
  const ordered=graph.steps.flatMap(s=>s.operationIds);
  require(ordered[before.completedOperationIds.length]===operation.id,'OPERATION_ORDER');
  require(!before.completedOperationIds.includes(operation.id),'DUPLICATE_OPERATION');
  require(JSON.stringify(operation)===JSON.stringify(find(graph.operations,o=>o.id===operation.id,'OPERATION_ID')),'OPERATION_BINDING');
  // Schema validation occurs at artifact adoption; this reducer additionally
  // checks every cross-record guard before returning any changed state.
  const op=operation; const p=op.payload as Record<string, unknown>;
  const id=(field:string):string=>{require(typeof p[field]==='string','PAYLOAD_ID');return p[field] as string;};
  const s=clone(before);
  for(const ruleId of op.preconditionRuleIds) {
    const rule=find(graph.verificationRules,r=>r.id===ruleId,'RULE_ID');
    if(rule.evaluationPhase==='physicalCommand')require(before.requiredConditionIds.includes(ruleId),'MISSING_REQUIRED_CONDITION');
    else if(rule.evaluationPhase==='projection')require(ruleCapability(rule,before,inputs)==='PASS','PROJECTION_PRECONDITION');
  }
  unique(op.parentAssignments.map(a=>a.instanceId),'DUPLICATE_ASSIGNMENT');
  for(const a of op.parentAssignments) {
    instance(s,a.instanceId);
    if(a.parentAssemblyId!==null) find(s.subassemblies,g=>g.assemblyId===a.parentAssemblyId,'GROUP_PARENT');
  }
  const requiredParent=(target:string):void=>require(op.parentAssignments.some(a=>a.instanceId===target&&a.parentAssemblyId!==null),'INSTALLATION_PARENT');
  const connection=():MechanicalConnection=>find(graph.mechanicalConnections,c=>c.id===id('connectionId'),'MECHANICAL_ID');
  const activate=(c:MechanicalConnection):void=>{
    require(!s.activeMechanicalConnectionIds.includes(c.id),'DUPLICATE_CONNECTION');
    require(c.activationOperationId===op.id,'ACTIVATION_OWNER');
    for(const e of c.endpoints) {validateEndpoint(e,inputs);staged(instance(s,e.instanceId));}
    s.activeMechanicalConnectionIds.push(c.id);
  };
  const install=(target:string):void=>{staged(instance(s,target));instance(s,target).location='assembly';};
  const installTargets=(c:MechanicalConnection):void=>{
    const participants=c.endpoints.map(e=>e.instanceId);
    for(const a of op.parentAssignments.filter(a=>a.parentAssemblyId!==null)) {
      require(participants.includes(a.instanceId)||s.subassemblies.some(g=>g.memberInstanceIds.includes(a.instanceId)&&g.memberInstanceIds.some(i=>participants.includes(i))),'INSTALLATION_PARTICIPANT');
      install(a.instanceId);
    }
  };
  const owned=(target:string,element:string,role:string)=>{
    const d=find(registry.definitions,d=>d.id===find(graph.instances,i=>i.id===target,'INSTANCE_ID').definitionId,'DEFINITION_ID');
    require(d.ownedElements.some(e=>e.id===element&&e.kind===role),'OWNED_ROLE');
    return find(instance(s,target).ownedElementStates,e=>e.elementId===element,'OWNED_ELEMENT');
  };
  switch(op.kind) {
    case 'introduce': {
      const ids=p.instanceIds as string[];unique(ids,'DUPLICATE_INTRODUCTION');
      find(s.subassemblies,g=>g.assemblyId===id('trayGroupId'),'TRAY_GROUP');
      for(const target of ids){const i=instance(s,target);require(find(graph.instances,x=>x.id===target,'INSTANCE_ID').variantIds.includes(s.variantId),'WRONG_BRANCH_INSTANCE');require(i.location==='available','DUPLICATE_INTRODUCTION');i.location='tray';}
      break;
    }
    case 'attachRigid': case 'attachJoint': {
      const c=connection();require(op.kind==='attachRigid'?c.jointType==='fixed':c.jointType!=='fixed','JOINT_KIND');
      activate(c);installTargets(c);
      for(const a of op.parentAssignments) instance(s,a.instanceId).solutionRef=clone(op.solutionRef);
      if(op.kind==='attachJoint') {
        const coords=p.jointCoordinates as AssemblyState['jointCoordinates'];
        unique(coords.map(x=>x.connectionId+'/'+x.dof),'DUPLICATE_DOF');
        for(const x of coords){require(x.connectionId===c.id&&c.remainingDOF.includes(x.dof),'UNDECLARED_DOF');require(!s.jointCoordinates.some(y=>y.connectionId===x.connectionId&&y.dof===x.dof),'CONFLICTING_DOF');s.jointCoordinates.push(clone(x));}
      }
      break;
    }
    case 'installFastener': {
      const target=id('fastenerInstanceId');const i=find(graph.instances,i=>i.id===target,'INSTANCE_ID');
      require(registry.fastenerDefinitions.some(d=>d.partDefinitionId===i.definitionId),'NOT_FASTENER');
      const c=connection();require(c.fastenerInstanceIds.includes(target),'FASTENER_PARTICIPANT');
      require(JSON.stringify(p.orderedContactStack)===JSON.stringify(c.orderedContactStack)&&c.orderedContactStack.length>0,'CONTACT_STACK');
      require(!graph.mechanicalConnections.some(c=>s.activeMechanicalConnectionIds.includes(c.id)&&c.fastenerInstanceIds.includes(target)),'DOUBLE_FASTENER_USE');
      requiredParent(target);activate(c);install(target);break;
    }
    case 'insertRivet': {
      const target=id('rivetInstanceId');const c=connection();
      require(c.fastenerInstanceIds.includes(target),'RIVET_PARTICIPANT');
      const d=find(registry.fastenerDefinitions,d=>d.partDefinitionId===find(graph.instances,i=>i.id===target,'INSTANCE_ID').definitionId,'NOT_RIVET');
      require(d.category==='pushRivet','NOT_RIVET');
      require(!graph.mechanicalConnections.some(c=>s.activeMechanicalConnectionIds.includes(c.id)&&c.fastenerInstanceIds.includes(target)),'DOUBLE_FASTENER_USE');
      const body=owned(target,id('bodyElementId'),'rigidBody');require(body.state==='loose','RIVET_BODY_STATE');
      requiredParent(target);activate(c);installTargets(c);install(target);body.state='inserted';break;
    }
    case 'lockRivet': {
      const target=id('rivetInstanceId');require(instance(s,target).location==='assembly','RIVET_LOCATION');
      const d=find(registry.definitions,d=>d.id===find(graph.instances,i=>i.id===target,'INSTANCE_ID').definitionId,'DEFINITION_ID');
      const body=find(d.ownedElements,e=>e.kind==='rigidBody','RIVET_BODY');
      require(owned(target,body.id,'rigidBody').state==='inserted','RIVET_NOT_INSERTED');
      require(s.activeMechanicalConnectionIds.includes(id('connectionId'))&&connection().fastenerInstanceIds.includes(target),'RIVET_CONNECTION');
      const pin=owned(target,id('pinElementId'),'movingBody');require(pin.state==='loose','RIVET_PIN_STATE');pin.state='locked';break;
    }
    case 'connectCableEnd': case 'disconnectCableEnd': {
      const c=find(graph.cableConnections,c=>c.id===id('cableConnectionId'),'CABLE_ID');
      if(op.kind==='disconnectCableEnd') {require(s.activeCableConnectionIds.includes(c.id),'CABLE_NOT_CONNECTED');require(c.deactivationOperationRef.state==='known'&&c.deactivationOperationRef.ref===op.id,'DEACTIVATION_OWNER');s.activeCableConnectionIds=s.activeCableConnectionIds.filter(x=>x!==c.id);break;}
      require(c.activationOperationId===op.id&&!s.activeCableConnectionIds.includes(c.id),'CABLE_ACTIVATION');
      staged(instance(s,c.targetInstanceId));
      const owner=find(graph.instances,i=>i.id===c.cableInstanceId,'CABLE_OWNER');
      const d=find(registry.cableDefinitions,d=>d.partDefinitionId===owner.definitionId,'CABLE_DEFINITION');
      if(d.ownership==='loose') install(owner.id);else staged(instance(s,owner.id));
      s.activeCableConnectionIds.push(c.id);break;
    }
    case 'routeCable': {
      const target=id('cableInstanceId');staged(instance(s,target));
      require(p.representation==='schematic','METRIC_ROUTE_BLOCKED');
      require(registry.cableDefinitions.some(d=>d.partDefinitionId===find(graph.instances,i=>i.id===target,'CABLE_OWNER').definitionId),'CABLE_DEFINITION');
      const guides=p.guideEndpoints as Endpoint[];for(const e of guides) validateEndpoint(e,inputs);unique(guides.map(key),'DUPLICATE_GUIDE');
      s.cableRoutes=s.cableRoutes.filter(r=>r.cableInstanceId!==target);
      s.cableRoutes.push({cableInstanceId:target,representation:'schematic',guideEndpoints:clone(guides),solutionRef:clone(op.solutionRef)});break;
    }
    case 'allocateConsumable': {
      const target=id('pieceInstanceId');require(instance(s,target).location==='available'&&!s.consumableAllocations.some(a=>a.pieceInstanceId===target),'DUPLICATE_ALLOCATION');
      const piece=find(graph.instances,i=>i.id===target,'PIECE_ID');
      require(piece.supplyOrigin==='consumable'&&piece.inventoryLotId===id('sourceLotId'),'PIECE_SOURCE_LOT');
      find(s.consumableLots,l=>l.lotId===id('sourceLotId'),'SOURCE_LOT');
      s.consumableAllocations.push({sourceLotId:id('sourceLotId'),pieceInstanceId:target,allocatedAmount:clone(p.allocatedAmount as NumericValue),allocationOperationId:op.id,appliedConnectionRef:{state:'notApplicable',reason:'Allocated, not yet applied.'}});
      instance(s,target).location='tray';break;
    }
    case 'applyConsumable': {
      const target=id('pieceInstanceId');const a=find(s.consumableAllocations,a=>a.pieceInstanceId===target,'MISSING_ALLOCATION');
      require(a.appliedConnectionRef.state==='notApplicable'&&instance(s,target).location==='tray','DUPLICATE_APPLICATION');
      requiredParent(target);const c=connection();require(c.endpoints.some(e=>e.instanceId===target),'PIECE_PARTICIPANT');activate(c);installTargets(c);
      a.appliedConnectionRef={state:'known',ref:c.id};break;
    }
    case 'acknowledgeProcedure': case 'confirmZeroing': {
      const rule=find(graph.verificationRules,r=>r.id===id('conditionRuleId'),'CONDITION_ID');require(rule.evaluationPhase==='physicalCommand','CONDITION_PHASE');
      if(op.kind==='confirmZeroing') {
        require(rule.predicate==='zeroingAcknowledgment'&&rule.targetIds.includes(id('servoInstanceId'))&&rule.invalidationDependencyIds.includes(id('validForOperationId')),'ZEROING_SCOPE');
        require(graph.operations.some(o=>o.id===id('validForOperationId')),'ZEROING_OPERATION');
        require(s.activeCableConnectionIds.some(cid=>{
          const c=find(graph.cableConnections,c=>c.id===cid,'CABLE_ID');
          return c.purpose==='temporaryZeroing'&&c.cableInstanceId===id('servoInstanceId');
        }),'ZEROING_P11_REQUIRED');
      }
      if(!s.requiredConditionIds.includes(rule.id))s.requiredConditionIds.push(rule.id);break;
    }
    case 'groupSubassembly': {
      const target=id('assemblyId');find(s.subassemblies,g=>g.assemblyId===target,'GROUP_ID');
      const members=p.memberInstanceIds as string[];unique(members,'DUPLICATE_MEMBER');
      require(members.every(i=>op.parentAssignments.some(a=>a.instanceId===i&&a.parentAssemblyId===target))&&op.parentAssignments.length===members.length,'GROUP_ASSIGNMENTS');break;
    }
    case 'moveSubassembly':find(s.subassemblies,g=>g.assemblyId===id('assemblyId'),'GROUP_ID').solutionRef=clone(op.solutionRef);break;
    case 'setJointReference': {
      const c=connection();require(s.activeMechanicalConnectionIds.includes(c.id),'JOINT_NOT_ACTIVE');
      const dof=p.dof as AssemblyState['jointCoordinates'][number]['dof'];require(c.remainingDOF.includes(dof)&&c.jointType!=='fixed','UNDECLARED_DOF');
      const ref=p.coordinateRef as {state:string;ref:string};require(ref.state==='known','MEASUREMENT_REQUIRED');
      const m=find(registry.measurements,m=>m.id===ref.ref,'MEASUREMENT_ID');require(m.value.unit===(dof.startsWith('r')?'rad':'mm'),'JOINT_UNIT');
      s.jointCoordinates=s.jointCoordinates.filter(x=>x.connectionId!==c.id||x.dof!==dof);s.jointCoordinates.push({connectionId:c.id,dof,coordinate:clone(m.value)});break;
    }
    case 'removeOwnedBacking': {
      const e=owned(id('instanceId'),id('elementId'),'removableBacking');require(e.state==='active','BACKING_STATE');e.state='removed';break;
    }
    default:throw Error('OPERATION_TAG');
  }
  for(const a of op.parentAssignments) {
    for(const g of s.subassemblies) g.memberInstanceIds=g.memberInstanceIds.filter(i=>i!==a.instanceId);
    instance(s,a.instanceId).parentAssemblyId=a.parentAssemblyId;
    if(a.parentAssemblyId!==null)find(s.subassemblies,g=>g.assemblyId===a.parentAssemblyId,'GROUP_PARENT').memberInstanceIds.push(a.instanceId);
  }
  for(const i of s.instances)i.activeOwnedElements=i.ownedElementStates.filter(e=>['active','inserted','locked'].includes(e.state)).map(e=>e.elementId);
  s.completedOperationIds.push(op.id);
  const after=stateHashes(s,hash);validateState(after,inputs,hash);
  for(const id of op.postconditionRuleIds){const rule=find(graph.verificationRules,r=>r.id===id,'RULE_ID');if(rule.evaluationPhase==='projection')require(ruleCapability(rule,after,inputs)==='PASS','PROJECTION_POSTCONDITION');}
  return {state:after,inverse:{operationId:op.id,expectedAfterHash:after.stateHash,beforeState:clone(before)}};
}

export function undoOperation(state: AssemblyState, inverse: OperationUndo, inputs: ReplayInputs, hash: SemanticHash): AssemblyState {
  validateState(state,inputs,hash);
  require(state.stateHash===inverse.expectedAfterHash,'STALE_UNDO');
  require(state.completedOperationIds[state.completedOperationIds.length-1]===inverse.operationId,'NON_TOP_UNDO');
  require(inverse.beforeState.completedOperationIds.length===state.completedOperationIds.length-1&&inverse.beforeState.completedOperationIds.every((id,i)=>state.completedOperationIds[i]===id),'UNDO_PREFIX');
  validateState(inverse.beforeState,inputs,hash);
  const operation=find(inputs.graph.operations,o=>o.id===inverse.operationId,'UNDO_OPERATION');
  require(applyOperation(inverse.beforeState,operation,inputs,hash).state.stateHash===state.stateHash,'UNDO_BEFORE_STATE');
  return stateHashes(inverse.beforeState,hash);
}

export function projectPrefix(inputs: ReplayInputs, count: number, hash: SemanticHash): AssemblyState {
  const order=inputs.graph.steps.flatMap(s=>s.operationIds);
  require(Number.isSafeInteger(count)&&count>=0&&count<=order.length,'PREFIX_RANGE');
  let state=clone(inputs.graph.initialState);
  for(const id of order.slice(0,count))state=applyOperation(state,find(inputs.graph.operations,o=>o.id===id,'OPERATION_ID'),inputs,hash).state;
  return state;
}
