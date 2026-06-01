import { FaCamera, FaClipboardCheck, FaBoxOpen, FaClock, FaMoneyCheckAlt, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function ComoComprar() {
    return (
        <section className="bg-[#fefbf5] py-16 px-4" id="como-comprar">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-800 mb-12">¿Cómo Comprar?</h2>

                {/* Pasos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white p-6 rounded-2xl shadow text-center space-y-2">
                        <FaCamera className="text-4xl mx-auto text-gray-600" />
                        <h3 className="text-lg font-bold text-gray-800">Elegí tus fotos favoritas</h3>
                        <p className="text-gray-600">Subí las imágenes que querés convertir en imanes.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow text-center space-y-2">
                        <FaClipboardCheck className="text-4xl mx-auto text-gray-600" />
                        <h3 className="text-lg font-bold text-gray-800">Confirmá cantidad y datos</h3>
                        <p className="text-gray-600">Te pedimos tus datos de envío y cuántos imanes querés.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow text-center space-y-2">
                        <FaBoxOpen className="text-4xl mx-auto text-red-400" />
                        <h3 className="text-lg font-bold text-gray-800">¡Listo! Los preparamos para vos</h3>
                        <p className="text-gray-600">
                            En pocos días te llegan a tu casa. <br /> ¡Hechos con mucho amor ❤️!
                        </p>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="bg-white p-6 rounded-2xl shadow space-y-2">
                        <h4 className="text-lg font-bold text-yellow-600">Información de entrega</h4>
                        <ul className="list-disc pl-5 text-gray-700 space-y-1">
                            <li><strong>Dentro de circunvalación de Córdoba:</strong> Nos contactaremos para coordinar la entrega.</li>
                            <li><strong>Fuera de Córdoba:</strong> Envíos a través de Andreani.</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow space-y-2">
                        <h4 className="text-lg font-bold text-yellow-600">Política de reembolso</h4>
                        <p className="text-gray-700">
                            Una vez que el estado del pedido pasa a <strong>"impreso"</strong>, <strong>no será reembolsable</strong>.
                            Recomendamos revisar bien las imágenes antes de confirmar la compra.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow space-y-2">
                        <h4 className="text-lg font-bold text-blue-600">Método de pago</h4>
                        <p className="text-gray-700">
                            Los pagos se procesan de forma segura a través de <strong>Mercado Pago</strong>. Podés usar tarjeta de crédito, débito o dinero en cuenta. Nunca solicitaremos datos fuera de la plataforma.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow space-y-2">
                        <h4 className="text-lg font-bold text-green-600">Tiempos de entrega</h4>
                        <p className="text-gray-700">
                            El tiempo estimado de entrega es de <strong>3 a 5 días hábiles</strong> dentro de Córdoba. Para otras provincias puede variar según la logística de Andreani.
                        </p>
                    </div>



                    <div className="bg-white p-6 rounded-2xl shadow space-y-2 md:col-span-2">
                        <h4 className="text-lg font-bold text-purple-600">Pedidos mayoristas</h4>
                        <p className="text-gray-700">
                            Si necesitás realizar un <strong>pedido mayorista</strong>, por favor completá el formulario disponible en nuestra sección&nbsp;
                            <Link
                                to="/mayorista"
                                className="text-red-500 font-semibold hover:underline transition"
                            >
                                Mayorista
                            </Link>
                            . Nos pondremos en contacto a la brevedad.
                        </p>
                        <p className="text-gray-700">
                            También podés comunicarte directamente por WhatsApp usando el botón flotante que ves en pantalla.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
