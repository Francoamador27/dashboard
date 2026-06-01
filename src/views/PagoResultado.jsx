import { useParams, useSearchParams } from "react-router-dom";

export default function PagoResultado() {
  const { estado } = useParams(); // 'success', 'failure', 'pending'
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido_id");

  return (
    <div className="p-4 text-center max-w-2xl mx-auto min-h-[400px] flex flex-col justify-center">
      {estado === "success" && (
        <>
          <h1 className="text-green-600 text-2xl font-semibold mb-4">
            ¡Pago exitoso del pedido #{pedidoId}!
          </h1>
          <p className="text-gray-800 mb-2">
            Hemos recibido tu pago correctamente. Ahora estamos verificando los datos de tu pedido.
          </p>
          <p className="text-gray-800 mb-2">
            En breve comenzaremos a preparar tu envío. Te mantendremos informado/a por correo electrónico o WhatsApp una vez que el servicio haya sido despachado.
          </p>
          <p className="text-gray-800">
            ¡Gracias por confiar en nosotros para crear tus imanes personalizados!
          </p>
        </>
      )}

      {estado === "failure" && (
        <>
          <h1 className="text-red-600 text-2xl font-semibold mb-4">
            El pago ha fallado
          </h1>
          <p className="text-gray-800 mb-2">
            No pudimos procesar tu pago para el pedido #{pedidoId}. Es posible que haya ocurrido un error con el método de pago seleccionado.
          </p>
          <p className="text-gray-800 mb-2">
            Te recomendamos intentar nuevamente o usar otro medio de pago.
          </p>
          <p className="text-gray-800">
            Si el problema persiste, no dudes en contactarnos para ayudarte a finalizar tu compra.
          </p>
        </>
      )}

      {estado === "pending" && (
        <>
          <h1 className="text-yellow-600 text-2xl font-semibold mb-4">
            Pago en proceso de aprobación
          </h1>
          <p className="text-gray-800 mb-2">
            Hemos recibido tu intento de pago para el pedido #{pedidoId}, pero aún está pendiente de aprobación por parte de la entidad bancaria o plataforma de pago.
          </p>
          <p className="text-gray-800 mb-2">
            Estamos monitoreando el estado del mismo. Una vez que se confirme, procederemos a preparar tu pedido.
          </p>
          <p className="text-gray-800">
            Te notificaremos automáticamente cuando el pago sea aprobado o si requiere alguna acción adicional.
          </p>
        </>
      )}
    </div>
  );
}
