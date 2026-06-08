import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useEmpresasFacturadoras } from '../../hooks/useEmpresasFacturadoras';
import { useEmitirFactura } from '../../hooks/useFacturasAfip';
import { toast } from 'react-toastify';

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';
const labelCls = 'block text-xs font-medium text-slate-500 dark:text-white/40 mb-1';

const IVA_OPCIONES = [
  { value: '21',   label: '21%' },
  { value: '10.5', label: '10.5%' },
  { value: '0',    label: '0% (Exento)' },
];

const COND_IVA_RECEPTOR = [
  'IVA Responsable Inscripto',
  'IVA Sujeto Exento',
  'Consumidor Final',
  'Responsable Monotributo',
  'Proveedor del Exterior',
  'Cliente del Exterior',
];

function calcularItem(item) {
  const cantidad = parseFloat(item.cantidad) || 0;
  const precio   = parseFloat(item.precio_unitario) || 0;
  const iva      = parseFloat(item.iva_porcentaje) || 0;
  const subtotalNeto = cantidad * precio;
  const importeIva   = subtotalNeto * (iva / 100);
  const subtotal     = subtotalNeto; // el subtotal que se muestra es neto
  return { ...item, subtotal: subtotalNeto.toFixed(2), importe_iva: importeIva.toFixed(2) };
}

const ITEM_VACIO = { descripcion: '', cantidad: '1', precio_unitario: '', iva_porcentaje: '21', subtotal: '0', importe_iva: '0' };

