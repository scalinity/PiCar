// Downstream documentation only. No upstream writer, admission or self binding.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {validateHashInputs,identities} from '../../../../digital-twin/tools/evidence/identity.mjs';
import {loadRegistry} from '../../../../digital-twin/tools/evidence/semantic.mjs';
import {verifyAdoption} from '../../../../digital-twin/tools/export/m4-adoption.mjs';
const root=process.cwd(),reportPath='docs/implementation/M5_GATE_REPORT.json';
const read=p=>JSON.parse(fs.readFileSync(p));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024}).trim();
const tracked=new Set(execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean));
function binding(p){
 const b=fs.readFileSync(p);let gitBlob=null;
 if(tracked.has(p)){const original=execFileSync('git',['show','HEAD:'+p],{maxBuffer:32*1024*1024});assert(b.equals(original),'TRACKED_DRIFT '+p);gitBlob=git('rev-parse','HEAD:'+p);assert.equal(git('cat-file','-t',gitBlob),'blob');}
 return {path:p,rawSha256:hash(b),bytes:b.length,gitBlob,gitRetention:gitBlob?'retained HEAD blob':'not Git-retained; uncommitted authored output or ignored candidate bytes'};
}
function verify(b){const bytes=fs.readFileSync(b.path);assert.equal(bytes.length,b.bytes??b.byteLength,b.path);assert.equal(hash(bytes),b.rawSha256??b.sha256,b.path);if(b.gitBlob){assert.equal(git('cat-file','-t',b.gitBlob),'blob');const old=execFileSync('git',['cat-file','blob',b.gitBlob],{maxBuffer:32*1024*1024});assert(old.equals(bytes),'GIT_BINDING '+b.path);}}
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);}
function invariants(){
 assert.equal(git('branch','--show-current'),'codex/m5-purchased-components');
 assert.equal(git('rev-parse','HEAD'),'5a4077285f4d31d69b0959527e480037be1ee8db');
 assert.equal(git('diff','--name-only'),'');assert.equal(git('diff','--cached','--name-only'),'');assert.equal(git('ls-files','digital-twin/evidence/private'),'');
 validateHashInputs(read('digital-twin/hash-inputs.json'));
 const adoption=verifyAdoption();assert.deepEqual(identities(loadRegistry()),adoption.activeIdentities);
 const scopes=read('digital-twin/validation/expected/m5/scope-receipts.json');
 assert.equal(scopes.receipts.length,50);assert.equal(scopes.admitted.length,0);assert.equal(scopes.partial.length,3);assert.equal(scopes.blocked.length,47);assert.equal(scopes.integralCableScopes.length,6);
 for(const s of scopes.receipts){assert.equal(s.status,'BLOCKED');assert.equal(s.productionAdoption,false);assert.equal(s.generatedProductionSolids,0);for(const f of s.requiredFeatures)assert.equal(f.value.state,'unresolved');}
 for(const s of scopes.integralCableScopes){assert.equal(s.status,'BLOCKED');assert.equal(s.purchasedItemIncrement,0);}
 const records=read('digital-twin/validation/expected/m5/candidate-sources.json');assert.equal(records.records.length,16);
 for(const r of records.records){verify({path:r.artifact.path,sha256:r.artifact.sha256,bytes:r.artifact.byteLength});assert.equal(r.engineeringUse,'referenceOnly');assert.equal(git('ls-files','--',r.artifact.path),'');execFileSync('git',['check-ignore','-q',r.artifact.path]);}
 for(const m of records.zipMembers)verify(m);
 const base='docs/implementation/evidence/m5/qualification-02/';
 const commands=read(base+'commands.json');assert.equal(commands.length,22);for(const c of commands){assert.equal(c.exit,c.expectedExit,c.name);verify(c.log);}
 for(const label of ['a','b']){
  const p=base+label+'-pi5-inspection.json',j=read(p);assert.equal(j.status,'BLOCKED');assert.equal(j.generatedProductionSolids,0);assert.equal(j.sourceShapeValid,true);assert.equal(j.importedSolidCount,2689);assert.equal(j.validImportedSolidCount,2689);assert(j.solids.every(s=>s.valid&&s.classification==='UNRESOLVED'));
  const tests=fs.readFileSync(base+label+'-identity-guard-tests.txt','utf8');assert.match(tests,/3 passed/);assert(!/\d+ (failed|skipped|error)/.test(tests));
  for(const [file,count] of [['candidate-evidence-tests',28],['read-only-graph-contracts',12],['source-firewall-tests',10]]){const text=fs.readFileSync(base+label+'-'+file+'.txt','utf8');assert.match(text,new RegExp('# pass '+count+'\\n'));assert.match(text,/# fail 0\n/);assert.match(text,/# skipped 0\n/);}
 }
 const wheels=['a','b'].map(l=>read(base+l+'-wheel.json'));assert.deepEqual(wheels[0],wheels[1]);assert.equal(wheels[0].bytes,20497);
 assert(fs.readFileSync(base+'a-pi5-inspection.json').equals(fs.readFileSync(base+'b-pi5-inspection.json')));
 for(const b of read(base+'mirror-inputs.json'))verify(b);
 return {adoption,scopes,records,commands,wheel:wheels[0]};
}
const state=invariants();
if(process.argv[2]==='--write'){
 assert(!fs.existsSync(reportPath),'NEW_REPORT_REQUIRED');
 const base='docs/implementation/evidence/m5/',preflight=read(base+'preservation-final.json');
 for(const b of preflight.consumedInputs)verify(b);for(const b of preflight.diagnostics)verify(b);
 const sourcePaths=[...preflight.consumedInputs.map(b=>b.path),...read(base+'qualification-02/mirror-inputs.json').map(b=>b.path),'digital-twin/cad/source-vault/.gitignore','docs/implementation/M5_EXECUTION_PLAN.md','docs/implementation/M5_REPORT.md','docs/implementation/M5_REMEDIATION.md',...walk(base).filter(p=>p.endsWith('.mjs'))];
 const evidencePaths=walk(base).filter(p=>!p.endsWith('.mjs'));
 const vendorPaths=[...state.records.records.map(r=>r.artifact.path),...state.records.zipMembers.map(m=>m.path)];
 const researchPaths=walk('.firecrawl/m5');
 const toolPaths=['/opt/homebrew/bin/uv',process.execPath,'/opt/homebrew/bin/firecrawl','/opt/homebrew/bin/pdftoppm','/opt/homebrew/bin/pdftotext','/opt/homebrew/bin/pdfinfo','/usr/bin/unzip'];
 const report={milestone:'M5',gate:'G-COMPONENT',status:'BLOCKED',createdAt:new Date().toISOString(),
  authorization:'Owner explicitly authorized bounded M5 execution in current chat; no hardware/owner-data/publication/remote/M6+ permission',
  branch:git('branch','--show-current'),head:git('rev-parse','HEAD'),implementationAcceptanceCommit:null,
  sourceBindings:[...new Set(sourcePaths)].sort().map(binding),evidenceBindings:[...new Set(evidencePaths)].sort().map(binding),
  candidateVendorBindings:[...new Set(vendorPaths)].sort().map(binding),ignoredResearchBindings:researchPaths.sort().map(binding),
  toolExecutableBindings:toolPaths.map(p=>{const actual=fs.realpathSync(p),bytes=fs.readFileSync(actual);return {invokedPath:p,actualPath:actual,rawSha256:hash(bytes),bytes:bytes.length,gitBlob:null,role:'Installed execution tool; not staged or distributed'};}),
  runtime:{node:process.version,uv:execFileSync('/opt/homebrew/bin/uv',['--version'],{encoding:'utf8'}).trim(),os:execFileSync('/usr/bin/sw_vers',[],{encoding:'utf8'}).trim(),architecture:process.arch},
  unchangedProductionIdentities:state.adoption.activeIdentities,upstreamAdoption:state.adoption,
  preservation:preflight.preservation,retainedUpstreamGitObjectsReceipt:binding(base+'preservation-final.json'),
  adoptedComponentRevisions:[],generatedProductionSolids:0,scopeReceipt:binding('digital-twin/validation/expected/m5/scope-receipts.json'),
  admitted:state.scopes.admitted,partialInvestigations:state.scopes.partial,blockedInvestigations:state.scopes.blocked,
  gComponentScopes:state.scopes.receipts.map(s=>({scopeId:s.scopeId,definitionId:s.definitionId,status:s.status,milestoneDisposition:s.milestoneDisposition,blockerIds:s.blockerIds,productionAdoption:false})),
  integralLeadScopeCount:6,purchasedItemIncrementFromIntegralLeads:0,
  tests:{mirrors:2,perMirror:{m5Python:3,m5CandidateEvidence:28,inheritedM2Contracts:12,selectedInheritedSemantic:10,failures:0,errors:0,skips:0},fullM1OrM3SuiteRerun:false,upstreamChecks:'Read-only original-lock G-DATA/G-GRAPH PASS in both safe mirrors',candidateInspectionExit:2,candidateInspectionStatus:'BLOCKED',productionAdmission:false},
  reproducibility:{scope:'Candidate inspector only; no production geometry qualification',wheel:state.wheel,inspectionReportsEqual:true,independentEnvironmentsAndCaches:true,sourceBytesStable:true},
  history:{preliminaryRun:'qualification-01: then-current 2 Python guards; no later candidate-evidence suite; retained outputs/source snapshots',initialCandidateTests:{pass:18,fail:10,reason:'Test setup omitted accepted planning steps; UNKNOWN_REFERENCE precedes intended rejection. Corrected; final suite 28/28 each mirror.',receipt:base+'initial-candidate-tests.tap.json'},initialSearchReader:'Interactive reader ENOENT for successful empty Firecrawl searches without results JSON; console transcript not separately exported, acquisition/search logs retained',preliminaryRunner:'Original preliminary runner not separately archived; executed subprocess ledger and captured inputs retained',searchBudgetDeviation:'Q-08 three queries across camera/sensor targets versus initial two-per-blocker wording; total discovery remains bounded at sixteen searches'},
  hashPolicy:'No M5 downstream report/candidate source is adopted into upstream model/schema/evidence identities; no old identity rebound',
  selfBinding:false,excludedDownstreamPaths:[reportPath,base+'closure-check.json',base+'closure-check.txt',base+'final-worktree.json'],
  nextAuthority:'M5 evidence remediation only. No M6 kickoff.',rollback:'No production revision adopted; preserve candidate sources and receipts. Future rollback is additive and scoped to changed dependent solutions/assets.'};
 fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:'BLOCKED',admitted:0,partial:3,blocked:47,gComponentBlocked:50,report:reportPath}));
}else if(process.argv[2]==='--check'){
 const r=read(reportPath);assert.equal(r.status,'BLOCKED');assert.equal(r.selfBinding,false);
 for(const family of ['sourceBindings','evidenceBindings','candidateVendorBindings','ignoredResearchBindings'])for(const b of r[family]){assert.notEqual(b.path,reportPath);verify(b);}
 assert.equal(r.gComponentScopes.length,50);assert(r.gComponentScopes.every(s=>s.status==='BLOCKED'));
 console.log(JSON.stringify({status:'BLOCKED',bindingCheck:'PASS',unchangedProductionInputs:true,admitted:0,partial:3,blocked:47,gComponentBlocked:50}));
}else throw Error('Use --write or --check');
process.exitCode=2;
