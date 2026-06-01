import React, { useState, useMemo, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Link } from 'react-router-dom';
import clienteAxios from '../../config/axios';
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const SortableServicioItem = ({ servicio }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: servicio.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-xl shadow-sm flex items-center gap-4 p-4"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        title="Arrastrar"
      >
        <GripVertical />
      </div>

      {servicio.image ? (
        <img
          src={servicio.image}
          alt={servicio.title}
          className="w-20 h-20 object-cover rounded-lg border"
        />
      ) : (
        <div className="w-20 h-20 rounded-lg border bg-gray-50" />
      )}

      <div className="flex-1">
        <h4 className="font-semibold text-sm">{servicio.title || '—'}</h4>
        <p className="text-xs text-gray-600 line-clamp-2">
          {servicio.description || ''}
        </p>
      </div>
    </div>
  );
};

const ServiciosList = () => {
  const token = localStorage.getItem('AUTH_TOKEN');

  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('created_at');
  const [direccion, setDireccion] = useState('desc');
  const [pagina, setPagina] = useState(1);
  const [perPage] = useState(10);
  const [ordenItems, setOrdenItems] = useState([]);
  const [ordenError, setOrdenError] = useState(null);
  const [ordenLoading, setOrdenLoading] = useState(false);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (busqueda.length >= 3) p.append('busqueda', busqueda);
    if (ordenarPor) p.append('ordenar_por', ordenarPor);
    if (direccion) p.append('direccion', direccion);
    if (pagina) p.append('page', pagina);
    if (perPage) p.append('per_page', perPage);
    return p.toString();
  }, [busqueda, ordenarPor, direccion, pagina, perPage]);

  const fetcher = () =>
    clienteAxios(`/api/servicios?${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => res.data);

  const { data, error, isLoading } = useSWR(`/api/servicios?${query}`, fetcher);

  const fetchOrden = async () => {
    try {
      setOrdenLoading(true);
      setOrdenError(null);
      const { data } = await clienteAxios('/api/servicios?sort=position&dir=asc&per_page=1000', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setOrdenItems(items);
    } catch (err) {
      console.error(err);
      setOrdenError('Error al cargar el orden de Servicios.');
    } finally {
      setOrdenLoading(false);
    }
  };

  useEffect(() => {
    fetchOrden();
  }, []);

  if (isLoading) return <p className="p-4 text-gray-600">Cargando Servicios...</p>;
  if (error) return <p className="p-4 text-red-600">Error al cargar los Servicios.</p>;

  const servicios = data?.data ?? [];
  const currentPage = data?.current_page ?? pagina;
  const lastPage = data?.last_page ?? 1;

  // 👉 Función para eliminar
  const handleEliminar = async (id) => {
       if (!window.confirm('¿Seguro que querés eliminar este servicio?')) return;

    try {
      await clienteAxios.delete(`/api/servicios/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Refresca la tabla
      mutate(`/api/servicios?${query}`);
    } catch (err) {
      console.error(err);
         alert('Error al eliminar el servicio.');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordenItems.findIndex((s) => s.id === active.id);
    const newIndex = ordenItems.findIndex((s) => s.id === over.id);

    const newOrder = arrayMove(ordenItems, oldIndex, newIndex);
    setOrdenItems(newOrder);

    try {
      await clienteAxios.post(
        '/api/servicios/reorder',
        {
          order: newOrder.map((s, index) => ({
            id: s.id,
            position: index + 1,
          })),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
    } catch (err) {
      console.error(err);
      setOrdenError('Error guardando el orden.');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Administrar Obras</h2>

      </div>

      {/* Orden por drag & drop */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Orden de visualizacion</h3>
          <button
            onClick={fetchOrden}
            className="text-sm text-blue-600 hover:text-blue-700"
            type="button"
          >
            Refrescar orden
          </button>
        </div>

        {ordenLoading && (
          <p className="text-sm text-gray-500">Cargando orden...</p>
        )}
        {ordenError && (
          <p className="text-sm text-red-600">{ordenError}</p>
        )}

        {!ordenLoading && ordenItems.length > 0 && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={ordenItems.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {ordenItems.map((servicio) => (
                  <SortableServicioItem key={servicio.id} servicio={servicio} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            placeholder="Buscar por título o descripción"
            className="border px-3 py-2 rounded w-72"
          />
          {busqueda && (
            <button
              onClick={() => {
                setBusqueda('');
                setPagina(1);
              }}
              className="text-sm text-red-500 underline"
            >
              Limpiar
            </button>
          )}
        </div>
        {busqueda.length > 0 && busqueda.length < 3 && (
          <p className="text-sm text-yellow-600">Escribí al menos 3 letras para buscar.</p>
        )}

        <select
          onChange={(e) => {
            setOrdenarPor(e.target.value);
            setPagina(1);
          }}
          className="border px-2 py-2 rounded"
          value={ordenarPor}
        >
          <option value="created_at">Fecha</option>
          <option value="title">Título</option>
        </select>

        <select
          onChange={(e) => {
            setDireccion(e.target.value);
            setPagina(1);
          }}
          className="border px-2 py-2 rounded"
          value={direccion}
        >
          <option value="desc">↓ Descendente</option>
          <option value="asc">↑ Ascendente</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm text-gray-800 bg-white">
          <thead className="bg-gray-100 text-xs text-gray-600 ">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Imagen</th>
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Categoria</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Tags</th>
              <th className="px-4 py-3 text-left">Creado</th>
              <th className="px-4 py-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 border-t border-gray-200 transition">
                <td className="px-4 py-3">{s.id}</td>
                <td className="px-4 py-3">
                  {s.image ? (
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{s.title || '—'}</td>
                <td className="px-4 py-3">
                  {s.categoria?.nombre || '—'}
                </td>
                <td className="px-4 py-3 max-w-md">
                  <div className="line-clamp-2 text-gray-600">{s.description}</div>
                </td>
                <td className="px-4 py-3">
                  {Array.isArray(s.tags) && s.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {s.tags.map((t, i) => (
                        <span
                          key={`${s.id}-tag-${i}`}
                          className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Link
                    to={`/admin-dash/servicios/editar/${s.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleEliminar(s.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {servicios.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                  No hay Servicios para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex gap-4 items-center">
        <button
          onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          disabled={currentPage <= 1}
        >
          Anterior
        </button>
        <span className="text-sm">
          Página {currentPage} de {lastPage}
        </span>
        <button
          onClick={() => setPagina((prev) => Math.min(lastPage, prev + 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          disabled={currentPage >= lastPage}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ServiciosList;
