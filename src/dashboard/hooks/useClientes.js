import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const KEY = 'clientes';

export function useClientes() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get('/clientes').then((r) => r.data),
  });
}

export function useCliente(id) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get(`/clientes/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useBrandDna(id) {
  return useQuery({
    queryKey: [KEY, id, 'brand-dna'],
    queryFn: () => api.get(`/clientes/${id}/brand-dna`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/clientes', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries([KEY]),
  });
}

export function useUpdateCliente(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.put(`/clientes/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries([KEY]);
      qc.invalidateQueries([KEY, id]);
    },
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/clientes/${id}`),
    onSuccess: () => qc.invalidateQueries([KEY]),
  });
}

export function useUploadLogo(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => {
      const form = new FormData();
      form.append('logo', file);
      return api.post(`/clientes/${id}/logo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries([KEY]),
  });
}

export function useUpdateBrandDna(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.put(`/clientes/${id}/brand-dna`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries([KEY, id, 'brand-dna']);
      qc.invalidateQueries([KEY, id]);
    },
  });
}
