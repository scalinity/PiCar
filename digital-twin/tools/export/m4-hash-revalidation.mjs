// Reuse the accepted M1 Python harness, compare actual bytes to JS and the
// unchanged accepted Rust witness. No Rust recompilation or artifact writers.
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {twin} from '../evidence/semantic.mjs';
import {read,strictParse,jcs,H,fileHash} from '../evidence/hash.mjs';
import {normalize} from '../evidence/identity.mjs';
const interpreter=process.argv[2];if(!interpreter)throw Error('EXPLICIT_ISOLATED_INTERPRETER_REQUIRED');
const vectors=path.join(twin,'validation/fixtures/hash-vectors.json'),corpus=read(vectors);
const python=JSON.parse(execFileSync(interpreter,[path.join(twin,'validation/hash-python.py'),vectors],{encoding:'utf8'}));
const js=[...corpus.valid,...corpus.invalid].map(v=>{try{const value=normalize(strictParse(v.input));return {id:v.id,status:'accepted',canonical:jcs(value).toString(),hash:H(corpus.kind,value)};}catch(e){return {id:v.id,status:'rejected',error:e.message};}});
const rust=read(path.join(twin,'validation/m2/hash-conformance.json')).results.rust;
for(const actual of [python,rust])if(!jcs(actual).equals(jcs(js)))throw Error('EXACT_CANONICAL_VECTOR_DRIFT');
console.log(JSON.stringify({status:'PASS',pythonVersion:execFileSync(interpreter,['--version'],{encoding:'utf8'}).trim(),vectorSha256:fileHash(vectors),accepted:corpus.valid.length,rejected:corpus.invalid.length,pythonCurrent:true,javascriptCurrent:true,rust:'Retained unchanged accepted Rust witness, not a new execution',results:python}));
