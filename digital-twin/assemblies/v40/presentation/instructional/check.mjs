// Read-only blocked M7 gate entrypoint. 0 PASS, 1 contradiction, 2 BLOCKED.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,binding,evaluate} from './gate.mjs';
try {
 const report=JSON.parse(fs.readFileSync(path.join(root,'docs/implementation/M7_G_INSTRUCTIONAL_ASSEMBLY_REPORT.json')));
 for(const b of [...report.inputBindings,report.preflight,report.reproducibility,report.preservation]){assert(!path.isAbsolute(b.path)&&!b.path.split(/[\\/]/).includes('..'));assert.deepEqual(binding(b.path),b,'REPORT_INPUT_DRIFT');}
 const status=evaluate(report);assert.equal(report.status,status);
 console.log(JSON.stringify({gate:report.gate,status,complete:report.currentProductDeliveryCoverage.complete,required:58,staticObserved:2,preservedNonTarget:report.preservedNonTarget,engineeringGate:report.engineeringGate,engineeringStatus:report.engineeringStatus}));
 process.exitCode=status==='BLOCKED'?2:0;
} catch(error){console.error(error.message);process.exitCode=1;}
