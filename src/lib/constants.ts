import { Service, Settings } from './types';

export const RESERVED_CATEGORY_NAME = 'контейнеры';

export const FIXED_CONTAINERS: Service[] = [
  { id: 'fixed_container_3', category: 'Контейнеры', name: 'контейнер на 3', price: 3333, isFixed: true },
  { id: 'fixed_container_4', category: 'Контейнеры', name: 'контейнер на 4', price: 2500, isFixed: true },
  { id: 'fixed_container_fenced', category: 'Контейнеры', name: 'контейнер с ограждениями', price: 5000, isFixed: true },
  { id: 'fixed_container_tanks_3', category: 'Контейнеры', name: 'контейнер с баками на 3', price: 2500, isFixed: true },
  { id: 'fixed_container_tanks_4', category: 'Контейнеры', name: 'контейнер с баками на 4', price: 1750, isFixed: true },
];

export const DEFAULT_SETTINGS: Settings = {
  taxRate: 13,
  incomeGoal: 100000,
  theme: 'dark',
};

export const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export const MONTH_NAMES_SHORT = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
];

export const PIE_COLORS = [
  '#FF7A00', '#FFA14A', '#D95B00', '#FFB87A', '#F4F4F5', '#A1A1AA', '#71717A', '#3F3F46',
];
