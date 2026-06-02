import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

const BASE = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

export const imageUrl = (url) => {
  if (!url) return null;
  // Extraer el path /storage/... sin importar el dominio o prefijo (/api, etc.)
  const storageMatch = url.match(/\/storage\/.+/);
  if (storageMatch) return `${BASE}${storageMatch[0]}`;
  if (url.startsWith("http")) return url;
  return `${BASE}${url}`;
};

export function useAssets(filters = {}) {
  const clean = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v != null),
  );
  return useQuery({
    queryKey: ["assets", clean],
    queryFn: () => api.get("/assets", { params: clean }).then((r) => r.data),
  });
}

export function useActiveAssets() {
  return useQuery({
    queryKey: ["assets-active"],
    queryFn: () =>
      api
        .get("/assets", {
          params: { status: "pending,processing", per_page: 100 },
        })
        .then((r) => r.data),
    refetchInterval: 3000,
  });
}

export function useRecentAssets() {
  return useQuery({
    queryKey: ["assets-recent"],
    queryFn: () =>
      api.get("/assets", { params: { per_page: 32 } }).then((r) => r.data),
    refetchInterval: 8000,
  });
}

export function useColeccionesGaleria() {
  return useQuery({
    queryKey: ["colecciones-galeria"],
    queryFn: () => api.get("/colecciones").then((r) => r.data),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/assets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useRegenerarAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/assets/${id}/regenerar`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useDuplicarAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/assets/${id}/duplicar`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useMoverColeccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, coleccion_id }) =>
      api
        .post(`/assets/${id}/mover-coleccion`, { coleccion_id })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useAdaptarAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plataforma }) =>
      api.post(`/assets/${id}/adaptar`, { plataforma }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useSubirAssets(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      api
        .post(`/clientes/${clienteId}/assets/upload`, formData)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export async function downloadAsset(asset) {
  const res = await api.get(`/assets/${asset.id}/download`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${asset.cliente?.nombre ?? "asset"}-${asset.plataforma}-${asset.id}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
