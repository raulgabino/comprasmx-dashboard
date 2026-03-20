# ComprasMX — Dashboard de Transparencia

Dashboard interactivo para explorar y analizar los contratos gubernamentales de Mexico publicados en [ComprasMX](https://comprasmx.buengobierno.gob.mx/) (antes CompraNet).

**Datos:** 447,498 contratos | $2.3 billones de pesos | 2023-2026

## Secciones

- **Panorama General** — KPIs, tendencia de gasto anual, distribuciones por tipo de procedimiento y contratacion
- **Concentracion** — Analisis de concentracion de proveedores (Pareto, Top 10/50/100)
- **Adjudicaciones vs Licitaciones** — Comparativa entre metodos de contratacion por institucion
- **Buscar Proveedores** — Buscador por nombre o RFC con detalles de contratos individuales

## Calidad de datos

El dashboard incluye un sistema de deteccion de anomalias:
- Registros con monto $0 son excluidos automaticamente
- Outliers confirmados (montos inflados en el portal fuente) son excluidos y documentados
- Contratos con montos atipicos (>10x el percentil 99.9) se senalan para revision

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router, static generation)
- [Recharts](https://recharts.org/) para visualizaciones
- [Tailwind CSS](https://tailwindcss.com/) v4
- Datos pre-agregados en build time (sin base de datos)

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/comprasmx-dashboard.git
cd comprasmx-dashboard

# Instalar dependencias
npm install

# Colocar los datos fuente (ver seccion "Datos")
# Los archivos van en /data/

# Desarrollo local
npm run dev

# Build de produccion
npm run build && npm start
```

## Datos

Los archivos JSON fuente (~226MB) no estan incluidos en el repositorio por su tamano. Para obtenerlos:

1. Descargar los CSVs desde [ComprasMX](https://comprasmx.buengobierno.gob.mx/)
2. Convertirlos a JSON y colocarlos en `/data/`:
   - `datos_contratos_2023.json`
   - `datos_contratos_2024.json`
   - `datos_contratos_2025.json`
   - `datos_contratos.json` (2026)
3. Al ejecutar `npm run dev` o `npm run build`, el script `scripts/aggregate.mjs` genera automaticamente los resumenes en `public/data/`

Los resumenes pre-agregados (~200KB) si estan incluidos en el repositorio, por lo que el dashboard funciona sin los datos fuente para las visualizaciones principales. El buscador de proveedores requiere los datos fuente.

## Estructura del proyecto

```
dashboard/
├── data/                    # Datos fuente JSON (no en repo)
├── public/data/             # Resumenes pre-agregados (en repo)
├── scripts/
│   └── aggregate.mjs        # Script de agregacion y calidad de datos
├── src/
│   ├── app/                 # Paginas (Next.js App Router)
│   │   ├── panorama/
│   │   ├── concentracion/
│   │   ├── adjudicaciones/
│   │   ├── proveedores/
│   │   └── api/             # API routes (contratos, proveedores)
│   ├── components/
│   │   ├── charts/          # Componentes de graficas (Recharts)
│   │   ├── layout/          # Navbar
│   │   └── ui/              # KPICard, ChartCard, DataQualityNotes
│   └── lib/                 # Hooks, tipos, formateadores
```

## Licencia

MIT

## Fuente de datos

Todos los datos provienen de [ComprasMX](https://comprasmx.buengobierno.gob.mx/), la plataforma oficial del Gobierno de Mexico para transparencia en contrataciones publicas. Los datos son de acceso publico.
