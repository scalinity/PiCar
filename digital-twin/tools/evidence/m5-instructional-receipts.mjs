// Presentation receipt compiler. Does not write canonical engineering data.
import fs from 'node:fs';
import path from 'node:path';
import {base,validateParameters,validateReceipt} from './m5-instructional.mjs';
import {read,H} from './hash.mjs';
export function receiptFor(d,shape,artifactNames){
 return {definitionId:d.definitionId,track:d.track,engineeringStatus:d.engineeringStatus,instructionalStatus:'INSTRUCTIONAL_ADMITTED',representationKind:d.representationKind,sourceRefs:d.sourceRefs,sourceLimitations:d.sourceLimitations,canonicalUnknowns:d.canonicalUnknowns,instructionalApproximations:d.instructionalApproximations,criticalTutorialFacts:d.protectedFacts.graphUse,protectedFacts:d.protectedFacts,mustNotDrive:d.mustNotDrive,blockerIds:d.blockerIds,rightsStatus:d.rightsStatus,artifactPaths:artifactNames.map(n=>'digital-twin/validation/expected/m5/instructional-artifacts/'+n),validationResults:{actualShapeCheck:shape.status,independentShape:shape,protectedTutorialFacts:'PASS',engineeringInputExclusion:'PASS',sourceClosure:'PASS',meshDeviation:'NOT_CLAIMED',physicalFit:'UNRESOLVED'},notes:d.notes,displayRequirements:d.displayRequirements,inputHash:H('m5-instructional-input',d)};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const input=read(path.join(base,'instructional-parameters.json')),shapes=read(process.argv[2]),generation=read(path.join(base,'instructional-artifacts/generation.json'));
 validateParameters(input,{sourceBytes:process.env.PICAR_M5_MIRROR!=='1'});
 if(shapes.status!=='PASS'||shapes.results.length!==50||generation.definitions.length!==50)throw Error('INCOMPLETE_INDEPENDENT_SHAPE_CLOSURE');
 const dir=path.join(base,'instructional-receipts');if(fs.existsSync(dir))throw Error('NEW_RECEIPTS_REQUIRED');fs.mkdirSync(dir);
 for(const d of input.definitions){const shape=shapes.results.find(r=>r.definitionId===d.definitionId),g=generation.definitions.find(r=>r.definitionId===d.definitionId);const receipt=receiptFor(d,shape,g.artifactNames);validateReceipt(receipt,input,shape);fs.writeFileSync(path.join(dir,d.definitionId+'.json'),JSON.stringify(receipt,null,2)+'\n');}
 console.log(JSON.stringify({status:'PASS',gate:'G-INSTRUCTIONAL-COMPONENT-RECEIPTS',definitions:50,engineeringAdmitted:0}));
}
