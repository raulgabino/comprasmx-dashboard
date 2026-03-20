"use client";

import { Suspense } from "react";
import { useSummary } from "@/lib/useSummary";
import KPICard from "@/components/ui/KPICard";
import ChartCard from "@/components/ui/ChartCard";
import DonutChart from "@/components/charts/DonutChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import { formatMXN, formatNumber, formatPct } from "@/lib/formatters";
import { TIPO_PROC_COLORS } from "@/lib/constants";
import DataQualityNotes from "@/components/ui/DataQualityNotes";
import TrendLineChart from "@/components/charts/TrendLineChart";

function PanoramaContent() {
  const { data, loading } = useSummary();

  if (loading || !data) {
    return <div className="text-gray-400 py-20 text-center">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="Total Contratos" value={formatNumber(data.totalContratos)} />
        <KPICard label="Monto Total" value={formatMXN(data.montoTotal)} />
        <KPICard label="Proveedores" value={formatNumber(data.uniqueProveedores)} />
        <KPICard label="Instituciones" value={formatNumber(data.uniqueInstituciones)} />
        <KPICard
          label="Adj. Directa"
          value={formatPct(data.pctAdjDirectaMonto)}
          subtitle={`${formatPct(data.pctAdjDirectaCount)} por cantidad`}
        />
      </div>

      {/* Tendencia temporal */}
      {data.tendencia && (
        <ChartCard title="Tendencia de Gasto Anual">
          <TrendLineChart data={data.tendencia} />
        </ChartCard>
      )}

      {/* Data Quality */}
      <DataQualityNotes notes={data.notes} outliers={data.outliers} registrosExcluidos={data.registrosExcluidos} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Distribución por Tipo de Procedimiento">
          <DonutChart data={data.tipoProc} colors={TIPO_PROC_COLORS} />
        </ChartCard>
        <ChartCard title="Top 10 Instituciones por Monto">
          <HorizontalBarChart
            data={data.topInstituciones.map((d) => ({ name: d.name, value: d.monto }))}
            color="#3b82f6"
          />
        </ChartCard>
        <ChartCard title="Tipo de Contratación">
          <DonutChart data={data.tipoContrat} />
        </ChartCard>
        <ChartCard title="Estratificación de Proveedores">
          <HorizontalBarChart
            data={data.estratificacion.map((d) => ({ name: d.name, value: d.count }))}
            color="#10b981"
            valueFormatter={(v) => formatNumber(v) + " contratos"}
          />
        </ChartCard>
      </div>
    </div>
  );
}

export default function PanoramaPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 py-20 text-center">Cargando...</div>}>
      <PanoramaContent />
    </Suspense>
  );
}
