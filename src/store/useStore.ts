import { create } from 'zustand';
import { shiftPeriodRef } from '../lib/calc';
import { RESERVED_CATEGORY_NAME } from '../lib/constants';
import { toISODate } from '../lib/format';
import {
  loadEntriesFromStorage,
  loadServicesFromStorage,
  loadSettingsFromStorage,
  resetAllStorage,
  saveEntriesToStorage,
  saveServicesToStorage,
  saveSettingsToStorage,
} from '../lib/storage';
import { Entry, PeriodType, Service, Settings } from '../lib/types';

interface AppState {
  services: Service[];
  entries: Entry[];
  settings: Settings;

  dashboardPeriod: PeriodType;
  dashboardDate: Date;

  analyticsPeriod: PeriodType;
  analyticsDate: Date;

  selectedDateStr: string;

  // Actions
  addEntry: (entry: Omit<Entry, 'id'>) => void;
  deleteEntry: (id: string) => void;

  addService: (category: string) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addCategory: (categoryName: string) => boolean;

  setSettings: (settings: Settings) => void;
  toggleTheme: () => void;

  setDashboardPeriod: (period: PeriodType) => void;
  shiftDashboardPeriod: (dir: number) => void;

  setAnalyticsPeriod: (period: PeriodType) => void;
  shiftAnalyticsPeriod: (dir: number) => void;

  setSelectedDateStr: (dateStr: string) => void;

  importData: (services?: Service[], entries?: Entry[]) => void;
  resetData: () => void;
}

function applyThemeToDOM(theme: 'dark' | 'light') {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
  document.documentElement.setAttribute('data-theme', theme);
}

const initialSettings = loadSettingsFromStorage();
// Apply initial theme to class and data-theme
applyThemeToDOM(initialSettings.theme);

export const useStore = create<AppState>((set) => ({
  services: loadServicesFromStorage(),
  entries: loadEntriesFromStorage(),
  settings: initialSettings,

  dashboardPeriod: 'month',
  dashboardDate: new Date(),

  analyticsPeriod: 'month',
  analyticsDate: new Date(),

  selectedDateStr: toISODate(new Date()),

  addEntry: (newEntryData) => {
    set((state) => {
      const newEntry: Entry = {
        ...newEntryData,
        id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      };
      const updated = [newEntry, ...state.entries];
      saveEntriesToStorage(updated);
      return { entries: updated };
    });
  },

  deleteEntry: (id) => {
    set((state) => {
      const updated = state.entries.filter((e) => String(e.id) !== String(id));
      saveEntriesToStorage(updated);
      return { entries: updated };
    });
  },

  addService: (category) => {
    set((state) => {
      const newService: Service = {
        id: `srv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        category,
        name: '',
        price: 0,
        unit: 'шт',
      };
      const updated = [...state.services, newService];
      saveServicesToStorage(updated);
      return { services: updated };
    });
  },

  updateService: (id, updates) => {
    set((state) => {
      const updated = state.services.map((s) => {
        if (String(s.id) === String(id) && !s.isFixed) {
          return { ...s, ...updates };
        }
        return s;
      });
      saveServicesToStorage(updated);
      return { services: updated };
    });
  },

  deleteService: (id) => {
    set((state) => {
      const updated = state.services.filter((s) => String(s.id) !== String(id));
      saveServicesToStorage(updated);
      return { services: updated };
    });
  },

  addCategory: (categoryName) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;
    if (trimmed.toLowerCase() === RESERVED_CATEGORY_NAME) {
      alert('Название «Контейнеры» зарезервировано. Выберите другое название.');
      return false;
    }

    let success = false;
    set((state) => {
      const exists = state.services.some(
        (s) => (s.category || '').toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) {
        alert('Такая категория уже существует!');
        return state;
      }
      const placeholderService: Service = {
        id: `srv_${Date.now()}`,
        category: trimmed,
        name: '',
        price: 0,
        unit: 'шт',
      };
      const updated = [...state.services, placeholderService];
      saveServicesToStorage(updated);
      success = true;
      return { services: updated };
    });
    return success;
  },

  setSettings: (newSettings) => {
    set(() => {
      saveSettingsToStorage(newSettings);
      applyThemeToDOM(newSettings.theme);
      return { settings: newSettings };
    });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
      const updated: Settings = { ...state.settings, theme: nextTheme };
      saveSettingsToStorage(updated);
      applyThemeToDOM(nextTheme);
      return { settings: updated };
    });
  },

  setDashboardPeriod: (period) => set({ dashboardPeriod: period }),

  shiftDashboardPeriod: (dir) => {
    set((state) => {
      const next = shiftPeriodRef(state.dashboardPeriod, state.dashboardDate, dir);
      return { dashboardDate: next };
    });
  },

  setAnalyticsPeriod: (period) => set({ analyticsPeriod: period }),

  shiftAnalyticsPeriod: (dir) => {
    set((state) => {
      const next = shiftPeriodRef(state.analyticsPeriod, state.analyticsDate, dir);
      return { analyticsDate: next };
    });
  },

  setSelectedDateStr: (dateStr) => set({ selectedDateStr: dateStr }),

  importData: (newServices, newEntries) => {
    set((state) => {
      const services = newServices ? newServices : state.services;
      const entries = newEntries ? newEntries : state.entries;
      if (newServices) saveServicesToStorage(services);
      if (newEntries) saveEntriesToStorage(entries);
      return { services, entries };
    });
  },

  resetData: () => {
    resetAllStorage();
    set({
      services: loadServicesFromStorage(),
      entries: [],
      settings: initialSettings,
    });
  },
}));
