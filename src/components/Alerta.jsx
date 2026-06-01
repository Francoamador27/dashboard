// src/components/Alerta.jsx
import React from "react";

export default function Alerta({ tipo = "info", children }) {
  const base =
    "px-4 py-3 rounded-lg border text-sm text-center font-medium transition-all duration-200";

  const estilos = {
    exito: "bg-green-600/20 text-green-400 border-green-600/30",
    error: "bg-red-600/20 text-red-400 border-red-600/30",
    info: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  };

  return <div className={`${base} ${estilos[tipo] || estilos.info}`}>{children}</div>;
}
