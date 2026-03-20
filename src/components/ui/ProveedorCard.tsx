"use client";

import { useState } from "react";
import type { ProveedorResult } from "@/lib/useProveedorSearch";
import { formatMXN, formatNumber } from "@/lib/formatters";

export default function ProveedorCard({ data }: { data: ProveedorResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-gray-200 font-medium truncate">{data.proveedor}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {data.rfc} &middot; {data.estrat || "Sin clasificación"} &middot; {data.totalContratos} contrato{data.totalContratos > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Instituciones:</span>
              <span className="text-xs text-gray-400 truncate">
                {data.instituciones.slice(0, 5).join(", ")}
                {data.instituciones.length > 5 && ` +${data.instituciones.length - 5} más`}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-mono text-accent-light">{formatMXN(data.montoTotal)}</p>
            <div className="flex gap-1 mt-1 justify-end">
              {data.anios.map((y) => (
                <span key={y} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                  {y}
                </span>
              ))}
            </div>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 px-5 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs mt-3">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-1.5 px-2">Año</th>
                  <th className="text-left py-1.5 px-2">Institución</th>
                  <th className="text-left py-1.5 px-2">Tipo</th>
                  <th className="text-left py-1.5 px-2 max-w-[250px]">Título</th>
                  <th className="text-right py-1.5 px-2">Monto</th>
                  <th className="text-center py-1.5 px-2">Link</th>
                </tr>
              </thead>
              <tbody>
                {data.contratos.map((c, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-1.5 px-2 text-gray-400">{c.anio}</td>
                    <td className="py-1.5 px-2 text-gray-300">{c.inst}</td>
                    <td className="py-1.5 px-2 text-gray-400">{c.tipoProc}</td>
                    <td className="py-1.5 px-2 text-gray-400 max-w-[250px] truncate" title={c.titulo}>
                      {c.titulo}
                    </td>
                    <td className="py-1.5 px-2 text-right text-gray-200 font-mono">{formatMXN(c.monto)}</td>
                    <td className="py-1.5 px-2 text-center">
                      {c.url && (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">
                          Ver
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totalContratos > 50 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Mostrando los 50 contratos de mayor monto de {formatNumber(data.totalContratos)} totales
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
