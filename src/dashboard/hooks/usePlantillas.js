import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { imageUrl } from './useGaleria';

export { imageUrl };

export function usePlantillasAll(filters = {}) {
  const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null));
  return useQuery({
    queryKey: ['plantillas-all', clean],
    queryFn: () => api.get('/plantillas', { params: clean }).then((r) => r.data),
  });
}

export function usePlantillas(clienteId, tipo = null) {
  return useQuery({
    queryKey: ['plantillas', clienteId, tipo],
    queryFn: () =>
      api.get(`/clientes/${clienteId}/plantillas`).then((r) =>
        tipo ? r.data.filter((p) => p.tipo === tipo || !p.tipo) : r.data
      ),
    enabled: !!clienteId,
  });
}

function toFormData(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(`${key}[]`, v));
    } else {
      fd.append(key, value);
    }
  });
  return fd;
}

export function useCrearPlantilla(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post(`/clientes/${clienteId}/plantillas`, toFormData(data), {
        headers: { 'Content-Type': null },  // null = omit header; browser lo setea con boundary
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plantillas', clienteId] }),
  });
}

export function useUpdatePlantilla(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/clientes/${clienteId}/plantillas/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plantillas', clienteId] }),
  });
}

export function useDeletePlantilla(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/clientes/${clienteId}/plantillas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plantillas', clienteId] }),
  });
}

export function useConfirmarPlantilla(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plantillaId) =>
      api.post(`/clientes/${clienteId}/plantillas/${plantillaId}/confirmar`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plantillas', clienteId] }),
  });
}

export function useAgregarLogo(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ plantillaId, ...data }) =>
      api.post(`/clientes/${clienteId}/plantillas/${plantillaId}/agregar-logo`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plantillas', clienteId] }),
  });
}

export function usePlantillaStatus(clienteId, plantillaId, enabled = false) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['plantilla-status', plantillaId],
    queryFn: () =>
      api.get(`/clientes/${clienteId}/plantillas/${plantillaId}/status`).then((r) => r.data),
    // With QUEUE_CONNECTION=sync plantillas come back already done; only poll if still pending
    enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      if (data.status === 'completed' || data.status === 'failed') {
        qc.invalidateQueries({ queryKey: ['plantillas', clienteId] });
        return false;
      }
      return 3000;
    },
  });
}
