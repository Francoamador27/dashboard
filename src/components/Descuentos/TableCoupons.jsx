import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../config/axios';

const TableCupones = () => {
  const [cupones, setCupones] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('AUTH_TOKEN');

  useEffect(() => {
    obtenerCupones();
  }, []);

  const obtenerCupones = async () => {
    try {
      const res = await clienteAxios.get('/api/coupons', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCupones(res.data.data);
    } catch (err) {
      setError('Error al cargar cupones');
      console.error(err);
    }
  };

  const eliminarCupon = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de eliminar este cupón?');
    if (!confirmacion) return;

    try {
      await clienteAxios.delete(`/api/coupons/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCupones(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error al eliminar cupón', err);
      setError('No se pudo eliminar el cupón');
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="overflow-x-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Listado de Cupones</h2>
      <table className="min-w-full text-sm text-gray-800 bg-white">
        <thead className="bg-gray-100 text-xs text-gray-600 ">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Código</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Valor</th>
            <th className="px-4 py-3 text-left">Mín. Compra</th>
            <th className="px-4 py-3 text-left">Uso Máximo</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cupones.map((cupon) => (
            <tr key={cupon.id} className="hover:bg-gray-50 border-t border-gray-200 transition">
              <td className="px-4 py-3">{cupon.id}</td>
              <td className="px-4 py-3 font-mono">{cupon.code}</td>
              <td className="px-4 py-3 capitalize">{cupon.type}</td>
              <td className="px-4 py-3">
                {cupon.discount_value}
                {cupon.type === 'percentage' ? '%' : ' ARS'}
              </td>
              <td className="px-4 py-3">
                {cupon.min_purchase ? `$${cupon.min_purchase}` : '-'}
              </td>
              <td className="px-4 py-3">{cupon.usage_limit ?? '-'}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    cupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cupon.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3 space-x-2">
                <Link
                  to={`/admin-dash/cupones/${cupon.id}`}
                  className="px-3 py-1 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Editar
                </Link>
                <button
                  onClick={() => eliminarCupon(cupon.id)}
                  className="px-3 py-1 text-sm font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableCupones;
