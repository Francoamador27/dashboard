import { useEffect, useState } from 'react';
import { Youtube, Save, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../config/axios';
import { mostrarExito, mostrarError } from '../utils/Alertas';

export default function AdminVideoMain() {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await clienteAxios.get('/api/settings');
      setVideoUrl(data.video_principal || '');
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica de YouTube URL
    if (videoUrl && !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      mostrarError('Por favor, ingresa una URL válida de YouTube');
      return;
    }

    try {
      setSaving(true);
      await clienteAxios.post('/api/settings', { video_principal: videoUrl });
      mostrarExito('Video actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader className="w-12 h-12 text-[#fdce27] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
      <div className="mb-10 flex items-center gap-4">
        <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
            Video <span className="text-[#fdce27]">Principal</span>
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <Youtube size={28} />
            </div>
            <div>
                <h3 className="text-lg font-black text-[#1c1c1c] uppercase tracking-tight">Configuración de Video</h3>
                <p className="text-sm text-slate-500">Define el video que se mostrará en la página principal.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">URL de YouTube</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] outline-none transition-all font-bold text-slate-800"
              required
            />
            <p className="mt-3 text-xs text-slate-400 italic">
                Copia y pega la URL completa del video de YouTube que deseas destacar.
            </p>
          </div>

          <div className="pt-4">
            <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#1c1c1c] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[#fdce27] hover:text-[#1c1c1c] disabled:bg-slate-300 transition-all transform hover:-translate-y-1"
            >
                {saving ? (
                    <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Guardando...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Guardar Configuración
                    </>
                )}
            </button>
          </div>
        </form>
      </div>

      {videoUrl && (
        <div className="mt-12">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Vista Previa</h4>
            <div className="aspect-video rounded-3xl overflow-hidden bg-[#1c1c1c] shadow-2xl border-4 border-white">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
      )}
    </div>
  );
}
