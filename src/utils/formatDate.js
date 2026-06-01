// src/utils/formatDate.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Formatea una fecha ISO en string.
 * @param {string} iso - fecha en formato ISO (ej: 2025-08-30T09:00:00.000000Z)
 * @param {boolean} useUTC - si true, muestra la hora tal cual viene de BD (UTC).
 *                           si false, convierte a hora local (ej: Buenos Aires).
 * @param {string} tz - timezone opcional (ej: 'America/Argentina/Buenos_Aires')
 * @returns {string} fecha formateada (ej: 30/08/2025 09:00)
 */
export const formatDate = (iso, useUTC = true, tz = 'America/Argentina/Buenos_Aires') => {
  if (!iso) return '-';

  if (useUTC) {
    // Tal cual viene de la BD (sin shift por timezone)
    return dayjs.utc(iso).format('DD/MM/YYYY H:mm');
  }

  // Convertida a la zona horaria especificada
  return dayjs(iso).tz(tz).format('DD/MM/YYYY H:mm');
};
