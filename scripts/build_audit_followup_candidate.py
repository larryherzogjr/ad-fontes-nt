"""Build a deterministic, non-public candidate for the five resolved audit findings."""

from __future__ import annotations

import hashlib
import json
import re
from copy import deepcopy
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / "docs/editorial-review/audit-followup-2026-09-11/CORRECTIONS.json"
OUTPUT = ROOT / "artifacts/editorial/audit-followup-2026-09-11-candidate-v1"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encoded(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def review_hash(unit: dict[str, object]) -> str:
    payload = {key: value for key, value in unit.items() if key != "status"}
    return sha(json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode())


if OUTPUT.exists():
    raise SystemExit("Candidate already exists; remove the ignored candidate directory before rebuilding it.")

spec_bytes = SPEC.read_bytes()
spec = json.loads(spec_bytes)
source_id = spec["sourceArticleRelease"]
source_dir = ROOT / "sources/om-studies" / source_id
source_manifest_bytes = (source_dir / "manifest.json").read_bytes()
source_manifest = json.loads(source_manifest_bytes)
if source_manifest["releaseId"] != source_id:
    raise SystemExit("Article predecessor identity differs from the correction specification.")
for relative, expected in source_manifest["files"].items():
    if sha((source_dir / relative).read_bytes()) != expected:
        raise SystemExit(f"Immutable predecessor changed: {relative}")

changes_by_slug: dict[str, list[dict[str, object]]] = {}
for change in spec["articleChanges"]:
    changes_by_slug.setdefault(change["slug"], []).append(change)

article_rows = {row["slug"]: row for row in source_manifest["articles"]}
if not set(changes_by_slug).issubset(article_rows):
    raise SystemExit("Correction specification names an unknown article.")

article_files: list[dict[str, object]] = []
applied_articles: list[dict[str, object]] = []
for slug in sorted(article_rows):
    source = source_dir / article_rows[slug]["sourcePath"]
    original = source.read_text()
    revised = original
    for change in changes_by_slug.get(slug, []):
        old = change["old"]
        if revised.count(old) != 1:
            raise SystemExit(f"{change['id']} expected exactly one article match.")
        revised = revised.replace(old, change["new"])
        applied_articles.append(deepcopy(change))
    target = OUTPUT / "articles/raw" / f"{slug}.md"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(revised)
    article_files.append({
        "file": f"articles/raw/{slug}.md",
        "sha256": sha(revised.encode()),
        "predecessorSha256": sha(original.encode()),
        "changed": revised != original,
    })

variants_path = ROOT / "content/editorial/variants.json"
variants_bytes = variants_path.read_bytes()
variants = json.loads(variants_bytes)
candidate_variants = deepcopy(variants)
original_by_id = {unit["id"]: unit for unit in variants}
candidate_by_id = {unit["id"]: unit for unit in candidate_variants}
comparison_rows: list[dict[str, object]] = []
review_rows: list[dict[str, str]] = []
for change in spec["comparisonChanges"]:
    unit_id = change["unitId"]
    field = change["field"]
    unit = candidate_by_id[unit_id]
    value = unit["significance"][field]
    if value.count(change["old"]) != 1:
        raise SystemExit(f"{change['id']} expected exactly one comparison match.")
    unit["significance"][field] = value.replace(change["old"], change["new"])
    unit["status"] = "in-review"
    comparison_rows.append(deepcopy(change))
    review_rows.append({
        "unitId": unit_id,
        "previousReviewPayloadSha256": review_hash(original_by_id[unit_id]),
        "candidateReviewPayloadSha256": review_hash(unit),
    })

candidate_variants_bytes = encoded(candidate_variants)
(OUTPUT / "variants.candidate.json").write_bytes(candidate_variants_bytes)
manifest = {
    "schemaVersion": 1,
    "candidateId": spec["candidateId"],
    "status": "unpublished-awaiting-exact-hash-approval",
    "candidateDate": spec["candidateDate"],
    "sourceArticleRelease": source_id,
    "proposedArticleRelease": spec["proposedArticleRelease"],
    "specSha256": sha(spec_bytes),
    "inputs": {
        "articleManifestSha256": sha(source_manifest_bytes),
        "variantsSha256": sha(variants_bytes),
    },
    "articleChangeCount": len(applied_articles),
    "changedArticleCount": sum(row["changed"] for row in article_files),
    "unchangedArticleCount": sum(not row["changed"] for row in article_files),
    "articleFiles": article_files,
    "articleChanges": applied_articles,
    "comparisonChangeCount": len(comparison_rows),
    "changedComparisonUnitCount": len(review_rows),
    "comparisonChanges": comparison_rows,
    "comparisonReviewHashes": review_rows,
    "structuredCandidateFiles": {
        "variants.candidate.json": sha(candidate_variants_bytes),
    },
    "resolvedFindingIds": [change["id"] for change in applied_articles + comparison_rows],
    "scriptureChanged": False,
    "authorWebsiteChanged": False,
}
manifest_bytes = encoded(manifest)
(OUTPUT / "CANDIDATE-MANIFEST.json").write_bytes(manifest_bytes)
(OUTPUT / "CORRECTIONS.json").write_bytes(spec_bytes)
validation = {
    "schemaVersion": 1,
    "status": "pass",
    "candidateManifestSha256": sha(manifest_bytes),
    "immutablePredecessorVerified": True,
    "articleCount": len(article_files),
    "changedArticleCount": manifest["changedArticleCount"],
    "articleChangeCount": manifest["articleChangeCount"],
    "comparisonChangeCount": manifest["comparisonChangeCount"],
    "sourceFilesModified": False,
}
(OUTPUT / "VALIDATION.json").write_bytes(encoded(validation))

review = [
    "# Resolved audit-findings candidate",
    "",
    "Status: **unpublished; awaiting exact candidate-manifest approval**",
    "",
    f"Candidate manifest SHA-256: `{sha(manifest_bytes)}`",
    "",
    f"Predecessor: `{source_id}`  ",
    f"Proposed immutable successor: `{spec['proposedArticleRelease']}`",
    "",
]
for change in applied_articles + comparison_rows:
    review.extend([
        f"## {change['id']}",
        "",
        f"Reason: {change['reason']}",
        "",
        "Before:",
        "",
        f"> {change['old']}",
        "",
        "After:",
        "",
        f"> {change['new']}",
        "",
    ])
review.extend(["## Comparison approval hash", ""])
for row in review_rows:
    review.append(
        f"- `{row['unitId']}`: `{row['previousReviewPayloadSha256']}` → "
        f"`{row['candidateReviewPayloadSha256']}` (previous approval invalidated)"
    )
(OUTPUT / "REVIEW.md").write_text("\n".join(review) + "\n")

print(json.dumps(validation, indent=2))
