// src/views/CreateProducto.jsx
import React, { useState } from 'react';
import clienteAxios from '../config/axios';

const CreateProducto = () => {
  const token = localStorage.getItem('AUTH_TOKEN');

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    disponible: true,
    imagenes: [],
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      // múltiples imágenes
      setForm((p) => ({ ...p, imagenes: Array.from(files) }));
    } else if (type === 'checkbox') {
      setForm((p) => ({ ...p, [name]: checked }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);

    if (!form.nombre.trim()) return setError('El nombre es obligatorio.');
    if (!form.precio || Number(form.precio) < 0) return setError('Precio inválido.');

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('nombre', form.nombre);
      fd.append('descripcion', form.descripcion || '');
      fd.append('precio', form.precio);
      fd.append('disponible', form.disponible ? 1 : 0);
      fd.append('categoria_id', 2); // categoría combos (oculto)

      // Importante: si tu backend espera otro nombre, cambia 'imagenes[]' por el que uses.
      form.imagenes.forEach((file) => fd.append('imagenes[]', file));

      await clienteAxios.post('/api/productos', fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMsg('Producto creado correctamente.');
      setForm({
        nombre: '',
        descripcion: '',
        precio: '',
        disponible: true,
        imagenes: [],
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        const first = Object.values(err.response.data.errors || {})[0]?.[0];
        setError(first || 'Datos inválidos.');
      } else {
        setError('No se pudo crear el producto. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold text-[#008DD2] mb-4">Crear Combo</h1>

      {/* input oculto por si lo necesitás en el DOM */}
      <input type="hidden" name="categoria_id" value="2" />

      {msg && <div className="mb-4 p-3 rounded bg-green-50 text-green-700">{msg}</div>}
      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1">Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Precio *</label>
          <input
            type="number"
            name="precio"
            min="0"
            step="0.01"
            value={form.precio}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Imágenes (puede seleccionar varias)</label>
          <input
            type="file"
            name="imagenes"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="w-full"
          />
          {/* Vista rápida (opcional) */}
          {form.imagenes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {form.imagenes.map((f, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(f)}
                  alt={`preview-${i}`}
                  className="w-20 h-20 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="disponible"
            checked={form.disponible}
            onChange={handleChange}
          />
          <span>Disponible</span>
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-full bg-[#008DD2] text-white font-semibold disabled:opacity-60"
          >
            {loading ? 'Guardando…' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProducto;
