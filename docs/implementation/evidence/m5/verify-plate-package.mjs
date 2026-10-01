// Private evidence integrity only; no image reconstruction or source publication.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const parent='docs/PiCar Plate Pictures',name='PiCar-X-Z0104V40-Plate-Photo-Evidence',dir=path.join(parent,name),zip=path.join(parent,name+'.zip');
const output=process.argv[2];assert(output&&!fs.existsSync(output),'NEW_RECEIPT_REQUIRED');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const binding=p=>{const b=fs.readFileSync(p);return{path:p,rawSha256:hash(b),bytes:b.length,privacy:'privateOwnerEvidence',gitTracked:false}};
const before=binding(zip),commands=[];
function run(args){const startedAt=new Date().toISOString(),result=execFileSync('/usr/bin/unzip',args,{maxBuffer:64*1024*1024});commands.push({command:['/usr/bin/unzip',...args],cwd:process.cwd(),environment:'inherited',startedAt,finishedAt:new Date().toISOString(),exit:0});return result;}
run(['-t',zip]);
const members=run(['-Z1',zip]).toString().trim().split('\n');
assert.equal(new Set(members).size,members.length,'DUPLICATE_ZIP_MEMBER');
for(const m of members)assert(m.startsWith(name+'/')&&!m.split('/').includes('..')&&!m.includes('\\'),'UNSAFE_ZIP_PATH');
const files=members.filter(m=>!m.endsWith('/')).map(m=>m.slice(name.length+1));
function csv(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if(c==='\n'&&!quoted){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}assert(!quoted,'CSV_QUOTES');if(field||row.length){row.push(field);rows.push(row);}const header=rows.shift();return rows.filter(r=>r.some(Boolean)).map(r=>{assert.equal(r.length,header.length);return Object.fromEntries(header.map((h,i)=>[h,r[i]]));});}
const manifestPath=path.join(dir,'PHOTO_MANIFEST.csv'),readmePath=path.join(dir,'README.md');
const manifestBytes=fs.readFileSync(manifestPath),readmeBytes=fs.readFileSync(readmePath);
assert(run(['-p',zip,name+'/PHOTO_MANIFEST.csv']).equals(manifestBytes),'ZIP_MANIFEST_MISMATCH');
assert(run(['-p',zip,name+'/README.md']).equals(readmeBytes),'ZIP_README_MISMATCH');
const rows=csv(manifestBytes.toString()),expected={'Plate-A':13,'Plate-B':7,'Plate-C':14,'Plate-D':6,'Plate-E':8,'Plate-F':6,'Plate-G':3,'Plate-H':3,'Plate-E-F-Mirror-Comparison':2},counts={},bindings=[];
assert.equal(rows.length,62);assert.equal(new Set(rows.map(r=>r.relative_path)).size,62);
for(const r of rows){assert(Object.hasOwn(expected,r.folder),'UNKNOWN_FOLDER');assert.equal(r.relative_path,r.folder+'/'+r.new_filename);assert.equal(path.basename(r.relative_path),r.new_filename);const p=path.join(dir,r.relative_path),b=fs.readFileSync(p);assert.equal(hash(b),r.sha256);assert.equal(b.length,Number(r.file_size_bytes));assert(run(['-p',zip,name+'/'+r.relative_path]).equals(b),'ZIP_IMAGE_MISMATCH');counts[r.folder]=(counts[r.folder]??0)+1;bindings.push({path:r.relative_path,rawSha256:hash(b),bytes:b.length});assert.equal(execFileSync('git',['ls-files','--',p],{encoding:'utf8'}).trim(),'');execFileSync('git',['check-ignore','-q',p]);}
assert.deepEqual(counts,expected);assert.equal(new Set(bindings.map(b=>b.rawSha256)).size,62,'DUPLICATE_IMAGE_HASH');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.relative(dir,path.join(p,e.name))]);
const wanted=['README.md','PHOTO_MANIFEST.csv',...rows.map(r=>r.relative_path)].sort();
assert.deepEqual(files.sort(),wanted,'UNRELATED_ZIP_FILES');assert.deepEqual(walk(dir).sort(),wanted,'UNRELATED_FOLDER_FILES');
assert.deepEqual(binding(zip),before,'ARCHIVE_CHANGED');
execFileSync('git',['check-ignore','-q',zip]);
const receipt={status:'PASS',scope:'M6 handoff integrity only; no plate geometry admitted',archive:before,manifest:binding(manifestPath),readme:binding(readmePath),crcIntegrity:'PASS',zipMatchesExtractedBytes:true,manifestMatchesActualImageBytes:true,uniqueImages:62,counts,unrelatedFiles:0,images:bindings,commands,handling:'Original owner paths retained; ignored/untracked/unstaged; no bytes moved, copied, recompressed or published',context:{plateE:'robot RIGHT',plateF:'robot LEFT',workingThicknessMm:2,workingThicknessConfidence:'PROBABLE',workingThicknessBasis:'Owner-reviewed photo-supported context; not calibrated or manufacturer-certified',manufacturingAdmission:false}};
fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({status:'PASS',archive:before,counts,total:62}));
