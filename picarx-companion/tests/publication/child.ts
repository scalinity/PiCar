import { acquire, recover, publish, staleLeaseReport } from '../../tools/content-pipeline/publication';
const [app,stage,point,mode]=process.argv.slice(2);
if(mode==='recover'){staleLeaseReport(app,true);const release=acquire(app,'writer');recover(app,p=>{if(p===point)process.exit(77);});release();}
else {const release=acquire(app,'writer');publish(app,stage,()=>{},p=>{if(p===point)process.exit(77);});release();}
