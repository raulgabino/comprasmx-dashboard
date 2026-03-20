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
  anio: number;
}

const FILE_MAP: Record<string, string> = {
  "2023": "datos_contratos_2023.json",
  "2024": "datos_contratos_2024.json",
  "2025": "datos_contratos_2025.json",
  "2026": "datos_contratos.json",
};

const cache = new Map<string, ContractRecord[]>();

function loadYear(year: string): ContractRecord[] {
  if (cache.has(year)) return cache.get(year)!;
  const file = FILE_MAP[year];
  if (!file) return [];
  const path = join(process.cwd(), "data", file);
  const data = JSON.parse(readFileSync(path, "utf-8"));
  cache.set(year, data);
  return data;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const anio = params.get("anio") || "2026";
  const page = Math.max(1, parseInt(params.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(10, parseInt(params.get("pageSize") || "50")));
  const inst = params.get("inst") || "";
  const tipoProc = params.get("tipoProc") || "";
  const tipoContrat = params.get("tipoContrat") || "";
  const q = (params.get("q") || "").toLowerCase();

  let records = loadYear(anio);

  if (inst) records = records.filter((r) => r.inst === inst);
  if (tipoProc) records = records.filter((r) => r.tipoProc === tipoProc);
  if (tipoContrat) records = records.filter((r) => r.tipoContrat === tipoContrat);
  if (q) {
    records = records.filter(
      (r) =>
        r.proveedor.toLowerCase().includes(q) ||
        r.rfc.toLowerCase().includes(q) ||
        r.titulo.toLowerCase().includes(q)
    );
  }

  // Sort by monto descending
  records = [...records].sort((a, b) => b.monto - a.monto);

  const total = records.length;
  const start = (page - 1) * pageSize;
  const data = records.slice(start, start + pageSize);

  return Response.json({ data, total, page, pageSize });
}
