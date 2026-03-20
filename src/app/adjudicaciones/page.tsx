"use client";

import { Suspense } from "react";
import { useSummary } from "@/lib/useSummary";
import KPICard from "@/components/ui/KPICard";
import ChartCard from "@/components/ui/ChartCard";
import DonutChart from "@/components/charts/DonutChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import StackedBarChart from "@/components/charts/StackedBarChart";
import { formatMXN, formatNumber, formatPct } from "@/lib/formatters";
import { TIPO_PROC_COLORS } from "@/lib/constants";
import DataQualityNotes from "@/components/ui/DataQualityNotes";

function AdjudicacionesContent() {
  const { data, loading } = useSummary();

  if (loading || !data) {
    return <div className="text-gray-400 py-20 text-center">Cargando datos...</div>;
  }

  const { adjVsLic } = data;
  const totalMonto = adjVsLic.adjDirectaMonto + adjVsLic.licitacionMonto + adjVsLic.invitacionMonto + adjVsLic.entreEntesMonto;

  const donutMontoData = [
    { name: "Adjudicación Directa", value: adjVsLic.adjDirectaMonto, count: adjVsLic.adjDirectaCount },
    { name: "Licitación Pública", value: adjVsLic.licitacionMonto, count: adjVsLic.licitacionCount },
    { name: "Invitación a 3 Personas", value: adjVsLic.invitacionMonto, count: adjVsLic.invitacionCount },
    { name: "Entre Entes Públicos", value: adjVsLic.entreEntesMonto, count: adjVsLic.entreEntesCount },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Adj. Directa (monto)"
          value={formatMXN(adjVsLic.adjDirectaMonto)}
          subtitle={totalMonto > 0 ? formatPct((adjVsLic.adjDirectaMonto / totalMonto) * 100) + " del total" : ""}
        />
        <KPICard
          label="Adj. Directa (cantidad)"
          value={formatNumber(adjVsLic.adjDirectaCount)}
        />
        <KPICard
          label="Licitación (monto)"
          value={formatMXN(adjVsLic.licitacionMonto)}
          subtitle={totalMonto > 0 ? formatPct((adjVsLic.licitacionMonto / totalMonto) * 100) + " del total" : ""}
        />
        <KPICard
          label="Licitación (cantidad)"
          value={formatNumber(adjVsLic.licitacionCount)}
        />
      </div>

      {/* Data Quality */}
      <DataQualityNotes notes={data.notes} outliers={data.outliers} registrosExcluidos={data.registrosExcluidos} />

      {/* Donuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Distribución por Monto">
          <DonutChart data={donutMontoData} colors={TIPO_PROC_COLORS} />
        </ChartCard>
        <ChartCard title="Distribución por Cantidad">
          <DonutChart data={donutMontoData} colors={TIPO_PROC_COLORS} valueType="count" />
        </ChartCard>
      </div>

      {/* Stacked bar */}
      <ChartCard title="Top 15 Instituciones — Tipo de Procedimiento">
        <StackedBarChart data={data.topInstitucionesStacked} />
      </ChartCard>

      {/* Motivos de excepción */}
      <ChartCard title="Motivos de Excepción en Adjudicaciones Directas">
        <HorizontalBarChart
          data={data.excepcionMotivos.map((d) => ({ name: d.name, value: d.value }))}
          color="#ef4444"
        />
      </ChartCard>

      {/* Top adj directas */}
      <ChartCard title="Top 20 Adjudicaciones Directas por Monto">
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
    </div>
  );
}

export default function AdjudicacionesPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 py-20 text-center">Cargando...</div>}>
      <AdjudicacionesContent />
    </Suspense>
  );
}
