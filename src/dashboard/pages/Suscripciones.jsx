import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Users, CheckCircle2, XCircle, PauseCircle, Clock,
  RefreshCw, ChevronDown, ChevronUp, AlertCircle, Loader2,
  Calendar, DollarSign, Repeat, ExternalLink, Settings,
  User, Hash, Landmark, TrendingUp, BadgeCheck, ReceiptText,
  CircleDashed,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMPStatus, useMPSuscripciones } from '../hooks/useMercadoPago';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  authorized: {
    label: 'Activa',
    icon: CheckCircle2,
    cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  paused: {
    label: 'Pausada',
    icon: PauseCircle,
    cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
    dot: 'bg-amber-500',
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    cls: 'bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20',
    dot: 'bg-red-500',
  },
  pending: {
    label: 'Pendiente',
    icon: Clock,
    cls: 'bg-slate-50 dark:bg-white/[0.06] text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/10',
    dot: 'bg-slate-400',
  },
};

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtAmount(amount, currency) {
  if (!amount) return '—';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'ARS' }).format(amount);
}

function fmtFrequency(freq, type) {
  if (!freq || !type) return '—';
  const unit = type === 'months' ? (freq === 1 ? 'mes' : 'meses') : (freq === 1 ? 'día' : 'días');
  return `Cada ${freq} ${unit}`;
}

