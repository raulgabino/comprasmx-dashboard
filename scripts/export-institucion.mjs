#!/usr/bin/env node
// Exporta contratos crudos (nivel registro, no agregados) filtrados por
// institución, para análisis externo (Excel, Python, etc).
//
// Uso:
//   node scripts/export-institucion.mjs SICT CAPUFE AICM
//   node scripts/export-institucion.mjs --all         (usa la lista objetivo de aggregate.mjs)
//   node scripts/export-institucion.mjs --list         (lista siglas disponibles en los datos)
//
// Requiere los JSON fuente en /data (ver README). Escribe en /exports:
//   exports/<slug>.json  — arreglo de contratos (los 13 campos de ContractRecord)
//   exports/<slug>.csv   — mismo contenido en CSV (UTF-8, separador coma)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const OUT_DIR = join(process.cwd(), "exports");

const FILES = {
  2023: "datos_contratos_2023.json",
  2024: "datos_contratos_2024.json",
  2025: "datos_contratos_2025.json",
  2026: "datos_contratos.json",
};

// Misma lista que scripts/aggregate.mjs — mantener sincronizada si se edita una u otra.
const INSTITUCIONES_OBJETIVO = [
  "SICT", "IMT", "CAPUFE", "ASA", "AICM", "AIFA", "STC", "TRENMAYA", "FONATUR TREN MAYA", "ATTRAPI",
];

const KNOWN_OUTLIERS = [
  { rfc: "TLU080610C81", monto: 639800000000 },
  { rfc: "ACP200603LRA", monto: 33500000000 },
];

function isKnownOutlier(r) {
  return KNOWN_OUTLIERS.some((o) => o.rfc === r.rfc && o.monto === r.monto);
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function loadAll() {
  const all = [];
  for (const [year, file] of Object.entries(FILES)) {
    const path = join(DATA_DIR, file);
    if (!existsSync(path)) {
      console.error(`✗ No se encontró ${file} en /data. Ver README para obtener los datos fuente.`);
      process.exit(1);
    }
    const records = JSON.parse(readFileSync(path, "utf-8"));
    for (const r of records) all.push(r);
  }
  return all;
}

function toCSV(records) {
  if (records.length === 0) return "";
  const headers = Object.keys(records[0]);
  const escape = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const r of records) {
    lines.push(headers.map((h) => escape(r[h])).join(","));
  }
  return lines.join("\n");
}

function exportInstitucion(sigla, allRecords) {
  const matches = allRecords.filter((r) => r.inst === sigla && !isKnownOutlier(r));
  if (matches.length === 0) {
    console.log(`⚠ ${sigla}: sin contratos en los datos fuente, se omite`);
    return;
  }
  matches.sort((a, b) => b.monto - a.monto);
  const montoTotal = matches.reduce((s, r) => s + r.monto, 0);
  const slug = slugify(sigla);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, `${slug}.json`), JSON.stringify(matches, null, 2));
  writeFileSync(join(OUT_DIR, `${slug}.csv`), toCSV(matches));
  console.log(
    `→ exports/${slug}.{json,csv} — ${sigla}: ${matches.length.toLocaleString("es-MX")} contratos, $${(montoTotal / 1e9).toFixed(2)}mmdp`
  );
}

const args = process.argv.slice(2);

if (args.includes("--list")) {
  const all = loadAll();
  const siglas = [...new Set(all.map((r) => r.inst))].filter(Boolean).sort();
  console.log(`${siglas.length} siglas disponibles en los datos:\n`);
  console.log(siglas.join("\n"));
  process.exit(0);
}

const targets = args.includes("--all") || args.length === 0 ? INSTITUCIONES_OBJETIVO : args;

if (args.length === 0) {
  console.log("Sin argumentos: exportando la lista objetivo por defecto (movilidad/transporte).");
  console.log("Usa --list para ver todas las siglas disponibles, o pasa siglas específicas.\n");
}

const allRecords = loadAll();
for (const sigla of targets) {
  exportInstitucion(sigla, allRecords);
}
