import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { twin } from './evidence/semantic.mjs';
import { strictParse, jcs, H, read, fileHash } from './evidence/hash.mjs';
import { normalize } from './evidence/identity.mjs';
const vectors=path.join(twin,'validation/fixtures/hash-vectors.json');const corpus=read(vectors);
const js=[...corpus.valid,...corpus.invalid].map(v=>{try{const value=normalize(strictParse(v.input));return{id:v.id,status:'accepted',canonical:jcs(value).toString(),hash:H(corpus.kind,value)};}catch(e){return{id:v.id,status:'rejected',error:e.message};}});
const python=JSON.parse(execFileSync('uv',['run','--locked','python','validation/hash-python.py',vectors],{cwd:twin,encoding:'utf8'}));
const rust=JSON.parse(execFileSync('cargo',['run','--locked','--quiet','--manifest-path','validation/hash-rust/Cargo.toml','--',vectors],{cwd:twin,encoding:'utf8'}));
for(const [language,result]of Object.entries({javascript:js,python,rust})){
 for(const v of corpus.valid){const r=result.find(r=>r.id===v.id);if(r?.status!=='accepted'||r.canonical!==v.canonical||r.hash!==js.find(x=>x.id===v.id)?.hash)throw Error(language+' canonical mismatch: '+v.id+' '+JSON.stringify(r));}
 for(const v of corpus.invalid){const r=result.find(r=>r.id===v.id);if(r?.status!=='rejected'||r.error!==v.error)throw Error(language+' rejection mismatch: '+v.id+' '+JSON.stringify(r));}
}
const report={status:'PASS',scope:corpus.valid.length+' accepted and '+corpus.invalid.length+' rejected common vectors in three independent libraries',versions:{node:process.version,canonicalize:'2.1.0',rust:execFileSync('rustc',['--version'],{encoding:'utf8'}).trim(),serde_json_canonicalizer:'0.3.2',python:execFileSync('uv',['run','--locked','python','--version'],{cwd:twin,encoding:'utf8'}).trim(),rfc8785:'0.1.4'},vectorSha256:fileHash(vectors),results:{javascript:js,python,rust}};
fs.writeFileSync(path.join(twin,'validation/hash-cross-language-report.json'),JSON.stringify(report,null,2)+'\n');console.log(report.scope+' PASS');
