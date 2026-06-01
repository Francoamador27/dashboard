import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import clienteAxios from '../../config/axios';

const FormularioCupon = () => {
  const token = localStorage.getItem('AUTH_TOKEN');

  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    discount_value: '',
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    usage_count: 0,
    per_user_limit: '',
    is_active: true,
    start_date: '',
    end_date: '',
  });

  const [usarFechas, setUsarFechas] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    const payload = {
      ...form,
      start_date: usarFechas && form.start_date !== '' ? form.start_date : null,
      end_date: usarFechas && form.end_date !== '' ? form.end_date : null,
    };

    try {
      const response = await clienteAxios.post('/api/coupons', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMensaje('Cupón creado correctamente');
      setForm({
        code: '',
        type: 'percentage',
        discount_value: '',
        min_purchase: '',
        max_discount: '',
        usage_limit: '',
        usage_count: 0,
        per_user_limit: '',
        is_active: true,
        start_date: '',
        end_date: '',
      });
      setUsarFechas(false);
    } catch (err) {
      setError('Error al guardar el cupón');
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Crear Cupón</h2>
      {mensaje && <p className="mb-2 text-green-600">{mensaje}</p>}
      {error && <p className="mb-2 text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="code" placeholder="Código del cupón" className="border px-3 py-2 rounded" value={form.code} onChange={handleChange} required />

          <select name="type" className="border px-3 py-2 rounded" value={form.type} onChange={handleChange}>
            <option value="percentage">Porcentaje</option>
            {/* <option value="fixed">Monto fijo</option> */}
          </select>

          <input type="number" name="discount_value" placeholder="Valor del descuento" className="border px-3 py-2 rounded" value={form.discount_value} onChange={handleChange} required />

          {/* <input type="number" name="min_purchase" placeholder="Compra mínima (opcional)" className="border px-3 py-2 rounded" value={form.min_purchase} onChange={handleChange} /> */}

          {/* <input type="number" name="max_discount" placeholder="Descuento máximo (opcional)" className="border px-3 py-2 rounded" value={form.max_discount} onChange={handleChange} /> */}

          <input type="number" name="usage_limit" placeholder="Límite de uso total (opcional)" className="border px-3 py-2 rounded" value={form.usage_limit} onChange={handleChange} />

          {/* <input type="number" name="per_user_limit" placeholder="Límite por usuario (opcional)" className="border px-3 py-2 rounded" value={form.per_user_limit} onChange={handleChange} /> */}

          <label className="flex items-center space-x-2">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            <span>Activo</span>
          </label>
        </div>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={usarFechas} onChange={() => {
              setUsarFechas(!usarFechas);
              if (usarFechas) {
                setForm(prev => ({ ...prev, start_date: '', end_date: '' }));
              }
            }} />
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

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={16} /> Crear Cupón
        </button>
      </form>
    </div>
  );
};

export default FormularioCupon;
