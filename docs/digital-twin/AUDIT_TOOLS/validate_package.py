#!/usr/bin/env python3
"""Reproduce the audited specification-package checks, never application/CAD tests.

Run from any directory: python AUDIT_TOOLS/validate_package.py [--write]
--write replaces only the two validation reports and package integrity manifest.
Default checks the immutable input digest, report results and complete manifest.
"""
from __future__ import annotations
import argparse, collections, hashlib, importlib.metadata, json, math, re, sys
from pathlib import Path
from typing import Any
from PIL import Image
from jsonschema import Draft202012Validator

ROOT=Path(__file__).resolve().parents[1]
M=ROOT/'MACHINE_READABLE_SCHEMAS'
EXCLUDED={'AUDITED_PACKAGE_VALIDATION_REPORT.json','PACKAGE_VALIDATION_REPORT.json','PACKAGE_MANIFEST.sha256'}
checks:list[dict[str,Any]]=[]

def sha(path:Path)->str:return hashlib.sha256(path.read_bytes()).hexdigest()
def strict_pairs(pairs:list[tuple[str,Any]])->dict[str,Any]:
 out={}
 for k,v in pairs:
  if k in out: raise ValueError(f'duplicate JSON key: {k}')
  out[k]=v
 return out
def read(path:Path)->Any:
 def bad(s:str)->None:raise ValueError(f'nonfinite JSON constant: {s}')
 return json.loads(path.read_text(),object_pairs_hook=strict_pairs,parse_constant=bad)
def record(name:str,category:str,ok:bool,detail:Any='')->None:
 checks.append({'check':name,'category':category,'outcome':'PASS' if ok else 'FAIL','detail':detail})
def files()->list[Path]:
 return sorted(p for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix!='.pyc')
def subset_validator(schema:dict[str,Any],name:str)->Draft202012Validator:
 return Draft202012Validator({'$schema':'https://json-schema.org/draft/2020-12/schema','$defs':schema['$defs'],'$ref':'#/$defs/'+name})
def json_errors(v:Draft202012Validator,value:Any)->list[str]:
 return [f'{e.json_path}: {e.message}' for e in v.iter_errors(value)]
def topo(graph:dict[str,list[str]])->list[str]:
 remaining={k:set(v) for k,v in graph.items()};out=[]
 if any(d not in graph for ds in remaining.values() for d in ds):raise ValueError('unknown predecessor')
 while remaining:
  ready=sorted(k for k,v in remaining.items() if not v)
  if not ready:raise ValueError('dependency cycle')
  for k in ready:out.append(k);remaining.pop(k)
  for v in remaining.values():v.difference_update(ready)
 return out

