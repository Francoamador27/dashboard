import React, { useState } from 'react';
import useSWR from 'swr';
import clienteAxios from '../../config/axios';
import { Link } from 'react-router-dom';

const Ingresos = () => {
    const token = localStorage.getItem('AUTH_TOKEN');

    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [doctorId, setDoctorId] = useState('');
    const [estadoPago, setEstadoPago] = useState(''); // '' = todos, '1' = pagados, '0' = no pagados
    const [ordenarPor, setOrdenarPor] = useState('start');
    const [direccion, setDireccion] = useState('desc');
    const [pagina, setPagina] = useState(1);
    const [perPage] = useState(20);

    // Construir query params
    const params = new URLSearchParams();
    if (fechaDesde) params.append('start', fechaDesde);
    if (fechaHasta) params.append('end', fechaHasta);
    if (doctorId) params.append('doctor_id', doctorId);
    if (estadoPago !== '') params.append('is_paid', estadoPago);
    if (ordenarPor) params.append('ordenar_por', ordenarPor);
    if (direccion) params.append('direccion', direccion);
    params.append('page', pagina);
    params.append('per_page', perPage);
    const query = params.toString();

    // Fetcher para eventos
    const fetcherEventos = () =>
        clienteAxios(`/api/events?${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(res => res.data);

    // Fetcher para doctores (corregí la ruta y uso token)
    const fetcherDoctores = () =>
        clienteAxios('/api/doctores', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(res => res.data);

    const { data: dataEventos, error: errorEventos, isLoading: loadingEventos } = useSWR(`/api/events?${query}`, fetcherEventos);
    // uso la ruta correcta '/api/doctores' y obtengo dataDoctores
    const { data: dataDoctores, error: errorDoctores, isLoading: loadingDoctores } = useSWR('/api/doctores', fetcherDoctores);

    // Manejar respuesta con o sin paginación
    const eventos = dataEventos?.data ? dataEventos.data : (Array.isArray(dataEventos) ? dataEventos : []);
    const paginacion = dataEventos?.meta || dataEventos;
    // aca tomo dataDoctores.data (segun tu ejemplo la respuesta trae { data: [...] })
    const doctores = Array.isArray(dataDoctores) ? dataDoctores : (dataDoctores?.data || []);

    // Calcular totales
    const totalPagados = eventos
        .filter(e => e.chec === 1 || e.chec === true)
        .reduce((sum, e) => sum + parseFloat(e.monto || 0), 0);

    const totalNoPagados = eventos
        .filter(e => e.chec === 0 || e.chec === false)
        .reduce((sum, e) => sum + parseFloat(e.monto || 0), 0);

    const formatCurrency = (value) => {
        return `$${parseFloat(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loadingEventos) return <p className="p-4 text-gray-600">Cargando eventos...</p>;
    if (errorEventos) return <p className="p-4 text-red-600">Error al cargar los eventos.</p>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-6">Administrar Ingresos</h2>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-md">
                    <h3 className="text-sm font-medium text-green-600 mb-2">Total Pagado</h3>
                    <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(totalPagados)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        {eventos.filter(e => e.chec === 1 || e.chec === true).length} eventos
                    </p>
                </div>

                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6 shadow-md">
                    <h3 className="text-sm font-medium text-cyan-600 mb-2">Total Pendiente</h3>
                    <p className="text-2xl font-bold text-cyan-700">
                        {formatCurrency(totalNoPagados)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        {eventos.filter(e => e.chec === 0 || e.chec === false).length} eventos
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-md">
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Total General</h3>
                    <p className="text-2xl font-bold text-blue-700">
                        {formatCurrency(totalPagados + totalNoPagados)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        {eventos.length} eventos
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Desde</label>
                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => {
                                setFechaDesde(e.target.value);
                                setPagina(1);
                            }}
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Hasta</label>
                        <input
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => {
                                setFechaHasta(e.target.value);
                                setPagina(1);
                            }}
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">diseño</label>
                        {loadingDoctores ? (
                            <div className="p-2">Cargando doctores...</div>
                        ) : errorDoctores ? (
                            <div className="text-red-600 p-2">Error al cargar doctores</div>
                        ) : (
                            <select
                                value={doctorId}
                                onChange={(e) => {
                                    setDoctorId(e.target.value);
                                    setPagina(1);
                                }}
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="">Todos los doctores</option>
                                {doctores.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.name}{doc.specialty ? ` — ${doc.specialty}` : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Estado de Pago</label>
                        <select
                            value={estadoPago}
                            onChange={(e) => {
                                setEstadoPago(e.target.value);
                                setPagina(1);
                            }}
                            className="w-full border px-3 py-2 rounded"
                        >
                            <option value="">Todos</option>
                            <option value="1">Pagados</option>
                            <option value="0">No Pagados</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Ordenar por</label>
                        <select
                            value={ordenarPor}
                            onChange={(e) => {
                                setOrdenarPor(e.target.value);
                                setPagina(1);
                            }}
                            className="w-full border px-3 py-2 rounded"
                        >
                            <option value="start">Fecha de inicio</option>
                            <option value="monto">Monto</option>
                            <option value="created_at">Fecha de creación</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Dirección</label>
                        <select
                            value={direccion}
                            onChange={(e) => {
                                setDireccion(e.target.value);
                                setPagina(1);
                            }}
                            className="w-full border px-3 py-2 rounded"
                        >
                            <option value="desc">↓ Descendente</option>
                            <option value="asc">↑ Ascendente</option>
                        </select>
                    </div>
                </div>

                {(fechaDesde || fechaHasta || doctorId || estadoPago !== '') && (
                    <button
                        onClick={() => {
                            setFechaDesde('');
                            setFechaHasta('');
                            setDoctorId('');
                            setEstadoPago('');
                            setPagina(1);
                        }}
                        className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                        Limpiar Filtros
                    </button>
                )}
            </div>

            {/* Tabla de eventos */}
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                <table className="min-w-full text-sm text-gray-800 bg-white">
                    <thead className="bg-gray-100 text-xs text-gray-600 ">
                        <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Título</th>
                            <th className="px-4 py-3 text-left">usuario</th>
                            <th className="px-4 py-3 text-left">diseño</th>
                            <th className="px-4 py-3 text-left">Fecha/Hora</th>
                            <th className="px-4 py-3 text-right">Monto</th>
                            <th className="px-4 py-3 text-center">Estado</th>
                            <th className="px-4 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventos.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                    No hay eventos registrados
                                </td>
                            </tr>
                        ) : (
                            eventos.map((evento) => (
                                <tr
                                    key={evento.id}
                                    className="hover:bg-gray-50 border-t border-gray-200 transition"
                                >
                                    <td className="px-4 py-3">{evento.id}</td>
                                    <td className="px-4 py-3">{evento.title || '-'}</td>
                                    <td className="px-4 py-3">{evento.patient_name || '-'}</td>

                                    <td className="px-4 py-3">{evento.doctor_name}</td>

                       
                                    <td className="px-4 py-3">
                                        {formatDate(evento.start)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {formatCurrency(evento.monto || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${evento.chec === 1 || evento.chec === true
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-cyan-100 text-cyan-800'
                                                }`}
                                        >
                                            {evento.chec === 1 || evento.chec === true ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Link
                                            to={`/admin-dash/citas/${evento.id}`}
                                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded"
                                        >
                                            Ver detalle
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {paginacion?.last_page > 1 && (
                <div className="mt-4 flex gap-4 items-center justify-center">
                    <button
                        onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                        disabled={pagina <= 1}
                    >
                        Anterior
                    </button>
                    <span className="text-sm">
                        Página {paginacion.current_page || pagina} de {paginacion.last_page || "?"}
                    </span>
                    <button
                        onClick={() => setPagina((prev) => Math.min(paginacion.last_page, prev + 1))}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                        disabled={pagina >= paginacion.last_page}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default Ingresos;
