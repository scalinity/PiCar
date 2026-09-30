#!/usr/bin/env python3
"""Exercise the package validator on disposable copies, never repository code.

Run after a passing default validation. Writes only with --write-result; mutation
workspaces are temporary and discarded. Exit status is nonzero on a missed fault.
"""
from __future__ import annotations
import argparse,hashlib,json,shutil,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def edit_json(path,change):
 x=json.loads(path.read_text());change(x);path.write_text(json.dumps(x,indent=2)+'\n')
def mutate(root,kind):
 if kind=='S27-parent':
  edit_json(root/'MACHINE_READABLE_SCHEMAS/v40-step-seed.json',lambda x:x['steps'][26].update(parentAssemblies='steering/front'))
 elif kind=='admission-conditions':
  edit_json(root/'MACHINE_READABLE_SCHEMAS/digital-twin.schema.json',lambda x:x['$defs']['AdmissionReport'].pop('allOf'))
 elif kind=='photo-byte':
  m=json.loads((root/'EVIDENCE/manifest.json').read_text());p=root/'EVIDENCE'/m['originalPhotos'][0]['file'];p.write_bytes(p.read_bytes()+b'TEST-TAMPER')
 elif kind=='phase-cycle':
  edit_json(root/'MACHINE_READABLE_SCHEMAS/milestone-phase-plan.json',lambda x:x['phases'][0]['deps'].append(x['phases'][-1]['id']))
 elif kind=='unlisted-file':(root/'TEST-unlisted.txt').write_text('synthetic integrity mutation\n')
 elif kind=='validator-endpoint-check-disabled':
  p=root/'AUDIT_TOOLS/validate_package.py';s=p.read_text();a="if x['instances'].get(e['instanceId']) != x['interfaces'].get(e['interfaceId']):";assert a in s;p.write_text(s.replace(a,'if False:'))
 else:raise ValueError(kind)
def main():
 a=argparse.ArgumentParser();a.add_argument('--write-result',action='store_true');args=a.parse_args()
 baseline=subprocess.run([sys.executable,str(ROOT/'AUDIT_TOOLS/validate_package.py')],capture_output=True,text=True)
 if baseline.returncode:print(baseline.stdout+baseline.stderr);return 2
 cases=[('S27-parent',True,1,'S27 rear-drive corrected in both copies'),('admission-conditions',True,1,'probe:current:'),('photo-byte',True,1,'photo:'),('phase-cycle',True,2,'dependency cycle'),('unlisted-file',False,2,'input digest changed'),('validator-endpoint-check-disabled',True,1,'semantic-fixture:')]
 results=[]
 for name,write,want,needle in cases:
  with tempfile.TemporaryDirectory(prefix='picar-audit-mutation-') as td:
   r=Path(td)/'package';shutil.copytree(ROOT,r,ignore=shutil.ignore_patterns('__pycache__','*.pyc'));mutate(r,name)
   cmd=[sys.executable,str(r/'AUDIT_TOOLS/validate_package.py')]+(['--write'] if write else [])
   run=subprocess.run(cmd,capture_output=True,text=True);out=run.stdout+run.stderr
   ok=run.returncode==want and needle in out
   results.append({'mutation':name,'mode':'regenerate-and-evaluate' if write else 'read-only-integrity','expectedExit':want,'actualExit':run.returncode,'expectedDiagnosticSubstring':needle,'detected':ok,'diagnosticLines':[line for line in out.splitlines() if line.startswith(('FAIL','VALIDATION ERROR'))][:12]})
 report={'scope':'Synthetic fault mutations of specification validator/input copies, not application/geometry tests.','validatorSha256':hashlib.sha256((ROOT/'AUDIT_TOOLS/validate_package.py').read_bytes()).hexdigest(),'passed':sum(r['detected'] for r in results),'failed':sum(not r['detected'] for r in results),'results':results}
 if args.write_result:(ROOT/'AUDIT_EVIDENCE/validator-mutation-results.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps(report,indent=2));return int(report['failed']>0)
if __name__=='__main__':raise SystemExit(main())
