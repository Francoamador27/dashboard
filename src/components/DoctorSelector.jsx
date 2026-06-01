import React, { useEffect, useRef, useState } from "react";
import clienteAxios from "../config/axios";

export default function DoctorSelector({ value, onChange }) {
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    setQuery(value?.name || "");
  }, [value?.id, value?.name]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query || query.trim().length < 2) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("AUTH_TOKEN");
        const { data: json } = await clienteAxios.get("/api/doctores", {
          params: { busqueda: query.trim(), per_page: 15, direccion: "desc" },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        const arr = Array.isArray(json?.data) ? json.data : [];
        const items = arr.map((u) => {
          const id = u?.id ?? u?.user_id ?? u?.ID ?? null;
          const name = u?.name || [u?.first_name, u?.last_name].filter(Boolean).join(" ") || u?.username || "(Sin nombre)";
          const email = u?.email ?? "";
          return id ? { id, name, email } : null;
        }).filter(Boolean);
        setResults(items);
        setOpen(items.length > 0);
      } catch (e) {
        console.error("Error buscando doctores:", e);
        setResults([]); setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  return (
    <div ref={boxRef} style={{ position: "relative", display: "grid", gap: 6 }}>
      <label style={{ fontWeight: 600, color: "#374151" }}>diseño</label>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); if (!e.target.value.trim()) onChange?.(null); }}
        placeholder="Buscar diseño por nombre o especialidad"
        autoComplete="off"
        style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none" }}
        onFocus={() => results.length && setOpen(true)}
      />
      {open && (loading || results.length > 0) && (
        <div style={{
          position: "absolute", zIndex: 20, top: "100%", left: 0, right: 0,
          background: "#fff", border: "1px solid #d1d5db", borderTop: "none",
          borderBottomLeftRadius: 8, borderBottomRightRadius: 8, maxHeight: 220, overflowY: "auto"
        }}>
          {loading ? (
            <div style={{ padding: 10, color: "#6b7280" }}>Buscando…</div>
          ) : (
            <>
              {value && (
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange?.(null); setQuery(""); setOpen(false); }}
                  style={{ padding: 10, background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
                >
                  ✗ Limpiar selección
                </div>
              )}
              {results.map((u) => (
                <div
                  key={u.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange?.(u); setQuery(`${u.name}${u.email ? " · " + u.email : ""}`); setOpen(false); }}
                  style={{ padding: 10, cursor: "pointer", borderTop: "1px solid #f3f4f6" }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                  {u.email && <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{u.email}</div>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
      {value && (
        <div style={{ marginTop: 6, padding: "8px 12px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6, fontSize: 13, color: "#0c4a6e" }}>
          ✓ Seleccionado: <strong>{value.name}</strong>
        </div>
      )}
    </div>
  );
}
