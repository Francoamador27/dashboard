import React, { useEffect, useState } from 'react';
import useCont from '../hooks/useCont';
import clienteAxios from '../config/axios';

const TablaPrecios = () => {
  const [reglasDescuento, setReglasDescuento] = useState([]);
  const { producto } = useCont();

  useEffect(() => {
    const obtenerReglas = async () => {
      try {
        const response = await clienteAxios('/api/cart-discounts');
        const reglasFiltradas = response.data?.data
          ?.filter(regla =>
            regla.is_active &&
            regla.condition_type === 'quantity'
          )
          .map(regla => ({
            cantidad: parseInt(regla.min_value),
            descuento: parseFloat(regla.discount_value)
          })) || [];

        reglasFiltradas.sort((a, b) => a.cantidad - b.cantidad);
        setReglasDescuento(reglasFiltradas);
      } catch (error) {
        console.error('Error cargando reglas de descuento:', error);
      }
    };

    obtenerReglas();
  }, []);

  const formatear = num =>
    num.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    });

  // Mostrar solo si el producto está cargado
  if (!producto) return null;

  const precioOriginal = parseFloat(producto.precio);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border border-gray-200 rounded-xl overflow-hidden bg-white shadow">
        <thead className="bg-gray-100 text-gray-600 text-sm">
          <tr>
            <th className="px-6 py-3 font-semibold">Cantidad</th>
            <th className="px-6 py-3 font-semibold">Precio Unitario</th>
            <th className="px-6 py-3 font-semibold">Total</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 text-sm">
          {/* Fila sin descuento */}
          <tr className="border-t">
            <td className="px-6 py-4">1 imán</td>
            <td className="px-6 py-4">{formatear(precioOriginal)}</td>
            <td className="px-6 py-4">{formatear(precioOriginal)}</td>
          </tr>

          {/* Filas con descuento dinámico */}
          {reglasDescuento.map(regla => {
            const cantidad = regla.cantidad;
            const descuentoDecimal = regla.descuento / 100;
            const precioConDescuento = precioOriginal * (1 - descuentoDecimal);
            const total = precioConDescuento * cantidad;

            return (
              <tr key={cantidad} className="border-t">
                <td className="px-6 py-4">{cantidad} imanes</td>
                <td className="px-6 py-4">{formatear(precioConDescuento)}</td>
                <td className="px-6 py-4">{formatear(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TablaPrecios;
