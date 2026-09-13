#!/usr/bin/env python3
"""Assemble preserved IIIF tiles into one lossless full-page PNG derivative."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("info", type=Path)
    parser.add_argument("tiles", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    info = json.loads(args.info.read_text())
    width, height = int(info["width"]), int(info["height"])
    tile_width = int(info["tile_width"])
    tile_height = int(info["tile_height"])
    page = Image.new("RGB", (width, height))

    for top in range(0, height, tile_height):
        for left in range(0, width, tile_width):
            tile_path = args.tiles / f"x{left}-y{top}.jpg"
            with Image.open(tile_path) as tile:
                expected = (min(tile_width, width - left), min(tile_height, height - top))
                if tile.size != expected:
                    raise ValueError(f"{tile_path}: expected {expected}, found {tile.size}")
                page.paste(tile.convert("RGB"), (left, top))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    page.save(args.output, format="PNG", optimize=True)


if __name__ == "__main__":
    main()
