import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ─── Todos los tickets (vista global admin) ───────────────────────────────────
export function useTicketsAll(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['tickets-all', filters],
    queryFn: () => api.get('/tickets', { params: filters }).then(r => r.data),
    ...options,
  });
}

// ─── Detalle de un ticket con thread completo ─────────────────────────────────
export function useTicketDetalle(clienteId, ticketId) {
  return useQuery({
    queryKey: ['tickets', clienteId, ticketId],
    queryFn: () => api.get(`/clientes/${clienteId}/tickets/${ticketId}`).then(r => r.data),
    enabled: !!clienteId && !!ticketId,
  });
}

// ─── Admin responde un ticket ─────────────────────────────────────────────────
export function useCrearComentario(clienteId, ticketId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contenido, esInterno = false, adjuntos = [], requiereAprobacion = false }) => {
      const fd = new FormData();
      fd.append('contenido', contenido);
      fd.append('es_interno', esInterno ? '1' : '0');
      fd.append('requiere_aprobacion', requiereAprobacion ? '1' : '0');
      adjuntos.forEach(f => fd.append('adjuntos[]', f));
      return api.post(
        `/clientes/${clienteId}/tickets/${ticketId}/comentarios`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      ).then(r => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets', clienteId, ticketId] });
      qc.invalidateQueries({ queryKey: ['clientes', clienteId, 'tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets-all'] });
    },
  });
}

// ─── Eliminar comentario ──────────────────────────────────────────────────────
export function useEliminarComentario(clienteId, ticketId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comentarioId) =>
      api.delete(`/clientes/${clienteId}/tickets/${ticketId}/comentarios/${comentarioId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets', clienteId, ticketId] });
      qc.invalidateQueries({ queryKey: ['clientes', clienteId, 'tickets'] });
    },
  });
}
