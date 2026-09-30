import type { CompiledGraph, RuntimeRegistry, VerificationRule } from '../../generated/twin/contracts';

const require=(ok:unknown,code:string):void=>{if(!ok)throw Error(code);};
const families:Record<string,string>={definitions:'PartDefinition',interfaces:'MechanicalInterface',connectionPoints:'ConnectionPoint',measurements:'Measurement',frames:'FrameRecord',claims:'Claim',evidence:'EvidenceRecord',geometrySources:'GeometrySource',derivations:'DerivationRecord',conflicts:'ConflictRecord',tools:'ToolRequirement',warnings:'Warning',motions:'MotionInstruction',cameras:'CameraInstruction',visibility:'VisibilityRule',variants:'VariantRule',unresolvedItems:'UnresolvedEvidenceItem'};
const fields:Record<string,string[]>={definitionId:['PartDefinition'],partDefinitionId:['PartDefinition'],instanceId:['PartInstance'],instanceIds:['PartInstance'],memberInstanceIds:['PartInstance'],introducedInstanceIds:['PartInstance'],usedInstanceIds:['PartInstance'],targetInstanceId:['PartInstance'],cableInstanceId:['PartInstance'],pieceInstanceId:['PartInstance'],fastenerInstanceId:['PartInstance'],fastenerInstanceIds:['PartInstance'],rivetInstanceId:['PartInstance'],servoInstanceId:['PartInstance'],interfaceId:['MechanicalInterface'],interfaceRefs:['MechanicalInterface'],connectionPointId:['ConnectionPoint'],endpointLabel:['ConnectionPoint'],connectionPointRefs:['ConnectionPoint'],endpointConnectorRefs:['ConnectionPoint'],connectionId:['MechanicalConnection'],cableConnectionId:['CableConnection'],activationOperationId:['AssemblyOperation'],allocationOperationId:['AssemblyOperation'],validForOperationId:['AssemblyOperation'],operationIds:['AssemblyOperation'],stepId:['AssemblyStep'],prerequisites:['AssemblyStep'],sourceRefs:['EvidenceRecord'],evidenceRefs:['EvidenceRecord'],evidenceRequirementIds:['EvidenceRecord'],blockerIds:['UnresolvedEvidenceItem'],measurementRefs:['Measurement'],parameterMeasurementRefs:['Measurement'],toleranceRefs:['Measurement'],claimIds:['Claim'],inputClaimIds:['Claim'],inputMeasurementIds:['Measurement'],derivationRef:['DerivationRecord'],evidenceId:['EvidenceRecord'],conditionRuleId:['VerificationRule'],preconditionRuleIds:['VerificationRule'],postconditionRuleIds:['VerificationRule'],zeroingConditionIds:['VerificationRule'],verificationRuleIds:['VerificationRule'],toolRequirementIds:['ToolRequirement'],warningIds:['Warning'],motionInstructionIds:['MotionInstruction'],cameraInstructionIds:['CameraInstruction'],parentAssemblyId:['AssemblyGroup'],parentAssemblyIdRef:['AssemblyGroup'],assemblyId:['AssemblyGroup'],trayGroupId:['AssemblyGroup'],inventoryLotId:['InventoryLot'],sourceLotId:['InventoryLot'],elementId:['OwnedElement'],bodyElementId:['OwnedElement'],pinElementId:['OwnedElement']};

