"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import { formatMXN } from "@/lib/formatters";

interface DonutChartProps {
  data: { name: string; value: number; count: number }[];
  colors?: Record<string, string>;
  valueType?: "monto" | "count";
}

export default function DonutChart({ data, colors, valueType = "monto" }: DonutChartProps) {
  const chartData = valueType === "count"
    ? data.map((d) => ({ ...d, displayValue: d.count }))
    : data.map((d) => ({ ...d, displayValue: d.value }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="displayValue"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {chartData.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={colors?.[entry.name] || CHART_COLORS[i % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(val, name) => [
            valueType === "monto" ? formatMXN(Number(val)) : Number(val).toLocaleString("es-MX"),
            String(name),
          ]}
          contentStyle={{ backgroundColor: "#1e1e2a", border: "1px solid #2a2a3a", borderRadius: 8, color: "#e8e8f0" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#b0b0c4" }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
