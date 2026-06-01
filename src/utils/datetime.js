// Utilidades para trabajar SIEMPRE en UTC

export function isoToUTCParts(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return null;
  // toISOString siempre en UTC
  const iso = d.toISOString(); // ej: "2025-08-22T11:00:00.000Z"
  return {
    date: iso.slice(0, 10),   // "YYYY-MM-DD"
    time: iso.slice(11, 16),  // "HH:mm"
  };
}

export function buildUTCDateFrom(dateStr /* 'YYYY-MM-DD' */, timeStr /* 'HH:mm' */) {
  const [Y, M, D] = dateStr.split('-').map(Number);
  const [hh, mm]  = timeStr.split(':').map(Number);
  return new Date(Date.UTC(Y, (M || 1) - 1, D || 1, hh || 0, mm || 0, 0));
}

export function minutesBetweenUTC(isoStart, isoEnd) {
  const a = new Date(isoStart).getTime();
  const b = new Date(isoEnd).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 15;
  return Math.max(1, Math.round((b - a) / 60000));
}

export function addMinutes(dateUTC, minutes) {
  return new Date(dateUTC.getTime() + (minutes || 0) * 60000);
}

export function clampDuration15(v) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return 15;
  const clamped = Math.min(480, Math.max(15, n));
  return Math.round(clamped / 15) * 15;
}
export function toOffsetString(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset(); // minutos
  const sign = off >= 0 ? '+' : '-';
  const hh = pad(Math.trunc(Math.abs(off) / 60));
  const mm = pad(Math.abs(off) % 60);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` +
         `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${hh}:${mm}`;
};