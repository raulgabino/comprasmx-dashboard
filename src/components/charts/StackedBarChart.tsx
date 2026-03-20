"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TIPO_PROC_COLORS } from "@/lib/constants";
import { formatMXN } from "@/lib/formatters";

interface StackedBarChartProps {
  data: {
    name: string;
    adjDirecta: number;
    licitacion: number;
    invitacion: number;
    entreEntes: number;
    otro: number;
  }[];
}

const BARS = [
  { key: "adjDirecta", label: "Adj. Directa", color: TIPO_PROC_COLORS["Adjudicación Directa"] },
  { key: "licitacion", label: "Licitación", color: TIPO_PROC_COLORS["Licitación Pública"] },
  { key: "invitacion", label: "Invitación 3P", color: TIPO_PROC_COLORS["Invitación a 3 Personas"] },
  { key: "entreEntes", label: "Entre Entes", color: TIPO_PROC_COLORS["Entre Entes Públicos"] },
  { key: "otro", label: "Otro", color: TIPO_PROC_COLORS["Otro"] },
];

export default function StackedBarChart({ data }: StackedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(400, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 11, fill: "#b0b0c4" }}
          tickFormatter={(v) => (v.length > 20 ? v.slice(0, 18) + "…" : v)}
        />
        <Tooltip
          formatter={(val, name) => [formatMXN(Number(val)), String(name)]}
          contentStyle={{ backgroundColor: "#1e1e2a", border: "1px solid #2a2a3a", borderRadius: 8, color: "#e8e8f0" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
        {BARS.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.label} stackId="a" fill={b.color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
