import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ─── Notas ────────────────────────────────────────────────────────────────────
export function useNotas(clienteId) {
  return useQuery({
    queryKey: ['clientes', clienteId, 'notas'],
    queryFn: () => api.get(`/clientes/${clienteId}/notas`).then(r => r.data),
    enabled: !!clienteId,
  });
}

export function useCrearNota(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/clientes/${clienteId}/notas`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries(['clientes', clienteId, 'notas']),
  });
}

export function useEliminarNota(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notaId) => api.delete(`/clientes/${clienteId}/notas/${notaId}`),
    onSuccess: () => qc.invalidateQueries(['clientes', clienteId, 'notas']),
  });
}

// ─── Tickets ──────────────────────────────────────────────────────────────────
export function useTickets(clienteId) {
  return useQuery({
    queryKey: ['clientes', clienteId, 'tickets'],
    queryFn: () => api.get(`/clientes/${clienteId}/tickets`).then(r => r.data),
    enabled: !!clienteId,
  });
}

export function useTicketDetalle(clienteId, ticketId) {
  return useQuery({
    queryKey: ['tickets', clienteId, ticketId],
    queryFn: () => api.get(`/clientes/${clienteId}/tickets/${ticketId}`).then(r => r.data),
    enabled: !!clienteId && !!ticketId,
  });
}

export function useCrearTicket(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ adjuntos = [], enlaces = [], ...fields }) => {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v);
      });
      adjuntos.forEach(f => fd.append('adjuntos[]', f));
      enlaces.filter(Boolean).forEach(url => fd.append('enlaces[]', url));
      return api.post(`/clientes/${clienteId}/tickets`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes', clienteId, 'tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets-all'] });
    },
  });
}

export function useActualizarTicket(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/clientes/${clienteId}/tickets/${id}`, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['clientes', clienteId, 'tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets', clienteId, id] });
      qc.invalidateQueries({ queryKey: ['tickets-all'] });
    },
  });
}

export function useEliminarTicket(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/clientes/${clienteId}/tickets/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes', clienteId, 'tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets-all'] });
    },
  });
}

export function useCrearComentarioTicket(clienteId, ticketId) {
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

export function useEliminarComentarioTicket(clienteId, ticketId) {
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

// ─── Usuario de acceso al portal ──────────────────────────────────────────────
export function useUsuarioCliente(clienteId) {
  return useQuery({
    queryKey: ['clientes', clienteId, 'usuario'],
    queryFn: () => api.get(`/clientes/${clienteId}/usuario`).then(r => r.data),
    enabled: !!clienteId,
  });
}

export function useCrearUsuarioCliente(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/clientes/${clienteId}/usuario`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes', clienteId, 'usuario'] }),
  });
}


export function useEliminarUsuarioCliente(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/clientes/${clienteId}/usuario`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes', clienteId, 'usuario'] }),
  });
}

// ─── Pagos ────────────────────────────────────────────────────────────────────
export function usePagos(clienteId) {
  return useQuery({
    queryKey: ['clientes', clienteId, 'pagos'],
    queryFn: () => api.get(`/clientes/${clienteId}/pagos`).then(r => r.data),
    enabled: !!clienteId,
  });
}

export function useCrearPago(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/clientes/${clienteId}/pagos`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries(['clientes', clienteId, 'pagos']),
  });
}

export function useActualizarPago(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/clientes/${clienteId}/pagos/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries(['clientes', clienteId, 'pagos']),
  });
}

export function useEliminarPago(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/clientes/${clienteId}/pagos/${id}`),
    onSuccess: () => qc.invalidateQueries(['clientes', clienteId, 'pagos']),
  });
}

// ─── Archivos ─────────────────────────────────────────────────────────────────
export function useArchivos(clienteId, params = {}) {
  return useQuery({
    queryKey: ['clientes', clienteId, 'archivos', params],
    queryFn: () => api.get(`/clientes/${clienteId}/archivos`, { params }).then(r => r.data),
    enabled: !!clienteId,
  });
}

export function useSubirArchivo(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, nombre, categoria, descripcion, ticket_id, pago_id, url_externa }) => {
      const form = new FormData();
      if (file) form.append('archivo', file);
      if (nombre)      form.append('nombre', nombre);
      if (categoria)   form.append('categoria', categoria);
      if (descripcion) form.append('descripcion', descripcion);
      if (ticket_id)   form.append('ticket_id', ticket_id);
      if (pago_id)     form.append('pago_id', pago_id);
      if (url_externa) form.append('url_externa', url_externa);
      return api.post(`/clientes/${clienteId}/archivos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes', clienteId, 'archivos'] }),
  });
}

export function useEliminarArchivo(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/clientes/${clienteId}/archivos/${id}`),
    onSuccess: () => qc.invalidateQueries(['clientes', clienteId, 'archivos']),
  });
}
