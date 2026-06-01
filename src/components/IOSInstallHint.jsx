import { useEffect, useState } from "react";
import useCont from "../hooks/useCont";
function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
}

export function IOSInstallHint() {
  let {company} = useCont ();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isIOS() && !isInStandaloneMode()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 shadow-lg rounded-xl p-3 text-sm">
      📲 Para instalar <strong>{company.name}</strong> en tu iPhone:
      <br />
      1. Tocá el botón <strong>Compartir</strong> de Safari. <br />
      2. Elegí <strong>“Agregar a pantalla de inicio”</strong>.
    </div>
  );
}
