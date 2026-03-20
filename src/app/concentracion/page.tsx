"use client";

import { Suspense } from "react";
import { useSummary } from "@/lib/useSummary";
import KPICard from "@/components/ui/KPICard";
import ChartCard from "@/components/ui/ChartCard";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import ParetoChart from "@/components/charts/ParetoChart";
import { formatMXN, formatNumber, formatPct } from "@/lib/formatters";
import DataQualityNotes from "@/components/ui/DataQualityNotes";

function ConcentracionContent() {
  const { data, loading } = useSummary();

  if (loading || !data) {
    return <div className="text-gray-400 py-20 text-center">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          label="Top 10 Proveedores"
          value={formatPct(data.concentracion.top10)}
          subtitle="del monto total"
        />
        <KPICard
          label="Top 50 Proveedores"
          value={formatPct(data.concentracion.top50)}
          subtitle="del monto total"
        />
        <KPICard
          label="Top 100 Proveedores"
          value={formatPct(data.concentracion.top100)}
          subtitle="del monto total"
        />
      </div>

      {/* Data Quality */}
      <DataQualityNotes notes={data.notes} outliers={data.outliers} registrosExcluidos={data.registrosExcluidos} />

      {/* Top 20 proveedores por monto */}
      <ChartCard title="Top 20 Proveedores por Monto">
        <HorizontalBarChart
          data={data.topProveedoresMonto.map((d) => ({ name: d.name, value: d.monto }))}
          color="#f59e0b"
        />
      </ChartCard>

      {/* Pareto */}
      <ChartCard title="Curva de Pareto — Concentración del Gasto">
        <ParetoChart data={data.paretoData} />
      </ChartCard>

      {/* Top 20 por cantidad */}
      <ChartCard title="Top 20 Proveedores por Cantidad de Contratos">
        <HorizontalBarChart
          data={data.topProveedoresCount.map((d) => ({ name: d.name, value: d.count }))}
          color="#8b5cf6"
          valueFormatter={(v) => formatNumber(v) + " contratos"}
        />
      </ChartCard>

      {/* Alertas de concentración */}
      {data.concentracion.top10 > 40 && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-5">
          <h3 className="text-red-400 font-medium mb-2">Alta Concentración Detectada</h3>
          <p className="text-gray-300 text-sm">
            Los 10 principales proveedores concentran el {formatPct(data.concentracion.top10)} del
            gasto total ({formatMXN(data.montoTotal)}). Este nivel de concentración puede
            indicar riesgos de competencia limitada.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ConcentracionPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 py-20 text-center">Cargando...</div>}>
      <ConcentracionContent />
    </Suspense>
  );
}
