// ChatMap.jsx
import React from "react";
import useCont from "../../hooks/useCont";

const ChatMap = () => {
  const { contact,company } = useCont();

  if (!contact) return null;

  const iframeSrc = contact.map_iframe || "";
  const address =
    company?.address ||
    "Estamos aquí 👇"; // fallback por si no hay campo dirección

  if (!iframeSrc) {
    // Si no hay iframe configurado, muestro solo la dirección (si existe)
    return (
      <div className="chat-location" style={{ marginTop: 8, fontSize: 14 }}>
        <div style={{ marginBottom: 4 }}>📍 <strong>Ubicación:</strong></div>
        <div>{address}</div>
      </div>
    );
  }

  return (
    <div className="chat-location" style={{ marginTop: 8, fontSize: 14 }}>
      {/* Dirección */}
      <div style={{ marginBottom: 6 }}>
        📍 <strong>Ubicación:</strong>
        <br />
        {address}
      </div>

      {/* Contenedor del mapa */}
      <div
        style={{
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          width: "100%",
          maxWidth: 320,
          height: 200, // altura amigable para el chat
        }}
      >
        <iframe
          title="Ubicación"
          src={iframeSrc}
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
};

export default ChatMap;
