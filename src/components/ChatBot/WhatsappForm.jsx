import { useState, useRef, useEffect } from "react";
import WhatsappHref from "../../utils/WhatsappUrl";

// Simulo WhatsappHref por demostración
let  url = WhatsappHref 

export default function WhatsAppForm() {
  const [name, setName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  
  const disabled = !name.trim() || !userPhone.trim();
  const message = `Hola, soy ${name} y mi teléfono es ${userPhone}. Me gustaría recibir asesoramiento.`;
  const waLink = WhatsappHref({ message });

  // Prevenir propagación en todos los eventos del formulario
  const handleContainerInteraction = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Focus explícito para móviles
  const handleInputFocus = (inputRef) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Pequeño delay para asegurar que el input reciba el focus
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Scroll suave hacia el input en móviles
        inputRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  // Prevenir que el chatbot capture el input
  useEffect(() => {
    const inputs = [nameInputRef.current, phoneInputRef.current];
    
    const handleFocus = (e) => {
      e.stopPropagation();
    };

    inputs.forEach(input => {
      if (input) {
        input.addEventListener('focus', handleFocus, true);
        input.addEventListener('touchstart', handleFocus, true);
      }
    });

    return () => {
      inputs.forEach(input => {
        if (input) {
          input.removeEventListener('focus', handleFocus, true);
          input.removeEventListener('touchstart', handleFocus, true);
        }
      });
    };
  }, []);

  return (
    <div
      className="mt-2.5 whatsapp-form"
      onMouseDown={handleContainerInteraction}
      onTouchStart={handleContainerInteraction}
      onClick={handleContainerInteraction}
      style={{ 
        userSelect: 'text',
        WebkitUserSelect: 'text',
        touchAction: 'manipulation'
      }}
    >
      <div className="flex flex-col gap-2">
        {/* Campo Nombre */}
        <div 
          onMouseDown={handleInputFocus(nameInputRef)}
          onTouchStart={handleInputFocus(nameInputRef)}
          onClick={handleInputFocus(nameInputRef)}
        >
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{ 
              touchAction: 'manipulation',
              userSelect: 'text',
              WebkitUserSelect: 'text'
            }}
          />
        </div>

        {/* Campo Teléfono */}
        <div 
          onMouseDown={handleInputFocus(phoneInputRef)}
          onTouchStart={handleInputFocus(phoneInputRef)}
          onClick={handleInputFocus(phoneInputRef)}
        >
          <input
            ref={phoneInputRef}
            type="tel"
            placeholder="Tu teléfono"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{ 
              touchAction: 'manipulation',
              userSelect: 'text',
              WebkitUserSelect: 'text'
            }}
          />
        </div>
      </div>

      {/* Botón WhatsApp */}
      <a
        href={disabled ? undefined : waLink}
        target="_blank"
        rel="noreferrer"
        className={`
          mt-2 block text-center px-3 py-2.5 rounded-full text-sm font-semibold no-underline
          ${
            disabled
              ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-80"
              : "bg-[#25D366] text-white cursor-pointer hover:bg-[#20BD5A]"
          }
        `}
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) e.preventDefault();
        }}
        onTouchStart={(e) => e.stopPropagation()}
      >
        💬 Hablar por WhatsApp
      </a>

      {/* Demo para ver el componente funcionando */}
      {/* <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
        <p>Estado actual:</p>
        <p>Nombre: {name || '(vacío)'}</p>
        <p>Teléfono: {userPhone || '(vacío)'}</p>
      </div> */}
    </div>
  );
}