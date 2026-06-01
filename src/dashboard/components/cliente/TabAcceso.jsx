import { useState } from 'react';
import { Loader2, KeyRound, Mail, User, Trash2, Eye, EyeOff, ShieldCheck, UserPlus } from 'lucide-react';
import {
  useUsuarioCliente,
  useCrearUsuarioCliente,
  useEliminarUsuarioCliente,
} from '../../hooks/useClienteDetalle';

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputCls}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20 hover:text-slate-500 dark:hover:text-white/50 transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export default function TabAcceso({ cliente }) {
  const clienteId = cliente.id;
  const { data: usuario, isLoading } = useUsuarioCliente(clienteId);
  const guardar  = useCrearUsuarioCliente(clienteId); // POST/PUT — el backend hace upsert
  const eliminar = useEliminarUsuarioCliente(clienteId);

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [feedback, setFeedback] = useState('');
  const [isError, setIsError]   = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const showFeedback = (msg, error = false) => {
    setFeedback(msg);
    setIsError(error);
    setTimeout(() => setFeedback(''), 5000);
  };

  // Precarga el form con los datos actuales cuando ya existe usuario
  const initialEmail    = usuario?.email    ?? '';
  const initialName     = usuario?.name     ?? '';

  const handleGuardar = async () => {
    const email = form.email || initialEmail;
    if (!email) return;
    try {
      await guardar.mutateAsync({
        name:     form.name     || initialName,
        email,
        password: form.password || undefined,
      });
      setForm({ name: '', email: '', password: '' });
      showFeedback(usuario ? 'Acceso actualizado correctamente.' : 'Usuario creado. El cliente ya puede ingresar al portal.');
    } catch (e) {
      const msg = e.response?.data?.message
        ?? Object.values(e.response?.data?.errors ?? {})?.[0]?.[0]
        ?? 'Ocurrió un error.';
      showFeedback(msg, true);
    }
  };

  const handleEliminar = async () => {
    if (!confirm('¿Revocar el acceso al portal de este cliente?')) return;
    try {
      await eliminar.mutateAsync();
      setForm({ name: '', email: '', password: '' });
      showFeedback('Acceso revocado.');
    } catch (e) {
      showFeedback('Error al revocar el acceso.', true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 py-8">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Cargando…</span>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-5">

        {/* Estado actual */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
            usuario
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
              : 'bg-slate-100 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08]'
          }`}>
            {usuario
              ? <ShieldCheck size={22} className="text-emerald-600 dark:text-emerald-400" />
              : <UserPlus size={22} className="text-slate-300 dark:text-white/20" />
            }
          </div>
          <div>
            {usuario ? (
              <>
                <p className="text-sm font-semibold text-slate-800 dark:text-white/90">{usuario.name}</p>
                <p className="text-xs text-slate-400 dark:text-white/30">{usuario.email}</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-2 py-0.5 mt-1">
                  Portal activo
                </span>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-700 dark:text-white/70">Sin acceso al portal</p>
                <p className="text-xs text-slate-400 dark:text-white/30">
                  Completá los campos para dar acceso a {cliente.nombre}.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Formulario único */}
        <div className="space-y-3">
          {usuario && (
            <p className="text-xs text-slate-400 dark:text-white/30 bg-slate-50 dark:bg-white/[0.02] rounded-lg px-3 py-2">
              Dejá en blanco los campos que no quieras modificar.
            </p>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-white/40 mb-1.5">
              <User size={11} /> Nombre
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder={usuario?.name ?? cliente.nombre}
              className={inputCls}
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-white/40 mb-1.5">
              <Mail size={11} /> Email {!usuario && <span className="text-red-400">*</span>}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder={usuario?.email ?? 'cliente@empresa.com'}
              className={inputCls}
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-white/40 mb-1.5">
              <KeyRound size={11} /> Contraseña {!usuario && <span className="text-red-400">*</span>}
            </label>
            <PasswordInput
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder={usuario ? 'Dejar en blanco para no cambiar' : 'Mínimo 8 caracteres'}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleGuardar}
            disabled={guardar.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-xl py-2.5 transition-all"
          >
            {guardar.isPending ? <Loader2 size={14} className="animate-spin" /> : (usuario ? <KeyRound size={14} /> : <UserPlus size={14} />)}
            {usuario ? 'Guardar cambios' : 'Crear acceso al portal'}
          </button>

          {usuario && (
            <button
              onClick={handleEliminar}
              disabled={eliminar.isPending}
              className="flex items-center gap-2 text-sm font-medium border border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl px-4 transition-all"
            >
              {eliminar.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <p className={`text-xs px-3 py-2 rounded-lg ${
            isError
              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
          }`}>
            {feedback}
          </p>
        )}
      </div>

      {/* URL del portal */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl p-4 space-y-1.5">
        <p className="text-xs font-medium text-slate-400 dark:text-white/30">URL de acceso al portal</p>
        <code className="text-xs text-slate-600 dark:text-white/50 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-lg px-3 py-1.5 block">
          {window.location.origin}/dashboard/login
        </code>
        <p className="text-[11px] text-slate-300 dark:text-white/20">
          El cliente ingresa con su email y contraseña y es redirigido automáticamente al portal.
        </p>
      </div>
    </div>
  );
}
