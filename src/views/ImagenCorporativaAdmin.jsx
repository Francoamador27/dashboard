import React, { useState, useEffect } from 'react';
import clienteAxios from '../config/axios';
import { Image as ImageIcon, CheckCircle, Loader, Youtube, Leaf } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const toAbsolute = (url) =>
  url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;

function UploadZone({ file, currentUrl, accept = 'image/*', onChange, icon: Icon, label, hint }) {
  const preview = file ? URL.createObjectURL(file) : toAbsolute(currentUrl);
  return (
    <div className="space-y-4">
      <label className="border-4 border-dashed border-gray-100 hover:border-[#fdce27] rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all">
        <Icon className="text-gray-300 w-12 h-12" />
        <span className="text-sm font-bold text-gray-500 text-center">
          {file ? file.name : label}
        </span>
        <span className="text-xs text-gray-400 tracking-wider font-semibold">{hint}</span>
        <input type="file" accept={accept} hidden onChange={onChange} />
      </label>
      {preview && (
        <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 flex flex-col items-center">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 w-full text-left">
            Vista previa actual:
          </p>
          <img
            src={preview}
            alt="preview"
            className="max-h-56 w-auto object-contain rounded-xl shadow-lg border-4 border-white"
          />
        </div>
      )}
    </div>
  );
}

function ResourceSection({ title, subtitle, color = '#fdce27', children, onSave, saving, saved, error }) {
  return (
    <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#1c1c1c] uppercase tracking-tight">
          {title.split(' ').map((word, i) =>
            i === title.split(' ').length - 1
              ? <span key={i} style={{ color }}> {word}</span>
              : <span key={i}>{word} </span>
          )}
        </h2>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      </div>

      {children}

      {error && (
        <div className="p-3 rounded-xl font-bold flex items-center gap-2 text-sm bg-red-50 text-red-600 border border-red-200">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 rounded-xl font-bold flex items-center gap-2 text-sm bg-green-50 text-green-700 border border-green-200">
          <CheckCircle size={16} /> Guardado correctamente.
        </div>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="w-full bg-[#1c1c1c] text-white hover:bg-[#fdce27] hover:text-[#1c1c1c] text-sm uppercase tracking-widest font-black px-6 py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {saving ? <><Loader size={16} className="animate-spin" /> Guardando...</> : 'Guardar'}
      </button>
    </div>
  );
}

export default function RecursosAdmin() {
  const token = localStorage.getItem('AUTH_TOKEN');
  const [cargando, setCargando] = useState(true);
  const [settings, setSettings] = useState({});

  // Estado por sección
  const [imgCorp, setImgCorp] = useState(null);
  const [imgCalidad, setImgCalidad] = useState(null);
  const [imgCompromiso, setImgCompromiso] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    clienteAxios.get('/api/settings').then(({ data }) => {
      setSettings(data);
      setVideoUrl(data.video_quienes_somos || '');
    }).finally(() => setCargando(false));
  }, []);

  const save = async (key, fields) => {
    setSaving(s => ({ ...s, [key]: true }));
    setSaved(s => ({ ...s, [key]: false }));
    setErrors(e => ({ ...e, [key]: null }));
    try {
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => { if (v !== null && v !== undefined) formData.append(k, v); });
      const { data } = await clienteAxios.post('/api/settings', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSettings(data.settings);
      setSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 3000);
    } catch {
      setErrors(e => ({ ...e, [key]: 'Error al guardar. Intentá nuevamente.' }));
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  if (cargando) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-[#fdce27]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl lg:text-4xl font-black text-[#1c1c1c] mb-2 uppercase tracking-tight">
          <span className="text-[#fdce27]">Recursos</span>
        </h1>
        <p className="text-gray-500 font-medium">Administrá las imágenes y videos que se muestran en las distintas secciones del sitio.</p>
      </div>

      {/* Imagen Corporativa */}
      <ResourceSection
        title="Imagen Corporativa"
        subtitle="Se muestra en la sección 'Nuestra Misión' dentro de Quiénes Somos."
        onSave={() => save('corp', { imagen_corporativa: imgCorp })}
        saving={saving.corp}
        saved={saved.corp}
        error={errors.corp}
      >
        <UploadZone
          file={imgCorp}
          currentUrl={settings.imagen_corporativa}
          onChange={e => setImgCorp(e.target.files?.[0] || null)}
          icon={ImageIcon}
          label="Clic para seleccionar imagen corporativa"
          hint="JPG, PNG o WEBP — máx. 4 MB"
        />
      </ResourceSection>

      {/* Imagen Calidad */}
      <ResourceSection
        title="Imagen Calidad"
        subtitle="Se muestra en la página de Calidad Certificada."
        onSave={() => save('calidad', { imagen_calidad: imgCalidad })}
        saving={saving.calidad}
        saved={saved.calidad}
        error={errors.calidad}
      >
        <UploadZone
          file={imgCalidad}
          currentUrl={settings.imagen_calidad}
          onChange={e => setImgCalidad(e.target.files?.[0] || null)}
          icon={ImageIcon}
          label="Clic para seleccionar imagen de calidad"
          hint="JPG, PNG o WEBP — máx. 4 MB"
        />
      </ResourceSection>

      {/* Video Quiénes Somos */}
      <ResourceSection
        title="Video Quiénes Somos"
        subtitle="URL de YouTube que se incrusta en la página Quiénes Somos."
        onSave={() => save('video', { video_quienes_somos: videoUrl })}
        saving={saving.video}
        saved={saved.video}
        error={errors.video}
      >
        <div className="space-y-3">
          <label className="block text-sm font-black text-gray-400 uppercase tracking-widest">
            URL de YouTube
          </label>
          <div className="flex items-center gap-3 border-2 border-gray-100 hover:border-[#fdce27] focus-within:border-[#fdce27] rounded-2xl px-4 py-3 transition-all">
            <Youtube className="text-red-500 w-5 h-5 flex-shrink-0" />
            <input
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 outline-none text-sm font-medium text-gray-700 bg-transparent"
            />
          </div>
          {videoUrl && (() => {
            const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : (videoUrl.includes('/embed/') ? videoUrl : null);
            return embedUrl ? (
              <div className="rounded-2xl overflow-hidden border-2 border-gray-100 aspect-video">
                <iframe src={embedUrl} className="w-full h-full" title="Vista previa" allowFullScreen />
              </div>
            ) : <p className="text-xs text-red-500 font-semibold">URL de YouTube no reconocida.</p>;
          })()}
        </div>
      </ResourceSection>

      {/* Imagen Compromiso */}
      <ResourceSection
        title="Imagen Compromiso"
        subtitle="Se muestra en la página de Compromiso Ambiental."
        color="rgb(22 163 74)"
        onSave={() => save('compromiso', { imagen_compromiso: imgCompromiso })}
        saving={saving.compromiso}
        saved={saved.compromiso}
        error={errors.compromiso}
      >
        <UploadZone
          file={imgCompromiso}
          currentUrl={settings.imagen_compromiso}
          onChange={e => setImgCompromiso(e.target.files?.[0] || null)}
          icon={Leaf}
          label="Clic para seleccionar imagen de compromiso"
          hint="JPG, PNG o WEBP — máx. 4 MB"
        />
      </ResourceSection>
    </div>
  );
}
