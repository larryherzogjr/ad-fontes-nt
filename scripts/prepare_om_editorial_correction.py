"""Prepare a deterministic, non-public candidate from an immutable OM release.

The correction specification must name exact old/new strings. This script verifies
the predecessor, applies only those replacements, and records every resulting file
hash. It never edits or promotes an immutable release.
"""

import argparse
import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encoded(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def reject_duplicate_keys(pairs: list[tuple[str, object]]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


parser = argparse.ArgumentParser()
parser.add_argument("--predecessor", required=True)
parser.add_argument("--spec", type=Path, required=True)
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()

if not re.fullmatch(r"[a-z0-9-]+", args.predecessor):
    raise SystemExit("Invalid predecessor release ID.")
predecessor_dir = ROOT / "sources" / "om-studies" / args.predecessor
manifest_path = predecessor_dir / "manifest.json"
if not manifest_path.is_file():
    raise SystemExit("Predecessor manifest is missing.")
candidate_root = (ROOT / "artifacts" / "editorial").resolve()
output = args.output.resolve()
if candidate_root not in output.parents:
    raise SystemExit("Candidate output must be below artifacts/editorial.")
if args.output.exists():
    raise SystemExit("Candidate output already exists; use a new path.")

predecessor = json.loads(manifest_path.read_text())
spec_bytes = args.spec.read_bytes()
try:
    spec = json.loads(spec_bytes, object_pairs_hook=reject_duplicate_keys)
except ValueError as error:
    raise SystemExit(f"Invalid correction spec: {error}") from error
if spec.get("sourceRelease") != args.predecessor:
    raise SystemExit("Correction spec and predecessor do not match.")
if spec.get("proposedRelease") == args.predecessor:
    raise SystemExit("Proposed release must differ from its predecessor.")

for relative, expected in predecessor["files"].items():
    actual = sha((predecessor_dir / relative).read_bytes())
    if actual != expected:
        raise SystemExit(f"Immutable predecessor changed: {relative}")

changes_by_slug: dict[str, list[dict[str, object]]] = {}
change_ids: set[str] = set()
for change in spec["changes"]:
    change_id = str(change["id"])
    slug = str(change["slug"])
    if change_id in change_ids:
        raise SystemExit(f"Duplicate correction ID: {change_id}")
    if not re.fullmatch(r"[a-z0-9-]+", slug):
        raise SystemExit(f"Invalid correction slug: {slug}")
    if not change["old"] or change["old"] == change["new"]:
        raise SystemExit(f"Invalid replacement: {change_id}")
    change_ids.add(change_id)
    changes_by_slug.setdefault(slug, []).append(change)

predecessor_articles = {str(row["slug"]): row for row in predecessor["articles"]}
if not set(changes_by_slug).issubset(predecessor_articles):
    raise SystemExit("Correction spec names an article absent from the predecessor.")

files: list[dict[str, object]] = []
applied: list[dict[str, object]] = []
for slug in sorted(predecessor_articles):
    source_path = predecessor_dir / str(predecessor_articles[slug]["sourcePath"])
    original = source_path.read_text()
    revised = original
    for change in changes_by_slug.get(slug, []):
        old = str(change["old"])
        expected_count = int(change.get("count", 1))
        actual_count = revised.count(old)
        if actual_count != expected_count:
            raise SystemExit(
                f"Correction {change['id']} expected {expected_count} exact match(es); found {actual_count}."
            )
        revised = revised.replace(old, str(change["new"]))
        applied.append({
            "id": change["id"],
            "slug": slug,
            "matchCount": actual_count,
            "old": old,
            "new": change["new"],
            "reason": change["reason"],
            "findingIds": change.get("findingIds", []),
            "fallbackKeys": change.get("fallbackKeys", []),
        })
    target = args.output / "raw" / f"{slug}.md"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(revised)
    files.append({
        "slug": slug,
        "file": f"raw/{slug}.md",
        "sha256": sha(revised.encode()),
        "predecessorSha256": sha(original.encode()),
        "changed": revised != original,
    })

changed_files = [row for row in files if row["changed"]]
candidate_manifest = {
    "schemaVersion": 1,
    "candidateId": spec["candidateId"],
    "candidateDate": spec["candidateDate"],
    "sourceRelease": args.predecessor,
    "proposedRelease": spec["proposedRelease"],
    "articleCount": len(files),
    "changedArticleCount": len(changed_files),
    "unchangedArticleCount": len(files) - len(changed_files),
    "replacementCount": len(applied),
    "specSha256": sha(spec_bytes),
    "files": files,
    "changes": applied,
}
manifest_bytes = encoded(candidate_manifest)
(args.output / "CANDIDATE-MANIFEST.json").write_bytes(manifest_bytes)
(args.output / "CORRECTIONS.json").write_bytes(spec_bytes)

validation = {
    "schemaVersion": 1,
    "status": "pass",
    "candidateManifestSha256": sha(manifest_bytes),
    "sourceRelease": args.predecessor,
    "proposedRelease": spec["proposedRelease"],
    "articleCount": len(files),
    "changedArticles": [row["slug"] for row in changed_files],
    "replacementCount": len(applied),
    "predecessorVerified": True,
    "scope": spec.get(
        "scope",
        "Exact editorial corrections only; no Scripture corpus data changed.",
    ),
}
(args.output / "VALIDATION.json").write_bytes(encoded(validation))

review_lines = [
    "# OM article editorial-correction candidate",
    "",
    f"Candidate manifest SHA-256: `{sha(manifest_bytes)}`",
    "",
    f"Predecessor: `{args.predecessor}`  ",
    f"Proposed release: `{spec['proposedRelease']}`",
    "",
    f"All {len(files)} predecessor article files were verified. "
    f"Exactly {len(applied)} replacements affect {len(changed_files)} articles; "
    f"the other {len(files) - len(changed_files)} articles are byte-for-byte unchanged.",
    "",
]
for change in applied:
    review_lines.extend([
        f"## {change['id']} — {change['slug']}",
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
(args.output / "REVIEW.md").write_text("\n".join(review_lines))

print(json.dumps(validation, ensure_ascii=False, indent=2))
