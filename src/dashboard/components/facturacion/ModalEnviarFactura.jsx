import { useState } from 'react';
import { X, Loader2, Mail, Plus, FileText } from 'lucide-react';
import { useEnviarFacturaEmail } from '../../hooks/useFacturasAfip';
import { toast } from 'react-toastify';

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';
const labelCls = 'block text-xs font-medium text-slate-500 dark:text-white/40 mb-1';

function EmailChips({ emails, onChange, placeholder }) {
  const [input, setInput] = useState('');

  const add = () => {
    const email = input.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (!emails.includes(email)) onChange([...emails, email]);
    setInput('');
  };

  const remove = (e) => onChange(emails.filter(x => x !== e));

  return (
    <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg p-2 focus-within:border-[#c9a84c]/60 focus-within:ring-1 focus-within:ring-[#c9a84c]/20 transition-all min-h-[40px]">
      {emails.map(e => (
        <span key={e} className="flex items-center gap-1 bg-[#c9a84c]/20 text-[#c9a84c] text-xs px-2 py-0.5 rounded-full">
          {e}
          <button type="button" onClick={() => remove(e)} className="hover:text-red-400 transition-colors leading-none">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={emails.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[160px] bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none"
      />
    </div>
  );
}

export default function ModalEnviarFactura({ factura, cliente, onClose }) {
  const nombreArchivo = `Factura-${factura.tipo_label ?? factura.tipoLabel}-${factura.numero_formateado ?? factura.numeroFormateado}.pdf`
    .replace(/undefined/g, factura.id);

  const asuntoDefault = `${factura.tipo_label ?? 'Factura'} ${factura.numero_formateado ?? ''} — ${factura.empresa?.nombre ?? ''}`.trim();

  const mensajeDefault = `Estimado/a ${cliente?.nombre ?? factura.nombre_receptor},\n\nAdjunto encontrará el comprobante correspondiente.\n\nQuedamos a disposición ante cualquier consulta.\n\nSaludos,\n${factura.empresa?.nombre ?? ''}`;

  const [emails, setEmails]   = useState(cliente?.email_contacto ? [cliente.email_contacto] : []);
  const [cc, setCc]           = useState([]);
  const [asunto, setAsunto]   = useState(asuntoDefault);
  const [mensaje, setMensaje] = useState(mensajeDefault);

  const enviar = useEnviarFacturaEmail();

  const handleSend = async () => {
    if (emails.length === 0) { toast.error('Agregá al menos un destinatario.'); return; }
    if (!asunto.trim()) { toast.error('El asunto es requerido.'); return; }

    try {
      await enviar.mutateAsync({ facturaId: factura.id, emails, cc, asunto, mensaje });
      toast.success('Factura enviada correctamente.');
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Error al enviar el email.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-[#c9a84c]" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Enviar factura por email</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Para *</label>
            <EmailChips emails={emails} onChange={setEmails} placeholder="email@destinatario.com — Enter para agregar" />
          </div>

          <div>
            <label className={labelCls}>CC <span className="text-slate-300 dark:text-white/20">(opcional)</span></label>
            <EmailChips emails={cc} onChange={setCc} placeholder="cc@destinatario.com" />
          </div>

          <div>
            <label className={labelCls}>Asunto *</label>
            <input value={asunto} onChange={e => setAsunto(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Mensaje</label>
            <textarea
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              rows={6}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Adjunto */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
              <FileText size={14} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-white/70 truncate">{nombreArchivo}</p>
              <p className="text-xs text-slate-400 dark:text-white/30">PDF — adjunto automáticamente</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 dark:border-white/[0.06]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={enviar.isPending || emails.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-xl py-2.5 transition-all"
          >
            {enviar.isPending ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
            {enviar.isPending ? 'Enviando…' : 'Enviar factura'}
          </button>
        </div>
      </div>
    </div>
  );
}
