import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import {execFileSync,spawnSync} from 'node:child_process';
const root=process.cwd(),mirror=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'picar-m6-analysis-'))),out='docs/implementation/evidence/m6/analysis-02',commands=[];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const names=[...execFileSync('git',['ls-files','digital-twin/cad'],{encoding:'utf8'}).trim().split('\n').filter(p=>!p.includes('source-vault/')),...['pyproject.toml','uv.lock','toolchain.lock.json'].map(p=>'digital-twin/'+p)];
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
for(const p of walk('digital-twin/cad/twin_cad/components/plates'))if(!names.includes(p)&&p.endsWith('.py'))names.push(p);
const inputs=names.map(p=>{const b=fs.readFileSync(p),dest=path.join(mirror,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);return{path:p,rawSha256:hash(b),bytes:b.length};});
const cwd=path.join(mirror,'digital-twin'),env={...process.env,UV_PROJECT_ENVIRONMENT:path.join(mirror,'environment'),UV_CACHE_DIR:path.join(mirror,'uv-cache')},python=path.join(mirror,'environment/bin/python');
function run(name,command,args){const r=spawnSync(command,args,{cwd,env,encoding:'utf8',maxBuffer:32*1024*1024}),log=(r.stdout??'')+(r.stderr??'');fs.writeFileSync(out+'/'+name+'.txt',log);commands.push({name,command:[command,...args],cwd,environment:{UV_PROJECT_ENVIRONMENT:env.UV_PROJECT_ENVIRONMENT,UV_CACHE_DIR:env.UV_CACHE_DIR},inputs,exit:r.status,log:{path:out+'/'+name+'.txt',rawSha256:hash(Buffer.from(log)),bytes:Buffer.byteLength(log)}});fs.writeFileSync(out+'/analysis-commands.json',JSON.stringify(commands,null,2)+'\n');if(r.status!==0)throw Error(name+' failed: '+log);}
run('analysis-frozen-install','/opt/homebrew/bin/uv',['sync','--frozen','--group','m4','--python','3.12.14','--no-install-package','twin-cad']);
run('analysis-wheel-build','/opt/homebrew/bin/uv',['build','--wheel','--no-build-isolation','--python',python,'cad','--out-dir',path.join(mirror,'wheel')]);
const wheel=path.join(mirror,'wheel',fs.readdirSync(path.join(mirror,'wheel')).find(p=>p.endsWith('.whl')));
run('analysis-wheel-install','/opt/homebrew/bin/uv',['pip','install','--python',python,'--no-deps',wheel]);
const packagePath=path.join(root,'docs/PiCar Plate Pictures/PiCar-X-Z0104V40-Plate-Photo-Evidence'),privateOutput=path.join(root,'digital-twin/evidence/private/m6/contacts');
run('analysis-contacts',python,['-m','twin_cad.components.plates.instructional.image_analysis','--package',packagePath,'--private-output',privateOutput]);
fs.writeFileSync(out+'/analysis-environment.json',JSON.stringify({mirror,python,wheel,privateOutput,inputs},null,2)+'\n');console.log(JSON.stringify({mirror,privateOutput}));