export function validateGraphReferences(graph:CompiledGraph,registry:RuntimeRegistry,collect?:{owners:{id:string;type:string}[]}): number {
  const index=new Map<string,string>();let references=0;
  const add=(id:string,type:string)=>{require(/^(?:PX|TEST|Q|G|AC)-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(id),'INVALID_TYPED_ID');require(!index.has(id),'DUPLICATE_TYPED_OWNER');index.set(id,type);};
  for(const [family,type] of Object.entries(families))for(const record of registry[family as keyof RuntimeRegistry] as {id:string}[])add(record.id,type);
  for(const d of registry.definitions)for(const e of d.ownedElements)add(e.id,'OwnedElement');
  for(const [type,records] of [['PartInstance',graph.instances],['AssemblyStep',graph.steps],['AssemblyOperation',graph.operations],['MechanicalConnection',graph.mechanicalConnections],['CableConnection',graph.cableConnections],['VerificationRule',graph.verificationRules]] as const)for(const r of records)add(r.id,type);
  for(const c of graph.mechanicalConnections)for(const x of c.constraints)add(x.id,'Constraint');
  for(const g of graph.initialState.subassemblies)add(g.assemblyId,'AssemblyGroup');
  for(const l of graph.initialState.consumableLots)add(l.lotId,'InventoryLot');
  const ref=(id:unknown,types?:string[])=>{require(typeof id==='string'&&index.has(id),'UNKNOWN_TYPED_REFERENCE');require(!types||types.includes(index.get(id as string)!),'WRONG_REFERENCE_TYPE');references++;};
  const visit=(value:unknown,key='',parent:Record<string,unknown>={})=>{
    if(value===null)return;
    if(Array.isArray(value)){for(const item of value)visit(item,key,parent);return;}
    if(typeof value==='object'){
      const obj=value as Record<string,unknown>;
      if(obj.state==='known'&&typeof obj.ref==='string')ref(obj.ref,key==='coordinateRef'?['Measurement']:key==='deactivationOperationRef'?['AssemblyOperation']:key==='appliedConnectionRef'?['MechanicalConnection']:undefined);
      for(const [k,v] of Object.entries(obj))if(k!=='ref')visit(v,k,obj);
      return;
    }
    if(fields[key])ref(value,fields[key]);
    if(key==='invalidationDependencyIds')ref(value);
    if(key==='targetIds'&&parent.predicate)ref(value);
  };
  visit(registry);visit(graph);
  for(const claim of registry.claims){
    const sources=claim.evidenceRefs.map(id=>registry.evidence.find(e=>e.id===id)!);
    if(claim.confidence==='VERIFIED')require(sources.length>0&&sources.every(e=>e.artifact.state==='available'),'VERIFIED_EVIDENCE');
    for(const e of sources){
      require(e.limitations.every(l=>claim.sourceLimitations.includes(l)),'SOURCE_LIMITATION_DROPPED');
      if(claim.confidence==='VERIFIED'&&['identity','nominalEngineering','asBuilt'].includes(claim.scope))require(e.engineeringUse==='authoritativeNominal'&&e.applicability.includes(claim.subjectId),'SOURCE_SCOPE_PROMOTION');
    }
    for(const id of claim.inputClaimIds){const input=registry.claims.find(c=>c.id===id)!;require(input.sourceLimitations.every(l=>claim.sourceLimitations.includes(l)),'SOURCE_LIMITATION_DROPPED');require(claim.confidence!=='VERIFIED'||!['PROBABLE','UNRESOLVED'].includes(input.confidence),'CONFIDENCE_PROMOTION');if(claim.scope==='nominalEngineering')require(!['referenceApproximation','printedDesignation','printedInventory','appearance'].includes(input.scope),'SOURCE_SCOPE_PROMOTION');}
  }
  for(const m of registry.measurements)if(m.value.state==='known'&&m.value.confidence==='VERIFIED'&&m.value.unit!=='count'&&'evidenceRefs' in m.value&&Array.isArray(m.value.evidenceRefs))for(const id of m.value.evidenceRefs){const e=registry.evidence.find(e=>e.id===id)!;require(e.artifact.state==='available'&&e.engineeringUse==='authoritativeNominal'&&e.applicability.includes(m.subjectId)&&e.applicability.includes('nominalEngineering'),'SOURCE_SCOPE_PROMOTION');}
  for(const rule of graph.verificationRules)validateRule(rule,id=>index.get(id));
  for(const s of graph.steps)require(s.motionInstructionIds.every(id=>registry.motions.some(m=>m.id===id))&&s.cameraInstructionIds.every(id=>registry.cameras.some(c=>c.id===id)),'PRESENTATION_OWNER');
  if(collect)collect.owners=[...index].map(([id,type])=>({id,type})).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
  return references;
}

export function validateRule(rule:VerificationRule,type:(id:string)=>string|undefined):void {
  const table:Record<string,[string[],string,string,string[]]>={presence:[['projection'],'boolean','equals',['PartInstance','PartDefinition']],identity:[['projection','engineering'],'idSet','setEqual',['PartDefinition','PartInstance']],orientation:[['engineering'],'reference','equals',['MechanicalInterface','MechanicalConnection']],quantity:[['projection','engineering'],'numeric','equals',['InventoryLot','AllocationScope']],mateResidual:[['engineering'],'numeric','lessOrEqual',['EngineeringCheck']],clearance:[['engineering'],'numeric','greaterOrEqual',['EngineeringCheck']],sourceApplicability:[['engineering'],'claimScope','sourceSupported',['Claim']],zeroingAcknowledgment:[['physicalCommand'],'boolean','allTrue',['PartInstance']],powerAcknowledgment:[['physicalCommand'],'boolean','allTrue',['PartInstance','AssemblyOperation']],cableEndpoint:[['projection','engineering'],'idSet','setEqual',['CableConnection']],inventoryConservation:[['projection','engineering'],'boolean','allTrue',['InventoryLot','AllocationScope']],observationResidual:[['observation'],'numeric','lessOrEqual',['ObservationContract']]};
  const t=table[rule.predicate];require(t&&rule.predicateVersion===1&&t[0].includes(rule.evaluationPhase)&&rule.expected.kind===t[1]&&rule.comparator===t[2],'RULE_OPERAND_COMPARATOR_PHASE');
  require(rule.targetIds.every(id=>t[3].includes(type(id)??'')),'RULE_TARGET_TYPE');
  const e=rule.expected;
  if(e.kind==='numeric')require(rule.predicate==='quantity'?e.value.unit==='count':rule.predicate==='clearance'?e.value.unit==='mm':e.value.unit==='mm'||e.value.unit==='rad','RULE_UNIT');
  if(['zeroingAcknowledgment','powerAcknowledgment','inventoryConservation'].includes(rule.predicate))require(e.kind==='boolean'&&e.value===true,'RULE_BOOLEAN_TRUE');
  if(e.kind==='idSet')require(e.ids.every(id=>typeof id==='string'&&(rule.predicate==='cableEndpoint'?type(id)==='CableConnection':['PartInstance','PartDefinition'].includes(type(id)??''))),'RULE_EXPECTED_TYPE');
  if(e.kind==='reference')require(e.reference.state!=='known'||type(e.reference.ref)==='FrameRecord','RULE_FRAME_TYPE');
  if(rule.predicate==='orientation')require(rule.toleranceRef.state!=='notApplicable','RULE_ORIENTATION_TOLERANCE');
}
