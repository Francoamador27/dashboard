import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import clienteAxios from '../../config/axios';

const Gastos = () => {
    const token = localStorage.getItem('AUTH_TOKEN');
    
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarFormularioCategoria, setMostrarFormularioCategoria] = useState(false);
    const [categoriaId, setCategoriaId] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [ordenarPor, setOrdenarPor] = useState('fecha');
    const [direccion, setDireccion] = useState('desc');
    const [pagina, setPagina] = useState(1);
    const [perPage] = useState(10);
    
    // Estados del formulario de gastos
    const [formData, setFormData] = useState({
        idcat: '',
        fecha: '',
        descripcion: '',
        importe: ''
    });
    const [editando, setEditando] = useState(false);
    const [gastoId, setGastoId] = useState(null);

    // Estados del formulario de categorías
    const [formDataCategoria, setFormDataCategoria] = useState({
        nombre_categoria: '',
        detalle_categoria: ''
    });

    // Construir query params
    const params = new URLSearchParams();
    if (categoriaId) params.append('categoria', categoriaId);
    if (fechaDesde) params.append('fecha_desde', fechaDesde);
    if (fechaHasta) params.append('fecha_hasta', fechaHasta);
    if (ordenarPor) params.append('ordenar_por', ordenarPor);
    if (direccion) params.append('direccion', direccion);
    if (pagina) params.append('page', pagina);
    if (perPage) params.append('per_page', perPage);
    const query = params.toString();

    // Fetcher para gastos
    const fetcherGastos = () =>
        clienteAxios(`/api/gastos?${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(res => res.data);

    // Fetcher para categorías
    const fetcherCategorias = () =>
        clienteAxios('/api/categorias-gastos', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(res => res.data);

    const { data: dataGastos, error: errorGastos, isLoading: loadingGastos } = useSWR(`/api/gastos?${query}`, fetcherGastos);
    const { data: dataCategorias } = useSWR('/api/categorias-gastos', fetcherCategorias);

    // Manejar respuesta paginada o array simple
    const gastos = dataGastos?.data ? dataGastos.data : (Array.isArray(dataGastos) ? dataGastos : []);
    const paginacion = dataGastos?.meta || dataGastos;
    const categorias = Array.isArray(dataCategorias) ? dataCategorias : [];

    // Manejar cambios en el formulario de gastos
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar cambios en el formulario de categorías
    const handleInputChangeCategoria = (e) => {
        const { name, value } = e.target;
        setFormDataCategoria(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Limpiar formulario de gastos
    const limpiarFormulario = () => {
        setFormData({
            idcat: '',
            fecha: '',
            descripcion: '',
            importe: ''
        });
        setEditando(false);
        setGastoId(null);
        setMostrarFormulario(false);
    };

    // Limpiar formulario de categorías
    const limpiarFormularioCategoria = () => {
        setFormDataCategoria({
            nombre_categoria: '',
            detalle_categoria: ''
        });
        setMostrarFormularioCategoria(false);
    };

    // Crear o actualizar gasto
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editando) {
                await clienteAxios.put(`/api/gastos/${gastoId}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                alert('Gasto actualizado exitosamente');
            } else {
                await clienteAxios.post('/api/gastos', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                alert('Gasto creado exitosamente');
            }
            
            mutate(`/api/gastos?${query}`);
            limpiarFormulario();
        } catch (error) {
            console.error('Error al guardar el gasto:', error);
            alert('Error al guardar el gasto');
        }
    };

    // Editar gasto
    const handleEditar = (gasto) => {
        setFormData({
            idcat: gasto.idcat,
            fecha: gasto.fecha,
            descripcion: gasto.descripcion,
            importe: gasto.importe
        });
        setEditando(true);
        setGastoId(gasto.id);
        setMostrarFormulario(true);
    };

    // Eliminar gasto
    const handleEliminar = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
        
        try {
            await clienteAxios.delete(`/api/gastos/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Gasto eliminado exitosamente');
            mutate(`/api/gastos?${query}`);
        } catch (error) {
            console.error('Error al eliminar el gasto:', error);
            alert('Error al eliminar el gasto');
        }
    };

    // Crear categoría
    const handleSubmitCategoria = async (e) => {
        e.preventDefault();
        
        try {
            await clienteAxios.post('/api/categorias-gastos', formDataCategoria, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Categoría creada exitosamente');
            mutate('/api/categorias-gastos');
            limpiarFormularioCategoria();
        } catch (error) {
            console.error('Error al crear la categoría:', error);
            alert('Error al crear la categoría');
        }
    };

    if (loadingGastos) return <p className="p-4 text-gray-600">Cargando gastos...</p>;
    if (errorGastos) return <p className="p-4 text-red-600">Error al cargar los gastos.</p>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Administrar Gastos</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            limpiarFormularioCategoria();
                            setMostrarFormularioCategoria(!mostrarFormularioCategoria);
                            setMostrarFormulario(false);
                        }}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                    >
                        {mostrarFormularioCategoria ? 'Cancelar' : 'Nueva Categoría'}
                    </button>
                    <button
                        onClick={() => {
                            limpiarFormulario();
                            setMostrarFormulario(!mostrarFormulario);
                            setMostrarFormularioCategoria(false);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        {mostrarFormulario ? 'Cancelar' : 'Agregar Gasto'}
                    </button>
                </div>
            </div>

            {/* Formulario de Nueva Categoría */}
            {mostrarFormularioCategoria && (
                <div className="mb-6 p-6 bg-purple-50 rounded-xl shadow-lg border border-purple-200">
                    <h3 className="text-xl font-semibold mb-4">Nueva Categoría</h3>
                    <form onSubmit={handleSubmitCategoria} className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre de la Categoría *</label>
                            <input
                                type="text"
                                name="nombre_categoria"
                                value={formDataCategoria.nombre_categoria}
                                onChange={handleInputChangeCategoria}
                                required
                                placeholder="Ej: Alimentos, Transporte, Servicios"
                                className="w-full border px-3 py-2 rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                            <textarea
                                name="detalle_categoria"
                                value={formDataCategoria.detalle_categoria}
                                onChange={handleInputChangeCategoria}
                                placeholder="Descripción de la categoría"
                                className="w-full border px-3 py-2 rounded"
                                rows="3"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded"
                            >
                                Crear Categoría
                            </button>
                            <button
                                type="button"
                                onClick={limpiarFormularioCategoria}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Formulario de Gastos */}
            {mostrarFormulario && (
                <div className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4">
                        {editando ? 'Editar Gasto' : 'Nuevo Gasto'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Categoría *</label>
                            <select
                                name="idcat"
                                value={formData.idcat}
                                onChange={handleInputChange}
                                required
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="">Selecciona una categoría</option>
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nombre_categoria}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha *</label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleInputChange}
                                required
                                className="w-full border px-3 py-2 rounded"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Descripción *</label>
                            <input
                                type="text"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                required
                                placeholder="Descripción del gasto"
                                className="w-full border px-3 py-2 rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Importe *</label>
                            <input
                                type="number"
                                name="importe"
                                value={formData.importe}
                                onChange={handleInputChange}
                                required
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="w-full border px-3 py-2 rounded"
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-2">
                            <button
                                type="submit"
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
                            >
                                {editando ? 'Actualizar' : 'Guardar'}
                            </button>
                            <button
                                type="button"
                                onClick={limpiarFormulario}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Desde</label>
                    <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => {
                            setFechaDesde(e.target.value);
                            setPagina(1);
                        }}
                        className="border px-3 py-1 rounded text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                    <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => {
                            setFechaHasta(e.target.value);
                            setPagina(1);
                        }}
                        className="border px-3 py-1 rounded text-sm"
                    />
                </div>

                {(fechaDesde || fechaHasta) && (
                    <button
                        onClick={() => {
                            setFechaDesde('');
                            setFechaHasta('');
                            setPagina(1);
                        }}
                        className="text-sm text-red-500 underline mt-5"
                    >
                        Limpiar fechas
                    </button>
                )}

                <select
                    onChange={(e) => {
                        setCategoriaId(e.target.value);
                        setPagina(1);
                    }}
                    className="border px-2 py-1 rounded mt-5"
                    value={categoriaId}
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nombre_categoria}
                        </option>
                    ))}
                </select>

                <select
                    onChange={(e) => {
                        setOrdenarPor(e.target.value);
                        setPagina(1);
                    }}
                    className="border px-2 py-1 rounded mt-5"
                    value={ordenarPor}
                >
                    <option value="fecha">Fecha</option>
                    <option value="importe">Importe</option>
                    <option value="descripcion">Descripción</option>
                </select>

                <select
                    onChange={(e) => {
                        setDireccion(e.target.value);
                        setPagina(1);
                    }}
                    className="border px-2 py-1 rounded mt-5"
                    value={direccion}
                >
                    <option value="desc">↓ Descendente</option>
                    <option value="asc">↑ Ascendente</option>
                </select>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                <table className="min-w-full text-sm text-gray-800 bg-white">
                    <thead className="bg-gray-100 text-xs text-gray-600 ">
                        <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Fecha</th>
                            <th className="px-4 py-3 text-left">Categoría</th>
                            <th className="px-4 py-3 text-left">Descripción</th>
                            <th className="px-4 py-3 text-right">Importe</th>
                            <th className="px-4 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gastos.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                    No hay gastos registrados
                                </td>
                            </tr>
                        ) : (
                            gastos.map((gasto) => (
                                <tr
                                    key={gasto.id}
                                    className="hover:bg-gray-50 border-t border-gray-200 transition"
                                >
                                    <td className="px-4 py-3">{gasto.id}</td>
                                    <td className="px-4 py-3">
                                        {new Date(gasto.fecha).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        {gasto.categoria?.nombre_categoria || 'Sin categoría'}
                                    </td>
                                    <td className="px-4 py-3">{gasto.descripcion}</td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        ${parseFloat(gasto.importe).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleEditar(gasto)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded mr-2"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(gasto.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Total de gastos */}
            {gastos.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-lg font-semibold">
                        Total: ${gastos.reduce((sum, g) => sum + parseFloat(g.importe), 0).toFixed(2)}
                    </p>
                </div>
            )}

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

export default Gastos;