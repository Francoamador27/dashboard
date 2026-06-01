import { useEffect, useState } from 'react';
import useSWR from 'swr';
import clienteAxios from '../../config/axios';
import { mostrarError, mostrarExito } from '../../utils/Alertas';
import { Save } from 'lucide-react';

const DatosForm = () => {
  const token = localStorage.getItem('AUTH_TOKEN');

  const fetcher = async () => {
    const response = await clienteAxios('/api/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  const { data: usuario, error, isLoading, mutate } = useSWR('/api/user', fetcher);

  const [formulario, setFormulario] = useState({
    name: '',
    email: '',
    telefono: '',
    dni: '',
    codigo_postal: '',
    direccion: '',
    localidad: '',
    provincia: '',
  });

  useEffect(() => {
    if (usuario) {
      setFormulario({
        name: usuario.name || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        dni: usuario.dni || '',
        codigo_postal: usuario.codigo_postal || '',
        direccion: usuario.direccion || '',
        localidad: usuario.localidad || '',
        provincia: usuario.provincia || '',
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardar = async () => {
    try {
      await clienteAxios.put('/api/user/update', formulario, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      mutate();
      mostrarExito('Tus datos fueron actualizados correctamente');
    } catch (error) {
      mostrarError('Error al actualizar los datos');
    }
  };

  if (isLoading) return <p className="text-center">Cargando datos...</p>;
  if (error) return <p className="text-center text-red-500">Error al cargar los datos</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#008DD2]">Datos personales</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          ['name', 'Nombre'],
          ['email', 'Email'],
          ['telefono', 'Teléfono'],
          ['dni', 'DNI'],
          ['codigo_postal', 'Código Postal'],
          ['direccion', 'Dirección'],
          ['localidad', 'Localidad'],
          ['provincia', 'Provincia'],
        ].map(([campo, label]) => (
          <div key={campo}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type="text"
              name={campo}
              value={formulario[campo]}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008DD2] focus:border-transparent transition"
            />
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button
          onClick={handleGuardar}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#008DD2] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#0072ad] hover:shadow-md transition-all duration-200"
        >
          <Save className="w-5 h-5" />
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default DatosForm;