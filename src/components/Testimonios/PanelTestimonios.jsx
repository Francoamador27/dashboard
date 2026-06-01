import React, { useState, useEffect } from 'react';
import TestimoniosForm from '../TestimoniosForm';
import clienteAxios from '../../config/axios';

const PanelTestimonios = () => {
  const token = localStorage.getItem('AUTH_TOKEN');
  const [tab, setTab] = useState('crear');
  const [testimonios, setTestimonios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const obtenerTestimonios = async () => {
    try {
      setCargando(true);
      const { data } = await clienteAxios.get('/api/testimonios');
      setTestimonios(data.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener los testimonios');
    } finally {
      setCargando(false);
    }
  };

  const eliminarTestimonio = async (id) => {
    const confirmar = confirm('¿Estás seguro de que querés eliminar este testimonio?');
    if (!confirmar) return;

    try {
      await clienteAxios.delete(`/api/testimonios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTestimonios(testimonios.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el testimonio');
    }
  };

  useEffect(() => {
    if (tab === 'ver') obtenerTestimonios();
  }, [tab]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex space-x-4 border-b mb-6 pb-2">
        <button
          onClick={() => setTab('crear')}
          className={`text-sm font-semibold px-4 py-2 rounded-t ${tab === 'crear' ? 'bg-[#008DD2] text-white' : 'text-gray-600 hover:text-black'}`}
        >
          Crear nuevo testimonio
        </button>
        <button
          onClick={() => setTab('ver')}
          className={`text-sm font-semibold px-4 py-2 rounded-t ${tab === 'ver' ? 'bg-[#008DD2] text-white' : 'text-gray-600 hover:text-black'}`}
        >
          Ver testimonios
        </button>
      </div>

      {tab === 'crear' && <TestimoniosForm />}
      {tab === 'ver' && (
        <div className="overflow-x-auto">
          {cargando ? (
            <p>Cargando testimonios...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : testimonios.length === 0 ? (
            <p>No hay testimonios cargados.</p>
          ) : (
            <table className="min-w-full text-sm text-gray-800 bg-white">
              <thead className="bg-gray-100 text-xs text-gray-600 ">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Texto</th>
                  <th className="px-4 py-3 text-left">Imagen</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {testimonios.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 border-t border-gray-200 transition">
                    <td className="px-4 py-3">{t.id}</td>
                    <td className="px-4 py-3">{t.nombre}</td>
                    <td className="px-4 py-3">{t.texto}</td>
                    <td className="px-4 py-3">
                      <img src={`${import.meta.env.VITE_API_URL}storage/uploads/${t.imagen}`} alt="Testimonio" className="w-20 h-auto rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => eliminarTestimonio(t.id)}
                        className="text-red-600 hover:underline text-xs font-semibold"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          )}
        </div>
      )}
    </div>
  );
};

export default PanelTestimonios;
