import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { FIXED_CONTAINERS, RESERVED_CATEGORY_NAME } from '../lib/constants';
import { findServiceById, sumOf } from '../lib/calc';
import { formatMoney } from '../lib/format';
import {
  FolderPlus,
  Sparkles,
  Package,
  Trash2,
  Check,
  FolderOpen,
} from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';
import { DatePicker } from '../components/DatePicker';

export const AddWork: React.FC = () => {
  const {
    services,
    entries,
    selectedDateStr,
    setSelectedDateStr,
    addEntry,
    deleteEntry,
  } = useStore();

  // Catalog Form state
  const [catCategory, setCatCategory] = useState<string>('');
  const [catServiceId, setCatServiceId] = useState<string>('');
  const [catQty, setCatQty] = useState<string>('1');

  // Single Work Form state
  const [singleName, setSingleName] = useState<string>('');
  const [singlePrice, setSinglePrice] = useState<string>('');
  const [singleQty, setSingleQty] = useState<string>('1');

  // Flash state for quick container clicks
  const [flashedId, setFlashedId] = useState<string | null>(null);

  // Valid services for catalog selection (excluding fixed containers)
  const validServices = services.filter((s) => {
    const cat = (s.category || '').trim().toLowerCase();
    return cat !== RESERVED_CATEGORY_NAME && !s.isFixed;
  });

  const availableCategories = Array.from(
    new Set(validServices.map((s) => s.category || 'Общие'))
  ).sort();

  const servicesInSelectedCat = validServices.filter(
    (s) => (s.category || 'Общие') === catCategory
  );

  const selectedCatalogService = findServiceById(catServiceId, services);

  // Add work from catalog
  const handleAddFromCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catServiceId) {
      alert('Пожалуйста, выберите позицию из каталога');
      return;
    }
    const qty = Number(catQty) || 1;
    if (qty <= 0) {
      alert('Количество должно быть положительным числом');
      return;
    }

    const service = findServiceById(catServiceId, services);
    addEntry({
      date: selectedDateStr,
      service_id: catServiceId,
      name: service?.name || '',
      category: service?.category || '',
      price: service?.price || 0,
      quantity: qty,
    });

    setCatQty('1');
  };

  // Add single custom work
  const handleAddSingleWork = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = singleName.trim();
    if (!trimmedName) {
      alert('Введите название работы');
      return;
    }
    const qty = Number(singleQty) || 1;
    if (qty <= 0) {
      alert('Количество должно быть положительным числом');
      return;
    }
    const price = parseFloat(singlePrice) || 0;

    addEntry({
      date: selectedDateStr,
      service_id: null,
      name: trimmedName,
      category: 'Единичная',
      price: price,
      quantity: qty,
    });

    setSingleName('');
    setSinglePrice('');
    setSingleQty('1');
  };

  // Add container fast
  const handleAddContainer = (containerId: string) => {
    const cont = FIXED_CONTAINERS.find((c) => c.id === containerId);
    if (!cont) return;

    addEntry({
      date: selectedDateStr,
      service_id: cont.id,
      name: cont.name,
      category: 'Контейнеры',
      price: cont.price,
      quantity: 1,
    });

    setFlashedId(containerId);
    setTimeout(() => setFlashedId(null), 300);
  };

  // Day entries for selected date
  const dayEntries = entries.filter((e) => e.date === selectedDateStr);
  const dayTotal = dayEntries.reduce((acc, e) => acc + sumOf(e, services), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">Добавление работы</h2>
          <p className="text-sm text-text-muted">Быстро и удобно добавляйте выполненные объёмы</p>
        </div>
        <DatePicker
          value={selectedDateStr}
          onChange={setSelectedDateStr}
          label="Текущая дата:"
        />
      </div>

      {/* Grid: 2 Add Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Add from Catalog */}
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-[#1c1c1e] text-[#FF7A00] flex items-center justify-center shrink-0">
                <FolderPlus className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-bold text-text-main font-heading">Добавить из каталога</h3>
            </div>

            <form onSubmit={handleAddFromCatalog} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Категория
                </label>
                <CustomSelect
                  value={catCategory}
                  onChange={(val) => {
                    setCatCategory(val);
                    setCatServiceId('');
                  }}
                  placeholder="— Выберите категорию —"
                  options={availableCategories.map((cat) => ({ value: cat, label: cat }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Позиция
                </label>
                <CustomSelect
                  value={catServiceId}
                  disabled={!catCategory}
                  onChange={(val) => setCatServiceId(val)}
                  placeholder={catCategory ? '— Выберите позицию —' : 'Сначала выберите категорию'}
                  options={servicesInSelectedCat.map((s) => ({
                    value: s.id,
                    label: `${s.name} (${formatMoney(s.price)})`,
                  }))}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Количество
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={catQty}
                    onChange={(e) => setCatQty(e.target.value)}
                    placeholder="1"
                    className="w-full bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-text-main rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-accent-orange"
                  />
                </div>
                <div className="pt-5 text-sm text-text-muted font-medium">шт.</div>
              </div>

              {selectedCatalogService && (
                <div className="flex items-center gap-1.5 text-xs text-accent-orange font-semibold pt-1">
                  <Check className="w-4 h-4" />
                  <span>
                    Цена из каталога: {formatMoney(selectedCatalogService.price)} / шт.
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#FF7A00] text-gray-950 font-bold py-3 px-5 rounded-full hover:opacity-95 active:scale-[0.99] transition-all shadow-md cursor-pointer"
              >
                + Добавить из каталога
              </button>
            </form>
          </div>
        </div>

        {/* Form 2: Single Custom Work */}
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-[#1c1c1e] text-[#FF7A00] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-bold text-text-main font-heading">Единичная работа</h3>
            </div>

            <form onSubmit={handleAddSingleWork} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Название работы
                </label>
                <input
                  type="text"
                  placeholder="Например: Уборка комнаты, монтаж короба..."
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-text-main rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-accent-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Цена (₽)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="0"
                    value={singlePrice}
                    onChange={(e) => setSinglePrice(e.target.value)}
                    className="w-full bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-text-main rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-accent-orange pr-8 transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted pointer-events-none select-none">
                    ₽
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Количество
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    value={singleQty}
                    onChange={(e) => setSingleQty(e.target.value)}
                    className="w-full bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-text-main rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-accent-orange transition-colors"
                  />
                </div>
                <div className="pt-5 text-sm text-text-muted font-medium">шт.</div>
              </div>

              <button
                type="submit"
                className="w-full bg-black/5 dark:bg-[#1c1c1e] hover:bg-black/10 dark:hover:bg-[#252528] text-black dark:text-white border border-black/5 dark:border-white/5 font-semibold py-3 px-5 rounded-full active:scale-[0.99] transition-all shadow-sm cursor-pointer"
              >
                + Добавить единичную работу
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Container Buttons */}
      <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-[#1c1c1e] text-[#FF7A00] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-main font-heading">Контейнеры (быстрое добавление)</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {FIXED_CONTAINERS.map((cont) => {
            const isFlashed = flashedId === cont.id;
            return (
              <button
                key={cont.id}
                type="button"
                onClick={() => handleAddContainer(cont.id)}
                className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-200 active:scale-95 cursor-pointer ${
                  isFlashed
                    ? 'bg-[#FF7A00]/25 border-[#FF7A00] ring-2 ring-[#FF7A00]'
                    : 'bg-black/5 dark:bg-[#1c1c1e] border-black/5 dark:border-white/5 hover:border-[#FF7A00]/50 hover:bg-black/10 dark:hover:bg-[#252528] hover:shadow-lg'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-[#141414] text-[#FF7A00] flex items-center justify-center mb-2">
                  <Package className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <span className="text-xs font-semibold text-text-main mb-1 line-clamp-2">
                  {cont.name}
                </span>
                <span className="text-xs font-bold font-mono tabular-nums text-accent-orange">
                  {formatMoney(cont.price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Entries List */}
      <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3.5 border-b border-black/5 dark:border-white/5">
          <h3 className="text-base font-bold text-text-main font-heading">
            Выполненные работы за день
          </h3>
          <span className="text-sm font-bold font-mono tabular-nums text-accent-orange text-right">
            Итого: {formatMoney(dayTotal)}
          </span>
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/5 mt-2">
          {dayEntries.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2.5 opacity-80" strokeWidth={1.5} />
              <p className="text-sm text-text-muted font-medium">За этот день пока нет записей</p>
            </div>
          ) : (
            dayEntries.map((e) => (
              <div
                key={e.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-[#1c1c1e] px-2.5 rounded-xl transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-main truncate">
                    {e.name || findServiceById(e.service_id, services)?.name || 'Работа'}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    <span className="bg-black/5 dark:bg-[#1c1c1e] text-gray-600 dark:text-gray-400 border border-black/5 dark:border-white/5 text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-block">
                      {e.category || findServiceById(e.service_id, services)?.category || 'Общие'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs sm:text-sm text-text-muted font-mono tabular-nums">
                    {e.quantity || 1} шт.
                  </span>
                  <span className="text-sm font-bold text-text-main min-w-[70px] text-right font-mono tabular-nums">
                    {formatMoney(sumOf(e, services))}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteEntry(e.id)}
                    className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-black/5 dark:bg-[#1c1c1e] text-gray-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                    title="Удалить"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
