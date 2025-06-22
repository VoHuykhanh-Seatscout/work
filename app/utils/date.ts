// utils/date.ts
import { format, parseISO, isValid } from 'date-fns';

export const safeFormatDate = (dateString: string | null | undefined, formatString = 'MMMM d, yyyy'): string => {
  if (!dateString) return 'Date not set';
  
  try {
    // First try parsing as ISO string (YYYY-MM-DD)
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`);
    if (isValid(date)) return format(date, formatString);
    
    // Fallback to parseISO for other formats
    const parsedDate = parseISO(dateString);
    if (isValid(parsedDate)) return format(parsedDate, formatString);
    
    return 'Invalid date';
  } catch {
    return 'Invalid date';
  }
};