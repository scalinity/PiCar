import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { attestationCheck,root } from '../../tools/evidence/semantic.mjs';
import { read } from '../../tools/evidence/hash.mjs';
const probe=read(path.join(root,'docs/digital-twin/AUDIT_EVIDENCE/schema-probes.json')).probes.find(p=>p.name==='structured-zeroing-attestation');
const zero={...probe.current.value,createdAt:'2026-09-29T12:00:00Z'};
test('positive: zeroing attestation binding without consumption',()=>attestationCheck(zero,'ZeroingAttestation',zero));
for(const [name,change,error]of [
 ['different session',r=>r.sessionId='TEST-OTHER-SESSION','ATTESTATION_SCOPE'],
 ['different model',r=>r.modelHash='b'.repeat(64),'ATTESTATION_SCOPE'],
 ['different variant',r=>r.variantId='rpi5','ATTESTATION_SCOPE'],
 ['different servo epoch',r=>r.servoEpoch++,'ATTESTATION_SERVO_SCOPE'],
 ['missing epoch',r=>delete r.servoEpoch,'SCHEMA_ZeroingAttestation'],
 ['wrong operation scope',r=>r.validForOperationId='TEST-OTHER-OP','ATTESTATION_SERVO_SCOPE'],
 ['invalid creation time',r=>r.createdAt='not-a-time','ATTESTATION_TIME'],
 ['missing dependency scope',r=>r.dependencyIds=[],'SCHEMA_ZeroingAttestation']
])test('negative: attestation '+name,()=>{const r=structuredClone(zero);change(r);assert.throws(()=>attestationCheck(r,'ZeroingAttestation',zero),new RegExp(error));});
const procedure=Object.fromEntries(Object.entries(zero).filter(([k])=>!['servoInstanceId','servoEpoch','validForOperationId','movementSinceZeroingDenied','consumedByCommandRef'].includes(k)));
procedure.kind='powerOff';procedure.accepted=true;
test('positive: ProcedureAcknowledgment binding without storage',()=>attestationCheck(procedure,'ProcedureAcknowledgment',procedure));
test('negative: ProcedureAcknowledgment without procedure revision',()=>{const r={...procedure};delete r.procedureRevisionHash;assert.throws(()=>attestationCheck(r,'ProcedureAcknowledgment',procedure),/SCHEMA_ProcedureAcknowledgment/);});
