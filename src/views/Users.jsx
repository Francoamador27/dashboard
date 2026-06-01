import { useState } from "react";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import { Link } from "react-router-dom";
import { mostrarConfirmacion } from "../utils/Alertas";

const Users = () => {
    const token = localStorage.getItem("AUTH_TOKEN");

    const [busqueda, setBusqueda] = useState("");
    const [direccion, setDireccion] = useState("desc");
    const [perPage, setPerPage] = useState(10);
    const [pagina, setPagina] = useState(1);

    const params = new URLSearchParams();
    if (busqueda.length >= 4) params.append("busqueda", busqueda);
    if (direccion) params.append("direccion", direccion);
    if (perPage) params.append("per_page", perPage);
    if (pagina) params.append("page", pagina);

    const query = params.toString();

    const fetcher = () =>
        clienteAxios(`/api/usuarios?${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => res.data);

    const { data, error, isLoading, mutate } = useSWR(`/api/usuarios?${query}`, fetcher);

    const eliminarUsuario = async (usuario) => {
     const confirmar = await mostrarConfirmacion(
            '¿Estas seguro que desea eliminar?',
            'Esta acción eliminara el usuario.'
        );
        if (!confirmar) return;

        try {
            await clienteAxios.delete(`/api/usuarios/${usuario.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            mutate(); // refresca la tabla
        } catch (error) {
            alert("Error al eliminar el usuario");
        }
    };

    if (isLoading) return <p>Cargando usuarios...</p>;
    if (error) return <p>Error al cargar los usuarios.</p>;

    const usuarios = data?.data || [];
    const meta = data?.meta || {};

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-6">Administrar Usuarios</h2>

            {/* Filtros y búsqueda */}
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPagina(1);
                        }}
                        placeholder="Buscar por nombre, email o DNI"
                        className="border px-3 py-1 rounded w-64"
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
                        Escribí al menos 4 letras o números para buscar.
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

            {/* Tabla de usuarios */}
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                <table className="min-w-full text-sm text-gray-800 bg-white">
                    <thead className="bg-gray-100 text-xs text-gray-600 ">
                        <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Nombre</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">DNI</th>
                            <th className="px-4 py-3 text-left">Rol</th>
                            <th className="px-4 py-3 text-left">Creado</th>
                            <th className="px-4 py-3 text-left">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario) => (
                            <tr
                                key={usuario.id}
                                className="hover:bg-gray-50 border-t border-gray-200 transition"
                            >
                                <td className="px-4 py-3">{usuario.id}</td>
                                <td className="px-4 py-3">{usuario.name}</td>
                                <td className="px-4 py-3">{usuario.email}</td>
                                <td className="px-4 py-3">{usuario.dni}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${usuario.admin
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {usuario.admin ? "Admin" : "Cliente"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {new Date(usuario.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 flex gap-2">
                                    <Link
                                        to={`/admin-dash/clientes/${usuario.id}`}
                                        className="px-3 py-1 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                    >
                                        Ver más
                                    </Link>
                                    <button
                                        onClick={() => eliminarUsuario(usuario)}
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

            {/* Paginación */}
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

export default Users;
