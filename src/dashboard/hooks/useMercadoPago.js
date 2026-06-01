import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useMPStatus() {
  return useQuery({
    queryKey: ['mp-status'],
    queryFn: () => api.get('/mercadopago/status').then(r => r.data),
    staleTime: 60_000,
  });
}

export function useMPSuscripciones(filters = {}) {
  return useQuery({
    queryKey: ['mp-suscripciones', filters],
    queryFn: () => api.get('/mercadopago/suscripciones', { params: filters }).then(r => r.data),
    staleTime: 30_000,
  });
}

export function useMPSuscripcion(id) {
  return useQuery({
    queryKey: ['mp-suscripcion', id],
    queryFn: () => api.get(`/mercadopago/suscripciones/${id}`).then(r => r.data),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useMPPagos(filters = {}) {
  return useQuery({
    queryKey: ['mp-pagos', filters],
    queryFn: () => api.get('/mercadopago/pagos', { params: filters }).then(r => r.data),
    staleTime: 30_000,
  });
}
