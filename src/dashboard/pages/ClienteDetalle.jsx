import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCliente } from '../hooks/useClientes';
import { imageUrl } from '../hooks/useGaleria';
import TabInfo from '../components/cliente/TabInfo';
import TabNotas from '../components/cliente/TabNotas';
import TabTickets from '../components/cliente/TabTickets';
import TabFacturacion from '../components/cliente/TabFacturacion';
import TabBrandDna from '../components/cliente/TabBrandDna';
import TabPlantillasCliente from '../components/cliente/TabPlantillasCliente';
import TabContenido from '../components/cliente/TabContenido';
import TabAcceso from '../components/cliente/TabAcceso';
import TabRecursos from '../components/cliente/TabRecursos';

const TABS = [
  { id: 'info',        label: 'Información' },
  { id: 'acceso',      label: 'Acceso Portal' },
  { id: 'notas',       label: 'Notas & Historial' },
  { id: 'tickets',     label: 'Tickets' },
  { id: 'recursos',    label: 'Recursos' },
  { id: 'facturacion', label: 'Facturación' },
  { id: 'brand',       label: 'Brand DNA' },
  { id: 'plantillas',  label: 'Plantillas' },
  { id: 'contenido',   label: 'Contenido' },
];

function ClienteLogo({ cliente }) {
  if (cliente.logo_path) {
    return (
      <img
        src={imageUrl('/storage/' + cliente.logo_path)}
        alt={cliente.nombre}
        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10"
      />
    );
  }
  const initials = cliente.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center font-bold text-[#c9a84c]">
      {initials}
    </div>
  );
}

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const { data: cliente, isLoading } = useCliente(id);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-slate-400 dark:text-white/30">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Cargando cliente…</span>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-8">
        <p className="text-slate-400 dark:text-white/30 text-sm">Cliente no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0a]">
        <div className="px-8 pt-6 pb-0">
          <button
            onClick={() => navigate('/dashboard/clientes')}
            className="flex items-center gap-1.5 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white text-xs mb-4 transition-colors"
          >
            <ArrowLeft size={12} /> Volver a clientes
          </button>

          <div className="flex items-center gap-4 mb-5">
            <ClienteLogo cliente={cliente} />
            <div>
              <h1 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
                {cliente.nombre}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                {cliente.rubro && (
                  <span className="text-slate-400 dark:text-white/40 text-xs">{cliente.rubro}</span>
                )}
                {cliente.website && (
                  <a
                    href={cliente.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#c9a84c]/70 hover:text-[#c9a84c] text-xs transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    {cliente.website.replace(/^https?:\/\//, '')} ↗
                  </a>
                )}
                {cliente.plan_soporte && (
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-2 py-0.5">
                    ${Number(cliente.plan_soporte).toLocaleString()}/mes
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'relative px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg',
                  tab === t.id
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70',
                ].join(' ')}
              >
                {t.label}
                {tab === t.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a84c] rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {tab === 'info'        && <TabInfo cliente={cliente} />}
            {tab === 'acceso'      && <TabAcceso cliente={cliente} />}
            {tab === 'notas'       && <TabNotas clienteId={id} />}
            {tab === 'recursos'    && <TabRecursos clienteId={id} />}
            {tab === 'tickets'     && <TabTickets clienteId={id} />}
            {tab === 'facturacion' && <TabFacturacion clienteId={id} cliente={cliente} />}
            {tab === 'brand'       && <TabBrandDna clienteId={id} />}
            {tab === 'plantillas'  && <TabPlantillasCliente clienteId={id} />}
            {tab === 'contenido'   && <TabContenido clienteId={id} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