def semantic_errors(kind:str,x:dict[str,Any])->list[str]:
 """Finite independent adversarial assertions, not the production semantic engine."""
 errors=[]
 if kind=='runtimeTransform':
  if abs(sum(t*t for t in x['quaternionXYZW'])-1)>1e-10:errors.append('NON_UNIT_QUATERNION')
 elif kind=='idRegistry':
  if len(set(x['ids']))!=len(x['ids']):errors.append('DUPLICATE_ID')
 elif kind=='endpoint':
  e=x['endpoint']
  if x['instances'].get(e['instanceId']) != x['interfaces'].get(e['interfaceId']):errors.append('INTERFACE_OWNER_MISMATCH')
 elif kind=='variantPatch':
  pos=[x['base'].index(i) if i in x['base'] else -1 for i in x['replace']]
  if not pos or pos != list(range(pos[0],pos[0]+len(pos))) or pos[0]<0:errors.append('NONCONTIGUOUS_PATCH')
  if set(x['active'])&set(x['inactive']):errors.append('VARIANT_OVERLAP')
 elif kind=='m0':
  ids=[r['id'] for r in x['checks']];complete=len(ids)==7 and set(ids)==set('ABCDEFG')
  if not complete:errors.append('M0_CHECK_SET')
  allow=complete and all(r['status']=='PASS' for r in x['checks'])
  if x['m1Allowed']!=allow:errors.append('M0_PERMISSION')
  if x['nativeFeasibility']=='BLOCKED' and not x['nativeBlocker']:errors.append('MISSING_NATIVE_BLOCKER')
 elif kind=='sourceLock':
  if x['status']=='VERIFIED':
   if sorted(p['printedStep'] for p in x['panels'])!=list(range(1,30)):errors.append('PANEL_SET')
   for p in x['panels']:
    covered=set()
    for m in p['mappings']:
     a,b,c,d=m['normalizedRect'];covered.update(m['variants'])
     if not(a<c and b<d) and 'INVALID_PANEL_RECT' not in errors:errors.append('INVALID_PANEL_RECT')
    if p['printedStep']<=4 and covered!={'rpi4','rpi5','rpi-zero-2-w'} and 'BRANCH_COVERAGE' not in errors:errors.append('BRANCH_COVERAGE')
   if x['sharedCommit']!=x['sharedGitlink']:errors.append('SHARED_GITLINK')
 elif kind=='closure':
  pending=list(x['roots']);seen=set()
  while pending:
   k=pending.pop()
   if k not in seen:seen.add(k);pending.extend(x['edges'].get(k,[]))
  if not seen.issubset(x['reported']):errors.append('INCOMPLETE_DEPENDENCY_CLOSURE')
 elif kind=='sourceScope':
  if x['outcome']=='PASS' and x['requestedScope']=='nominalEngineering' and x['sourceScope'] in ['referenceApproximation','printedDesignation','printedInventory','appearance']:errors.append('SOURCE_SCOPE_PROMOTION')
 elif kind=='phaseReceipt':
  if x['production'] and x['receiptScope']=='fixtureOnly':errors.append('FIXTURE_AS_PRODUCTION')
 else:raise ValueError('unknown fixture kind '+kind)
 return errors

