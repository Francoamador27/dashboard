export const fmtDMYHM = (d) => {
  const date = (typeof d === 'string') ? new Date(d) : d;
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date);
};
// utils/date.ts|js
export const fmtDMY = (d) => {
  const date = (typeof d === 'string') ? new Date(d) : d;
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',        // → 2 (sin cero a la izquierda)
    month: '2-digit',      // → 08
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date);
};
