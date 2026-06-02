import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, MoreHorizontal, Dna, Pencil, Trash2,
  X, Save, Loader2, Upload, Images, Building2,
  Globe, Phone, Mail,
} from 'lucide-react';
import {
  useClientes, useCreateCliente, useUpdateCliente,
  useDeleteCliente, useUploadLogo,
} from '../hooks/useClientes';
import { imageUrl } from '../hooks/useGaleria';

const TONOS = ['Elegante', 'Cercano', 'Técnico', 'Juvenil', 'Corporativo', 'Minimalista', 'Dinámico'];

const EMPTY_FORM = {
  nombre: '', rubro: '', descripcion: '',
  prompt_base: '', colores: ['#000000'], tipografia: '', tono: '', notas_internas: '',
};

// ─── Logo avatar ──────────────────────────────────────────────────────────────
function ClienteLogo({ cliente, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm';

  if (cliente.logo_path) {
    return (
      <img
        src={imageUrl('/storage/' + cliente.logo_path)}
        alt={cliente.nombre}
        className={`${sizeClass} rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0`}
      />
    );
  }

  const initials = cliente.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`${sizeClass} rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center font-bold text-[#c9a84c] shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Slide-over form ──────────────────────────────────────────────────────────
function ClienteForm({ cliente, onClose }) {
  const isEdit = !!cliente;
  const [form, setForm] = useState(isEdit ? {
    nombre: cliente.nombre ?? '',
    rubro: cliente.rubro ?? '',
    descripcion: cliente.descripcion ?? '',
    prompt_base: cliente.prompt_base ?? '',
    colores: cliente.colores ?? ['#000000'],
    tipografia: cliente.tipografia ?? '',
    tono: cliente.tono ?? '',
    notas_internas: cliente.notas_internas ?? '',
  } : EMPTY_FORM);

  const logoRef = useRef();
  const create = useCreateCliente();
  const update = useUpdateCliente(cliente?.id);
  const uploadLogo = useUploadLogo(cliente?.id);

  const mutation = isEdit ? update : create;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addColor = () => set('colores', [...(form.colores ?? []), '#ffffff']);
  const removeColor = (i) => set('colores', form.colores.filter((_, idx) => idx !== i));
  const setColor = (i, v) => set('colores', form.colores.map((c, idx) => idx === i ? v : c));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await mutation.mutateAsync(form);
    onClose();
  };

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (file && cliente?.id) uploadLogo.mutate(file);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-y-0 right-0 w-[480px] bg-white dark:bg-[#0f0f0f] border-l border-slate-200 dark:border-white/[0.06] z-50 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/[0.06]">
        <div>
          <h2 className="text-slate-900 dark:text-white font-semibold text-base">
            {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <p className="text-slate-400 dark:text-white/40 text-xs mt-0.5">
            {isEdit ? cliente.nombre : 'Completá los datos del cliente'}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Logo upload (solo en edit) */}
        {isEdit && (
          <div className="flex items-center gap-4">
            <ClienteLogo cliente={cliente} size="lg" />
            <div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                disabled={uploadLogo.isPending}
                className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 transition-all"
              >
                {uploadLogo.isPending ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                {uploadLogo.isPending ? 'Subiendo…' : 'Cambiar logo'}
              </button>
              <p className="text-slate-300 dark:text-white/20 text-xs mt-1">PNG, JPG, SVG — máx. 4 MB</p>
            </div>
          </div>
        )}

        {/* Nombre */}
        <Field label="Nombre *">
          <input
            required value={form.nombre} onChange={(e) => set('nombre', e.target.value)}
            placeholder="Ej: SUOK SERVICE"
            className={inputCls}
          />
        </Field>

        {/* Rubro */}
        <Field label="Rubro">
          <input
            value={form.rubro} onChange={(e) => set('rubro', e.target.value)}
            placeholder="Ej: Estética, Tecnología, Salud…"
            className={inputCls}
          />
        </Field>

        {/* Descripción */}
        <Field label="Descripción">
          <textarea
            value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)}
            rows={2} placeholder="Breve descripción del cliente…"
            className={`${inputCls} resize-none`}
          />
        </Field>

        {/* Prompt base */}
        <Field label="Prompt base de marca" hint="Base de todos los prompts generados">
          <textarea
            value={form.prompt_base} onChange={(e) => set('prompt_base', e.target.value)}
            rows={3}
            placeholder="Ej: Marca premium minimalista negro y dorado, líneas limpias, elegante, moderna, corporativa."
            className={`${inputCls} resize-none`}
          />
        </Field>

        {/* Colores */}
        <Field label="Colores corporativos">
          <div className="flex flex-wrap gap-2">
            {(form.colores ?? []).map((color, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2 py-1.5">
                <input
                  type="color" value={color}
                  onChange={(e) => setColor(i, e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setColor(i, v);
                  }}
                  onBlur={(e) => {
                    if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setColor(i, color);
                  }}
                  className="w-20 text-xs font-mono text-slate-500 dark:text-white/50 bg-transparent border-none outline-none focus:text-slate-700 dark:focus:text-white/80"
                />
                {form.colores.length > 1 && (
                  <button type="button" onClick={() => removeColor(i)} className="text-slate-300 dark:text-white/20 hover:text-red-400 transition-colors">
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}
            {(form.colores?.length ?? 0) < 6 && (
              <button
                type="button" onClick={addColor}
                className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white border border-dashed border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 transition-all"
              >
                <Plus size={11} /> Agregar
              </button>
            )}
          </div>
        </Field>

        {/* Tipografía */}
        <Field label="Tipografía">
          <input
            value={form.tipografia} onChange={(e) => set('tipografia', e.target.value)}
            placeholder="Ej: Montserrat, Playfair Display…"
            className={inputCls}
          />
        </Field>

        {/* Tono */}
        <Field label="Tono comunicacional">
          <div className="flex flex-wrap gap-2">
            {TONOS.map((t) => (
              <button
                key={t} type="button"
                onClick={() => set('tono', t)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  form.tono === t
                    ? 'bg-[#c9a84c] text-black'
                    : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]',
                ].join(' ')}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        {/* Notas internas */}
        <Field label="Notas internas">
          <textarea
            value={form.notas_internas} onChange={(e) => set('notas_internas', e.target.value)}
            rows={2} placeholder="Notas privadas sobre el cliente…"
            className={`${inputCls} resize-none`}
          />
        </Field>
      </form>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.06] flex gap-3">
        <button
          type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg py-2.5 transition-all"
        >
          {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <label className="text-xs font-medium text-slate-500 dark:text-white/50">{label}</label>
        {hint && <span className="text-xs text-slate-300 dark:text-white/20">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Menú de acciones por card ────────────────────────────────────────────────
function ClienteMenu({ cliente, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="p-1.5 rounded-lg text-slate-300 dark:text-white/30 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all"
      >
        <MoreHorizontal size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-[#1a1a1a] border border-slate-100 dark:border-white/[0.08] rounded-xl shadow-xl overflow-hidden"
            >
              {[
                { icon: Dna, label: 'Brand DNA', action: () => { navigate(`/dashboard/clientes/${cliente.id}/brand-dna`); setOpen(false); } },
                { icon: Pencil, label: 'Editar', action: () => { onEdit(); setOpen(false); } },
                { icon: Trash2, label: 'Eliminar', action: () => { onDelete(); setOpen(false); }, danger: true },
              ].map(({ icon: Icon, label, action, danger }) => (
                <button
                  key={label} onClick={action}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.04]'}`}
                >
                  <Icon size={13} strokeWidth={1.75} />
                  {label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Clientes() {
  const { data: clientes, isLoading } = useClientes();
  const deleteCliente = useDeleteCliente();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | cliente

  const filtered = (clientes ?? []).filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.rubro ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (cliente) => {
    if (confirm(`¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`)) {
      deleteCliente.mutate(cliente.id);
    }
  };

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-slate-400 dark:text-white/40 text-sm mt-1">
              {clientes?.length ?? 0} cliente{clientes?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setSlideOver('create')}
            className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-sm font-semibold rounded-lg px-4 py-2.5 transition-all"
          >
            <Plus size={15} />
            Nuevo cliente
          </button>
        </div>

        {/* Buscador */}
        <div className="relative mb-6 max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente…"
            className="w-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all"
          />
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 py-12">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Cargando clientes…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-16 text-center">
            <Building2 size={32} className="mx-auto mb-3 text-slate-200 dark:text-white/10" />
            <p className="text-slate-400 dark:text-white/30 text-sm font-medium">
              {search ? 'No hay resultados' : 'Aún no tenés clientes'}
            </p>
            {!search && (
              <button
                onClick={() => setSlideOver('create')}
                className="mt-3 text-xs text-[#c9a84c] hover:underline"
              >
                Crear el primero →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((cliente, i) => (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 hover:shadow-md dark:hover:bg-white/[0.05] transition-all cursor-pointer"
                onClick={() => navigate(`/dashboard/clientes/${cliente.id}`)}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <ClienteLogo cliente={cliente} />
                  <ClienteMenu
                    cliente={cliente}
                    onEdit={() => setSlideOver(cliente)}
                    onDelete={() => handleDelete(cliente)}
                  />
                </div>

                {/* Info */}
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-0.5">{cliente.nombre}</h3>
                {cliente.rubro && (
                  <p className="text-slate-400 dark:text-white/40 text-xs">{cliente.rubro}</p>
                )}

                {/* Colores */}
                {cliente.colores?.length > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {cliente.colores.slice(0, 5).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-white dark:border-black shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}

                {/* Contacto rápido */}
                <div className="mt-3 space-y-1">
                  {cliente.website && (
                    <a href={cliente.website} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30 hover:text-[#c9a84c] transition-colors truncate">
                      <Globe size={10} /> {cliente.website.replace(/^https?:\/\//,'')}
                    </a>
                  )}
                  {cliente.telefono && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30">
                      <Phone size={10} /> {cliente.telefono}
                    </span>
                  )}
                  {cliente.email_contacto && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30 truncate">
                      <Mail size={10} /> {cliente.email_contacto}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-white/[0.04]">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30">
                    <Images size={11} />
                    {cliente.assets_count ?? 0} assets
                  </span>
                  <span className="text-xs text-[#c9a84c]/70 group-hover:text-[#c9a84c] transition-colors font-medium">
                    Ver detalle →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {slideOver && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setSlideOver(null)}
            />
            <ClienteForm
              cliente={slideOver === 'create' ? null : slideOver}
              onClose={() => setSlideOver(null)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
