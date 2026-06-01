import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, getDay, startOfWeek as dfStartOfWeek } from 'date-fns';
import esES from 'date-fns/locale/es';

export const localizer = dateFnsLocalizer({
  format,
  parse,
  getDay,
  locales: { es: esES },
  startOfWeek: (date) => dfStartOfWeek(date, { weekStartsOn: 1 }), // lunes
});