export default function ModalEmitirFactura({ cliente, onClose, onEmitida }) {
  const { data: empresas = [] } = useEmpresasFacturadoras();
  const empresasActivas = empresas.filter(e => e.activo && e.tiene_certificado && e.tiene_clave_privada);

  const [form, setForm] = useState({
    empresa_facturadora_id: '',
    tipo_comprobante: '11',
    concepto: '2',
    nombre_receptor: cliente?.nombre ?? '',
    cuit_receptor: '',
    condicion_iva_receptor: 'Consumidor Final',
    domicilio_receptor: '',
    moneda: 'PES',
    cotizacion: '1',
    cliente_pago_id: '',
  });
  const [items, setItems] = useState([{ ...ITEM_VACIO }]);

  const emitir = useEmitirFactura(cliente?.id);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Cuando cambia la empresa, ajustar tipo_comprobante según condición IVA
  useEffect(() => {
    const emp = empresasActivas.find(e => e.id === parseInt(form.empresa_facturadora_id));
    if (!emp) return;
    if (emp.condicion_iva === 'M') set('tipo_comprobante', '11'); // Monotributista → FC
    else if (emp.condicion_iva === 'RI') set('tipo_comprobante', '6'); // RI → FB por defecto
  }, [form.empresa_facturadora_id]);

  const setItem = (idx, k, v) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = calcularItem({ ...next[idx], [k]: v });
      return next;
    });
  };

  const addItem = () => setItems(prev => [...prev, { ...ITEM_VACIO }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  // Totales
  const empresa = empresasActivas.find(e => e.id === parseInt(form.empresa_facturadora_id));
  const esFC = form.tipo_comprobante === '11';

  const netoGravado = items.reduce((acc, it) => acc + (parseFloat(it.subtotal) || 0), 0);
  const totalIva    = esFC ? 0 : items.reduce((acc, it) => acc + (parseFloat(it.importe_iva) || 0), 0);
  const total       = esFC ? netoGravado : netoGravado + totalIva;

  const handleSubmit = async () => {
    if (!form.empresa_facturadora_id) { toast.error('Seleccioná una empresa emisora.'); return; }
    if (!form.nombre_receptor.trim()) { toast.error('Ingresá el nombre del receptor.'); return; }
    if (items.some(it => !it.descripcion.trim() || !it.precio_unitario)) {
      toast.error('Completá todos los ítems.');
      return;
    }

    try {
      const payload = {
        ...form,
        tipo_comprobante: parseInt(form.tipo_comprobante),
        concepto: parseInt(form.concepto),
        items: items.map(it => ({
          descripcion:     it.descripcion,
          cantidad:        parseFloat(it.cantidad),
          precio_unitario: parseFloat(it.precio_unitario),
          iva_porcentaje:  parseFloat(it.iva_porcentaje),
          subtotal:        parseFloat(it.subtotal),
          importe_iva:     parseFloat(it.importe_iva),
        })),
        cliente_pago_id: form.cliente_pago_id || undefined,
        cuit_receptor: form.cuit_receptor || undefined,
        domicilio_receptor: form.domicilio_receptor || undefined,
      };

      const factura = await emitir.mutateAsync(payload);
      toast.success(`Factura emitida — CAE: ${factura.cae}`);
      onEmitida?.(factura);
      onClose();
    } catch (e) {
      const msg = e.response?.data?.message ?? e.response?.data?.error_mensaje ?? 'Error al emitir la factura.';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Emitir Factura AFIP</h2>
            {cliente && <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">{cliente.nombre}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Empresa + tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Empresa emisora *</label>
              <select value={form.empresa_facturadora_id} onChange={e => set('empresa_facturadora_id', e.target.value)} className={inputCls}>
                <option value="" className="bg-white dark:bg-[#1a1a1a]">Seleccionar…</option>
                {empresasActivas.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-white dark:bg-[#1a1a1a]">
                    {emp.nombre} — {emp.ambiente === 'produccion' ? '🔴 Producción' : '🟡 Homologación'}
                  </option>
                ))}
              </select>
              {empresasActivas.length === 0 && (
                <p className="text-amber-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} /> No hay empresas configuradas con cert+clave.</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Tipo de comprobante *</label>
              <select value={form.tipo_comprobante} onChange={e => set('tipo_comprobante', e.target.value)} className={inputCls} disabled={empresa?.condicion_iva === 'M'}>
                <option value="6"  className="bg-white dark:bg-[#1a1a1a]">Factura B</option>
                <option value="1"  className="bg-white dark:bg-[#1a1a1a]">Factura A</option>
                <option value="11" className="bg-white dark:bg-[#1a1a1a]">Factura C (Monotributista)</option>
              </select>
            </div>
          </div>

          {/* Receptor */}
          <div className="border-t border-slate-100 dark:border-white/[0.06] pt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wide mb-3">Datos del receptor</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Nombre / Razón Social *</label>
                  <input value={form.nombre_receptor} onChange={e => set('nombre_receptor', e.target.value)} className={inputCls} placeholder="Nombre completo o razón social" />
                </div>
                <div>
                  <label className={labelCls}>CUIT {form.tipo_comprobante === '1' ? '*' : ''}</label>
                  <input
                    value={form.cuit_receptor}
                    onChange={e => set('cuit_receptor', e.target.value)}
                    className={inputCls}
                    placeholder="XX-XXXXXXXX-X"
                  />
                </div>
                <div>
                  <label className={labelCls}>Condición IVA receptor *</label>
                  <select value={form.condicion_iva_receptor} onChange={e => set('condicion_iva_receptor', e.target.value)} className={inputCls}>
                    {COND_IVA_RECEPTOR.map(c => <option key={c} value={c} className="bg-white dark:bg-[#1a1a1a]">{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Domicilio</label>
                  <input value={form.domicilio_receptor} onChange={e => set('domicilio_receptor', e.target.value)} className={inputCls} placeholder="Opcional" />
                </div>
              </div>
            </div>
          </div>

          {/* Ítems */}
          <div className="border-t border-slate-100 dark:border-white/[0.06] pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wide">Ítems</p>
              <button onClick={addItem} className="flex items-center gap-1 text-xs text-[#c9a84c] hover:text-[#d4b560] transition-colors">
                <Plus size={12} /> Agregar ítem
              </button>
            </div>
            <div className="space-y-2">
              {/* Header tabla */}
              <div className={`grid gap-2 text-[10px] font-semibold text-slate-400 dark:text-white/30 uppercase tracking-wide px-1 ${esFC ? 'grid-cols-[1fr_60px_100px_80px_24px]' : 'grid-cols-[1fr_60px_100px_60px_80px_24px]'}`}>
                <span>Descripción</span>
                <span>Cant.</span>
                <span>Precio unit.</span>
                {!esFC && <span>IVA</span>}
                <span>Subtotal</span>
                <span></span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className={`grid gap-2 items-center ${esFC ? 'grid-cols-[1fr_60px_100px_80px_24px]' : 'grid-cols-[1fr_60px_100px_60px_80px_24px]'}`}>
                  <input value={item.descripcion} onChange={e => setItem(idx, 'descripcion', e.target.value)} placeholder="Descripción del servicio" className={inputCls} />
                  <input type="number" min="0.01" step="0.01" value={item.cantidad} onChange={e => setItem(idx, 'cantidad', e.target.value)} className={inputCls} />
                  <input type="number" min="0" step="0.01" value={item.precio_unitario} onChange={e => setItem(idx, 'precio_unitario', e.target.value)} placeholder="0.00" className={inputCls} />
                  {!esFC && (
                    <select value={item.iva_porcentaje} onChange={e => setItem(idx, 'iva_porcentaje', e.target.value)} className={inputCls}>
                      {IVA_OPCIONES.map(o => <option key={o.value} value={o.value} className="bg-white dark:bg-[#1a1a1a]">{o.label}</option>)}
                    </select>
                  )}
                  <div className="text-xs text-slate-500 dark:text-white/40 text-right">
                    ${parseFloat(item.subtotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                  <button onClick={() => removeItem(idx)} disabled={items.length === 1} className="text-slate-200 dark:text-white/10 hover:text-red-400 transition-colors disabled:opacity-30">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Moneda + totales */}
          <div className="border-t border-slate-100 dark:border-white/[0.06] pt-4 flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div>
                <label className={labelCls}>Moneda</label>
                <select value={form.moneda} onChange={e => set('moneda', e.target.value)} className={`${inputCls} w-24`}>
                  <option value="PES" className="bg-white dark:bg-[#1a1a1a]">ARS</option>
                  <option value="DOL" className="bg-white dark:bg-[#1a1a1a]">USD</option>
                </select>
              </div>
              {form.moneda === 'DOL' && (
                <div>
                  <label className={labelCls}>Cotización</label>
                  <input type="number" min="0" step="0.01" value={form.cotizacion} onChange={e => set('cotizacion', e.target.value)} className={`${inputCls} w-28`} />
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl p-4 min-w-[200px] space-y-1.5">
              {!esFC && (
                <>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-white/40">
                    <span>Neto gravado</span>
                    <span>${netoGravado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-white/40">
                    <span>IVA</span>
                    <span>${totalIva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/[0.08] pt-1.5 mt-1.5">
                <span>TOTAL {form.moneda === 'DOL' ? 'USD' : 'ARS'}</span>
                <span>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 dark:border-white/[0.06]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={emitir.isPending || !form.empresa_facturadora_id}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-xl py-2.5 transition-all"
          >
            {emitir.isPending ? (
              <><Loader2 size={13} className="animate-spin" /> Comunicando con ARCA…</>
            ) : (
              'Emitir Factura →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
