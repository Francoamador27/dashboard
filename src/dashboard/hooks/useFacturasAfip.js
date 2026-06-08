import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const KEY = 'facturas-afip';

export function useFacturasAfip(filters = {}) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => api.get('/facturas', { params: filters }).then(r => r.data),
  });
}

export function useFacturasByCliente(clienteId) {
  return useQuery({
    queryKey: [KEY, 'cliente', clienteId],
    queryFn: () => api.get(`/clientes/${clienteId}/facturas`).then(r => r.data),
    enabled: !!clienteId,
  });
}

export function useEmitirFactura(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post(`/clientes/${clienteId}/facturas`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, 'cliente', clienteId] });
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useEnviarFacturaEmail() {
  return useMutation({
    mutationFn: ({ facturaId, ...data }) =>
      api.post(`/facturas/${facturaId}/enviar-email`, data).then(r => r.data),
  });
}

export function useDescargarPdfFactura() {
  return useMutation({
    mutationFn: async ({ facturaId, nombre }) => {
      const res = await api.get(`/facturas/${facturaId}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = nombre ?? `factura-${facturaId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