def main()->int:
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--write',action='store_true',help='write current reports and integrity manifest')
 args=parser.parse_args()
 try:
  allfiles=files()
  for p in allfiles:
   if p.suffix=='.json' and str(p.relative_to(ROOT)) not in EXCLUDED:
    try:read(p);record('json:'+str(p.relative_to(ROOT)),'STRUCTURAL',True)
    except Exception as exc:record('json:'+str(p.relative_to(ROOT)),'STRUCTURAL',False,str(exc))
  current=read(M/'digital-twin.schema.json');original=read(ROOT/'HISTORICAL/digital-twin.v1.schema.json')
  for p in sorted(M.glob('*.schema.json')):
   x=read(p)
   try:Draft202012Validator.check_schema(x);record('schema:'+p.name,'STRUCTURAL',True)
   except Exception as exc:record('schema:'+p.name,'STRUCTURAL',False,str(exc))
   if '$ref' in x and x['$ref'].startswith('digital-twin.schema.json#/$defs/'):
    n=x['$ref'].split('/')[-1];record('wrapper:'+p.name,'STRUCTURAL',n in current['$defs'])
  # Walk local references, not just wrappers.
  refs=[]
  def walk(x:Any)->None:
   if isinstance(x,dict):
    if '$ref' in x:refs.append(x['$ref'])
    for y in x.values():walk(y)
   elif isinstance(x,list):
    for y in x:walk(y)
  walk(current)
  record('all internal $defs references resolve','STRUCTURAL',all(r.startswith('#/$defs/') and r.split('/')[-1] in current['$defs'] for r in refs),{'references':len(refs)})
  examples={'part-definition':'PartDefinition','mechanical-interface':'MechanicalInterface','printed-designation-claim':'Claim','numeric-unresolved':'NumericValue','numeric-derived-schema-only':'NumericValue','numeric-unresolved-with-value':'NumericValue','numeric-derived-without-method':'NumericValue','verified-claim-without-evidence':'Claim','unknown-field-definition':'PartDefinition'}
  for p in sorted((M/'examples').glob('*.json')):
   base=p.name.rsplit('.',2)[0];n=examples[base];want='.valid.' in p.name
   errors=json_errors(subset_validator(current,n),read(p))
   record('original-example-current:'+p.name,'STRUCTURAL',(not errors)==want,{'expectedValid':want,'errors':errors[:3]})
  probes=read(ROOT/'AUDIT_EVIDENCE/schema-probes.json')['probes']
  for q in probes:
   for version in ['original','current']:
    if version not in q:continue
    case=q[version];n=case.get('definition',q['definition']);sch=original if version=='original' else current
    v=Draft202012Validator(read(M/n[1:])) if n.startswith('@') else subset_validator(sch,n)
    errors=json_errors(v,case['value'])
    record('probe:'+version+':'+q['name'],'STRUCTURAL',(not errors)==case['expectedValid'],{'expectedValid':case['expectedValid'],'actualValid':not errors,'errors':errors[:3]})
  for f in read(ROOT/'AUDIT_EVIDENCE/semantic-fixtures.json')['fixtures']:
   actual=semantic_errors(f['kind'],f['data'])
   record('semantic-fixture:'+f['name'],'SEMANTIC_FIXTURE',actual==f['expectedErrors'],{'expected':f['expectedErrors'],'actual':actual})
  # Corrected source lock deliberately cannot pass documentary admission.
  lock=read(M/'documentation-source-lock.template.json')
  record('source lock remains documentary BLOCKED','SEMANTIC_FIXTURE',lock['status']=='BLOCKED' and lock['pdfSha256']['state']=='unavailable' and lock['blockerIds']==['Q-02'])
  seed=read(M/'v40-step-seed.json');steps=seed['steps'];led=(ROOT/'V40_ASSEMBLY_LEDGER.md').read_text()
  record('planning seed schema','STRUCTURAL',not json_errors(Draft202012Validator(read(M/'planning-step-seed.schema.json')),seed))
  record('exact29 source steps','SEMANTIC_FIXTURE',[x['printedNumber'] for x in steps]==list(range(1,30)) and len({x['id'] for x in steps})==29)
  for i,x in enumerate(steps):
   record(f'step-{i+1:02}-prerequisite','SEMANTIC_FIXTURE',x['prerequisites']==([] if i==0 else [steps[i-1]['id']]))
   record(f'step-{i+1:02}-human-ledger-id','STRUCTURAL',f'`{x["id"]}`' in led)
  blockers=read(M/'blocker-register.json')['items'];ids={x['id'] for x in blockers}
  record('all step blockers resolve','SEMANTIC_FIXTURE',all(set(x['geometryBlockerIds'])<=ids for x in steps))
  record('S27 rear-drive corrected in both copies','SEMANTIC_FIXTURE',steps[26]['parentAssemblies']=='chassis/rear-drive' and re.search(r'ID:\*\* `PX-V40-STEP-27`[^\n]*Parent:\*\* chassis/rear-drive',led) is not None)
  # Source-backed special cases; these assert transcription retention, not fit.
  for no,terms in {10:['M3x26'],19:['Washer A'],21:['free'],25:['robot-right','robot-left'],26:['Washer B','three'],29:['P0','P1','P2','P11','MOTOR1','MOTOR2']}.items():
   text=json.dumps(steps[no-1],ensure_ascii=False).lower()
   record('source-special-step-'+str(no),'SEMANTIC_FIXTURE',all(t.lower() in text for t in terms),terms)
  bom=read(M/'printed-hardware-ledger.json')
  # Ledger is a planning arithmetic check, not an actual physical count.
  for row in bom['rows']:
   # Keep the actual ledger schema explicit; malformed/new keys do not get silently ignored.
   total=row['printedTotal'];use=row['plannedUse']
   ok=(row['printedPrimary']+row['printedBackup']==total and set(use)=={'rpi4','rpi5','rpi-zero-2-w'} and all(isinstance(use[v],int) and 0<=use[v]<=total for v in use))
   record('printed-bom:'+row['designation'],'SEMANTIC_FIXTURE',ok,{'scope':'Printed total = primary + backup; planned use within printed total for all three variants. No physical count asserted.'})
  plan=read(M/'milestone-plan.json')['milestones'];coarse={m['id']:m['deps'] for m in plan};phase=read(M/'milestone-phase-plan.json')
  order=topo(coarse);porder=topo({x['id']:x['deps'] for x in phase['phases']})
  record('coarse DAG recomputed','SEMANTIC_FIXTURE',len(order)==15,order)
  record('coarse reconstruction agrees','SEMANTIC_FIXTURE',coarse==phase['coarseAcceptanceDependencies']==read(ROOT/'AUDIT_EVIDENCE/dependency-review.json')['reconstructed'])
  record('phase DAG recomputed','SEMANTIC_FIXTURE',len(porder)==len(phase['phases']),porder)
  for m in plan:record('acceptance-doc-json:'+m['id'],'STRUCTURAL',m['accept'] in (ROOT/'MILESTONES.md').read_text())
  em=read(ROOT/'EVIDENCE/manifest.json')
  for rec in em['originalPhotos']:
   p=ROOT/'EVIDENCE'/rec['file'];dims=Image.open(p).size
   record('photo:'+rec['id'],'EVIDENCE',sha(p)==rec['sha256'] and p.stat().st_size==rec['byteLength'] and list(dims)==rec['dimensionsPixels'],{'sha256':sha(p),'dimensions':list(dims)})
   record('photo-private-reference-scope:'+rec['id'],'EVIDENCE',rec['privacy']=='private' and rec['engineeringUse']=='referenceOnly')
  index=ROOT/'EVIDENCE'/em['index']['file'];record('photo-index-hash','EVIDENCE',sha(index)==em['index']['sha256'])
  for rec in em['derivedCrops']:
   p=ROOT/'EVIDENCE'/rec['file'];dims=Image.open(p).size
   record('crop:'+rec['file'],'EVIDENCE',sha(p)==rec['sha256'] and list(dims)==rec['outputDimensionsPixels'] and p.stat().st_size==rec['byteLength'])
  inv=read(ROOT/'AUDIT_EVIDENCE/original-inspection-inventory.json')
  record('original manifest audit receipt','EVIDENCE',inv['fileCount']==77 and inv['allListedHashesMatch'] and all(x['manifestMatch'] is not False for x in inv['artifacts']),{'scope':'Direct original-byte comparison recorded before editing; receipt, not a repeat check against changed files.'})
  # Original sources not edited in this copy.
  for x in inv['artifacts']:
   if x['path'].startswith('EVIDENCE/'):
    record('original-evidence-preserved:'+x['path'],'EVIDENCE',sha(ROOT/x['path'])==x['sha256'])
  # Every supplied report is explicitly historical; no phantom original validator.
  hist=read(ROOT/'HISTORICAL/PACKAGE_VALIDATION_REPORT.json');cl=read(ROOT/'AUDIT_EVIDENCE/original-check-classification.json')
  record('original174 classification total','STRUCTURAL',len(hist['checks'])==174==sum(cl['counts'].values()) and cl['implementationChecks']==cl['mechanicalChecks']==0)
  # Relative Markdown links; source code/tables with hypothetical repository paths are not links.
  broken=[];checked=0
  for p in sorted(ROOT.rglob('*.md')):
   if 'HISTORICAL' in p.parts:continue
   for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',p.read_text()):
    if target.startswith(('http:','https:','mailto:','#')):continue
    target=target.split('#')[0]
    if not target:continue
    checked+=1
    if not (p.parent/target).exists():broken.append(f'{p.relative_to(ROOT)} -> {target}')
  record('relative Markdown links','STRUCTURAL',not broken,{'checked':checked,'broken':broken})
  if (ROOT/'FULL_SPECIFICATION.md').exists():
   combined=(ROOT/'FULL_SPECIFICATION.md').read_text()
   for p in sorted(ROOT.glob('*.md')):
    if p.name not in ['FULL_SPECIFICATION.md']:
     record('combined:'+p.name,'STRUCTURAL',p.read_text().strip() in combined)
  # No stale production modelHash directory or v1 mechanical contract metadata.
  stale=[]
  for p in ROOT.rglob('*.md'):
   if p.name in ['AUDIT_REPORT.md','AUDIT_CHANGELOG.md','FULL_SPECIFICATION.md'] or 'HISTORICAL' in p.parts:continue
   for token in ['public/twin/<modelHash>/','"contractVersion": 1','Every generated artifact records all five hashes']:
    if token in p.read_text():stale.append(f'{p.relative_to(ROOT)}: {token}')
  record('no stale normative hash contract','STRUCTURAL',not stale,stale)
  record('no CAD/GLB/application code generated','STRUCTURAL',not any(p.suffix.lower() in ['.step','.stp','.brep','.glb','.gltf','.rs','.tsx','.ts'] for p in allfiles))
  f=read(ROOT/'AUDIT_EVIDENCE/findings.json')['findings']
  record('findings and correction statuses','STRUCTURAL',len(f)==15 and len({x['id'] for x in f})==15 and all(x['status']=='CORRECTED_IN_SPEC' for x in f))
  # Input digest is a raw-file inventory, intentionally not production JCS/model hashing.
  inputs=[{'path':str(p.relative_to(ROOT)),'sha256':sha(p),'byteLength':p.stat().st_size} for p in files() if str(p.relative_to(ROOT)) not in EXCLUDED]
  digest=hashlib.sha256(json.dumps(inputs,sort_keys=True,separators=(',',':')).encode()).hexdigest()
  counts=collections.Counter(c['outcome'] for c in checks);families=collections.Counter(c['category'] for c in checks)
  report={'reportVersion':2,'scope':'Independent specification-package validation; no production implementation or mechanical validation.', 'validatedInputDigest':digest,'inputDigestScheme':'SHA256 of UTF-8 compact sorted-key JSON of sorted raw-file inventory; excludes both current reports and root integrity manifest only. Not a production model hash.', 'inputs':inputs,'summary':{'passed':counts['PASS'],'failed':counts['FAIL'],'byCategory':dict(families)},'environment':{'python':sys.version.split()[0],'jsonschema':importlib.metadata.version('jsonschema'),'Pillow':importlib.metadata.version('Pillow')},'checks':checks,'explicitlyNotExecuted':['Repository dependency install/build or application regression tests','SQLite/IndexedDB command, migration or crash tests','Packaged Tauri/macOS, WebGL or performance tests','Production TypeScript/Rust/Python JCS parity tests','Production29-step reversible reducer tests','CAD generation, geometric constraints, swept clearance or measured uncertainty','Real GLB export/decode/geometry admission','Physical inventory, actual-unit fit or camera/AR testing','Assembly PDF binary inspection/SHA-256/panel verification','Rehash of absent original reference-images.zip'], 'integrityProtocol':'Run default mode after --write to independently check report input binding and every PACKAGE_MANIFEST.sha256 entry.'}
  if args.write:
   for n in ['AUDITED_PACKAGE_VALIDATION_REPORT.json','PACKAGE_VALIDATION_REPORT.json']:(ROOT/n).write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
   entries=[f'{sha(p)}  {p.relative_to(ROOT)}' for p in files() if p.name!='PACKAGE_MANIFEST.sha256' or p.parent!=ROOT]
   (ROOT/'PACKAGE_MANIFEST.sha256').write_text('\n'.join(entries)+'\n')
  else:
   recorded=read(ROOT/'AUDITED_PACKAGE_VALIDATION_REPORT.json')
   if recorded['validatedInputDigest']!=digest:raise ValueError('Validation input digest changed; report is stale')
   if recorded['checks']!=checks:raise ValueError('Reproduced checks differ from recorded checks')
   if read(ROOT/'PACKAGE_VALIDATION_REPORT.json')!=recorded:raise ValueError('Current report copies disagree')
   manifest={}
   for line in (ROOT/'PACKAGE_MANIFEST.sha256').read_text().splitlines():
    h,n=line.split('  ',1)
    if n in manifest:raise ValueError('Duplicate integrity entry '+n)
    manifest[n]=h
   actual={str(p.relative_to(ROOT)):sha(p) for p in files() if p!=ROOT/'PACKAGE_MANIFEST.sha256'}
   if manifest!=actual:raise ValueError('Integrity manifest content/set mismatch')
   print(f'Integrity manifest verified: {len(actual)} files')
  print(json.dumps(report['summary'],indent=2))
  for c in checks:
   if c['outcome']=='FAIL':print('FAIL',c['check'],json.dumps(c['detail'],ensure_ascii=False))
  return 1 if counts['FAIL'] else 0
 except Exception as exc:
  print(f'VALIDATION ERROR: {type(exc).__name__}: {exc}',file=sys.stderr)
  return 2

if __name__=='__main__':raise SystemExit(main())
