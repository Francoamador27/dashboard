import { useState } from 'react';
import clienteAxios from '../../config/axios';
import { mostrarError, mostrarExito } from '../../utils/Alertas';
import { KeyRound } from 'lucide-react';

const Privacidad = () => {
  const token = localStorage.getItem('AUTH_TOKEN');
  const [formulario, setFormulario] = useState({
    password_actual: '',
    password_nueva: '',
    confirmar_password: '',
  });

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (formulario.password_nueva !== formulario.confirmar_password) {
      mostrarError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await clienteAxios.post('/api/user/password', formulario, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      mostrarExito(response.data.message || 'Contraseña actualizada correctamente');
      setFormulario({
        password_actual: '',
        password_nueva: '',
        confirmar_password: '',
      });
    } catch (error) {
      mostrarError(
        error.response?.data?.message || 'Error al actualizar la contraseña'
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-2xl mt-10">
      <h2 className="text-2xl font-bold text-[#008DD2] flex items-center gap-2 mb-8">
        <KeyRound className="w-6 h-6 text-[#008DD2]" />
        Cambiar contraseña
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
          <input
            type="password"
            name="password_actual"
            value={formulario.password_actual}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008DD2]"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
          <input
            type="password"
            name="password_nueva"
            value={formulario.password_nueva}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008DD2]"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar nueva contraseña</label>
          <input
            type="password"
            name="confirmar_password"
            value={formulario.confirmar_password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008DD2]"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="mt-8 text-right">
        <button
          onClick={handleSubmit}
          className="inline-flex items-center cursor-pointer justify-center px-6 py-3 bg-[#008DD2] text-white font-semibold rounded-xl hover:bg-[#006fa3] transition-shadow shadow-md hover:shadow-lg"
        >
          <KeyRound className="w-5 h-5 mr-2" />
          Cambiar contraseña
        </button>
      </div>
    </div>
  );
};

export default Privacidad;
