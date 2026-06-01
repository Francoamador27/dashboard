import React, { useState, useMemo, useCallback } from "react";
import ServiciosList from "../components/Servicios/ServiciosList";
import ServiciosCategorias from "../components/Servicios/ServiciosCategorias";
import ServiciosForm from "./ServiciosForm";

// Reemplaza estos por tus componentes reales
const CrearServicio = () => (
  <div className="text-slate-700">
    <ServiciosForm />
  </div>
);
const ListaServicios = () => (
  <div className="text-slate-700">
    <ServiciosList />
  </div>
);
const ListaCategorias = () => (
  <div className="text-slate-700">
    <ServiciosCategorias />
  </div>
);

const ServiciosManager = () => {
  const [active, setActive] = useState(0);

  const tabs = useMemo(
    () => [
      { key: "crear", label: "Crear obra", element: <CrearServicio /> },
      { key: "servicios", label: "Obras", element: <ListaServicios /> },
      { key: "categorias", label: "Categorias", element: <ListaCategorias /> },
    ],
    [],
  );

  const onKeyDown = useCallback(
    (e) => {
      const last = tabs.length - 1;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive((i) => (i >= last ? 0 : i + 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive((i) => (i <= 0 ? last : i - 1));
      }
      if (e.key === "Home") {
        e.preventDefault();
        setActive(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        setActive(last);
      }
    },
    [tabs.length],
  );

  const prev = () => setActive((i) => Math.max(0, i - 1));
  const next = () => setActive((i) => Math.min(tabs.length - 1, i + 1));

  return (
    <div className="mx-auto max-w-[90rem] p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-[#1c1c1c] mb-2 uppercase tracking-wide">
          Gestión de Obras
        </h1>
      </div>

      {/* Tabs header */}
      <div
        role="tablist"
        aria-label="Gestion de Obras"
        onKeyDown={onKeyDown}
        className="flex flex-wrap items-end gap-4 border-b-4 border-[#fdce27]/20 pb-0 bg-white rounded-t-2xl px-6 pt-6 shadow-sm"
      >
        {tabs.map((t, idx) => {
          const selected = idx === active;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.key}`}
              id={`tab-${t.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(idx)}
              className={[
                "rounded-t-xl px-8 py-4 text-sm font-black outline-none transition-all duration-300 transform translate-y-1 relative",
                selected
                  ? "bg-[#1c1c1c] text-[#fdce27] shadow-lg z-10 scale-105 border-b-4 border-[#fdce27]"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#1c1c1c]",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}

        <div className="ml-auto flex gap-3 pb-3">
          <button
            onClick={prev}
            disabled={active === 0}
            className="rounded-xl border-2 border-gray-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100 transition-colors"
            type="button"
          >
            ← Anterior
          </button>
          <button
            onClick={next}
            disabled={active === tabs.length - 1}
            className="rounded-xl bg-[#fdce27] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#1c1c1c] transition-colors hover:bg-[#e5ba23] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            type="button"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Active panel */}
      <div
        role="tabpanel"
        id={`panel-${tabs[active].key}`}
        aria-labelledby={`tab-${tabs[active].key}`}
        className="rounded-b-2xl rounded-tr-2xl bg-white p-6 lg:p-10 shadow-xl border border-gray-100 min-h-[500px]"
      >
        {tabs[active].element}
      </div>
    </div>
  );
};

export default ServiciosManager;
