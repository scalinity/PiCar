// M4 closure writer/read-only verifier. No report hashes itself or a pack output.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root,twin} from '../evidence/semantic.mjs';
import {read,fileHash,H,jcs} from '../evidence/hash.mjs';
import {verifyAdoption} from './m4-adoption.mjs';
const reportPath=path.join(root,'docs/implementation/M4_GATE_REPORT.json');
const qualification='docs/implementation/evidence/m4/qualification-final-01';
const revalidation=qualification+'/revalidation-final-02';
const binding=p=>({path:path.relative(root,p),rawSha256:fileHash(p),bytes:fs.statSync(p).size});
const verify=b=>{if(fileHash(path.join(root,b.path))!==b.rawSha256||fs.statSync(path.join(root,b.path)).size!==b.bytes)throw Error('M4_BINDING_DRIFT '+b.path);};
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
function checks(){
 const adoption=read(path.join(root,qualification,'lock-adoption.json'));verifyAdoption(adoption.deltas);
 const commands=read(path.join(root,qualification,'commands.json'));if(commands.some(c=>c.exit!==c.expectedExit))throw Error('QUALIFICATION_COMMAND');
 for(const c of commands)verify(c.log);
 for(const label of ['a','b']){
  const xml=fs.readFileSync(path.join(root,qualification,label+'-tests.xml'),'utf8');if(!/<testsuite\b[^>]*errors="0"[^>]*failures="0"[^>]*skipped="0"[^>]*tests="54"/.test(xml))throw Error('M4_TEST_COUNTS');
  const e=read(path.join(root,qualification,label+'-environment.json'));if(e.python!=='3.12.14'||e.versions.cadquery!=='2.8.0'||e.versions['cadquery-ocp']!=='7.9.3.1.1'||e.ocpRuntime!=='7.9.3.1')throw Error('ENVIRONMENT');
  const r=read(path.join(root,qualification,label+'-exports/independent-verification.json'));if(r.status!=='PASS'||r.scope!=='TEST-ONLY'||r.shapes.length!==3||r.constraints.length!==3)throw Error('EMPTY_OR_FAILED_WITNESS');
  if(r.shapes.some(s=>s.sourceToMesh.status!=='PASS'||s.sourceToMesh.cadToMeshUpperMm>0.02||s.sourceToMesh.meshToCadUpperMm>0.02||s.sourceToMesh.coverage.length!==10||s.sourceToMesh.coverage.some(c=>c.triangles===0)))throw Error('SURFACE_COVERAGE');
  if(r.constraints.map(c=>c.independentDOF).join(',')!=='0,0,1')throw Error('PHYSICAL_DOF');
 }
 const rebuild=read(path.join(root,qualification,'reproducibility.json'));if(rebuild.status!=='PASS'||rebuild.independentMirrors.length!==2||rebuild.independentMirrors[0]===rebuild.independentMirrors[1])throw Error('REBUILD_NOT_INDEPENDENT');
 for(const c of rebuild.comparison){verify(c.a);verify(c.b);if(c.file.endsWith('.json')&&!c.rawEqual)throw Error('NORMALIZED_OUTPUT_DRIFT');}
 // Actual CAD/test inputs must still equal those captured before both builds.
 for(const b of read(path.join(root,qualification,'mirror-inputs.json')).filter(b=>b.path.startsWith('digital-twin/cad/')||b.path.startsWith('digital-twin/validation/fixtures/m4/')||b.path.startsWith('digital-twin/validation/tests_python/')||['digital-twin/pyproject.toml','digital-twin/uv.lock','digital-twin/toolchain.lock.json'].includes(b.path)))verify(b);
 const affected=read(path.join(root,revalidation,'affected-revalidation.json'));if(affected.status!=='PASS'||affected.affectedM1HashTests!==30||affected.m2ReadonlyContracts!==12||affected.hashVectors.accepted!==7||affected.hashVectors.rejected!==16)throw Error('AFFECTED_REVALIDATION');
 for(const c of read(path.join(root,revalidation,'revalidation-commands.json'))){if(c.exit!==0)throw Error('REVALIDATION_COMMAND');verify(c.log);}
 const preflight=read(path.join(root,'docs/implementation/evidence/m4/preflight.json'));for(const b of preflight.diagnostics)verify({path:b.path,rawSha256:b.rawSha256,bytes:b.byteLength});
 return {adoption,rebuild,affected};
}
if(process.argv.includes('--check')){
 const r=read(reportPath);if(r.status!=='PASS'||r.gate!=='G-TOOLCHAIN'||r.scope!=='M4 synthetic toolchain only')throw Error('M4_NOT_ACCEPTED');
 for(const b of [...r.sourceBindings,...r.evidenceBindings])verify(b);checks();
 if(r.toolchainHash!==H('toolchain',read(path.join(twin,'toolchain.lock.json'))))throw Error('TOOLCHAIN_HASH');
 console.log('G-TOOLCHAIN PASS: two clean 54/54 executions, complete independent fixture witnesses, exact bindings and explicit M4 lock adoption.');
}else{
 if(!process.argv.includes('--write-new-report')||fs.existsSync(reportPath))throw Error('EXPLICIT_NEW_REPORT_REQUIRED');
 const {adoption,rebuild,affected}=checks();
 const authorities=['MILESTONES','MILESTONE_REVIEW','ARCHITECTURE','DIGITAL_TWIN_DATA_MODEL','HASH_AND_PACK_CONTRACT','ASSET_PIPELINE_SPEC','GATE_CONTRACTS','VERIFICATION_AND_TEST_PLAN','REPOSITORY_CHANGE_MAP','OPEN_QUESTIONS_AND_BLOCKERS','SOURCE_REGISTER','SOURCE_PUBLICATION_CONTRACT'].map(p=>path.join(root,'docs/digital-twin',p+'.md'));
 const sourceFiles=[...['cad','tools/export','validation/fixtures/m4','validation/tests_python','validation/m4/prior-m1'].flatMap(p=>walk(path.join(twin,p))),...['pyproject.toml','uv.lock','toolchain.lock.json'].map(p=>path.join(twin,p)),...authorities,path.join(root,'docs/implementation/M4_EXECUTION_PLAN.md')];
 const evidenceFiles=walk(path.join(root,'docs/implementation/evidence/m4'));
 const report={milestone:'M4',gate:'G-TOOLCHAIN',status:'PASS',scope:'M4 synthetic toolchain only',acceptedM3:'baddbfe6953237d436cbedb963c6ea88d2960f05',startReceipt:'62225d41c57a2a41b51b19165ecf38e8f99f070d',branch:execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim(),ownerAuthorization:'Approve everything including builds, etc, do what you have to do for M4',toolchainHash:H('toolchain',read(path.join(twin,'toolchain.lock.json'))),fixtureInputHash:affected.fixtureInputHash,upstream:adoption,checks:{lockedPackageInstallation:'PASS exact identical wheels; locked backend without isolation',fixedRevoluteClosedLoop:'PASS unique at declared reference, physical DOF 0/1/0',independentShapeAndInterfaceChecks:'PASS actual BRep and exact rational planar surface coverage',numericalBudgets:'PASS 0.02/0.10 mm surfaces; 0.01 mm/0.0001 rad interfaces',reorderedPerturbedStarts:'PASS',overUnderconstraint:'PASS classified validation failures',requiredMutations:'PASS wrong-handed, shifted-pivot, missing-hole, wrong-axis, swapped-instance, 1000x plus topology/winding/double-conversion/BRep mutants',unknownNumericInputs:'PASS BLOCKED before solids',cliExitPolicy:'PASS 0/1/2/3; production unresolved lint cannot release',independentCleanRebuilds:'PASS normalized JSON and BRep equal; STEP raw unequal due timestamps',affectedDependencyRevalidation:'PASS two Python lines, exact JCS common vectors, 30 hash tests, 12 read-only graph contracts',m3Preservation:'PASS all 71 source/173 evidence bindings and accepted experience retained; no new session execution'},counts:{m4UniqueTests:54,independentCleanRuns:2,m1AffectedHashTests:30,m2ReadOnlyContracts:12,hashAcceptedPerPythonLine:7,hashRejectedPerPythonLine:16,counting:'No additive grand total; same 54 tests executed twice. Existing M3 counts remain accepted prior evidence, not new tests.'},qualifiedOutputs:qualification,revalidation,history:{initialCadRun:'4 FAIL / 31 PASS / 13 ERROR; rotvec branch rank and padded-bound defects fixed; XML retained',correctedSpike:'48/48 then 54/54; final clean runs separately qualified',broadM1Rerun:affected.priorBroadM1Attempt,originalM3Incidents:'All accepted M3 archived diagnostics, unclassified initial database, keys/raw backups and recovery archive preserved; never read or changed by M4'},limitations:{production:'BLOCKED Q-03–Q-12; no real kit solids, production datum choice or G-CAD/G-GEOMETRY admission',physical:'BLOCKED Q-01/Q-13; synthetic success proves no manufacturing tolerance, fit, torque, hidden engagement or owner equality',surfaceMethod:'Planar TEST profile only; unsupported/unbounded proof BLOCKED; no swept-path capability',runtime:'No TEST in production manifest; no GLB, frontend 3D, app/native build, hardware, M5–M14 or remote action',rights:'Q-17 remains scoped; no third-party binary/private source publication',native:'M3 reference/persistence/PDF only; GPU/performance and historical external CAD bridge qualification not extended'},invalidation:'Any source, lock, fixture, validator/solver, policy or bound evidence change invalidates this M4 receipt and requires affected qualification. Production identities remain separately pinned. No output/self/report/pack hash enters upstream fixture/toolchain inputs.',rollback:'Preserve original M1 locks/Git objects and M3 keys/sessions/backups/incident/recovery archives; additive named M4 reversion, never reset/clean owner data.',sourceBindings:sourceFiles.filter(p=>!p.includes('/__pycache__/')&&!p.includes('/.pytest_cache/')).sort().map(binding),evidenceBindings:evidenceFiles.sort().map(binding),selfExcluded:true,acceptanceCommit:'Recorded after local acceptance in separate receipt',m5ImplementationPerformed:false};
 fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log('M4 G-TOOLCHAIN report written; exact precommit/committed review still required.');
}
