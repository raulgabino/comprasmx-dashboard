"use client";

import { useState } from "react";
import { useProveedorSearch } from "@/lib/useProveedorSearch";
import ProveedorCard from "@/components/ui/ProveedorCard";

export default function ProveedoresPage() {
  const [query, setQuery] = useState("");
  const { results, loading, error } = useProveedorSearch(query);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre de proveedor o RFC..."
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
            autoFocus
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Busca en todos los años (2023-2026). Mínimo 3 caracteres. Resultados agrupados por RFC.
        </p>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-gray-400 text-center py-10">Buscando...</div>
      )}

      {error && (
        <div className="text-red-400 text-center py-10">{error}</div>
      )}

      {!loading && !error && query.length >= 3 && results.length === 0 && (
        <div className="text-gray-500 text-center py-10">
          No se encontraron proveedores para &ldquo;{query}&rdquo;
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {results.length} proveedor{results.length > 1 ? "es" : ""} encontrado{results.length > 1 ? "s" : ""}
          </p>
          {results.map((r) => (
            <ProveedorCard key={r.rfc} data={r} />
          ))}
        </div>
      )}
    </div>
  );
}
