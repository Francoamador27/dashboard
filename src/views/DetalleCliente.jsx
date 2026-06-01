import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import clienteAxios from '../config/axios';
import { useEffect, useState } from 'react';
import { mostrarError, mostrarExito } from '../utils/Alertas';
import { Save, ShieldCheck, ShieldOff } from 'lucide-react';

const DetalleCliente = () => {
  const { id } = useParams();
  const token = localStorage.getItem('AUTH_TOKEN');

  const fetcher = async () => {
    const response = await clienteAxios(`/api/usuarios/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  };

  const { data, error, isLoading, mutate } = useSWR(id ? `/api/usuarios/${id}` : null, fetcher);
  const usuario = data;

  const [formulario, setFormulario] = useState({
    name: '',
    email: '',
    telefono: '',
    dni: '',
    codigo_postal: '',
    direccion: '',
    localidad: '',
    provincia: '',
    rol: '',
    admin: false,
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
        rol: usuario.rol || '',
        admin: Boolean(usuario.admin),
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggleAdmin = () => {
    setFormulario((prev) => ({
      ...prev,
      admin: !prev.admin,
    }));
  };

  const handleGuardar = async () => {
    try {
      await clienteAxios.put(`/api/usuarios/${id}`, formulario, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      mutate();
      mostrarExito('Se actualizaron los datos con éxito');
    } catch (error) {
      mostrarError('Error al guardar');
    }
  };

  if (isLoading) return <p className="text-center">Cargando...</p>;
  if (error) return <p className="text-center text-red-500">Error al cargar usuario</p>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg space-y-8 border border-gray-100">
      <h1 className="text-3xl font-bold text-gray-800">🧾 Editar Cliente</h1>

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
          ['rol', 'Rol'],
        ].map(([campo, label]) => (
          <div key={campo}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type="text"
              name={campo}
              value={formulario[campo]}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        ))}

        {/* ✅ Toggle admin */}
        <div className="md:col-span-2 mt-4 flex items-center justify-between border-t pt-4">
          <label htmlFor="admin" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {formulario.admin ? (
              <ShieldCheck className="text-blue-600 w-5 h-5" />
            ) : (
              <ShieldOff className="text-gray-400 w-5 h-5" />
            )}
            <span className="mr-2">Administrador</span>
            <div
              className={`relative inline-block w-11 h-6 cursor-pointer transition ${
                formulario.admin ? 'bg-blue-600' : 'bg-gray-300'
              } rounded-full`}
              onClick={handleToggleAdmin}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition transform ${
                  formulario.admin ? 'translate-x-5' : ''
                }`}
              />
            </div>
          </label>
          <span className="text-sm text-gray-500">
            {formulario.admin ? 'Este usuario es administrador' : 'Usuario normal'}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleGuardar}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow hover:bg-blue-700 hover:shadow-md transition-all duration-200"
        >
          <Save className="w-5 h-5" />
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default DetalleCliente;
