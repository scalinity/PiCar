// Bounded public official-source acquisition. Raw web/vendor bytes stay ignored.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
const root=process.cwd(),cache='.firecrawl/m5',vault='digital-twin/cad/source-vault/m5';
fs.mkdirSync(vault,{recursive:true});fs.mkdirSync(cache,{recursive:true});
const output=process.argv[2];if(!output||fs.existsSync(output))throw Error('NEW_RECEIPT_REQUIRED');
const receipt={scope:'M5 bounded official/OEM discovery; no admission or redistribution',commands:[],downloads:[],searches:[]};
const save=()=>fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function pairs(items,fn){for(let i=0;i<items.length;i+=2)await Promise.allSettled(items.slice(i,i+2).map(fn));}
const files=[
 ['pi4-drawing','pdf','https://pip-assets.raspberrypi.com/categories/545-raspberry-pi-4-model-b/documents/RP-008343-DS-1-raspberry-pi-4-mechanical-drawing.pdf'],
 ['pi5-drawing','pdf','https://pip-assets.raspberrypi.com/categories/892-raspberry-pi-5/documents/RP-008347-DS-1-raspberry-pi-5-mechanical-drawing.pdf'],
 ['zero2w-drawing','pdf','https://pip-assets.raspberrypi.com/categories/584-raspberry-pi-zero-2-w/documents/RP-008358-DS-1-raspberry-pi-zero-2-w-mechanical-drawing.pdf'],
 ['pi5-step-zip','zip','https://pip-assets.raspberrypi.com/categories/892-raspberry-pi-5/documents/RP-010083-CA-1-rpi-5%203D%20STEP%20-%20No%20Graphics%20small%20file.zip']
];
await pairs(files,async([id,extension,url])=>{const record={id,url,retrievedAt:new Date().toISOString(),rights:{status:'UNRESOLVED',redistributionAllowed:false},admitted:false};receipt.downloads.push(record);try{const response=await fetch(url,{signal:AbortSignal.timeout(60000),redirect:'follow'});record.httpStatus=response.status;record.resolvedUrl=response.url;record.contentType=response.headers.get('content-type');if(!response.ok)throw Error('HTTP_'+response.status);const declared=Number(response.headers.get('content-length'));if(declared>50*1024*1024)throw Error('ACQUISITION_SIZE_BOUND');const chunks=[];let length=0;for await(const chunk of response.body){length+=chunk.length;if(length>50*1024*1024)throw Error('ACQUISITION_SIZE_BOUND');chunks.push(chunk);}const bytes=Buffer.concat(chunks);if(extension==='pdf'&&!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw Error('NOT_PDF');if(extension==='zip'&&!bytes.subarray(0,2).equals(Buffer.from('PK')))throw Error('NOT_ZIP');record.rawSha256=hash(bytes);record.bytes=bytes.length;record.path=path.join(vault,record.rawSha256+'.'+extension);if(fs.existsSync(record.path)){if(!bytes.equals(fs.readFileSync(record.path)))throw Error('VAULT_COLLISION');}else fs.writeFileSync(record.path,bytes,{flag:'wx'});record.status='ACQUIRED_UNREVIEWED';}catch(e){record.status='BLOCKED';record.reason=e.message;}save();console.log(id+' '+record.status);});
const queries=[
 ['kit-v40','site:sunfounder.com PiCar-X Z0104V40 mechanical CAD STEP drawing parts'],
 ['motor','site:sunfounder.com PiCar-X TT motor gearbox shaft mounting drawing model'],
 ['servo','site:sunfounder.com PiCar-X servo horn model spline drawing SG90 MG90S'],
 ['fasteners','site:sunfounder.com PiCar-X R2048 R2056 R30185 washer standoff drawing'],
 ['hat','site:docs.sunfounder.com Robot HAT v4 schematic PCB dimensions revision PiCar-X'],
 ['camera','site:docs.sunfounder.com PiCar-X OV5647 camera dimensions 24 23.5 25'],
 ['sensors','site:docs.sunfounder.com PiCar-X grayscale ultrasonic module dimensions 3V3 5V schematic'],
 ['cables','site:docs.sunfounder.com PiCar-X camera ribbon FPC FFC cable pitch connector pinout length'],
 ['battery','site:sunfounder.com PiCar-X battery pack connector dimensions'],
 ['wheels','site:sunfounder.com PiCar-X front rear wheel hub dimensions drawing']
];
await pairs(queries,async([id,query])=>{const resultPath=path.join(cache,'search-'+id+'.json'),args=['search',query,'--limit','3','--json','-o',resultPath];const record={id,query,command:['firecrawl',...args],cwd:root,environment:{FIRECRAWL_NO_SEARCH_FEEDBACK:'1',FIRECRAWL_NO_ENDPOINT_FEEDBACK:'1'},startedAt:new Date().toISOString(),resultsPath:resultPath};receipt.searches.push(record);await new Promise(resolve=>{const child=spawn('firecrawl',args,{cwd:root,env:{...process.env,...record.environment},stdio:['ignore','pipe','pipe']});let log='';child.stdout.on('data',b=>log+=b);child.stderr.on('data',b=>log+=b);const timer=setTimeout(()=>child.kill('SIGTERM'),70000);child.on('error',e=>{record.error=e.message;});child.on('close',(code,signal)=>{clearTimeout(timer);record.exit=code;record.signal=signal;record.finishedAt=new Date().toISOString();record.status=code===0?'SEARCH_RETURNED':'BLOCKED';fs.writeFileSync(path.join(cache,'search-'+id+'.txt'),log);if(fs.existsSync(resultPath)){const b=fs.readFileSync(resultPath);record.rawSha256=hash(b);record.bytes=b.length;}receipt.commands.push(record);save();console.log('search '+id+' '+record.status);resolve();});});});
save();
