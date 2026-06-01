import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Mail, Phone, MapPin } from "lucide-react";
import useCont from "../../hooks/useCont";
import { Link } from "react-router-dom";
import useSWR from "swr";
import clienteAxios from "../../config/axios";

const fetcher = (url) =>
  clienteAxios(url).then((res) => res.data.data ?? res.data);

export default function Footer() {
  const { company, contact, social, footer, settings } = useCont();
  const currentYear = new Date().getFullYear();

  const { data: certData } = useSWR("/api/certificados", fetcher, {
    revalidateOnFocus: false,
  });
  const certificados = Array.isArray(certData) ? certData : [];

  // No renderizar hasta que settings cargue para evitar layout shift
  if (!settings) {
    return (
      <footer className="relative border-t border-slate-200 min-h-[400px] bg-[#f8fafc]" />
    );
  }

  const footerStyle = {
    backgroundColor:
      footer.bg_type === "color" ? footer.bg_color : "transparent",
    backgroundImage:
      footer.bg_type === "image" && footer.bg_image
        ? `url(${footer.bg_image})`
        : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: footer.text_color,
  };

  return (
    <footer
      className="relative overflow-hidden border-t border-slate-200"
      style={footerStyle}
    >
      {/* Capa de overlay para imagen con escala de grises o brillo opcional */}
      {footer.bg_type === "image" && (
        <div
          className={`absolute inset-0 z-0 ${footer.greyscale ? "grayscale contrast-125 brightness-50" : "bg-black/40"}`}
        >
          <img
            src={footer.bg_image}
            alt=""
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Elementos decorativos de fondo (solo si no es imagen) */}
      {footer.bg_type === "color" && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#fdce27]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fdce27]/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      {/* Contenido principal */}
      <div className="relative z-10 px-6 py-20 mx-auto max-w-7xl">
        {/* Grid principal */}
        <div className="grid grid-cols-1 gap-12 mb-16 md:grid-cols-4">
          {/* Logo y breve descripción */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 group">
              <img
                src={footer.logo || company.logo}
                alt={`Logo ${company.name}`}
                className="object-contain w-auto h-12 transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Redes Sociales */}
            <div className="flex gap-4 pt-4">
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 hover:bg-[#fdce27] hover:text-[#1c1c1c] rounded-full transition-all duration-300 hover:scale-110 shadow-sm"
                  title="Facebook"
                  style={{ color: footer.text_color }}
                >
                  <FaFacebook className="text-lg" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 hover:bg-[#fdce27] hover:text-[#1c1c1c] rounded-full transition-all duration-300 hover:scale-110 shadow-sm"
                  title="Instagram"
                  style={{ color: footer.text_color }}
                >
                  <FaInstagram className="text-lg" />
                </a>
              )}
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-black tracking-widest mb-6 text-[#fdce27]">
              Menú
            </h3>
            <ul className="space-y-3">
              {["Inicio", "Servicios", "Equipos"].map((item, idx) => {
                const paths = ["/", "/servicios", "/maquinarias"];
                return (
                  <li key={idx}>
                    <Link
                      to={paths[idx]}
                      className="hover:text-[#fdce27] transition-colors text-sm font-medium opacity-70 hover:opacity-100"
                      style={{ color: footer.text_color }}
                    >
                      {item}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Otros Links */}
          <div>
            <h3 className="text-lg font-black tracking-widest mb-6 text-[#fdce27]">
              Empresa
            </h3>
            <ul className="space-y-3">
              {["Quiénes Somos", "Trabaja con Nosotros", "Brochure"].map(
                (item, idx) => {
                  const paths = [
                    "/quienes-somos",
                    "/trabaja-con-nosotros",
                    "/brochure",
                  ];
                  return (
                    <li key={idx}>
                      <Link
                        to={paths[idx]}
                        className="hover:text-[#fdce27] transition-colors text-sm font-medium opacity-70 hover:opacity-100"
                        style={{ color: footer.text_color }}
                      >
                        {item}
                      </Link>
                    </li>
                  );
                },
              )}
            </ul>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-lg font-black tracking-widest mb-6 text-[#fdce27]">
              Contacto
            </h3>
            <div className="space-y-4">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-start gap-3 hover:text-[#fdce27] transition-colors group opacity-70 hover:opacity-100"
                  style={{ color: footer.text_color }}
                >
                  <Mail
                    size={18}
                    className="flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm">{contact.email}</span>
                </a>
              )}

              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-start gap-3 hover:text-[#fdce27] transition-colors group opacity-70 hover:opacity-100"
                  style={{ color: footer.text_color }}
                >
                  <Phone
                    size={18}
                    className="flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm">{contact.phone}</span>
                </a>
              )}
              {company.address &&
                (() => {
                  const mapUrl = company.address
                    ? "https://www.google.com/maps/place/Anka+Loo+Construcciones/@-31.377188,-64.124414,17z/data=!4m6!3m5!1s0x9432a280e165d4c1:0xc5edd79764ccc652!8m2!3d-31.3760341!4d-64.124197!16s%2Fg%2F11b8v9jfg9?hl=es-419&entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D"
                    : null;
                  return mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 hover:text-[#fdce27] transition-colors group opacity-70 hover:opacity-100"
                      style={{ color: footer.text_color }}
                    >
                      <MapPin
                        size={18}
                        className="flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                      />
                      <span className="text-sm">{company.address}</span>
                    </a>
                  ) : (
                    <div
                      className="flex items-start gap-3 opacity-70"
                      style={{ color: footer.text_color }}
                    >
                      <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{company.address}</span>
                    </div>
                  );
                })()}
              <a
                href="https://ar.linkedin.com/company/ankaloo-construcciones"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-[#fdce27] transition-colors group opacity-70 hover:opacity-100"
                style={{ color: footer.text_color }}
              >
                <FaLinkedin
                  size={18}
                  className="flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                />
                <span className="text-sm">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sellos y certificados */}
        {(footer.logo1 || footer.logo2 || certificados.length > 0) && (
          <div className="flex flex-wrap items-end justify-between gap-8 mb-12">
            {/* Achilles — izquierda */}
            {(footer.logo1 || footer.logo2) && (
              <div className="flex flex-col gap-3">
                <span
                  className="text-xs font-semibold opacity-60"
                  style={{ color: footer.text_color }}
                >
                  Proveedor aprobado en:
                </span>
                <div className="flex items-center gap-4 flex-wrap">
                  {footer.logo1 && (
                    <img
                      src={footer.logo1}
                      alt="Logo Partner 1"
                      className="object-contain w-auto h-20 p-2 transition-all duration-500 bg-white shadow-2xl rounded-xl shadow-black/20"
                    />
                  )}
                  {footer.logo2 && (
                    <img
                      src={footer.logo2}
                      alt="Logo Partner 2"
                      className="object-contain w-auto h-20 p-2 transition-all duration-500 bg-white shadow-2xl rounded-xl shadow-black/20"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Certificados de calidad — derecha */}
            {certificados.length > 0 && (
              <div className="flex flex-col gap-3">
                <span
                  className="text-xs font-semibold opacity-60"
                  style={{ color: footer.text_color }}
                >
                  Calidad certificada:
                </span>
                <div className="flex items-center gap-4 flex-wrap">
                  {certificados.map((cert) =>
                    cert.imagen ? (
                      <a
                        key={cert.id}
                        href={cert.documento || cert.imagen}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Descargar certificado: ${cert.titulo}`}
                        className="transition-all duration-500 hover:scale-105"
                      >
                        <img
                          src={cert.imagen}
                          alt={cert.titulo}
                          className="object-contain w-auto h-20 p-2 bg-white shadow-2xl rounded-xl shadow-black/20"
                        />
                      </a>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Divisor */}
        <div className="h-px mb-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Copyright y derechos */}
        <div
          className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row opacity-60"
          style={{ color: footer.text_color }}
        >
          <div className="flex items-center gap-2">
            <p>
              © {currentYear}{" "}
              <span className="font-black" style={{ color: footer.text_color }}>
                Anka Loo Construcciones
              </span>{" "}
              — Todos los derechos reservados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium"></p>
          </div>
        </div>
      </div>

      {/* FloatingWhatsApp */}
      {/* <FloatingWhatsApp
                phoneNumber={contact.whatsapp || "+5493510000000"}
                accountName={company.name || "Anka Loo Construcciones"}
                avatar={logo_blanco}
                statusMessage="Construcción e Infraestructura"
                chatMessage="¡Hola! 👋 ¿En qué podemos ayudarte hoy?"
                placeholder="Escribe tu mensaje..."
                allowEsc
                allowClickAway
                notification
                notificationSound
                darkMode={true}
            /> */}
    </footer>
  );
}
