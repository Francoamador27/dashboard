import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import clienteAxios from "../../../config/axios";
import { mostrarExito } from "../../../utils/Alertas";

const Patologias = () => {
  const { id } = useParams(); // Obtiene el ID del usuario desde la URL
  const [formData, setFormData] = useState({
    alergico: "",
    medicamentos: "",
    recomendaciones: "",
    idpa: id,
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem("AUTH_TOKEN");

  // Cargar datos existentes cuando el componente se monta
  useEffect(() => {
    const fetchPatologia = async () => {
      try {
        setLoading(true);
        const response = await clienteAxios.get(
          `/api/patologias/usuario/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (response.data.success && response.data.data) {
          // Si hay datos, precargarlos en el formulario
          setFormData({
            alergico: response.data.data.alergico || "",
            medicamentos: response.data.data.medicamentos || "",
            recomendaciones: response.data.data.recomendaciones || "",
            idpa: id,
          });
          setIsEditing(true); // Indicar que estamos en modo edición
        }
      } catch (error) {
        console.error("Error al cargar patologías:", error);
        // Si no hay datos, dejamos el formulario vacío
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatologia();
    }
  }, [id, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await clienteAxios.post(
        "/api/patologias",
        formData,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.data.success) {
        mostrarExito('Se actualizaron sus patologias con exito')
        setIsEditing(true); // Después de guardar, cambiamos a modo edición
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar las patologías");
    }
  };

  // Mostrar loading mientras carga los datos
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-slate-700 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto text-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-blue-700">
          Patologías del usuario
        </h2>
        {isEditing && (
          <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            ✓ Datos cargados
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 border border-slate-200 space-y-5"
      >
        {/* ID usuario */}
        <div className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">ID del usuario:</span>{" "}
          {id}
        </div>

        {/* Alergias */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            ¿Es alérgico a alguna droga?
          </label>
          <textarea
            name="alergico"
            value={formData.alergico}
            onChange={handleChange}
            placeholder="Ej: Penicilina, ibuprofeno..."
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Medicamentos */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            ¿Qué medicamentos consume habitualmente?
          </label>
          <textarea
            name="medicamentos"
            value={formData.medicamentos}
            onChange={handleChange}
            placeholder="Ej: Losartán, Metformina..."
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Enfermedades o recomendaciones */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            ¿Presenta alguna enfermedad o recomendación de su médico que quiera
            dejar constancia?
          </label>
          <textarea
            name="recomendaciones"
            value={formData.recomendaciones}
            onChange={handleChange}
            placeholder="Ej: Hipertensión controlada, reposo sugerido, etc."
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Botón */}
        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            {isEditing ? "Actualizar Patologías" : "Guardar Patologías"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Patologias;