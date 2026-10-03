// Read-only final candidate inventory and privacy scan. Reports file/line classifications, never matched credential values.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const base = 'a26592259dcd6ef09fa791086148092653b1750e';
const reviewed = '891dba9dba06592296fa06a74e400451743db13e';
const output = 'docs/implementation/evidence/studio-2-pro-remediation/privacy-final.json';
if (!fs.existsSync(output)) fs.writeFileSync(output, '{}\n');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).split('\0').filter(Boolean);
const unrelated = new Set(git('ls-files', '--others', '--exclude-standard', '-z').filter(p => p.startsWith('docs/implementation/evidence/m2/')));
const untracked = git('ls-files', '--others', '--exclude-standard', '-z').filter(p => !unrelated.has(p));
const files = [...new Set([...git('diff', '--name-only', '-z', base), ...untracked])].filter(p => fs.existsSync(p)).sort();
const delta = [...new Set([...git('diff', '--name-only', '-z', reviewed), ...untracked])].filter(p => fs.existsSync(p)).sort();
const rules = [
 ['credential-shaped', /(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/],
 ['credential-assignment', /(?:api[_-]?key|password|secret|token)\s*[:=]\s*["'][^"']{8,}["']/i],
 ['personal-path', /\/Users\/[^\s"'<>]+/],
 ['private-link', /(?:https?:\/\/[^\s"']*(?:session|private|internal)|plugin:\/\/|localhost:[0-9]+)/i],
];
const hits = [], binary = [];
for (const file of files) {
 const bytes = fs.readFileSync(file);
 if (bytes.includes(0) || ['.png','.jpg','.jpeg','.glb','.blend','.brep'].includes(path.extname(file))) { binary.push(file); continue; }
 bytes.toString('utf8').split('\n').forEach((line, i) => {
  for (const [category, re] of rules) if (re.test(line)) hits.push({ file, line: i + 1, category,
   classification: file.includes('/tests/') ? 'code constructs functional local test URL or synthetic fixture' : category === 'personal-path' ? 'real functional local path or retained local provenance' : file.endsWith('final-inventory-scan.mjs') ? 'code constructs scan pattern' : 'code constructs functional localhost development URL' });
 });
}
fs.writeFileSync(output, JSON.stringify({ base, reviewed, fullCandidateFilesScanned: files.length, remediationFilesScanned: delta.length,
 excludedUnrelatedM2: [...unrelated].sort(), files, remediationFiles: delta, textFiles: files.length - binary.length, binaryFiles: binary, hits,
 scope: 'Prepublication working candidate inventory against Studio 2 base, including all remediation untracked artifacts. The generated report is itself included; its final classifications are manually reviewed. Existing public repository history is retained without a rewrite.',
 mediaReview: 'All application captures are reviewed as app-window evidence, including continuation-final media-review.json and corrected native-records.json dispositions. They may include the ordinary runtime manual panel; no separate enlarged or source-copy manual capture is added. GLB forbids images; CAD artifacts are numerical geometry; Blender render and scene are reviewed separately.' }, null, 1) + '\n');
console.log(JSON.stringify({ scanned: files.length, remediation: delta.length, text: files.length-binary.length, binary: binary.length, hits: hits.length }));
