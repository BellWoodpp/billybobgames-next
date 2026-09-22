/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

function escapeCsvValue(input) {
  const value = input == null ? "" : String(input);

  if (/["\n,\r]/.test(value) || /^\s|\s$/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }

  return value;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === "\"") {
        if (text[index + 1] === "\"") {
          value += "\"";
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        value += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(value);
      value = "";
      continue;
    }

    if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    if (char === "\r") {
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function readCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const text = fs.readFileSync(filePath, "utf8");
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return [];
  }

  const [headers, ...records] = rows;

  return records
    .filter((record) => record.some((value) => value && value.length > 0))
    .map((record) => {
      const mapped = {};

      for (let index = 0; index < headers.length; index += 1) {
        mapped[headers[index]] = record[index] ?? "";
      }

      return mapped;
    });
}

function writeCsv(filePath, rows, headers) {
  const resolvedHeaders =
    headers && headers.length > 0
      ? headers
      : Array.from(
          rows.reduce((set, row) => {
            Object.keys(row).forEach((key) => set.add(key));
            return set;
          }, new Set()),
        );

  const lines = [resolvedHeaders.map(escapeCsvValue).join(",")];

  for (const row of rows) {
    lines.push(resolvedHeaders.map((header) => escapeCsvValue(row[header] ?? "")).join(","));
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

module.exports = {
  readCsv,
  writeCsv,
};
