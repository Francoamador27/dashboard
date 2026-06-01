import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import $ from "../../../../lib/odontogram.plugin.js";
import {
  ODONTOGRAM_MODE_HAPUS,
  ODONTOGRAM_MODE_DEFAULT,
  ODONTOGRAM_MODE_AMF,
  ODONTOGRAM_MODE_COF,
  ODONTOGRAM_MODE_FIS,
  ODONTOGRAM_MODE_NVT,
  ODONTOGRAM_MODE_RCT,
  ODONTOGRAM_MODE_NON,
  ODONTOGRAM_MODE_UNE,
  ODONTOGRAM_MODE_PRE,
  ODONTOGRAM_MODE_ANO,
  ODONTOGRAM_MODE_CARIES,
  ODONTOGRAM_MODE_CFR,
  ODONTOGRAM_MODE_FMC,
  ODONTOGRAM_MODE_POC,
  ODONTOGRAM_MODE_RRX,
  ODONTOGRAM_MODE_MIS,
  ODONTOGRAM_MODE_IPX,
  ODONTOGRAM_MODE_FRM_ACR,
  ODONTOGRAM_MODE_BRIDGE,
  ODONTOGRAM_MODE_ARROW_TOP_LEFT,
  ODONTOGRAM_MODE_ARROW_TOP_RIGHT,
  ODONTOGRAM_MODE_ARROW_TOP_TURN_LEFT,
  ODONTOGRAM_MODE_ARROW_TOP_TURN_RIGHT,
  ODONTOGRAM_MODE_ARROW_BOTTOM_LEFT,
  ODONTOGRAM_MODE_ARROW_BOTTOM_RIGHT,
  ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_LEFT,
  ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_RIGHT,
} from "../../../../lib/odontogram.plugin.js";
import clienteAxios from "../../../../config/axios.js";
import { useParams } from "react-router-dom";
import { mostrarConfirmacion, mostrarError, mostrarExito } from "../../../../utils/Alertas.jsx";

