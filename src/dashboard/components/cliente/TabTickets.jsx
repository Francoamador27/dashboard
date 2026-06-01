import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Loader2, ChevronDown, Clock, CheckCircle2, AlertCircle,
  Circle, Wrench, Send, Paperclip, FileText, X, ExternalLink,
  CalendarClock, Trash2, TriangleAlert, MessageSquare, Link2,
  ThumbsUp, ThumbsDown, Hourglass,
} from 'lucide-react';
import {
  useTickets, useCrearTicket, useActualizarTicket, useEliminarTicket,
  useTicketDetalle, useCrearComentarioTicket, useEliminarComentarioTicket,
} from '../../hooks/useClienteDetalle';
import TicketFormFull from '../ticket/TicketFormFull';

// ── Constantes ────────────────────────────────────────────────────────────────
const PRIORIDAD = {
  baja:    { label: 'Baja',    border: 'border-l-slate-300 dark:border-l-white/20',  badge: 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-white/40' },
  media:   { label: 'Media',   border: 'border-l-blue-400',  badge: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' },
  alta:    { label: 'Alta',    border: 'border-l-amber-400', badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' },
  urgente: { label: 'Urgente', border: 'border-l-red-500',   badge: 'bg-red-50 dark:bg-red-500/10 text-red-500' },
};

const ESTADO = {
  pendiente:         { label: 'Pendiente',          icon: Circle,       cls: 'text-slate-400' },
  en_progreso:       { label: 'En progreso',         icon: Clock,        cls: 'text-blue-500' },
  esperando_cliente: { label: 'Esperando cliente',   icon: AlertCircle,  cls: 'text-purple-500' },
  resuelto:          { label: 'Resuelto',            icon: CheckCircle2, cls: 'text-emerald-500' },
  cerrado:           { label: 'Cerrado',             icon: CheckCircle2, cls: 'text-slate-300 dark:text-white/20' },
};

const TIPO_OPTS   = ['soporte','desarrollo','diseño','consulta','otro'];
const PRIOR_OPTS  = ['baja','media','alta','urgente'];
const ESTADO_OPTS = ['pendiente','en_progreso','esperando_cliente','resuelto','cerrado'];

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

const EMPTY = {
  titulo: '', descripcion: '', tipo: 'soporte', prioridad: 'media',
  estado: 'pendiente', incluido_soporte: true, precio_cobrado: '', tiempo_minutos: '', fecha_limite: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fechaLimiteInfo(fecha) {
  if (!fecha) return null;
  const hoy  = new Date(); hoy.setHours(0,0,0,0);
  const d    = new Date(fecha); d.setHours(0,0,0,0);
  const diff = Math.round((d - hoy) / 86400000);
  if (diff < 0)   return { label: `Vencido hace ${Math.abs(diff)}d`, cls: 'text-red-500',   icon: TriangleAlert };
  if (diff === 0) return { label: 'Vence hoy',                        cls: 'text-red-500',   icon: TriangleAlert };
  if (diff <= 3)  return { label: `Vence en ${diff}d`,               cls: 'text-amber-500', icon: CalendarClock };
  return { label: d.toLocaleDateString('es-AR', { day:'numeric', month:'short' }), cls: 'text-slate-400 dark:text-white/30', icon: CalendarClock };
}


// ── Thread interno ────────────────────────────────────────────────────────────
function TicketThread({ clienteId, ticketId, ticketEstado, estadoAprobacion }) {
  const [contenido, setContenido]           = useState('');
  const [esInterno, setEsInterno]           = useState(false);
  const [requiereAprobacion, setRequiereAp] = useState(false);
  const [adjuntos, setAdjuntos]             = useState([]);
  const fileRef = useRef(null);

  const { data: detalle, isLoading } = useTicketDetalle(clienteId, ticketId);
  const comentar  = useCrearComentarioTicket(clienteId, ticketId);
  const eliminarC = useEliminarComentarioTicket(clienteId, ticketId);

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
  const cerrado = ['resuelto','cerrado'].includes(ticketEstado);

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.05] space-y-3">
      <p className="text-xs font-semibold text-slate-400 dark:text-white/30 flex items-center gap-1.5">
        <MessageSquare size={11} /> Conversación
      </p>

      {/* Estado aprobación */}
      {estadoAprobacion && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
          estadoAprobacion === 'esperando'
            ? 'bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-400'
            : estadoAprobacion === 'aprobado'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
        }`}>
          {estadoAprobacion === 'esperando' && <><Hourglass size={11} /> Esperando aprobación del cliente</>}
          {estadoAprobacion === 'aprobado'  && <><ThumbsUp size={11} /> El cliente aprobó este ticket</>}
          {estadoAprobacion === 'rechazado' && <><ThumbsDown size={11} /> El cliente rechazó este ticket</>}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-300 dark:text-white/20 text-xs">
          <Loader2 size={12} className="animate-spin" /> Cargando…
        </div>
      ) : comentarios.length === 0 ? (
        <p className="text-xs text-slate-300 dark:text-white/20">Sin mensajes aún.</p>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {comentarios.map(c => (
            <div key={c.id} className={`flex gap-2.5 ${c.es_admin ? '' : 'flex-row-reverse'}`}>
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${c.es_admin ? 'bg-slate-900 dark:bg-white/[0.15]' : 'bg-[#c9a84c]'}`}>
                {c.user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className={`max-w-[78%] flex flex-col ${c.es_admin ? 'items-start' : 'items-end'}`}>
                {c.es_interno && (
                  <span className="text-[10px] text-amber-500 mb-0.5 flex items-center gap-1">
                    <AlertCircle size={9} /> Nota interna
                  </span>
                )}
                <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  c.es_interno
                    ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-tl-none'
                    : c.es_admin
                      ? 'bg-slate-800 dark:bg-white/[0.08] text-white rounded-tl-none'
                      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-white/70 rounded-tr-none'
                }`}>
                  <p className="whitespace-pre-wrap">{c.contenido}</p>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-300 dark:text-white/20">
                    {c.user?.name} · {new Date(c.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </span>
                  {c.es_admin && (
                    <button onClick={() => eliminarC.mutate(c.id)} className="text-[10px] text-slate-300 dark:text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
                {c.adjuntos?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.adjuntos.map(a => (
                      <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-white/50 hover:bg-slate-100 transition-colors">
                        {a.tipo_mime?.startsWith('image/') ? <img src={a.url} className="w-5 h-5 object-cover rounded" alt="" /> : <FileText size={10} />}
                        <span className="max-w-[70px] truncate">{a.nombre_original}</span>
                        <ExternalLink size={8} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Caja de respuesta */}
      {!cerrado && (
        <div className="space-y-2">
          <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            rows={2}
            placeholder="Escribir respuesta al cliente…"
            className={`${inputCls} resize-none text-xs`}
          />
          {adjuntos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {adjuntos.map((f, i) => (
                <div key={i} className="flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded px-2 py-1">
                  <FileText size={10} className="text-slate-400 dark:text-white/30" />
                  <span className="text-[10px] text-slate-500 dark:text-white/50 max-w-[80px] truncate">{f.name}</span>
                  <button onClick={() => setAdjuntos(p => p.filter((_,j) => j !== i))}><X size={9} className="text-slate-300 dark:text-white/20 hover:text-red-400" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEnviar}
              disabled={!contenido.trim() || comentar.isPending}
              className="flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            >
              {comentar.isPending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
              Responder
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
              <Paperclip size={11} /> Adjuntar
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={e => handleFiles(e.target.files)} />
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-white/40 cursor-pointer">
                <input type="checkbox" checked={esInterno} onChange={e => setEsInterno(e.target.checked)} className="accent-amber-500" />
                Nota interna
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-violet-600 dark:text-violet-400 font-medium cursor-pointer">
                <input type="checkbox" checked={requiereAprobacion} onChange={e => { setRequiereAp(e.target.checked); if (e.target.checked) setEsInterno(false); }} className="accent-violet-500" />
                Requiere aprobación
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Fila de ticket ────────────────────────────────────────────────────────────
function TicketRow({ ticket, clienteId }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [tab, setTab]           = useState('info'); // 'info' | 'chat'
  const actualizar = useActualizarTicket(clienteId);
  const eliminar   = useEliminarTicket(clienteId);

  const estadoInfo = ESTADO[ticket.estado]   ?? ESTADO.pendiente;
  const prioInfo   = PRIORIDAD[ticket.prioridad] ?? PRIORIDAD.baja;
  const EstIcon    = estadoInfo.icon;
  const fechaInf   = fechaLimiteInfo(ticket.fecha_limite);

  const cambiarEstado = (estado) => actualizar.mutate({ id: ticket.id, estado });

  return (
    <div className={`bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl overflow-hidden border-l-4 ${prioInfo.border} shadow-sm dark:shadow-none`}>
      {editing ? (
        <div className="p-4">
          <TicketFormFull
            initial={{
              ...ticket,
              precio_cobrado: ticket.precio_cobrado ?? '',
              tiempo_minutos: ticket.tiempo_minutos ?? '',
              fecha_limite: ticket.fecha_limite ? ticket.fecha_limite.substring(0,10) : '',
            }}
            onSave={async ({ adjuntos: _adj, enlaces, ...data }) => {
              await actualizar.mutateAsync({ id: ticket.id, ...data, enlaces });
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
            loading={actualizar.isPending}
          />
        </div>
      ) : (
        <>
          {/* Cabecera */}
          <div
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
            onClick={() => setExpanded(e => !e)}
          >
            <EstIcon size={15} className={estadoInfo.cls} strokeWidth={1.75} />
            <span className="flex-1 text-sm font-medium text-slate-800 dark:text-white/90 truncate">{ticket.titulo}</span>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {fechaInf && (
                <span className={`hidden sm:flex items-center gap-1 text-[11px] font-medium ${fechaInf.cls}`}>
                  <fechaInf.icon size={10} /> {fechaInf.label}
                </span>
              )}
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${prioInfo.badge}`}>
                {prioInfo.label}
              </span>
              {!ticket.incluido_soporte && ticket.precio_cobrado > 0 && (
                <span className="text-xs text-[#c9a84c] font-semibold">${Number(ticket.precio_cobrado).toLocaleString()}</span>
              )}
              {ticket.incluido_soporte && (
                <span className="hidden sm:inline text-xs text-slate-300 dark:text-white/20 bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.05] rounded-full px-2 py-0.5">Soporte</span>
              )}
              {(ticket.comentarios_count ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-white/30">
                  <MessageSquare size={11} /> {ticket.comentarios_count}
                </span>
              )}
            </div>
            <ChevronDown size={13} className={`text-slate-300 dark:text-white/20 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
          </div>

          {/* Panel expandido */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                className="overflow-hidden border-t border-slate-100 dark:border-white/[0.04]"
              >
                <div className="px-4 py-3 space-y-3">
                  {/* Sub-tabs: info / conversación */}
                  <div className="flex gap-1">
                    {['info','chat'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                          tab === t
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
                            : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                        }`}
                      >
                        {t === 'info' ? 'Detalles' : 'Conversación'}
                      </button>
                    ))}
                  </div>

                  {tab === 'info' ? (
                    <>
                      {ticket.descripcion && (
                        <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed">{ticket.descripcion}</p>
                      )}

                      {/* Enlaces */}
                      {ticket.enlaces?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {ticket.enlaces.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg px-2.5 py-1 transition-colors max-w-[220px] truncate">
                              <Link2 size={10} className="flex-shrink-0" />
                              <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink size={9} className="flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Cambiar estado */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-400 dark:text-white/30">Estado:</span>
                        {ESTADO_OPTS.map(e => (
                          <button
                            key={e}
                            onClick={() => cambiarEstado(e)}
                            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${ticket.estado === e ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'}`}
                          >
                            {ESTADO[e].label}
                          </button>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-white/30">
                        {ticket.tiempo_minutos > 0 && (
                          <span className="flex items-center gap-1"><Clock size={11} /> {ticket.tiempo_minutos} min</span>
                        )}
                        {ticket.resuelto_at && (
                          <span>Resuelto {new Date(ticket.resuelto_at).toLocaleDateString('es-AR')}</span>
                        )}
                        {fechaInf && (
                          <span className={`flex items-center gap-1 ${fechaInf.cls}`}>
                            <fechaInf.icon size={10} /> {fechaInf.label}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setEditing(true)} className="text-xs text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors">Editar</button>
                        <span className="text-slate-200 dark:text-white/10">·</span>
                        <button
                          onClick={() => { if (confirm('¿Eliminar este ticket?')) eliminar.mutate(ticket.id); }}
                          className="text-xs text-red-400 hover:text-red-500 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  ) : (
                    <TicketThread clienteId={clienteId} ticketId={ticket.id} ticketEstado={ticket.estado} estadoAprobacion={ticket.estado_aprobacion} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// ── Tab principal ─────────────────────────────────────────────────────────────
export default function TabTickets({ clienteId }) {
  const { data: tickets, isLoading } = useTickets(clienteId);
  const crear = useCrearTicket(clienteId);
  const [creando, setCreando]         = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrio, setFiltroPrio]     = useState('todos');

  const filtered = (tickets ?? []).filter(t => {
    const okEstado = filtroEstado === 'todos' || t.estado === filtroEstado;
    const okPrio   = filtroPrio   === 'todos' || t.prioridad === filtroPrio;
    return okEstado && okPrio;
  });

  const pendientes = (tickets ?? []).filter(t => t.estado === 'pendiente').length;
  const urgentes   = (tickets ?? []).filter(t => t.prioridad === 'urgente' && !['resuelto','cerrado'].includes(t.estado)).length;

  const chipCls = (active) =>
    `px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
      active
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
        : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
    }`;

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-slate-700 dark:text-white/70 text-sm font-semibold">
            {tickets?.length ?? 0} tickets
          </h2>
          {pendientes > 0 && (
            <span className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-500 border border-amber-200 dark:border-amber-500/20 rounded-full px-2 py-0.5">
              {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
            </span>
          )}
          {urgentes > 0 && (
            <span className="text-xs bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20 rounded-full px-2 py-0.5 flex items-center gap-1">
              <TriangleAlert size={10} /> {urgentes} urgente{urgentes !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setCreando(true)}
          className="flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-xs font-semibold rounded-lg px-3 py-2 transition-all"
        >
          <Plus size={13} /> Nuevo ticket
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {creando && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <TicketFormFull
              onSave={async (data) => {
                await crear.mutateAsync(data);
                setCreando(false);
              }}
              onCancel={() => setCreando(false)}
              loading={crear.isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {['todos', ...ESTADO_OPTS].map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)} className={chipCls(filtroEstado === e)}>
              {e === 'todos' ? 'Todos' : ESTADO[e]?.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap border-l border-slate-200 dark:border-white/[0.06] pl-2">
          {['todos', ...PRIOR_OPTS].map(p => (
            <button key={p} onClick={() => setFiltroPrio(p)} className={chipCls(filtroPrio === p)}>
              {p === 'todos' ? 'Toda prio.' : PRIORIDAD[p]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/30">
          <Loader2 size={14} className="animate-spin" /><span className="text-sm">Cargando…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-10 text-center">
          <Wrench size={28} className="mx-auto mb-2 text-slate-200 dark:text-white/10" />
          <p className="text-slate-300 dark:text-white/20 text-sm">
            {filtroEstado !== 'todos' || filtroPrio !== 'todos' ? 'Sin tickets con estos filtros.' : 'Sin tickets aún.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => <TicketRow key={t.id} ticket={t} clienteId={clienteId} />)}
        </div>
      )}
    </div>
  );
}
