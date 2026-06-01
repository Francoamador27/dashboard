import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import clienteAxios from '../config/axios';
import Alerta from '../components/Alerta';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const email = params.get('email');
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);
    setMensaje(null);
    setLoading(true);

    try {
      const { data } = await clienteAxios.post('/api/reset-password', {
        email,
        token,
        password,
        password_confirmation: confirmacion,
      });

      setMensaje(data.message || 'Contraseña actualizada correctamente');
    } catch (error) {
      setErrores(error.response?.data?.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4 text-center">
          Establecer nueva contraseña
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            className="w-full px-4 py-2 border rounded-md outline-none focus:border-blue-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            className="w-full px-4 py-2 border rounded-md outline-none focus:border-blue-300"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
          />

          {errores && <Alerta>{errores}</Alerta>}
          {mensaje && (
            <div className="bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded text-sm">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>

          <div className="text-center pt-2">
            <Link to="/auth/login" className="text-blue-500 hover:underline text-sm">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
