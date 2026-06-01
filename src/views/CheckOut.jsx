import ResumenProducto from "../components/ResumenProducto";
import useCont from "../hooks/useCont";
import { createRef, useEffect, useState } from 'react';
import Alerta from '../components/Alerta';
import { Link } from "react-router-dom";
import { SiMercadopago } from "react-icons/si";
import TurnstileCaptcha from '../components/TurnstileCaptcha';
import useAuthBase from "../hooks/useBaseAuth";
import clienteAxios from '../config/axios';
import { toast } from 'react-toastify';

const CheckOut = () => {
    const entorno = import.meta.env.VITE_ENTORNO;
    const { pedido, handleSubmitNuevaOrden, total } = useCont();
    const { user } = useAuthBase();

    const reglasCantidad = [
        { cantidad: 3, descuento: 10 },
        { cantidad: 6, descuento: 20 },
    ];

    const [metodoEnvio, setMetodoEnvio] = useState('');
    const [mensajeEnvio, setMensajeEnvio] = useState('');
    const [codigoPostal, setCodigoPostal] = useState('');
    const [captchaCheckout, setCaptchaCheckout] = useState('');
    const [codigoCupon, setCodigoCupon] = useState('');
    const [cuponValidado, setCuponValidado] = useState(null);
    const [montoDescuentoCupon, setMontoDescuentoCupon] = useState(0);
    const [cuponError, setCuponError] = useState(null);
    const [cuponProcesado, setCuponProcesado] = useState(false);

    // Estados para los datos del cliente (para admins)
    const [datosCliente, setDatosCliente] = useState({
        name: '',
        email: '',
        telefono: '',
        dni: '',
        direccion: '',
        localidad: '',
        provincia: ''
    });

    const totalUnidades = pedido.reduce((acc, producto) => acc + parseInt(producto.cantidad), 0);
    const reglaAplicada = reglasCantidad
        .filter(regla => totalUnidades >= regla.cantidad)
        .sort((a, b) => b.descuento - a.descuento)[0];
    const descuento = reglaAplicada ? reglaAplicada.descuento : 0;
    const totalConDescuento = total - (total * (descuento / 100));
    const [costoEnvio, setCostoEnvio] = useState(0);
    const totalFinal = totalConDescuento - montoDescuentoCupon + costoEnvio;

    // Referencias solo para usuarios no admin
    const nameRef = createRef();
    const emailRef = createRef();
    const telefonoRef = createRef();
    const dniRef = createRef();
    const direccionRef = createRef();
    const localidadRef = createRef();
    const provinciaRef = createRef();

    const [loading, setLoading] = useState(false);
    const [errores, setErrores] = useState([]);
    const [loadingCupon, setLoadingCupon] = useState(false);
    const [calculandoEnvio, setCalculandoEnvio] = useState(false);

    useEffect(() => {
        if (user) {
            if (user.admin === 1) {
                // Para admins, guardar en estado
                setDatosCliente({
                    name: user.name || '',
                    email: user.email || '',
                    telefono: user.telefono || '',
                    dni: user.dni || '',
                    direccion: user.direccion || '',
                    localidad: user.localidad || '',
                    provincia: user.provincia || ''
                });
            } else {
                // Para usuarios normales, llenar las referencias
                if (nameRef.current) nameRef.current.value = user.name || '';
                if (emailRef.current) emailRef.current.value = user.email || '';
                if (telefonoRef.current) telefonoRef.current.value = user.telefono || '';
                if (dniRef.current) dniRef.current.value = user.dni || '';
                if (direccionRef.current) direccionRef.current.value = user.direccion || '';
                if (localidadRef.current) localidadRef.current.value = user.localidad || '';
                if (provinciaRef.current) provinciaRef.current.value = user.provincia || '';
            }

            if (user.codigo_postal) {
                setCodigoPostal(user.codigo_postal);
                determinarMetodoEnvio(user.codigo_postal);
            }
        }

        // Validar cupón automáticamente si hay en localStorage
        if (codigoCupon) {
            validarCupon(codigoCupon);
        }
    }, [user]);


    const determinarMetodoEnvio = async (cp) => {
        if (!cp || cp.length < 4) {
            setMetodoEnvio('');
            setMensajeEnvio('');
            setCostoEnvio(0);
            return;
        }

        const codigo = parseInt(cp);
        setCalculandoEnvio(true);

        if (codigo >= 5000 && codigo <= 5019) {
            setMetodoEnvio("cordoba");
            setMensajeEnvio("Tu código postal es de la ciudad de Córdoba. El envío se coordina con el vendedor luego de la compra.");
            setCostoEnvio(0);
            setCalculandoEnvio(false);
        } else {
            try {
                const response = await fetch("https://dev-ar.e-pick.com.ar/api/orders/calculator/www", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Origin": "https://dev-ar.e-pick.com.ar",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        package: {
                            long: 10,
                            width: 10,
                            height: 20,
                            weight: "0.5",
                            value: total // si preferís, usá totalConDescuento
                        },
                        sender: {
                            postal_code: "5000"
                        },
                        addressee: {
                            postal_code: cp
                        }
                    })
                });

                const data = await response.json();

                if (data?.isValid) {
                    setMetodoEnvio("epick");
                    setCostoEnvio(data.price);
                    setMensajeEnvio(`Costo de envío vía E-Pick: $${data.price.toLocaleString('es-AR')}. `);
                } else {
                    setMetodoEnvio('');
                    setCostoEnvio(0);
                    setMensajeEnvio('No se pudo calcular el costo de envío. Verificá tu código postal.');
                }
            } catch (error) {
                console.error("Error al consultar E-Pick:", error);
                setMetodoEnvio('');
                setCostoEnvio(0);
                setMensajeEnvio('Error al calcular el envío. Intentá nuevamente.');
            } finally {
                setCalculandoEnvio(false);
            }
        }
    };

    const validarCupon = async (codigoManual) => {
        const cuponCodigo = codigoManual || codigoCupon;
        if (!cuponCodigo.trim()) return;

        setLoadingCupon(true);
        setCuponProcesado(true);
        setCuponError(null);

        try {
            const { data } = await clienteAxios.get(`/api/coupons/validate`, {
                params: {
                    code: cuponCodigo.trim(),
                    total: totalConDescuento,
                }
            });

            if (data.valid) {
                setCuponValidado(data.data);
                setMontoDescuentoCupon(Number(data.discount));
                toast.success(`Cupón aplicado: ${data.data.code} - Descuento: $${data.discount}`);
            } else {
                setCuponValidado(null);
                setMontoDescuentoCupon(0);
                setCuponError(data.message || "Cupón inválido o inactivo");
            }
        } catch (error) {
            console.error("Error al validar cupón", error);
            setCuponValidado(null);
            setMontoDescuentoCupon(0);
            setCuponError("Error al validar el cupón");
        } finally {
            setLoadingCupon(false);
        }
    };

    const limpiarCupon = () => {
        setCuponValidado(null);
        setMontoDescuentoCupon(0);
        setCodigoCupon('');
        localStorage.removeItem("codigoCupon");
        toast.info("Cupón removido");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (!captchaCheckout && entorno !== 'local') {
            setErrores(["Validá el CAPTCHA antes de continuar."]);
            setLoading(false);
            return;
        }

        // Obtener datos según el tipo de usuario
        const datos = user?.admin === 1 ? {
            name: datosCliente.name,
            email: datosCliente.email,
            telefono: datosCliente.telefono,
            dni: datosCliente.dni,
            codigo_postal: codigoPostal.trim(),
            direccion: datosCliente.direccion,
            localidad: datosCliente.localidad,
            provincia: datosCliente.provincia,
            metodo_envio: metodoEnvio,
        } : {
            name: nameRef.current.value.trim(),
            email: emailRef.current.value.trim(),
            telefono: telefonoRef.current.value.trim(),
            dni: dniRef.current.value.trim(),
            codigo_postal: codigoPostal.trim(),
            direccion: direccionRef.current.value.trim(),
            localidad: localidadRef.current.value.trim(),
            provincia: provinciaRef.current.value.trim(),
            metodo_envio: metodoEnvio,
        };

        const erroresTemp = [];
        if (!datos.name || /[<>{}]/.test(datos.name)) erroresTemp.push("Nombre inválido o vacío.");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datos.email)) erroresTemp.push("Email inválido.");
        if (!/^\d{6,15}$/.test(datos.telefono)) erroresTemp.push("Teléfono inválido.");
        if (datos.dni && !/^\d{6,15}$/.test(datos.dni)) erroresTemp.push("DNI inválido.");
        if (!/^\d{4,10}$/.test(datos.codigo_postal)) erroresTemp.push("Código postal inválido.");
        if (!datos.direccion || /[<>{}]/.test(datos.direccion)) erroresTemp.push("Dirección inválida o vacía.");
        if (datos.localidad && /[<>{}]/.test(datos.localidad)) erroresTemp.push("Localidad inválida.");
        if (datos.provincia && /[<>{}]/.test(datos.provincia)) erroresTemp.push("Provincia inválida.");

        if (erroresTemp.length > 0) {
            setErrores(erroresTemp);
            setLoading(false);
            return;
        }

        let order = {
            datos,
            carrtios: pedido,
            turnstile_token: captchaCheckout,
            cupon: cuponValidado ? cuponValidado.code : null,
        };

        handleSubmitNuevaOrden(order);
    };

    // Componente para mostrar el resumen de precios
    const ResumenPrecios = () => (
        <div className="mt-6 space-y-2">
            {descuento > 0 && (
                <div className="bg-green-100 border border-green-400 text-green-700 p-2 rounded">
                    Descuento aplicado: {descuento}% por comprar más de {reglaAplicada.cantidad} unidades
                </div>
            )}

            <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalConDescuento.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>

            {cuponValidado && montoDescuentoCupon > 0 && (
                <div className="flex justify-between text-green-600">
                    <span>Descuento Cupón ({cuponValidado.code})</span>
                    <span>-${montoDescuentoCupon.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
            )}

            {/* Línea de envío con loading o precio */}
            <div className="flex justify-between">
                <span>Envío</span>
                {calculandoEnvio ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span className="text-blue-600">Calculando...</span>
                    </div>
                ) : (
                    <span>
                        {metodoEnvio === "cordoba" ? (
                            <span className="text-green-600">Coordinar con vendedor</span>
                        ) : metodoEnvio === "epick" ? (
                            <span className="text-blue-600">
                                E-Pick: ${costoEnvio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        ) : costoEnvio > 0 ? (
                            <span>${costoEnvio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                        ) : (
                            <span className="text-gray-500">A calcular</span>
                        )}
                    </span>
                )}
            </div>

            {/* Mostrar mensaje explicativo del envío */}
            {mensajeEnvio && !calculandoEnvio && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <p className="text-sm text-blue-700">{mensajeEnvio}</p>
                </div>
            )}

            <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total Final</span>
                    {calculandoEnvio ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span className="text-blue-600">Calculando...</span>
                        </div>
                    ) : (
                        <span>${totalFinal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Layout para Admin - centrado con max-width 650px */}
            {user?.admin === 1 ? (
                <div className="max-w-[650px] mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-center">
                        Administrar Pedido
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mostrar errores */}
                        {errores.map((error, index) => (
                            <Alerta key={index}>{error}</Alerta>
                        ))}

                        {/* Campos ocultos para admin */}
                        <input type="hidden" name="name" value={datosCliente.name} />
                        <input type="hidden" name="email" value={datosCliente.email} />
                        <input type="hidden" name="telefono" value={datosCliente.telefono} />
                        <input type="hidden" name="dni" value={datosCliente.dni} />
                        <input type="hidden" name="direccion" value={datosCliente.direccion} />
                        <input type="hidden" name="localidad" value={datosCliente.localidad} />
                        <input type="hidden" name="provincia" value={datosCliente.provincia} />

                        {/* Carrito */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Tu Carrito</h2>

                            <div className="space-y-4">
                                {pedido.map((producto, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-4">
                                        <ResumenProducto producto={producto} />
                                    </div>
                                ))}
                            </div>

                            {/* Usar el componente ResumenPrecios */}
                            <ResumenPrecios />

                            <div className="mt-6">
                                {entorno !== 'local' && (
                                    <TurnstileCaptcha onVerify={setCaptchaCheckout} />
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || calculandoEnvio}
                                    className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Procesando...</span>
                                        </div>
                                    ) : calculandoEnvio ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Calculando envío...</span>
                                        </div>
                                    ) : (
                                        <span>Cargar pedido</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                /* Layout para Usuario Normal - 2 columnas en desktop */
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-center">
                        Finalizar Compra
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mostrar errores */}
                        {errores.map((error, index) => (
                            <Alerta key={index}>{error}</Alerta>
                        ))}

                        {/* Layout de 2 columnas en desktop, 1 en mobile */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Columna izquierda - Datos del Cliente */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4">Datos del Cliente</h2>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Nombre completo"
                                            ref={nameRef}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            ref={emailRef}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="tel"
                                            placeholder="Teléfono"
                                            ref={telefonoRef}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="DNI"
                                            ref={dniRef}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Código Postal"
                                        value={codigoPostal}
                                        onChange={(e) => {
                                            const cp = e.target.value.replace(/\D/g, '');
                                            setCodigoPostal(cp);
                                            if (cp.length >= 4) determinarMetodoEnvio(cp);
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />

                                    <input
                                        type="text"
                                        placeholder="Dirección"
                                        ref={direccionRef}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Localidad"
                                            ref={localidadRef}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Provincia"
                                            ref={provinciaRef}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Columna derecha - Carrito */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4">Tu Carrito</h2>

                                <div className="space-y-4">
                                    {pedido.map((producto, index) => (
                                        <div key={index} className="flex items-center justify-between border-b pb-4">
                                            <ResumenProducto producto={producto} />
                                        </div>
                                    ))}
                                </div>

                                {/* Sección de Cupón */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código de Cupón
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={codigoCupon}
                                            onChange={(e) => {
                                                setCodigoCupon(e.target.value);
                                                setCuponError(null);
                                                setCuponProcesado(false);
                                            }}
                                            className="flex-1 p-2 border border-gray-300 rounded"
                                            placeholder="Ingresa tu código"
                                            disabled={cuponValidado !== null}
                                        />
                                        {cuponValidado || cuponProcesado ? (
                                            <button
                                                type="button"
                                                onClick={limpiarCupon}
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Quitar
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => validarCupon()}
                                                disabled={loadingCupon || cuponProcesado}
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                            >
                                                {loadingCupon ? "Aplicando..." : "Aplicar"}
                                            </button>
                                        )}
                                    </div>

                                    {cuponError && (
                                        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                                            ✗ {cuponError}
                                        </div>
                                    )}
                                    {cuponValidado && (
                                        <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                                            <div className="font-semibold">
                                                ✓ Cupón aplicado: {cuponValidado.code}
                                            </div>
                                            <div className="text-sm">
                                                Descuento: {cuponValidado.discount_value}% (${montoDescuentoCupon.toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Usar el componente ResumenPrecios */}
                                <ResumenPrecios />

                                <div className="mt-6">
                                    {entorno !== 'local' && (
                                        <TurnstileCaptcha onVerify={setCaptchaCheckout} />
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || calculandoEnvio}
                                        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Procesando...</span>
                                            </div>
                                        ) : calculandoEnvio ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Calculando envío...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <SiMercadopago className="h-5 w-5" />
                                                <span>Pagar con Mercado Pago</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CheckOut;