import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Link2,
} from "lucide-react";
import {
  useCliente,
  useBrandDna,
  useUpdateBrandDna,
} from "../hooks/useClientes";

const ESTILOS = [
  "Minimalista -",
  "Premium",
  "Moderno",
  "Clásico",
  "Geométrico",
  "Orgánico",
  "Tipográfico",
  "Ilustrativo",
  "Fotográfico",
  "Editorial",
];

const TONOS_COPY = [
  "Formal",
  "Cercano",
  "Inspirador",
  "Directo",
  "Técnico",
  "Emocional",
  "Informativo",
  "Persuasivo",
  "Elegante",
];

const inputCls =
  "w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all";

function Section({ title, description, children }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm dark:shadow-none space-y-4">
      <div className="mb-1">
        <h2 className="text-slate-800 dark:text-white font-semibold text-sm">
          {title}
        </h2>
        {description && (
          <p className="text-slate-400 dark:text-white/30 text-xs mt-0.5">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function TagSelector({ options, value = [], onChange, max = 4 }) {
  const toggle = (opt) => {
    const current = value ?? [];
    if (current.includes(opt)) {
      onChange(current.filter((v) => v !== opt));
    } else if (current.length < max) {
      onChange([...current, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = (value ?? []).includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              active
                ? "bg-[#c9a84c] text-black"
                : "bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]",
            ].join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ColorPalette({ colores = [], onChange }) {
  const add = () => onChange([...colores, "#c9a84c"]);
  const remove = (i) => onChange(colores.filter((_, idx) => idx !== i));
  const update = (i, v) =>
    onChange(colores.map((c, idx) => (idx === i ? v : c)));

  return (
    <div className="flex flex-wrap gap-3">
      {colores.map((color, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2"
        >
          <input
            type="color"
            value={color}
            onChange={(e) => update(i, e.target.value)}
            className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent p-0"
          />
          <span className="text-xs font-mono text-slate-500 dark:text-white/50 w-16">
            {color.toUpperCase()}
          </span>
          {colores.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-slate-300 dark:text-white/20 hover:text-red-400 transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>
      ))}
      {colores.length < 8 && (
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white border border-dashed border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 transition-all"
        >
          <Plus size={11} /> Agregar color
        </button>
      )}
    </div>
  );
}

function ReferenciasList({ referencias = [], onChange }) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (!val) return;
    onChange([...referencias, val]);
    setInput("");
  };

  const remove = (i) => onChange(referencias.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {referencias.map((ref, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-lg px-3 py-2"
        >
          <Link2
            size={12}
            className="text-slate-300 dark:text-white/20 shrink-0"
          />
          <span className="flex-1 text-xs text-slate-600 dark:text-white/60 truncate">
            {ref}
          </span>
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-slate-300 dark:text-white/20 hover:text-red-400 transition-colors shrink-0"
          >
            <X size={11} />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="https://referencia-visual.com"
          className={`${inputCls} flex-1`}
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.10] rounded-lg text-slate-500 dark:text-white/40 transition-all"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function BrandDna() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: cliente } = useCliente(id);
  const { data: dna, isLoading } = useBrandDna(id);
  const mutation = useUpdateBrandDna(id);

  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (dna && !form) {
      setForm({
        prompt_base: dna.prompt_base ?? "",
        colores: dna.colores ?? ["#000000"],
        tipografia: dna.tipografia ?? "",
        tono: dna.tono ?? "",
        estilo_grafico: dna.estilo_grafico ?? [],
        restricciones: dna.restricciones ?? "",
        estilo_copy: dna.estilo_copy ?? [],
        referencias_visuales: dna.referencias_visuales ?? [],
      });
    }
  }, [dna]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    await mutation.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading || !form) {
    return (
      <div className="p-8 flex items-center gap-2 text-slate-400 dark:text-white/30">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Cargando Brand DNA…</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <button
            onClick={() => navigate("/dashboard/clientes")}
            className="flex items-center gap-1.5 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white text-xs mb-3 transition-colors"
          >
            <ArrowLeft size={12} /> Volver a clientes
          </button>
          <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">
            Brand DNA
          </h1>
          <p className="text-slate-400 dark:text-white/40 text-sm mt-1">
            {cliente?.nombre} — Identidad de marca
          </p>
        </div>

        <div className="flex items-center gap-3 mt-1">
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 text-sm"
            >
              <CheckCircle2 size={14} /> Guardado
            </motion.div>
          )}
          {mutation.isError && (
            <div className="flex items-center gap-1.5 text-red-500 text-sm">
              <AlertCircle size={14} /> Error
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg px-4 py-2.5 transition-all"
          >
            {mutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {mutation.isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Prompt base */}
        <Section
          title="Prompt base"
          description="Se inyecta automáticamente al inicio de cada generación para este cliente."
        >
          <textarea
            value={form.prompt_base}
            onChange={(e) => set("prompt_base", e.target.value)}
            rows={4}
            placeholder="Marca premium minimalista negro y dorado, líneas limpias, elegante, moderna, corporativa…"
            className={`${inputCls} resize-none`}
          />
        </Section>

        {/* Paleta visual */}
        <Section
          title="Paleta visual"
          description="Colores corporativos que se incluyen en los prompts."
        >
          <ColorPalette
            colores={form.colores}
            onChange={(v) => set("colores", v)}
          />
        </Section>

        {/* Estilo gráfico */}
        <Section
          title="Estilo gráfico"
          description="Seleccioná hasta 4 estilos que definen la identidad visual."
        >
          <TagSelector
            options={ESTILOS}
            value={form.estilo_grafico}
            onChange={(v) => set("estilo_grafico", v)}
            max={4}
          />
        </Section>

        {/* Restricciones */}
        <Section
          title="Restricciones visuales"
          description="Qué NO usar en las piezas de este cliente."
        >
          <textarea
            value={form.restricciones}
            onChange={(e) => set("restricciones", e.target.value)}
            rows={2}
            placeholder="Ej: Evitar colores brillantes, no usar personas, no usar fondos blancos puros…"
            className={`${inputCls} resize-none`}
          />
        </Section>

        {/* Estilo de copy */}
        <Section
          title="Estilo de copy"
          description="Tono para textos y llamadas a la acción."
        >
          <TagSelector
            options={TONOS_COPY}
            value={
              Array.isArray(form.estilo_copy)
                ? form.estilo_copy
                : [form.estilo_copy].filter(Boolean)
            }
            onChange={(v) => set("estilo_copy", v)}
            max={3}
          />
          <textarea
            value={typeof form.estilo_copy === "string" ? form.estilo_copy : ""}
            onChange={(e) => set("estilo_copy", e.target.value)}
            rows={2}
            placeholder="Descripción adicional del tono de comunicación…"
            className={`${inputCls} resize-none mt-3`}
          />
        </Section>

        {/* Referencias visuales */}
        <Section
          title="Referencias visuales"
          description="URLs de marcas, piezas o inspiraciones para este cliente."
        >
          <ReferenciasList
            referencias={form.referencias_visuales}
            onChange={(v) => set("referencias_visuales", v)}
          />
        </Section>
      </div>
    </div>
  );
}
