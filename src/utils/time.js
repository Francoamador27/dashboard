// ----- helpers de hora -----

// "HH:mm" (24h) -> { h12: 1..12, m: 0..59, meridiem: 'AM'|'PM' }
export function to12h(time24) {
  if (!time24 || !/^\d{2}:\d{2}$/.test(time24)) return { h12: 12, m: 0, meridiem: 'AM' };
  const [H, M] = time24.split(':').map(Number);
  const meridiem = H >= 12 ? 'PM' : 'AM';
  let h12 = H % 12;
  if (h12 === 0) h12 = 12; // 00 -> 12 AM, 12 -> 12 PM
  return { h12, m: M, meridiem };
}

// { h12, m, meridiem } -> "HH:mm" (24h)
export function to24h({ h12, m, meridiem }) {
  let H = h12 % 12; // 12 -> 0
  if (meridiem === 'PM') H += 12;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(H)}:${pad(m)}`;
}

// Date/ISO -> "YYYY-MM-DD"
export function dateToYmd(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

// Date/ISO -> "HH:mm" (24h) en LOCAL
export function dateToTime24Local(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Construye Date LOCAL desde "YYYY-MM-DD" + "HH:mm" (24h)
export function buildLocalDateFrom(dateStr, time24) {
  const [Y, M, D] = dateStr.split('-').map(Number);
  const [hh, mm]  = time24.split(':').map(Number);
  return new Date(Y, (M || 1) - 1, D || 1, hh || 0, mm || 0, 0, 0); // LOCAL
}
export function buildUTCDateFrom(dateStr, time24) {
  const [Y, M, D] = dateStr.split('-').map(Number);
  const [hh, mm]  = time24.split(':').map(Number);
  return new Date(Date.UTC(Y, (M||1)-1, D||1, hh||0, mm||0, 0, 0)); // ✅ UTC
}
// Diferencia en minutos entre dos fechas (acepta Date o string ISO)
export function diffMinutes(a, b) {
  const ta = (a instanceof Date ? a : new Date(a)).getTime();
  const tb = (b instanceof Date ? b : new Date(b)).getTime();
  return Math.max(1, Math.round((tb - ta) / 60000));
}

// Sanea duración (15..480, múltiplos de 15)
export function clampDuration15(v) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return 15;
  const clamped = Math.min(480, Math.max(15, n));
  return Math.round(clamped / 15) * 15;
}
