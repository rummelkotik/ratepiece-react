export interface Service {
  id: string; // "srv_xxx" or "fixed_container_xxx"
  name: string;
  price: number; // >= 0
  category: string;
  isFixed?: boolean;
  is_tax_free?: boolean;
  unit?: string;
  icon?: string;
}

export interface Entry {
  id: string; // "entry_xxx"
  date: string; // "YYYY-MM-DD"
  project?: string;
  service_id?: string | null;
  name?: string;
  category?: string;
  price?: number;
  quantity: number; // > 0
}

export interface Settings {
  taxRate: number; // % (e.g. 13)
  incomeGoal: number; // rub/month (e.g. 100000)
  theme: 'dark' | 'light';
}

export type PeriodType = 'day' | 'month' | 'year';

export interface AggregationResult {
  gross: number;
  taxable: number;
  tax: number;
  net: number;
  containers: number;
  count: number;
  avgPerDay: number; // <--- ДОБАВЬТЕ ВОТ ЭТУ СТРОКУ
  byCategory: Record<string, number>;
  byWork: Record<string, number>;
  byDay: Record<number, number>;
  byMonth: Record<number, number>;
  rowsMain: any[];
  rowsFrames: any[];
}
