#!/usr/bin/env python3
"""Prepare review evidence for Codex Sinaiticus plates across all variant units.

This script reads the pinned Codex Sinaiticus Project transcription and the
cached CSNTM GA 01 group page. It does not fetch or publish anything. The
output is a review aid: an image-page match plus a transcription locator is
not, by itself, an approved caption or a textual judgment.
"""

from __future__ import annotations

import hashlib
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_RELEASE = ROOT / "sources/visuals/csntm-2026-09-12-v1"
DISCOVERY_RELEASE = ROOT / "sources/visuals/csntm-discovery-2026-09-12-v1-candidate"
OUTPUT = ROOT / "sources/visuals/csntm-sinaiticus-2026-09-12-v2-candidate"
TRANSCRIPTION_ZIP = SOURCE_RELEASE / "evidence/FINAL_TRANSCRIPTION_version104.xml.zip"
GROUP_HTML = DISCOVERY_RELEASE / "raw/groups/manuscript_Group_GA_01.html"
VARIANTS = ROOT / "content/editorial/variants.json"

BOOKS = {
    "MAT": ("33", "MATT"),
    "MRK": ("34", "MARK"),
    "LUK": ("35", "LUKE"),
    "JHN": ("36", "JOHN"),
    "ROM": ("37", "ROM"),
    "1CO": ("38", "1COR"),
    "2CO": ("39", "2COR"),
    "1TH": ("44", "1THESS"),
    "1TI": ("47", "1TIM"),
    "ACT": ("51", "ACTS"),
    "2PE": ("54", "2PET"),
    "1JN": ("55", "1JOHN"),
    "3JN": ("57", "3JOHN"),
    "JUD": ("58", "JUDE"),
    "REV": ("59", "REV"),
}

