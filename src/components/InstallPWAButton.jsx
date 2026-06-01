// src/components/InstallPWAButton.jsx
import { useEffect, useState } from "react";
import useCont from "../hooks/useCont";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const {company} = useCont();
  useEffect(() => {
    const handler = (e) => {
      // Evita que Chrome muestre su mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // muestra el popup nativo

    const { outcome } = await deferredPrompt.userChoice;
    console.log("User install choice:", outcome);

    // Limpio el prompt para no reutilizarlo
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="
        fixed z-50 bottom-20 right-4
        bg-[#003366] hover:bg-blue-800
        text-white text-sm font-semibold
        px-4 py-2 rounded-full shadow-lg transition-all
      "
    >
      {`📲 Instalar aplicación ${company.name}`}
    </button>
  );
}
