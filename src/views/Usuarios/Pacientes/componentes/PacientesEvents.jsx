import { useEffect, useMemo, useState } from "react";
import clienteAxios from "../../../../config/axios";
import { getAuthHeaders } from "../../../../utils/AuthHelper";
import { useParams, Link } from "react-router-dom";
import { mostrarConfirmacion } from "../../../../utils/Alertas";

const PacientesEvents = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const { id } = useParams();
  const idpa = useMemo(() => id, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await clienteAxios.get(`/api/events?patient_id=${idpa}`, getAuthHeaders());
      console.log('eventos del usuario', data.data);
      setItems(Array.isArray(data?.data) ? data.data : []);
      setErr("");
    } catch (e) {
      setErr("No se pudo cargar las citas del usuario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [idpa]);

  const handleDelete = async (eventId) => {
    const ok = await mostrarConfirmacion(
      "¿Estás seguro que deseas eliminar esta cita?",
      "Esta acción eliminará la cita de forma permanente."
    );
    if (!ok) return;

    const prev = items;
    setItems((cur) => cur.filter((x) => x.id !== eventId));

    try {
      await clienteAxios.delete(`/api/events/${eventId}`, getAuthHeaders());
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar la cita.");
      setItems(prev);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-AR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusBadge = (state, isPaid) => {
    if (state === 1 && isPaid) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">✓ Confirmada y Pagada</span>;
    }
    if (state === 1) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">📅 Confirmada</span>;
    }
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">⏳ Pendiente</span>;
  };

  const getPaymentStatus = (isPaid, monto) => {
    if (isPaid) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Pagado</span>;
    }
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">❌ Pendiente - ${parseFloat(monto).toLocaleString('es-AR')}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Citas Médicas</h3>
          <p className="text-sm text-gray-600 mt-1">Historial completo de citas del usuario</p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          {items.length} cita{items.length !== 1 ? 's' : ''} registrada{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando citas...</span>
        </div>
      ) : err ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 font-medium">Error al cargar</p>
          <p className="text-red-500 text-sm mt-1">{err}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-gray-600 font-medium">Sin citas registradas</p>
          <p className="text-gray-500 text-sm mt-1">No hay citas programadas para este usuario.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {items.map((cita) => {
            const startDate = formatDateTime(cita.start);
            const endDate = formatDateTime(cita.end);
            
            return (
              <div 
                key={cita.id} 
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                style={{ borderLeftColor: cita.color, borderLeftWidth: '4px' }}
              >
                {/* Header con acciones */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-gray-900">{cita.title}</h4>
                      <span className="text-sm text-gray-500">ID: #{cita.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/admin-dash/citas/${cita.id}`}
                        className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(cita.id)}
                        className="inline-flex items-center px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                        title="Eliminar cita"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Estado y Pago */}
                  <div className="flex items-center gap-3 mb-6">
                    {getStatusBadge(cita.state, cita.isPaid)}
                    {getPaymentStatus(cita.isPaid, cita.monto)}
                  </div>

                  {/* Información de la Cita */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Fecha y Hora */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-gray-700  tracking-wide">📅 Fecha y Hora</h5>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Inicio:</p>
                          <p className="font-medium text-gray-900">{startDate.date}</p>
                          <p className="text-lg font-bold text-blue-600">{startDate.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fin:</p>
                          <p className="font-medium text-gray-900">{endDate.time}</p>
                        </div>
                      </div>
                    </div>

                    {/* Información del diseño */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-gray-700  tracking-wide">👨‍⚕️ diseño</h5>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">
                          {cita.doctor_name} {cita.doctor_lastname}
                        </p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            📧 <span>{cita.doctor_email}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            📱 <span>{cita.doctor_phone}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            🆔 <span>DNI: {cita.doctor_dni}</span>
                          </p>
                        </div>
                      </div>
                    </div>
{/* 
                    {/* Información del usuario */}
                    {/* <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-gray-700  tracking-wide">👤 usuario</h5>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">
                          {cita.patient_name} {cita.patient_lastname}
                        </p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            📧 <span>{cita.patient_email}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            📱 <span>{cita.patient_phone}</span>
                          </p>
                        </div>
                      </div>
                    </div>  */}
                  </div>

                  {/* Detalles Financieros */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-gray-700  tracking-wide mb-3">💰 Información Financiera</h5>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Monto</p>
                        <p className="text-xl font-bold text-green-600">${parseFloat(cita.monto).toLocaleString('es-AR')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estado de Pago</p>
                        <p className={`font-medium ${cita.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                          {cita.isPaid ? 'Pagado' : 'Pendiente'}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* IDs Técnicos */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <span>ID usuario: {cita.idpa}</span>
                      <span>ID ODC: {cita.idodc}</span>
                      <span>Color: <span className="inline-block w-3 h-3 rounded-full ml-1" style={{ backgroundColor: cita.color }}></span> {cita.color}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PacientesEvents;