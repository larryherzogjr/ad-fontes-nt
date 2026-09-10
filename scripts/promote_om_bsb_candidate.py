"""Promote one explicitly approved BSB adaptation candidate into an immutable OM release."""
import argparse
import hashlib
import json
import re
from pathlib import Path


EXPECTED_CANDIDATE_SHA256 = "dad1b34f996eb44bc30e9641083f39b8945992f768a2b96b511f0a695647eb2d"
EXPECTED_VALIDATOR_SHA256 = "ebf8611fdbf23710ebb61216357e92e9cc5964f6f74bd5c692717ed0df40abbd"
EXPECTED_BSB_SHA256 = "2ac3af1de52d4e68261cba91d85c320b7eadc6560e830d99e591767b8ff5ca96"
FALLBACK_RULE_VERSION = "smallest-supported-whole-verse-v1"


parser = argparse.ArgumentParser()
parser.add_argument("--candidate", type=Path, required=True)
parser.add_argument("--approval-record", type=Path, required=True)
parser.add_argument("--editor-verification", type=Path, required=True)
parser.add_argument("--release", required=True)
parser.add_argument("--predecessor", required=True)
args = parser.parse_args()

root = Path(__file__).resolve().parent.parent
if not re.fullmatch(r"[a-z0-9-]+", args.release):
    raise SystemExit("Invalid release name")
if not re.fullmatch(r"[a-z0-9-]+", args.predecessor):
    raise SystemExit("Invalid predecessor name")
