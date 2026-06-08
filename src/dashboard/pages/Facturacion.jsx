import { useState } from 'react';
import { Receipt, Settings2, Plus, Download, Mail, Trash2, Loader2, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
import { useFacturasAfip, useDescargarPdfFactura } from '../hooks/useFacturasAfip';
import { useEmpresasFacturadoras, useEliminarEmpresa, useTestConexion } from '../hooks/useEmpresasFacturadoras';
import ModalEmpresaFacturadora from '../components/facturacion/ModalEmpresaFacturadora';
import ModalEnviarFactura from '../components/facturacion/ModalEnviarFactura';
import { toast } from 'react-toastify';

const TABS = [
  { id: 'facturas',       label: 'Facturas',      icon: Receipt },
  { id: 'configuracion',  label: 'Configuración', icon: Settings2 },
];

const ESTADO_FACTURA = {
  emitida:  { label: 'Emitida',  cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  pendiente:{ label: 'Pendiente',cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  error:    { label: 'Error',    cls: 'bg-red-50 dark:bg-red-500/10 text-red-500' },
};

function TabFacturas() {
  const [filters, setFilters] = useState({});
  const { data, isLoading } = useFacturasAfip(filters);
  const descargar = useDescargarPdfFactura();
  const [facturaEnvio, setFacturaEnvio] = useState(null);

  const facturas = data?.data ?? [];

  return (
    <>
      {facturaEnvio && (
        <ModalEnviarFactura
          factura={facturaEnvio}
          cliente={facturaEnvio.cliente}
          onClose={() => setFacturaEnvio(null)}
        />
      )}

      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filters.estado ?? ''}
            onChange={e => setFilters(f => ({ ...f, estado: e.target.value || undefined }))}
            className="text-xs bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-slate-700 dark:text-white/70 outline-none focus:border-[#c9a84c]/60 transition-all"
          >
            <option value="">Todos los estados</option>
            <option value="emitida">Emitida</option>
            <option value="pendiente">Pendiente</option>
            <option value="error">Error</option>
          </select>
          <input
            type="date"
            value={filters.desde ?? ''}
            onChange={e => setFilters(f => ({ ...f, desde: e.target.value || undefined }))}
            className="text-xs bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-slate-700 dark:text-white/70 outline-none focus:border-[#c9a84c]/60 transition-all"
          />
          <input
            type="date"
            value={filters.hasta ?? ''}
            onChange={e => setFilters(f => ({ ...f, hasta: e.target.value || undefined }))}
            className="text-xs bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-slate-700 dark:text-white/70 outline-none focus:border-[#c9a84c]/60 transition-all"
          />
          {Object.keys(filters).length > 0 && (
            <button onClick={() => setFilters({})} className="text-xs text-slate-400 dark:text-white/40 hover:text-red-400 transition-colors">
              Limpiar filtros
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/40 py-8">
            <Loader2 size={14} className="animate-spin" /><span className="text-sm">Cargando facturas…</span>
          </div>
        ) : facturas.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-16 text-center">
            <Receipt size={32} className="mx-auto mb-3 text-slate-200 dark:text-white/10" />
            <p className="text-slate-400 dark:text-white/30 text-sm">Sin facturas emitidas.</p>
            <p className="text-slate-300 dark:text-white/20 text-xs mt-1">Las facturas AFIP aparecerán aquí una vez emitidas desde el detalle de cada cliente.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                  {['Fecha', 'Empresa', 'Cliente', 'Tipo', 'Número', 'Total', 'Estado', 'CAE', ''].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-slate-400 dark:text-white/30 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facturas.map(f => (
                  <tr key={f.id} className="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3 text-slate-500 dark:text-white/50 whitespace-nowrap">
                      {f.fecha_emision ? new Date(f.fecha_emision).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-white/70 max-w-[140px] truncate">{f.empresa?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-white/70 max-w-[140px] truncate">{f.cliente?.nombre ?? f.nombre_receptor}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-white/50">
                      {f.tipo_comprobante === 1 ? 'FA' : f.tipo_comprobante === 6 ? 'FB' : 'FC'}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-white/60 text-xs">
                      {f.numero_formateado ?? f.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      ARS ${Number(f.importe_total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ESTADO_FACTURA[f.estado]?.cls ?? ''}`}>
                        {ESTADO_FACTURA[f.estado]?.label ?? f.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400 dark:text-white/30">{f.cae ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => descargar.mutate({ facturaId: f.id, nombre: `Factura-${f.id}.pdf` })}
                          className="p-1.5 rounded-lg text-slate-300 dark:text-white/20 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all"
                          title="Descargar PDF"
                        >
                          <Download size={13} />
                        </button>
                        {f.estado === 'emitida' && (
                          <button
                            onClick={() => setFacturaEnvio(f)}
                            className="p-1.5 rounded-lg text-slate-300 dark:text-white/20 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-all"
                            title="Enviar por email"
                          >
                            <Mail size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function TabConfiguracion() {
  const { data: empresas = [], isLoading } = useEmpresasFacturadoras();
  const eliminar = useEliminarEmpresa();
  const test = useTestConexion();
  const [modal, setModal] = useState(null); // null | 'nueva' | empresa

  const [testResults, setTestResults] = useState({});

  const handleTest = async (emp) => {
    setTestResults(r => ({ ...r, [emp.id]: null }));
    const result = await test.mutateAsync(emp.id).catch(e => ({
      ok: false, mensaje: e.response?.data?.mensaje ?? e.message,
    }));
    setTestResults(r => ({ ...r, [emp.id]: result }));
  };

  const handleEliminar = async (emp) => {
    if (!window.confirm(`¿Eliminar la empresa "${emp.nombre}"? Esta acción no se puede deshacer.`)) return;
    await eliminar.mutateAsync(emp.id);
    toast.success('Empresa eliminada.');
  };

  return (
    <>
      {modal && (
        <ModalEmpresaFacturadora
          empresa={modal === 'nueva' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 dark:text-white/40">
            Configurá las empresas que pueden emitir facturas electrónicas.
          </p>
          <button
            onClick={() => setModal('nueva')}
            className="flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-xs font-semibold rounded-lg px-3 py-2 transition-all"
          >
            <Plus size={13} /> Nueva empresa
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/40 py-8">
            <Loader2 size={14} className="animate-spin" /><span className="text-sm">Cargando…</span>
          </div>
        ) : empresas.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-16 text-center">
            <Settings2 size={32} className="mx-auto mb-3 text-slate-200 dark:text-white/10" />
            <p className="text-slate-400 dark:text-white/30 text-sm">Sin empresas configuradas.</p>
            <p className="text-slate-300 dark:text-white/20 text-xs mt-1">Agregá una empresa con su certificado y clave privada de AFIP para empezar.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {empresas.map(emp => (
              <div key={emp.id} className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{emp.nombre}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${emp.activo ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-white/30'}`}>
                        {emp.activo ? 'Activa' : 'Inactiva'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${emp.ambiente === 'produccion' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                        {emp.ambiente === 'produccion' ? '🔴 Producción' : '🟡 Homologación'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-white/40">
                      <span>CUIT {emp.cuit}</span>
                      <span>PV {String(emp.punto_de_venta).padStart(4, '0')}</span>
                      <span>{emp.condicion_iva}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] flex items-center gap-1 ${emp.tiene_certificado ? 'text-emerald-500' : 'text-red-400'}`}>
                        {emp.tiene_certificado ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                        Certificado
                      </span>
                      <span className={`text-[10px] flex items-center gap-1 ${emp.tiene_clave_privada ? 'text-emerald-500' : 'text-red-400'}`}>
                        {emp.tiene_clave_privada ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                        Clave privada
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTest(emp)}
                      disabled={test.isPending}
                      className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:border-[#c9a84c]/40 hover:text-[#c9a84c] rounded-lg px-2.5 py-1.5 transition-all disabled:opacity-50"
                    >
                      {test.isPending ? <Loader2 size={11} className="animate-spin" /> : null}
                      Probar
                    </button>
                    <button
                      onClick={() => setModal(emp)}
                      className="p-1.5 rounded-lg text-slate-300 dark:text-white/20 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleEliminar(emp)}
                      className="p-1.5 rounded-lg text-slate-200 dark:text-white/10 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {testResults[emp.id] && (
                  <div className={`mt-3 text-xs flex items-center gap-1.5 ${testResults[emp.id].ok ? 'text-emerald-500' : 'text-red-400'}`}>
                    {testResults[emp.id].ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {testResults[emp.id].mensaje}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function Facturacion() {
  const [tab, setTab] = useState('facturas');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Facturación</h1>
        <p className="text-sm text-slate-400 dark:text-white/40 mt-1">Emisión de comprobantes electrónicos AFIP / ARCA</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-white/[0.04] rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'facturas'      && <TabFacturas />}
      {tab === 'configuracion' && <TabConfiguracion />}
    </div>
  );
}
