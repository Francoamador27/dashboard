import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clienteAxios from '../config/axios';

const EditarCupon = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('AUTH_TOKEN');

  const [form, setForm] = useState({
    name: '',
    type: 'percentage',
    condition_type: 'amount',
    discount_value: '',
    min_value: '',
    max_discount: '',
    usage_limit: '',
    is_active: true,
    start_date: '',
    end_date: '',
  });

  const [usarFechas, setUsarFechas] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarCupon = async () => {
      try {
        const res = await clienteAxios.get(`/api/cart-discounts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = res.data.data;

        setForm({
          ...data,
          start_date: data.start_date ? data.start_date.slice(0, 16) : '',
          end_date: data.end_date ? data.end_date.slice(0, 16) : '',
        });

        if (data.start_date || data.end_date) {
          setUsarFechas(true);
        }
      } catch (err) {
        console.error('Error al cargar cupón', err);
        setError('No se pudo cargar el cupón');
      }
    };

    cargarCupon();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!form.name || !form.discount_value || !form.type || !form.condition_type) {
      setError('Faltan campos obligatorios');
      return;
    }

    const payload = {
      ...form,
      start_date: usarFechas && form.start_date !== '' ? form.start_date : null,
      end_date: usarFechas && form.end_date !== '' ? form.end_date : null,
    };

    try {
      await clienteAxios.put(`/api/cart-discounts/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMensaje('Regla actualizada correctamente');

      setTimeout(() => {
        navigate('/admin-dash/configuraciones');
      }, 1500);
    } catch (err) {
      console.error('Error al actualizar cupón', err);
      setError('Error al actualizar la regla');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Editar Regla de Descuento</h2>
      {mensaje && <p className="mb-2 text-green-600">{mensaje}</p>}
      {error && <p className="mb-2 text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" placeholder="Nombre de la regla" className="border px-3 py-2 rounded" value={form.name} onChange={handleChange} required />

          <select name="type" className="border px-3 py-2 rounded" value={form.type} onChange={handleChange}>
            <option value="percentage">Porcentaje</option>
            <option value="fixed">Monto fijo</option>
          </select>

          <select name="condition_type" className="border px-3 py-2 rounded" value={form.condition_type} onChange={handleChange}>
            <option value="amount">Por monto total</option>
            <option value="quantity">Por cantidad de productos</option>
          </select>

          <input type="number" name="discount_value" placeholder="Valor del descuento" className="border px-3 py-2 rounded" value={form.discount_value} onChange={handleChange} required />

          <input type="number" name="min_value" placeholder={form.condition_type === 'amount' ? 'Monto mínimo requerido' : 'Cantidad mínima de productos'} className="border px-3 py-2 rounded" value={form.min_value} onChange={handleChange} />

          <input type="number" name="max_discount" placeholder="Descuento máximo (opcional)" className="border px-3 py-2 rounded" value={form.max_discount} onChange={handleChange} />

          <input type="number" name="usage_limit" placeholder="Límite de uso total (opcional)" className="border px-3 py-2 rounded" value={form.usage_limit} onChange={handleChange} />

          <label className="flex items-center space-x-2">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            <span>Activo</span>
          </label>
        </div>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={usarFechas}
              onChange={() => {
                setUsarFechas(!usarFechas);
                if (usarFechas) {
                  setForm(prev => ({
                    ...prev,
                    start_date: '',
                    end_date: '',
                  }));
                }
              }}
            />
            <span>Usar fechas de vigencia</span>
          </label>
        </div>

        {usarFechas && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm text-gray-600">
              Fecha inicio:
              <input type="datetime-local" name="start_date" className="border px-3 py-2 rounded mt-1" value={form.start_date} onChange={handleChange} />
            </label>
            <label className="flex flex-col text-sm text-gray-600">
              Fecha fin:
              <input type="datetime-local" name="end_date" className="border px-3 py-2 rounded mt-1" value={form.end_date} onChange={handleChange} />
            </label>
          </div>
        )}

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EditarCupon;
