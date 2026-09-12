"""Promote the explicitly approved second-pass correction candidate.

This creates immutable article and word-metadata successors, a new lexical
release, and fresh approval records for the affected comparison units. It does
not deploy or touch the hosted application or the author's website.
"""

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
ARTICLE_RELEASE = "om-studies-2026-09-12-v8"
WORD_ARTIFACT = "sources/word-explorer/words-2026-09-12-250.json"
LEXICAL_RELEASE = "dodson-2010-v5"
EXPECTED_CANDIDATE_ID = "second-pass-audit-2026-09-12-candidate-v10"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encoded(value: object, *, compact: bool = False) -> bytes:
    if compact:
        return (json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if text.count(old) != 1:
        raise SystemExit(f"{label}: expected one predecessor match.")
    return text.replace(old, new)


def review_hash(unit: dict[str, object]) -> str:
    payload = {key: value for key, value in unit.items() if key != "status"}
    return sha(json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode())


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
if candidate_manifest.get("candidateId") != EXPECTED_CANDIDATE_ID:
    raise SystemExit("Unexpected candidate identity.")
if candidate_manifest.get("proposedRelease") != ARTICLE_RELEASE:
    raise SystemExit("Unexpected proposed article release.")

validation_bytes = (candidate / "VALIDATION.json").read_bytes()
validation = json.loads(validation_bytes)
if validation.get("status") != "pass" or validation.get("candidateManifestSha256") != candidate_sha:
    raise SystemExit("Candidate validation is not bound to the approved manifest.")
if not validation.get("confessionalSourceVerificationPassed") or validation.get("physicalSourceVerificationPending"):
    raise SystemExit("Confessional source verification gate has not passed.")
approval_bytes = args.approval_record.read_bytes()
if candidate_sha.encode() not in approval_bytes:
    raise SystemExit("Approval record does not bind the approved manifest SHA-256.")

# Verify the immutable predecessor and every approved article byte.
predecessor_id = str(candidate_manifest["sourceRelease"])
predecessor_dir = ROOT / "sources/om-studies" / predecessor_id
predecessor_manifest_bytes = (predecessor_dir / "manifest.json").read_bytes()
if sha(predecessor_manifest_bytes) != candidate_manifest["inputs"]["sourceManifestSha256"]:
    raise SystemExit("Article predecessor manifest differs from the approved candidate input.")
predecessor = json.loads(predecessor_manifest_bytes)
for relative, expected in predecessor["files"].items():
    if sha((predecessor_dir / relative).read_bytes()) != expected:
        raise SystemExit(f"Immutable article predecessor changed: {relative}")

candidate_articles = {str(row["slug"]): row for row in candidate_manifest["files"]}
predecessor_articles = {str(row["slug"]): row for row in predecessor["articles"]}
if set(candidate_articles) != set(predecessor_articles) or len(candidate_articles) != 250:
    raise SystemExit("Candidate and predecessor article inventories differ.")

release_files: dict[str, bytes] = {}
release_hashes: dict[str, str] = {}
articles: list[dict[str, object]] = []
bodies: dict[str, str] = {}
changed_slugs: list[str] = []
for slug in sorted(candidate_articles):
    row = candidate_articles[slug]
    data = (candidate / str(row["file"])).read_bytes()
    predecessor_data = (predecessor_dir / str(predecessor_articles[slug]["sourcePath"])).read_bytes()
    if sha(data) != row["sha256"] or sha(predecessor_data) != row["predecessorSha256"]:
        raise SystemExit(f"Article binding failed: {slug}")
    changed = data != predecessor_data
    if changed != bool(row["changed"]):
        raise SystemExit(f"Article change flag differs: {slug}")
    if changed:
        changed_slugs.append(slug)
    match = re.match(rb"^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$", data)
    if not match:
        raise SystemExit(f"Invalid article front matter: {slug}")
    relative = f"raw/{slug}.md"
    release_files[relative] = data
    release_hashes[relative] = sha(data)
    articles.append({
        **predecessor_articles[slug],
        "sourcePath": relative,
        "contentSha256": sha(data),
    })
    bodies[slug] = match[1].decode()
if len(changed_slugs) != candidate_manifest["changedArticleCount"]:
    raise SystemExit("Changed article count differs from the approved candidate.")
if len(candidate_manifest["changes"]) != candidate_manifest["replacementCount"]:
    raise SystemExit("Replacement count differs from the approved candidate.")

# Preserve all approval-bound non-article evidence inside the immutable release.
evidence_names = [
    "CANDIDATE-MANIFEST.json",
    "CONFESSIONAL-QUOTATION-INVENTORY.json",
    "CORRECTIONS.json",
    "FALLBACK-REVIEW.json",
    "FREQUENCY-REVIEW.json",
    "LEMMA-FREQUENCIES.json",
    "REVIEW.md",
    "SOURCE-VERIFICATION-CHECKLIST.md",
    "SOURCE-VERIFICATION-REPORT.md",
    "VALIDATION.json",
    "variants.candidate.json",
    "words-2026-09-12-250.candidate.json",
    "app/reader/word-studies.tsx",
]
evidence_sources: dict[str, bytes] = {"evidence/APPROVAL.md": approval_bytes}
for name in evidence_names:
    data = (candidate / name).read_bytes()
    if name in candidate_manifest.get("evidenceFiles", {}) and sha(data) != candidate_manifest["evidenceFiles"][name]:
        raise SystemExit(f"Candidate evidence changed: {name}")
    if name in candidate_manifest.get("structuredCandidateFiles", {}) and sha(data) != candidate_manifest["structuredCandidateFiles"][name]:
        raise SystemExit(f"Structured candidate changed: {name}")
    evidence_sources[f"evidence/{name}"] = data
for relative, data in evidence_sources.items():
    release_files[relative] = data
    release_hashes[relative] = sha(data)

article_manifest = {
    "schemaVersion": 2,
    "releaseId": ARTICLE_RELEASE,
    "snapshotDate": candidate_manifest["candidateDate"],
    "predecessor": predecessor_id,
    "sourceRepositoryRevision": predecessor["sourceRepositoryRevision"],
    "correctionRepositoryRevision": subprocess.check_output(
        ["git", "-C", str(ROOT), "rev-parse", "HEAD"], text=True
    ).strip(),
    "sourceWorkingTree": "Exact approved second-pass candidate bytes and promotion evidence are preserved and hashed in this snapshot.",
    "scope": "250 approved app-only BSB Greek articles with reconciled second-pass, theological, and confessional-source corrections; larryherzogjr.com remains unchanged.",
    "approvalEvidence": "evidence/APPROVAL.md",
    "adaptation": predecessor["adaptation"],
    "priorEditorialCorrection": predecessor.get("priorEditorialCorrection"),
    "editorialAuditCorrection": predecessor.get("editorialAuditCorrection"),
    "auditFollowupCorrection": predecessor.get("auditFollowupCorrection"),
    "secondPassCorrection": {
        "candidateId": candidate_manifest["candidateId"],
        "candidateManifestSha256": candidate_sha,
        "validationSha256": sha(validation_bytes),
        "reviewer": "Larry Herzog Jr.",
        "reviewDate": candidate_manifest["candidateDate"],
        "changedArticles": changed_slugs,
        "replacementCount": candidate_manifest["replacementCount"],
        "unchangedArticleCount": candidate_manifest["unchangedArticleCount"],
        "confessionalSourceVerificationPassed": True,
        "wordMetadataChanges": candidate_manifest["wordMetadataChanges"],
        "comparisonChanges": candidate_manifest["comparisonChanges"],
        "scriptureChanged": False,
        "authorWebsiteChanged": False,
    },
    "files": release_hashes,
    "articles": articles,
}
summaries = [{**article, "snapshotDate": candidate_manifest["candidateDate"]} for article in articles]
article_outputs = {
    "index.json": encoded({"schemaVersion": 2, "releaseId": ARTICLE_RELEASE, "articles": summaries})
}
for article in articles:
    slug = str(article["slug"])
    article_outputs[f"articles/{slug}.json"] = encoded({
        "schemaVersion": 2,
        "releaseId": ARTICLE_RELEASE,
        "article": {**article, "markdown": bodies[slug], "snapshotDate": candidate_manifest["candidateDate"]},
    })
article_manifest["outputChecksums"] = {relative: sha(data) for relative, data in article_outputs.items()}

# Verify that the approved word file is exactly the current predecessor plus the
# three manifest-listed changes, then create a new lexical release around it.
word_source_path = ROOT / "sources/word-explorer/words-2026-09-11-250.json"
word_source = json.loads(word_source_path.read_text())
expected_words = deepcopy(word_source)
for change in candidate_manifest["wordMetadataChanges"]:
    row = next(item for item in expected_words if item["slug"] == change["slug"])
    if row[change["field"]] != change["old"]:
        raise SystemExit(f"Word metadata predecessor differs: {change['slug']}")
    row[change["field"]] = change["new"]
    if change["field"] == "translit" and row.get("description", "").startswith(change["old"] + " "):
        row["description"] = change["new"] + row["description"][len(change["old"]):]
word_candidate_bytes = (candidate / "words-2026-09-12-250.candidate.json").read_bytes()
if sha(word_candidate_bytes) != candidate_manifest["structuredCandidateFiles"]["words-2026-09-12-250.candidate.json"]:
    raise SystemExit("Word metadata candidate differs from the approved manifest.")
if json.loads(word_candidate_bytes) != expected_words:
    raise SystemExit("Word metadata candidate contains an unapproved difference.")

lexical_v4 = json.loads((ROOT / "sources/dodson/manifest-v4.json").read_text())
if lexical_v4["artifacts"].get("sources/word-explorer/words-2026-09-11-250.json") != sha(word_source_path.read_bytes()):
    raise SystemExit("Lexical v4 does not bind the word-metadata predecessor.")
lookup = json.loads(build_lexicon("manifest-v4.json"))
lookup["releaseId"] = LEXICAL_RELEASE
changed_titles = {change["slug"]: change["new"] for change in candidate_manifest["wordMetadataChanges"]}
for links in lookup["links"].values():
    for link in links:
        slug = link["url"].rstrip("/").rsplit("/", 1)[-1]
        if slug in changed_titles:
            link["title"] = changed_titles[slug]
lookup_bytes = encoded(lookup, compact=True)
lexical_v5 = deepcopy(lexical_v4)
lexical_v5.update({
    "releaseId": LEXICAL_RELEASE,
    "predecessor": lexical_v4["releaseId"],
    "wordExplorerRetrieved": candidate_manifest["candidateDate"],
    "wordExplorerArtifact": WORD_ARTIFACT,
    "outputSha256": sha(lookup_bytes),
    "editorialApproval": {
        "candidateManifestSha256": candidate_sha,
        "approvalRecord": "docs/editorial-review/second-pass-audit-2026-09-12/APPROVAL-v10.md",
        "reviewer": "Larry Herzog Jr.",
        "reviewDate": candidate_manifest["candidateDate"],
        "changedFields": candidate_manifest["wordMetadataChanges"],
    },
})
del lexical_v5["artifacts"]["sources/word-explorer/words-2026-09-11-250.json"]
lexical_v5["artifacts"][WORD_ARTIFACT] = sha(word_candidate_bytes)

# Verify the three comparison records are exactly the predecessor plus the five
# approved phrase changes, then approve their final payload hashes.
variants_path = ROOT / "content/editorial/variants.json"
original_variants = json.loads(variants_path.read_text())
expected_variants = deepcopy(original_variants)
expected_by_id = {unit["id"]: unit for unit in expected_variants}
for change in candidate_manifest["comparisonChanges"]:
    unit = expected_by_id[change["unitId"]]
    field = change["field"]
    unit["significance"][field] = replace_once(
        unit["significance"][field], change["old"], change["new"], f"comparison-{change['unitId']}"
    )
    unit["status"] = "in-review"
variant_candidate_bytes = (candidate / "variants.candidate.json").read_bytes()
if sha(variant_candidate_bytes) != candidate_manifest["structuredCandidateFiles"]["variants.candidate.json"]:
    raise SystemExit("Comparison candidate differs from the approved manifest.")
candidate_variants = json.loads(variant_candidate_bytes)
if candidate_variants != expected_variants:
    raise SystemExit("Comparison candidate contains an unapproved difference.")
candidate_by_id = {unit["id"]: unit for unit in candidate_variants}
changed_ids = sorted({change["unitId"] for change in candidate_manifest["comparisonChanges"]})
comparison_hashes = []
for unit_id in changed_ids:
    if candidate_by_id[unit_id]["status"] != "in-review":
        raise SystemExit(f"Comparison unit was not returned to review: {unit_id}")
    payload_hash = review_hash(candidate_by_id[unit_id])
    comparison_hashes.append({"unitId": unit_id, "contentHash": payload_hash})
    candidate_by_id[unit_id]["status"] = "approved"

reviews_path = ROOT / "content/editorial/reviews.json"
reviews = json.loads(reviews_path.read_text())
for row in comparison_hashes:
    reviews.append({
        "unitId": row["unitId"],
        "reviewerId": "larry-herzog-jr",
        "contentHash": row["contentHash"],
        "reviewedAt": candidate_manifest["candidateDate"],
        "decision": "approved",
    })

# Refuse every immutable collision before writing any promotion output.
article_destination = ROOT / "sources/om-studies" / ARTICLE_RELEASE
word_destination = ROOT / WORD_ARTIFACT
lexical_manifest_destination = ROOT / "sources/dodson/manifest-v5.json"
for path in (article_destination, word_destination, lexical_manifest_destination):
    if path.exists():
        raise SystemExit(f"Immutable promotion target already exists: {path.relative_to(ROOT)}")

for relative, data in release_files.items():
    target = article_destination / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
(article_destination / "manifest.json").write_bytes(encoded(article_manifest))
word_destination.write_bytes(word_candidate_bytes)
lexical_manifest_destination.write_bytes(encoded(lexical_v5))
variants_path.write_bytes(encoded(candidate_variants))
reviews_path.write_bytes(encoded(reviews))

print(json.dumps({
    "status": "promoted",
    "approvedCandidateManifestSha256": candidate_sha,
    "articleRelease": ARTICLE_RELEASE,
    "changedArticles": len(changed_slugs),
    "articleReplacements": candidate_manifest["replacementCount"],
    "wordMetadataArtifact": WORD_ARTIFACT,
    "lexicalRelease": LEXICAL_RELEASE,
    "comparisonApprovals": comparison_hashes,
}, indent=2))
