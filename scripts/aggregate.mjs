import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const OUT_DIR = join(process.cwd(), "public", "data");
mkdirSync(OUT_DIR, { recursive: true });

const FILES = {
  2023: "datos_contratos_2023.json",
  2024: "datos_contratos_2024.json",
  2025: "datos_contratos_2025.json",
  2026: "datos_contratos.json",
};

// Known outliers confirmed as source-data errors
const KNOWN_OUTLIERS = [
  { rfc: "TLU080610C81", monto: 639800000000, nota: "ETN TURISTAR — monto 1,000x inflado en portal ComprasMX. Valor real estimado: ~$639.8 mdp" },
  { rfc: "ACP200603LRA", monto: 33500000000, nota: "ADMIN Y CONTROL DE PROY. INFRAESTRUCTURA — empresa PEQUEÑA con $33.5 mmdp para mantenimiento de oficinas" },
];

function isKnownOutlier(r) {
  return KNOWN_OUTLIERS.some((o) => o.rfc === r.rfc && o.monto === r.monto);
}

function loadYear(year) {
  const path = join(DATA_DIR, FILES[year]);
  console.log(`Leyendo ${FILES[year]}...`);
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  // Filter out $0 records
  const filtered = raw.filter((r) => r.monto > 0);
  const zeroCount = raw.length - filtered.length;
  if (zeroCount > 0) console.log(`  ⚠ ${zeroCount} registros con monto=$0 filtrados`);
  return { records: filtered, rawCount: raw.length, zeroCount };
}

function detectOutliers(records) {
  const montos = records.map((r) => r.monto).sort((a, b) => a - b);
  const p999 = montos[Math.floor(montos.length * 0.999)];
  const threshold = p999 * 10; // 10x the 99.9th percentile
  return records
    .filter((r) => r.monto > threshold)
    .map((r) => {
      const known = KNOWN_OUTLIERS.find((o) => o.rfc === r.rfc && o.monto === r.monto);
      return {
        proveedor: r.proveedor,
        rfc: r.rfc,
        inst: r.inst,
        monto: r.monto,
        titulo: r.titulo?.slice(0, 80),
        estrat: r.estrat,
        tipo: known ? "error_confirmado" : "revisar",
        nota: known?.nota || `Monto ${(r.monto / p999).toFixed(0)}x mayor al percentil 99.9`,
      };
    });
}

function qualityNotes(records, rawCount, zeroCount, year) {
  const notes = [];
  const emptyFecha = records.filter((r) => !r.fechaFirma).length;
  const emptyInst = records.filter((r) => !r.inst).length;
  const pctFecha = ((emptyFecha / records.length) * 100).toFixed(1);

  if (zeroCount > 0) {
    notes.push(`${zeroCount.toLocaleString("es-MX")} registros con monto $0 excluidos del análisis (${((zeroCount / rawCount) * 100).toFixed(1)}% del CSV original).`);
  }
  if (emptyFecha > 0) {
    notes.push(`${pctFecha}% de contratos sin fecha de firma (${emptyFecha.toLocaleString("es-MX")} de ${records.length.toLocaleString("es-MX")}).`);
  }
  if (emptyInst > 0) {
    notes.push(`${emptyInst.toLocaleString("es-MX")} registros sin institución asignada.`);
  }
  if (year === 2026) {
    notes.push("Datos parciales — año en curso. Las cifras pueden cambiar significativamente.");
  }
  return notes;
}

