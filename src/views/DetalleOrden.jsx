import { useParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import clienteAxios from '../config/axios';
import urlImage from '../utils/urlmages';
import { useState } from 'react';
import { mostrarConfirmacion } from '../utils/Alertas';
import { Download } from 'lucide-react';

const estados = ['recibido', 'impreso', 'enviado', 'completado', 'cancelado'];

const DetalleOrden = () => {
    const { id } = useParams();
    const token = localStorage.getItem('AUTH_TOKEN');

    const fetcher = () =>
        clienteAxios(`/api/pedidos/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(res => res.data);

    const { data: pedido, isLoading } = useSWR(`/api/pedidos/${id}`, () => fetcher());
    const [nuevoEstado, setNuevoEstado] = useState('');

    const generarPDF = async (carritoId) => {
        try {
            const { data } = await clienteAxios.post('/api/generar-pdf', {
                carrito_id: carritoId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `carrito-${carritoId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Ocurrió un error al generar el PDF.');
        }
    };

    const actualizarEstado = async () => {
        if (!nuevoEstado) return;

        const confirmar = await mostrarConfirmacion(
            '¿Actualizar estado del pedido?',
            `Nuevo estado: ${nuevoEstado}`
        );
        if (!confirmar) return;

        try {
            await clienteAxios.put(`/api/pedidos/${id}`, {
                estado: nuevoEstado,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            mutate(`/api/pedidos/${id}`);
        } catch (error) {
            alert('Error al actualizar el estado del pedido.');
        }
    };

    if (isLoading) return <p className="p-4 text-gray-600">Cargando pedido...</p>;
    if (error) return <p className="p-4 text-red-600">Error al cargar el pedido.</p>;
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">

            {/* ENCABEZADO PRINCIPAL */}
            <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Detalle del Pedido #{pedido.id}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* BOX: Información del Cliente */}
                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Información del Cliente</h2>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Nombre:</strong> {pedido.usuario.name}</p>
                            <p><strong>Email:</strong> {pedido.usuario.email}</p>
                            {pedido.usuario.telefono && <p><strong>Teléfono:</strong> {pedido.usuario.telefono}</p>}
                            <p><strong>Rol:</strong> {pedido.usuario.rol}</p>
                            <p><strong>Dirección:</strong> {pedido.usuario.direccion}, {pedido.usuario.localidad}, {pedido.usuario.provincia}</p>
                            <p><strong>Código Postal:</strong> {pedido.usuario.codigo_postal}</p>
                        </div>
                    </div>

                    {/* BOX: Resumen del Pedido */}
                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700">Resumen del Pedido</h2>
                        <div className="text-sm text-gray-700 space-y-2">
                            <p><strong>Total sin descuentos:</strong> ${pedido.total_sin_descuento}</p>
                            <p><strong>Descuento por regla:</strong> ${pedido.descuento_aplicado ?? 0}</p>
                            <p><strong>Descuento por cupón:</strong> ${pedido.monto_descuento_cupon ?? 0}</p>
                            <p><strong>Código de cupón:</strong> {pedido.codigo_cupon || 'No aplicado'}</p>
                            <p className="font-semibold"><strong>Total final:</strong> ${pedido.total}</p>
                        </div>

                        <div className="text-sm text-gray-700 space-y-1">
                            <p><strong>Fecha:</strong> {new Date(pedido.created_at).toLocaleDateString()}</p>
                            <p><strong>Estado actual:</strong> {pedido.estado}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* BOX: Envío */}
                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Envío</h2>
                        <p><strong>Método de envío:</strong> {
                            pedido.metodo_envio === 'andreani' ? 'Envío por Andreani' :
                                pedido.metodo_envio === 'cordoba' ? 'Entrega en Córdoba Capital' :
                                    pedido.metodo_envio || 'No especificado'
                        }</p>
                        <p><strong>Costo de envío:</strong> ${pedido.costo_envio || 0}</p>
                    </div>

                    {/* BOX: Estado del Pedido */}
                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Actualizar Estado</h2>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm"
                            value={nuevoEstado}
                            onChange={(e) => setNuevoEstado(e.target.value)}
                        >
                            <option value="">Seleccionar estado</option>
                            {estados.map(e => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>
                        <button
                            onClick={actualizarEstado}
                            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                        >
                            Actualizar Estado
                        </button>
                    </div>
                </div>

                {/* BOX: Detalles de Pago */}
                <div className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100 mt-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Detalles de Pago</h2>
                    <div className="text-sm text-gray-700 space-y-1">
                        <p><strong>Estado de Pago:</strong> {pedido.estado_pago}</p>
                        <p><strong>ID de Pago:</strong> {pedido.payment_id}</p>
                        <p><strong>Tipo:</strong> {pedido.payment_type}</p>
                        <p><strong>Método:</strong> {pedido.payment_method}</p>
                        <p><strong>Pagado en:</strong> {pedido.paid_at || 'No se ha acreditado'}</p>
                    </div>
                </div>
            </div>

            {/* BOX: Carritos */}
            <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Carritos en el Pedido</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pedido.carritos.map((carrito) => (
                        <div key={carrito.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            {carrito.imagenes?.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                    {carrito.imagenes.map((img, index) => (
                                        <img
                                            key={index}
                                            src={`${urlImage}${img}`}
                                            alt={`Imagen ${index + 1}`}
                                            className="h-40 w-full object-cover rounded-md"
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="p-4 space-y-1 text-sm text-gray-700">
                                <p><strong>Cantidad:</strong> {carrito.cantidad}</p>
                            </div>
                            <button
                                onClick={() => generarPDF(carrito.id)}
                                className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition duration-200"
                            >
                                <Download className="w-4 h-4" />
                                Descargar PDF
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>


    );
};

export default DetalleOrden;