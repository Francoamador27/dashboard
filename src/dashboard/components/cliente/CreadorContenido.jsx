import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, Download, Plus, Trash2, Loader2,
  Upload, X, Eye, EyeOff, Move, ChevronDown,
  AlignLeft, AlignCenter, AlignRight, Save, CheckCircle2,
  BookMarked,
} from 'lucide-react';
import {
  useCreadorPlantillas,
  useCreadorPlantillaDetalle,
  useCrearCreadorPlantilla,
  useActualizarCreadorPlantilla,
  useEliminarCreadorPlantilla,
} from '../../hooks/useCreadorPlantillas';
import { imageUrl } from '../../hooks/useGaleria';

// ─── Constantes ───────────────────────────────────────────────────────────────
const TIPOS = {
  historia:  { label: 'Historia',   sub: '9:16',  w: 1080, h: 1920, icon: '📱' },
  feed:      { label: 'Feed 1:1',   sub: '1:1',   w: 1080, h: 1080, icon: '⬜' },
  feed45:    { label: 'Feed 4:5',   sub: '4:5',   w: 1080, h: 1350, icon: '📷' },
  landscape: { label: 'Landscape',  sub: '16:9',  w: 1920, h: 1080, icon: '🖥' },
};

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=DM+Sans:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;700;800;900&family=Poppins:wght@400;700;800;900&family=Nunito:wght@700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap';

// Promise que resuelve cuando el CSS de Google Fonts terminó de cargar
let _gfontsReady = null;
function ensureGFontsLoaded() {
  if (_gfontsReady) return _gfontsReady;
  _gfontsReady = new Promise(resolve => {
    const id = 'creador-gfonts';
    const existing = document.getElementById(id);
    if (existing) { resolve(); return; }
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet'; link.href = GOOGLE_FONTS_URL;
    link.onload  = resolve;
    link.onerror = resolve;
    document.head.appendChild(link);
  });
  return _gfontsReady;
}

const FONTS = [
  // ── Fuentes premium solicitadas ────────────────────────────────────────────
  { value: '"Cormorant Garamond",Georgia,serif',                            label: 'Cormorant Garamond',    fontWeight: 400 },
  { value: 'Inter,-apple-system,BlinkMacSystemFont,sans-serif',            label: 'Inter Medium',          fontWeight: 500 },
  { value: 'Inter,-apple-system,BlinkMacSystemFont,sans-serif',            label: 'Inter Light',           fontWeight: 300 },
  { value: 'Montserrat,sans-serif',                                        label: 'Montserrat ExtraBold',  fontWeight: 800 },
  { value: 'Poppins,sans-serif',                                           label: 'Poppins ExtraBold',     fontWeight: 800 },
  { value: '"Gotham Bold","Gotham","Century Gothic","Trebuchet MS",sans-serif', label: 'Gotham Bold',      fontWeight: 700 },
  { value: '"Gotham Black","Gotham","Century Gothic",Impact,sans-serif',   label: 'Gotham Black',          fontWeight: 900 },
  { value: '"Avenir Next","Avenir","Nunito",sans-serif',                   label: 'Avenir Next Heavy',     fontWeight: 900 },
  { value: '"Proxima Nova Bold","Proxima Nova","Proxima Nova Regular","Montserrat",sans-serif', label: 'Proxima Nova Bold', fontWeight: 700 },
  // ── Fuentes generales ─────────────────────────────────────────────────────
  { value: '"Suisse Intl","Inter",-apple-system,sans-serif',               label: "Suisse Int'l" },
  { value: '"Neue Haas Grotesk Display Pro","DM Sans","Helvetica Neue",Helvetica,Arial,sans-serif', label: 'Neue Haas Grotesk' },
  { value: 'Inter,-apple-system,BlinkMacSystemFont,sans-serif',            label: 'Inter' },
  { value: '"DM Sans",sans-serif',                                          label: 'DM Sans' },
  { value: 'Arial,Helvetica,sans-serif',                                    label: 'Arial' },
  { value: 'Georgia,"Times New Roman",serif',                               label: 'Georgia' },
  { value: 'Impact,Haettenschweiler,sans-serif',                            label: 'Impact' },
  { value: 'Verdana,Geneva,sans-serif',                                     label: 'Verdana' },
  { value: '"Times New Roman",Times,serif',                                 label: 'Times New Roman' },
  { value: '"Courier New",Courier,monospace',                               label: 'Courier New' },
];

const DEFAULT_BLOBS = [
  { id: 1, x: 3,  y: 3,  size: 50, color: '#00DDFF', opacity: 0.50 },
  { id: 2, x: 88, y: 5,  size: 38, color: '#00FFEE', opacity: 0.35 },
  { id: 3, x: 5,  y: 90, size: 45, color: '#00CCFF', opacity: 0.40 },
  { id: 4, x: 90, y: 92, size: 35, color: '#00EEFF', opacity: 0.28 },
];

const WEIGHTS = [
  { value: 100, label: '100 — Thin' },
  { value: 200, label: '200 — ExtraLight' },
  { value: 300, label: '300 — Light' },
  { value: 400, label: '400 — Regular' },
  { value: 500, label: '500 — Medium' },
  { value: 600, label: '600 — SemiBold' },
  { value: 700, label: '700 — Bold' },
  { value: 800, label: '800 — ExtraBold' },
  { value: 900, label: '900 — Black' },
];

const DEFAULT_BLOQUE = {
  nombre: 'Texto',
  texto: '',
  font: 'Inter,-apple-system,BlinkMacSystemFont,sans-serif',
  fontWeight: 400,
  size: 64,
  color: '#000000',
  bold: false,
  italic: false,
  uppercase: false,
  lineHeight: 1.4,
  letterSpacing: 0,
  x: 10,
  y: 15,
  maxWidthPct: 80,
  textAlign: 'left',
  visible: true,
  hasBg: false,
  bgColor: '#000000',
  bgOpacity: 1,
  bgBorderRadius: 0,
  bgPaddingX: 30,
  bgPaddingY: 15,
  hasShadow: false,
  shadowColor: '#000000',
  shadowOpacity: 0.4,
  shadowBlur: 20,
  shadowX: 0,
  shadowY: 6,
  strokeColor: null,
  strokeWidth: 2,
  strokeOnly: false,
};

let _uid = 20;
function newBloque(extra = {}) { return { id: _uid++, ...DEFAULT_BLOQUE, ...extra }; }
function newBlob() { return { id: _uid++, x: 50, y: 50, size: 40, color: '#00DDFF', opacity: 0.4 }; }

const DEFAULT_BOTON = {
  nombre: 'Botón', tipo: 'boton', texto: 'Empezá ahora',
  font: 'Inter,-apple-system,BlinkMacSystemFont,sans-serif', fontWeight: 700,
  size: 42, color: '#FFFFFF', bold: true, italic: false, uppercase: false,
  lineHeight: 1.2, letterSpacing: 0,
  x: 10, y: 80, visible: true,
  bgColor: '#c9a84c', bgOpacity: 1, bgBorderRadius: 50,
  bgPaddingX: 70, bgPaddingY: 28,
  hasShadow: false, shadowColor: '#000000', shadowOpacity: 0.3,
  shadowBlur: 24, shadowX: 0, shadowY: 8,
};
function newBoton(extra = {}) { return { id: _uid++, ...DEFAULT_BOTON, ...extra }; }

const DEFAULT_LINE = {
  tipo: 'linea', nombre: 'Línea',
  x: 10, y: 50, length: 80, thickness: 4,
  color: '#111111', rotation: 0, visible: true,
};
function newLine(extra = {}) { return { id: _uid++, ...DEFAULT_LINE, ...extra }; }

function drawCoverImage(ctx, img, d, posX = 50, posY = 50) {
  const ir = img.width / img.height, cr = d.w / d.h;
  let dw2, dh2, dx, dy;
  const pX = posX / 100, pY = posY / 100;
  if (ir > cr) { dh2 = d.h; dw2 = dh2 * ir; dx = (d.w - dw2) * pX; dy = 0; }
  else { dw2 = d.w; dh2 = dw2 / ir; dx = 0; dy = (d.h - dh2) * pY; }
  ctx.drawImage(img, dx, dy, dw2, dh2);
}

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');

function toProxyUrl(url) {
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const match = url.match(/\/storage\/(.+)/);
  if (match) return `${API_BASE}/api/portal/storage-proxy?path=${encodeURIComponent(match[1])}`;
  return url;
}

// Carga una imagen para canvas via proxy (con CORS headers)
async function loadImageForCanvas(url) {
  if (!url) return null;
  const isBlobOrData = url.startsWith('blob:') || url.startsWith('data:');
  const src = isBlobOrData ? url : toProxyUrl(url);

  return new Promise(resolve => {
    const img = new Image();
    if (!isBlobOrData) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Genera un thumbnail JPEG a partir del estado del editor (máx 320px ancho)
async function generateThumbnail(formato, estadoEditor) {
  const full = document.createElement('canvas');
  await renderToCanvas(full, { tipo: formato, ...estadoEditor });
  const d    = TIPOS[formato];
  const maxW = 320;
  const scale = maxW / d.w;
  const tw = maxW;
  const th = Math.round(d.h * scale);
  const thumb = document.createElement('canvas');
  thumb.width  = tw;
  thumb.height = th;
  try {
    thumb.getContext('2d').drawImage(full, 0, 0, tw, th);
    return new Promise(resolve => thumb.toBlob(resolve, 'image/jpeg', 0.82));
  } catch { return null; } // canvas tainted por CORS: guardar sin thumbnail
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexAlpha(hex, a) {
  let h = (hex || '#000000').replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const r = parseInt(h.slice(0,2),16)||0;
  const g = parseInt(h.slice(2,4),16)||0;
  const b = parseInt(h.slice(4,6),16)||0;
  return `rgba(${r},${g},${b},${a})`;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(Math.abs(r), Math.abs(w)/2, Math.abs(h)/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.lineTo(x+w-rr, y); ctx.arcTo(x+w, y, x+w, y+rr, rr);
  ctx.lineTo(x+w, y+h-rr); ctx.arcTo(x+w, y+h, x+w-rr, y+h, rr);
  ctx.lineTo(x+rr, y+h); ctx.arcTo(x, y+h, x, y+h-rr, rr);
  ctx.lineTo(x, y+rr); ctx.arcTo(x, y, x+rr, y, rr);
  ctx.closePath();
}

function getWrappedLines(ctx, text, maxW) {
  const lines = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) { lines.push(''); continue; }
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line.trimEnd()); line = word + ' ';
      } else line = test;
    }
    if (line.trim()) lines.push(line.trimEnd());
  }
  return lines;
}

