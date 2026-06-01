import React, { useEffect, useState, useCallback } from "react";
import clienteAxios from "../../config/axios";

const GA4_RE = /^G-[A-Z0-9]+$/i;
const GTM_RE = /^GTM-[A-Z0-9]+$/i;
const FB_PIXEL_RE = /^\d+$/;
const HOTJAR_RE = /^\d+$/;

const Integration = ({ token, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  // Campos
  const [enabled, setEnabled] = useState({
    gtm: false,
    ga4: false,
    gsc: false,
    fb: false,
    hotjar: false,
    custom: false,
  });
  const [gtmId, setGtmId] = useState("");
  const [gaMeasurementId, setGaMeasurementId] = useState("");
  const [gscMetaContent, setGscMetaContent] = useState(""); // valor para meta name="google-site-verification"
  const [fbPixelId, setFbPixelId] = useState("");
  const [hotjarId, setHotjarId] = useState("");
  const [customHeadCode, setCustomHeadCode] = useState("");

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const hydrateFromApi = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // Ajustá el endpoint si tu backend expone otro (por ejemplo /api/seo-config)
      const { data } = await clienteAxios.get("/api/integrations", { headers: authHeader });

      // Ejemplo de shape esperado (adecuar si tu backend difiere):
      // {
      //   enabled: { gtm: true, ga4: true, ... },
      //   gtm_id: "GTM-XXXX",
      //   ga_measurement_id: "G-XXXX",
      //   gsc_meta: "abcdef...",
      //   fb_pixel_id: "1234567890",
      //   hotjar_id: "123456",
      //   custom_head_code: "<meta ...>"
      // }

      setEnabled({
        gtm: !!data?.enabled?.gtm,
        ga4: !!data?.enabled?.ga4,
        gsc: !!data?.enabled?.gsc,
        fb: !!data?.enabled?.fb,
        hotjar: !!data?.enabled?.hotjar,
        custom: !!data?.enabled?.custom,
      });

      setGtmId(data?.gtm_id || "");
      setGaMeasurementId(data?.ga_measurement_id || "");
      setGscMetaContent(data?.gsc_meta || "");
      setFbPixelId(data?.fb_pixel_id || "");
      setHotjarId(data?.hotjar_id || "");
      setCustomHeadCode(data?.custom_head_code || "");
    } catch (e) {
      console.error(e);
      setErr("No se pudo cargar la configuración de integraciones.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    hydrateFromApi();
  }, [hydrateFromApi]);

  const validate = () => {
    // validaciones (solo si están habilitados)
    if (enabled.gtm && gtmId && !GTM_RE.test(gtmId)) return "El ID de Google Tag Manager no tiene formato válido (ej: GTM-XXXX).";
    if (enabled.ga4 && gaMeasurementId && !GA4_RE.test(gaMeasurementId)) return "El Measurement ID de GA4 no tiene formato válido (ej: G-XXXX).";
    if (enabled.fb && fbPixelId && !FB_PIXEL_RE.test(fbPixelId)) return "El ID de Pixel de Facebook debe ser numérico.";
    if (enabled.hotjar && hotjarId && !HOTJAR_RE.test(hotjarId)) return "El ID de Hotjar debe ser numérico.";
    // gscMetaContent no tiene formato estricto (puede ser token alfanumérico)
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const vErr = validate();
    if (vErr) return setErr(vErr);

    const payload = {
      enabled,
      gtm_id: gtmId || null,
      ga_measurement_id: gaMeasurementId || null,
      gsc_meta: gscMetaContent || null,
      fb_pixel_id: fbPixelId || null,
      hotjar_id: hotjarId || null,
      custom_head_code: customHeadCode || null,
    };

    try {
      setSaving(true);
      await clienteAxios.put("/api/integrations", payload, { headers: authHeader });
      setMsg("Configuración guardada correctamente.");
      onSaved && onSaved();
      await hydrateFromApi();
    } catch (e) {
      console.error(e);
      setErr("No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const buildHeadSnippet = () => {
    // genera un snippet con las etiquetas que conviene poner dentro de <head>
    let out = "";

    if (enabled.gsc && gscMetaContent) {
      out += `<!-- Google Search Console verification -->\n<meta name="google-site-verification" content="${gscMetaContent}" />\n\n`;
    }

    if (enabled.gtm && gtmId) {
      out += `<!-- Google Tag Manager (head) -->\n<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');</script>\n\n`;
    }

    if (enabled.ga4 && gaMeasurementId) {
      out += `<!-- Google Analytics 4 -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}"></script>\n<script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaMeasurementId}');</script>\n\n`;
    }

    if (enabled.fb && fbPixelId) {
      out += `<!-- Facebook Pixel -->\n<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '${fbPixelId}'); fbq('track', 'PageView');</script>\n\n`;
    }

    if (enabled.hotjar && hotjarId) {
      out += `<!-- Hotjar -->\n<script> (function(h,o,t,j,a,r){ h.hj = h.hj || function(){(h.hj.q = h.hj.q || []).push(arguments)}; h._hjSettings={hjid:${hotjarId},hjsv:6}; a=o.getElementsByTagName('head')[0]; r=o.createElement('script'); r.async=1; r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv; a.appendChild(r); })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv='); </script>\n\n`;
    }

    if (enabled.custom && customHeadCode) {
      out += `<!-- Custom code -->\n${customHeadCode}\n\n`;
    }

    return out.trim();
  };

  const copySnippet = async () => {
    const snippet = buildHeadSnippet();
    if (!snippet) return setErr("No hay código para copiar. Habilitá e ingresá IDs/valores.");
    try {
      await navigator.clipboard.writeText(snippet);
      setMsg("Snippet copiado al portapapeles.");
    } catch (e) {
      console.error(e);
      setErr("No se pudo copiar al portapapeles. Copialo manualmente.");
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-600">Cargando configuración…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {msg && <div className="mb-3 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">{msg}</div>}
      {err && <div className="mb-3 text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">{err}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {/* GTM */}
        <div className="md:col-span-1">
          <label className="flex items-center justify-between">
            <span className="block text-sm font-medium text-slate-700 mb-1">Google Tag Manager</span>
            <label className="text-xs text-slate-500">
              <input type="checkbox" checked={enabled.gtm} onChange={(e) => setEnabled(s => ({ ...s, gtm: e.target.checked }))} />
              <span className="ml-2">Habilitar</span>
            </label>
          </label>
          <input type="text" value={gtmId} onChange={(e) => setGtmId(e.target.value)}
                 placeholder="GTM-XXXX"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <p className="text-xs text-slate-500 mt-1">El ID comienza con <code>GTM-</code>. También necesitás pegar el fragmento en el <code>body</code> (no solo en head) si usás GTM.</p>
        </div>

        {/* GA4 */}
        <div>
          <label className="flex items-center justify-between">
            <span className="block text-sm font-medium text-slate-700 mb-1">Google Analytics (GA4)</span>
            <label className="text-xs text-slate-500">
              <input type="checkbox" checked={enabled.ga4} onChange={(e) => setEnabled(s => ({ ...s, ga4: e.target.checked }))} />
              <span className="ml-2">Habilitar</span>
            </label>
          </label>
          <input type="text" value={gaMeasurementId} onChange={(e) => setGaMeasurementId(e.target.value)}
                 placeholder="G-XXXX"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <p className="text-xs text-slate-500 mt-1">Measurement ID de GA4 (ej: <code>G-XXXXXXXX</code>).</p>
        </div>

        {/* Search Console */}
        <div>
          <label className="flex items-center justify-between">
            <span className="block text-sm font-medium text-slate-700 mb-1">Google Search Console (meta)</span>
            <label className="text-xs text-slate-500">
              <input type="checkbox" checked={enabled.gsc} onChange={(e) => setEnabled(s => ({ ...s, gsc: e.target.checked }))} />
              <span className="ml-2">Habilitar</span>
            </label>
          </label>
          <input type="text" value={gscMetaContent} onChange={(e) => setGscMetaContent(e.target.value)}
                 placeholder="valor de verificación"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <p className="text-xs text-slate-500 mt-1">Valor que proporciona Search Console (<code>&lt;meta name="google-site-verification" content="..." /&gt;</code>).</p>
        </div>

        {/* Facebook Pixel */}
        <div>
          <label className="flex items-center justify-between">
            <span className="block text-sm font-medium text-slate-700 mb-1">Facebook Pixel</span>
            <label className="text-xs text-slate-500">
              <input type="checkbox" checked={enabled.fb} onChange={(e) => setEnabled(s => ({ ...s, fb: e.target.checked }))} />
              <span className="ml-2">Habilitar</span>
            </label>
          </label>
          <input type="text" value={fbPixelId} onChange={(e) => setFbPixelId(e.target.value)}
                 placeholder="1234567890"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <p className="text-xs text-slate-500 mt-1">ID numérico del Pixel de Facebook.</p>
        </div>

        {/* Hotjar */}
        <div>
          <label className="flex items-center justify-between">
            <span className="block text-sm font-medium text-slate-700 mb-1">Hotjar</span>
            <label className="text-xs text-slate-500">
              <input type="checkbox" checked={enabled.hotjar} onChange={(e) => setEnabled(s => ({ ...s, hotjar: e.target.checked }))} />
              <span className="ml-2">Habilitar</span>
            </label>
          </label>
          <input type="text" value={hotjarId} onChange={(e) => setHotjarId(e.target.value)}
                 placeholder="123456"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <p className="text-xs text-slate-500 mt-1">ID de Hotjar (numérico).</p>
        </div>

        {/* Custom head code */}
        <div className="md:col-span-2">
          <label className="flex items-center justify-between">
            <span className="block text-sm font-medium text-slate-700 mb-1">Código personalizado para &lt;head&gt;</span>
            <label className="text-xs text-slate-500">
              <input type="checkbox" checked={enabled.custom} onChange={(e) => setEnabled(s => ({ ...s, custom: e.target.checked }))} />
              <span className="ml-2">Habilitar</span>
            </label>
          </label>
          <textarea value={customHeadCode} onChange={(e) => setCustomHeadCode(e.target.value)}
                    placeholder="<meta name='robots' content='noindex'>"
                    rows={6}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <p className="text-xs text-slate-500 mt-1">Cualquier etiqueta o script que quieras inyectar en el head (por ejemplo meta tags, JSON-LD, etc.).</p>
        </div>
      </div>

      {/* Snippet preview + copy */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Snippet generado para &lt;head&gt; (vista previa)</label>
        <textarea readOnly value={buildHeadSnippet()} rows={10} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-xs" />
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={copySnippet} className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm">Copiar snippet</button>
          <button type="button" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(buildHeadSnippet()); setMsg("Snippet copiado al portapapeles."); }} className="px-4 py-2 rounded-lg bg-slate-200 text-sm text-slate-700">Copiar (alternativo)</button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Cola el contenido en tu plantilla principal dentro de <code>&lt;head&gt;</code>. Si usás GTM acordate de agregar también el fragmento en <code>&lt;body&gt;</code> (no incluido en este textarea).</p>
      </div>

      <div className="pt-1">
        <button type="submit" disabled={saving} className={`px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm ${saving ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"}`}>
          {saving ? "Guardando…" : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
};

export default Integration;
