import React, { useMemo } from "react";
import { to12h, to24h } from "../utils/time";

/**
 * TimePicker de 12h con AM/PM.
 * Recibe y emite siempre "HH:mm" (24h) vía props.
 */
export default function TimePicker12({ value24 = "09:00", onChange }) {
  const pad = (n) => String(n).padStart(2, "0");
  const state = useMemo(() => to12h(value24), [value24]);

  const setPart = (patch) => {
    const next = { ...state, ...patch };
    const next24 = to24h(next);
    onChange?.(next24);
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {/* Hora (1..12) */}
      <select
        value={state.h12}
        onChange={(e) => setPart({ h12: parseInt(e.target.value, 10) || 12 })}
        style={inputStyle}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      {/* : */}
      <span style={{ fontWeight: 600, color: "#374151" }}>:</span>

      {/* Minutos */}
      <select
        value={pad(state.m)}
        onChange={(e) => setPart({ m: parseInt(e.target.value, 10) || 0 })}
        style={inputStyle}
      >
        {Array.from({ length: 60 }, (_, i) => i).map((m) => {
          const val = pad(m);
          return <option key={val} value={val}>{val}</option>;
        })}
      </select>

      {/* AM/PM */}
      <select
        value={state.meridiem}
        onChange={(e) => setPart({ meridiem: e.target.value })}
        style={inputStyle}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  background: "#fff",
  color: "#111827",
  outline: "none",
};
