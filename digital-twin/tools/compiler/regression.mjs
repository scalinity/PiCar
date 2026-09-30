import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,twin} from '../evidence/semantic.mjs';
const evidence='docs/implementation/evidence/m2/remediation-recheck',commands=[];
const cases=[['node',['--test','--test-reporter=tap',...fs.readdirSync(path.join(twin,'validation/tests')).filter(n=>n.endsWith('.test.mjs')).sort().map(n=>'digital-twin/validation/tests/'+n)],root,'final-m1-tests.tap'],['node',['digital-twin/tools/types.mjs','--check'],root,'final-types-check.txt'],...['test:unit','typecheck','content:check','package:check'].map(s=>['pnpm',[s],path.join(root,'picarx-companion'),'final-companion-'+s.replaceAll(':','-')+'.txt'])];
for(const [command,args,cwd,log] of cases){const r=spawnSync(command,args,{cwd,encoding:'utf8'}),logPath=evidence+'/'+log;fs.writeFileSync(path.join(root,logPath),r.stdout+r.stderr);commands.push({command:[command,...args],cwd:path.relative(root,cwd)||'.',exitCode:r.status,logPath});console.log([command,...args].join(' ')+' -> '+r.status);}
fs.writeFileSync(path.join(root,evidence,'final-regression-commands.json'),JSON.stringify(commands,null,2)+'\n');if(commands.some(c=>c.exitCode!==0))process.exitCode=1;
