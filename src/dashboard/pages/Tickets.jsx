import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Plus, ChevronDown, Filter, Loader2, Send, Paperclip,
  FileText, X, ExternalLink, Clock, CheckCircle2, AlertCircle,
  Circle, MessageSquare, CalendarClock, ArrowUpRight, Trash2,
  TriangleAlert, ThumbsUp, ThumbsDown, Hourglass, Link2,
} from 'lucide-react';
import { useTicketsAll, useCrearComentario, useEliminarComentario } from '../hooks/useTickets';
import { useCrearTicket, useActualizarTicket, useEliminarTicket, useTicketDetalle } from '../hooks/useClienteDetalle';
import { useClientes } from '../hooks/useClientes';
import TicketFormFull from '../components/ticket/TicketFormFull';

// ── Constantes de diseño ──────────────────────────────────────────────────────
const PRIORIDAD = {
  urgente: { label: 'Urgente', border: 'border-l-red-500',   badge: 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' },
  alta:    { label: 'Alta',    border: 'border-l-amber-500', badge: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  media:   { label: 'Media',   border: 'border-l-blue-500',  badge: 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  baja:    { label: 'Baja',    border: 'border-l-slate-300 dark:border-l-white/20', badge: 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/40' },
};

const ESTADO = {
  pendiente:         { label: 'Pendiente',           badge: 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',   icon: Circle },
  en_progreso:       { label: 'En progreso',          badge: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400',           icon: Clock },
  esperando_cliente: { label: 'Esperando cliente',   badge: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400',   icon: AlertCircle },
  resuelto:          { label: 'Resuelto',             badge: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
  cerrado:           { label: 'Cerrado',              badge: 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/30',        icon: CheckCircle2 },
};

const TIPO_OPTS   = ['soporte', 'desarrollo', 'diseño', 'consulta', 'otro'];
const PRIOR_OPTS  = ['baja', 'media', 'alta', 'urgente'];
const ESTADO_OPTS = ['pendiente', 'en_progreso', 'esperando_cliente', 'resuelto', 'cerrado'];

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fechaLimiteInfo(fecha) {
  if (!fecha) return null;
  const hoy  = new Date(); hoy.setHours(0,0,0,0);
  const d    = new Date(fecha); d.setHours(0,0,0,0);
  const diff = Math.round((d - hoy) / 86400000);
  if (diff < 0)  return { label: `Vencido hace ${Math.abs(diff)}d`, cls: 'text-red-600 dark:text-red-400', icon: TriangleAlert };
  if (diff === 0) return { label: 'Vence hoy',                       cls: 'text-red-500 dark:text-red-400', icon: TriangleAlert };
  if (diff <= 3)  return { label: `Vence en ${diff}d`,              cls: 'text-amber-600 dark:text-amber-400', icon: CalendarClock };
  return { label: d.toLocaleDateString('es-AR', { day:'numeric', month:'short' }), cls: 'text-slate-400 dark:text-white/30', icon: CalendarClock };
}

function clienteColor(colores) {
  return Array.isArray(colores) && colores.length ? colores[0] : '#c9a84c';
}

// ── Modal Nuevo Ticket ────────────────────────────────────────────────────────
function ModalNuevoTicket({ clientes, onClose }) {
  const [clienteId, setClienteId] = useState('');
  const crear = useCrearTicket(clienteId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <h2 className="text-slate-900 dark:text-white font-semibold text-base">Nuevo ticket</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Selector de cliente */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-white/40 mb-1">Cliente *</label>
            <select value={clienteId} onChange={e => setClienteId(e.target.value)} className={inputCls}>
              <option value="">Seleccionar cliente…</option>
              {(clientes ?? []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {clienteId ? (
            <TicketFormFull
              onSave={async (data) => {
                await crear.mutateAsync(data);
                onClose();
              }}
              onCancel={onClose}
              loading={crear.isPending}
            />
          ) : (
            <div className="border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-xl py-10 text-center">
              <p className="text-sm text-slate-300 dark:text-white/20">Seleccioná un cliente para continuar</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Badge de aprobación ───────────────────────────────────────────────────────
function AprobacionBadge({ estado }) {
  if (!estado) return null;
  const map = {
    esperando: { label: 'Esperando aprobación', cls: 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400', icon: Hourglass },
    aprobado:  { label: 'Aprobado por cliente',  cls: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400', icon: ThumbsUp },
    rechazado: { label: 'Rechazado por cliente', cls: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400', icon: ThumbsDown },
  };
  const cfg = map[estado];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

// ── Thread de comentarios + caja de respuesta ─────────────────────────────────
function TicketThread({ ticket, clienteId }) {
  const [contenido, setContenido]           = useState('');
  const [esInterno, setEsInterno]           = useState(false);
  const [requiereAprobacion, setRequiereAp] = useState(false);
  const [adjuntos, setAdjuntos]             = useState([]);
  const fileRef = useRef(null);

  const { data: detalle, isLoading } = useTicketDetalle(clienteId, ticket.id);
  const comentar  = useCrearComentario(clienteId, ticket.id);
  const eliminarC = useEliminarComentario(clienteId, ticket.id);

  const handleFiles = (files) => {
    const allowed = Array.from(files).filter(
      f => (f.type.startsWith('image/') || f.type === 'application/pdf') && f.size <= 10 * 1024 * 1024
    );
    setAdjuntos(p => [...p, ...allowed]);
  };

  const handleEnviar = async () => {
    if (!contenido.trim()) return;
    await comentar.mutateAsync({ contenido, esInterno, adjuntos, requiereAprobacion });
    setContenido(''); setAdjuntos([]); setEsInterno(false); setRequiereAp(false);
  };

  const comentarios = detalle?.comentarios ?? [];
  const ticketAdjuntos = detalle?.adjuntos?.filter(a => !a.comentario_id) ?? [];
  const ticketEnlaces  = detalle?.enlaces ?? [];
  const cerrado = ['resuelto', 'cerrado'].includes(ticket.estado);

  return (
    <div className="border-t border-slate-100 dark:border-white/[0.05] pt-4 mt-1 space-y-4">

      {/* Adjuntos y links originales del cliente */}
      {!isLoading && (ticketAdjuntos.length > 0 || ticketEnlaces.length > 0) && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-white/30">Adjuntos del cliente</p>
          <div className="flex flex-wrap gap-1.5">
            {ticketAdjuntos.map(a => (
              <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors">
                {a.tipo_mime?.startsWith('image/') ? <img src={a.url} className="w-6 h-6 object-cover rounded" alt="" /> : <FileText size={11} />}
                <span className="max-w-[100px] truncate">{a.nombre_original}</span>
                <ExternalLink size={9} />
              </a>
            ))}
            {ticketEnlaces.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                <Link2 size={11} />
                <span className="max-w-[160px] truncate">{url}</span>
                <ExternalLink size={9} />
              </a>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 text-sm py-2">
          <Loader2 size={13} className="animate-spin" /> Cargando conversación…
        </div>
      ) : comentarios.length === 0 ? (
        <p className="text-xs text-slate-300 dark:text-white/20 py-1">Sin mensajes aún.</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {comentarios.map(c => (
            <div key={c.id} className={`flex gap-3 ${c.es_admin ? '' : 'flex-row-reverse'}`}>
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                style={{ backgroundColor: c.es_admin ? '#09090b' : clienteColor(detalle?.cliente?.colores) }}
              >
                {c.user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className={`max-w-[75%] flex flex-col ${c.es_admin ? 'items-start' : 'items-end'}`}>
                {c.es_interno && (
                  <span className="text-[10px] text-amber-500 dark:text-amber-400 mb-0.5 flex items-center gap-1">
                    <AlertCircle size={9} /> Nota interna
                  </span>
                )}
                <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  c.es_interno
                    ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-tl-none'
                    : c.es_admin
                      ? 'bg-slate-900 dark:bg-white/[0.08] text-white rounded-tl-none'
                      : 'bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-white/80 rounded-tr-none'
                }`}>
                  <p className="whitespace-pre-wrap">{c.contenido}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-300 dark:text-white/20">
                    {c.user?.name} · {new Date(c.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </span>
                  {c.es_admin && (
                    <button onClick={() => eliminarC.mutate(c.id)} className="text-[10px] text-slate-300 dark:text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
                {(c.adjuntos?.length > 0 || c.enlaces?.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {c.adjuntos?.map(a => (
                      <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors">
                        {a.tipo_mime?.startsWith('image/') ? <img src={a.url} className="w-6 h-6 object-cover rounded" alt="" /> : <FileText size={11} />}
                        <span className="max-w-[80px] truncate">{a.nombre_original}</span>
                        <ExternalLink size={9} />
                      </a>
                    ))}
                    {c.enlaces?.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                        <Link2 size={11} />
                        <span className="max-w-[120px] truncate">{url}</span>
                        <ExternalLink size={9} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner estado aprobación */}
      {ticket.estado_aprobacion && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
          ticket.estado_aprobacion === 'esperando'
            ? 'bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-400'
            : ticket.estado_aprobacion === 'aprobado'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
        }`}>
          {ticket.estado_aprobacion === 'esperando' && <><Hourglass size={12} /> Esperando aprobación del cliente</>}
          {ticket.estado_aprobacion === 'aprobado'  && <><ThumbsUp size={12} /> El cliente aprobó este ticket</>}
          {ticket.estado_aprobacion === 'rechazado' && <><ThumbsDown size={12} /> El cliente rechazó este ticket</>}
        </div>
      )}

      {/* Caja de respuesta */}
      {!cerrado && (
        <div className="space-y-2">
          <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            rows={3}
            placeholder="Escribir respuesta…"
            className={`${inputCls} resize-none`}
          />
          {adjuntos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {adjuntos.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2 py-1">
                  <FileText size={11} className="text-slate-400 dark:text-white/30" />
                  <span className="text-xs text-slate-600 dark:text-white/60 max-w-[100px] truncate">{f.name}</span>
                  <button onClick={() => setAdjuntos(p => p.filter((_, j) => j !== i))}><X size={10} className="text-slate-300 dark:text-white/20 hover:text-red-400" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleEnviar}
              disabled={!contenido.trim() || comentar.isPending}
              className="flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-all"
            >
              {comentar.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Responder
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
              <Paperclip size={12} /> Adjuntar
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={e => handleFiles(e.target.files)} />
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <input type="checkbox" checked={esInterno} onChange={e => setEsInterno(e.target.checked)} className="accent-amber-500" />
                Nota interna
              </label>
              <label className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 cursor-pointer font-medium">
                <input type="checkbox" checked={requiereAprobacion} onChange={e => { setRequiereAp(e.target.checked); if (e.target.checked) setEsInterno(false); }} className="accent-violet-500" />
                Requiere aprobación
              </label>
            </div>
          </div>
          {requiereAprobacion && (
            <p className="text-[11px] text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-lg px-3 py-1.5">
              El cliente verá un botón para <strong>Aprobar</strong> o <strong>Rechazar</strong> este ticket en su portal.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Card de ticket expandible ─────────────────────────────────────────────────
function TicketCard({ ticket, clientes }) {
  const [expandido, setExpandido] = useState(false);
  const [editandoEstado, setEditandoEstado] = useState(false);
  const actualizar  = useActualizarTicket(ticket.cliente_id);
  const eliminar    = useEliminarTicket(ticket.cliente_id);
  const panelRef    = useRef(null);

  const prio     = PRIORIDAD[ticket.prioridad] ?? PRIORIDAD.baja;
  const est      = ESTADO[ticket.estado]       ?? ESTADO.pendiente;
  const EstIcon  = est.icon;
  const fechaInf = fechaLimiteInfo(ticket.fecha_limite);

  const clienteColor_ = clienteColor(ticket.cliente?.colores);
  const inicial = ticket.cliente?.nombre?.[0]?.toUpperCase() ?? '?';

  const cambiarEstado = (estado) => {
    actualizar.mutate({ id: ticket.id, estado });
    setEditandoEstado(false);
  };

  return (
    <div className={`bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] rounded-xl border-l-4 ${prio.border} shadow-sm dark:shadow-none`}>
      {/* Fila principal */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpandido(e => !e)}
      >
        {/* Avatar cliente */}
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: clienteColor_ }}
        >
          {inicial}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-white/30 font-mono">#{String(ticket.id).padStart(4,'0')}</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-white/90 truncate">{ticket.titulo}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-white/30">{ticket.cliente?.nombre}</span>
            {ticket.tipo && (
              <span className="text-[10px] text-slate-400 dark:text-white/30 capitalize bg-slate-50 dark:bg-white/[0.04] px-1.5 py-0.5 rounded">{ticket.tipo}</span>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {fechaInf && (
            <span className={`flex items-center gap-1 text-[11px] font-medium ${fechaInf.cls}`}>
              <fechaInf.icon size={10} />
              {fechaInf.label}
            </span>
          )}
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${prio.badge}`}>
            {prio.label}
          </span>
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${est.badge}`}>
            <EstIcon size={10} />
            {est.label}
          </span>
          {ticket.estado_aprobacion && <AprobacionBadge estado={ticket.estado_aprobacion} />}
          {ticket.comentarios_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-white/30">
              <MessageSquare size={11} /> {ticket.comentarios_count}
            </span>
          )}
          <ChevronDown size={14} className={`text-slate-300 dark:text-white/20 transition-transform ${expandido ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Panel expandido */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            ref={panelRef}
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            style={{ overflow: 'hidden' }}
            onAnimationStart={() => {
              if (panelRef.current) panelRef.current.style.overflow = 'hidden';
            }}
            onAnimationComplete={() => {
              if (panelRef.current && expandido) panelRef.current.style.overflow = 'visible';
            }}
          >
            <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-white/[0.05] pt-3">
              {/* Descripción */}
              {ticket.descripcion && (
                <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed">{ticket.descripcion}</p>
              )}

              {/* Controles inline */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Cambiar estado */}
                <div className="relative">
                  <button
                    onClick={() => setEditandoEstado(e => !e)}
                    className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-white/60 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <EstIcon size={11} /> {est.label} <ChevronDown size={10} />
                  </button>
                  <AnimatePresence>
                    {editandoEstado && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg py-1 min-w-[170px]"
                      >
                        {ESTADO_OPTS.map(e => {
                          const EI = ESTADO[e].icon;
                          return (
                            <button
                              key={e}
                              onClick={() => cambiarEstado(e)}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors ${ticket.estado === e ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-white/60'}`}
                            >
                              <EI size={11} /> {ESTADO[e].label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Cambiar prioridad */}
                <select
                  value={ticket.prioridad}
                  onChange={e => actualizar.mutate({ id: ticket.id, prioridad: e.target.value })}
                  className="text-xs bg-slate-100 dark:bg-white/[0.05] border-0 text-slate-600 dark:text-white/60 px-2.5 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors"
                >
                  {PRIOR_OPTS.map(p => <option key={p} value={p} className="bg-white dark:bg-[#1a1a1a]">{PRIORIDAD[p].label}</option>)}
                </select>

                {/* Fecha límite */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30">
                  <CalendarClock size={12} />
                  <input
                    type="date"
                    value={ticket.fecha_limite ? ticket.fecha_limite.substring(0, 10) : ''}
                    onChange={e => actualizar.mutate({ id: ticket.id, fecha_limite: e.target.value || null })}
                    className="bg-transparent border-0 outline-none text-xs text-slate-500 dark:text-white/40 cursor-pointer"
                  />
                </div>

                {/* Ir al cliente */}
                <Link
                  to={`/dashboard/clientes/${ticket.cliente_id}`}
                  className="flex items-center gap-1 text-xs text-slate-400 dark:text-white/30 hover:text-[#c9a84c] transition-colors ml-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <ArrowUpRight size={12} /> Ver cliente
                </Link>

                {/* Eliminar */}
                <button
                  onClick={() => { if (confirm('¿Eliminar este ticket?')) eliminar.mutate(ticket.id); }}
                  className="text-xs text-slate-300 dark:text-white/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Thread */}
              <TicketThread ticket={ticket} clienteId={ticket.cliente_id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Stats chip ────────────────────────────────────────────────────────────────
function Stat({ label, value, cls }) {
  return (
    <div className={`flex flex-col items-center justify-center px-5 py-3 rounded-xl border ${cls}`}>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs mt-0.5 opacity-70">{label}</span>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Tickets() {
  const [estadoFiltro, setEstadoFiltro]   = useState('pendiente');
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [prioFiltro, setPrioFiltro]       = useState('');
  const [sort, setSort]                   = useState('urgencia');
  const [modalNuevo, setModalNuevo]       = useState(false);

  // Marcar visita → limpia el badge del sidebar
  useEffect(() => {
    localStorage.setItem('tickets_last_visit', new Date().toISOString());
    window.dispatchEvent(new Event('tickets-visited'));
  }, []);

  const { data: clientes }              = useClientes();
  const { data: tickets = [], isLoading } = useTicketsAll({
    estado:     estadoFiltro  || undefined,
    cliente_id: clienteFiltro || undefined,
    prioridad:  prioFiltro    || undefined,
  });

  // Stats sobre el total sin filtro
  const { data: todosTickets = [] } = useTicketsAll();
  const abiertos   = todosTickets.filter(t => !['resuelto','cerrado'].includes(t.estado)).length;
  const urgentes   = todosTickets.filter(t => t.prioridad === 'urgente' && !['resuelto','cerrado'].includes(t.estado)).length;
  const hoy        = new Date(); hoy.setHours(0,0,0,0);
  const vencidos   = todosTickets.filter(t => {
    if (!t.fecha_limite || ['resuelto','cerrado'].includes(t.estado)) return false;
    const d = new Date(t.fecha_limite); d.setHours(0,0,0,0);
    return d < hoy;
  }).length;
  const resueltosMes = todosTickets.filter(t => {
    if (t.estado !== 'resuelto') return false;
    const r = new Date(t.resuelto_at);
    return r.getMonth() === hoy.getMonth() && r.getFullYear() === hoy.getFullYear();
  }).length;

  // Ordenamiento local
  const sorted = [...tickets].sort((a, b) => {
    if (sort === 'urgencia') {
      const prioOrder = { urgente: 0, alta: 1, media: 2, baja: 3 };
      return (prioOrder[a.prioridad] ?? 9) - (prioOrder[b.prioridad] ?? 9);
    }
    if (sort === 'fecha_limite') {
      if (!a.fecha_limite) return 1;
      if (!b.fecha_limite) return -1;
      return new Date(a.fecha_limite) - new Date(b.fecha_limite);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const tabCls = (v) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
      estadoFiltro === v
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
        : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
    }`;

  const chipCls = (active) =>
    `px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
      active
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
        : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
    }`;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Ticket size={20} className="text-[#c9a84c]" />
            Tickets
          </h1>
          <p className="text-slate-400 dark:text-white/30 text-sm mt-1">
            {isLoading ? 'Cargando…' : `${sorted.length} ticket${sorted.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setModalNuevo(true)}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus size={15} /> Nuevo ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Abiertos"        value={abiertos}      cls="border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white/70" />
        <Stat label="Urgentes"        value={urgentes}      cls={urgentes > 0 ? 'border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400' : 'border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white/70'} />
        <Stat label="Vencidos"        value={vencidos}      cls={vencidos > 0 ? 'border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white/70'} />
        <Stat label="Resueltos (mes)" value={resueltosMes}  cls="border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* Tabs de estado */}
      <div className="flex flex-wrap gap-1 mb-4 pb-4 border-b border-slate-100 dark:border-white/[0.05]">
        <button onClick={() => setEstadoFiltro('')}                 className={tabCls('')}>Todos</button>
        <button onClick={() => setEstadoFiltro('pendiente')}        className={tabCls('pendiente')}>Pendiente</button>
        <button onClick={() => setEstadoFiltro('en_progreso')}      className={tabCls('en_progreso')}>En progreso</button>
        <button onClick={() => setEstadoFiltro('esperando_cliente')} className={tabCls('esperando_cliente')}>Esperando cliente</button>
        <button onClick={() => setEstadoFiltro('resuelto')}         className={tabCls('resuelto')}>Resuelto</button>
        <button onClick={() => setEstadoFiltro('cerrado')}          className={tabCls('cerrado')}>Cerrado</button>
      </div>

      {/* Filtros secundarios */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Filter size={13} className="text-slate-300 dark:text-white/20 shrink-0" />

        {/* Cliente */}
        <select
          value={clienteFiltro}
          onChange={e => setClienteFiltro(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-1.5 text-slate-700 dark:text-white/70 outline-none focus:border-[#c9a84c]/60 transition-all"
        >
          <option value="">Todos los clientes</option>
          {(clientes ?? []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        {/* Prioridad chips */}
        <div className="flex gap-1.5">
          <button onClick={() => setPrioFiltro('')}          className={chipCls(prioFiltro === '')}>Todas</button>
          {PRIOR_OPTS.map(p => (
            <button key={p} onClick={() => setPrioFiltro(p)} className={chipCls(prioFiltro === p)}>{PRIORIDAD[p].label}</button>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-white/30">Ordenar:</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-white/70 outline-none focus:border-[#c9a84c]/60 transition-all"
          >
            <option value="urgencia">Más urgentes</option>
            <option value="recientes">Más recientes</option>
            <option value="fecha_limite">Por fecha límite</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={20} className="text-slate-300 dark:text-white/20 animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Ticket size={36} className="text-slate-200 dark:text-white/10" />
          <p className="text-slate-300 dark:text-white/20 text-sm">
            {estadoFiltro || clienteFiltro || prioFiltro ? 'Sin tickets con estos filtros.' : 'No hay tickets todavía.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(t => (
            <TicketCard key={t.id} ticket={t} clientes={clientes} />
          ))}
        </div>
      )}

      {/* Modal nuevo ticket */}
      <AnimatePresence>
        {modalNuevo && (
          <ModalNuevoTicket clientes={clientes} onClose={() => setModalNuevo(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