// ─── Canvas render ────────────────────────────────────────────────────────────
async function renderBlobsCanvas(ctx, blobs, dw, dh) {
  for (const blob of blobs) {
    const bx = (blob.x / 100) * dw;
    const by = (blob.y / 100) * dh;
    const br = (blob.size / 100) * Math.max(dw, dh) * 0.75;
    const gr = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    gr.addColorStop(0, hexAlpha(blob.color, blob.opacity));
    gr.addColorStop(0.5, hexAlpha(blob.color, blob.opacity * 0.35));
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, dw, dh);
  }
}

async function renderToCanvas(canvas, { tipo, templateConfig, bloques }) {
  // 1. Esperar que el CSS de Google Fonts esté cargado
  await ensureGFontsLoaded();

  // 2. Forzar descarga de cada fuente usada creando elementos DOM ocultos
  //    (el browser solo descarga fuentes referenciadas en el DOM)
  const families = [...new Set(bloques.map(b => b.font.split(',')[0].replace(/"/g, '').trim()))];
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;';
  bloques.forEach(b => {
    const span = document.createElement('span');
    const family = b.font.split(',')[0].replace(/"/g, '').trim();
    span.style.cssText = `font-family:"${family}";font-weight:${b.fontWeight ?? 400};font-size:${b.size ?? 16}px;`;
    span.textContent = 'A';
    sentinel.appendChild(span);
  });
  document.body.appendChild(sentinel);
  await document.fonts.ready;
  await Promise.all(
    families.map(fam => document.fonts.load(`${400} 16px "${fam}"`).catch(() => null))
  );
  document.body.removeChild(sentinel);
  const d = TIPOS[tipo];
  canvas.width = d.w; canvas.height = d.h;
  const ctx = canvas.getContext('2d');

  // ── Fondo base ────────────────────────────────────────────────────────────
  const bgPX = templateConfig.bgPositionX ?? 50;
  const bgPY = templateConfig.bgPositionY ?? 50;
  if (templateConfig.type === 'editorial') {
    const splitY = d.h * (templateConfig.splitRatio ?? 0.42);
    // Full photo as background — white section overlays on top
    if (templateConfig.bgUrl) {
      const img = await loadImageForCanvas(templateConfig.bgUrl);
      if (img) { drawCoverImage(ctx, img, d, bgPX, bgPY); }
      else { ctx.fillStyle = '#666'; ctx.fillRect(0, 0, d.w, d.h); }
    } else { ctx.fillStyle = '#666'; ctx.fillRect(0, 0, d.w, d.h); }
    if (splitY > 0) {
      // White top section (with configurable opacity)
      const topOp = (templateConfig.topOpacity ?? 100) / 100;
      ctx.globalAlpha = topOp;
      ctx.fillStyle = templateConfig.topColor ?? '#F5F4F0';
      ctx.fillRect(0, 0, d.w, splitY);
      ctx.globalAlpha = 1;
      // Separator line
      const lt = templateConfig.lineThickness ?? 3;
      if (lt > 0) {
        ctx.fillStyle = templateConfig.lineColor ?? '#111111';
        ctx.fillRect(0, splitY, d.w, lt);
      }
    }
  } else if (templateConfig.bgUrl) {
    const img = await loadImageForCanvas(templateConfig.bgUrl);
    if (img) { drawCoverImage(ctx, img, d, bgPX, bgPY); }
    else { ctx.fillStyle = '#111'; ctx.fillRect(0, 0, d.w, d.h); }
  } else if (templateConfig.type === 'gradiente') {
    ctx.fillStyle = templateConfig.bgColor || '#FFFFFF';
    ctx.fillRect(0, 0, d.w, d.h);
  } else {
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, d.w, d.h);
  }

  // ── Overlay oscuro ────────────────────────────────────────────────────────
  if ((templateConfig.overlayOpacity || 0) > 0) {
    if (templateConfig.type === 'editorial') {
      const splitYOv = d.h * (templateConfig.splitRatio ?? 0.42);
      ctx.fillStyle = hexAlpha('#000', templateConfig.overlayOpacity);
      ctx.fillRect(0, splitYOv, d.w, d.h - splitYOv);
    } else {
      ctx.fillStyle = hexAlpha('#000', templateConfig.overlayOpacity);
      ctx.fillRect(0, 0, d.w, d.h);
    }
  }

  // ── Degradé inferior (plantilla sombreada) ────────────────────────────────
  if (templateConfig.type === 'imagen') {
    const gradStart = d.h * 0.5;
    const bottomGrad = ctx.createLinearGradient(0, gradStart, 0, d.h);
    bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
    bottomGrad.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, gradStart, d.w, d.h - gradStart);
  }

  // ── Manchas ───────────────────────────────────────────────────────────────
  await renderBlobsCanvas(ctx, templateConfig.blobs || [], d.w, d.h);

  // Textos, botones y líneas
  for (const b of bloques) {
    if (!b.visible) continue;

    // ── Línea ─────────────────────────────────────────────────────────────
    if (b.tipo === 'linea') {
      const lx = (b.x / 100) * d.w, ly = (b.y / 100) * d.h;
      const lw = ((b.length ?? 80) / 100) * d.w;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(((b.rotation ?? 0) * Math.PI) / 180);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.thickness || 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(lw, 0);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (!b.texto?.trim()) continue;
    ctx.save();
    const canvasWeight = b.fontWeight ?? (b.bold ? 700 : 400);
    ctx.font = `${b.italic?'italic ':''} ${canvasWeight} ${b.size}px ${b.font}`;

    // ── Botón ─────────────────────────────────────────────────────────────
    if (b.tipo === 'boton') {
      const text = b.uppercase ? b.texto.toUpperCase() : b.texto;
      const px = b.bgPaddingX || 0, py = b.bgPaddingY || 0;
      const tw = ctx.measureText(text).width;
      const btnW = tw + px * 2, btnH = b.size * b.lineHeight + py * 2;
      const bx = (b.x / 100) * d.w, by = (b.y / 100) * d.h;
      if (b.hasShadow) {
        ctx.shadowColor = hexAlpha(b.shadowColor, b.shadowOpacity);
        ctx.shadowBlur = b.shadowBlur; ctx.shadowOffsetX = b.shadowX; ctx.shadowOffsetY = b.shadowY;
      }
      ctx.fillStyle = hexAlpha(b.bgColor, b.bgOpacity);
      roundRectPath(ctx, bx, by, btnW, btnH, b.bgBorderRadius);
      ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.fillStyle = b.color;
      ctx.fillText(text, bx + btnW / 2, by + btnH / 2);
      ctx.restore();
      continue;
    }

    const x    = (b.x / 100) * d.w;
    const y    = (b.y / 100) * d.h;
    const maxW = (b.maxWidthPct / 100) * d.w;
    const lh   = b.size * b.lineHeight;
    const text = b.uppercase ? b.texto.toUpperCase() : b.texto;
    ctx.textBaseline = 'top';
    ctx.textAlign = b.textAlign;

    const lines   = getWrappedLines(ctx, text, maxW);
    const totalH  = lines.length * lh;
    const textX   = b.textAlign==='center' ? x+maxW/2 : b.textAlign==='right' ? x+maxW : x;

    // Fondo del bloque
    if (b.hasBg) {
      const px = b.bgPaddingX || 0;
      const py = b.bgPaddingY || 0;
      ctx.fillStyle = hexAlpha(b.bgColor, b.bgOpacity);
      roundRectPath(ctx, x-px, y-py, maxW+px*2, totalH+py*2, b.bgBorderRadius);
      ctx.fill();
    }

    // Sombra
    if (b.hasShadow) {
      ctx.shadowColor   = hexAlpha(b.shadowColor, b.shadowOpacity);
      ctx.shadowBlur    = b.shadowBlur;
      ctx.shadowOffsetX = b.shadowX;
      ctx.shadowOffsetY = b.shadowY;
    }

    if (b.strokeColor) {
      ctx.strokeStyle = b.strokeColor;
      ctx.lineWidth = b.strokeWidth || 2;
      ctx.lineJoin = 'round';
      lines.forEach((line, i) => { if (line) ctx.strokeText(line, textX, y + i * lh); });
      if (!b.strokeOnly) {
        ctx.fillStyle = b.color;
        lines.forEach((line, i) => { if (line) ctx.fillText(line, textX, y + i * lh); });
      }
    } else {
      ctx.fillStyle = b.color;
      lines.forEach((line, i) => { if (line) ctx.fillText(line, textX, y + i * lh); });
    }
    ctx.restore();
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 transition-all';

function Slider({ label, value, min=0, max=100, step=1, onChange, unit='' }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-slate-400 dark:text-white/30">{label}</span>
        <span className="text-[11px] font-mono text-slate-500 dark:text-white/40">{typeof value==='number'?value.toFixed(step<1?2:0):value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-[#c9a84c] cursor-pointer" />
    </div>
  );
}

function ColorRow({ label, value, onChange, alpha, onAlpha }) {
  const hasAlpha = alpha !== undefined && onAlpha;
  const [hexInput, setHexInput] = useState(value);

  useEffect(() => { setHexInput(value); }, [value]);

  const handleHexChange = (e) => {
    const raw = e.target.value;
    setHexInput(raw);
    const full = raw.startsWith('#') ? raw : '#' + raw;
    if (/^#[0-9a-fA-F]{6}$/.test(full)) onChange(full);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-400 dark:text-white/30 flex-1">{label}</span>
      <div className="relative w-6 h-6 rounded border border-slate-200 dark:border-white/10 overflow-hidden flex-shrink-0 cursor-pointer"
        style={{ background: 'repeating-conic-gradient(#bbb 0% 25%, #fff 0% 50%) 0 0 / 6px 6px' }}>
        <div className="absolute inset-0" style={{ backgroundColor: value, opacity: hasAlpha ? (alpha / 100) : 1 }} />
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </div>
      <input
        type="text"
        value={hexInput}
        onChange={handleHexChange}
        onBlur={() => setHexInput(value)}
        maxLength={7}
        className="text-[10px] font-mono w-16 bg-transparent border border-slate-200 dark:border-white/10 rounded px-1 py-0.5 text-slate-500 dark:text-white/40 focus:outline-none focus:border-[#c9a84c]/60"
      />
      {hasAlpha && (
        <>
          <input type="range" min={0} max={100} value={alpha}
            onChange={e => onAlpha(Number(e.target.value))}
            className="w-12 h-1 rounded-full accent-[#c9a84c] cursor-pointer flex-shrink-0" />
          <span className="text-[10px] font-mono text-slate-300 dark:text-white/20 w-7 text-right flex-shrink-0">{alpha}%</span>
        </>
      )}
    </div>
  );
}

function Seccion({ title, children, open: def=true }) {
  const [open, setOpen] = useState(def);
  return (
    <div className="border-b border-slate-100 dark:border-white/[0.05]">
      <button onClick={() => setOpen(o=>!o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
        {title} <ChevronDown size={11} className={`transition-transform ${open?'rotate-180':''}`} />
      </button>
      {open && <div className="px-3 pb-3 space-y-2.5">{children}</div>}
    </div>
  );
}

function StepDot({ n, current }) {
  const done   = n < current;
  const active = n === current;
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-[#c9a84c] text-black' : done ? 'bg-slate-800 dark:bg-white text-white dark:text-black' : 'bg-slate-200 dark:bg-white/[0.10] text-slate-400 dark:text-white/30'}`}>
        {done ? '✓' : n}
      </div>
    </div>
  );
}

// ─── Preview de manchas (CSS) ─────────────────────────────────────────────────
function BlobsLayer({ blobs, scale = 1 }) {
  return (
    <>
      {(blobs || []).map(b => (
        <div key={b.id} className="absolute pointer-events-none" style={{
          left: `${b.x}%`, top: `${b.y}%`,
          width: `${b.size * 2.8}%`, height: `${b.size * 2.8}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse at center, ${hexAlpha(b.color, b.opacity)} 0%, ${hexAlpha(b.color, b.opacity * 0.3)} 40%, transparent 70%)`,
        }} />
      ))}
    </>
  );
}

// ─── Mini previews para selección de plantilla ────────────────────────────────
function MiniPreviewGradiente({ tipo }) {
  const d = TIPOS[tipo];
  return (
    <div className="relative overflow-hidden bg-white rounded-xl w-full" style={{ aspectRatio: `${d.w}/${d.h}` }}>
      <BlobsLayer blobs={DEFAULT_BLOBS} />
    </div>
  );
}

function MiniPreviewImagen({ tipo }) {
  const d = TIPOS[tipo];
  return (
    <div className="relative overflow-hidden rounded-xl w-full" style={{ aspectRatio: `${d.w}/${d.h}`, background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-1">🖼</div>
          <div className="text-white/40 text-[9px]">Foto + manchas</div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '50%', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.72))' }} />
      <BlobsLayer blobs={[
        { id: 1, x: 10, y: 10, size: 35, color: '#FF6B6B', opacity: 0.5 },
        { id: 2, x: 85, y: 80, size: 40, color: '#4ECDC4', opacity: 0.4 },
      ]} />
    </div>
  );
}

function MiniPreviewEditorial({ tipo }) {
  const d = TIPOS[tipo];
  return (
    <div className="relative overflow-hidden rounded-xl w-full" style={{ aspectRatio: `${d.w}/${d.h}`, backgroundColor: '#555' }}>
      {/* White top section */}
      <div className="absolute left-0 right-0 top-0" style={{ height: '42%', backgroundColor: '#F5F4F0' }}>
        <div className="absolute" style={{ top: '20%', left: '8%', right: '8%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ height: 1.5, width: '35%', backgroundColor: '#bbb', borderRadius: 99 }} />
          <div style={{ height: 2.5, width: '65%', backgroundColor: '#555', borderRadius: 99 }} />
          <div style={{ height: 1.5, width: '50%', backgroundColor: '#aaa', borderRadius: 99 }} />
        </div>
      </div>
      {/* Separator line */}
      <div className="absolute left-0 right-0" style={{ top: '42%', height: 2, backgroundColor: '#111' }} />
      {/* Large stroke title crossing split */}
      <div className="absolute" style={{ top: '35%', left: '3%', right: '3%' }}>
        <span style={{ fontSize: 'clamp(11px,5.5cqw,18px)', fontWeight: 900, letterSpacing: '-0.5px', color: 'transparent', WebkitTextStroke: '1px #111', lineHeight: 1 }}>
          EDITORIAL
        </span>
      </div>
      {/* Location at bottom */}
      <div className="absolute bottom-2 left-3">
        <div style={{ height: 1.5, width: 30, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 99 }} />
      </div>
    </div>
  );
}

// ─── Step 1: Formato ──────────────────────────────────────────────────────────
function FormatoStep({ onNext }) {
  const [sel, setSel] = useState(null);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">¿Qué tipo de contenido?</h2>
        <p className="text-slate-400 dark:text-white/40 text-sm mt-1">Seleccioná el formato de la pieza que querés crear</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {Object.entries(TIPOS).map(([k, v]) => {
          const ratio = v.w / v.h;
          const previewH = Math.round(140 / ratio);
          return (
            <button key={k} onClick={() => setSel(k)}
              className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-3 transition-all hover:scale-105 ${sel===k ? 'border-[#c9a84c] bg-[#c9a84c]/[0.04]' : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20'}`}>
              <div className="w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/[0.06] dark:to-white/[0.02]"
                style={{ height: Math.min(previewH, 100) }}>
                <div className="w-full h-full flex items-center justify-center text-2xl">{v.icon}</div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{v.label}</p>
                <p className="text-xs text-slate-400 dark:text-white/30">{v.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={() => sel && onNext(sel)} disabled={!sel}
        className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-40 text-black font-bold px-8 py-3 rounded-xl transition-all text-sm">
        Siguiente <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ─── Step 2: Plantilla ────────────────────────────────────────────────────────
const PLANTILLAS = [
  { id: 'gradiente', nombre: 'Degradé Aurora',     desc: 'Fondo blanco con manchas de color suaves y personalizables',                                       Preview: MiniPreviewGradiente  },
  { id: 'imagen',    nombre: 'Plantilla Sombreada', desc: 'Fotografía de fondo con degradé oscuro en la parte inferior y manchas de color superpuestas',       Preview: MiniPreviewImagen     },
  { id: 'editorial', nombre: 'Editorial Split',     desc: 'Zona blanca superior + fotografía inferior con título outline gigante cruzando la línea divisoria', Preview: MiniPreviewEditorial  },
];

function initTemplateConfig(plantillaId) {
  if (plantillaId === 'gradiente') {
    return { type: 'gradiente', bgColor: '#FFFFFF', bgUrl: null, bgPositionX: 50, bgPositionY: 50, overlayOpacity: 0, blobs: DEFAULT_BLOBS.map(b => ({ ...b })) };
  }
  if (plantillaId === 'editorial') {
    return { type: 'editorial', bgUrl: null, bgPositionX: 50, bgPositionY: 50, overlayOpacity: 0, splitRatio: 0.42, topColor: '#F5F4F0', topOpacity: 100, lineColor: '#111111', lineThickness: 3, blobs: [] };
  }
  return { type: 'imagen', bgUrl: null, bgPositionX: 50, bgPositionY: 50, overlayOpacity: 0.1, blobs: [] };
}

function PlantillaStep({ tipo, onNext, onBack }) {
  const [sel, setSel] = useState(null);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Elegí una plantilla</h2>
        <p className="text-slate-400 dark:text-white/40 text-sm mt-1">El diseño base que vas a personalizar</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-3xl">
        {PLANTILLAS.map(p => (
          <button key={p.id} onClick={() => setSel(p.id)}
            className={`rounded-2xl border-2 p-5 flex flex-col gap-4 text-left transition-all hover:scale-[1.02] ${sel===p.id ? 'border-[#c9a84c] bg-[#c9a84c]/[0.04]' : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300'}`}>
            <div className="w-full" style={{ maxHeight: 160, overflow: 'hidden' }}>
              <p.Preview tipo={tipo} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">{p.nombre}</p>
              <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">{p.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.10] text-slate-600 dark:text-white/60 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
          <ArrowLeft size={14} /> Atrás
        </button>
        <button onClick={() => sel && onNext(sel, initTemplateConfig(sel))} disabled={!sel}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-40 text-black font-bold px-8 py-2.5 rounded-xl transition-all text-sm">
          Siguiente <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Mis Plantillas ───────────────────────────────────────────────────
const FORMATO_LABEL = { historia: 'Historia', feed: 'Feed 1:1', feed45: 'Feed 4:5', landscape: 'Landscape' };
const TIPO_LABEL    = { gradiente: 'Degradé Aurora', imagen: 'Plantilla Sombreada', editorial: 'Editorial Split' };

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)   return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} días`;
}

function MisPlantillasStep({ clienteId, formato, tipo, onNext, onBack }) {
  const [loadingId, setLoadingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: plantillas = [], isLoading } = useCreadorPlantillas(clienteId, { formato, tipo });
  const { data: detalle }   = useCreadorPlantillaDetalle(clienteId, loadingId);
  const eliminar            = useEliminarCreadorPlantilla(clienteId);

  useEffect(() => {
    if (detalle && loadingId) onNext(detalle);
  }, [detalle, loadingId, onNext]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mis plantillas guardadas</h2>
        <p className="text-slate-400 dark:text-white/40 text-sm mt-1">
          {FORMATO_LABEL[formato]} · {TIPO_LABEL[tipo]}
        </p>
      </div>

      {isLoading ? (
        <Loader2 size={24} className="animate-spin text-slate-300 dark:text-white/20" />
      ) : plantillas.length === 0 ? (
        <div className="text-center text-slate-400 dark:text-white/30 text-sm py-8">
          <BookMarked size={32} className="mx-auto mb-3 opacity-30" />
          No tenés plantillas guardadas para este formato.<br/>
          Creá una nueva desde el editor.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
          {plantillas.map(p => (
            <div key={p.id}
              className="relative rounded-2xl border-2 border-slate-200 dark:border-white/[0.08] hover:border-[#c9a84c] transition-all group overflow-hidden bg-white dark:bg-white/[0.02]">
              <button onClick={() => setLoadingId(p.id)}
                className="w-full text-left flex flex-col">
                {/* Thumbnail */}
                <div className="w-full overflow-hidden rounded-t-xl bg-slate-100 dark:bg-white/[0.04]"
                  style={{ aspectRatio: TIPOS[p.formato] ? `${TIPOS[p.formato].w}/${TIPOS[p.formato].h}` : '1/1', maxHeight: 160 }}>
                  {(() => {
                    const previewSrc = p.thumbnail_url
                      ? imageUrl(p.thumbnail_url)
                      : imageUrl(p.estado_editor?.templateConfig?.bgUrl);
                    return previewSrc
                      ? <img src={previewSrc} alt={p.nombre} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-white/10">
                          <BookMarked size={20} />
                        </div>;
                  })()}
                </div>
                <div className="p-3 flex flex-col gap-1.5">
                  <p className="font-bold text-slate-800 dark:text-white text-sm truncate pr-6">{p.nombre}</p>
                  <p className="text-[11px] text-slate-400 dark:text-white/20">{timeAgo(p.created_at)}</p>
                  {loadingId === p.id && (
                    <Loader2 size={13} className="animate-spin text-[#c9a84c] absolute top-3 right-8" />
                  )}
                </div>
              </button>

              {/* Botón eliminar */}
              {confirmDelete === p.id ? (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => { eliminar.mutate(p.id); setConfirmDelete(null); }}
                    className="text-[10px] px-2 py-1 bg-red-500 text-white rounded-md font-semibold">Sí</button>
                  <button onClick={() => setConfirmDelete(null)}
                    className="text-[10px] px-2 py-1 bg-slate-200 dark:bg-white/10 rounded-md text-slate-600 dark:text-white/60">No</button>
                </div>
              ) : (
                <button onClick={e => { e.stopPropagation(); setConfirmDelete(p.id); }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.10] text-slate-600 dark:text-white/60 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
          <ArrowLeft size={14} /> Atrás
        </button>
        <button onClick={() => onNext(null, tipo)}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] text-black font-bold px-8 py-2.5 rounded-xl transition-all text-sm">
          Empezar en blanco <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Live Preview ─────────────────────────────────────────────────────────────
function LivePreview({ tipo, templateConfig, bloques, selectedId, onSelect, onMove, onBgReposition }) {
  const d   = TIPOS[tipo];
  const MAX_H = 440;
  const ratio = d.w / d.h;
  let pH = MAX_H, pW = Math.round(pH * ratio);
  if (pW > 380) { pW = 380; pH = Math.round(pW / ratio); }
  const scale     = pW / d.w;
  const container = useRef(null);
  const drag      = useRef(null);

  const startDrag = useCallback((e, b) => {
    e.preventDefault(); e.stopPropagation();
    onSelect(b.id);
    const rect = container.current.getBoundingClientRect();
    drag.current = { id: b.id, sx: e.clientX, sy: e.clientY, px: b.x, py: b.y, rw: rect.width, rh: rect.height };
    const move = ev => {
      if (!drag.current) return;
      const { id, sx, sy, px, py, rw, rh } = drag.current;
      onMove(id, {
        x: Math.max(0, Math.min(90, px + ((ev.clientX-sx)/rw)*100)),
        y: Math.max(0, Math.min(95, py + ((ev.clientY-sy)/rh)*100)),
      });
    };
    const up = () => { drag.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [onSelect, onMove]);

  const isEditorial = templateConfig.type === 'editorial';
  const bgPosX = templateConfig.bgPositionX ?? 50;
  const bgPosY = templateConfig.bgPositionY ?? 50;
  const bgStyle = templateConfig.bgUrl
    ? { backgroundImage: `url(${templateConfig.bgUrl})`, backgroundSize: 'cover', backgroundPosition: `${bgPosX}% ${bgPosY}%` }
    : templateConfig.type === 'gradiente'
      ? { backgroundColor: templateConfig.bgColor || '#FFFFFF' }
      : isEditorial ? { backgroundColor: '#666' }
      : { backgroundColor: '#111' };

  const startBgDrag = useCallback((e) => {
    if (!templateConfig.bgUrl || !onBgReposition) return;
    if (e.target !== container.current) return;
    e.preventDefault();
    const rect = container.current.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const startPX = templateConfig.bgPositionX ?? 50;
    const startPY = templateConfig.bgPositionY ?? 50;
    const move = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      onBgReposition(
        Math.max(0, Math.min(100, startPX - (dx / rect.width) * 100)),
        Math.max(0, Math.min(100, startPY - (dy / rect.height) * 100)),
      );
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [templateConfig.bgUrl, templateConfig.bgPositionX, templateConfig.bgPositionY, onBgReposition]);

  return (
    <div ref={container} className="relative overflow-hidden rounded-2xl shadow-2xl select-none flex-shrink-0"
      style={{ width: pW, height: pH, ...bgStyle, cursor: templateConfig.bgUrl ? 'grab' : 'default' }}
      onMouseDown={startBgDrag}
      onClick={() => onSelect(null)}>

      {/* Overlay para imagen */}
      {templateConfig.type === 'imagen' && (templateConfig.overlayOpacity || 0) > 0 && (
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${templateConfig.overlayOpacity})`, pointerEvents: 'none' }} />
      )}

      {/* Degradé oscuro inferior — siempre presente en plantilla sombreada */}
      {templateConfig.type === 'imagen' && (
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '50%', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.72))' }} />
      )}

      {/* Editorial split — zona blanca superior + línea divisoria */}
      {isEditorial && (
        <>
          <div className="absolute left-0 right-0 top-0 pointer-events-none" style={{
            height: `${(templateConfig.splitRatio ?? 0.42) * 100}%`,
            backgroundColor: templateConfig.topColor ?? '#F5F4F0',
            opacity: (templateConfig.topOpacity ?? 100) / 100,
          }} />
          <div className="absolute left-0 right-0 pointer-events-none" style={{
            top: `${(templateConfig.splitRatio ?? 0.42) * 100}%`,
            height: templateConfig.lineThickness ?? 3,
            backgroundColor: templateConfig.lineColor ?? '#111111',
          }} />
          {(templateConfig.overlayOpacity || 0) > 0 && (
            <div className="absolute left-0 right-0 bottom-0 pointer-events-none" style={{
              top: `${(templateConfig.splitRatio ?? 0.42) * 100}%`,
              background: `rgba(0,0,0,${templateConfig.overlayOpacity})`,
            }} />
          )}
        </>
      )}

      {/* Blobs */}
      <BlobsLayer blobs={templateConfig.blobs || []} />

      {/* Textos, botones y líneas arrastrables */}
      {bloques.filter(b => b.visible && (b.tipo === 'linea' || b.texto?.trim())).map(b => {
        const isSel = b.id === selectedId;
        const selRing = isSel ? 'ring-1 ring-white/70 ring-offset-0' : '';
        const dragProps = {
          onMouseDown: e => startDrag(e, b),
          onClick: e => { e.stopPropagation(); onSelect(b.id); },
        };

        // ── Línea ─────────────────────────────────────────────────────────
        if (b.tipo === 'linea') {
          return (
            <div key={b.id}
              className={`absolute cursor-move ${selRing}`}
              style={{
                left: `${b.x}%`, top: `${b.y}%`,
                width: `${b.length ?? 80}%`,
                height: Math.max(1, (b.thickness || 4) * scale),
                backgroundColor: b.color,
                transform: `rotate(${b.rotation ?? 0}deg)`,
                transformOrigin: '0 50%',
              }}
              {...dragProps}
            />
          );
        }

        if (b.tipo === 'boton') {
          return (
            <div key={b.id}
              className={`absolute cursor-move inline-flex items-center justify-center ${selRing}`}
              style={{
                left: `${b.x}%`, top: `${b.y}%`,
                fontFamily: b.font, fontSize: b.size * scale,
                fontWeight: b.fontWeight ?? (b.bold ? 'bold' : 'normal'),
                fontStyle: b.italic ? 'italic' : 'normal',
                letterSpacing: b.letterSpacing * scale,
                textTransform: b.uppercase ? 'uppercase' : 'none',
                color: b.color,
                backgroundColor: hexAlpha(b.bgColor, b.bgOpacity),
                borderRadius: b.bgBorderRadius * scale,
                padding: `${b.bgPaddingY * scale}px ${b.bgPaddingX * scale}px`,
                whiteSpace: 'nowrap',
                boxShadow: b.hasShadow
                  ? `${b.shadowX*scale}px ${b.shadowY*scale}px ${b.shadowBlur*scale}px ${hexAlpha(b.shadowColor, b.shadowOpacity)}`
                  : 'none',
              }}
              {...dragProps}>
              {b.uppercase ? b.texto.toUpperCase() : b.texto}
            </div>
          );
        }

        return (
          <div key={b.id}
            className={`absolute cursor-move ${selRing}`}
            style={{
              left: `${b.x}%`, top: `${b.y}%`,
              width: `${b.maxWidthPct}%`,
              fontFamily: b.font, fontSize: b.size * scale,
              color: b.strokeColor && b.strokeOnly ? 'transparent' : b.color,
              fontWeight: b.fontWeight ?? (b.bold ? 'bold' : 'normal'),
              fontStyle: b.italic ? 'italic' : 'normal',
              lineHeight: b.lineHeight,
              letterSpacing: b.letterSpacing * scale,
              textTransform: b.uppercase ? 'uppercase' : 'none',
              textAlign: b.textAlign,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              ...(b.strokeColor ? { WebkitTextStroke: `${(b.strokeWidth || 2) * scale}px ${b.strokeColor}`, paintOrder: 'stroke fill' } : {}),
              ...(b.hasBg ? {
                backgroundColor: hexAlpha(b.bgColor, b.bgOpacity),
                borderRadius: b.bgBorderRadius * scale,
                padding: `${b.bgPaddingY * scale}px ${b.bgPaddingX * scale}px`,
              } : {}),
              ...(b.hasShadow ? {
                textShadow: `${b.shadowX*scale}px ${b.shadowY*scale}px ${b.shadowBlur*scale}px ${hexAlpha(b.shadowColor, b.shadowOpacity)}`,
              } : {}),
            }}
            {...dragProps}>
            {b.texto}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 4: Editor ───────────────────────────────────────────────────────────
function EditorStep({ tipo, templateConfig: initConfig, bloques, setBloques, selectedId, setSelectedId, upd, onMove, onBack, handleDownload, generando, handleLightbox, handleGuardarGaleria, guardando, guardadoOk, onSaveNamed }) {
  const [config, setConfig] = useState(initConfig);
  const updC = patch => setConfig(c => ({ ...c, ...patch }));
  const fileRef = useRef(null);

  const sel = bloques.find(b => b.id === selectedId);

  const addBlob  = () => updC({ blobs: [...(config.blobs||[]), newBlob()] });
  const updBlob  = (id, p) => updC({ blobs: (config.blobs||[]).map(b => b.id===id ? { ...b, ...p } : b) });
  const rmBlob   = (id) => updC({ blobs: (config.blobs||[]).filter(b => b.id!==id) });

  const addBloque = () => {
    const b = newBloque({ nombre: `Texto ${bloques.length+1}` });
    setBloques(bs => [...bs, b]);
    setSelectedId(b.id);
  };

  const addBotonBloque = () => {
    const b = newBoton({ nombre: `Botón ${bloques.length+1}` });
    setBloques(bs => [...bs, b]);
    setSelectedId(b.id);
  };

  const state = { tipo, templateConfig: config, bloques };

  return (
    <div className="flex flex-1 min-h-0">
      {/* ── Panel izquierdo ─────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 border-r border-slate-100 dark:border-white/[0.06] flex flex-col bg-white dark:bg-[#0f0f0f]">
      <div className="flex-1 overflow-y-auto">

        {/* Fondo / plantilla */}
        <Seccion title="Fondo y plantilla">
          {/* Imagen de fondo — disponible en todas las plantillas */}
          <div
            className="border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-xl p-3 text-center cursor-pointer hover:border-[#c9a84c]/30 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f=e.dataTransfer.files[0]; if(f?.type.startsWith('image/')) updC({ bgUrl: URL.createObjectURL(f) }); }}>
            {config.bgUrl ? (
              <div className="relative">
                <img src={config.bgUrl} alt="" className="w-full h-20 object-cover rounded-lg" />
                <button onClick={e=>{e.stopPropagation();updC({bgUrl:null});}} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"><X size={11}/></button>
              </div>
            ) : (
              <><Upload size={16} className="mx-auto text-slate-300 dark:text-white/20 mb-1"/><p className="text-xs text-slate-400 dark:text-white/30">Subí la imagen de fondo</p></>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) updC({ bgUrl: URL.createObjectURL(f) }); }} />
          </div>
          {/* Reposicionar imagen de fondo */}
          {config.bgUrl && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 dark:text-white/30 italic">Arrastrá la imagen en el preview para reposicionarla, o usá los sliders:</p>
              <Slider label="Posición X" value={Math.round(config.bgPositionX ?? 50)} min={0} max={100} onChange={v => updC({ bgPositionX: v })} unit="%" />
              <Slider label="Posición Y" value={Math.round(config.bgPositionY ?? 50)} min={0} max={100} onChange={v => updC({ bgPositionY: v })} unit="%" />
            </div>
          )}
          {/* Color de fondo — solo Degradé Aurora sin imagen */}
          {config.type === 'gradiente' && !config.bgUrl && (
            <ColorRow label="Color de fondo" value={config.bgColor || '#FFFFFF'} onChange={v => updC({ bgColor: v })} />
          )}
          {/* Overlay oscuro — cuando hay imagen o en plantilla sombreada (no editorial) */}
          {(config.bgUrl || config.type === 'imagen') && config.type !== 'editorial' && (
            <Slider label="Overlay oscuro" value={Math.round((config.overlayOpacity||0)*100)} min={0} max={80} onChange={v => updC({ overlayOpacity: v/100 })} unit="%" />
          )}
          {/* Editorial Split — controles específicos */}
          {config.type === 'editorial' && (
            <>
              <ColorRow label="Color zona superior" value={config.topColor ?? '#F5F4F0'} onChange={v => updC({ topColor: v })} />
              <Slider label="Opacidad zona superior" value={config.topOpacity ?? 100} min={0} max={100} onChange={v => updC({ topOpacity: v })} unit="%" />
              <Slider label="División superior" value={Math.round((config.splitRatio ?? 0.42) * 100)} min={0} max={70} onChange={v => updC({ splitRatio: v / 100 })} unit="%" />
              <ColorRow label="Color línea divisoria" value={config.lineColor ?? '#111111'} onChange={v => updC({ lineColor: v })} />
              <Slider label="Grosor línea" value={config.lineThickness ?? 3} min={0} max={20} onChange={v => updC({ lineThickness: v })} unit="px" />
              <Slider label="Overlay zona foto" value={Math.round((config.overlayOpacity||0)*100)} min={0} max={80} onChange={v => updC({ overlayOpacity: v/100 })} unit="%" />
            </>
          )}
        </Seccion>

        {/* Manchas / blobs */}
        <Seccion title="Manchas de color">
          {(config.blobs||[]).map((blob, i) => (
            <div key={blob.id} className="bg-slate-50 dark:bg-white/[0.03] rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-white/30">Mancha {i+1}</span>
                <button onClick={()=>rmBlob(blob.id)} className="text-slate-300 dark:text-white/20 hover:text-red-400"><Trash2 size={11}/></button>
              </div>
              <ColorRow label="Color" value={blob.color} onChange={v=>updBlob(blob.id,{color:v})} alpha={Math.round(blob.opacity*100)} onAlpha={v=>updBlob(blob.id,{opacity:v/100})} />
              <Slider label="Tamaño" value={blob.size} min={5} max={90} onChange={v=>updBlob(blob.id,{size:v})} unit="%" />
              <div className="grid grid-cols-2 gap-2">
                <Slider label="Pos. X" value={Math.round(blob.x)} min={0} max={100} onChange={v=>updBlob(blob.id,{x:v})} unit="%" />
                <Slider label="Pos. Y" value={Math.round(blob.y)} min={0} max={100} onChange={v=>updBlob(blob.id,{y:v})} unit="%" />
              </div>
            </div>
          ))}
          <button onClick={addBlob} className="w-full flex items-center justify-center gap-1 text-xs text-[#c9a84c] hover:text-[#d4b560] border border-dashed border-[#c9a84c]/30 hover:border-[#c9a84c]/60 rounded-lg py-1.5 transition-all">
            <Plus size={11}/> Agregar mancha
          </button>
        </Seccion>

        {/* Bloques de texto y botones */}
        <Seccion title="Textos y botones">
          {bloques.map(b => (
            <div key={b.id} onClick={() => setSelectedId(b.id === selectedId ? null : b.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-xs font-medium ${b.id===selectedId ? 'bg-slate-900 dark:bg-white/[0.10] text-white' : 'hover:bg-slate-50 dark:hover:bg-white/[0.03] text-slate-600 dark:text-white/50'}`}>
              <Move size={10} className="flex-shrink-0 opacity-40"/>
              {b.tipo === 'boton' && (
                <span className="text-[8px] font-black bg-[#c9a84c]/20 text-[#c9a84c] rounded px-1 py-0.5 uppercase tracking-wide flex-shrink-0">BTN</span>
              )}
              {b.tipo === 'linea' && (
                <span className="text-[8px] font-black bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/40 rounded px-1 py-0.5 uppercase tracking-wide flex-shrink-0">LÍN</span>
              )}
              <span className="flex-1 truncate">{b.nombre}</span>
              {b.texto && <span className="opacity-40 text-[10px] truncate max-w-[60px]">{b.texto.slice(0,15)}</span>}
              <button onClick={e=>{e.stopPropagation();upd(b.id,{visible:!b.visible});}} className="opacity-40 hover:opacity-100">
                {b.visible ? <Eye size={10}/> : <EyeOff size={10}/>}
              </button>
              <button onClick={e=>{e.stopPropagation();setBloques(bs=>bs.filter(x=>x.id!==b.id));if(selectedId===b.id)setSelectedId(null);}} className="opacity-40 hover:opacity-100 hover:text-red-400">
                <Trash2 size={10}/>
              </button>
            </div>
          ))}
          <div className="flex gap-1.5 pt-0.5 flex-wrap">
            <button onClick={addBloque} className="flex-1 flex items-center justify-center gap-1 text-xs text-[#c9a84c] hover:text-[#d4b560] border border-dashed border-[#c9a84c]/30 hover:border-[#c9a84c]/60 rounded-lg py-1.5 transition-all">
              <Plus size={11}/> Texto
            </button>
            <button onClick={addBotonBloque} className="flex-1 flex items-center justify-center gap-1 text-xs text-[#c9a84c] hover:text-[#d4b560] border border-dashed border-[#c9a84c]/30 hover:border-[#c9a84c]/60 rounded-lg py-1.5 transition-all">
              <Plus size={11}/> Botón
            </button>
            <button onClick={() => { const l = newLine(); setBloques(bs => [...bs, l]); setSelectedId(l.id); }}
              className="flex-1 flex items-center justify-center gap-1 text-xs text-[#c9a84c] hover:text-[#d4b560] border border-dashed border-[#c9a84c]/30 hover:border-[#c9a84c]/60 rounded-lg py-1.5 transition-all">
              <Plus size={11}/> Línea
            </button>
          </div>
        </Seccion>

        {/* Editor del bloque seleccionado */}
        {sel && sel.tipo === 'boton' && (
          <Seccion title={`🔘 ${sel.nombre}`}>
            <div>
              <label className="text-[11px] text-slate-400 dark:text-white/30 block mb-1">Nombre</label>
              <input value={sel.nombre} onChange={e=>upd(sel.id,{nombre:e.target.value})} className={inputCls}/>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 dark:text-white/30 block mb-1">Texto del botón</label>
              <input value={sel.texto} onChange={e=>upd(sel.id,{texto:e.target.value})} placeholder="Ej: Contactanos" className={inputCls}/>
            </div>

            {/* Colores */}
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <p className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-wider">Colores</p>
              <ColorRow label="Fondo del botón" value={sel.bgColor} onChange={v=>upd(sel.id,{bgColor:v})} alpha={Math.round(sel.bgOpacity*100)} onAlpha={v=>upd(sel.id,{bgOpacity:v/100})} />
              <ColorRow label="Color del texto" value={sel.color} onChange={v=>upd(sel.id,{color:v})} />
            </div>

            {/* Forma */}
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <p className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-wider">Forma</p>
              <Slider label="Redondeo" value={sel.bgBorderRadius} min={0} max={200} onChange={v=>upd(sel.id,{bgBorderRadius:v})} unit="px"/>
              <Slider label="Sangría horizontal" value={sel.bgPaddingX} min={0} max={200} onChange={v=>upd(sel.id,{bgPaddingX:v})} unit="px"/>
              <Slider label="Sangría vertical" value={sel.bgPaddingY} min={0} max={100} onChange={v=>upd(sel.id,{bgPaddingY:v})} unit="px"/>
            </div>

            {/* Sombra */}
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-300 dark:text-white/20 uppercase tracking-wider cursor-pointer">
                <input type="checkbox" checked={sel.hasShadow} onChange={e=>upd(sel.id,{hasShadow:e.target.checked})} className="accent-[#c9a84c]"/>
                Sombra
              </label>
              {sel.hasShadow && (
                <>
                  <ColorRow label="Color sombra" value={sel.shadowColor} onChange={v=>upd(sel.id,{shadowColor:v})} alpha={Math.round(sel.shadowOpacity*100)} onAlpha={v=>upd(sel.id,{shadowOpacity:v/100})} />
                  <Slider label="Difuminado" value={sel.shadowBlur} min={0} max={100} onChange={v=>upd(sel.id,{shadowBlur:v})} unit="px"/>
                  <Slider label="Desplaz. X" value={sel.shadowX} min={-50} max={50} onChange={v=>upd(sel.id,{shadowX:v})} unit="px"/>
                  <Slider label="Desplaz. Y" value={sel.shadowY} min={-50} max={50} onChange={v=>upd(sel.id,{shadowY:v})} unit="px"/>
                </>
              )}
            </div>

            {/* Tipografía */}
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <p className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-wider">Tipografía</p>
              <div>
                <label className="text-[11px] text-slate-400 dark:text-white/30 block mb-1">Fuente</label>
                <select value={sel.font}
                  onChange={e => { const p = FONTS.find(f=>f.value===e.target.value); upd(sel.id,{font:e.target.value,fontWeight:p?.fontWeight??400}); }}
                  className={inputCls} style={{fontFamily:sel.font,fontWeight:sel.fontWeight??400}}>
                  {FONTS.map(f=><option key={f.label} value={f.value} style={{fontFamily:f.value,fontWeight:f.fontWeight??400}}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 dark:text-white/30 block mb-1">Peso</label>
                <select value={sel.fontWeight ?? 400} onChange={e=>upd(sel.id,{fontWeight:Number(e.target.value)})} className={inputCls}>
                  {WEIGHTS.map(w=><option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
              <Slider label="Tamaño" value={sel.size} min={12} max={120} onChange={v=>upd(sel.id,{size:v})} unit="px"/>
              <div className="flex gap-3 flex-wrap">
                {[['uppercase','MAYÚS']].map(([k,l])=>(
                  <label key={k} className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-white/30 cursor-pointer">
                    <input type="checkbox" checked={!!sel[k]} onChange={e=>upd(sel.id,{[k]:e.target.checked})} className="accent-[#c9a84c]"/> {l}
                  </label>
                ))}
              </div>
            </div>

            {/* Posición */}
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <p className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-wider">Posición (o arrastrá en el preview)</p>
              <Slider label="Horizontal (X)" value={Math.round(sel.x)} min={0} max={90} onChange={v=>upd(sel.id,{x:v})} unit="%"/>
              <Slider label="Vertical (Y)" value={Math.round(sel.y)} min={0} max={95} onChange={v=>upd(sel.id,{y:v})} unit="%"/>
            </div>
          </Seccion>
        )}

        {sel && sel.tipo !== 'boton' && (
          <Seccion title={`✏️ ${sel.nombre}`}>
            <div>
              <label className="text-[11px] text-slate-400 dark:text-white/30 block mb-1">Nombre</label>
              <input value={sel.nombre} onChange={e=>upd(sel.id,{nombre:e.target.value})} className={inputCls}/>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 dark:text-white/30 block mb-1">Texto</label>
              <textarea value={sel.texto} onChange={e=>upd(sel.id,{texto:e.target.value})} rows={4} placeholder="Escribí el texto…" className={`${inputCls} resize-y min-h-[70px]`}/>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 dark:text-white/30 block mb-1">Fuente</label>
              <select value={sel.font}
                onChange={e => {
                  const picked = FONTS.find(f => f.value === e.target.value);
                  upd(sel.id, { font: e.target.value, fontWeight: picked?.fontWeight ?? 400 });
                }}
                className={inputCls}
                style={{ fontFamily: sel.font, fontWeight: sel.fontWeight ?? 400 }}>
                {FONTS.map(f => (
                  <option key={f.label} value={f.value} style={{ fontFamily: f.value, fontWeight: f.fontWeight ?? 400 }}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 dark:text-white/30 block mb-1">Peso</label>
              <select value={sel.fontWeight ?? 400} onChange={e=>upd(sel.id,{fontWeight:Number(e.target.value)})} className={inputCls}>
                {WEIGHTS.map(w=><option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>

            {/* Alineado */}
            <div>
              <label className="text-[11px] text-slate-400 dark:text-white/30 block mb-1">Alineado</label>
              <div className="flex gap-1">
                {[['left',AlignLeft],['center',AlignCenter],['right',AlignRight]].map(([v,Icon])=>(
                  <button key={v} onClick={()=>upd(sel.id,{textAlign:v})}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${sel.textAlign===v ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40'}`}>
                    <Icon size={13}/>
                  </button>
                ))}
              </div>
            </div>

            <ColorRow label="Color de texto" value={sel.color} onChange={v=>upd(sel.id,{color:v})} />
            <Slider label="Tamaño" value={sel.size} min={12} max={200} onChange={v=>upd(sel.id,{size:v})} unit="px" />
            <Slider label="Interlineado" value={sel.lineHeight} min={0.8} max={3} step={0.05} onChange={v=>upd(sel.id,{lineHeight:v})} />
            <Slider label="Espaciado letras" value={sel.letterSpacing} min={-5} max={40} onChange={v=>upd(sel.id,{letterSpacing:v})} unit="px" />
            <Slider label="Ancho del bloque" value={sel.maxWidthPct} min={10} max={100} onChange={v=>upd(sel.id,{maxWidthPct:v})} unit="%" />

            <div className="flex gap-3 flex-wrap">
              {[['bold','Negrita'],['italic','Cursiva'],['uppercase','MAYÚS']].map(([k,l])=>(
                <label key={k} className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-white/30 cursor-pointer">
                  <input type="checkbox" checked={!!sel[k]} onChange={e=>upd(sel.id,{[k]:e.target.checked})} className="accent-[#c9a84c]"/> {l}
                </label>
              ))}
            </div>

            {/* Posición */}
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <p className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-wider">Posición (o arrastrá en el preview)</p>
              <Slider label="Horizontal (X)" value={Math.round(sel.x)} min={0} max={90} onChange={v=>upd(sel.id,{x:v})} unit="%"/>
              <Slider label="Vertical (Y)" value={Math.round(sel.y)} min={0} max={95} onChange={v=>upd(sel.id,{y:v})} unit="%"/>
            </div>

            {/* Fondo del texto */}
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-300 dark:text-white/20 uppercase tracking-wider cursor-pointer">
                <input type="checkbox" checked={sel.hasBg} onChange={e=>upd(sel.id,{hasBg:e.target.checked})} className="accent-[#c9a84c]"/>
                Fondo del bloque
              </label>
              {sel.hasBg && (
                <>
                  <ColorRow label="Color de fondo" value={sel.bgColor} onChange={v=>upd(sel.id,{bgColor:v})} alpha={Math.round(sel.bgOpacity*100)} onAlpha={v=>upd(sel.id,{bgOpacity:v/100})} />
                  <Slider label="Bordes redondeados" value={sel.bgBorderRadius} min={0} max={200} onChange={v=>upd(sel.id,{bgBorderRadius:v})} unit="px"/>
                  <Slider label="Sangría horizontal" value={sel.bgPaddingX} min={0} max={200} onChange={v=>upd(sel.id,{bgPaddingX:v})} unit="px"/>
                  <Slider label="Sangría vertical" value={sel.bgPaddingY} min={0} max={100} onChange={v=>upd(sel.id,{bgPaddingY:v})} unit="px"/>
                </>
              )}
            </div>

            {/* Sombra */}
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-300 dark:text-white/20 uppercase tracking-wider cursor-pointer">
                <input type="checkbox" checked={sel.hasShadow} onChange={e=>upd(sel.id,{hasShadow:e.target.checked})} className="accent-[#c9a84c]"/>
                Sombra
              </label>
              {sel.hasShadow && (
                <>
                  <ColorRow label="Color sombra" value={sel.shadowColor} onChange={v=>upd(sel.id,{shadowColor:v})} alpha={Math.round(sel.shadowOpacity*100)} onAlpha={v=>upd(sel.id,{shadowOpacity:v/100})} />
                  <Slider label="Difuminado" value={sel.shadowBlur} min={0} max={100} onChange={v=>upd(sel.id,{shadowBlur:v})} unit="px"/>
                  <Slider label="Desplaz. X" value={sel.shadowX} min={-50} max={50} onChange={v=>upd(sel.id,{shadowX:v})} unit="px"/>
                  <Slider label="Desplaz. Y" value={sel.shadowY} min={-50} max={50} onChange={v=>upd(sel.id,{shadowY:v})} unit="px"/>
                </>
              )}
            </div>

            {/* Contorno (outline/stroke) */}
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-300 dark:text-white/20 uppercase tracking-wider cursor-pointer">
                <input type="checkbox" checked={!!sel.strokeColor}
                  onChange={e => upd(sel.id, { strokeColor: e.target.checked ? (sel.color || '#000000') : null })}
                  className="accent-[#c9a84c]"/>
                Contorno (outline)
              </label>
              {sel.strokeColor && (
                <>
                  <ColorRow label="Color contorno" value={sel.strokeColor} onChange={v=>upd(sel.id,{strokeColor:v})} />
                  <Slider label="Grosor contorno" value={sel.strokeWidth ?? 2} min={1} max={20} onChange={v=>upd(sel.id,{strokeWidth:v})} unit="px"/>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-white/30 cursor-pointer">
                    <input type="checkbox" checked={!!sel.strokeOnly} onChange={e=>upd(sel.id,{strokeOnly:e.target.checked})} className="accent-[#c9a84c]"/>
                    Solo contorno (sin relleno)
                  </label>
                </>
              )}
            </div>
          </Seccion>
        )}

        {/* ── Editor de línea seleccionada ─────────────────────────── */}
        {sel && sel.tipo === 'linea' && (
          <Seccion title={`— ${sel.nombre}`}>
            <div>
              <label className="text-[11px] text-slate-400 dark:text-white/30 block mb-1">Nombre</label>
              <input value={sel.nombre} onChange={e=>upd(sel.id,{nombre:e.target.value})} className={inputCls}/>
            </div>
            <ColorRow label="Color" value={sel.color} onChange={v=>upd(sel.id,{color:v})} />
            <Slider label="Grosor" value={sel.thickness ?? 4} min={1} max={50} onChange={v=>upd(sel.id,{thickness:v})} unit="px"/>
            <Slider label="Largo" value={sel.length ?? 80} min={5} max={100} onChange={v=>upd(sel.id,{length:v})} unit="%"/>
            <Slider label="Rotación" value={sel.rotation ?? 0} min={-180} max={180} onChange={v=>upd(sel.id,{rotation:v})} unit="°"/>
            <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <p className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-wider">Posición (o arrastrá en el preview)</p>
              <Slider label="Horizontal (X)" value={Math.round(sel.x)} min={0} max={90} onChange={v=>upd(sel.id,{x:v})} unit="%"/>
              <Slider label="Vertical (Y)" value={Math.round(sel.y)} min={0} max={95} onChange={v=>upd(sel.id,{y:v})} unit="%"/>
            </div>
          </Seccion>
        )}

        {!sel && bloques.length > 0 && (
          <div className="p-5 text-center">
            <Move size={16} className="mx-auto text-slate-200 dark:text-white/10 mb-2"/>
            <p className="text-[11px] text-slate-300 dark:text-white/20">Seleccioná un bloque de texto para editarlo</p>
          </div>
        )}

        </div>{/* fin scroll */}

        {/* Guardar plantilla — footer fijo, siempre visible */}
        {onSaveNamed && (
          <div className="p-3 border-t border-slate-100 dark:border-white/[0.05] flex-shrink-0 bg-white dark:bg-[#0f0f0f]">
            <button onClick={() => onSaveNamed(config)}
              className="w-full flex items-center justify-center gap-1.5 text-xs rounded-lg py-2.5 font-semibold transition-all bg-[#c9a84c]/10 text-[#c9a84c] hover:bg-[#c9a84c]/20 border border-[#c9a84c]/30">
              <BookMarked size={11}/> Guardar plantilla
            </button>
          </div>
        )}
      </div>{/* fin panel izquierdo */}

      {/* ── Preview ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-slate-100 dark:bg-white/[0.01] overflow-auto">
        <LivePreview
          tipo={tipo} templateConfig={config} bloques={bloques}
          selectedId={selectedId} onSelect={setSelectedId} onMove={onMove}
          onBgReposition={(x, y) => updC({ bgPositionX: x, bgPositionY: y })}
        />
        <p className="text-[11px] text-slate-400 dark:text-white/30 text-center">
          {TIPOS[tipo].label} · {TIPOS[tipo].w}×{TIPOS[tipo].h}px · Arrastrá los textos para moverlos
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={() => handleLightbox(state)}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.10] text-slate-600 dark:text-white/60 hover:bg-white dark:hover:bg-white/[0.04] transition-all">
            <Eye size={13}/> Vista completa
          </button>
          {handleGuardarGaleria && (
            <button onClick={() => handleGuardarGaleria(state)} disabled={guardando || guardadoOk}
              className="flex items-center gap-1.5 text-xs font-bold px-5 py-2 rounded-xl transition-all disabled:opacity-60 border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c]/10">
              {guardando ? <Loader2 size={13} className="animate-spin"/> : <CheckCircle2 size={13}/>}
              {guardadoOk ? '¡Guardado!' : 'Guardar en galería'}
            </button>
          )}
          <button onClick={() => handleDownload(state)} disabled={generando}
            className="flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-xs font-bold px-5 py-2 rounded-xl transition-all">
            {generando ? <Loader2 size={13} className="animate-spin"/> : <Download size={13}/>}
            Descargar PNG
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Guardar Plantilla ─────────────────────────────────────────────────
function GuardarPlantillaModal({ clienteId, formato, tipo, bloques, templateConfig, plantillaActivaId, plantillaActivaNombre, onSaved, onClose }) {
  const initActualizar = !!plantillaActivaId;
  const [nombre,        setNombre]        = useState(initActualizar ? (plantillaActivaNombre ?? '') : '');
  const [modoActualizar, setModoActualizar] = useState(initActualizar);
  const [error,         setError]         = useState('');

  const handleModo = (actualizar) => {
    setModoActualizar(actualizar);
    setNombre(actualizar ? (plantillaActivaNombre ?? '') : '');
  };

  const crear     = useCrearCreadorPlantilla(clienteId);
  const actualizar = useActualizarCreadorPlantilla(clienteId);
  const isPending  = crear.isPending || actualizar.isPending;

  const buildPayload = async () => {
    const fd = new FormData();
    fd.append('nombre',  nombre.trim());
    fd.append('formato', formato);
    fd.append('tipo',    tipo);

    // Imagen de fondo: si es blob URL, subir como archivo
    const bgUrl     = templateConfig.bgUrl;
    const esBlobUrl = bgUrl?.startsWith('blob:');
    const editorState = { bloques, templateConfig: { ...templateConfig, bgUrl: esBlobUrl ? null : bgUrl } };

    if (esBlobUrl) {
      const res  = await fetch(bgUrl);
      const blob = await res.blob();
      const ext  = blob.type.includes('png') ? 'png' : 'jpg';
      fd.append('bg_imagen', new File([blob], `bg.${ext}`, { type: blob.type }));
    }

    fd.append('estado_editor', JSON.stringify(editorState));

    // Thumbnail — siempre lo generamos
    try {
      const thumb = await generateThumbnail(formato, editorState);
      if (thumb) fd.append('thumbnail', new File([thumb], 'thumb.jpg', { type: 'image/jpeg' }));
    } catch { /* no bloquear si falla */ }

    return fd;
  };

  const handleConfirm = async () => {
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    setError('');
    try {
      const fd = await buildPayload();
      let res;
      if (modoActualizar && plantillaActivaId) {
        fd.append('id', plantillaActivaId);
        res = await actualizar.mutateAsync(fd);
      } else {
        res = await crear.mutateAsync(fd);
      }
      onSaved(res.id, nombre.trim());
    } catch {
      setError('Ocurrió un error al guardar. Intentá de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <BookMarked size={16} className="text-[#c9a84c]" /> Guardar plantilla
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-white/50 uppercase tracking-wide block mb-1.5">
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            placeholder="Ej: Promo Verano 2025"
            autoFocus
            className="w-full border border-slate-200 dark:border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white bg-white dark:bg-white/[0.04] outline-none focus:border-[#c9a84c]/60 transition-all placeholder-slate-300 dark:placeholder-white/20"
          />
        </div>

        {plantillaActivaId && (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="radio" checked={modoActualizar} onChange={() => handleModo(true)} className="accent-[#c9a84c]" />
              <span className="text-sm text-slate-700 dark:text-white/70">Actualizar la plantilla actual</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="radio" checked={!modoActualizar} onChange={() => handleModo(false)} className="accent-[#c9a84c]" />
              <span className="text-sm text-slate-700 dark:text-white/70">Guardar como nueva plantilla</span>
            </label>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.10] text-sm text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all font-medium">
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-60 text-black text-sm font-bold transition-all flex items-center justify-center gap-1.5">
            {isPending ? <><Loader2 size={13} className="animate-spin"/> Guardando…</> : <><CheckCircle2 size={13}/> Guardar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function getDefaultBloquesEditorial() {
  return [
    newBloque({
      nombre: 'Etiqueta',
      texto: 'NUEVO INGRESO',
      size: 30, fontWeight: 700, uppercase: true, letterSpacing: 8,
      x: 8, y: 4, color: '#888888',
    }),
    newBloque({
      nombre: 'Dirección',
      texto: 'Av. del Libertador 1234',
      size: 44, fontWeight: 700, bold: true, uppercase: true, letterSpacing: 3,
      x: 8, y: 10, color: '#111111',
    }),
    newBloque({
      nombre: 'Detalles',
      texto: '3 amb · 78 m²  ·  Palermo',
      size: 30, fontWeight: 400,
      x: 8, y: 21, color: '#666666',
    }),
    newBloque({
      nombre: 'Título principal',
      texto: 'PALERMO',
      size: 200, fontWeight: 900, uppercase: true, letterSpacing: -5,
      x: 3, y: 32,
      color: '#111111',
      maxWidthPct: 95,
      strokeColor: '#111111',
      strokeWidth: 3,
      strokeOnly: true,
      textAlign: 'left',
      font: '"Cormorant Garamond",Georgia,serif',
    }),
    newBloque({
      nombre: 'Ubicación',
      texto: '📍 Buenos Aires, Argentina',
      size: 30, fontWeight: 400,
      x: 8, y: 88, color: '#FFFFFF',
    }),
  ];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CreadorContenido({ onClose, clienteId }) {
  const [step, setStep]                     = useState(1);
  const [tipo, setTipo]                     = useState(null);
  const [plantilla, setPlantilla]           = useState(null);
  const [templateConfig, setTplCfg]         = useState(null);
  const [bloques, setBloques]               = useState([]);
  const [selectedId, setSelectedId]         = useState(null);
  const [generando, setGenerando]           = useState(false);
  const [guardando, setGuardando]           = useState(false);
  const [guardadoOk, setGuardadoOk]         = useState(false);
  const [lightbox, setLightbox]             = useState(null);
  const [plantillaActivaId,     setPlantillaActivaId]     = useState(null);
  const [plantillaActivaNombre, setPlantillaActivaNombre] = useState('');
  const [modalGuardar, setModalGuardar]     = useState(false);

  // Cargar Google Fonts al montar
  useEffect(() => { ensureGFontsLoaded(); }, []);

  const upd    = useCallback((id, patch) => setBloques(bs => bs.map(b => b.id===id ? {...b,...patch} : b)), []);
  const onMove = useCallback((id, pos) => upd(id, pos), [upd]);

  const handleDownload = async (state) => {
    setGenerando(true);
    try {
      const canvas = document.createElement('canvas');
      await renderToCanvas(canvas, state);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `contenido-${state.tipo}-${Date.now()}.png`;
        a.click(); URL.revokeObjectURL(url);
      }, 'image/png');
    } finally { setGenerando(false); }
  };

  const handleGuardarGaleria = async (state) => {
    setGuardando(true);
    try {
      const canvas = document.createElement('canvas');
      await renderToCanvas(canvas, state);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      if (!blob) throw new Error('No se pudo generar la imagen.');
      const fd = new FormData();
      fd.append('archivos[]', new File([blob], `creador-${Date.now()}.png`, { type: 'image/png' }));
      fd.append('plataforma', state.tipo);
      await api.post(`/clientes/${clienteId}/assets/upload`, fd);
      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 3000);
    } catch (e) {
      console.error('Error al guardar en galería:', e);
      alert('No se pudo guardar: ' + (e.response?.data?.message ?? e.message ?? 'Error desconocido'));
    } finally { setGuardando(false); }
  };

  const handleLightbox = async (state) => {
    setLightbox('loading');
    const canvas = document.createElement('canvas');
    await renderToCanvas(canvas, state);
    canvas.toBlob(blob => setLightbox(URL.createObjectURL(blob)), 'image/png');
  };

  const goStep2 = (t) => { setTipo(t); setStep(2); };
  const goStep3 = (p, cfg) => { setPlantilla(p); setTplCfg(cfg); setStep(3); };
  const goStep4 = useCallback((entry, activePlantilla) => {
    if (entry?.estado_editor) {
      const rawCfg = entry.estado_editor.templateConfig;
      setTplCfg({ ...rawCfg, bgUrl: rawCfg.bgUrl ? imageUrl(rawCfg.bgUrl) : rawCfg.bgUrl });
      setBloques(entry.estado_editor.bloques.map(b => ({ ...b, id: _uid++ })));
      setPlantillaActivaId(entry.id);
      setPlantillaActivaNombre(entry.nombre ?? '');
    } else {
      setBloques(
        activePlantilla === 'editorial'
          ? getDefaultBloquesEditorial()
          : [
              newBloque({ nombre: 'Título',      size: 80, bold: true, x: 8, y: 8,  color: '#000000' }),
              newBloque({ nombre: 'Descripción', size: 42,             x: 8, y: 72, color: '#000000' }),
            ]
      );
      setPlantillaActivaId(null);
    }
    setStep(4);
  }, []);

  const STEPS = ['Formato', 'Tipo', 'Mis Plantillas', 'Editor'];

  return (
    <div className="flex flex-col bg-white dark:bg-[#0f0f0f]" style={{ minHeight: '80vh' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-white/[0.06] flex-shrink-0 sticky top-0 z-10 bg-white dark:bg-[#0f0f0f]">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ArrowLeft size={15}/> Volver
        </button>

        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <StepDot n={i+1} current={step} />
              <span className={`text-xs font-medium transition-colors ${step===i+1 ? 'text-slate-800 dark:text-white' : 'text-slate-300 dark:text-white/20'}`}>{s}</span>
              {i < STEPS.length-1 && <div className={`w-8 h-px ${step > i+1 ? 'bg-[#c9a84c]' : 'bg-slate-200 dark:bg-white/[0.08]'}`}/>}
            </div>
          ))}
        </div>

        <div className="w-24"/> {/* spacer */}
      </div>

      {/* Steps */}
      {step === 1 && <FormatoStep onNext={goStep2} />}
      {step === 2 && <PlantillaStep tipo={tipo} onNext={goStep3} onBack={() => setStep(1)} />}
      {step === 3 && (
        <MisPlantillasStep
          clienteId={clienteId}
          formato={tipo}
          tipo={plantilla}
          onNext={goStep4}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <EditorStep
          tipo={tipo}
          plantilla={plantilla}
          templateConfig={templateConfig}
          bloques={bloques}
          setBloques={setBloques}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          upd={upd}
          onMove={onMove}
          onBack={() => setStep(3)}
          handleDownload={handleDownload}
          handleLightbox={handleLightbox}
          handleGuardarGaleria={handleGuardarGaleria}
          generando={generando}
          guardando={guardando}
          guardadoOk={guardadoOk}
          onSaveNamed={clienteId ? (cfg) => { setTplCfg(cfg); setModalGuardar(true); } : null}
        />
      )}

      {/* Modal guardar plantilla */}
      {modalGuardar && (
        <GuardarPlantillaModal
          clienteId={clienteId}
          formato={tipo}
          tipo={plantilla}
          bloques={bloques}
          templateConfig={templateConfig}
          plantillaActivaId={plantillaActivaId}
          plantillaActivaNombre={plantillaActivaNombre}
          onSaved={(id, nombre) => { setPlantillaActivaId(id); setPlantillaActivaNombre(nombre); setModalGuardar(false); }}
          onClose={() => setModalGuardar(false)}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white" onClick={() => setLightbox(null)}><X size={26}/></button>
          {lightbox === 'loading'
            ? <Loader2 size={32} className="animate-spin text-white/40"/>
            : <img src={lightbox} className="max-h-full max-w-full object-contain rounded-xl" onClick={e => e.stopPropagation()} alt=""/>
          }
        </div>
      )}
    </div>
  );
}
