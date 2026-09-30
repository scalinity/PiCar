# Private reference evidence

Original evidence binaries and crops are intentionally local/private at `digital-twin/evidence/private/spec-audit-v2/` from the repository root. They must never be auto-published or bundled. The original audited archive is ignored under `digital-twin/evidence/private/spec-packages/`.

The audited manifest retains source hashes and original package-relative locators unchanged. Those locators describe the original archive, not publicly available images in this documentation tree. `originals/IMAGE_INDEX.txt` is metadata only. Restoring complete package validation requires the private binaries; validate an isolated extraction of the retained original archive, never this allocated tree with relocated images and added receipts.