export default function Odontograma() {
  const canvasRef = useRef(null);
  const geometryRef = useRef({});
  const [activeMode, setActiveMode] = useState(ODONTOGRAM_MODE_DEFAULT);
  const [loading, setLoading] = useState(true);

  const { id } = useParams(); // "nuevo" o ID
  const idpa = useMemo(() => id, [id]);

  const setMode = useCallback((mode) => {
    if (!canvasRef.current) return;
    $(canvasRef.current).odontogram("setMode", mode);
    setActiveMode(mode);
  }, []);

  const cargarOdontograma = useCallback(async () => {
    // ⛔ Fix 1: si no hay idpa, apagá loading y salí
    if (!idpa) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await clienteAxios.get(`/api/odontograma/${idpa}`, getAuthHeaders());
      const registros = data?.data?.registros || {};

      if (registros && Object.keys(registros).length > 0) {
        $(canvasRef.current).odontogram("setGeometry", registros);
      } else {
        $(canvasRef.current).odontogram("setGeometryByPos", []);
      }
    } catch (err) {
      console.error("GET odontograma error:", err);
      $(canvasRef.current).odontogram("setGeometryByPos", []);
    } finally {
      setLoading(false);
    }
  }, [idpa]);
  const getAuthHeaders = () => {
    const token = localStorage.getItem("AUTH_TOKEN");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };
  const guardarOdontograma = useCallback(async () => {
    const datos = geometryRef.current;
    if (!datos || Object.keys(datos).length === 0) {
      mostrarError("No haz realizado cambios para guardar.");
      return;
    }
    try {
      if (!idpa) {
        alert("Falta el id del usuario en la URL.");
        return;
      }
      const fecha_modificacion = new Date().toISOString();
      const payload = { datos, fecha_modificacion };


      const { data } = await clienteAxios.post(
        `/api/odontograma/${idpa}`,
        payload,
        getAuthHeaders()
      );

      if (data?.success) {
        mostrarExito("Datos guardados correctamente.");
        // opcional: refrescar
        // await cargarOdontograma();
      } else {

      }
    } catch (err) {
      console.error("POST odontograma error:", err);
      mostrarError("Error al guardar los datos.");
    }
  }, [idpa]);

  const descargarPNG = useCallback(() => {
    const dataUrl = $(canvasRef.current).odontogram("getDataURL");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "odontograma.png";
    a.click();
  }, []);

  useEffect(() => {
    const $canvas = $(canvasRef.current);
    $canvas.odontogram("init", { width: "900px", height: "420px" });

    const onChange = (_, geometry) => {
      geometryRef.current = { ...geometry };
    };
    $canvas.on("change", onChange);

    // ⛔ Fix 2: corré la carga cuando tengamos idpa (o incluso si no hay, para apagar el loading)
    cargarOdontograma();

    return () => {
      $canvas.off("change", onChange);
      $canvas.off();
      $canvas.removeData("odontogram");
    };
  }, [cargarOdontograma]);

  // ---- Toolbar config (igual que antes) ----
  const groups = useMemo(
    () => [
      {
        title: "Edición",
        items: [
          { label: "Borrar", mode: ODONTOGRAM_MODE_HAPUS, variant: "danger" },
          { label: "Default", mode: ODONTOGRAM_MODE_DEFAULT, variant: "ghost" },
        ],
      },
      {
        title: "Restauraciones",
        items: [
          { label: "Rest. existente", mode: ODONTOGRAM_MODE_FIS, variant: "primary" },
          { label: "Rest. requerida", mode: ODONTOGRAM_MODE_AMF, variant: "primary" },
          { label: "Rest. filtrada", mode: ODONTOGRAM_MODE_CARIES, variant: "primary" },
        ],
      },
      {
        title: "Coronas",
        items: [
          { label: "Corona existente", mode: ODONTOGRAM_MODE_POC, variant: "amber" },
          { label: "Corona requerida", mode: ODONTOGRAM_MODE_NVT, variant: "amber" },
        ],
      },
      {
        title: "Extracciones",
        items: [
          { label: "Extracción requerida", mode: ODONTOGRAM_MODE_MIS, variant: "rose" },
          { label: "Extracción existente", mode: ODONTOGRAM_MODE_ANO, variant: "rose" },
        ],
      },
      {
        title: "Endo / Prótesis",
        items: [
          { label: "Conducto", mode: ODONTOGRAM_MODE_RCT, variant: "violet" },
          { label: "Prótesis", mode: ODONTOGRAM_MODE_PRE, variant: "violet" },
          { label: "Puente", mode: ODONTOGRAM_MODE_BRIDGE, variant: "violet" },
          { label: "Prótesis removible", mode: ODONTOGRAM_MODE_FMC, variant: "violet" },
        ],
      },
      {
        title: "Flechas (anotaciones)",
        items: [
          { label: "↑ Izq", mode: ODONTOGRAM_MODE_ARROW_TOP_LEFT, variant: "slate" },
          { label: "↑ Der", mode: ODONTOGRAM_MODE_ARROW_TOP_RIGHT, variant: "slate" },
          { label: "Giro ↑ Izq", mode: ODONTOGRAM_MODE_ARROW_TOP_TURN_LEFT, variant: "slate" },
          { label: "Giro ↑ Der", mode: ODONTOGRAM_MODE_ARROW_TOP_TURN_RIGHT, variant: "slate" },
          { label: "↓ Izq", mode: ODONTOGRAM_MODE_ARROW_BOTTOM_LEFT, variant: "slate" },
          { label: "↓ Der", mode: ODONTOGRAM_MODE_ARROW_BOTTOM_RIGHT, variant: "slate" },
          { label: "Giro ↓ Izq", mode: ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_LEFT, variant: "slate" },
          { label: "Giro ↓ Der", mode: ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_RIGHT, variant: "slate" },
        ],
      },
    ],
    []
  );

  const baseBtn =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[.98]";

  const variants = {
    primary:
      "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 shadow-sm hover:shadow",
    amber:
      "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 shadow-sm hover:shadow",
    rose:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm hover:shadow",
    violet:
      "bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500 shadow-sm hover:shadow",
    slate:
      "bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-500 shadow-sm hover:shadow",
    danger:
      "bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 focus:ring-rose-400",
    ghost:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400",
    activeRing: "ring-2 ring-offset-2 ring-sky-500",
  };

  const groupCard =
    "rounded-2xl border border-slate-200 bg-white p-3 shadow-sm";

  return (
    <section className="w-full max-w-[1000px] mx-auto">
      <h3 className="text-xl font-semibold text-slate-800 mb-3">
        Odontograma del usuario
      </h3>

      {/* Toolbar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title} className={groupCard}>
            <div className="mb-2 text-sm font-semibold text-slate-700">{g.title}</div>
            <div className="grid grid-cols-2 gap-2">
              {g.items.map((it) => {
                const isActive = activeMode === it.mode;
                const cls = `${baseBtn} ${variants[it.variant || "ghost"]} ${isActive ? variants.activeRing : ""
                  }`;
                return (
                  <button
                    key={it.label}
                    type="button"
                    className={cls}
                    onClick={() => setMode(it.mode)}
                    title={it.label}
                  >
                    {it.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`${baseBtn} ${variants.primary}`}
          onClick={guardarOdontograma}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Guardar"}
        </button>
        <button
          type="button"
          className={`${baseBtn} ${variants.ghost}`}
          onClick={descargarPNG}
        >
          Descargar PNG
        </button>
        <span className="text-xs text-slate-500 ml-auto">
          Modo activo: <strong className="text-slate-700">{activeMode}</strong>
        </span>
      </div>

      {/* Canvas */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <canvas
          id="odontogram"
          ref={canvasRef}
          className="w-full max-w-[900px] mx-auto block"
        >
          Tu navegador no soporta Canvas.
        </canvas>
      </div>
    </section>
  );
}
