import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatMoney(amount: number, showDecimals = false): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return safe.toLocaleString('ru-RU', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }) + ' ₽';
}

export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(isoStr: string): Date {
  if (!isoStr) return new Date();
  try {
    const [y, m, d] = isoStr.split('-').map(Number);
    return new Date(y || 1970, (m || 1) - 1, d || 1);
  } catch {
    return parseISO(isoStr);
  }
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const d = parseISODate(dateStr);
    return format(d, 'd MMM yyyy', { locale: ru });
  } catch {
    return dateStr;
  }
}

export function formatTrend(current: number, previous: number): string {
  if (!previous || previous <= 0) return '—';
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct)}%`;
}
