import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Loader2, MessageSquare, Phone, Users, Package, Bell } from 'lucide-react';
import { useNotas, useCrearNota, useEliminarNota } from '../../hooks/useClienteDetalle';

const TIPOS = [
  { id: 'nota',        label: 'Nota',       icon: MessageSquare, color: 'text-slate-400 dark:text-white/40',  bg: 'bg-slate-100 dark:bg-white/[0.06]' },
  { id: 'reunion',     label: 'Reunión',    icon: Users,         color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { id: 'llamada',     label: 'Llamada',    icon: Phone,         color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-500/10' },
  { id: 'entrega',     label: 'Entrega',    icon: Package,       color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { id: 'recordatorio',label: 'Recordatorio',icon: Bell,         color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-500/10' },
];

function TipoIcon({ tipo }) {
  const t = TIPOS.find(x => x.id === tipo) ?? TIPOS[0];
  const Icon = t.icon;
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.bg}`}>
      <Icon size={14} className={t.color} strokeWidth={1.75} />
    </div>
  );
}

function formatFecha(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TabNotas({ clienteId }) {
  const { data: notas, isLoading } = useNotas(clienteId);
  const crear = useCrearNota(clienteId);
  const eliminar = useEliminarNota(clienteId);

  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState('nota');
  const [filtro, setFiltro] = useState('todos');

  const filtered = (notas ?? []).filter(n => filtro === 'todos' || n.tipo === filtro);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    await crear.mutateAsync({ contenido: texto, tipo });
    setTexto('');
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Composer */}
      <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-4 shadow-sm dark:shadow-none">
        <div className="flex gap-2 mb-3 flex-wrap">
          {TIPOS.map(t => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                tipo === t.id
                  ? 'bg-[#c9a84c] text-black'
                  : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]',
              ].join(' ')}
            >
              <t.icon size={11} /> {t.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder="Escribí una nota, detallá una reunión, registrá una llamada… (Enter para enviar)"
            rows={2}
            className="flex-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all resize-none"
          />
          <button
            type="submit" disabled={!texto.trim() || crear.isPending}
            className="self-end flex items-center justify-center w-10 h-10 rounded-xl bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-40 text-black transition-all shrink-0"
          >
            {crear.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filtro === 'todos' ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'}`}
        >
          Todos
        </button>
        {TIPOS.map(t => (
          <button
            key={t.id}
            onClick={() => setFiltro(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filtro === t.id ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'}`}
          >
            <t.icon size={11} /> {t.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 py-6">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-sm">Cargando notas…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-10 text-center">
          <p className="text-slate-300 dark:text-white/20 text-sm">Sin notas todavía.</p>
        </div>
      ) : (
        <div className="relative space-y-3">
          {/* Línea del tiempo */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100 dark:bg-white/[0.04]" />

          <AnimatePresence initial={false}>
            {filtered.map((nota) => (
              <motion.div
                key={nota.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-4 group"
              >
                <div className="relative z-10 mt-1">
                  <TipoIcon tipo={nota.tipo} />
                </div>
                <div className="flex-1 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-4 shadow-sm dark:shadow-none">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-slate-700 dark:text-white/80 text-sm leading-relaxed whitespace-pre-wrap flex-1">
                      {nota.contenido}
                    </p>
                    <button
                      onClick={() => eliminar.mutate(nota.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 dark:text-white/20 hover:text-red-400 transition-all shrink-0 mt-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-slate-300 dark:text-white/20 text-xs mt-2">{formatFecha(nota.created_at)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
