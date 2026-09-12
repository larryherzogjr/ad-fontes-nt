"""Promote the explicitly approved resolved-audit candidate."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
CANDIDATE = ROOT / "artifacts/editorial/audit-followup-2026-09-11-candidate-v1"
APPROVAL = ROOT / "docs/editorial-review/audit-followup-2026-09-11/APPROVAL.md"
APPROVED_SHA = "58cab201852f955de95af4ee2a3531a4f03708e867a0183bc884651a752792d8"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encoded(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def review_hash(unit: dict[str, object]) -> str:
    payload = {key: value for key, value in unit.items() if key != "status"}
    return sha(json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode())


candidate_manifest_bytes = (CANDIDATE / "CANDIDATE-MANIFEST.json").read_bytes()
if sha(candidate_manifest_bytes) != APPROVED_SHA:
    raise SystemExit("Candidate manifest does not match the approved SHA-256.")
candidate = json.loads(candidate_manifest_bytes)
validation_bytes = (CANDIDATE / "VALIDATION.json").read_bytes()
validation = json.loads(validation_bytes)
if validation.get("status") != "pass" or validation.get("candidateManifestSha256") != APPROVED_SHA:
    raise SystemExit("Candidate validation is not bound to the approved manifest.")
approval_bytes = APPROVAL.read_bytes()
if APPROVED_SHA.encode() not in approval_bytes:
    raise SystemExit("Approval record does not bind the approved manifest SHA-256.")

source_id = candidate["sourceArticleRelease"]
release_id = candidate["proposedArticleRelease"]
if not re.fullmatch(r"[a-z0-9-]+", source_id) or not re.fullmatch(r"[a-z0-9-]+", release_id):
    raise SystemExit("Invalid release identity.")
source_dir = ROOT / "sources/om-studies" / source_id
destination = ROOT / "sources/om-studies" / release_id
if destination.exists():
    raise SystemExit("Immutable article destination already exists.")
source_manifest_bytes = (source_dir / "manifest.json").read_bytes()
if sha(source_manifest_bytes) != candidate["inputs"]["articleManifestSha256"]:
    raise SystemExit("Article predecessor manifest differs from the approved candidate input.")
source_manifest = json.loads(source_manifest_bytes)
for relative, expected in source_manifest["files"].items():
    if sha((source_dir / relative).read_bytes()) != expected:
        raise SystemExit(f"Immutable predecessor changed: {relative}")

source_articles = {row["slug"]: row for row in source_manifest["articles"]}
candidate_articles = {Path(row["file"]).stem: row for row in candidate["articleFiles"]}
if set(source_articles) != set(candidate_articles) or len(candidate_articles) != 250:
    raise SystemExit("Candidate and predecessor article inventories differ.")

raw_files: dict[str, bytes] = {}
files: dict[str, str] = {}
articles: list[dict[str, object]] = []
bodies: dict[str, str] = {}
changed_slugs: list[str] = []
for slug in sorted(candidate_articles):
    row = candidate_articles[slug]
    data = (CANDIDATE / row["file"]).read_bytes()
    predecessor = (source_dir / source_articles[slug]["sourcePath"]).read_bytes()
    if sha(data) != row["sha256"] or sha(predecessor) != row["predecessorSha256"]:
        raise SystemExit(f"Candidate article binding failed: {slug}")
    changed = data != predecessor
    if changed != row["changed"]:
        raise SystemExit(f"Candidate article change flag differs: {slug}")
    if changed:
        changed_slugs.append(slug)
    match = re.match(rb"^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$", data)
    if not match:
        raise SystemExit(f"Invalid article front matter: {slug}")
    relative = f"raw/{slug}.md"
    raw_files[relative] = data
    files[relative] = sha(data)
    articles.append({**source_articles[slug], "sourcePath": relative, "contentSha256": sha(data)})
    bodies[slug] = match[1].decode()
if len(changed_slugs) != candidate["changedArticleCount"]:
    raise SystemExit("Changed article count differs from the approved candidate.")

evidence = {
    "evidence/APPROVAL.md": APPROVAL,
    "evidence/CANDIDATE-MANIFEST.json": CANDIDATE / "CANDIDATE-MANIFEST.json",
    "evidence/CORRECTIONS.json": CANDIDATE / "CORRECTIONS.json",
    "evidence/REVIEW.md": CANDIDATE / "REVIEW.md",
    "evidence/VALIDATION.json": CANDIDATE / "VALIDATION.json",
}
for relative, path in evidence.items():
    data = path.read_bytes()
    raw_files[relative] = data
    files[relative] = sha(data)

manifest = {
    "schemaVersion": 2,
    "releaseId": release_id,
    "snapshotDate": candidate["candidateDate"],
    "predecessor": source_id,
    "sourceRepositoryRevision": source_manifest["sourceRepositoryRevision"],
    "correctionRepositoryRevision": subprocess.check_output(
        ["git", "-C", str(ROOT), "rev-parse", "HEAD"], text=True
    ).strip(),
    "sourceWorkingTree": "Exact approved resolved-audit candidate bytes and promotion evidence are preserved and hashed in this snapshot.",
    "scope": "250 approved app-only BSB Greek articles with the five previously unresolved audit findings resolved; larryherzogjr.com remains unchanged.",
    "approvalEvidence": "evidence/APPROVAL.md",
    "adaptation": source_manifest["adaptation"],
    "priorEditorialCorrection": source_manifest.get("priorEditorialCorrection"),
    "editorialAuditCorrection": source_manifest["editorialAuditCorrection"],
    "auditFollowupCorrection": {
        "candidateId": candidate["candidateId"],
        "candidateManifestSha256": APPROVED_SHA,
        "validationSha256": sha(validation_bytes),
        "reviewer": "Larry Herzog Jr.",
        "reviewDate": candidate["candidateDate"],
        "resolvedFindingIds": candidate["resolvedFindingIds"],
        "changedArticles": changed_slugs,
        "replacementCount": candidate["articleChangeCount"],
        "unchangedArticleCount": candidate["unchangedArticleCount"],
        "comparisonReviewHashes": candidate["comparisonReviewHashes"],
        "scriptureChanged": False,
        "authorWebsiteChanged": False,
    },
    "files": files,
    "articles": articles,
}
summaries = [{**article, "snapshotDate": candidate["candidateDate"]} for article in articles]
outputs = {"index.json": encoded({"schemaVersion": 2, "releaseId": release_id, "articles": summaries})}
for article in articles:
    slug = article["slug"]
    outputs[f"articles/{slug}.json"] = encoded({
        "schemaVersion": 2,
        "releaseId": release_id,
        "article": {**article, "markdown": bodies[slug], "snapshotDate": candidate["candidateDate"]},
    })
manifest["outputChecksums"] = {relative: sha(data) for relative, data in outputs.items()}

variants_path = ROOT / "content/editorial/variants.json"
variants_bytes = variants_path.read_bytes()
if sha(variants_bytes) != candidate["inputs"]["variantsSha256"]:
    raise SystemExit("Comparison predecessor differs from the approved candidate input.")
candidate_variants_bytes = (CANDIDATE / "variants.candidate.json").read_bytes()
if sha(candidate_variants_bytes) != candidate["structuredCandidateFiles"]["variants.candidate.json"]:
    raise SystemExit("Comparison candidate differs from the approved manifest.")
original_by_id = {unit["id"]: unit for unit in json.loads(variants_bytes)}
variants = json.loads(candidate_variants_bytes)
variants_by_id = {unit["id"]: unit for unit in variants}
for row in candidate["comparisonReviewHashes"]:
    unit_id = row["unitId"]
    if review_hash(original_by_id[unit_id]) != row["previousReviewPayloadSha256"]:
        raise SystemExit(f"Previous comparison approval hash differs: {unit_id}")
    if review_hash(variants_by_id[unit_id]) != row["candidateReviewPayloadSha256"]:
        raise SystemExit(f"Candidate comparison approval hash differs: {unit_id}")
    if variants_by_id[unit_id]["status"] != "in-review":
        raise SystemExit(f"Changed comparison was not returned to review: {unit_id}")
    variants_by_id[unit_id]["status"] = "approved"

reviews_path = ROOT / "content/editorial/reviews.json"
reviews = json.loads(reviews_path.read_text())
for row in candidate["comparisonReviewHashes"]:
    reviews.append({
        "unitId": row["unitId"],
        "reviewerId": "larry-herzog-jr",
        "contentHash": row["candidateReviewPayloadSha256"],
        "reviewedAt": candidate["candidateDate"],
        "decision": "approved",
    })

for relative, data in raw_files.items():
    target = destination / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
(destination / "manifest.json").write_bytes(encoded(manifest))
variants_path.write_bytes(encoded(variants))
reviews_path.write_bytes(encoded(reviews))

print(json.dumps({
    "status": "promoted",
    "approvedCandidateManifestSha256": APPROVED_SHA,
    "articleRelease": release_id,
    "changedArticles": changed_slugs,
    "comparisonUnitsReapproved": [row["unitId"] for row in candidate["comparisonReviewHashes"]],
}, indent=2))
