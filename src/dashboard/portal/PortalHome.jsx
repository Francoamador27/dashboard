import { useQuery } from '@tanstack/react-query';
import { Ticket, ImageIcon, FolderOpen, ChevronRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

const estadoBadge = {
  pendiente:        'bg-yellow-100 text-yellow-800',
  en_progreso:      'bg-blue-100 text-blue-800',
  esperando_cliente:'bg-purple-100 text-purple-800',
  resuelto:         'bg-green-100 text-green-800',
  cerrado:          'bg-zinc-100 text-zinc-600',
};

export default function PortalHome() {
  const { user, cliente } = useAuthStore();
  const accentColor = cliente?.colores?.[0] ?? '#c9a84c';

  const { data: meData } = useQuery({
    queryKey: ['portal-me'],
    queryFn: () => api.get('/portal/me').then(r => r.data),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['portal-tickets'],
    queryFn: () => api.get('/portal/tickets').then(r => r.data),
  });

  const abiertos   = tickets.filter(t => !['resuelto','cerrado'].includes(t.estado));
  const recientes  = tickets.slice(0, 3);

  const clienteData = meData?.cliente ?? cliente;

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Hola, <span style={{ color: accentColor }}>{user?.name?.split(' ')[0] ?? 'bienvenido'}</span>
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Este es tu portal de cliente — acá podés ver tus proyectos, imágenes y gestionar tickets.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <StatCard
          icon={<Ticket size={18} />}
          label="Tickets abiertos"
          value={abiertos.length}
          color={accentColor}
          to="/dashboard/portal/tickets"
        />
        <StatCard
          icon={<ImageIcon size={18} />}
          label="Mis imágenes"
          value="Ver galería"
          color={accentColor}
          to="/dashboard/portal/galeria"
          isLink
        />
        <StatCard
          icon={<FolderOpen size={18} />}
          label="Archivos"
          value="Ver todos"
          color={accentColor}
          to="/dashboard/portal/archivos"
          isLink
        />
      </div>

      {/* Tickets recientes */}
      <section className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-900 text-sm">Tickets recientes</h2>
          <Link to="/dashboard/portal/tickets" className="text-xs font-medium flex items-center gap-1" style={{ color: accentColor }}>
            Ver todos <ChevronRight size={13} />
          </Link>
        </div>
        {recientes.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-sm">
            No tenés tickets abiertos. ¡Todo en orden!
          </div>
        ) : (
          <ul className="divide-y divide-zinc-50">
            {recientes.map(ticket => (
              <li key={ticket.id}>
                <Link
                  to={`/dashboard/portal/tickets/${ticket.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 transition-colors"
                >
                  <TicketIcon estado={ticket.estado} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{ticket.titulo}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      #{String(ticket.id).padStart(4,'0')} · {new Date(ticket.created_at).toLocaleDateString('es-AR')}
                      {ticket.comentarios_count > 0 && ` · ${ticket.comentarios_count} respuesta(s)`}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${estadoBadge[ticket.estado]}`}>
                    {ticket.estado.replace('_', ' ')}
                  </span>
                  <ChevronRight size={14} className="text-zinc-300 flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="px-5 py-3 border-t border-zinc-100">
          <Link
            to="/dashboard/portal/tickets/nuevo"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            <Ticket size={14} />
            Abrir nuevo ticket
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color, to, isLink }) {
  return (
    <Link to={to} className="bg-white border border-zinc-100 rounded-xl p-4 hover:border-zinc-200 transition-colors group">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: color + '20', color }}>
        {icon}
      </div>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`font-bold ${isLink ? 'text-sm' : 'text-2xl'} text-zinc-900`}>{value}</p>
    </Link>
  );
}

function TicketIcon({ estado }) {
  if (['resuelto','cerrado'].includes(estado)) return <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />;
  if (estado === 'pendiente') return <Clock size={16} className="text-yellow-500 flex-shrink-0" />;
  return <AlertCircle size={16} className="text-blue-500 flex-shrink-0" />;
}
