import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { RESERVED_CATEGORY_NAME } from '../lib/constants';
import { Search, Plus, Trash2, Folder, FolderOpen, Wrench } from 'lucide-react';
import { Service } from '../lib/types';

export const Catalog: React.FC = () => {
  const {
    services,
    addService,
    updateService,
    deleteService,
    addCategory,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [newCatInput, setNewCatInput] = useState('');

  // Handle adding new category
  const handleCreateCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatInput.trim()) {
      alert('Введите название категории');
      return;
    }
    const success = addCategory(newCatInput);
    if (success) setNewCatInput('');
  };

  // Filter out fixed containers
  const catalogServices = services.filter((s) => {
    const cat = (s.category || '').toLowerCase().trim();
    return cat !== RESERVED_CATEGORY_NAME && !s.isFixed;
  });

  // Group services by category
  const groupedCategories: Record<string, Service[]> = {};
  catalogServices.forEach((s) => {
    const cat = s.category || 'Общие';
    if (!groupedCategories[cat]) groupedCategories[cat] = [];
    groupedCategories[cat].push(s);
  });

  const categoryNames = Object.keys(groupedCategories).sort();

  // Filter categories and services by search query
  const filteredCategoryNames = categoryNames.filter((cat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (cat.toLowerCase().includes(q)) return true;
    return groupedCategories[cat].some((s) => s.name.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-main font-heading">Каталог работ</h2>
        <p className="text-sm text-text-muted">Управление списком доступных работ по категориям</p>
      </div>

      {/* Toolbar: Search & Add Category */}
      <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Поиск по названию или категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-text-main rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent-orange transition-colors"
          />
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleCreateCategory} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Название новой категории..."
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            className="bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-text-main rounded-full px-4 py-2 text-sm focus:outline-none focus:border-accent-orange w-full sm:w-60 transition-colors"
          />
          <button
            type="submit"
            className="bg-[#FF7A00] text-gray-950 font-bold px-5 py-2.5 rounded-full text-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Категория</span>
          </button>
        </form>
      </div>

      {/* Categories Cards */}
      <div className="space-y-6">
        {filteredCategoryNames.length === 0 ? (
          <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3 opacity-80" strokeWidth={1.5} />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              В этой категории пока нет работ. Добавьте первую!
            </p>
          </div>
        ) : (
          filteredCategoryNames.map((cat) => {
            const items = groupedCategories[cat].filter((s) => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              return cat.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
            });

            return (
              <div
                key={cat}
                className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-black/5 dark:bg-[#1c1c1e] text-[#FF7A00] flex items-center justify-center shrink-0">
                      <Folder className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white font-heading">{cat}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">({items.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addService(cat)}
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-[#1c1c1e] text-[#FF7A00] hover:bg-black/10 dark:hover:bg-[#252528] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Добавить позицию</span>
                  </button>
                </div>

                {/* Services Rows */}
                <div className="space-y-2.5">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <FolderOpen className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2 opacity-70" strokeWidth={1.5} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        В этой категории пока нет работ. Добавьте первую!
                      </span>
                    </div>
                  ) : (
                    items.map((service) => (
                      <div
                        key={service.id}
                        className="flex flex-col p-3.5 sm:p-4 rounded-2xl bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 hover:border-[#FF7A00]/40 transition-all"
                      >
                        {/* Top: Service Name (Full width, wrapping) */}
                        <div className="w-full flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-black/10 dark:bg-[#141414] text-[#FF7A00] flex items-center justify-center shrink-0 mt-0.5">
                            <Wrench className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </div>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => updateService(service.id, { name: e.target.value })}
                            placeholder="Название работы..."
                            className="w-full bg-transparent border-0 text-text-main text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-accent-orange px-1 py-0.5 rounded-lg"
                          />
                        </div>

                        {/* Bottom: Controls Panel (Price left, Delete right) */}
                        <div className="flex items-center justify-between mt-4 gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                          {/* Price Input with integrated ₽ */}
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              inputMode="decimal"
                              value={service.price || ''}
                              onChange={(e) =>
                                updateService(service.id, {
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="0"
                              className="w-28 sm:w-32 bg-black/10 dark:bg-[#141414] border border-black/5 dark:border-white/5 text-right text-sm font-bold font-mono tabular-nums text-accent-orange focus:outline-none focus:border-accent-orange pl-3 pr-7 py-1.5 rounded-full"
                            />
                            <span className="absolute right-2.5 text-xs text-text-muted font-bold pointer-events-none select-none">
                              ₽
                            </span>
                          </div>

                          {/* Delete Button (Compact, square/round, translucent red) */}
                          <button
                            type="button"
                            onClick={() => deleteService(service.id)}
                            className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                            title="Удалить позицию"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