function nextPaymentColor(dateStr) {
  if (!dateStr) return 'text-slate-400 dark:text-white/30';
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'text-red-500';
  if (diff <= 3) return 'text-amber-500';
  return 'text-slate-500 dark:text-white/40';
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-5 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={13} />
        </div>
        <span className="text-xs text-slate-500 dark:text-white/40 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

// ─── SuscripcionRow ───────────────────────────────────────────────────────────

function SuscripcionRow({ s }) {
  const [open, setOpen] = useState(false);
  const st = STATUS_MAP[s.status] ?? STATUS_MAP.pending;
  const StatusIcon = st.icon;

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl overflow-hidden shadow-sm dark:shadow-none">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
      >
        {/* Status dot */}
        <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />

        {/* Nombre + plan */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {[s.payer_first_name, s.payer_last_name].filter(Boolean).join(' ') || `ID ${s.payer_id}` || '—'}
          </p>
          <p className="text-xs text-slate-400 dark:text-white/30 truncate">{s.reason || 'Sin descripción'}</p>
        </div>

        {/* Amount */}
        <span className="text-sm font-bold text-slate-800 dark:text-white/80 shrink-0">
          {fmtAmount(s.auto_recurring?.transaction_amount ?? s.payment_amount, s.auto_recurring?.currency_id ?? s.currency_id)}
        </span>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${st.cls}`}>
          <StatusIcon size={11} />
          {st.label}
        </span>

        {/* Chevron */}
        <span className="text-slate-300 dark:text-white/20 shrink-0">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Detalle expandido */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 dark:border-white/[0.06] divide-y divide-slate-100 dark:divide-white/[0.06]">

              {/* ── Fechas y ciclo ── */}
              <DetailSection title="Fechas y ciclo">
                <DetailField icon={Calendar} label="Creado">
                  <span className="text-sm text-slate-700 dark:text-white/70">{fmtDate(s.date_created)}</span>
                </DetailField>
                <DetailField icon={Calendar} label="Inicio del ciclo">
                  <span className="text-sm text-slate-700 dark:text-white/70">
                    {fmtDate(s.auto_recurring?.start_date ?? s.start_date)}
                  </span>
                </DetailField>
                <DetailField icon={Calendar} label="Fin del ciclo">
                  <span className="text-sm text-slate-700 dark:text-white/70">
                    {fmtDate(s.auto_recurring?.end_date ?? s.end_date)}
                  </span>
                </DetailField>
                <DetailField icon={Calendar} label="Próximo pago">
                  <span className={`text-sm font-semibold ${nextPaymentColor(s.next_payment_date)}`}>
                    {fmtDate(s.next_payment_date)}
                  </span>
                </DetailField>
                <DetailField icon={Calendar} label="Última modificación">
                  <span className="text-sm text-slate-700 dark:text-white/70">{fmtDate(s.last_modified)}</span>
                </DetailField>
                <DetailField icon={Repeat} label="Frecuencia">
                  <span className="text-sm text-slate-700 dark:text-white/70">
                    {fmtFrequency(
                      s.auto_recurring?.frequency ?? s.frequency,
                      s.auto_recurring?.frequency_type ?? s.frequency_type
                    )}
                  </span>
                </DetailField>
                <DetailField icon={DollarSign} label="Monto por ciclo">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {fmtAmount(
                      s.auto_recurring?.transaction_amount ?? s.payment_amount,
                      s.auto_recurring?.currency_id ?? s.currency_id
                    )}
                  </span>
                </DetailField>
                {s.auto_recurring?.has_billing_day && s.auto_recurring?.billing_day && (
                  <DetailField icon={Calendar} label="Día de facturación">
                    <span className="text-sm text-slate-700 dark:text-white/70">
                      Día {s.auto_recurring.billing_day} de cada mes
                    </span>
                  </DetailField>
                )}
                {s.auto_recurring?.free_trial && (
                  <DetailField icon={BadgeCheck} label="Prueba gratuita">
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">
                      {s.auto_recurring.free_trial.frequency} {s.auto_recurring.free_trial.frequency_type}
                    </span>
                  </DetailField>
                )}
              </DetailSection>

              {/* ── Historial de cobros (summarized) ── */}
              {s.summarized && (
                <DetailSection title="Historial de cobros">
                  <DetailField icon={TrendingUp} label="Cobros realizados">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {s.summarized.charged_quantity ?? '—'}
                    </span>
                  </DetailField>
                  <DetailField icon={DollarSign} label="Total cobrado">
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {fmtAmount(s.summarized.charged_amount, s.auto_recurring?.currency_id ?? s.currency_id)}
                    </span>
                  </DetailField>
                  <DetailField icon={Calendar} label="Fecha último cobro">
                    <span className="text-sm text-slate-700 dark:text-white/70">
                      {fmtDate(s.summarized.last_charged_date)}
                    </span>
                  </DetailField>
                  <DetailField icon={DollarSign} label="Monto último cobro">
                    <span className="text-sm text-slate-700 dark:text-white/70">
                      {fmtAmount(s.summarized.last_charged_amount, s.auto_recurring?.currency_id ?? s.currency_id)}
                    </span>
                  </DetailField>
                  {s.summarized.pending_charge_quantity > 0 && (
                    <DetailField icon={CircleDashed} label="Cobros pendientes">
                      <span className="text-sm font-semibold text-amber-500">
                        {s.summarized.pending_charge_quantity}
                        {s.summarized.pending_charge_amount > 0 && (
                          <span className="text-xs font-normal text-slate-400 dark:text-white/30 ml-1">
                            ({fmtAmount(s.summarized.pending_charge_amount, s.auto_recurring?.currency_id ?? s.currency_id)})
                          </span>
                        )}
                      </span>
                    </DetailField>
                  )}
                  <DetailField icon={BadgeCheck} label="Semáforo">
                    <SemaphoreChip value={s.summarized.semaphore} />
                  </DetailField>
                  {s.summarized.quotas != null && (
                    <DetailField icon={Hash} label="Cuotas">
                      <span className="text-sm text-slate-700 dark:text-white/70">{s.summarized.quotas}</span>
                    </DetailField>
                  )}
                </DetailSection>
              )}

              {/* ── Suscriptor ── */}
              <DetailSection title="Suscriptor">
                <DetailField icon={User} label="Nombre">
                  <span className="text-sm text-slate-700 dark:text-white/70">
                    {[s.payer_first_name, s.payer_last_name].filter(Boolean).join(' ') || '—'}
                  </span>
                </DetailField>
                {s.payer_id && (
                  <DetailField icon={Hash} label="ID de pagador (MP)">
                    <span className="text-xs font-mono text-slate-500 dark:text-white/40">{s.payer_id}</span>
                  </DetailField>
                )}
                {s.payment_method_id && (
                  <DetailField icon={Landmark} label="Método de pago">
                    <span className="text-sm text-slate-700 dark:text-white/70 capitalize">
                      {s.payment_method_id.replace(/_/g, ' ')}
                    </span>
                  </DetailField>
                )}
                {s.card_id && (
                  <DetailField icon={CreditCard} label="ID de tarjeta">
                    <span className="text-xs font-mono text-slate-500 dark:text-white/40">{s.card_id}</span>
                  </DetailField>
                )}
              </DetailSection>

              {/* ── Identificadores y links ── */}
              <DetailSection title="Identificadores">
                <DetailField icon={Hash} label="ID de suscripción">
                  <span className="text-xs font-mono text-slate-500 dark:text-white/40 break-all">{s.id}</span>
                </DetailField>
                {s.preapproval_plan_id && (
                  <DetailField icon={Hash} label="ID de plan">
                    <span className="text-xs font-mono text-slate-500 dark:text-white/40 break-all">{s.preapproval_plan_id}</span>
                  </DetailField>
                )}
                {s.collector_id && (
                  <DetailField icon={Hash} label="Collector ID">
                    <span className="text-xs font-mono text-slate-500 dark:text-white/40">{s.collector_id}</span>
                  </DetailField>
                )}
                {s.external_reference && (
                  <DetailField icon={ReceiptText} label="Referencia externa">
                    <span className="text-sm text-slate-700 dark:text-white/70">{s.external_reference}</span>
                  </DetailField>
                )}
                {s.version != null && (
                  <DetailField icon={Hash} label="Versión">
                    <span className="text-sm text-slate-500 dark:text-white/40">{s.version}</span>
                  </DetailField>
                )}
                {s.init_point && (
                  <div className="md:col-span-3">
                    <a
                      href={s.init_point}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#c9a84c] hover:text-[#d4b560] transition-colors"
                    >
                      <ExternalLink size={11} />
                      Ver en Mercado Pago
                    </a>
                  </div>
                )}
              </DetailSection>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="px-5 py-4 space-y-3">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">{title}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

function DetailField({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-slate-300 dark:text-white/20" />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">{label}</span>
      </div>
      {children}
    </div>
  );
}

function SemaphoreChip({ value }) {
  const map = {
    green:  { label: 'Verde', cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
    yellow: { label: 'Amarillo', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
    red:    { label: 'Rojo', cls: 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-200 dark:border-red-500/20' },
  };
  const s = map[value] ?? { label: value ?? '—', cls: 'bg-slate-50 dark:bg-white/[0.06] text-slate-500 border-slate-200 dark:border-white/10' };
  return (
    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Filtros ─────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'authorized', label: 'Activas' },
  { value: 'paused', label: 'Pausadas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'pending', label: 'Pendientes' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Suscripciones() {
  const [statusFilter, setStatusFilter] = useState('authorized');
  const { data: mpStatus } = useMPStatus();

  // Query filtrada (para la lista)
  const { data, isLoading, isError, error, refetch, isFetching } = useMPSuscripciones(
    statusFilter ? { status: statusFilter } : {}
  );

  // Query sin filtro solo para los stats globales
  const { data: allData } = useMPSuscripciones({});

  const suscripciones = data?.results ?? [];
  const total = data?.paging?.total ?? suscripciones.length;

  const allResults = allData?.results ?? [];
  const activas    = allResults.filter(s => s.status === 'authorized').length;
  const pausadas   = allResults.filter(s => s.status === 'paused').length;
  const canceladas = allResults.filter(s => s.status === 'cancelled').length;

  const totalMRR = allResults
    .filter(s => s.status === 'authorized')
    .reduce((acc, s) => acc + Number(s.auto_recurring?.transaction_amount ?? s.payment_amount ?? 0), 0);

  const currency = allResults[0]?.auto_recurring?.currency_id ?? allResults[0]?.currency_id ?? 'ARS';

  // Sin token configurado
  if (mpStatus && !mpStatus.configured) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#c9a84c]/10 flex items-center justify-center">
          <CreditCard size={22} className="text-[#c9a84c]" />
        </div>
        <div>
          <h2 className="text-slate-900 dark:text-white font-semibold text-lg">Mercado Pago no configurado</h2>
          <p className="text-slate-400 dark:text-white/40 text-sm mt-1">
            Agregá tu Access Token desde Configuración para ver las suscripciones.
          </p>
        </div>
        <Link
          to="/dashboard/configuracion"
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-sm font-semibold rounded-lg px-4 py-2 transition-all"
        >
          <Settings size={14} />
          Ir a Configuración
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">Suscripciones</h1>
          <p className="text-slate-400 dark:text-white/40 text-sm mt-1">
            Mercado Pago · {total} suscripción{total !== 1 ? 'es' : ''} encontrada{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-[#c9a84c]/40 hover:text-[#c9a84c] text-xs font-medium rounded-lg px-3 py-2 transition-all"
        >
          <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Token inválido */}
      {mpStatus?.configured && mpStatus?.valid === false && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">
            El Access Token guardado no es válido o expiró. Actualizalo desde{' '}
            <Link to="/dashboard/configuracion" className="underline">Configuración</Link>.
          </p>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Activas"
            value={activas}
            color="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={PauseCircle}
            label="Pausadas"
            value={pausadas}
            color="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
          />
          <StatCard
            icon={XCircle}
            label="Canceladas"
            value={canceladas}
            color="bg-red-100 dark:bg-red-500/20 text-red-500"
          />
          <StatCard
            icon={DollarSign}
            label="MRR (activas)"
            value={new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(totalMRR)}
            color="bg-[#c9a84c]/10 text-[#c9a84c]"
            sub="Ingresos mensuales recurrentes"
          />
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={[
              'text-xs font-medium px-3 py-1.5 rounded-full border transition-all',
              statusFilter === f.value
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                : 'bg-white dark:bg-white/[0.04] text-slate-500 dark:text-white/50 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center gap-2 py-16 justify-center text-slate-400 dark:text-white/30">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Cargando suscripciones…</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle size={24} className="text-red-400" />
          <p className="text-sm text-red-500">
            {error?.response?.data?.message ?? 'Error al cargar las suscripciones.'}
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs text-[#c9a84c] hover:underline"
          >
            Reintentar
          </button>
        </div>
      ) : suscripciones.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl py-16 text-center">
          <CreditCard size={28} className="mx-auto mb-3 text-slate-200 dark:text-white/10" />
          <p className="text-slate-400 dark:text-white/30 text-sm">No hay suscripciones{statusFilter ? ' con ese estado' : ''}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {suscripciones.map(s => (
            <SuscripcionRow key={s.id} s={s} />
          ))}
        </div>
      )}
    </div>
  );
}
