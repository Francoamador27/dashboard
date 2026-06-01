import { FaWhatsapp } from 'react-icons/fa';
import TablaPrecios from './TablaPrecios';

export default function Precios() {
  return (
    <section id="portafolio" className="bg-[#fefbf5] py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-10">Precios</h2>

        {/* Tabla de precios */}
        <div className="overflow-x-auto">
          <TablaPrecios />
        </div>

        {/* Info de mayorista */}
        <div className="mt-10 text-gray-700 text-sm">
          <p>
            Si necesitás <strong>precios al por mayor</strong>, podés comunicarte directamente con nosotros por WhatsApp.
          </p>
          <div className="mt-4 flex justify-center items-center gap-2 text-green-600 font-semibold">
            <FaWhatsapp className="text-xl" />
            <span>Presioná el botón flotante para hablar con nosotros</span>
          </div>
        </div>
      </div>
    </section>
  );
}
