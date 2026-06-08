import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const KEY = 'empresas-facturadoras';

export function useEmpresasFacturadoras() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get('/empresas-facturadoras').then(r => r.data),
  });
}

export function useCrearEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      api.post('/empresas-facturadoras', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useActualizarEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) =>
      api.post(`/empresas-facturadoras/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useEliminarEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/empresas-facturadoras/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useTestConexion() {
  return useMutation({
    mutationFn: (id) =>
      api.post(`/empresas-facturadoras/${id}/test-conexion`).then(r => r.data),
  });
}
