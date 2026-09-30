# Audited specification package receipt

- Source filename: PiCar-X-Z0104V40-Implementation-Spec-AUDITED.zip
- SHA-256: 7a01cc81d68e2a12c641e9d3dfe0b00636476dee1df8de17e442cc127178b411
- Size: 6883092 bytes
- Ingestion date: 2026-09-29 (America/New_York)
- Package version: audited v2 (reportVersion/contractVersion 2)
- Audited repository baseline and ingestion HEAD: 9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8
- Current main resolved by: `git ls-remote origin refs/heads/main`; matches HEAD; branch main; tracked tree initially clean; local diff empty; no drift.
- Environment: isolated Python virtual environment; Python 3.14.7; jsonschema 4.26.0; Pillow 12.3.0.
- Validation cwd: isolated extracted package root outside repository/application roots.
- Commands: `python3 -m venv <staging>/venv`, `<venv>/bin/python -m pip install -r AUDIT_TOOLS/requirements.txt`, `<venv>/bin/python AUDIT_TOOLS/validate_package.py`. All exit 0. No --write used.
- SPEC_PACKAGE_VALIDATION = PASS: 420 checks, 0 failed; complete integrity manifest verified (117 entries).
- SPEC_PACKAGE_ALLOCATION = PASS: 118 original package files copied byte-for-byte with relative structure retained except private binaries below.
- Textual/machine-readable specification, AUDIT_TOOLS, AUDIT_EVIDENCE, HISTORICAL, package manifests/reports and non-sensitive EVIDENCE metadata → docs/digital-twin/.
- Nine original/crop binaries → digital-twin/evidence/private/spec-audit-v2/{originals,crops}/.
- Original archive → digital-twin/evidence/private/spec-packages/PiCar-X-Z0104V40-Implementation-Spec-AUDITED.zip; preserved hash verified.
- Explicit Git exclusion: /digital-twin/evidence/private/ (images and archive). Existing agent-state exclusions remain.
- Added EVIDENCE/README.md explains relocated locators and validation restoration; audited source documents unchanged.
- Deviation: original Downloads archive retained unmodified; its only repository copy is private/ignored. Temporary isolated extraction remains outside application roots for validation evidence.

Allocation, byte hashes and per-file destinations: [allocation manifest](../implementation/evidence/m0/spec-allocation.json). Validation stdout/stderr: [validation log](../implementation/evidence/m0/package-validation.txt). Dependency installation log: [dependency log](../implementation/evidence/m0/package-dependencies.txt).
