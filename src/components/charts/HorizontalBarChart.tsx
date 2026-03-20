"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import { formatMXN } from "@/lib/formatters";

interface HorizontalBarChartProps {
  data: { name: string; value: number }[];
  color?: string;
  valueFormatter?: (v: number) => string;
}

export default function HorizontalBarChart({
  data,
  color,
  valueFormatter = formatMXN,
}: HorizontalBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(280, data.length * 32)}>
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
          formatter={(val) => [valueFormatter(Number(val)), "Monto"]}
          contentStyle={{ backgroundColor: "#1e1e2a", border: "1px solid #2a2a3a", borderRadius: 8, color: "#e8e8f0" }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={color || CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
