import { useState } from "react";
import useSWR, { mutate } from "swr";
import clienteAxios from "../config/axios";
import { mostrarConfirmacion, mostrarError, mostrarExito } from "../utils/Alertas";

const CartAbandoment = () => {
    const token = localStorage.getItem("AUTH_TOKEN");

    const [busqueda, setBusqueda] = useState("");
    const [direccion, setDireccion] = useState("desc");
    const [perPage, setPerPage] = useState(10);
    const [pagina, setPagina] = useState(1);

    // Construcción dinámica del query
    const params = new URLSearchParams();
    if (busqueda.length >= 4) params.append("busqueda", busqueda);
    if (direccion) params.append("direccion", direccion);
    if (perPage) params.append("per_page", perPage);
    if (pagina) params.append("page", pagina);

    const query = params.toString();

    const fetcher = () =>
        clienteAxios(`/api/carritos?sin_pedido=1&${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => res.data);

    const { data, error, isLoading } = useSWR(`/api/carritos?sin_pedido=1&${query}`, fetcher);

    if (isLoading) return <p>Cargando carritos abandonados...</p>;
    if (error) return <p>Error al cargar los carritos.</p>;

    const carritos = data || [];
    const meta = data || {};

    const handleEliminarCarrito = async (id) => {
        const confirmar = await mostrarConfirmacion(
            '¿Desea eliminar este carrito?',
            'Esta acción eliminará el carrito y sus imágenes asociadas.'
        );
        if (!confirmar) return;

        try {
            const respuesta = await clienteAxios.delete(`/api/carritos/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            mostrarExito(respuesta.data.message);
            mutate(`/api/carritos?sin_pedido=1&${query}`);
        } catch (error) {
            mostrarError("Error al eliminar el carrito.");
        }
    };
    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-6">Carritos Abandonados</h2>

            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPagina(1);
                        }}
                        placeholder="Buscar por producto"
                        className="border px-3 py-1 rounded w-52"
                    />
                    {busqueda && (
                        <button
                            onClick={() => {
                                setBusqueda("");
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
                        setDireccion(e.target.value);
                        setPagina(1);
                    }}
                    className="border px-2 py-1 rounded"
                    value={direccion}
                >
                    <option value="desc">Fecha ↓ Recientes</option>
                    <option value="asc">Fecha ↑ Antiguos</option>
                </select>
            </div>

            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                <table className="min-w-full text-sm text-gray-800 bg-white">
                    <thead className="bg-gray-100 text-xs text-gray-600 ">
                        <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Producto ID</th>
                            <th className="px-4 py-3 text-left">Imagen</th>
                            <th className="px-4 py-3 text-left">Cantidad</th>
                            <th className="px-4 py-3 text-left">Fecha</th>
                            <th className="px-4 py-3 text-left">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carritos.map((carrito) => (
                            <tr
                                key={carrito.id}
                                className="hover:bg-gray-50 border-t border-gray-200 transition"
                            >
                                <td className="px-4 py-3">{carrito.id}</td>
                                <td className="px-4 py-3">{carrito.producto_id}</td>
                                <td className="px-4 py-3">
                                    {carrito.imagenes?.length > 0 ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}storage/uploads/${carrito.imagenes[0]}`}
                                            alt="Imagen del producto"
                                            className="h-12 rounded"
                                        />
                                    ) : (
                                        <span className="text-gray-400 italic">Sin imagen</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">{carrito.cantidad}</td>
                                <td className="px-4 py-3">
                                    {new Date(carrito.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleEliminarCarrito(carrito.id)}
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

export default CartAbandoment;
