"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const SECTIONS = [
  { href: "/panorama", label: "Panorama General" },
  { href: "/concentracion", label: "Concentración" },
  { href: "/adjudicaciones", label: "Adjudicaciones vs Licitaciones" },
  { href: "/proveedores", label: "Buscar Proveedores" },
  { href: "/instituciones", label: "Instituciones" },
];

const YEARS = ["todos", "2023", "2024", "2025", "2026"];

function NavbarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentYear = searchParams.get("anio") || "todos";

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const year = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (year === "todos") params.delete("anio");
    else params.set("anio", year);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/panorama" className="text-lg font-bold text-accent-light">
            ComprasMX
          </Link>
          <div className="hidden md:flex gap-1">
            {SECTIONS.map((s) => (
              <Link
                key={s.href}
                href={`${s.href}?${searchParams.toString()}`}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === s.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
        <select
          value={currentYear}
          onChange={handleYearChange}
          className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y === "todos" ? "Todos los años" : y === "2026" ? "2026 (parcial)" : y}
            </option>
          ))}
        </select>
      </div>
      {/* Mobile nav */}
      <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={`${s.href}?${searchParams.toString()}`}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
              pathname === s.href ? "bg-gray-800 text-white" : "text-gray-400"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<nav className="bg-gray-900 border-b border-gray-800 h-14" />}>
      <NavbarInner />
    </Suspense>
  );
}
