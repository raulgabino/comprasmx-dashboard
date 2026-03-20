import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";

interface ContractRecord {
  inst: string;
  ramo: string;
  tipoProc: string;
  tipoContrat: string;
  monto: number;
  proveedor: string;
  rfc: string;
  estrat: string;
  titulo: string;
  fechaFirma: string;
  excepcion: string;
  url: string;
}

interface ProveedorResult {
  proveedor: string;
  rfc: string;
  montoTotal: number;
  totalContratos: number;
  instituciones: string[];
  anios: number[];
  estrat: string;
  contratos: (ContractRecord & { anio: number })[];
}

const FILE_MAP: Record<number, string> = {
  2023: "datos_contratos_2023.json",
  2024: "datos_contratos_2024.json",
  2025: "datos_contratos_2025.json",
  2026: "datos_contratos.json",
};

let allRecords: (ContractRecord & { anio: number })[] | null = null;

function loadAll(): (ContractRecord & { anio: number })[] {
  if (allRecords) return allRecords;
  allRecords = [];
  for (const [year, file] of Object.entries(FILE_MAP)) {
    const path = join(process.cwd(), "data", file);
    const data: ContractRecord[] = JSON.parse(readFileSync(path, "utf-8"));
    for (const r of data) {
      if (r.monto > 0) {
        allRecords.push({ ...r, anio: Number(year) });
      }
    }
  }
  return allRecords;
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();

  if (q.length < 3) {
    return Response.json({ results: [], message: "Ingresa al menos 3 caracteres" });
  }

  const records = loadAll();

  // Find matching records
  const matches = records.filter(
    (r) => r.proveedor.toLowerCase().includes(q) || r.rfc.toLowerCase().includes(q)
  );

  // Group by RFC
  const byRfc = new Map<string, ProveedorResult>();
  for (const r of matches) {
    let entry = byRfc.get(r.rfc);
    if (!entry) {
      entry = {
        proveedor: r.proveedor,
        rfc: r.rfc,
        montoTotal: 0,
        totalContratos: 0,
        instituciones: [],
        anios: [],
        estrat: r.estrat,
        contratos: [],
      };
      byRfc.set(r.rfc, entry);
    }
    entry.montoTotal += r.monto;
    entry.totalContratos++;
    if (!entry.instituciones.includes(r.inst)) entry.instituciones.push(r.inst);
    if (!entry.anios.includes(r.anio)) entry.anios.push(r.anio);
    entry.contratos.push(r);
  }

  // Sort by total amount, limit to top 20
  const results = [...byRfc.values()]
    .sort((a, b) => b.montoTotal - a.montoTotal)
    .slice(0, 20);

  // Sort contracts within each result and limit to top 50
  for (const r of results) {
    r.contratos.sort((a, b) => b.monto - a.monto);
    r.contratos = r.contratos.slice(0, 50);
    r.anios.sort();
  }

  return Response.json({ results });
}
