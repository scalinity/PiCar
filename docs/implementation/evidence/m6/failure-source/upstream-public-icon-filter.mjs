import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
const root=process.cwd(),label=process.argv[2],out='docs/implementation/evidence/m6/'+label;
assert(/^[a-z0-9-]+$/.test(label),'LABEL');
const mirror=JSON.parse(fs.readFileSync(out+'/environment.json')).mirror;
assert(mirror.startsWith('/private/var/folders/')&&mirror.includes('/picar-m6-'),'DISPOSABLE_MIRROR_ONLY');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const prior=JSON.parse(fs.readFileSync('docs/implementation/evidence/m5/qualification-02/mirror-inputs.json'));
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const names=[...prior.map(b=>b.path),'digital-twin/tools/evidence/m6-plates.mjs',...walk('digital-twin/validation/expected/plates/instructional')];
const inputs=[...new Set(names)].map(p=>{
 assert(!p.includes('/private/')&&!p.includes('/source-vault/')&&!/\.(?:sqlite|db|zip|jpeg|png|whl)$/.test(p),'FORBIDDEN_MIRROR_INPUT '+p);
 const b=fs.readFileSync(p),dest=path.join(mirror,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);
 const old=prior.find(x=>x.path===p);return{path:p,rawSha256:hash(b),bytes:b.length,priorM5SnapshotEqual:old?hash(b)===old.rawSha256:null};
});
fs.writeFileSync(out+'/upstream-inputs.json',JSON.stringify(inputs,null,2)+'\n');
fs.writeFileSync(path.join(mirror,'.git'),'gitdir: '+path.join(root,'.git')+'\n');
const nm=path.join(mirror,'digital-twin/node_modules');if(!fs.existsSync(nm))fs.symlinkSync(path.join(root,'digital-twin/node_modules'),nm,'dir');
const restored=[];
for(const n of ['pyproject.toml','uv.lock']){
 const src=path.join(mirror,'digital-twin/validation/m4/prior-m1',n),dest=path.join(mirror,'digital-twin',n),b=fs.readFileSync(src);
 restored.push({source:path.relative(mirror,src),destination:path.relative(mirror,dest),rawSha256:hash(b),bytes:b.length});fs.writeFileSync(dest,b);
}
const commands=[];
function run(name,args){
 const startedAt=new Date().toISOString(),r=spawnSync(process.execPath,args,{cwd:mirror,encoding:'utf8',maxBuffer:32*1024*1024}),log=(r.stdout??'')+(r.stderr??'');
 fs.writeFileSync(out+'/'+name+'.txt',log);
 const count=n=>Number(log.match(new RegExp('^# '+n+' (\\d+)$','m'))?.[1]??0);
 commands.push({name,command:[process.execPath,...args],cwd:mirror,environment:{NODE_OPTIONS:process.env.NODE_OPTIONS??null},startedAt,finishedAt:new Date().toISOString(),exit:r.status,expectedExit:0,counts:name.includes('tests')?Object.fromEntries(['tests','pass','fail','skipped'].map(n=>[n,count(n)])):null,log:{path:out+'/'+name+'.txt',rawSha256:hash(Buffer.from(log)),bytes:Buffer.byteLength(log)}});
 fs.writeFileSync(out+'/upstream-commands.json',JSON.stringify({scope:'Read-only original-lock adoption checks and selected non-session tests in disposable mirror',originalLocksRestoredOnlyInMirror:restored,gitAccess:'Read-only merge-base ancestry query through live object database; no checkout/index/session operations',commands},null,2)+'\n');
 assert.equal(r.status,0,name+' '+log);
}
run('g-data-check',['digital-twin/tools/compiler/upstream.mjs','--check']);
run('g-graph-check',['digital-twin/tools/compiler/gate.mjs','--check']);
run('m2-contract-tests',['--test','--test-reporter=tap','digital-twin/validation/m2/tests/contracts.test.mjs']);
run('semantic-firewall-tests',['--test','--test-reporter=tap','--test-name-pattern=unknown numeric with payload|owned rivet pin double-counted|probable generic HAT|official reference approximation|source limitations silently discarded|open conflict treated|resolved conflict loses|integrated cable misclassified|integrated cable endpoint|integrated lead has owner','digital-twin/validation/tests/semantic.test.mjs']);
run('m6-policy-tests',['--test','--test-reporter=tap','digital-twin/validation/expected/plates/instructional/plates.test.mjs']);
console.log(JSON.stringify({status:'PASS',mirror,commands:commands.map(c=>({name:c.name,exit:c.exit,counts:c.counts})),snapshotDifferences:inputs.filter(b=>b.priorM5SnapshotEqual===false)}));
