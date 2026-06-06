import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, X, FileText, Image, Loader2, AlertCircle, Link2, Plus } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

const TIPOS = [
  { value: 'mejora',        label: 'Mejora',         desc: 'Sugerencia para mejorar algo existente' },
  { value: 'requerimiento', label: 'Requerimiento',  desc: 'Solicitud de nueva funcionalidad o contenido' },
  { value: 'consulta',      label: 'Consulta',       desc: 'Pregunta o duda' },
  { value: 'bug',           label: 'Problema',       desc: 'Algo no funciona correctamente' },
  { value: 'otro',          label: 'Otro',           desc: 'Cualquier otro motivo' },
];

const PRIORIDADES = [
  { value: 'baja',    label: 'Baja',    cls: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'media',   label: 'Media',   cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'alta',    label: 'Alta',    cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'urgente', label: 'Urgente', cls: 'bg-red-50 text-red-700 border-red-200' },
];

export default function PortalNuevoTicket() {
  const { cliente } = useAuthStore();
  const accentColor = cliente?.colores?.[0] ?? '#c9a84c';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    titulo: '',
    tipo: 'consulta',
    prioridad: 'media',
    descripcion: '',
  });
  const [archivos, setArchivos] = useState([]);
  const [enlaces, setEnlaces] = useState([]);
  const [error, setError] = useState('');

  const addEnlace = () => setEnlaces(p => [...p, '']);
  const updateEnlace = (i, val) => setEnlaces(p => p.map((e, j) => j === i ? val : e));
  const removeEnlace = (i) => setEnlaces(p => p.filter((_, j) => j !== i));

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('titulo',      form.titulo);
      fd.append('tipo',        form.tipo);
      fd.append('prioridad',   form.prioridad);
      fd.append('descripcion', form.descripcion);
      archivos.forEach(f => fd.append('adjuntos[]', f.file));
      enlaces
        .map(e => { const v = e.trim(); return v && !v.startsWith('http') ? 'https://' + v : v; })
        .filter(Boolean)
        .forEach(e => fd.append('enlaces[]', e));

      return api.post('/portal/tickets', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['portal-tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets-all'] });
      navigate(`/dashboard/portal/tickets/${res.data.id}`);
    },
    onError: (err) => {
      setError(err.response?.data?.message ?? 'Ocurrió un error. Intentá de nuevo.');
    },
  });

  const handleFiles = (files) => {
    const allowed = Array.from(files).filter(f => {
      const ok = f.type.startsWith('image/') || f.type === 'application/pdf';
      return ok && f.size <= 10 * 1024 * 1024; // max 10MB por archivo
    });
    setArchivos(prev => [
      ...prev,
      ...allowed.map(f => ({ file: f, preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null })),
    ]);
  };

  const removeFile = (idx) => {
    setArchivos(prev => {
      if (prev[idx].preview) URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.titulo.trim()) { setError('El título es obligatorio.'); return; }
    mutation.mutate();
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard/portal/tickets" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Nuevo ticket</h1>
          <p className="text-zinc-500 text-sm">Completá el formulario y te respondemos a la brevedad.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Título */}
        <Field label="Título *">
          <input
            type="text"
            value={form.titulo}
            onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
            placeholder="Describí brevemente tu solicitud"
            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': accentColor + '40' }}
          />
        </Field>

        {/* Tipo */}
        <Field label="Tipo de solicitud">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TIPOS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, tipo: t.value }))}
                className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  form.tipo === t.value
                    ? 'border-transparent text-white'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
                style={form.tipo === t.value ? { backgroundColor: accentColor } : {}}
              >
                <div className="font-semibold">{t.label}</div>
                <div className="text-[11px] opacity-70 mt-0.5 leading-tight">{t.desc}</div>
              </button>
            ))}
          </div>
        </Field>

        {/* Prioridad */}
        <Field label="Prioridad">
          <div className="flex gap-2 flex-wrap">
            {PRIORIDADES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, prioridad: p.value }))}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  form.prioridad === p.value
                    ? p.cls + ' ring-2 ring-offset-1'
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                }`}
                style={form.prioridad === p.value ? { '--tw-ring-color': accentColor } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Descripción */}
        <Field label="Descripción">
          <textarea
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            rows={5}
            placeholder="Describí con detalle tu solicitud, qué necesitás, contexto relevante..."
            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 outline-none resize-none focus:ring-2 transition-all"
          />
        </Field>

        {/* Adjuntos */}
        <Field label="Adjuntos">
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center cursor-pointer hover:border-zinc-300 transition-colors"
          >
            <Upload size={22} className="mx-auto text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500">Arrastrá archivos acá o hacé clic para elegir</p>
            <p className="text-xs text-zinc-400 mt-1">Imágenes y PDFs · Máx. 10MB por archivo</p>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {archivos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {archivos.map((a, i) => (
                <div key={i} className="relative bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden">
                  {a.preview ? (
                    <img src={a.preview} className="w-full h-20 object-cover" alt="" />
                  ) : (
                    <div className="flex items-center justify-center h-20">
                      <FileText size={24} className="text-zinc-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  >
                    <X size={11} />
                  </button>
                  <p className="text-[10px] text-zinc-500 truncate px-1.5 pb-1.5">{a.file.name}</p>
                </div>
              ))}
            </div>
          )}
        </Field>

        {/* Links */}
        <Field label="Links">
          <div className="space-y-2">
            {enlaces.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-2 focus-within:ring-2 transition-all" style={{ '--tw-ring-color': accentColor + '40' }}>
                  <Link2 size={13} className="text-zinc-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={url}
                    onChange={e => updateEnlace(i, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-sm text-zinc-900 outline-none bg-transparent"
                  />
                </div>
                <button type="button" onClick={() => removeEnlace(i)} className="text-zinc-400 hover:text-red-500 transition-colors">
                  <X size={15} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addEnlace}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              <Plus size={14} /> Agregar link
            </button>
          </div>
        </Field>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            {mutation.isPending ? 'Enviando…' : 'Enviar ticket'}
          </button>
          <Link to="/dashboard/portal/tickets" className="text-sm text-zinc-500 hover:text-zinc-700">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-700 mb-2 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
