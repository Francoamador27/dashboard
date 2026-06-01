/**
 * Construye la URL completa de una imagen del servidor
 * @param {string} imagePath - Ruta relativa de la imagen (ej: storage/uploads/servicios/archivo.webp)
 * @returns {string} URL completa de la imagen
 */
export function buildImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // Si ya es una URL absoluta, devolverla tal cual
  if (/^https?:\/\//.test(imagePath)) {
    return imagePath;
  }
  
  // Construir la URL completa usando la base URL de la API
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, ''); // Remover trailing slash
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${cleanPath}`;
}
