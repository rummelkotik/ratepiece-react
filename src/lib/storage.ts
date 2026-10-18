import { DEFAULT_SETTINGS, FIXED_CONTAINERS, RESERVED_CATEGORY_NAME } from './constants';
import { Entry, Service, Settings } from './types';

export function sanitizeServices(list: unknown[]): Service[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((s): s is Service => typeof s === 'object' && s !== null && 'name' in s)
    .filter((s) => {
      const cat = (s.category || '').toLowerCase().trim();
      if (cat === RESERVED_CATEGORY_NAME && !s.isFixed) return false;
      return true;
    });
}

export function loadServicesFromStorage(): Service[] {
  try {
    const raw = JSON.parse(
      localStorage.getItem('services') ||
      localStorage.getItem('app_services') ||
      localStorage.getItem('piecework_services') ||
      'null'
    );
    if (!Array.isArray(raw) || raw.length === 0) {
      return [...FIXED_CONTAINERS];
    }
    const sanitized = sanitizeServices(raw);
    for (const fc of FIXED_CONTAINERS) {
      if (!sanitized.some((s) => String(s.id) === String(fc.id))) {
        sanitized.push(fc);
      }
    }
    return sanitized;
  } catch (e) {
    console.error('Ошибка чтения услуг из localStorage:', e);
    return [...FIXED_CONTAINERS];
  }
}

export function saveServicesToStorage(services: Service[]): void {
  try {
    localStorage.setItem('services', JSON.stringify(services));
  } catch (e) {
    console.error('Ошибка записи услуг в localStorage:', e);
  }
}

export function loadEntriesFromStorage(): Entry[] {
  try {
    const raw = JSON.parse(localStorage.getItem('app_entries') || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    console.error('Ошибка чтения записей из localStorage:', e);
    return [];
  }
}

export function saveEntriesToStorage(entries: Entry[]): void {
  try {
    localStorage.setItem('app_entries', JSON.stringify(entries));
  } catch (e) {
    console.error('Ошибка записи записей в localStorage:', e);
  }
}

export function loadSettingsFromStorage(): Settings {
  try {
    const targetIncome = Number(localStorage.getItem('target_income'));
    const rawTaxRate = Number(localStorage.getItem('tax_rate'));
    const theme = localStorage.getItem('theme') as 'dark' | 'light' | null;

    // tax_rate in original project was saved as decimal (0.13) or percentage (13)
    let taxRate = DEFAULT_SETTINGS.taxRate;
    if (Number.isFinite(rawTaxRate) && rawTaxRate > 0) {
      taxRate = rawTaxRate <= 1 ? rawTaxRate * 100 : rawTaxRate;
    }

    return {
      incomeGoal: Number.isFinite(targetIncome) && targetIncome > 0 ? targetIncome : DEFAULT_SETTINGS.incomeGoal,
      taxRate: taxRate,
      theme: theme === 'light' ? 'light' : 'dark',
    };
  } catch (e) {
    console.error('Ошибка чтения настроек из localStorage:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: Settings): void {
  try {
    localStorage.setItem('target_income', String(settings.incomeGoal));
    // In original project, tax_rate in localStorage was taxRate/100
    localStorage.setItem('tax_rate', String(settings.taxRate / 100));
    localStorage.setItem('theme', settings.theme);
  } catch (e) {
    console.error('Ошибка записи настроек в localStorage:', e);
  }
}

export function exportBackup(services: Service[], entries: Entry[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
    JSON.stringify({ services, entries }, null, 2)
  );
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  const dateStr = new Date().toISOString().split('T')[0];
  a.setAttribute('download', `backup_${dateStr}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function parseImportBackup(jsonStr: string): {
  services?: Service[];
  entries?: Entry[];
  settings?: Settings;
} {
  let content: any;
  try {
    content = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error('Неверный формат файла. Убедитесь, что это корректный JSON.');
  }

  if (!content || (typeof content !== 'object' && !Array.isArray(content))) {
    throw new Error('Файл не содержит корректных данных для импорта');
  }

  let parsedServices: Service[] | undefined;
  let parsedEntries: Entry[] | undefined;
  let parsedSettings: Settings | undefined;

  // Helper to generate IDs
  const genId = (prefix: string, idx: number) => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${prefix}_${crypto.randomUUID()}`;
    }
    return `${prefix}_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`;
  };

  // Helper to map and sanitize raw service
  const mapService = (item: any, index: number): Service => ({
    id: item.id ? String(item.id) : genId('srv', index),
    category: (item.category || item.group || 'Общие').trim(),
    name: (item.name || item.title || item.work || 'Работа').trim(),
    price: Number(item.price || item.cost || item.rate) || 0,
    unit: item.unit || 'шт',
    isFixed: !!(item.isFixed || item.is_fixed),
    is_tax_free: !!(item.is_tax_free || item.taxFree),
  });

  // Helper to map and sanitize raw entry
  const mapEntry = (item: any, index: number): Entry => {
    const rawDate = item.date || item.created_at || item.createdAt;
    let dateStr = '';
    if (rawDate) {
      // If date is ISO string with time or YYYY-MM-DD
      dateStr = String(rawDate).split('T')[0];
    } else {
      dateStr = new Date().toISOString().split('T')[0];
    }

    return {
      id: item.id ? String(item.id) : genId('entry', index),
      date: dateStr,
      service_id: item.service_id ?? item.serviceId ?? null,
      name: item.name || item.work || item.title,
      category: item.category || item.group,
      price: item.price !== undefined ? Number(item.price) : undefined,
      quantity: Number(item.quantity || item.qty || item.count) || 1,
    };
  };

  // Case 1: Plain Array
  if (Array.isArray(content)) {
    if (content.length === 0) {
      return {};
    }
    // Inspect first element to determine if array contains entries or services
    const first = content[0];
    const isEntry = first && ('date' in first || 'quantity' in first || 'service_id' in first);

    if (isEntry) {
      parsedEntries = content.map((item, idx) => mapEntry(item, idx));
    } else {
      parsedServices = sanitizeServices(content).map((item, idx) => mapService(item, idx));
    }
  } else if (typeof content === 'object') {
    // Case 2: Object with keys: services / entries / settings, or alternative legacy keys
    const rawServices = content.services || content.app_services || content.piecework_services;
    const rawEntries = content.entries || content.app_entries || content.items || content.records;

    if (Array.isArray(rawServices)) {
      parsedServices = sanitizeServices(rawServices).map((item, idx) => mapService(item, idx));
    }
    if (Array.isArray(rawEntries)) {
      parsedEntries = rawEntries.map((item, idx) => mapEntry(item, idx));
    }

    if (content.settings && typeof content.settings === 'object') {
      parsedSettings = content.settings;
    }
  }

  return { services: parsedServices, entries: parsedEntries, settings: parsedSettings };
}

export function resetAllStorage(): void {
  const keys = ['services', 'app_services', 'piecework_services', 'app_entries', 'target_income', 'tax_rate'];
  keys.forEach((k) => localStorage.removeItem(k));
}
