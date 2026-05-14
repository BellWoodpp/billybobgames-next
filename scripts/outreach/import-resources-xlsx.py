#!/usr/bin/env python3
from __future__ import annotations

import csv
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse, urlencode, parse_qsl, urlunparse
from xml.etree import ElementTree as ET
from zipfile import ZipFile


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data" / "outreach"
DEFAULT_SOURCE = Path(
    os.environ.get(
        "OUTREACH_RESOURCE_XLSX",
        "/home/ubuntu/文档/backlinks-resources-2026-03-01(1).xlsx",
    )
)
DEFAULT_OUTPUT = DATA_DIR / "raw-resources.csv"
NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def column_index(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref or "")
    if not match:
        return 0

    value = 0
    for char in match.group(1):
        value = value * 26 + (ord(char) - 64)
    return value - 1


def normalize_url(raw_url: str) -> str:
    raw_url = (raw_url or "").strip()
    if not raw_url:
        return ""

    parsed = urlparse(raw_url)
    if not parsed.scheme or not parsed.netloc:
        return raw_url

    query = urlencode(sorted(parse_qsl(parsed.query, keep_blank_values=True)))
    path = re.sub(r"/{2,}", "/", parsed.path or "/")
    if len(path) > 1:
        path = path.rstrip("/")

    return urlunparse(
        (
            parsed.scheme,
            parsed.netloc.lower(),
            path,
            parsed.params,
            query,
            "",
        )
    )


def extract_domain(raw_url: str) -> str:
    try:
        hostname = urlparse(raw_url).hostname or ""
    except ValueError:
        return ""
    return hostname.lower().removeprefix("www.")


def load_shared_strings(archive: ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []

    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    strings: list[str] = []
    for entry in root.findall("a:si", NS):
        fragments = [node.text or "" for node in entry.findall(".//a:t", NS)]
        strings.append("".join(fragments))
    return strings


def sheet_rows(archive: ZipFile, shared_strings: list[str]) -> list[list[str]]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    relation_map = {
        relation.attrib["Id"]: relation.attrib["Target"] for relation in relationships
    }

    first_sheet = workbook.find("a:sheets/a:sheet", NS)
    if first_sheet is None:
        return []

    relation_id = first_sheet.attrib[
        "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
    ]
    target = relation_map[relation_id]
    sheet_path = target if target.startswith("xl/") else f"xl/{target.lstrip('/')}"
    sheet_root = ET.fromstring(archive.read(sheet_path))

    rows: list[list[str]] = []
    for row in sheet_root.findall("a:sheetData/a:row", NS):
        cells: list[str] = []
        for cell in row.findall("a:c", NS):
            index = column_index(cell.attrib.get("r", ""))
            while len(cells) <= index:
                cells.append("")

            value_node = cell.find("a:v", NS)
            value = "" if value_node is None or value_node.text is None else value_node.text
            cell_type = cell.attrib.get("t")

            if cell_type == "s" and value:
                value = shared_strings[int(value)]
            elif cell_type == "inlineStr":
                value = "".join(node.text or "" for node in cell.findall(".//a:t", NS))

            cells[index] = value.strip()

        rows.append(cells)

    return rows


def main() -> int:
    source_path = DEFAULT_SOURCE
    if len(sys.argv) > 1 and sys.argv[1].strip():
        source_path = Path(sys.argv[1]).expanduser()

    if not source_path.exists():
        print(f"Workbook not found: {source_path}", file=sys.stderr)
        return 1

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with ZipFile(source_path) as archive:
        shared_strings = load_shared_strings(archive)
        rows = sheet_rows(archive, shared_strings)

    if not rows:
        print(f"No rows found in workbook: {source_path}", file=sys.stderr)
        return 1

    headers = [header.strip() for header in rows[0]]
    derived_headers = ["Domain", "Normalized URL", "Source File", "Imported At"]
    imported_at = datetime.now(timezone.utc).isoformat()
    output_rows = []

    for row in rows[1:]:
        record = {headers[index]: (row[index] if index < len(row) else "") for index in range(len(headers))}
        if not any(record.values()):
            continue

        source_url = record.get("URL", "")
        normalized_url = normalize_url(source_url)

        record["Domain"] = extract_domain(source_url)
        record["Normalized URL"] = normalized_url
        record["Source File"] = str(source_path)
        record["Imported At"] = imported_at
        output_rows.append(record)

    with DEFAULT_OUTPUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers + derived_headers)
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"Imported {len(output_rows)} rows -> {DEFAULT_OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
