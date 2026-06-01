import React, { useState, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import clienteAxios from '../config/axios';
import { Eye, Trash2, Search, Filter, MessageCircle, Copy, Mail, Download, Check } from 'lucide-react';

const LeadsRRHH = () => {
  const token = localStorage.getItem('AUTH_TOKEN');

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pagina, setPagina] = useState(1);
  const [perPage] = useState(15);
  const [leadSeleccionado, setLeadSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [copiado, setCopiado] = useState(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (busqueda.length >= 3) p.append('q', busqueda);
    if (filtroEstado) p.append('estado', filtroEstado);
    if (fechaInicio) p.append('fecha_inicio', fechaInicio);
    if (fechaFin) p.append('fecha_fin', fechaFin);
    if (pagina) p.append('page', pagina);
    if (perPage) p.append('per_page', perPage);
    return p.toString();
  }, [busqueda, filtroEstado, fechaInicio, fechaFin, pagina, perPage]);

  const fetcher = () =>
    clienteAxios(`/api/leads-rrhh?${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => res.data);

  const statsFetcher = () =>
    clienteAxios('/api/leads-rrhh/stats', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => res.data);

  const { data, error, isLoading } = useSWR(`/api/leads-rrhh?${query}`, fetcher);
  const { data: stats } = useSWR('/api/leads-rrhh/stats', statsFetcher);

  if (isLoading) return <p className="p-4 text-gray-600">Cargando candidatos...</p>;
  if (error) return <p className="p-4 text-red-600">Error al cargar los candidatos.</p>;

  const leads = data?.data ?? [];
  const currentPage = data?.current_page ?? pagina;
  const lastPage = data?.last_page ?? 1;

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este candidato?')) return;

    try {
      await clienteAxios.delete(`/api/leads-rrhh/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      mutate(`/api/leads-rrhh?${query}`);
      mutate('/api/leads-rrhh/stats');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el candidato.');
    }
  };

  const handleVerDetalle = async (id) => {
    try {
      const { data } = await clienteAxios.get(`/api/leads-rrhh/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setLeadSeleccionado(data);
      setModalAbierto(true);
    } catch (err) {
      console.error(err);
      alert('Error al cargar el detalle del candidato.');
    }
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      await clienteAxios.put(`/api/leads-rrhh/${id}`, 
        { estado: nuevoEstado },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      mutate(`/api/leads-rrhh?${query}`);
      mutate('/api/leads-rrhh/stats');
      if (leadSeleccionado?.id === id) {
        setLeadSeleccionado({ ...leadSeleccionado, estado: nuevoEstado });
      }
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado.');
    }
  };

  const handleActualizarNotas = async (id, notas) => {
    try {
      await clienteAxios.put(`/api/leads-rrhh/${id}`, 
        { notas },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      mutate(`/api/leads-rrhh?${query}`);
      mutate('/api/leads-rrhh/stats');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar las notas.');
    }
  };

  const handleCopiarTelefono = (telefono, identificador) => {
    navigator.clipboard.writeText(telefono);
    setCopiado(identificador);
    setTimeout(() => setCopiado(null), 2000);
  };

  const handleDescargarCV = async (id, nombreCV) => {
    try {
      const response = await clienteAxios.get(`/api/leads-rrhh/${id}/descargar-cv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreCV || 'cv.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error al descargar el CV.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2">
          Candidatos de <span className="text-green-600">RRHH</span>
        </h1>
        <p className="text-slate-600">Gestiona las solicitudes de empleo recibidas.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-3xl font-black text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600 font-medium mt-1">Total</div>
          </div>
          <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200">
            <div className="text-3xl font-black text-green-800">{stats.nuevos}</div>
            <div className="text-sm text-green-700 font-medium mt-1">Nuevos</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
            <div className="text-3xl font-black text-blue-800">{stats.en_proceso}</div>
            <div className="text-sm text-blue-700 font-medium mt-1">En Proceso</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 shadow-sm border border-yellow-200">
            <div className="text-3xl font-black text-yellow-800">{stats.contactados}</div>
            <div className="text-sm text-yellow-700 font-medium mt-1">Contactados</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-black text-gray-800">{stats.cerrados}</div>
            <div className="text-sm text-gray-700 font-medium mt-1">Cerrados</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
        <div className="space-y-4">
          {/* Búsqueda y Estado */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, email, teléfono, puesto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
              >
                <option value="">Todos los estados</option>
                <option value="nuevo">Nuevos</option>
                <option value="en_proceso">En Proceso</option>
                <option value="contactado">Contactados</option>
                <option value="cerrado">Cerrados</option>
              </select>
            </div>
          </div>

          {/* Filtros por Fecha */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600  mb-2">Desde</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600  mb-2">Hasta</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
              />
            </div>
            <button
              onClick={() => {
                setFechaInicio('');
                setFechaFin('');
              }}
              className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Limpiar Fechas
            </button>
          </div>
        </div>
      </div>

      {/* Resumen de filtro por fecha */}
      {(fechaInicio || fechaFin) && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-bold text-green-900">
            Mostrando candidatos desde {fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-AR') : 'inicio'} hasta {fechaFin ? new Date(fechaFin).toLocaleDateString('es-AR') : 'hoy'}
            {leads.length > 0 && ` • Total: ${leads.length} candidato${leads.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black  tracking-wider text-slate-700">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-black  tracking-wider text-slate-700">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-black  tracking-wider text-slate-700">
                  Contacto
                </th>
                <th className="px-6 py-4 text-left text-xs font-black  tracking-wider text-slate-700">
                  Puesto
                </th>
                <th className="px-6 py-4 text-left text-xs font-black  tracking-wider text-slate-700">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-black  tracking-wider text-slate-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(lead.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{lead.nombre}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{lead.email}</div>
                    <div className="text-xs text-slate-500">{lead.telefono}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 line-clamp-1">
                      {lead.puesto_interes || '--'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.estado}
                      onChange={(e) => handleActualizarEstado(lead.id, e.target.value)}
                      className="text-xs font-bold border border-slate-200 rounded-lg p-1 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 cursor-pointer"
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="contactado">Contactado</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1 flex-wrap">
                      <button
                        onClick={() => window.open(`https://wa.me/${lead.telefono.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(lead.nombre)}`)}
                        title="Contactar por WhatsApp"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleCopiarTelefono(lead.telefono, lead.id)}
                        title="Copiar teléfono"
                        className={`p-2 rounded-lg transition-colors ${copiado === lead.id ? 'text-green-600 bg-green-50' : 'text-blue-600 hover:bg-blue-50'}`}
                      >
                        {copiado === lead.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <a
                        href={`mailto:${lead.email}`}
                        title="Enviar correo"
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Mail size={16} />
                      </a>
                      {lead.cv && (
                        <button
                          onClick={() => handleDescargarCV(lead.id, lead.cv.split('/').pop())}
                          title="Descargar CV"
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Download size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleVerDetalle(lead.id)}
                        title="Ver detalle"
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminar(lead.id)}
                        title="Eliminar"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No hay candidatos para mostrar.
          </div>
        )}
      </div>

      {/* Paginación */}
      {lastPage > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPagina(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">
            Página {currentPage} de {lastPage}
          </span>
          <button
            onClick={() => setPagina(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de Detalle */}
      {modalAbierto && leadSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{leadSeleccionado.nombre}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Postulación del {new Date(leadSeleccionado.created_at).toLocaleString('es-AR')}
                  </p>
                </div>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información de Contacto */}
              <div>
                <h4 className="font-black text-slate-700 mb-3">Información de Contacto</h4>
                <div className="space-y-3 bg-slate-50 rounded-xl p-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 ">Email:</span>
                    <p className="text-sm text-slate-900 flex items-center gap-2">
                      {leadSeleccionado.email}
                      <a href={`mailto:${leadSeleccionado.email}`} className="text-purple-600 hover:text-purple-700">
                        <Mail size={15} />
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 ">Teléfono:</span>
                    <p className="text-sm text-slate-900 flex items-center gap-2">
                      {leadSeleccionado.telefono}
                      <button 
                        onClick={() => handleCopiarTelefono(leadSeleccionado.telefono, 'modal')}
                        className={`${copiado === 'modal' ? 'text-green-600' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        {copiado === 'modal' ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                      <a 
                        href={`https://wa.me/${leadSeleccionado.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        <MessageCircle size={15} />
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Puesto de Interés */}
              {leadSeleccionado.puesto_interes && (
                <div>
                  <h4 className="font-black text-slate-700 mb-3">Puesto de Interés</h4>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-700">{leadSeleccionado.puesto_interes}</p>
                  </div>
                </div>
              )}

              {/* Experiencia */}
              {leadSeleccionado.experiencia && (
                <div>
                  <h4 className="font-black text-slate-700 mb-3">Experiencia</h4>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-700">{leadSeleccionado.experiencia}</p>
                  </div>
                </div>
              )}

              {/* Carta de Presentación */}
              {leadSeleccionado.mensaje && (
                <div>
                  <h4 className="font-black text-slate-700 mb-3">Carta de Presentación</h4>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {leadSeleccionado.mensaje}
                    </p>
                  </div>
                </div>
              )}

              {/* CV */}
              {leadSeleccionado.cv && (
                <div>
                  <h4 className="font-black text-slate-700 mb-3">CV</h4>
                  <div className="bg-orange-50 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-slate-700">
                      📄 {leadSeleccionado.cv.split('/').pop()}
                    </span>
                    <button
                      onClick={() => handleDescargarCV(leadSeleccionado.id, leadSeleccionado.cv.split('/').pop())}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                      <Download size={16} />
                      Descargar
                    </button>
                  </div>
                </div>
              )}

              {/* Estado */}
              <div>
                <h4 className="font-black text-slate-700 mb-3">Estado</h4>
                <select
                  value={leadSeleccionado.estado}
                  onChange={(e) => handleActualizarEstado(leadSeleccionado.id, e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 font-medium"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="contactado">Contactado</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <h4 className="font-black text-slate-700 mb-3">Notas Internas</h4>
                <textarea
                  defaultValue={leadSeleccionado.notas || ''}
                  onBlur={(e) => handleActualizarNotas(leadSeleccionado.id, e.target.value)}
                  rows="4"
                  placeholder="Agregar notas internas sobre este candidato..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsRRHH;