destination = root / "sources/om-studies" / args.release
predecessor_dir = root / "sources/om-studies" / args.predecessor
if destination.exists():
    raise SystemExit("Release already exists; preserve it and choose a new release name.")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encoded(data: object) -> bytes:
    return (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode()


candidate_manifest_bytes = (args.candidate / "CANDIDATE-MANIFEST.json").read_bytes()
validator_bytes = (args.candidate / "VALIDATOR-REPORT.json").read_bytes()
verification_bytes = (args.candidate / "VERIFICATION.json").read_bytes()
review_bytes = (args.candidate / "REVIEW.md").read_bytes()
readme_bytes = (args.candidate / "README.md").read_bytes()
approval_bytes = args.approval_record.read_bytes()
editor_verification_bytes = args.editor_verification.read_bytes()

if sha(candidate_manifest_bytes) != EXPECTED_CANDIDATE_SHA256:
    raise SystemExit("Candidate manifest differs from the approved v30 hash.")
if sha(validator_bytes) != EXPECTED_VALIDATOR_SHA256:
    raise SystemExit("Validator report differs from the approved v30 hash.")
for expected in (EXPECTED_CANDIDATE_SHA256, EXPECTED_VALIDATOR_SHA256, EXPECTED_BSB_SHA256):
    if expected.encode() not in approval_bytes:
        raise SystemExit(f"Approval record does not bind required hash {expected}.")

candidate_manifest = json.loads(candidate_manifest_bytes)
validator = json.loads(validator_bytes)
verification = json.loads(verification_bytes)
predecessor = json.loads((predecessor_dir / "manifest.json").read_text())
if candidate_manifest.get("sourceRelease") != args.predecessor:
    raise SystemExit("Candidate source release does not match predecessor.")
if candidate_manifest.get("articleCount") != 250 or len(candidate_manifest.get("files", [])) != 250:
    raise SystemExit("Candidate inventory must contain exactly 250 articles.")
if validator.get("status") != "pass" or validator.get("errors") != []:
    raise SystemExit("Candidate validator did not pass cleanly.")
if validator.get("candidateManifestSha256") != EXPECTED_CANDIDATE_SHA256:
    raise SystemExit("Validator is not bound to the approved candidate.")
if validator.get("bsbSourceSha256") != EXPECTED_BSB_SHA256:
    raise SystemExit("Validator is not bound to the pinned BSB source.")
if verification.get("candidateManifestSha256") != EXPECTED_CANDIDATE_SHA256:
    raise SystemExit("Verification data is not bound to the approved candidate.")
if verification.get("inlineReviewSampleSeed") != EXPECTED_CANDIDATE_SHA256:
    raise SystemExit("Unexpected deterministic review sample seed.")
if len(verification.get("inlineReviewSample", [])) != 136:
    raise SystemExit("Unexpected deterministic review sample size.")
if len(verification.get("lowConfidence", [])) != 243:
    raise SystemExit("Unexpected fallback inventory.")
if len(verification.get("suppressedContainedEvidence", [])) != 32:
    raise SystemExit("Unexpected contained-overlap inventory.")
if not verification.get("inlineReplacementKeysUnique") or verification.get("unmatched"):
    raise SystemExit("Candidate contains unresolved or ambiguous replacement evidence.")

candidate_files = {row["slug"]: row for row in candidate_manifest["files"]}
predecessor_articles = {row["slug"]: row for row in predecessor["articles"]}
if set(candidate_files) != set(predecessor_articles):
    raise SystemExit("Candidate and predecessor article inventories differ.")

files: dict[str, str] = {}
raw: dict[str, bytes] = {}
articles: list[dict[str, object]] = []
bodies: dict[str, str] = {}
for slug in sorted(candidate_files):
    row = candidate_files[slug]
    candidate_path = args.candidate / row["file"]
    data = candidate_path.read_bytes()
    if sha(data) != row["sha256"]:
        raise SystemExit(f"Candidate article changed: {slug}")
    match = re.match(r"^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$", data.decode())
    if not match:
        raise SystemExit(f"Invalid candidate front matter: {slug}")
    source_path = f"raw/{slug}.md"
    raw[source_path] = data
    files[source_path] = sha(data)
    article = {**predecessor_articles[slug], "sourcePath": source_path, "contentSha256": sha(data)}
    articles.append(article)
    bodies[slug] = match[1]

evidence = {
    "evidence/APPROVAL.md": approval_bytes,
    "evidence/CANDIDATE-MANIFEST.json": candidate_manifest_bytes,
    "evidence/EDITOR-VERIFICATION.md": editor_verification_bytes,
    "evidence/README.md": readme_bytes,
    "evidence/REVIEW.md": review_bytes,
    "evidence/VALIDATOR-REPORT.json": validator_bytes,
    "evidence/VERIFICATION.json": verification_bytes,
}
for path, data in evidence.items():
    raw[path] = data
    files[path] = sha(data)

manifest = {
    "schemaVersion": 2,
    "releaseId": args.release,
    "snapshotDate": "2026-09-09",
    "predecessor": args.predecessor,
    "sourceRepositoryRevision": predecessor["sourceRepositoryRevision"],
    "sourceWorkingTree": "Exact approved BSB adaptation candidate v30 bytes and all promotion evidence are preserved and hashed in this snapshot.",
    "scope": "250 approved Greek articles adapted to BSB for the Ad Fontes NT website and desktop apps; larryherzogjr.com remains unchanged as the original edition.",
    "approvalEvidence": "evidence/APPROVAL.md",
    "adaptation": {
        "edition": "BSB",
        "candidateManifestSha256": EXPECTED_CANDIDATE_SHA256,
        "validatorReportSha256": EXPECTED_VALIDATOR_SHA256,
        "bsbSource": "sources/bsb/raw/bsb.txt",
        "bsbSourceSha256": EXPECTED_BSB_SHA256,
        "reviewer": "Larry Herzog Jr.",
        "reviewDate": "2026-09-09",
        "sampleSeed": verification["inlineReviewSampleSeed"],
        "sampleCount": len(verification["inlineReviewSample"]),
        "sub065ItemsClearedInContext": True,
        "fallbackRuleVersion": FALLBACK_RULE_VERSION,
        "fallbackCount": len(verification["lowConfidence"]),
        "overlapResolution": {
            "containedEvidenceSuppressed": len(verification["suppressedContainedEvidence"]),
            "survivingReplacementKeysUnique": True,
            "partialOverlaps": 0,
        },
    },
    "files": files,
    "articles": articles,
}
summaries = [{**article, "snapshotDate": manifest["snapshotDate"]} for article in articles]
outputs = {"index.json": encoded({"schemaVersion": 2, "releaseId": args.release, "articles": summaries})}
for article in articles:
    outputs[f"articles/{article['slug']}.json"] = encoded({
        "schemaVersion": 2,
        "releaseId": args.release,
        "article": {**article, "markdown": bodies[str(article["slug"])], "snapshotDate": manifest["snapshotDate"]},
    })
manifest["outputChecksums"] = {path: sha(data) for path, data in outputs.items()}

for path, data in raw.items():
    target = destination / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
(destination / "manifest.json").write_bytes(encoded(manifest))
print(f"Promoted {len(articles)} approved BSB adaptations to immutable release {args.release}.")
