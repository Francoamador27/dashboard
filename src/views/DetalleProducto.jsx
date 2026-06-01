import { useParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import clienteAxios from '../config/axios';
import urlImage from '../utils/urlmages';
import { useState, useEffect } from 'react';
import { mostrarError, mostrarExito } from '../utils/Alertas';

const DetalleProducto = () => {
    const { id } = useParams();
    const token = localStorage.getItem('AUTH_TOKEN');

    const fetcher = () =>
        clienteAxios(`/api/productos/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.data);

    const { data: producto, error, isLoading } = useSWR(`/api/productos/${id}`, fetcher);

    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        disponible: 1
    });

    useEffect(() => {
        if (producto) {
            setForm({
                nombre: producto.nombre || '',
                descripcion: producto.descripcion || '',
                precio: producto.precio || '',
                disponible: producto.disponible ? 1 : 0
            });
        }
    }, [producto]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    };

    const guardarCambios = async () => {
        try {
            await clienteAxios.put(`/api/productos/${id}`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            mutate(`/api/productos/${id}`);
            mostrarExito('Se han guardado los cambios')
        } catch (error) {
            mostrarError();
        }
    };

    if (isLoading) return <p className="p-4 text-gray-600">Cargando producto...</p>;
    if (error) return <p className="p-4 text-red-600">Error al cargar el producto.</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
                <h1 className="text-3xl font-bold text-neutral-800 mb-6">Editar Producto</h1>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
                        <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Precio</label>
                        <input
                            type="number"
                            name="precio"
                            value={form.precio}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            id="disponible"
                            type="checkbox"
                            name="disponible"
                            checked={form.disponible === 1}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="disponible" className="text-sm text-neutral-700">
                            Producto disponible
                        </label>
                    </div>

                    <div>
                        <button
                            onClick={guardarCambios}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition duration-200"
                        >
                            Guardar cambios
                        </button>
                    </div>
                </div>
            </div>

            {producto.imagenes?.length > 0 && (
                <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Imágenes</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {producto.imagenes.map((img, index) => (
                            <img
                                key={index}
                                src={`${urlImage}${img}`}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-40 object-cover rounded-xl border border-neutral-200"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>

    );
};

export default DetalleProducto;
