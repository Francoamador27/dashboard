import React, { useState, useEffect } from 'react';
import clienteAxios from '../config/axios';
import { Image as ImageIcon, CheckCircle, Loader, Palette, Type, Layout, Sliders, Trash2 } from 'lucide-react';
import useCont from '../hooks/useCont';

const AdminFooter = () => {
  const token = localStorage.getItem('AUTH_TOKEN');
  const { reloadSettings } = useCont();

  const [settings, setSettings] = useState({
    footer_bg_type: 'color',
    footer_bg_color: '#f8fafc',
    footer_text_color: '#1c1c1c',
    footer_greyscale: false,
  });

  const [images, setImages] = useState({
    footer_bg_image: null,
    footer_logo1: null,
    footer_logo2: null,
    footer_logo: null,
  });

  const [previews, setPreviews] = useState({
    footer_bg_image: null,
    footer_logo1: null,
    footer_logo2: null,
    footer_logo: null,
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await clienteAxios.get('/api/settings');
      setSettings({
        footer_bg_type: data.footer_bg_type || 'color',
        footer_bg_color: data.footer_bg_color || '#f8fafc',
        footer_text_color: data.footer_text_color || '#1c1c1c',
        footer_greyscale: !!data.footer_greyscale,
      });

      const getImageUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL}/${path}`;
      };

      setPreviews({
        footer_bg_image: getImageUrl(data.footer_bg_image),
        footer_logo1: getImageUrl(data.footer_logo1),
        footer_logo2: getImageUrl(data.footer_logo2),
        footer_logo: getImageUrl(data.footer_logo),
      });
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setCargando(false);
    }
  };

  const onFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setMensaje({ tipo: 'error', texto: 'Por favor, selecciona una imagen válida.' });
      return;
    }

    setImages(prev => ({ ...prev, [field]: file }));
    setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    setMensaje({ tipo: '', texto: '' });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      setMensaje({ tipo: '', texto: '' });

      const formData = new FormData();
      formData.append('footer_bg_type', settings.footer_bg_type);
      formData.append('footer_bg_color', settings.footer_bg_color);
      formData.append('footer_text_color', settings.footer_text_color);
      formData.append('footer_greyscale', settings.footer_greyscale ? 1 : 0);

      if (images.footer_bg_image) formData.append('footer_bg_image', images.footer_bg_image);
      if (images.footer_logo1) formData.append('footer_logo1', images.footer_logo1);
      if (images.footer_logo2) formData.append('footer_logo2', images.footer_logo2);
      if (images.footer_logo) formData.append('footer_logo', images.footer_logo);

      await clienteAxios.post('/api/settings', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMensaje({ tipo: 'exito', texto: 'Configuración del footer actualizada con éxito.' });
      reloadSettings();
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar la configuración.' });
    } finally {
      setGuardando(false);
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
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#1c1c1c] uppercase tracking-tight">
            Configuración <span className="text-[#fdce27]">Footer</span>
          </h1>
          <p className="text-gray-500 font-medium">Personaliza el aspecto visual de la parte inferior de tu sitio.</p>
        </div>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="bg-[#1c1c1c] text-white hover:bg-[#fdce27] hover:text-[#1c1c1c] text-sm uppercase tracking-widest font-black px-8 py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {guardando ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {mensaje.texto && (
        <div className={`p-5 rounded-2xl font-bold flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
          mensaje.tipo === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
        }`}>
          {mensaje.tipo === 'exito' ? <CheckCircle size={20} /> : <Trash2 size={20} />}
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Fondo */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#fdce27]/10 rounded-lg text-[#d9a800]">
              <Layout size={20} />
            </div>
            <h2 className="text-xl font-black text-[#1c1c1c] uppercase tracking-wider">Fondo del Footer</h2>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Tipo de Fondo</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, footer_bg_type: 'color' }))}
                className={`py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all border-2 ${
                  settings.footer_bg_type === 'color' 
                  ? 'bg-[#1c1c1c] text-white border-[#1c1c1c]' 
                  : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                Color Sólido
              </button>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, footer_bg_type: 'image' }))}
                className={`py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all border-2 ${
                  settings.footer_bg_type === 'image' 
                  ? 'bg-[#1c1c1c] text-white border-[#1c1c1c]' 
                  : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                Imagen de Fondo
              </button>
            </div>
          </div>

          {settings.footer_bg_type === 'color' ? (
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Color de Fondo</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  name="footer_bg_color"
                  value={settings.footer_bg_color}
                  onChange={handleInputChange}
                  className="w-16 h-16 rounded-xl cursor-pointer border-4 border-white shadow-sm"
                />
                <input
                  type="text"
                  name="footer_bg_color"
                  value={settings.footer_bg_color}
                  onChange={handleInputChange}
                  placeholder="#FFFFFF"
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 font-mono font-bold text-[#1c1c1c]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 pt-4 border-t border-gray-50">
              <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Subir Imagen de Fondo</label>
                <label className="border-2 border-dashed border-gray-200 hover:border-[#fdce27] rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all group">
                  <ImageIcon className="text-gray-300 group-hover:text-[#fdce27] w-12 h-12 transition-colors" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seleccionar Imagen</span>
                  <input type="file" hidden onChange={(e) => onFileChange(e, 'footer_bg_image')} accept="image/*" />
                </label>
              </div>

              {previews.footer_bg_image && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group">
                  <img src={previews.footer_bg_image} alt="Preview bg" className={`w-full h-40 object-cover rounded-xl ${settings.footer_greyscale ? 'grayscale' : ''}`} />
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur inline-flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border border-white">
                    <span className="text-[10px] font-black uppercase text-[#1c1c1c] tracking-widest">Previsualización</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Sliders size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-[#1c1c1c]">Escala de Grises</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Aplica filtro B&N a la imagen</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="footer_greyscale"
                    checked={settings.footer_greyscale}
                    onChange={handleInputChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fdce27]"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Estilo de Texto y Logos Adicionales */}
        <div className="space-y-8">
          
          {/* Texto */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#fdce27]/10 rounded-lg text-[#d9a800]">
                <Type size={20} />
              </div>
              <h2 className="text-xl font-black text-[#1c1c1c] uppercase tracking-wider">Estilo de Texto</h2>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Color General de Texto</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  name="footer_text_color"
                  value={settings.footer_text_color}
                  onChange={handleInputChange}
                  className="w-16 h-16 rounded-xl cursor-pointer border-4 border-white shadow-sm"
                />
                <input
                  type="text"
                  name="footer_text_color"
                  value={settings.footer_text_color}
                  onChange={handleInputChange}
                  placeholder="#000000"
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 font-mono font-bold text-[#1c1c1c]"
                />
              </div>
              <p className="text-[10px] text-[#d9a800] font-black uppercase tracking-widest">* Los títulos siempre se mantendrán amarillos</p>
            </div>
          </div>

          {/* Logos */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#fdce27]/10 rounded-lg text-[#d9a800]">
                <Palette size={20} />
              </div>
              <h2 className="text-xl font-black text-[#1c1c1c] uppercase tracking-wider">Logos del Footer</h2>
            </div>

            <div className="space-y-6">
              {/* Logo Principal del Footer */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Logo Principal del Footer</label>
                <label className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all group min-h-[120px]">
                  {previews.footer_logo ? (
                    <img src={previews.footer_logo} alt="Logo Footer" className="max-h-24 w-auto object-contain" />
                  ) : (
                    <ImageIcon className="text-gray-300 group-hover:text-[#fdce27] w-10 h-10 transition-colors" />
                  )}
                  <input type="file" hidden onChange={(e) => onFileChange(e, 'footer_logo')} accept="image/*" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                {/* Logo 1 */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Logo Partner 1</label>
                  <label className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all group aspect-video">
                    {previews.footer_logo1 ? (
                      <img src={previews.footer_logo1} alt="Logo 1" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ImageIcon className="text-gray-300 group-hover:text-[#fdce27] w-8 h-8 transition-colors" />
                    )}
                    <input type="file" hidden onChange={(e) => onFileChange(e, 'footer_logo1')} accept="image/*" />
                  </label>
                </div>

                {/* Logo 2 */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Logo Partner 2</label>
                  <label className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all group aspect-video">
                    {previews.footer_logo2 ? (
                      <img src={previews.footer_logo2} alt="Logo 2" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ImageIcon className="text-gray-300 group-hover:text-[#fdce27] w-8 h-8 transition-colors" />
                    )}
                    <input type="file" hidden onChange={(e) => onFileChange(e, 'footer_logo2')} accept="image/*" />
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminFooter;