READING_CLAIMS = {
    "candidate-01": "The first-hand verse ends after ‘from the evil one’; the doxology is not present in the verse record.",
    "candidate-02": "The main transcription has no text for Matthew 17:21; corrector cb2 supplies the verse.",
    "candidate-03": "The transcription proceeds from Matthew 18:10 to 18:12 without a Matthew 18:11 verse record.",
    "candidate-04": "The first hand has the kingdom-closing woe as Matthew 23:13 and no Matthew 23:14 verse record.",
    "candidate-05": "The first hand ends Mark 1:1 with the nomina sacra for ‘Jesus Christ’; corrector S1 supplies ‘Son of God.’",
    "candidate-06": "The transcription proceeds from Mark 7:15 to 7:17 without a Mark 7:16 verse record.",
    "candidate-07": "The transcription proceeds from Mark 9:43 to 9:45 without a Mark 9:44 verse record.",
    "candidate-08": "The transcription proceeds from Mark 9:45 to 9:47 without a Mark 9:46 verse record.",
    "candidate-09": "The transcription proceeds from Mark 11:25 to 11:27 without a Mark 11:26 verse record.",
    "candidate-10": "The transcription proceeds from Mark 15:27 to 15:29 without a Mark 15:28 verse record.",
    "candidate-11": "The first-hand Gospel of Mark ends after Mark 16:8; verses 9–20 have no verse records.",
    "candidate-12": "The transcription proceeds from Luke 17:35 to 17:37 without a Luke 17:36 verse record.",
    "candidate-13": "The first hand includes Luke 22:43–44; corrector ca marks the passage for deletion and corrector cb2 restores it.",
    "candidate-14": "The first hand includes the release-at-the-feast sentence as Luke 23:17.",
    "candidate-15": "The first hand reads the nomina sacra corresponding to ‘only-begotten God’ (μονογενὴς θεός).",
    "candidate-16": "The first-hand text of John 5:3 ends with ‘withered,’ then proceeds to 5:5; the waiting clause and John 5:4 are absent.",
    "candidate-17": "The transcription proceeds from John 7:52 to 8:12 without records for John 7:53–8:11.",
    "candidate-18": "The transcription proceeds from Acts 8:36 to 8:38 without an Acts 8:37 verse record.",
    "candidate-19": "The transcription proceeds from Acts 15:33 to 15:35 without an Acts 15:34 verse record.",
    "candidate-20": "The first hand ends Acts 24:6 after the arrest of Paul, has no 24:7 record, and resumes the shorter wording in 24:8.",
    "candidate-21": "The transcription proceeds from Acts 28:28 to 28:30 without an Acts 28:29 verse record.",
    "candidate-22": "The first hand reads ἔχωμεν (‘let us have’); corrector S1 changes it to ἔχομεν (‘we have’).",
    "candidate-23": "The transcription proceeds from Romans 16:23 to 16:25 without a Romans 16:24 verse record.",
    "candidate-24": "The first hand places the doxology in Romans 16:25–27 at the end of Romans.",
    "candidate-25": "The first hand reads καυχήσωμαι (‘that I may boast’), not the ‘burned’ reading.",
    "candidate-26": "The first hand reads ος (‘who’); corrector e changes it to θεός (‘God’).",
    "candidate-27": "The first hand names the Spirit, water, and blood and has no heavenly-witness expansion.",
    "candidate-28": "The first hand reads ξύλου τῆς ζωῆς (‘tree of life’), not ‘book of life.’",
    "candidate-29": "The Codex Sinaiticus Project transcription assigns the greetings to 13:12 and the final blessing to 13:13; it has no 13:14 record.",
    "candidate-30": "The Codex Sinaiticus Project transcription divides the closing sentences between 3 John 14 and 15.",
    "candidate-31": "The first hand reads ‘in Isaiah the prophet,’ not ‘in the prophets.’",
    "candidate-32": "The first hand reads ‘the church of God,’ not ‘the church of the Lord and God.’",
    "candidate-33": "The first hand ends Romans 8:1 after ‘Christ Jesus’; corrector ca adds the longer walking clause.",
    "candidate-34": "The first hand uses the nomen sacrum for κύριος (‘Lord’), not the explicit name ‘Jesus.’",
    "candidate-35": "The first hand reads εὑρεθήσεται (‘will be found’) of the earth and its works, not ‘will be burned up.’",
    "candidate-36": "The first hand lacks εἰκῇ (‘without cause’); corrector cb2 supplies it.",
    "candidate-37": "The first hand lacks ‘our Father in heaven’ but includes the ‘your will be done’ petition; corrector ca supplies a form of ‘deliver us from evil.’",
    "candidate-38": "The first hand includes ‘Father, forgive them’; corrector ca marks the saying for deletion and corrector cb2 restores it.",
    "candidate-39": "The first hand reads νήπιοι (‘infants/little children’); a correction changes it to ἤπιοι (‘gentle’).",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def start_marker(element: ET.Element, prefix: str) -> dict[str, str] | None:
    marker_id = element.attrib.get("id", "")
    if not marker_id.startswith(prefix):
        return None
    return {
        "id": marker_id,
        "n": element.attrib.get("n", ""),
        **({"archive": element.attrib["archive"]} if "archive" in element.attrib else {}),
        **({"localFolio": element.attrib["localfol"]} if "localfol" in element.attrib else {}),
    }


def element_text(element: ET.Element) -> str:
    return "".join(element.itertext()).strip()


def transcription_tokens(element: ET.Element) -> list[str]:
    """Return the main transcription, excluding alternate correction readings."""
    if element.tag == "app":
        readings = [child for child in element if child.tag == "rdg"]
        selected = next((item for item in readings if item.attrib.get("type") == "main-corr"), None)
        selected = selected or (readings[0] if readings else None)
        return transcription_tokens(selected) if selected is not None else []
    if element.tag == "w":
        return [element_text(element)] if element_text(element) else []
    tokens: list[str] = []
    for child in element:
        tokens.extend(transcription_tokens(child))
    return tokens


def corrections(element: ET.Element) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    for apparatus in element.iter("app"):
        readings = []
        for reading in apparatus.findall("rdg"):
            readings.append({
                "type": reading.attrib.get("type", ""),
                "hand": reading.attrib.get("n", ""),
                "text": " ".join(transcription_tokens(reading)) or element_text(reading),
            })
        if readings:
            records.append({"readings": readings})
    return records


def parse_osis(osis: str) -> tuple[str, int, int]:
    book, chapter, verse = osis.split(".")
    return book, int(chapter), int(verse)


def transcription_id(osis: str) -> str:
    book, chapter, verse = parse_osis(osis)
    number, suffix = BOOKS[book]
    return f"V-B{number}K{chapter}V{verse}-{number}-{suffix}"


def expand_range(start: str, end: str) -> list[str]:
    start_book, start_chapter, start_verse = parse_osis(start)
    end_book, end_chapter, end_verse = parse_osis(end)
    if start_book != end_book:
        raise ValueError(f"Cross-book range is unsupported: {start}–{end}")
    if start_chapter == end_chapter:
        return [f"{start_book}.{start_chapter}.{verse}" for verse in range(start_verse, end_verse + 1)]
    # The only cross-chapter comparison is John 7:53–8:11. Those verses are
    # absent from Sinaiticus, so retain the canonical labels without assuming
    # a chapter length from the manuscript.
    if (start, end) == ("JHN.7.53", "JHN.8.11"):
        return ["JHN.7.53"] + [f"JHN.8.{verse}" for verse in range(1, 12)]
    raise ValueError(f"Unsupported cross-chapter range: {start}–{end}")


def context_anchors(targets: list[str]) -> list[str]:
    if targets[0] == "JHN.7.53":
        return ["JHN.7.52", "JHN.8.12"]
    first_book, first_chapter, first_verse = parse_osis(targets[0])
    last_book, last_chapter, last_verse = parse_osis(targets[-1])
    anchors = []
    if first_verse > 1:
        anchors.append(f"{first_book}.{first_chapter}.{first_verse - 1}")
    anchors.append(f"{last_book}.{last_chapter}.{last_verse + 1}")
    return anchors


def load_image_map() -> dict[str, dict[str, object]]:
    html = GROUP_HTML.read_text()
    pattern = re.compile(r'<a href="#" imageId="(\d+)" imageName="([^"]+)" manuscript="GA_01">')
    return {
        name: {
            "sourceImageId": int(image_id),
            "sourceImageName": name,
            "sourceDetailsUrl": f"https://manuscripts.csntm.org/manuscript/ImageDetails?imageId={image_id}",
        }
        for image_id, name in pattern.findall(html)
    }


def image_name(local_folio: str) -> str:
    match = re.fullmatch(r"(\d+)([abrv]?)", local_folio)
    if not match:
        raise ValueError(f"Unexpected Sinaiticus local folio: {local_folio}")
    leaf = int(match.group(1)) - 199
    side = {"": "a", "a": "a", "r": "a", "b": "b", "v": "b"}[match.group(2)]
    return f"GA_01_NT_{leaf:04d}{side}.jpg"


def load_transcription() -> dict[str, dict[str, object]]:
    current_page = None
    current_column = None
    current_line = None
    verse_start = None
    verses: dict[str, dict[str, object]] = {}
    with zipfile.ZipFile(TRANSCRIPTION_ZIP) as archive:
        xml_name = next(name for name in archive.namelist() if name.endswith(".xml"))
        with archive.open(xml_name) as stream:
            for event, element in ET.iterparse(stream, events=("start", "end")):
                if event == "start":
                    page = start_marker(element, "S-") if element.tag == "pb" else None
                    column = start_marker(element, "S-") if element.tag == "cb" else None
                    line = start_marker(element, "S-") if element.tag == "lb" else None
                    if page:
                        current_page = page
                    if column:
                        current_column = column
                    if line:
                        current_line = line
                    if element.tag == "ab" and element.attrib.get("id", "").startswith("V-B"):
                        verse_start = {
                            "page": dict(current_page) if current_page else None,
                            "column": dict(current_column) if current_column else None,
                            "line": dict(current_line) if current_line else None,
                        }
                elif element.tag == "ab" and element.attrib.get("id", "").startswith("V-B"):
                    verses[element.attrib["id"]] = {
                        "transcriptionId": element.attrib["id"],
                        "start": verse_start,
                        "mainTranscription": " ".join(transcription_tokens(element)),
                        "corrections": corrections(element),
                    }
                    element.clear()
    return verses


def main() -> None:
    variants = json.loads(VARIANTS.read_text())
    transcript = load_transcription()
    image_map = load_image_map()
    units = []
    for unit in variants:
        targets = []
        for range_record in unit["ranges"]:
            targets.extend(expand_range(range_record["start"], range_record["end"]))
        target_records = []
        for osis in targets:
            record = transcript.get(transcription_id(osis))
            status = "absent"
            if record:
                status = "correction-only" if not record["mainTranscription"] and record["corrections"] else "present"
            target_records.append({"osis": osis, "status": status, **(record or {})})

        present_targets = [record for record in target_records if record["status"] != "absent"]
        context_records = []
        if any(record["status"] != "present" for record in target_records):
            for osis in context_anchors(targets):
                record = transcript.get(transcription_id(osis))
                if record:
                    context_records.append({"osis": osis, **record})

        page_records = {}
        for record in present_targets + context_records:
            page = record["start"]["page"]
            if not page or "localFolio" not in page:
                continue
            name = image_name(page["localFolio"])
            if name not in image_map:
                raise ValueError(f"No cached CSNTM image record for {name}")
            page_records[name] = {
                **image_map[name],
                "sinaiticusPageId": page["id"],
                "localFolio": page["localFolio"],
            }
        units.append({
            "unitId": unit["id"],
            "title": unit["title"],
            "ranges": unit["ranges"],
            "targetVerses": target_records,
            "contextVerses": context_records,
            "pages": list(page_records.values()),
            "proposedCaptionClaim": READING_CLAIMS[unit["id"]],
            "demonstrates": "The facsimile page and official transcription permit inspection of this witness's reading and recorded corrections in their page context.",
            "doesNotEstablish": "This single witness does not by itself establish the autograph reading, the reading of any other manuscript, or the relative weight of the alternatives.",
            "readingReviewStatus": "primary-transcription-verified-candidate",
            "plateDecision": "proposed",
        })

    OUTPUT.mkdir(parents=True, exist_ok=True)
    evidence = {
        "schemaVersion": 1,
        "releaseId": "csntm-sinaiticus-2026-09-12-v2",
        "status": "transcription-mapping-candidate",
        "manuscript": {
            "gregoryAland": "01",
            "name": "Codex Sinaiticus",
            "date": "fourth century",
            "material": "parchment",
            "holdingInstitution": "British Library",
            "shelfmark": "Add MS 43725",
        },
        "sourceBoundary": "The official transcription verifies page locators and recorded readings. CSNTM supplies the corresponding facsimile image records. Neither source by itself establishes textual weight, autograph wording, or another witness's reading.",
        "units": units,
    }
    evidence_path = OUTPUT / "sinaiticus-evidence.json"
    evidence_path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
    manifest_core = {
        "schemaVersion": 1,
        "releaseId": evidence["releaseId"],
        "status": "candidate",
        "inputs": {
            str(TRANSCRIPTION_ZIP.relative_to(ROOT)): sha256(TRANSCRIPTION_ZIP),
            str(GROUP_HTML.relative_to(ROOT)): sha256(GROUP_HTML),
            str(VARIANTS.relative_to(ROOT)): sha256(VARIANTS),
            "sources/visuals/csntm-2026-09-12-v1/MANIFEST.json": sha256(SOURCE_RELEASE / "MANIFEST.json"),
            "sources/visuals/csntm-2026-09-12-v1/APPROVAL.json": sha256(SOURCE_RELEASE / "APPROVAL.json"),
            "sources/visuals/csntm-discovery-2026-09-12-v1-candidate/PAGE-MANIFEST.json": sha256(DISCOVERY_RELEASE / "PAGE-MANIFEST.json"),
        },
        "outputs": {"sinaiticus-evidence.json": sha256(evidence_path)},
    }
    manifest = {**manifest_core, "candidateSha256": hashlib.sha256(json.dumps(manifest_core, separators=(",", ":"), sort_keys=True).encode()).hexdigest()}
    (OUTPUT / "MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n")
    present = sum(sum(record["status"] != "absent" for record in unit["targetVerses"]) for unit in units)
    absent = sum(sum(record["status"] == "absent" for record in unit["targetVerses"]) for unit in units)
    pages = {page["sourceImageId"] for unit in units for page in unit["pages"]}
    print(f"Mapped {present} present and {absent} absent target verse labels to {len(pages)} unique CSNTM image records.")
    print(f"Candidate SHA-256: {manifest['candidateSha256']}")


if __name__ == "__main__":
    main()
