import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { mostrarError, pedirValor } from "../utils/Alertas";
import clienteAxios from "../config/axios";

// =========================================================
// CONFIG DE COMPONENTES DISPONIBLES
// =========================================================
const AVAILABLE_COMPONENTS = [
  { key: "", label: "Sin componente" },
  { key: "ChatMap", label: "Ubicación (mapa)" },
  { key: "ChatPhone", label: "Llamada telefónica" },
  { key: "WhatsAppForm", label: "WhatsApp" },
];

const COMPONENT_LABEL_MAP = AVAILABLE_COMPONENTS.reduce((acc, c) => {
  acc[c.key] = c.label;
  return acc;
}, {});

// NODO INICIAL POR DEFECTO
const DEFAULT_START_NODE = {
  id: "start",
  type: "step",
  position: { x: 50, y: 50 },
  data: {
    label: "start",
    config: {
      message: "¡Hola! 👋 Bienvenido. ¿En qué puedo ayudarte?",
      options: ["Opción 1", "Opción 2", "Opción 3"],
      chatDisabled: false,
      componentKey: "", // sin componente por defecto
    },
  },
};

// =========================================================
// CUSTOM NODE (StepNode)
// =========================================================
function StepNode({ data }) {
  const componentKey = data.config?.componentKey || "";

  return (
    <div className="bg-white shadow-lg rounded-lg p-3 border-2 border-purple-300 w-64 relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500"
      />

      {/* Título */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm text-purple-900">{data.label}</h3>
        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
          {data.config?.chatDisabled ? "🔒 Final" : "💬"}
        </span>
      </div>

      {/* Si tiene componente, badge */}
      {componentKey && (
        <div className="mb-2">
          <span className="inline-flex items-center text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            🧩 {COMPONENT_LABEL_MAP[componentKey] || componentKey}
          </span>
        </div>
      )}

      {/* Mensaje */}
      {data.config?.message && (
        <p className="text-xs text-gray-600 whitespace-pre-line mb-3 line-clamp-4 bg-gray-50 p-2 rounded">
          {data.config.message}
        </p>
      )}

      {/* Opciones con handles individuales */}
      {data.config?.options && data.config.options.length > 0 && (
        <>
          <div className="text-xs font-semibold mb-2 text-gray-700 border-t pt-2">
            Opciones disponibles:
          </div>
          <ul className="space-y-2">
            {data.config.options.map((opt, i) => (
              <li
                key={i}
                className="relative bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded border border-purple-200 pr-6"
              >
                <span className="text-xs font-medium text-gray-800 block truncate">
                  {opt}
                </span>
                {/* Handle único por cada opción - posicionado relativo al li */}
                <Handle
                  type="source"
                  id={`option-${i}`}
                  position={Position.Right}
                  className="w-3 h-3 bg-pink-500"
                  style={{
                    top: "50%",
                    right: "-6px",
                    transform: "translateY(-50%)",
                  }}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Si no hay opciones, es un nodo final o de continuación */}
      {(!data.config?.options || data.config.options.length === 0) && (
        <div className="text-xs text-gray-500 italic text-center py-2 bg-gray-100 rounded">
          {data.config?.chatDisabled ? "Fin del flujo" : "Sin opciones"}
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  step: StepNode,
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
export default function AdminChatbot() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null); // conexión seleccionada
  const [nodeConfig, setNodeConfig] = useState({
    message: "",
    options: [""],
    chatDisabled: false,
    componentKey: "",
  });
  const [loading, setLoading] = useState(true);

  // ===========================
  // CARGAR BUILDER_STATE DEL BACKEND
  // ===========================
  useEffect(() => {
    const fetchBuilderState = async () => {
      try {
        const res = await clienteAxios.get("/api/chatbot-flow");
        const data = res.data;

        if (data?.builder_state) {
          const { nodes: savedNodes, edges: savedEdges } = data.builder_state;

          if (Array.isArray(savedNodes) && savedNodes.length > 0) {
            setNodes(savedNodes);
          } else {
            setNodes([DEFAULT_START_NODE]);
          }

          if (Array.isArray(savedEdges)) {
            setEdges(savedEdges);
          } else {
            setEdges([]);
          }
        } else {
          // No hay builder_state guardado → usamos el nodo start por defecto
          setNodes([DEFAULT_START_NODE]);
          setEdges([]);
        }
      } catch (error) {
        console.error("Error cargando builder_state:", error);
        // fallback de seguridad
        setNodes([DEFAULT_START_NODE]);
        setEdges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilderState();
  }, [setNodes, setEdges]);

  // ===========================
  // HANDLERS DE REACT FLOW
  // ===========================

  // Cuando se conecta una opción a otro nodo
  const onConnect = useCallback(
    (connection) => {
      console.log("Conexión creada:", connection);

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#9333ea", strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Click en un nodo
  const onNodeClick = (evt, node) => {
    setSelectedNode(node.id);
    setSelectedEdge(null); // si selecciono nodo, deselecciono conexión
    const config = node.data.config || {};
    setNodeConfig({
      message: config.message || "",
      options: config.options || [""],
      chatDisabled: config.chatDisabled || false,
      componentKey: config.componentKey || "",
    });
  };

  // Click en una conexión (edge)
  const onEdgeClick = (evt, edge) => {
    evt.stopPropagation();
    setSelectedEdge(edge);
    setSelectedNode(null); // si selecciono edge, deselecciono nodo
  };

  // Agregar nuevo nodo
  const addNode = async () => {
    const input = await pedirValor(
      "Nombre del nuevo nodo (ej: 'precios', 'contacto') debe ser sin espacios ni caracteres especiales:",
      "Nombre único"
    );

    if (!input) {
      mostrarError("Cancelado o nombre vacío");
      return;
    }

    // Normalizar: sin acentos, sin espacios ni caracteres especiales, en minúsculas
    const id = input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (!id) {
      mostrarError(
        "El nombre debe contener solo letras y números (sin espacios ni caracteres especiales)"
      );
      return;
    }

    if (nodes.some((n) => n.id === id)) {
      mostrarError("Ya existe un nodo con ese nombre, elegí otro");
      return;
    }

    const newNode = {
      id,
      type: "step",
      position: {
        x: Math.random() * 300 + 200,
        y: Math.random() * 300 + 200,
      },
      data: {
        label: id,
        config: {
          message: "Escribe tu mensaje aquí...",
          options: ["Opción 1"], // viene con una, pero se puede borrar
          chatDisabled: false,
          componentKey: "",
        },
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(id);
    setSelectedEdge(null);
    setNodeConfig({
      message: "Escribe tu mensaje aquí...",
      options: ["Opción 1"],
      chatDisabled: false,
      componentKey: "",
    });
  };

  // Guardar configuración del nodo (en memoria del builder)
  const saveNodeConfig = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode
          ? {
              ...n,
              data: {
                ...n.data,
                config: {
                  message: nodeConfig.message,
                  options: nodeConfig.options.filter(
                    (opt) => opt.trim() !== ""
                  ),
                  chatDisabled: nodeConfig.chatDisabled,
                  componentKey: nodeConfig.componentKey || "",
                },
              },
            }
          : n
      )
    );
    alert("✅ Configuración guardada");
  };

  // Agregar opción
  const addOption = () => {
    setNodeConfig({
      ...nodeConfig,
      options: [...nodeConfig.options, ""],
    });
  };

  // Actualizar opción
  const updateOption = (index, value) => {
    const newOptions = [...nodeConfig.options];
    newOptions[index] = value;
    setNodeConfig({ ...nodeConfig, options: newOptions });
  };

  // Eliminar opción (puede quedar en 0)
  const removeOption = (index) => {
    setNodeConfig({
      ...nodeConfig,
      options: nodeConfig.options.filter((_, i) => i !== index),
    });
  };

  // Eliminar nodo
  const deleteNode = () => {
    if (!selectedNode || selectedNode === "start") {
      alert("No puedes eliminar el nodo inicial");
      return;
    }

    const confirmDelete = window.confirm(
      `¿Eliminar el nodo "${selectedNode}"?`
    );
    if (!confirmDelete) return;

    setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNode && e.target !== selectedNode
      )
    );
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // Eliminar conexión seleccionada
  const deleteSelectedEdge = () => {
    if (!selectedEdge) {
      mostrarError("No hay ninguna conexión seleccionada");
      return;
    }

    const confirmDelete = window.confirm(
      `¿Eliminar la conexión de "${selectedEdge.source}" a "${selectedEdge.target}"?`
    );
    if (!confirmDelete) return;

    setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
    setSelectedEdge(null);
  };

  // ===========================
  // EXPORTAR/GUARDAR FLOW + BUILDER_STATE EN BACKEND
  // ===========================
  const exportFlow = async () => {
    // 1) Construimos el objeto `flow` (para el chatbot)
    const flow = {};

    nodes.forEach((node) => {
      const config = node.data?.config || {};

      const nodeData = {
        message: config.message || "",
      };

      // Opciones
      if (config.options && config.options.length > 0) {
        nodeData.options = config.options;
      }

      // Componente asociado (por key)
      if (config.componentKey) {
        nodeData.component = config.componentKey; // ej: "ChatMap"
      }

      // Conexiones → pathFunction
      if (config.options && config.options.length > 0) {
        const connections = edges.filter((e) => e.source === node.id);

        if (connections.length > 0) {
          const pathMappings = connections.map((conn) => {
            const optionIndex = parseInt(
              conn.sourceHandle?.split("-")[1] || "0",
              10
            );
            const optionText = config.options[optionIndex];
            const targetNode = conn.target;

            return { optionText, targetNode, optionIndex };
          });

          nodeData.pathFunction = pathMappings
            .map(
              (pm) =>
                `if (params.userInput === "${pm.optionText}") return "${pm.targetNode}";`
            )
            .join("\n      ");
        }
      }

      if (config.chatDisabled) {
        nodeData.chatDisabled = true;
      }

      flow[node.id] = nodeData;
    });

    // 2) Estado del builder (para ReactFlow en el admin)
    const builder_state = {
      nodes,
      edges,
    };

    try {
      // Guardamos flow y builder_state en paralelo
      await Promise.all([
        clienteAxios.put("/api/chatbot-flow/flow", { flow }),
        clienteAxios.put("/api/chatbot-flow/builder-state", { builder_state }),
      ]);

      alert("✅ Flow y estado del builder guardados en el servidor");
    } catch (error) {
      console.error(error);
      mostrarError("No se pudo guardar el flow. Intentá de nuevo.");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Cargando editor de chatbot...
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex">
      {/* CANVAS */}
      <div className="flex-1 h-full border-r bg-gradient-to-br from-purple-50 to-pink-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          fitView
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: "#9333ea", strokeWidth: 2 },
          }}
        >
          <MiniMap
            nodeColor={(node) => {
              if (node.data.config?.chatDisabled) return "#ef4444";
              return "#9333ea";
            }}
          />
          <Controls />
          <Background color="#e9d5ff" gap={16} />
        </ReactFlow>
      </div>

      {/* PANEL DERECHO */}
      <div className="w-96 p-4 bg-white overflow-auto border-l-4 border-purple-600">
        <h2 className="text-2xl font-bold mb-4 text-purple-900">
          🤖 Editor de Chatbot
        </h2>

        <button
          onClick={addNode}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg mb-4 hover:from-purple-700 hover:to-pink-700 transition font-semibold shadow-lg"
        >
          ✨ Agregar Nuevo Nodo
        </button>

        {selectedNode ? (
          // PANEL DE NODO SELECCIONADO
          <div className="mb-6 bg-purple-50 p-4 rounded-lg shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-purple-900">
                📝 Editando:{" "}
                <span className="text-pink-600">{selectedNode}</span>
              </h3>
              {selectedNode !== "start" && (
                <button
                  onClick={deleteNode}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                >
                  🗑️
                </button>
              )}
            </div>

            {/* MENSAJE */}
            <label className="block text-sm font-bold mb-2 text-purple-900">
              💬 Mensaje del bot:
            </label>
            <textarea
              value={nodeConfig.message}
              onChange={(e) =>
                setNodeConfig({ ...nodeConfig, message: e.target.value })
              }
              className="w-full border-2 border-purple-300 rounded-lg p-3 mb-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              rows="4"
              placeholder="¿Qué dirá el bot en este paso?"
            />

            {/* COMPONENTE */}
            <label className="block text-sm font-bold mb-2 text-purple-900">
              🧩 Componente (opcional):
            </label>
            <select
              value={nodeConfig.componentKey}
              onChange={(e) =>
                setNodeConfig({
                  ...nodeConfig,
                  componentKey: e.target.value,
                })
              }
              className="w-full border-2 border-purple-300 rounded-lg p-2 text-sm mb-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            >
              {AVAILABLE_COMPONENTS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* OPCIONES */}
            <label className="block text-sm font-bold mb-2 text-purple-900">
              🔘 Opciones para el usuario:
            </label>
            <div className="space-y-2 mb-3">
              {nodeConfig.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Opción ${i + 1}`}
                    className="flex-1 border-2 border-purple-300 rounded-lg p-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                  <button
                    onClick={() => removeOption(i)}
                    className="bg-red-500 text-white px-3 rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addOption}
              className="w-full bg-green-500 text-white py-2 rounded-lg text-sm hover:bg-green-600 transition mb-4"
            >
              ➕ Agregar Opción
            </button>

            {/* DESHABILITAR CHAT */}
            <label className="flex items-center gap-2 mb-4 bg-white p-3 rounded-lg border border-purple-200">
              <input
                type="checkbox"
                checked={nodeConfig.chatDisabled}
                onChange={(e) =>
                  setNodeConfig({
                    ...nodeConfig,
                    chatDisabled: e.target.checked,
                  })
                }
                className="w-5 h-5"
              />
              <span className="text-sm font-medium text-gray-700">
                🔒 Finalizar conversación aquí
              </span>
            </label>

            <button
              onClick={saveNodeConfig}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-bold shadow-lg"
            >
              💾 Guardar Cambios
            </button>
          </div>
        ) : selectedEdge ? (
          // PANEL DE CONEXIÓN SELECCIONADA
          <div className="mb-6 bg-blue-50 p-4 rounded-lg shadow-lg border-2 border-blue-200">
            <h3 className="font-bold text-lg text-blue-900 mb-2">
              🔗 Conexión seleccionada
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Desde:</strong> {selectedEdge.source}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Hacia:</strong> {selectedEdge.target}
            </p>
            {selectedEdge.sourceHandle && (
              <p className="text-sm text-gray-700 mb-4">
                <strong>Opción:</strong> {selectedEdge.sourceHandle}
              </p>
            )}

            <button
              onClick={deleteSelectedEdge}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              🗑️ Eliminar esta conexión
            </button>
          </div>
        ) : (
          // NADA SELECCIONADO
          <div className="mb-6 p-6 bg-gray-100 rounded-lg text-center text-gray-500 border-2 border-dashed border-gray-300">
            👆 Haz clic en un nodo para editarlo
            <br />
            🔗 O haz clic en una línea para ver / borrar la conexión
          </div>
        )}

        <button
          onClick={exportFlow}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-bold text-lg shadow-xl mb-4"
        >
          📥 Exportar / Guardar Flow
        </button>

        {/* INSTRUCCIONES */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-sm border-2 border-blue-200">
          <h4 className="font-bold text-blue-900 mb-2">📚 Cómo usar:</h4>
          <ol className="list-decimal ml-4 space-y-2 text-gray-700">
            <li>
              Crea nodos con <strong>"Agregar Nuevo Nodo"</strong>
            </li>
            <li>Haz clic en un nodo para editarlo</li>
            <li>
              Opcional: elige un <strong>componente</strong> (Mapa, Llamada,
              WhatsApp)
            </li>
            <li>
              Arrastra desde el punto de una <strong>opción</strong> (derecha)
              hasta otro nodo para conectarlos
            </li>
            <li>
              Haz clic en una <strong>línea</strong> para ver y eliminar la
              conexión
            </li>
            <li>
              Usa <strong>"Exportar / Guardar Flow"</strong> para guardar en el
              servidor
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
