// Rasterize only authored proxy SVGs for local evidence review, never owner pixels.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require('/Users/danny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const [dir,out]=process.argv.slice(2);if(!dir||!out||fs.existsSync(out))throw Error('NEW_REVIEW_REQUIRED');fs.mkdirSync(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),names=fs.readdirSync(dir).filter(f=>f.endsWith('.svg')).sort(),inputs=[],outputs=[];
if(names.length!==50)throw Error('FIFTY_PROJECTIONS_REQUIRED');
for(let start=0;start<names.length;start+=12){
 const overlays=[];for(const [i,n]of names.slice(start,start+12).entries()){const bytes=fs.readFileSync(path.join(dir,n));if(/<image|data:image|base64/i.test(bytes.toString()))throw Error('PIXEL_INPUT_FORBIDDEN');inputs.push({file:n,rawSha256:hash(bytes),bytes:bytes.length});overlays.push({input:await sharp(bytes).resize(420,420).flatten({background:'#ffffff'}).png().toBuffer(),left:(i%4)*420,top:Math.floor(i/4)*420});}
 const dest=path.join(out,'sheet-'+(Math.floor(start/12)+1)+'.png');await sharp({create:{width:1680,height:1260,channels:3,background:'#ffffff'}}).composite(overlays).png().toFile(dest);const bytes=fs.readFileSync(dest);outputs.push({file:path.basename(dest),rawSha256:hash(bytes),bytes:bytes.length});
}
fs.writeFileSync(path.join(out,'rendering.json'),JSON.stringify({scope:'Authored instructional projections only; no private source pixels',inputs,outputs,sharpVersion:sharp.versions.sharp,command:[process.execPath,...process.argv.slice(1)],cwd:process.cwd(),status:'PASS'},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',projections:50,sheets:outputs.length}));
