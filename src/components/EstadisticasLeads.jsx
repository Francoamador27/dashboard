import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import clienteAxios from '../config/axios';
import { Calendar } from 'lucide-react';

const EstadisticasLeads = () => {
  const token = localStorage.getItem('AUTH_TOKEN');
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Construir query con fechas
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (fechaInicio) p.append('fecha_inicio', fechaInicio);
    if (fechaFin) p.append('fecha_fin', fechaFin);
    return p.toString();
  }, [fechaInicio, fechaFin]);

  const fetcher = () =>
    clienteAxios(`/api/leads-contacto/stats-by-date?${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => res.data);

  const { data, isLoading, error } = useSWR(
    `/api/leads-contacto/stats-by-date?${query}`,
    fetcher
  );

  if (error) return <p className="p-4 text-red-600">Error al cargar las estadísticas.</p>;

  const stats = data?.stats || {};
  const desglose = data?.desglose || [];

  // Calcular porcentajes
  const total = stats.total || 0;
  const getPorcentaje = (valor) => total > 0 ? Math.round((valor / total) * 100) : 0;

  // Agrupar desglose por fecha
  const desgloseAgrupado = desglose.reduce((acc, item) => {
    if (!acc[item.fecha]) {
      acc[item.fecha] = { nuevo: 0, en_proceso: 0, contactado: 0, cerrado: 0 };
    }
    acc[item.fecha][item.estado] = item.cantidad;
    return acc;
  }, {});

  // Convertir a array ordenado
  const desgloseArray = Object.entries(desgloseAgrupado)
    .map(([fecha, data]) => ({ fecha, ...data }))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  // Calcular máximo valor para escala de gráfico
  const maxValor = Math.max(
    ...desgloseArray.flatMap(d => [d.nuevo, d.en_proceso, d.contactado, d.cerrado])
  ) || 1;

  // Colores por estado
  const colores = {
    nuevo: '#10b981',
    en_proceso: '#3b82f6',
    contactado: '#f59e0b',
    cerrado: '#6b7280',
  };

  const etiquetas = {
    nuevo: 'Nuevo',
    en_proceso: 'En Proceso',
    contactado: 'Contactado',
    cerrado: 'Cerrado',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2">
          Estadísticas de <span className="text-[#0891b2]">Leads</span>
        </h1>
        <p className="text-slate-600">Visualiza las tendencias de contactos y conversiones.</p>
      </div>

      {/* Filtro de Fechas */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-[#0891b2]" size={24} />
          <h3 className="text-lg font-bold text-slate-900">Filtrar por Rango de Fechas</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-slate-700 font-bold text-sm">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-700 font-bold text-sm">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2]"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setFechaInicio('');
              setFechaFin('');
            }}
            className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Estadísticas Generales */}
      {isLoading ? (
        <p className="p-4 text-slate-600">Cargando estadísticas...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="text-3xl font-black text-slate-900">{stats.total || 0}</div>
              <div className="text-sm text-slate-600 font-medium mt-1">Total de Leads</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200">
              <div className="text-3xl font-black text-green-800">{stats.nuevos || 0}</div>
              <div className="text-sm text-green-700 font-medium mt-1">
                Nuevos ({getPorcentaje(stats.nuevos)}%)
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
              <div className="text-3xl font-black text-blue-800">{stats.en_proceso || 0}</div>
              <div className="text-sm text-blue-700 font-medium mt-1">
                En Proceso ({getPorcentaje(stats.en_proceso)}%)
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 shadow-sm border border-yellow-200">
              <div className="text-3xl font-black text-yellow-800">{stats.contactados || 0}</div>
              <div className="text-sm text-yellow-700 font-medium mt-1">
                Contactados ({getPorcentaje(stats.contactados)}%)
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 shadow-sm border border-purple-200">
              <div className="text-3xl font-black text-purple-800">{stats.con_archivo || 0}</div>
              <div className="text-sm text-purple-700 font-medium mt-1">Con Archivo</div>
            </div>
          </div>

          {/* Gráfico de Barras Horizontales por Fecha */}
          {desgloseArray.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">
                Desglose de Leads por Fecha y Estado
              </h3>

              <div className="space-y-6">
                {desgloseArray.map((dia) => {
                  const totalDia = dia.nuevo + dia.en_proceso + dia.contactado + dia.cerrado;
                  return (
                    <div key={dia.fecha} className="space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-700">
                          {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="font-bold text-slate-600">Total: {totalDia}</span>
                      </div>

                      <div className="flex h-8 gap-1 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        {dia.nuevo > 0 && (
                          <div
                            style={{
                              width: `${(dia.nuevo / maxValor) * 100}%`,
                              backgroundColor: colores.nuevo,
                            }}
                            className="flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
                            title={`Nuevo: ${dia.nuevo}`}
                          >
                            {dia.nuevo > 0 && (maxValor > 20 || dia.nuevo >= 2) && dia.nuevo}
                          </div>
                        )}
                        {dia.en_proceso > 0 && (
                          <div
                            style={{
                              width: `${(dia.en_proceso / maxValor) * 100}%`,
                              backgroundColor: colores.en_proceso,
                            }}
                            className="flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
                            title={`En Proceso: ${dia.en_proceso}`}
                          >
                            {dia.en_proceso > 0 && (maxValor > 20 || dia.en_proceso >= 2) && dia.en_proceso}
                          </div>
                        )}
                        {dia.contactado > 0 && (
                          <div
                            style={{
                              width: `${(dia.contactado / maxValor) * 100}%`,
                              backgroundColor: colores.contactado,
                            }}
                            className="flex items-center justify-center text-xs font-bold text-gray-900 transition-all hover:opacity-80"
                            title={`Contactado: ${dia.contactado}`}
                          >
                            {dia.contactado > 0 && (maxValor > 20 || dia.contactado >= 2) && dia.contactado}
                          </div>
                        )}
                        {dia.cerrado > 0 && (
                          <div
                            style={{
                              width: `${(dia.cerrado / maxValor) * 100}%`,
                              backgroundColor: colores.cerrado,
                            }}
                            className="flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
                            title={`Cerrado: ${dia.cerrado}`}
                          >
                            {dia.cerrado > 0 && (maxValor > 20 || dia.cerrado >= 2) && dia.cerrado}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(etiquetas).map(([estado, label]) => (
                  <div key={estado} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: colores[estado] }}
                    />
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vista de Tabla Detallada */}
          {desgloseArray.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black  tracking-wider text-slate-700">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-black  tracking-wider text-green-700">
                        Nuevos
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-black  tracking-wider text-blue-700">
                        En Proceso
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-black  tracking-wider text-yellow-700">
                        Contactados
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-black  tracking-wider text-gray-700">
                        Cerrados
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-black  tracking-wider text-slate-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {desgloseArray.map((dia) => {
                      const totalDia = dia.nuevo + dia.en_proceso + dia.contactado + dia.cerrado;
                      return (
                        <tr key={dia.fecha} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                            {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-bold text-green-800">
                            {dia.nuevo}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-bold text-blue-800">
                            {dia.en_proceso}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-bold text-yellow-800">
                            {dia.contactado}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-bold text-gray-800">
                            {dia.cerrado}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-black text-slate-900 bg-slate-50">
                            {totalDia}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {desgloseArray.length === 0 && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
              <p className="text-slate-500 font-medium">
                No hay datos disponibles para el rango de fechas seleccionado.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EstadisticasLeads;
