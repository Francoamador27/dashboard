import { useState, useEffect } from "react";
import ChatBot from "react-chatbotify";
import settings from "../../themes/chatbot/settings.json";
import styles from "../../themes/chatbot/styles.json";
import WhatsAppForm from "./WhatsappForm";
import ChatMap from "./ChatMap";
import ChatPhone from "./ChatPhone";
import clienteAxios from "../../config/axios"; // ajustá la ruta si hace falta

export const ChatBotReact = () => {
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1) Resolver el componente según la clave que viene del back
  const resolveComponent = (key) => {
    switch (key) {
      case "WhatsAppForm":
        return <WhatsAppForm />;
      case "ChatMap":
        return <ChatMap />;
      case "ChatPhone":
        return <ChatPhone />;
      default:
        return undefined;
    }
  };

  // 2) Armar la función path() a partir del snippet guardado (pathFunction)
  const buildPathFunction = (snippet) => {
    if (!snippet) return undefined;

    try {
      // Generamos una función que recibe params y ejecuta el snippet
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        "params",
        `${snippet}\nreturn "start";` // fallback por si nada matchea
      );
      return fn;
    } catch (e) {
      console.error("Error creando pathFunction:", e);
      return () => "start";
    }
  };

  // 3) Transformar el flow crudo del backend al formato de react-chatbotify
  const transformFlow = (rawFlow) => {
    const result = {};

    Object.entries(rawFlow || {}).forEach(([key, node]) => {
      const {
        message,
        options,
        component,
        pathFunction,
        chatDisabled,
      } = node;

      const flowNode = {
        message: message || "",
      };

      // componente (string -> JSX)
      if (component) {
        const comp = resolveComponent(component);
        if (comp) {
          flowNode.component = comp;
        }
      }

      // opciones
      if (Array.isArray(options) && options.length > 0) {
        flowNode.options = options;
      }

      // path
      const pathFn = buildPathFunction(pathFunction);
      if (pathFn) {
        flowNode.path = pathFn;
      }

      // fin de flujo
      if (chatDisabled) {
        flowNode.chatDisabled = true;
      }

      result[key] = flowNode;
    });

    return result;
  };

  // 4) Cargar el flow al montar el componente
  useEffect(() => {
    const fetchFlow = async () => {
      try {
        setLoading(true);

        // Backend singleton: GET /api/chatbot-flow
        const res = await clienteAxios.get("/api/chatbot-flow");

        // Suponiendo que el controlador devuelve { ..., flow: { ... } }
        const rawFlow = res.data.flow || {};

        const transformed = transformFlow(rawFlow);
        setFlow(transformed);
      } catch (error) {
        console.error("Error cargando flow del chatbot:", error);
        // Si querés, podrías setear un flow de fallback acá
        setFlow(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFlow();
  }, []);

  // 5) No mostrar nada hasta tener el flow listo
  if (loading || !flow) {
    return null; // o algún loader/spinner si querés
  }

  // Si querés seguir usando los estilos que tenías:
  const styles = {
    chatWindowStyle: {
      borderRadius: "10px"
    },
    headerStyle: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff"
    },
    chatButtonStyle: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }
  };

  return <ChatBot settings={settings} styles={styles} flow={flow} />;
};
