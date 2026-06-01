import React, { useState } from 'react';
import useSWR from 'swr';
import clienteAxios from '../config/axios';
import { Link } from 'react-router-dom';

const CombosAdmin = () => {
    const token = localStorage.getItem('AUTH_TOKEN');

    const [busqueda, setBusqueda] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [disponible, setDisponible] = useState('');
    const [ordenarPor, setOrdenarPor] = useState('created_at');
    const [direccion, setDireccion] = useState('desc');
    const [pagina, setPagina] = useState(1);
    const [perPage] = useState(10); // Fijo por ahora

    const params = new URLSearchParams();
    if (busqueda.length >= 4) params.append('busqueda', busqueda);
    params.append('categoria_id', 2);
    if (disponible !== '') params.append('disponible', disponible);
    if (ordenarPor) params.append('ordenar_por', ordenarPor);
    if (direccion) params.append('direccion', direccion);
    if (pagina) params.append('page', pagina);
    if (perPage) params.append('per_page', perPage);

    const query = params.toString();

    const fetcher = () =>
        clienteAxios(`/api/productos?${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(res => res.data);

    const { data, error, isLoading } = useSWR(`/api/productos?${query}`, fetcher);

    if (isLoading) return <p className="p-4 text-gray-600">Cargando productos...</p>;
    if (error) return <p className="p-4 text-red-600">Error al cargar los productos.</p>;

    const productos = data?.data || [];
    const meta = data?.meta || {};

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-6">Administrar Productos</h2>
           <Link
                to="/admin-dash/create-product"
                className="inline-block mb-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
            
                Crear Combo
            </Link>
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPagina(1);
                        }}
                        placeholder="Buscar por nombre o descripción"
                        className="border px-3 py-1 rounded w-64"
                    />
                    {busqueda && (
                        <button
                            onClick={() => {
                                setBusqueda('');
                                setPagina(1);
                            }}
                            className="text-sm text-red-500 underline"
                        >
                            Limpiar
                        </button>
                    )}
                </div>

                {busqueda.length > 0 && busqueda.length < 4 && (
                    <p className="text-sm text-yellow-600">
                        Escribí al menos 4 letras para buscar.
                    </p>
                )}

                <select
                    onChange={(e) => {
                        setCategoriaId(e.target.value);
                        setPagina(1);
                    }}
                    className="border px-2 py-1 rounded"
                    value={categoriaId}
                >
                    <option value="">Todas las categorías</option>
                    <option value="1">Categoria 1</option>
                    <option value="2">Categoria 2</option>
                    {/* Agregá tus categorías dinámicamente si querés */}
                </select>

                <select
                    onChange={(e) => {
                        setDisponible(e.target.value);
                        setPagina(1);
                    }}
                    className="border px-2 py-1 rounded"
                    value={disponible}
                >
                    <option value="">Todos</option>
                    <option value="1">Disponibles</option>
                    <option value="0">No disponibles</option>
                </select>

                <select
                    onChange={(e) => {
                        setOrdenarPor(e.target.value);
                        setPagina(1);
                    }}
                    className="border px-2 py-1 rounded"
                    value={ordenarPor}
                >
                    <option value="created_at">Fecha</option>
                    <option value="nombre">Nombre</option>
                    <option value="precio">Precio</option>
                </select>

                <select
                    onChange={(e) => {
                        setDireccion(e.target.value);
                        setPagina(1);
                    }}
                    className="border px-2 py-1 rounded"
                    value={direccion}
                >
                    <option value="desc">↓ Descendente</option>
                    <option value="asc">↑ Ascendente</option>
                </select>
            </div>

            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                <table className="min-w-full text-sm text-gray-800 bg-white">
                    <thead className="bg-gray-100 text-xs text-gray-600 ">
                        <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Nombre</th>
                            <th className="px-4 py-3 text-left">Descripción</th>
                            <th className="px-4 py-3 text-left">Precio</th>
                            <th className="px-4 py-3 text-left">Disponibilidad</th>
                            <th className="px-4 py-3 text-left">Creado</th>
                            <th className="px-4 py-3 text-left">Acción</th>
                        </tr>

                    </thead>
                    <tbody>
                        {productos.map((producto) => (
                            <tr
                                key={producto.id}
                                className="hover:bg-gray-50 border-t border-gray-200 transition"
                            >
                                <td className="px-4 py-3">{producto.id}</td>
                                <td className="px-4 py-3">{producto.nombre}</td>
                                <td className="px-4 py-3">{producto.descripcion}</td>
                                <td className="px-4 py-3 font-medium">${producto.precio}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${producto.disponible
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {producto.disponible ? 'Disponible' : 'No disponible'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {new Date(producto.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <Link
                                        to={`/admin-dash/productos/editar/${producto.id}`}
                                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded"
                                    >
                                        Ver más
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex gap-4 items-center">
                <button
                    onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    disabled={pagina <= 1}
                >
                    Anterior
                </button>
                <span className="text-sm">
                    Página {meta.current_page || pagina} de {meta.last_page || "?"}
                </span>
                <button
                    onClick={() =>
                        setPagina((prev) =>
                            meta.last_page ? Math.min(meta.last_page, prev + 1) : prev + 1
                        )
                    }
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    disabled={meta.last_page && pagina >= meta.last_page}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default CombosAdmin;
