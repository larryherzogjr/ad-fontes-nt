#!/usr/bin/env python3
"""Prepare the unapproved Sinaiticus evidence map for candidates 40–104."""

import json
from pathlib import Path

import prepare_sinaiticus_visual_candidate as base


ROOT = Path(__file__).resolve().parents[1]
SLATE = ROOT / "docs/editorial-review/variant-expansion-2026-09-13/CANDIDATE-SLATE.json"
CLAIMS = ROOT / "docs/editorial-review/variant-expansion-2026-09-13/SINAITICUS-CLAIMS.json"

base.OUTPUT = ROOT / "sources/visuals/csntm-sinaiticus-expansion-2026-09-13-v2-candidate"
base.VARIANTS = ROOT / "artifacts/editorial/variant-expansion-2026-09-13-candidate-v2/NEW-UNITS.json"
base.RELEASE_ID = "csntm-sinaiticus-expansion-2026-09-13-v2"
base.BOOKS.update({
    "GAL": ("40", "GAL"),
    "EPH": ("41", "EPH"),
    "PHP": ("42", "PHIL"),
    "COL": ("43", "COL"),
    "2TH": ("45", "2THESS"),
    "HEB": ("46", "HEB"),
    "2TI": ("48", "2TIM"),
    "TIT": ("49", "TITUS"),
    "PHM": ("50", "PHLM"),
    "JAS": ("52", "JAS"),
    "1PE": ("53", "1PET"),
    "2JN": ("56", "2JOHN"),
})

slate = json.loads(SLATE.read_text())
if len(slate["units"]) != 65:
    raise ValueError("Expected the exact 65-unit expansion slate")
claims = json.loads(CLAIMS.read_text()) if CLAIMS.exists() else {}
base.READING_CLAIMS = {
    unit["id"]: claims.get(unit["id"], "Primary-transcription reading statement pending editorial review.")
    for unit in slate["units"]
}

base.main()
