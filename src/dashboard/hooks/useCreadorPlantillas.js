import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useCreadorPlantillas(clienteId, filters = {}) {
  return useQuery({
    queryKey: ['creador-plantillas', clienteId, filters],
    queryFn: () =>
      api.get(`/clientes/${clienteId}/creador-plantillas`, { params: filters }).then(r => r.data),
    enabled: !!clienteId,
  });
}

export function useCreadorPlantillaDetalle(clienteId, plantillaId) {
  return useQuery({
    queryKey: ['creador-plantillas', clienteId, plantillaId],
    queryFn: () =>
      api.get(`/clientes/${clienteId}/creador-plantillas/${plantillaId}`).then(r => r.data),
    enabled: !!clienteId && !!plantillaId,
  });
}

export function useCrearCreadorPlantilla(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      const isForm = payload instanceof FormData;
      return api.post(
        `/clientes/${clienteId}/creador-plantillas`,
        payload,
        isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {},
      ).then(r => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creador-plantillas', clienteId] }),
  });
}

export function useActualizarCreadorPlantilla(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      const isForm = payload instanceof FormData;
      const id   = isForm ? payload.get('id') : payload.id;
      const data = isForm ? payload : (({ id: _, ...rest }) => rest)(payload);
      return api.put(
        `/clientes/${clienteId}/creador-plantillas/${id}`,
        data,
        isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {},
      ).then(r => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creador-plantillas', clienteId] }),
  });
}

export function useEliminarCreadorPlantilla(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/clientes/${clienteId}/creador-plantillas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creador-plantillas', clienteId] }),
  });
}
