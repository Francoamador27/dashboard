import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import useCont from "../../hooks/useCont";
import {
  Menu,
  X,
  Phone,
  User,
  ShoppingCart,
  ChevronDown,
  Briefcase,
} from "lucide-react";

export default function Header() {
  const { company } = useCont();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  // States for Auth (kept commented out as in original)
  /*
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = UseAuth({ middleware: 'guest' });
  */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const leftNav = [
    { label: "Inicio", href: "/" },
    { label: "Servicios", href: "/servicios" },
    { label: "Equipos", href: "/maquinarias" },
    // { label: "Calidad", href: "/calidad" },
  ];

  const rightNav = [
    // { label: "Sede", href: "/sede" },
    { label: "Quiénes Somos", href: "/quienes-somos" },

    //i { label: "Blog", href: "/blog" },
    { label: "Contacto", href: "/contacto" },
    { label: "Trabaja con Nosotros", href: "/trabaja-con-nosotros" },
  ];

  // Determinar si usar estilo claro (para home sin scroll) u oscuro (para home con scroll o cualquier otra página)
  const useDarkStyle = !isHome || scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          useDarkStyle
            ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200"
            : "bg-white/10 backdrop-blur-md border-b border-white/20"
        }`}
      >
        <nav className="px-6 mx-auto max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* LOGO A LA IZQUIERDA */}
            <Link to="/" className="relative flex items-center gap-3 group">
              {/* Glow effect */}
              <div className="absolute -inset-3 bg-[#fdce27]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

              {/* Logo */}
              <img
                src={company.logo}
                alt="Anka Loo"
                width={120}
                height={48}
                className="relative z-10 object-contain w-auto h-10 transition-transform duration-500 md:h-12 group-hover:scale-105"
              />
            </Link>

            {/* NAVEGACION (Desktop) */}
            <ul className="items-center hidden gap-1 lg:flex">
              {[...leftNav, ...rightNav].map((item, i) => (
                <li key={i}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => `
                      relative px-5 py-2 text-[14px] font-bold tracking-tight  transition-all duration-300
                      ${
                        useDarkStyle
                          ? isActive
                            ? "text-[#1c1c1c] border-b-2 border-[#fdce27]"
                            : "text-slate-700 hover:text-[#1c1c1c]"
                          : isActive
                            ? "text-[#fdce27]"
                            : "text-white/90 hover:text-[#fdce27]"
                      }
                      group
                    `}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#fdce27] transition-all duration-300 group-hover:w-3/4 ${({ isActive }) => (isActive ? "w-3/4" : "")}`}
                    ></span>
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className={`lg:hidden p-2 rounded-xl transition-all duration-300 ${
                useDarkStyle
                  ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            mobileMenuOpen
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-4 invisible"
          }`}
        >
          <div className="relative p-6 mx-4 mt-3 overflow-hidden border shadow-2xl rounded-3xl border-white/10">
            <div className={`absolute inset-0 bg-white`}></div>

            <ul className="relative space-y-2">
              {[...leftNav, ...rightNav].map((item, i) => (
                <li key={i}>
                  <NavLink
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center px-6 py-4 rounded-2xl text-base font-bold tracking-tight transition-all
                      ${
                        isActive
                          ? "bg-[#fdce27]/15 text-[#1c1c1c] border-l-4 border-[#fdce27] translate-x-2"
                          : "text-slate-700 hover:bg-[#fdce27]/10"
                      }
                    `}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Auth / User Dropdown (Commented out sections from original) */}
      {/* 
      <div className="items-center hidden space-x-4 lg:flex">
          {!user ? (
            <>
              <Link to="/auth/login">Iniciar sesión</Link>
              <Link to="/registro">Probar Gratis</Link>
            </>
          ) : (
            <UserDropdown />
          )}
      </div>
      */}

      <style>{`
        .active-link-indicator {
          width: 75% !important;
        }
      `}</style>
    </>
  );
}
