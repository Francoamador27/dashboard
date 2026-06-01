import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useCampanas() {
  return useQuery({
    queryKey: ['campanas'],
    queryFn: () => api.get('/campanas').then((r) => r.data),
  });
}

export function useGenerarMasiva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/campanas/masiva', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campanas'] }),
  });
}

export function useDeleteCampana() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/campanas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campanas'] }),
  });
}

export function useCampanaProgress(campanaId, enabled = false) {
  return useQuery({
    queryKey: ['campana-progress', campanaId],
    queryFn: () => api.get(`/campanas/${campanaId}/progress`).then((r) => r.data),
    enabled,
    refetchInterval: (data) => (data?.done ? false : 4000),
  });
}

// Colecciones
export function useColecciones(clienteId) {
  return useQuery({
    queryKey: ['colecciones', clienteId ?? 'all'],
    queryFn: () =>
      api.get('/colecciones', { params: clienteId ? { cliente_id: clienteId } : {} }).then((r) => r.data),
  });
}

export function useCrearColeccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/colecciones', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['colecciones'] }),
  });
}

export function useDeleteColeccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/colecciones/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['colecciones'] }),
  });
}
