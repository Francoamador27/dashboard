import React, { useEffect, useMemo, useState } from "react";
import clienteAxios from "../../config/axios";
import {
  dateToYmd,
  dateToTime24Local,
  buildLocalDateFrom,
  diffMinutes,
  clampDuration15,
  buildUTCDateFrom,
} from "../../utils/time";
import DoctorSelector from "../../components/DoctorSelector";
import TimePicker12 from "../../components/TimePicker12";
import NotificacionWhatsapp from "../../components/NotificacionWhatsapp/NotificacionWhatsapp";
import { Link } from "react-router-dom";

/**
 * UI en LOCAL con AM/PM.
 * Envía al backend ISO UTC con Z (toISOString()).
 */
export default function ModalShowEvent({ selected, closeModal, handleDelete, onSaved }) {
  if (!selected) return null;

  const xp = selected.extendedProps || {};
  console.log('selected', xp.chec);
  const displayColor =
    selected.backgroundColor || selected.borderColor || selected.textColor || xp.color || "#0ea5e9";

  // ------ estado editable (LOCAL + 12h) ------
  const [date, setDate] = useState("");        // "YYYY-MM-DD" (LOCAL)
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [time24, setTime24] = useState("09:00"); // "HH:mm" (LOCAL, puente para AM/PM)
  const [duration, setDuration] = useState("60");
  const [datos, setDatos] = useState(); // minutos
  const [amount, setAmount] = useState(xp.monto ?? xp.amount ?? "");
  const [isPaid, setIsPaid] = useState(Boolean(xp.chec ?? xp.chec ?? false));
  const initialDoctor = useMemo(() => {
    const name = [xp.doctor_name, xp.doctor_lastname].filter(Boolean).join(" ").trim();
    return xp.doctorId ? { id: xp.doctorId, name: name || xp.doctorName || "diseño" } : null;
  }, [xp.doctorId, xp.doctor_name, xp.doctor_lastname, xp.doctorName]);
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctor);
  function formatLikeToStringUTC(input) {
    const d = input instanceof Date ? input : new Date(input);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const pad = (n) => String(n).padStart(2, '0');

    return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${pad(d.getUTCDate())} ${d.getUTCFullYear()} ` +
      `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  }
  // Inicialización: tomamos start/end y los mostramos en LOCAL + AM/PM
  useEffect(() => {
    if (!selected?.start || !selected?.end) return;
    setDatos(xp);
    const start = xp?.raw?.start ? new Date(xp.raw.start) : new Date(selected.start);
    const end = xp?.raw?.end ? new Date(xp.raw.end) : new Date(selected.end);
    const d = new Date(xp?.raw?.start);
    let fechaStart = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'UTC',
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false
    }).format(d);

    console.log(fechaStart); //22/8/25, 23:00
    let dia = fechaStart.split(' ')[0];
    dia = dia.replace(',', '');

    let hora = fechaStart.split(' ')[1];

    setHora(hora);
    console.log('hora', hora);
    setDia(dia);
    setDate(dateToYmd(start));                    // LOCAL
    setTime24(hora);          // LOCAL -> TimePicker 12h
    setDuration(String(diffMinutes(start, end)));
    setAmount(xp.monto ?? xp.amount ?? "");
    setIsPaid(Boolean(xp.chec ?? xp.chec ?? false));
    setSelectedDoctor(initialDoctor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  // Payload: construir Date LOCAL desde date + time24, luego enviar ISO UTC
  const currentPayload = useMemo(() => {
    if (!date || !time24 || !duration) return null;
    console.log('date', date);
    console.log('time24', time24);
    const startLocal = buildUTCDateFrom(date, time24);        // LOCAL
    const endLocal = new Date(startLocal.getTime() + (parseInt(duration, 10) || 0) * 60000);
    return {
      id: selected.id,
      title: selected.title,
      startISO: startLocal.toISOString(), //
      endISO: endLocal.toISOString(),
      amount: Number(amount || 0),
      isPaid,
      doctorId: selectedDoctor?.id ?? null,
      doctorName: selectedDoctor?.name ?? null,
    };
  }, [date, time24, duration, amount, isPaid, selected?.id, selected?.title, selectedDoctor]);

  const handleSave = async () => {
    if (!currentPayload) return;
    if (!date || !time24) return alert("Completá fecha y hora");
    const dur = parseInt(duration, 10);
    if (!dur || dur < 15) return alert("La duración mínima es 15 minutos");
    if (!amount || Number(amount) <= 0) return alert("Ingresá un monto válido");
    if (!selectedDoctor?.id) return alert("Seleccioná un diseño");

    try {
      const token = localStorage.getItem("AUTH_TOKEN");
      await clienteAxios.put(
        `/api/events/${selected.id}`,
        {
          title: selected.title,
          start: currentPayload.startISO, // ISO UTC "....Z"
          end: currentPayload.endISO,
          amount: currentPayload.amount,
          isPaid: currentPayload.isPaid,
          doctorId: currentPayload.doctorId,
          doctorName: currentPayload.doctorName,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      onSaved?.();
      closeModal();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "No se pudo guardar los cambios");
    }
  };

  const stop = (e) => e.stopPropagation();
console.log('datos', datos);
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50
      }}
    >

      <div onClick={stop} style={{
        background: "#fff", width: "100%", maxWidth: 650, maxHeight: "90vh",
        borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden", display: "flex", flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span aria-hidden="true" style={{
              display: "inline-block", width: 14, height: 14, borderRadius: "50%",
              background: displayColor, boxShadow: `0 0 0 2px ${displayColor}20`
            }} />
            <h3 style={{ margin: 0, color: "#111827", fontSize: 18, fontWeight: 600 }}>
              {selected.title || "Sin título"}
            </h3>
          </div>
          <button onClick={closeModal} aria-label="Cerrar" style={{
            border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer",
            width: 32, height: 32, borderRadius: "50%", color: "#6b7280"
          }}>×</button>
        </div>

        {/* Body */}

        {/* DATOS DEL usuario */}

        <div style={{ padding: "20px 24px", display: "grid", gap: 16, overflowY: "auto", maxHeight: "calc(90vh - 160px)" }}>
          {/* Fecha / Hora (LOCAL con AM/PM) */}
          <section>
            <h4 style={{ color: "#374151", fontSize: 16, fontWeight: 600, padding: "12px 24px" }}>Datos del usuario</h4>
            <div style={{ padding: "0 24px 12px", color: "#6b7280", fontSize: 14 }}>
              <div><strong>Nombre:</strong> {datos?.patient_name || "—"} {datos?.patient_lastname || "—"}</div>
              <NotificacionWhatsapp datos={datos} date={date} hora={hora} />
              <div>
                <strong>Email:</strong>{" "}
                {datos?.patient_email ? (
                  <a href={`mailto:${datos.patient_email}`} style={{ color: "#0ea5e9", textDecoration: "underline" }}>
                    {datos.patient_email}
                  </a>
                ) : "—"}
              </div>
            </div>
          </section>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <strong style={{ color: "#374151", fontSize: 14 }}>Fecha</strong>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <strong style={{ color: "#374151", fontSize: 14 }}>Hora</strong>
              {/* TimePicker 12h */}
              <TimePicker12 value24={time24} onChange={setTime24} />
            </label>
          </div>

          {/* Duración */}
          <label style={{ display: "grid", gap: 6 }}>
            <strong style={{ color: "#374151", fontSize: 14 }}>Duración (min)</strong>
            <input
              type="number"
              min="15"
              max="480"
              step="15"
              value={duration}
              onChange={(e) => setDuration(String(e.target.value))}
              onBlur={() => setDuration(String(clampDuration15(duration)))}
              style={inputStyle}
            />
          </label>

          {/* Monto */}
          <label style={{ display: "grid", gap: 6 }}>
            <strong style={{ color: "#374151", fontSize: 14 }}>Monto</strong>
            <input
              type="number"
              min="0"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
            />
          </label>

          {/* Pago */}
