import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Ticket, ChevronRight, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

const ESTADOS = {
  pendiente:         { label: 'Pendiente',          cls: 'bg-yellow-100 text-yellow-800' },
  en_progreso:       { label: 'En progreso',         cls: 'bg-blue-100 text-blue-800' },
  esperando_cliente: { label: 'Esperando respuesta', cls: 'bg-purple-100 text-purple-800' },
  resuelto:          { label: 'Resuelto',            cls: 'bg-green-100 text-green-800' },
  cerrado:           { label: 'Cerrado',             cls: 'bg-zinc-100 text-zinc-600' },
};

const TIPOS = {
  mejora:        'bg-blue-50 text-blue-700',
  requerimiento: 'bg-pink-50 text-pink-700',
  consulta:      'bg-yellow-50 text-yellow-700',
  bug:           'bg-red-50 text-red-700',
  otro:          'bg-zinc-50 text-zinc-600',
};

export default function PortalTickets() {
  const { cliente } = useAuthStore();
  const accentColor = cliente?.colores?.[0] ?? '#c9a84c';
  const [filtro, setFiltro] = useState('todos');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['portal-tickets'],
    queryFn: () => api.get('/portal/tickets').then(r => r.data),
  });

  const filtrados = filtro === 'todos'
    ? tickets
    : filtro === 'abiertos'
      ? tickets.filter(t => !['resuelto','cerrado'].includes(t.estado))
      : tickets.filter(t => ['resuelto','cerrado'].includes(t.estado));

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Mis tickets</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Seguimiento de tus solicitudes y requerimientos</p>
        </div>
        <Link
          to="/dashboard/portal/tickets/nuevo"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: accentColor }}
        >
          <Plus size={15} />
          Nuevo ticket
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 mb-5">
        {['todos','abiertos','cerrados'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              filtro === f ? 'text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
            style={filtro === f ? { backgroundColor: accentColor } : {}}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-zinc-400" />
        </div>
      ) : filtrados.length === 0 ? (
        <Empty accentColor={accentColor} />
      ) : (
        <div className="space-y-2">
          {filtrados.map(ticket => (
            <Link
              key={ticket.id}
              to={`/dashboard/portal/tickets/${ticket.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-zinc-100 px-5 py-4 hover:border-zinc-200 hover:shadow-sm transition-all group"
            >
              <TicketStateIcon estado={ticket.estado} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-zinc-900 truncate">{ticket.titulo}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${TIPOS[ticket.tipo] ?? TIPOS.otro}`}>
                    {ticket.tipo}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  #{String(ticket.id).padStart(4,'0')}
                  &nbsp;·&nbsp;{new Date(ticket.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'short', year:'numeric' })}
                  {ticket.comentarios_count > 0 && ` · ${ticket.comentarios_count} mensaje(s)`}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ESTADOS[ticket.estado]?.cls ?? ESTADOS.pendiente.cls}`}>
                  {ESTADOS[ticket.estado]?.label ?? ticket.estado}
                </span>
                <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketStateIcon({ estado }) {
  if (['resuelto','cerrado'].includes(estado))
    return <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />;
  if (estado === 'pendiente')
    return <Clock size={18} className="text-yellow-500 flex-shrink-0" />;
  return <AlertCircle size={18} className="text-blue-500 flex-shrink-0" />;
}

function Empty({ accentColor }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 py-16 text-center">
      <Ticket size={36} className="mx-auto text-zinc-300 mb-3" />
      <p className="text-zinc-900 font-semibold mb-1">No hay tickets todavía</p>
      <p className="text-zinc-500 text-sm mb-5">Podés abrir un ticket para consultas, mejoras o requerimientos.</p>
      <Link
        to="/dashboard/portal/tickets/nuevo"
        className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity"
        style={{ backgroundColor: accentColor }}
      >
        <Plus size={15} />
        Abrir mi primer ticket
      </Link>
    </div>
  );
}
