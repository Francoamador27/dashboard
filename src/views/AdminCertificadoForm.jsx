import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Loader, X, Save, FileText, ArrowLeft } from 'lucide-react';
import clienteAxios from '../config/axios';
import { mostrarExito, mostrarError } from '../utils/Alertas';

export default function AdminCertificadoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [certificado, setCertificado] = useState({
    titulo: '',
    descripcion: '',
    imagen: null,
    documento: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [docName, setDocName] = useState('');

  useEffect(() => {
    if (id) {
      fetchCertificado();
    }
  }, [id]);

  const fetchCertificado = async () => {
    try {
      setLoading(true);
      const { data } = await clienteAxios.get(`/api/certificados/${id}`);
      const certData = data?.data || {};

      setCertificado({
        titulo: certData.titulo || '',
        descripcion: certData.descripcion || '',
        imagen: null,
        documento: null,
      });
      setImagePreview(certData.imagen);
      
      if (certData.documento) {
        const parts = certData.documento.split('/');
        setDocName(parts[parts.length - 1]);
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al cargar el certificado');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCertificado({ ...certificado, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificado({ ...certificado, imagen: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificado({ ...certificado, documento: file });
      setDocName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('titulo', certificado.titulo);
      formData.append('descripcion', certificado.descripcion || '');
      
      if (certificado.imagen instanceof File) {
        formData.append('imagen', certificado.imagen);
      }
      
      if (certificado.documento instanceof File) {
        formData.append('documento', certificado.documento);
      }

      if (id) {
        // Laravel logic handles POST with _method=PUT often for files
        await clienteAxios.post(`/api/certificados/${id}?_method=PUT`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await clienteAxios.post('/api/certificados', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      mostrarExito(id ? 'Certificado actualizado' : 'Certificado creado');
      navigate('/admin-dash/certificados');
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al guardar el certificado');
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
            {id ? 'Editar Certificado' : 'Nuevo Certificado'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Imagen de Previsualización */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Imagen de Previsualización (Miniatura)</label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="relative aspect-square md:aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center group">
                {imagePreview ? (
                    <>
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setCertificado({ ...certificado, imagen: null });
                                setImagePreview(null);
                            }}
                            className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <div className="text-center p-6">
                        <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargar Imagen</p>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title=""
                />
            </div>
            <div className="space-y-4">
                <p className="text-sm text-slate-500 leading-relaxed italic">
                    Esta imagen se mostrará como miniatura en la sección de Calidad. Recomendado: formato .webp, .jpg o .png (Máx 2MB).
                </p>
            </div>
          </div>
        </div>

        {/* Documento PDF/DOC */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Documento Descargable</label>
          
          <div className="relative group">
            <div className={`p-6 border-2 border-dashed rounded-xl transition-all flex items-center gap-4 ${docName ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-[#fdce27] hover:bg-slate-50'}`}>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${docName ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <FileText size={20} />
                </div>
                <div className="flex-1">
                    <p className={`text-sm font-bold uppercase tracking-tight ${docName ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {docName || 'Seleccionar Documento'}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                        {docName ? 'Cambiar archivo' : 'PDF, DOC, DOCX (Máx 10MB)'}
                    </p>
                </div>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
            </div>
          </div>
        </div>

        {/* Datos */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Título del Certificado</label>
                <input
                    type="text"
                    name="titulo"
                    value={certificado.titulo}
                    onChange={handleInputChange}
                    placeholder="Ej: Certificación ISO 9001:2015"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] outline-none transition-all font-bold text-slate-800"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Descripción (Opcional)</label>
                <textarea
                    name="descripcion"
                    value={certificado.descripcion}
                    onChange={handleInputChange}
                    placeholder="Breve descripción de lo que acredita este certificado..."
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] outline-none transition-all text-slate-800 resize-none"
                />
            </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#1c1c1c] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[#fdce27] hover:text-[#1c1c1c] disabled:bg-slate-300 transition-all transform hover:-translate-y-1"
          >
            {saving ? (
                <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Guardando...
                </>
            ) : (
                <>
                    <Save className="w-5 h-5" />
                    {id ? 'Guardar Cambios' : 'Crear Certificado'}
                </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-10 py-5 bg-white border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
