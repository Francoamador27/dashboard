import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, FileText, X, Loader2, CheckCircle2, Clock, AlertCircle, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState, useRef } from 'react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

const ESTADO_CONFIG = {
  pendiente:         { label: 'Pendiente',          cls: 'bg-yellow-100 text-yellow-800', icon: Clock },
  en_progreso:       { label: 'En progreso',         cls: 'bg-blue-100 text-blue-800',    icon: AlertCircle },
  esperando_cliente: { label: 'Esperando tu respuesta', cls: 'bg-purple-100 text-purple-800', icon: AlertCircle },
  resuelto:          { label: 'Resuelto',            cls: 'bg-green-100 text-green-800',  icon: CheckCircle2 },
  cerrado:           { label: 'Cerrado',             cls: 'bg-zinc-100 text-zinc-600',    icon: CheckCircle2 },
};

export default function PortalTicketDetalle() {
  const { id } = useParams();
  const { user, cliente } = useAuthStore();
  const accentColor = cliente?.colores?.[0] ?? '#c9a84c';
  const qc = useQueryClient();
  const fileRef = useRef(null);

  const [contenido, setContenido] = useState('');
  const [adjuntos, setAdjuntos] = useState([]);
  const [error, setError] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['portal-ticket', id],
    queryFn: () => api.get(`/portal/tickets/${id}`).then(r => r.data),
  });

  const aprobar = useMutation({
    mutationFn: (decision) =>
      api.post(`/portal/tickets/${id}/aprobacion`, { decision }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-ticket', id] });
      qc.invalidateQueries({ queryKey: ['portal-tickets'] });
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('contenido', contenido);
      adjuntos.forEach(f => fd.append('adjuntos[]', f.file));
      return api.post(`/portal/tickets/${id}/comentarios`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      setContenido('');
      setAdjuntos([]);
      qc.invalidateQueries({ queryKey: ['portal-ticket', id] });
      qc.invalidateQueries({ queryKey: ['portal-tickets'] });
    },
    onError: (err) => setError(err.response?.data?.message ?? 'Error al enviar.'),
  });

  const handleFiles = (files) => {
    const allowed = Array.from(files).filter(f =>
      (f.type.startsWith('image/') || f.type === 'application/pdf') && f.size <= 10 * 1024 * 1024
    );
    setAdjuntos(prev => [
      ...prev,
      ...allowed.map(f => ({ file: f, preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null })),
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!contenido.trim()) return;
    mutation.mutate();
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={24} className="animate-spin text-zinc-400" />
    </div>
  );

  if (!ticket) return <div className="p-8 text-zinc-500">Ticket no encontrado.</div>;

  const estadoConf = ESTADO_CONFIG[ticket.estado] ?? ESTADO_CONFIG.pendiente;
  const EstIcon = estadoConf.icon;
  const cerrado = ['resuelto','cerrado'].includes(ticket.estado);

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {/* Back */}
      <div className="flex items-center gap-3 mb-5">
        <Link to="/dashboard/portal/tickets" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <span className="text-xs text-zinc-400 font-mono">
          TICKET #{String(ticket.id).padStart(4,'0')}
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-zinc-900 mb-2">{ticket.titulo}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${estadoConf.cls}`}>
                <EstIcon size={11} />
                {estadoConf.label}
              </span>
              <span className="text-xs text-zinc-400 capitalize">{ticket.tipo}</span>
              <span className="text-xs text-zinc-400">·</span>
              <span className="text-xs text-zinc-400">Prioridad {ticket.prioridad}</span>
              <span className="text-xs text-zinc-400">·</span>
              <span className="text-xs text-zinc-400">
                {new Date(ticket.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {ticket.descripcion && (
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-sm text-zinc-600 whitespace-pre-wrap">{ticket.descripcion}</p>
          </div>
        )}

        {/* Adjuntos del ticket (sin comentario) */}
        {ticket.adjuntos?.filter(a => !a.comentario_id).length > 0 && (
          <AdjuntosGrid adjuntos={ticket.adjuntos.filter(a => !a.comentario_id)} />
        )}
      </div>

      {/* Banner de aprobación */}
      {ticket.estado_aprobacion === 'esperando' && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
          <p className="text-sm font-bold text-violet-900 mb-1">Se requiere tu aprobación</p>
          <p className="text-sm text-violet-700 mb-4">
            El equipo está esperando tu confirmación para continuar con este ticket.
            Revisá la respuesta y decidí si aprobás o rechazás el trabajo.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => aprobar.mutate('aprobado')}
              disabled={aprobar.isPending}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {aprobar.isPending ? <Loader2 size={15} className="animate-spin" /> : <ThumbsUp size={15} />}
              Aprobar
            </button>
            <button
              onClick={() => aprobar.mutate('rechazado')}
              disabled={aprobar.isPending}
              className="flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <ThumbsDown size={15} /> Rechazar
            </button>
          </div>
        </div>
      )}

      {ticket.estado_aprobacion === 'aprobado' && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <ThumbsUp size={16} className="text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-700">Aprobaste este ticket — el equipo está trabajando en ello.</p>
        </div>
      )}

      {ticket.estado_aprobacion === 'rechazado' && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <ThumbsDown size={16} className="text-red-500" />
          <p className="text-sm font-semibold text-red-700">Rechazaste este ticket.</p>
        </div>
      )}

      {/* Thread de comentarios */}
      {ticket.comentarios?.length > 0 && (
        <div className="space-y-3 mb-4">
          {ticket.comentarios.map(comentario => (
            <Comentario
              key={comentario.id}
              comentario={comentario}
              esPropio={comentario.user_id === user?.id}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}

      {/* Caja de respuesta */}
      {!cerrado ? (
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">Agregar respuesta</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={contenido}
              onChange={e => setContenido(e.target.value)}
              rows={4}
              placeholder="Escribí tu mensaje o comentario..."
              className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 outline-none resize-none focus:ring-2 transition-all"
            />

            {adjuntos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {adjuntos.map((a, i) => (
                  <div key={i} className="relative flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5">
                    {a.preview
                      ? <img src={a.preview} className="w-8 h-8 object-cover rounded" alt="" />
                      : <FileText size={14} className="text-zinc-500" />
                    }
                    <span className="text-xs text-zinc-600 max-w-[100px] truncate">{a.file.name}</span>
                    <button type="button" onClick={() => setAdjuntos(p => p.filter((_,j) => j !== i))}>
                      <X size={11} className="text-zinc-400 hover:text-zinc-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={mutation.isPending || !contenido.trim()}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: accentColor }}
              >
                {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {mutation.isPending ? 'Enviando…' : 'Enviar'}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 px-3 py-2.5 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <Paperclip size={14} />
                Adjuntar
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-5 text-center">
          <CheckCircle2 size={24} className="mx-auto text-green-500 mb-2" />
          <p className="text-sm font-semibold text-zinc-700">Este ticket está cerrado</p>
          <p className="text-xs text-zinc-400 mt-1">Si necesitás algo más, abrí un nuevo ticket.</p>
          <Link
            to="/dashboard/portal/tickets/nuevo"
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: accentColor }}
          >
            Nuevo ticket
          </Link>
        </div>
      )}
    </div>
  );
}

function Comentario({ comentario, esPropio, accentColor }) {
  const esAdmin = comentario.es_admin;

  return (
    <div className={`flex gap-3 ${esPropio ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: esAdmin ? '#09090b' : accentColor }}
      >
        {comentario.user?.name?.[0]?.toUpperCase() ?? '?'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${esPropio ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-zinc-700">
            {esAdmin ? 'Equipo' : 'Vos'}
          </span>
          <span className="text-[11px] text-zinc-400">
            {new Date(comentario.created_at).toLocaleDateString('es-AR', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          esAdmin
            ? 'bg-zinc-900 text-white rounded-tl-none'
            : 'bg-white border border-zinc-200 text-zinc-800 rounded-tr-none'
        }`}>
          <p className="whitespace-pre-wrap">{comentario.contenido}</p>
        </div>
        {comentario.adjuntos?.length > 0 && (
          <div className="mt-2">
            <AdjuntosGrid adjuntos={comentario.adjuntos} small />
          </div>
        )}
      </div>
    </div>
  );
}

function AdjuntosGrid({ adjuntos, small }) {
  return (
    <div className={`flex flex-wrap gap-2 mt-3 ${small ? '' : 'pt-3 border-t border-zinc-100'}`}>
      {adjuntos.map(adj => (
        <a
          key={adj.id}
          href={adj.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg px-2.5 py-1.5 transition-colors"
        >
          {adj.tipo_mime?.startsWith('image/')
            ? <img src={adj.url} className="w-8 h-8 object-cover rounded" alt="" />
            : <FileText size={14} className="text-zinc-500" />
          }
          <span className="text-xs text-zinc-600 max-w-[120px] truncate">{adj.nombre_original}</span>
          <ExternalLink size={10} className="text-zinc-400 flex-shrink-0" />
        </a>
      ))}
    </div>
  );
}
