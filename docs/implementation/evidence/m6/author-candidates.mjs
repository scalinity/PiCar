// Creates isolated presentation parameters from explicit corrected-photo features.
import fs from 'node:fs';import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p)),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const calibrationPath='docs/implementation/evidence/m6/calibration-02/calibration.json',cal=read(calibrationPath);
const definitions=[];
for(const plate of ['D','G','H']){
 const v=cal.views.find(v=>v.plate===plate&&v.index===1),f=v.metricCandidateFeatures;
 const center=f.holes.reduce((s,h)=>s.map((n,i)=>n+h.centerMm[i]/f.holes.length),[0,0]);
 const local=p=>[-(p[1]-center[1]),p[0]-center[0]];
 const holes=f.holes.map((h,i)=>({name:'visible.hole.'+(i+1),centerMm:local(h.centerMm),diameterMm:h.diameterMm,sourceImage:v.sourceImage,sourceRawSha256:v.sourceRawSha256}));
 let profile;
 if(plate==='D')profile={kind:'sampled-outline',verticesMm:f.outline.map(local),slots:f.slots.map((s,i)=>({name:'visible.slot.'+(i+1),endCentersMm:s.endCentersMm.map(local),widthMm:s.widthMm})),cutouts:[{name:'visible.central-opening',verticesMm:f.square.map(local)},{name:'visible.lower-opening-with-thumb-relief',verticesMm:f.lowerCutout.map(local)}]};
 else if(plate==='G')profile={kind:'capsule-bar',endCentersMm:[holes[0].centerMm,holes[2].centerMm],widthMm:8.1,widthBasis:'G_01 and G_02 visible approximately 130 annotation-pixel transverse spans relative to card; provisional rounded presentation estimate, not a DERIVED engineering value'};
 else {const b=f.outlineBounds.map(local);profile={kind:'rounded-notched-rectangle',xMin:Math.min(...b.map(p=>p[0])),xMax:Math.max(...b.map(p=>p[0])),yMin:Math.min(...b.map(p=>p[1])),yMax:Math.max(...b.map(p=>p[1])),cornerRadiusMm:3,cornerBasis:'Visible H_01 rounded corner occupies approximately 50 annotation pixels relative to card; provisional rounded appearance estimate',notchVerticesMm:f.notch.map(local)};}
 definitions.push({definitionId:'PX-V40-DEF-PLATE-'+plate,plate,track:'instructional-only',purpose:'provisional-review',engineeringStatus:'BLOCKED',instructionalStatus:'BLOCKED',thickness:{valueMm:2,confidence:'PROBABLE',basis:'Owner working same-stock hypothesis; not manufacturer-certified'},presentationOrigin:{kind:'replaceable',engineeringDatum:false,cardMetricCenterMm:center,axes:'RH millimeters: local X points toward primary image top; local Y toward image right; local Z through stock. No assembly pose/datum admitted.'},holes,profile,provenance:{calibrationPath,calibrationRawSha256:hash(calibrationPath),sourceImage:v.sourceImage,sourceRawSha256:v.sourceRawSha256,method:v.perspective.method,lens:v.lens,uncertainty:v.uncertainty,limitations:v.limitations,engineeringValue:{state:'unresolved',confidence:'UNRESOLVED',blockerIds:['Q-03']},numericScope:'All listed numbers are candidate presentation parameters; no canonical measurement/interface input'},blockerIds:['M6-CALIBRATION-UNCERTAINTY','M6-FULL-SOURCE-PROJECTION','M6-INSTRUCTIONAL-ORIENTATION','Q-03']});
}
fs.writeFileSync('digital-twin/validation/expected/plates/instructional/candidate-parameters.json',JSON.stringify({track:'instructional-only',candidateOnly:true,engineeringAdmission:false,instructionalAdmission:false,definitions},null,2)+'\n');
console.log('Three provisional candidates authored; all admission remains BLOCKED.');
