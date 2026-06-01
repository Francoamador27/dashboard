import React, { useState } from "react";
import useCont from "../../hooks/useCont";

const ChatPhone = () => {
  const { contact, company } = useCont();
  const [name, setName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  if (!contact || !contact.phone) return null;

  const disabled = !name.trim() || !userPhone.trim();
  const targetPhone = contact.phone; // número al que se va a llamar

  const handleCall = () => {
    if (disabled) return;
    // Acá podrías guardar el lead en una API antes de llamar
    // TODO: enviar { name, userPhone } a tu backend si querés

    // Disparar la llamada
    window.location.href = `tel:${targetPhone}`;
  };

  return (
    <div style={{ marginTop: 8, fontSize: 14 }}>
      <div style={{ marginBottom: 6 }}>
        📞 <strong>Llamar por teléfono</strong>
        <br />
        Número de {company?.name || "la empresa"}:{" "}
        <a href={`tel:${targetPhone}`} style={{ fontWeight: 600 }}>
          {targetPhone}
        </a>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 6,
        }}
      >
        <input
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: 14,
          }}
        />

        <input
          type="tel"
          placeholder="Tu teléfono"
          value={userPhone}
          onChange={(e) => setUserPhone(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: 14,
          }}
        />

        <button
          onClick={handleCall}
          disabled={disabled}
          style={{
            marginTop: 4,
            padding: "8px 12px",
            borderRadius: 999,
            border: "none",
            background: disabled ? "#ccc" : "#16a34a",
            color: "#fff",
            fontWeight: 600,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          📲 Llamar ahora
        </button>
      </div>
    </div>
  );
};

export default ChatPhone;
