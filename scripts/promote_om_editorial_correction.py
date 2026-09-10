"""Promote an explicitly approved OM editorial-correction candidate."""

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encoded(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


parser = argparse.ArgumentParser()
parser.add_argument("--candidate", type=Path, required=True)
parser.add_argument("--approval-record", type=Path, required=True)
parser.add_argument("--approved-manifest-sha256", required=True)
args = parser.parse_args()

if not re.fullmatch(r"[0-9a-f]{64}", args.approved_manifest_sha256):
    raise SystemExit("Invalid approved candidate-manifest SHA-256.")

candidate_root = (ROOT / "artifacts" / "editorial").resolve()
candidate = args.candidate.resolve()
if candidate_root not in candidate.parents:
    raise SystemExit("Candidate must be below artifacts/editorial.")

candidate_manifest_bytes = (candidate / "CANDIDATE-MANIFEST.json").read_bytes()
candidate_manifest_sha = sha(candidate_manifest_bytes)
if candidate_manifest_sha != args.approved_manifest_sha256:
    raise SystemExit("Candidate manifest does not match the approved SHA-256.")
candidate_manifest = json.loads(candidate_manifest_bytes)

validation_bytes = (candidate / "VALIDATION.json").read_bytes()
validation = json.loads(validation_bytes)
if validation.get("status") != "pass":
    raise SystemExit("Candidate validation did not pass.")
if validation.get("candidateManifestSha256") != candidate_manifest_sha:
    raise SystemExit("Candidate validation is not bound to the approved manifest.")

predecessor_id = str(candidate_manifest["sourceRelease"])
release_id = str(candidate_manifest["proposedRelease"])
if not re.fullmatch(r"[a-z0-9-]+", predecessor_id) or not re.fullmatch(r"[a-z0-9-]+", release_id):
    raise SystemExit("Invalid release ID.")
predecessor_dir = ROOT / "sources" / "om-studies" / predecessor_id
destination = ROOT / "sources" / "om-studies" / release_id
if destination.exists():
    raise SystemExit("Release already exists; preserve it and choose a new release ID.")
predecessor = json.loads((predecessor_dir / "manifest.json").read_text())

for relative, expected in predecessor["files"].items():
    if sha((predecessor_dir / relative).read_bytes()) != expected:
        raise SystemExit(f"Immutable predecessor changed: {relative}")

approval_bytes = args.approval_record.read_bytes()
if candidate_manifest_sha.encode() not in approval_bytes:
    raise SystemExit("Approval record does not bind the candidate-manifest SHA-256.")

candidate_files = {str(row["slug"]): row for row in candidate_manifest["files"]}
predecessor_articles = {str(row["slug"]): row for row in predecessor["articles"]}
if set(candidate_files) != set(predecessor_articles):
    raise SystemExit("Candidate and predecessor article inventories differ.")
if len(candidate_files) != candidate_manifest["articleCount"]:
    raise SystemExit("Candidate article count is inconsistent.")

raw: dict[str, bytes] = {}
files: dict[str, str] = {}
articles: list[dict[str, object]] = []
bodies: dict[str, str] = {}
changed_slugs: list[str] = []
for slug in sorted(candidate_files):
    row = candidate_files[slug]
    data = (candidate / str(row["file"])).read_bytes()
    if sha(data) != row["sha256"]:
        raise SystemExit(f"Candidate article changed after approval: {slug}")
    predecessor_data = (predecessor_dir / str(predecessor_articles[slug]["sourcePath"])).read_bytes()
    if sha(predecessor_data) != row["predecessorSha256"]:
        raise SystemExit(f"Candidate is not based on the recorded predecessor: {slug}")
    changed = data != predecessor_data
    if changed != bool(row["changed"]):
        raise SystemExit(f"Candidate change flag is inaccurate: {slug}")
    if changed:
        changed_slugs.append(slug)
    match = re.match(rb"^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$", data)
    if not match:
        raise SystemExit(f"Invalid article front matter: {slug}")
    source_path = f"raw/{slug}.md"
    raw[source_path] = data
    files[source_path] = sha(data)
    articles.append({
        **predecessor_articles[slug],
        "sourcePath": source_path,
        "contentSha256": sha(data),
    })
    bodies[slug] = match[1].decode()

if len(changed_slugs) != candidate_manifest["changedArticleCount"]:
    raise SystemExit("Changed-article count differs from the approved candidate.")
if len(candidate_manifest["changes"]) != candidate_manifest["replacementCount"]:
    raise SystemExit("Replacement count differs from the approved candidate.")

evidence = {
    "evidence/APPROVAL.md": approval_bytes,
    "evidence/CANDIDATE-MANIFEST.json": candidate_manifest_bytes,
    "evidence/CORRECTIONS.json": (candidate / "CORRECTIONS.json").read_bytes(),
    "evidence/REVIEW.md": (candidate / "REVIEW.md").read_bytes(),
    "evidence/VALIDATION.json": validation_bytes,
}
for relative, data in evidence.items():
    raw[relative] = data
    files[relative] = sha(data)

manifest = {
    "schemaVersion": 2,
    "releaseId": release_id,
    "snapshotDate": candidate_manifest["candidateDate"],
    "predecessor": predecessor_id,
    "sourceRepositoryRevision": predecessor["sourceRepositoryRevision"],
    "correctionRepositoryRevision": subprocess.check_output(
        ["git", "-C", str(ROOT), "rev-parse", "HEAD"], text=True
    ).strip(),
    "sourceWorkingTree": "Exact approved editorial-correction candidate bytes and promotion evidence are preserved and hashed in this snapshot.",
    "scope": "250 approved app-only BSB Greek articles with ten word-count/language corrections in six articles; larryherzogjr.com remains unchanged.",
    "approvalEvidence": "evidence/APPROVAL.md",
    "adaptation": predecessor["adaptation"],
    "editorialCorrection": {
        "candidateId": candidate_manifest["candidateId"],
        "candidateManifestSha256": candidate_manifest_sha,
        "validationSha256": sha(validation_bytes),
        "reviewer": "Larry Herzog Jr.",
        "reviewDate": candidate_manifest["candidateDate"],
        "changedArticles": changed_slugs,
        "replacementCount": candidate_manifest["replacementCount"],
        "unchangedArticleCount": candidate_manifest["unchangedArticleCount"],
        "scriptureChanged": False,
        "authorWebsiteChanged": False,
    },
    "files": files,
    "articles": articles,
}

summaries = [{**article, "snapshotDate": manifest["snapshotDate"]} for article in articles]
outputs = {
    "index.json": encoded({"schemaVersion": 2, "releaseId": release_id, "articles": summaries})
}
for article in articles:
    slug = str(article["slug"])
    outputs[f"articles/{slug}.json"] = encoded({
        "schemaVersion": 2,
        "releaseId": release_id,
        "article": {**article, "markdown": bodies[slug], "snapshotDate": manifest["snapshotDate"]},
    })
manifest["outputChecksums"] = {relative: sha(data) for relative, data in outputs.items()}

for relative, data in raw.items():
    target = destination / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
(destination / "manifest.json").write_bytes(encoded(manifest))
print(f"Promoted {len(articles)} articles to immutable release {release_id}.")
