import React, { useState } from 'react';
import clienteAxios from '../config/axios';

const TestimoniosForm = () => {
  const token = localStorage.getItem('AUTH_TOKEN');

  const [form, setForm] = useState({
    nombre: '',
    texto: '',
    imagen: null,
  });

  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'imagen') {
      const file = files[0];
      if (file && file.size > 3145728) {
        setError('La imagen no puede pesar más de 3MB');
        setForm({ ...form, imagen: null });
        setPreview(null);
        return;
      }

      setError(null);
      setForm({ ...form, imagen: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 3145728) {
        setError('La imagen no puede pesar más de 3MB');
        setForm({ ...form, imagen: null });
        setPreview(null);
        return;
      }
      setError(null);
      setForm({ ...form, imagen: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const eliminarImagen = () => {
    setForm({ ...form, imagen: null });
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!form.nombre || !form.texto || !form.imagen) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('texto', form.texto);
    formData.append('imagen', form.imagen);

    try {
      setCargando(true);
      await clienteAxios.post('/api/testimonios', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMensaje('Testimonio enviado correctamente');
      setForm({
        nombre: '',
        texto: '',
        imagen: null,
      });
      setPreview(null);
    } catch (err) {
      setError('Error al enviar el testimonio');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Enviar Testimonio</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Texto</label>
          <textarea
            name="texto"
            value={form.texto}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <label className="block text-sm font-medium mb-1 text-gray-700">Imagen</label>

          {preview ? (
            <div className="relative w-full h-40 rounded-md overflow-hidden border border-gray-300">
              <img
                src={preview}
                alt="Vista previa"
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={eliminarImagen}
                className="absolute top-2 right-2 bg-white text-red-600 text-xs px-2 py-1 rounded shadow hover:bg-red-100"
              >
                Quitar
              </button>
            </div>
          ) : (
            <label
              htmlFor="imagen"
              className={`flex items-center justify-center w-full h-40 px-4 transition bg-white border-2 ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-dashed'
              } border-gray-300 rounded-md cursor-pointer hover:border-blue-400 focus:outline-none`}
            >
              <div className="text-center">
                <svg
                  className="w-10 h-10 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5V19a2.5 2.5 0 002.5 2.5h13a2.5 2.5 0 002.5-2.5v-2.5M16.5 3.75l-4.5 4.5m0 0L7.5 3.75M12 8.25V15"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Seleccioná un archivo</span> o arrastralo aquí
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Solo JPG, PNG o WEBP. Máx 1MB.
                </p>
              </div>
              <input
                id="imagen"
                name="imagen"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleChange}
                className="sr-only"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="bg-[#008DD2] text-white px-4 py-2 rounded hover:bg-[#0070aa] disabled:opacity-50"
        >
          {cargando ? 'Enviando...' : 'Enviar'}
        </button>

        {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default TestimoniosForm;