<div className="grid gap-2">
  <strong className="text-sm text-gray-700">Estado del pago</strong>

  <label className="inline-flex items-center gap-3 cursor-pointer select-none">
    {/* Toggle */}
    <input
      type="checkbox"
      checked={isPaid}
      onChange={(e) => setIsPaid(e.target.checked)}
      className="peer sr-only"
      aria-label="Estado del pago"
    />
    <span
      className="
        relative h-6 w-12 rounded-full
        bg-gray-300 transition-colors
        peer-checked:bg-[#008DD2]
        peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#008DD2]
      "
    >
      <span
        className="
          absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow
          transition-all duration-300
          peer-checked:translate-x-6
        "
      />
    </span>

    {/* Etiqueta dinámica */}
    <span className="text-sm text-gray-700">
      {isPaid ? "Pagado" : "Pendiente"}
    </span>
  </label>
</div>


          {/* diseño */}
          <DoctorSelector value={selectedDoctor} onChange={setSelectedDoctor} />

        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 12, justifyContent: "space-between" }}>
          <button onClick={handleDelete} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff" }}>
            🗑 Eliminar
          </button>
          <div style={{ display: "flex", gap: 10 }}>
              <Link to={`/admin-dash/usuarios/historial/${datos?.patientId || ""}`} style={{ textDecoration: "none" }}>
                <button style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#6b7280", color: "#fff" }}>
                  📋Historial usuario
                </button>
              </Link>

            <button onClick={handleSave} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#0ea5e9", color: "#fff" }}>
              💾 Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px 14px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  background: "#fff",
  color: "#111827",
  outline: "none",
};
