import { FIXED_CONTAINERS } from './constants';
import { parseISODate, toISODate } from './format';
import { AggregationResult, Entry, PeriodType, Service } from './types';

export function findServiceById(id: string | null | undefined, services: Service[]): Service | null {
  if (!id) return null;
  const key = String(id);
  const fixed = FIXED_CONTAINERS.find((s) => String(s.id) === key);
  if (fixed) return fixed;
  return services.find((s) => String(s.id) === key) || null;
}

export function priceOf(entry: Entry, services: Service[]): number {
  if (entry.price !== undefined && entry.price !== null && !isNaN(entry.price)) {
    return Number(entry.price);
  }
  const s = findServiceById(entry.service_id, services);
  return s ? Number(s.price) || 0 : 0;
}

export function sumOf(entry: Entry, services: Service[]): number {
  const qty = Number(entry.quantity) || 1;
  return qty * priceOf(entry, services);
}

export function entryName(entry: Entry, services: Service[]): string {
  if (entry.name && entry.name.trim()) return entry.name;
  const s = findServiceById(entry.service_id, services);
  return s ? s.name : 'Работа';
}

export function entryCategory(entry: Entry, services: Service[]): string {
  const s = findServiceById(entry.service_id, services);
  if (s && s.category) return s.category;
  return entry.category || 'Общие';
}

export function isContainerEntry(entry: Entry, services: Service[]): boolean {
  const cat = entryCategory(entry, services).toLowerCase();
  const name = entryName(entry, services).toLowerCase();
  const id = String(entry.service_id || '').toLowerCase();
  return cat.includes('контейнер') || name.includes('контейнер') || id.includes('container');
}

export function isTaxableEntry(entry: Entry, services: Service[]): boolean {
  if (isContainerEntry(entry, services)) return false;
  const s = findServiceById(entry.service_id, services);
  if (s && (s.is_tax_free === true || s.isFixed)) return false;
  return true;
}

export function filterEntriesByPeriod(
  entries: Entry[],
  period: PeriodType,
  ref: Date | string
): Entry[] {
  const refDate = typeof ref === 'string' ? parseISODate(ref) : ref;
  const refDateStr = typeof ref === 'string' ? ref : toISODate(ref);

  return entries.filter((e) => {
    if (!e.date) return false;
    if (period === 'day') return e.date === refDateStr;
    const d = parseISODate(e.date);
    if (period === 'month') {
      return d.getFullYear() === refDate.getFullYear() && d.getMonth() === refDate.getMonth();
    }
    return d.getFullYear() === refDate.getFullYear();
  });
}

export function shiftPeriodRef(period: PeriodType, ref: Date, dir: number): Date {
  const d = new Date(ref);
  if (period === 'day') {
    d.setDate(d.getDate() + dir);
  } else if (period === 'month') {
    d.setMonth(d.getMonth() + dir);
  } else {
    d.setFullYear(d.getFullYear() + dir);
  }
  return d;
}

export function aggregateEntries(
  entries: Entry[],
  services: Service[],
  taxRatePercent: number
): AggregationResult {
  const agg: AggregationResult = {
    gross: 0,
    taxable: 0,
    tax: 0,
    net: 0,
    containers: 0,
    count: 0,
    avgPerDay: 0, // <-- Добавлено поле
    byCategory: {},
    byWork: {},
    byDay: {},
    byMonth: {},
    rowsMain: [],
    rowsFrames: [],
  };

  // Набор для подсчета уникальных рабочих дней
  const uniqueDates = new Set<string>();

  const rowsMainMap: Record<string, { category: string; name: string; quantity: number; totalSum: number }> = {};
  const rowsFramesMap: Record<string, { category: string; name: string; quantity: number; totalSum: number }> = {};

  for (const e of entries) {
    const sum = sumOf(e, services);
    const qty = Number(e.quantity) || 1;

    // Сохраняем дату для расчета среднего за день
    if (e.date) uniqueDates.add(e.date);

    agg.gross += sum;
    agg.count += qty;

    const isCont = isContainerEntry(e, services);
    if (isCont) {
      agg.containers += sum;
    } else if (isTaxableEntry(e, services)) {
      agg.taxable += sum;
    }

    const cat = isCont ? 'Контейнеры' : entryCategory(e, services);
    const name = entryName(e, services);

    agg.byCategory[cat] = (agg.byCategory[cat] || 0) + sum;
    agg.byWork[name] = (agg.byWork[name] || 0) + sum;

    const d = parseISODate(e.date);
    const day = d.getDate();
    const month = d.getMonth();

    agg.byDay[day] = (agg.byDay[day] || 0) + sum;
    agg.byMonth[month] = (agg.byMonth[month] || 0) + sum;

    const targetMap = isCont ? rowsFramesMap : rowsMainMap;
    const key = `${cat}___${name}`;
    if (!targetMap[key]) {
      targetMap[key] = { category: cat, name, quantity: 0, totalSum: 0 };
    }
    targetMap[key].quantity += qty;
    targetMap[key].totalSum += sum;
  }

  const taxRateDecimal = (Number(taxRatePercent) || 0) / 100;
  agg.tax = agg.taxable * taxRateDecimal;
  agg.net = agg.gross - agg.tax;

  // Считаем средний заработок за день (общая сумма делится на кол-во уникальных дней)
  agg.avgPerDay = uniqueDates.size > 0 ? agg.gross / uniqueDates.size : 0;

  agg.rowsMain = Object.values(rowsMainMap).sort((a, b) => b.totalSum - a.totalSum);
  agg.rowsFrames = Object.values(rowsFramesMap).sort((a, b) => b.totalSum - a.totalSum);

  return agg;
}

export function getTopWork(byWork: Record<string, number>): { name: string; sum: number } {
  let name = 'Нет данных';
  let sum = 0;
  for (const [n, s] of Object.entries(byWork)) {
    if (s > sum) {
      sum = s;
      name = n;
    }
  }
  return { name, sum };
}