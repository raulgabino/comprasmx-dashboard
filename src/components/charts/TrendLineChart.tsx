"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { formatMXN, formatNumber } from "@/lib/formatters";
import type { TrendPoint } from "@/lib/types";

interface TrendLineChartProps {
  data: TrendPoint[];
}

export default function TrendLineChart({ data }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ left: 10, right: 30, top: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#8888a0" }}
          axisLine={{ stroke: "#2a2a3a" }}
        />
        <YAxis
          tickFormatter={(v) => formatMXN(v)}
          tick={{ fontSize: 10, fill: "#8888a0" }}
          axisLine={{ stroke: "#2a2a3a" }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as TrendPoint;
            return (
              <div className="bg-[#1e1e2a] border border-[#2a2a3a] rounded-lg p-3 text-sm shadow-lg">
                <p className="text-gray-200 font-medium mb-1">{d.label}</p>
                <p className="text-accent-light">Monto: {formatMXN(d.monto)}</p>
                <p className="text-gray-400">Contratos: {formatNumber(d.contratos)}</p>
                <p className="text-gray-400">Proveedores: {formatNumber(d.proveedores)}</p>
                {d.year === 2026 && (
                  <p className="text-yellow-500 text-xs mt-1">* Datos parciales</p>
                )}
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="monto"
          stroke="#f59e0b"
          strokeWidth={2.5}
          dot={{ r: 5, fill: "#f59e0b", stroke: "#1e1e2a", strokeWidth: 2 }}
          activeDot={{ r: 7, fill: "#f59e0b" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