function aggregate(records) {
  const montoTotal = records.reduce((s, r) => s + r.monto, 0);
  const totalContratos = records.length;
  const proveedoresSet = new Set(records.map((r) => r.rfc));
  const institucionesSet = new Set(records.map((r) => r.inst));

  // tipoProc distribution
  const tipoProcMap = {};
  records.forEach((r) => {
    if (!tipoProcMap[r.tipoProc]) tipoProcMap[r.tipoProc] = { value: 0, count: 0 };
    tipoProcMap[r.tipoProc].value += r.monto;
    tipoProcMap[r.tipoProc].count++;
  });
  const tipoProc = Object.entries(tipoProcMap)
    .map(([name, d]) => ({ name, value: d.value, count: d.count }))
    .sort((a, b) => b.value - a.value);

  // tipoContrat distribution
  const tipoContratMap = {};
  records.forEach((r) => {
    const key = r.tipoContrat || "Sin especificar";
    if (!tipoContratMap[key]) tipoContratMap[key] = { value: 0, count: 0 };
    tipoContratMap[key].value += r.monto;
    tipoContratMap[key].count++;
  });
  const tipoContrat = Object.entries(tipoContratMap)
    .map(([name, d]) => ({ name, value: d.value, count: d.count }))
    .sort((a, b) => b.value - a.value);

  // estratificacion distribution
  const estratMap = {};
  records.forEach((r) => {
    const key = r.estrat || "Sin especificar";
    if (!estratMap[key]) estratMap[key] = { value: 0, count: 0 };
    estratMap[key].value += r.monto;
    estratMap[key].count++;
  });
  const estratificacion = Object.entries(estratMap)
    .map(([name, d]) => ({ name, value: d.value, count: d.count }))
    .sort((a, b) => b.value - a.value);

  // Top 10 instituciones by monto
  const instMap = {};
  records.forEach((r) => {
    if (!instMap[r.inst]) instMap[r.inst] = { monto: 0, count: 0 };
    instMap[r.inst].monto += r.monto;
    instMap[r.inst].count++;
  });
  const topInstituciones = Object.entries(instMap)
    .map(([name, d]) => ({ name, monto: d.monto, count: d.count }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 10);

  // Top proveedores by monto
  const provMap = {};
  records.forEach((r) => {
    if (!provMap[r.rfc]) provMap[r.rfc] = { name: r.proveedor, rfc: r.rfc, monto: 0, count: 0 };
    provMap[r.rfc].monto += r.monto;
    provMap[r.rfc].count++;
  });
  const proveedoresSorted = Object.values(provMap).sort((a, b) => b.monto - a.monto);
  const topProveedoresMonto = proveedoresSorted.slice(0, 20);
  const topProveedoresCount = [...Object.values(provMap)]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Pareto data
  let acum = 0;
  const paretoData = proveedoresSorted.slice(0, 200).map((p) => {
    acum += p.monto;
    return { name: p.name, monto: p.monto, acumulado: (acum / montoTotal) * 100 };
  });

  // Concentracion
  const top10Monto = proveedoresSorted.slice(0, 10).reduce((s, p) => s + p.monto, 0);
  const top50Monto = proveedoresSorted.slice(0, 50).reduce((s, p) => s + p.monto, 0);
  const top100Monto = proveedoresSorted.slice(0, 100).reduce((s, p) => s + p.monto, 0);

  // Adj vs Lic
  const adjDirecta = records.filter((r) => r.tipoProc === "Adjudicación Directa");
  const licitacion = records.filter((r) => r.tipoProc === "Licitación Pública");
  const invitacion = records.filter((r) => r.tipoProc === "Invitación a 3 Personas");
  const entreEntes = records.filter((r) => r.tipoProc === "Entre Entes Públicos");

  // Top 15 instituciones stacked by tipo proc
  const instTipoMap = {};
  records.forEach((r) => {
    if (!instTipoMap[r.inst]) instTipoMap[r.inst] = { total: 0, adjDirecta: 0, licitacion: 0, invitacion: 0, entreEntes: 0, otro: 0 };
    instTipoMap[r.inst].total += r.monto;
    if (r.tipoProc === "Adjudicación Directa") instTipoMap[r.inst].adjDirecta += r.monto;
    else if (r.tipoProc === "Licitación Pública") instTipoMap[r.inst].licitacion += r.monto;
    else if (r.tipoProc === "Invitación a 3 Personas") instTipoMap[r.inst].invitacion += r.monto;
    else if (r.tipoProc === "Entre Entes Públicos") instTipoMap[r.inst].entreEntes += r.monto;
    else instTipoMap[r.inst].otro += r.monto;
  });
  const topInstitucionesStacked = Object.entries(instTipoMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15)
    .map(({ total, ...rest }) => rest);

  // Excepcion motivos
  const excMap = {};
  adjDirecta.forEach((r) => {
    const key = r.excepcion || "Sin especificar";
    if (!excMap[key]) excMap[key] = { value: 0, count: 0 };
    excMap[key].value += r.monto;
    excMap[key].count++;
  });
  const excepcionMotivos = Object.entries(excMap)
    .map(([name, d]) => ({ name, value: d.value, count: d.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);

  // Top adjudicaciones directas (contratos individuales)
  const topAdjDirectas = adjDirecta
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 20)
    .map((r) => ({ name: r.proveedor, rfc: r.rfc, monto: r.monto, count: 1 }));

  // Lista de instituciones para filtro
  const instituciones = [...institucionesSet].sort();

  return {
    totalContratos,
    montoTotal,
    uniqueProveedores: proveedoresSet.size,
    uniqueInstituciones: institucionesSet.size,
    pctAdjDirectaMonto: montoTotal > 0 ? (adjDirecta.reduce((s, r) => s + r.monto, 0) / montoTotal) * 100 : 0,
    pctAdjDirectaCount: totalContratos > 0 ? (adjDirecta.length / totalContratos) * 100 : 0,
    tipoProc,
    tipoContrat,
    estratificacion,
    topInstituciones,
    topProveedoresMonto,
    topProveedoresCount,
    paretoData,
    concentracion: {
      top10: montoTotal > 0 ? (top10Monto / montoTotal) * 100 : 0,
      top50: montoTotal > 0 ? (top50Monto / montoTotal) * 100 : 0,
      top100: montoTotal > 0 ? (top100Monto / montoTotal) * 100 : 0,
    },
    adjVsLic: {
      adjDirectaMonto: adjDirecta.reduce((s, r) => s + r.monto, 0),
      adjDirectaCount: adjDirecta.length,
      licitacionMonto: licitacion.reduce((s, r) => s + r.monto, 0),
      licitacionCount: licitacion.length,
      invitacionMonto: invitacion.reduce((s, r) => s + r.monto, 0),
      invitacionCount: invitacion.length,
      entreEntesMonto: entreEntes.reduce((s, r) => s + r.monto, 0),
      entreEntesCount: entreEntes.length,
    },
    topInstitucionesStacked,
    excepcionMotivos,
    topAdjDirectas,
    instituciones,
  };
}

// Process each year — collect summaries first, then add tendencia to all
const allRecords = [];
let totalRaw = 0, totalZeros = 0;
const yearSummaries = {};

for (const year of [2023, 2024, 2025, 2026]) {
  const { records, rawCount, zeroCount } = loadYear(year);
  for (const r of records) allRecords.push(r);
  totalRaw += rawCount;
  totalZeros += zeroCount;

  const cleanRecords = records.filter((r) => !isKnownOutlier(r));
  const outliers = detectOutliers(records);
  const notes = qualityNotes(records, rawCount, zeroCount, year);

  const summary = aggregate(cleanRecords);
  summary.outliers = outliers;
  summary.notes = notes;
  summary.registrosExcluidos = records.length - cleanRecords.length;
  yearSummaries[year] = summary;
}

// Build tendencia data from per-year summaries
const tendencia = [2023, 2024, 2025, 2026].map((year) => ({
  year,
  label: year === 2026 ? "2026*" : String(year),
  monto: yearSummaries[year].montoTotal,
  contratos: yearSummaries[year].totalContratos,
  proveedores: yearSummaries[year].uniqueProveedores,
}));

// Write per-year summaries with tendencia included
for (const year of [2023, 2024, 2025, 2026]) {
  yearSummaries[year].tendencia = tendencia;
  const outPath = join(OUT_DIR, `summary-${year}.json`);
  writeFileSync(outPath, JSON.stringify(yearSummaries[year]));
  const s = yearSummaries[year];
  console.log(`  → summary-${year}.json (${s.totalContratos} contratos, $${(s.montoTotal / 1e9).toFixed(1)}mmdp, ${s.outliers.length} outliers)`);
}

// Process "todos"
const allClean = allRecords.filter((r) => !isKnownOutlier(r));
const allOutliers = detectOutliers(allRecords);
const allNotes = qualityNotes(allRecords, totalRaw, totalZeros, "todos");
const allSummary = aggregate(allClean);
allSummary.outliers = allOutliers;
allSummary.notes = allNotes;
allSummary.registrosExcluidos = allRecords.length - allClean.length;
allSummary.tendencia = tendencia;

writeFileSync(join(OUT_DIR, "summary-todos.json"), JSON.stringify(allSummary));
console.log(`  → summary-todos.json (${allSummary.totalContratos} contratos, $${(allSummary.montoTotal / 1e9).toFixed(1)}mmdp)`);

console.log("\nAgregación completada.");
