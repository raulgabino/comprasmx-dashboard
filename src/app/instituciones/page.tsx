"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useInstitucion, useInstitucionesIndex } from "@/lib/useInstitucion";
import KPICard from "@/components/ui/KPICard";
import ChartCard from "@/components/ui/ChartCard";
import DonutChart from "@/components/charts/DonutChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import TrendLineChart from "@/components/charts/TrendLineChart";
import DataQualityNotes from "@/components/ui/DataQualityNotes";
import { formatMXN, formatNumber, formatPct } from "@/lib/formatters";
import { TIPO_PROC_COLORS } from "@/lib/constants";

function InstitucionSelector() {
  const { instituciones, loading } = useInstitucionesIndex();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("inst") || "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("inst", slug);
    else params.delete("inst");
    router.push(`${pathname}?${params.toString()}`);
  }

  if (loading || !instituciones) {
    return <div className="h-10 bg-gray-900 border border-gray-800 rounded-lg animate-pulse" />;
  }

  const sorted = [...instituciones].sort((a, b) => b.montoTotal - a.montoTotal);

  return (
    <select
      value={current}
      onChange={handleChange}
      className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent w-full md:w-auto"
    >
      <option value="">Selecciona una institución...</option>
      {sorted.map((inst) => (
        <option key={inst.slug} value={inst.slug}>
          {inst.sigla} — {inst.nombre}
        </option>
      ))}
    </select>
  );
}

function InstitucionContent() {
  const { data, loading, slug } = useInstitucion();

  if (!slug) {
    return (
      <div className="text-gray-400 py-20 text-center">
        Elige una institución arriba para ver su panorama de contratos (todos los años combinados, 2023–2026).
      </div>
    );
  }

  if (loading) {
    return <div className="text-gray-400 py-20 text-center">Cargando datos...</div>;
  }

  if (!data) {
    return (
      <div className="text-red-400 py-20 text-center">
        No se encontraron datos para esta institución.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{data.institucion?.sigla}</h2>
        <p className="text-gray-400 text-sm">{data.institucion?.nombre} — 2023–2026 combinado</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Contratos" value={formatNumber(data.totalContratos)} />
        <KPICard label="Monto Total" value={formatMXN(data.montoTotal)} />
        <KPICard label="Proveedores Únicos" value={formatNumber(data.uniqueProveedores)} />
        <KPICard
          label="Adj. Directa"
          value={formatPct(data.pctAdjDirectaMonto)}
          subtitle={`${formatPct(data.pctAdjDirectaCount)} por cantidad`}
        />
      </div>

      {/* Data Quality */}
      <DataQualityNotes notes={data.notes} outliers={data.outliers} registrosExcluidos={data.registrosExcluidos} />

      {/* Tendencia */}
      {data.tendencia && data.tendencia.length > 0 && (
        <ChartCard title="Tendencia de Gasto por Año">
          <TrendLineChart data={data.tendencia} />
        </ChartCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Distribución por Tipo de Procedimiento">
          <DonutChart data={data.tipoProc} colors={TIPO_PROC_COLORS} />
        </ChartCard>
        <ChartCard title="Concentración de Proveedores">
          <div className="space-y-3 py-2">
            <KPICard label="Top 10" value={formatPct(data.concentracion.top10)} subtitle="del monto total" />
            <KPICard label="Top 50" value={formatPct(data.concentracion.top50)} subtitle="del monto total" />
          </div>
        </ChartCard>
      </div>

      {/* Top proveedores */}
      <ChartCard title="Top Proveedores por Monto">
        <HorizontalBarChart
          data={data.topProveedoresMonto.map((d) => ({ name: d.name, value: d.monto }))}
          color="#3b82f6"
        />
      </ChartCard>

      {/* Top adjudicaciones directas */}
      {data.topAdjDirectas.length > 0 && (
        <ChartCard title="Top Adjudicaciones Directas por Monto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2 px-2">#</th>
                  <th className="text-left py-2 px-2">Proveedor</th>
                  <th className="text-left py-2 px-2">RFC</th>
                  <th className="text-right py-2 px-2">Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.topAdjDirectas.map((d, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-2 text-gray-500">{i + 1}</td>
                    <td className="py-2 px-2 text-gray-200 max-w-xs truncate">{d.name}</td>
                    <td className="py-2 px-2 text-gray-400 font-mono text-xs">{d.rfc}</td>
                    <td className="py-2 px-2 text-right text-gray-200">{formatMXN(d.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  );
}

function InstitucionesPageContent() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-white">Instituciones</h1>
        <InstitucionSelector />
      </div>
      <InstitucionContent />
    </div>
  );
}

export default function InstitucionesPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 py-20 text-center">Cargando...</div>}>
      <InstitucionesPageContent />
    </Suspense>
  );
}
