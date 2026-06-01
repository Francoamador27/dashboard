import React from 'react';
import useSWR from 'swr';
import clienteAxios from '../../config/axios';
import { fmtDMYHM } from '../../utils/date'; // 👈 tu función
import { formatDate } from '../../utils/formatDate';

const EventosTabla = () => {
  const token = localStorage.getItem('AUTH_TOKEN');

  const fetcherGet = (url) =>
    clienteAxios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.data);

  const { data, error, isLoading } = useSWR('/api/user/events', fetcherGet);

  const eventos = data?.data ?? [];
  const usuario = data?.patient ?? null;

  if (isLoading) return <p className="text-sm text-gray-500">Cargando eventos...</p>;
  if (error) return <p className="text-sm text-red-500">Error al cargar eventos.</p>;
  if (!usuario) return <p className="text-gray-600 text-sm">No se encontró usuario asociado.</p>;
  if (eventos.length === 0) return <p className="text-gray-600 text-sm">No tenés eventos registrados aún.</p>;

  return (
    <div className="overflow-x-auto mt-4">
      <h2 className="text-lg font-semibold mb-3">
        Eventos de {usuario.name}
      </h2>
      <table className="min-w-full text-sm text-gray-800">
        <thead className="bg-gray-100 text-xs text-gray-600 ">
          <tr>
            <th className="px-4 py-2 text-left">Título</th>
            <th className="px-4 py-2 text-left">diseño</th>
            <th className="px-4 py-2 text-left">Monto</th>
            <th className="px-4 py-2 text-left">Pagado</th>
            <th className="px-4 py-2 text-left">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map(event => (
            <tr key={event.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{event.title}</td>
              <td className="px-4 py-2">
                {event.doctor_name} {event.doctor_lastname || ''}
              </td>
              <td className="px-4 py-2">
                {event.monto ? `$${parseFloat(event.monto).toLocaleString('es-AR')}` : '-'}
              </td>
              <td className="px-4 py-2">
                {event.isPaid || event.chec
                  ? <span className="text-green-600 font-medium">Sí</span>
                  : <span className="text-red-500 font-medium">No</span>
                }
              </td>
                  <td className="px-4 py-3">{formatDate(event.start)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventosTabla;