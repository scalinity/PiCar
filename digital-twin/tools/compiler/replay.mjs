// Independent process: only the two supplied bound artifacts are read.
// No authoring loader, source inventory lookup, cached snapshot, or expectation.
import fs from 'node:fs';
import {read,jcs,rawHash} from '../evidence/hash.mjs';
import {hash} from './hash.mjs';
import {applyOperation,undoOperation,validateState} from '../../../picarx-companion/src/domain/assembly/reducer.ts';
const [graphPath,registryPath,outputPath]=process.argv.slice(2);
if(!graphPath||!registryPath||!outputPath)throw Error('REPLAY_ARGUMENTS');
const inputs={graph:read(graphPath),registry:read(registryPath)},graph=inputs.graph;
let state=read(graphPath).initialState;validateState(state,inputs,hash);
const serialized=value=>JSON.parse(JSON.stringify(value));
const rows=[{prefix:0,stateHash:state.stateHash,stockDispositionHash:state.stockDispositionHash,stateRawSha256:rawHash(jcs(state))}],undo=[];
for(const operation of graph.operations){
 const before=serialized(state),result=applyOperation(before,serialized(operation),inputs,hash);
 state=serialized(result.state);const inverse=serialized(result.inverse);
 if(!jcs(undoOperation(state,inverse,inputs,hash)).equals(jcs(before)))throw Error('SERIALIZED_ROUND_TRIP');
 undo.push(inverse);rows.push({prefix:rows.length,operationId:operation.id,stateHash:state.stateHash,stockDispositionHash:state.stockDispositionHash,stateRawSha256:rawHash(jcs(state)),inverseRawSha256:rawHash(jcs(inverse))});
}
const finalState=serialized(state);
for(const inverse of undo.reverse())state=serialized(undoOperation(state,serialized(inverse),inputs,hash));
if(!jcs(state).equals(jcs(graph.initialState)))throw Error('REVERSE_TO_INITIAL');
let count=0;const stepBoundaries=graph.steps.map(s=>{count+=s.operationIds.length;return {stepId:s.id,printedNumber:s.printedNumber,...rows[count]};});
fs.writeFileSync(outputPath,JSON.stringify({status:'PASS',variantId:graph.variantId,graphHash:graph.graphHash,modelHash:graph.modelHash,prefixes:rows,stepBoundaries,finalState,reverseInitialHash:state.stateHash,operationCount:undo.length},null,2)+'\n');
console.log(graph.variantId+': '+undo.length+' serialized forward/undo operations, 29 boundaries; reverse-to-initial PASS.');
