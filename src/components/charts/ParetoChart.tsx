"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { formatMXN } from "@/lib/formatters";

interface ParetoChartProps {
  data: { name: string; monto: number; acumulado: number }[];
}

export default function ParetoChart({ data }: ParetoChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ left: 10, right: 30, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
        <XAxis
          dataKey="name"
          tick={false}
          label={{ value: "Proveedores (ordenados por monto)", position: "bottom", fill: "#8888a0", fontSize: 12 }}
        />
        <YAxis
          yAxisId="monto"
          orientation="left"
          tickFormatter={(v) => formatMXN(v)}
          tick={{ fontSize: 10, fill: "#8888a0" }}
        />
        <YAxis
          yAxisId="pct"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: "#8888a0" }}
        />
        <Tooltip
          formatter={(val, name) => [
            String(name) === "acumulado" ? `${Number(val).toFixed(1)}%` : formatMXN(Number(val)),
            String(name) === "acumulado" ? "% Acumulado" : "Monto",
          ]}
          contentStyle={{ backgroundColor: "#1e1e2a", border: "1px solid #2a2a3a", borderRadius: 8, color: "#e8e8f0" }}
        />
        <Bar yAxisId="monto" dataKey="monto" fill="#3b82f6" opacity={0.6} />
        <Line
          yAxisId="pct"
          dataKey="acumulado"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
