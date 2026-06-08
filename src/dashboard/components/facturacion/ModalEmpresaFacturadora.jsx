import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Upload, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useCrearEmpresa, useActualizarEmpresa, useTestConexion } from '../../hooks/useEmpresasFacturadoras';

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';
const labelCls = 'block text-xs font-medium text-slate-500 dark:text-white/40 mb-1';

const EMPTY = {
  nombre: '', cuit: '', condicion_iva: 'RI', domicilio: '',
  punto_de_venta: '', email_from: '', ambiente: 'homologacion',
  activo: true, passphrase: '',
};

function validarCuit(cuit) {
  const limpio = cuit.replace(/[-\s]/g, '');
  if (!/^\d{11}$/.test(limpio)) return false;
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = multiplicadores.reduce((acc, m, i) => acc + m * Number(limpio[i]), 0);
  const resto = suma % 11;
  const verificador = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;
  return verificador === Number(limpio[10]);
}

function formatCuit(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}

export default function ModalEmpresaFacturadora({ empresa = null, onClose }) {
  const [form, setForm] = useState(empresa ? {
    nombre: empresa.nombre, cuit: empresa.cuit, condicion_iva: empresa.condicion_iva,
    domicilio: empresa.domicilio, punto_de_venta: empresa.punto_de_venta,
    email_from: empresa.email_from, ambiente: empresa.ambiente,
    activo: empresa.activo, passphrase: '',
  } : EMPTY);

  const [certFile, setCertFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [errors, setErrors] = useState({});

  const certRef = useRef();
  const keyRef = useRef();

  const crear = useCrearEmpresa();
  const actualizar = useActualizarEmpresa();
  const test = useTestConexion();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!validarCuit(form.cuit)) e.cuit = 'CUIT inválido';
    if (!form.domicilio.trim()) e.domicilio = 'Requerido';
    if (!form.punto_de_venta || form.punto_de_venta < 1 || form.punto_de_venta > 9998) e.punto_de_venta = '1 a 9998';
    if (!form.email_from.trim()) e.email_from = 'Requerido';
    if (!empresa && !certFile) e.certificado = 'Requerido';
    if (!empresa && !keyFile) e.clave_privada = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
    });
    if (certFile) fd.append('certificado', certFile);
    if (keyFile) fd.append('clave_privada', keyFile);
    return fd;
  };

  const handleSubmit = async () => {
    if (!validar()) return;
    const fd = buildFormData();
    if (empresa) {
      await actualizar.mutateAsync({ id: empresa.id, formData: fd });
    } else {
      await crear.mutateAsync(fd);
    }
    onClose();
  };

  const handleTest = async () => {
    if (!empresa?.id) return;
    setTestResult(null);
    const result = await test.mutateAsync(empresa.id).catch(e => ({
      ok: false, mensaje: e.response?.data?.mensaje ?? e.message,
    }));
    setTestResult(result);
  };

  const isPending = crear.isPending || actualizar.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {empresa ? 'Editar empresa facturadora' : 'Nueva empresa facturadora'}
          </h2>
          <button onClick={onClose} className="text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Datos generales */}
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Razón Social *</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre de la empresa" className={`${inputCls} ${errors.nombre ? 'border-red-400' : ''}`} />
              {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>CUIT *</label>
                <input
                  value={form.cuit}
                  onChange={e => set('cuit', formatCuit(e.target.value))}
                  placeholder="XX-XXXXXXXX-X"
                  className={`${inputCls} ${errors.cuit ? 'border-red-400' : form.cuit.length === 13 && validarCuit(form.cuit) ? 'border-emerald-400' : ''}`}
                />
                {errors.cuit && <p className="text-red-400 text-xs mt-1">{errors.cuit}</p>}
              </div>
              <div>
                <label className={labelCls}>Condición IVA *</label>
                <select value={form.condicion_iva} onChange={e => set('condicion_iva', e.target.value)} className={inputCls}>
                  <option value="RI" className="bg-white dark:bg-[#1a1a1a]">Responsable Inscripto</option>
                  <option value="M"  className="bg-white dark:bg-[#1a1a1a]">Monotributista</option>
                  <option value="EX" className="bg-white dark:bg-[#1a1a1a]">Exento</option>
                  <option value="CE" className="bg-white dark:bg-[#1a1a1a]">Consumidor Final</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Domicilio fiscal *</label>
              <input value={form.domicilio} onChange={e => set('domicilio', e.target.value)} placeholder="Dirección completa" className={`${inputCls} ${errors.domicilio ? 'border-red-400' : ''}`} />
              {errors.domicilio && <p className="text-red-400 text-xs mt-1">{errors.domicilio}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Punto de Venta *</label>
                <input
                  type="number" min="1" max="9998"
                  value={form.punto_de_venta}
                  onChange={e => set('punto_de_venta', e.target.value)}
                  placeholder="1"
                  className={`${inputCls} ${errors.punto_de_venta ? 'border-red-400' : ''}`}
                />
                {errors.punto_de_venta && <p className="text-red-400 text-xs mt-1">{errors.punto_de_venta}</p>}
              </div>
              <div>
                <label className={labelCls}>Email de envío *</label>
                <input type="email" value={form.email_from} onChange={e => set('email_from', e.target.value)} placeholder="facturacion@empresa.com" className={`${inputCls} ${errors.email_from ? 'border-red-400' : ''}`} />
                {errors.email_from && <p className="text-red-400 text-xs mt-1">{errors.email_from}</p>}
              </div>
            </div>

            <div>
              <label className={labelCls}>Ambiente *</label>
              <select value={form.ambiente} onChange={e => set('ambiente', e.target.value)} className={inputCls}>
                <option value="homologacion" className="bg-white dark:bg-[#1a1a1a]">Homologación (pruebas)</option>
                <option value="produccion"   className="bg-white dark:bg-[#1a1a1a]">Producción</option>
              </select>
              {form.ambiente === 'produccion' && (
                <p className="text-amber-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> Las facturas emitidas en producción son comprobantes fiscales reales.
                </p>
              )}
            </div>
          </div>

          {/* Archivos */}
          <div className="border-t border-slate-100 dark:border-white/[0.06] pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wide">Archivos AFIP</p>

            {/* Certificado */}
            <div>
              <label className={labelCls}>Certificado (.crt / .pem) {!empresa && '*'}</label>
              <div className="flex items-center gap-2">
                <input ref={certRef} type="file" accept=".crt,.pem,.cer" className="hidden" onChange={e => setCertFile(e.target.files?.[0] ?? null)} />
                <button
                  type="button"
                  onClick={() => certRef.current?.click()}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-all ${certFile ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-[#c9a84c]/40'}`}
                >
                  {certFile ? <CheckCircle2 size={12} /> : <Upload size={12} />}
                  {certFile ? certFile.name : empresa?.tiene_certificado ? '✓ Ya cargado — click para reemplazar' : 'Subir certificado'}
                </button>
              </div>
              {errors.certificado && <p className="text-red-400 text-xs mt-1">{errors.certificado}</p>}
            </div>

            {/* Clave privada */}
            <div>
              <label className={labelCls}>Clave privada (.key / .pem) {!empresa && '*'}</label>
              <div className="flex items-center gap-2">
                <input ref={keyRef} type="file" accept=".key,.pem" className="hidden" onChange={e => setKeyFile(e.target.files?.[0] ?? null)} />
                <button
                  type="button"
                  onClick={() => keyRef.current?.click()}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-all ${keyFile ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-[#c9a84c]/40'}`}
                >
                  {keyFile ? <CheckCircle2 size={12} /> : <Upload size={12} />}
                  {keyFile ? keyFile.name : empresa?.tiene_clave_privada ? '•••••• (ya cargada) — click para reemplazar' : 'Subir clave privada'}
                </button>
              </div>
              {errors.clave_privada && <p className="text-red-400 text-xs mt-1">{errors.clave_privada}</p>}
            </div>

            {/* Passphrase */}
            <div>
              <label className={labelCls}>Passphrase <span className="text-slate-300 dark:text-white/20">(solo si la clave la requiere)</span></label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.passphrase}
                  onChange={e => set('passphrase', e.target.value)}
                  placeholder="Dejar vacío si no aplica"
                  className={`${inputCls} pr-9`}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20 hover:text-slate-500 dark:hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          </div>

          {/* Test conexión (solo para empresas existentes) */}
          {empresa && (
            <div className="border-t border-slate-100 dark:border-white/[0.06] pt-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTest}
                  disabled={test.isPending}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-[#c9a84c]/40 hover:text-[#c9a84c] transition-all disabled:opacity-50"
                >
                  {test.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  Probar conexión WSAA
                </button>
                {testResult && (
                  <span className={`text-xs flex items-center gap-1 ${testResult.ok ? 'text-emerald-500' : 'text-red-400'}`}>
                    {testResult.ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {testResult.mensaje}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 dark:border-white/[0.06]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-xl py-2.5 transition-all"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {empresa ? 'Guardar cambios' : 'Crear empresa'}
          </button>
        </div>
      </div>
    </div>
  );
}
