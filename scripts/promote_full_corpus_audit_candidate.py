"""Promote an approved full-corpus audit candidate without mutating predecessors."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from copy import deepcopy
from pathlib import Path

from import_lexicon import build as build_lexicon


ROOT = Path(__file__).resolve().parent.parent
ARTICLE_RELEASE = "om-studies-2026-09-11-v6"
WORD_ARTIFACT = "sources/word-explorer/words-2026-09-11-250.json"
LEXICAL_RELEASE = "dodson-2010-v4"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encoded(value: object, *, compact: bool = False) -> bytes:
    if compact:
        return (json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


parser = argparse.ArgumentParser()
parser.add_argument("--candidate", type=Path, required=True)
parser.add_argument("--approval-record", type=Path, required=True)
parser.add_argument("--approved-manifest-sha256", required=True)
args = parser.parse_args()

if not re.fullmatch(r"[0-9a-f]{64}", args.approved_manifest_sha256):
    raise SystemExit("Invalid approved candidate-manifest SHA-256.")
candidate = args.candidate.resolve()
candidate_root = (ROOT / "artifacts/editorial").resolve()
if candidate_root not in candidate.parents:
    raise SystemExit("Candidate must be below artifacts/editorial.")

candidate_manifest_bytes = (candidate / "CANDIDATE-MANIFEST.json").read_bytes()
candidate_sha = sha(candidate_manifest_bytes)
if candidate_sha != args.approved_manifest_sha256:
    raise SystemExit("Candidate manifest does not match the approved SHA-256.")
candidate_manifest = json.loads(candidate_manifest_bytes)
validation_bytes = (candidate / "VALIDATION.json").read_bytes()
validation = json.loads(validation_bytes)
if validation.get("status") != "pass" or validation.get("candidateManifestSha256") != candidate_sha:
    raise SystemExit("Candidate validation is not bound to the approved manifest.")
approval_bytes = args.approval_record.read_bytes()
if candidate_sha.encode() not in approval_bytes:
    raise SystemExit("Approval record does not bind the candidate-manifest SHA-256.")
if candidate_manifest.get("candidateId") != "full-corpus-audit-2026-09-11-candidate-v2":
    raise SystemExit("Unexpected candidate identity.")
if candidate_manifest.get("proposedArticleRelease") != ARTICLE_RELEASE:
    raise SystemExit("Unexpected proposed article release.")

# Verify and stage a new immutable article release.
predecessor_id = str(candidate_manifest["sourceArticleRelease"])
predecessor_dir = ROOT / "sources/om-studies" / predecessor_id
predecessor_manifest_bytes = (predecessor_dir / "manifest.json").read_bytes()
predecessor = json.loads(predecessor_manifest_bytes)
if sha(predecessor_manifest_bytes) != candidate_manifest["inputs"]["articleManifestSha256"]:
    raise SystemExit("Article predecessor manifest differs from the approved candidate input.")
for relative, expected in predecessor["files"].items():
    if sha((predecessor_dir / relative).read_bytes()) != expected:
        raise SystemExit(f"Immutable article predecessor changed: {relative}")

article_rows = {Path(row["file"]).stem: row for row in candidate_manifest["articleFiles"]}
predecessor_articles = {str(row["slug"]): row for row in predecessor["articles"]}
if set(article_rows) != set(predecessor_articles) or len(article_rows) != 250:
    raise SystemExit("Candidate and predecessor article inventories differ.")

article_raw: dict[str, bytes] = {}
article_files: dict[str, str] = {}
articles: list[dict[str, object]] = []
bodies: dict[str, str] = {}
changed_slugs: list[str] = []
for slug in sorted(article_rows):
    row = article_rows[slug]
    data = (candidate / row["file"]).read_bytes()
    predecessor_data = (predecessor_dir / predecessor_articles[slug]["sourcePath"]).read_bytes()
    if sha(data) != row["sha256"] or sha(predecessor_data) != row["predecessorSha256"]:
        raise SystemExit(f"Article candidate binding failed: {slug}")
    changed = data != predecessor_data
    if changed != bool(row["changed"]):
        raise SystemExit(f"Article candidate change flag differs: {slug}")
    if changed:
        changed_slugs.append(slug)
    match = re.match(rb"^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$", data)
    if not match:
        raise SystemExit(f"Invalid article front matter: {slug}")
    relative = f"raw/{slug}.md"
    article_raw[relative] = data
    article_files[relative] = sha(data)
    articles.append({
        **predecessor_articles[slug],
        "sourcePath": relative,
        "contentSha256": sha(data),
    })
    bodies[slug] = match[1].decode()
if len(changed_slugs) != candidate_manifest["changedArticleCount"]:
    raise SystemExit("Changed article count differs from the approved candidate.")

reconciliation_dir = ROOT / "docs/editorial-review/full-corpus-audit-2026-09-11/reconciliation-v2"
evidence_sources = {
    "evidence/APPROVAL.md": args.approval_record,
    "evidence/CANDIDATE-MANIFEST.json": candidate / "CANDIDATE-MANIFEST.json",
    "evidence/REVIEW.md": candidate / "REVIEW.md",
    "evidence/VALIDATION.json": candidate / "VALIDATION.json",
    "evidence/RECONCILIATION.md": reconciliation_dir / "RECONCILIATION.md",
    "evidence/FINDING-RECONCILIATION.json": reconciliation_dir / "FINDING-RECONCILIATION.json",
    "evidence/KIMI-FINDING-RECONCILIATION.json": reconciliation_dir / "KIMI-FINDING-RECONCILIATION.json",
}
for relative, source in evidence_sources.items():
    data = source.read_bytes()
    article_raw[relative] = data
    article_files[relative] = sha(data)

article_manifest = {
    "schemaVersion": 2,
    "releaseId": ARTICLE_RELEASE,
    "snapshotDate": "2026-09-11",
    "predecessor": predecessor_id,
    "sourceRepositoryRevision": predecessor["sourceRepositoryRevision"],
    "correctionRepositoryRevision": subprocess.check_output(
        ["git", "-C", str(ROOT), "rev-parse", "HEAD"], text=True
    ).strip(),
    "sourceWorkingTree": "Exact approved full-corpus audit candidate bytes and promotion evidence are preserved and hashed in this snapshot.",
    "scope": "250 approved app-only BSB Greek articles with reviewed full-corpus editorial corrections; larryherzogjr.com remains unchanged.",
    "approvalEvidence": "evidence/APPROVAL.md",
    "adaptation": predecessor["adaptation"],
    "priorEditorialCorrection": predecessor.get("editorialCorrection"),
    "editorialAuditCorrection": {
        "candidateId": candidate_manifest["candidateId"],
        "candidateManifestSha256": candidate_sha,
        "validationSha256": sha(validation_bytes),
        "reviewer": "Larry Herzog Jr.",
        "reviewDate": "2026-09-11",
        "changedArticles": changed_slugs,
        "replacementCount": candidate_manifest["articleChangeCount"],
        "unchangedArticleCount": 250 - len(changed_slugs),
        "unresolvedFindingIds": candidate_manifest["unresolvedFindingIds"],
        "scriptureChanged": False,
        "authorWebsiteChanged": False,
    },
    "files": article_files,
    "articles": articles,
}
summaries = [{**article, "snapshotDate": "2026-09-11"} for article in articles]
article_outputs = {
    "index.json": encoded({"schemaVersion": 2, "releaseId": ARTICLE_RELEASE, "articles": summaries})
}
for article in articles:
    slug = str(article["slug"])
    article_outputs[f"articles/{slug}.json"] = encoded({
        "schemaVersion": 2,
        "releaseId": ARTICLE_RELEASE,
        "article": {**article, "markdown": bodies[slug], "snapshotDate": "2026-09-11"},
    })
article_manifest["outputChecksums"] = {path: sha(data) for path, data in article_outputs.items()}

# Verify the approved word-metadata delta and stage a new immutable artifact.
word_source_path = ROOT / "sources/word-explorer/words-2026-09-06-250.json"
word_source_bytes = word_source_path.read_bytes()
if sha(word_source_bytes) != candidate_manifest["inputs"]["wordMetadataSha256"]:
    raise SystemExit("Word metadata predecessor differs from the approved candidate input.")
word_candidate_path = candidate / "words-2026-09-06-250.candidate.json"
word_candidate_bytes = word_candidate_path.read_bytes()
if sha(word_candidate_bytes) != candidate_manifest["structuredCandidateFiles"][word_candidate_path.name]:
    raise SystemExit("Word metadata candidate differs from the approved manifest.")
expected_words = json.loads(word_source_bytes)
for change in candidate_manifest["wordMetadataChanges"]:
    row = next(item for item in expected_words if item["slug"] == change["slug"])
    if row[change["field"]] != change["old"]:
        raise SystemExit(f"Word metadata predecessor value differs: {change['id']}")
    row[change["field"]] = change["new"]
if json.loads(word_candidate_bytes) != expected_words:
    raise SystemExit("Word metadata candidate contains changes outside the approved manifest.")

lexical_v3 = json.loads((ROOT / "sources/dodson/manifest-v3.json").read_text())
if lexical_v3["artifacts"].get("sources/word-explorer/words-2026-09-06-250.json") != sha(word_source_bytes):
    raise SystemExit("Lexical v3 does not bind the word-metadata predecessor.")
lookup = json.loads(build_lexicon("manifest-v3.json"))
lookup["releaseId"] = LEXICAL_RELEASE
lookup_bytes = encoded(lookup, compact=True)
lexical_v4 = deepcopy(lexical_v3)
lexical_v4.update({
    "releaseId": LEXICAL_RELEASE,
    "predecessor": lexical_v3["releaseId"],
    "wordExplorerRetrieved": "2026-09-11",
    "wordExplorerArtifact": WORD_ARTIFACT,
    "outputSha256": sha(lookup_bytes),
    "editorialApproval": {
        "candidateManifestSha256": candidate_sha,
        "approvalRecord": "docs/editorial-review/full-corpus-audit-2026-09-11/APPROVAL.md",
        "reviewer": "Larry Herzog Jr.",
        "reviewDate": "2026-09-11",
        "changedFields": candidate_manifest["wordMetadataChanges"],
    },
})
del lexical_v4["artifacts"]["sources/word-explorer/words-2026-09-06-250.json"]
lexical_v4["artifacts"][WORD_ARTIFACT] = sha(word_candidate_bytes)

# Verify comparison bytes and prepare exact new approval records.
variants_path = ROOT / "content/editorial/variants.json"
variants_bytes = variants_path.read_bytes()
if sha(variants_bytes) != candidate_manifest["inputs"]["variantsSha256"]:
    raise SystemExit("Comparison predecessor differs from the approved candidate input.")
candidate_variants_path = candidate / "variants.candidate.json"
candidate_variants_bytes = candidate_variants_path.read_bytes()
if sha(candidate_variants_bytes) != candidate_manifest["structuredCandidateFiles"][candidate_variants_path.name]:
    raise SystemExit("Comparison candidate differs from the approved manifest.")
variants = json.loads(candidate_variants_bytes)
variants_by_id = {unit["id"]: unit for unit in variants}
original_by_id = {unit["id"]: unit for unit in json.loads(variants_bytes)}
changed_review_rows = candidate_manifest["comparisonReviewHashes"]
changed_ids = {row["unitId"] for row in changed_review_rows}
if len(changed_ids) != candidate_manifest["changedComparisonUnitCount"]:
    raise SystemExit("Changed comparison count differs from the approved candidate.")
for row in changed_review_rows:
    unit_id = row["unitId"]
    original_payload = {key: value for key, value in original_by_id[unit_id].items() if key != "status"}
    candidate_payload = {key: value for key, value in variants_by_id[unit_id].items() if key != "status"}
    if sha(json.dumps(original_payload, ensure_ascii=False, separators=(",", ":")).encode()) != row["previousReviewPayloadSha256"]:
        raise SystemExit(f"Previous comparison approval hash differs: {unit_id}")
    if sha(json.dumps(candidate_payload, ensure_ascii=False, separators=(",", ":")).encode()) != row["candidateReviewPayloadSha256"]:
        raise SystemExit(f"Candidate comparison approval hash differs: {unit_id}")
    if variants_by_id[unit_id]["status"] != "in-review":
        raise SystemExit(f"Changed comparison was not returned to review: {unit_id}")
    variants_by_id[unit_id]["status"] = "approved"

reviews_path = ROOT / "content/editorial/reviews.json"
reviews = json.loads(reviews_path.read_text())
for row in changed_review_rows:
    reviews.append({
        "unitId": row["unitId"],
        "reviewerId": "larry-herzog-jr",
        "contentHash": row["candidateReviewPayloadSha256"],
        "reviewedAt": "2026-09-11",
        "decision": "approved",
    })

# Refuse every immutable target collision before writing anything.
article_destination = ROOT / "sources/om-studies" / ARTICLE_RELEASE
word_destination = ROOT / WORD_ARTIFACT
lexical_manifest_destination = ROOT / "sources/dodson/manifest-v4.json"
for path in (article_destination, word_destination, lexical_manifest_destination):
    if path.exists():
        raise SystemExit(f"Immutable promotion target already exists: {path.relative_to(ROOT)}")

for relative, data in article_raw.items():
    target = article_destination / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
(article_destination / "manifest.json").write_bytes(encoded(article_manifest))
word_destination.write_bytes(word_candidate_bytes)
lexical_manifest_destination.write_bytes(encoded(lexical_v4))
variants_path.write_bytes(encoded(variants))
reviews_path.write_bytes(encoded(reviews))

print(json.dumps({
    "status": "promoted",
    "approvedCandidateManifestSha256": candidate_sha,
    "articleRelease": ARTICLE_RELEASE,
    "changedArticles": len(changed_slugs),
    "articleReplacements": candidate_manifest["articleChangeCount"],
    "wordMetadataArtifact": WORD_ARTIFACT,
    "lexicalRelease": LEXICAL_RELEASE,
    "comparisonUnitsReapproved": len(changed_ids),
}, indent=2))
