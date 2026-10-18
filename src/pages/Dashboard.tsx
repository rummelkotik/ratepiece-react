import React, { useState } from 'react';
import { PeriodSwitcher } from '../components/PeriodSwitcher';
import { SummaryCard } from '../components/SummaryCard';
import { ProgressRing } from '../components/ProgressRing';
import { IncomeBarChart } from '../components/charts/IncomeBarChart';
import { CountLineChart } from '../components/charts/CountLineChart';
import { CustomSelect } from '../components/CustomSelect';
import { QuickActions } from '../components/QuickActions';
import { useStore } from '../store/useStore';
import {
  aggregateEntries,
  entryCategory,
  entryName,
  filterEntriesByPeriod,
  sumOf,
} from '../lib/calc';
import { formatDisplayDate, formatMoney } from '../lib/format';
import { MONTH_NAMES_SHORT } from '../lib/constants';
import { Trash2, Search, ArrowRight, Coins, Percent, Wallet, Package } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    entries,
    services,
    settings,
    dashboardPeriod,
    dashboardDate,
    setDashboardPeriod,
    shiftDashboardPeriod,
    deleteEntry,
  } = useStore();

  const [chartMetric, setChartMetric] = useState<'earnings' | 'count'>('earnings');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Filter entries for selected dashboard period
  const periodEntries = filterEntriesByPeriod(entries, dashboardPeriod, dashboardDate);
  const periodAgg = aggregateEntries(periodEntries, services, settings.taxRate);

  // Month aggregation for Goal progress (always for current month of dashboardDate)
  const monthEntries = filterEntriesByPeriod(entries, 'month', dashboardDate);
  const monthAgg = aggregateEntries(monthEntries, services, settings.taxRate);

  // Prepare chart data based on dashboardPeriod and chartMetric
  const getChartData = () => {
    if (dashboardPeriod === 'day') {
      const val = chartMetric === 'earnings' ? periodAgg.gross : periodAgg.count;
      return [{ label: 'Выбранный день', value: val }];
    }

    if (dashboardPeriod === 'year') {
      const year = dashboardDate.getFullYear();
      return MONTH_NAMES_SHORT.map((name, monthIndex) => {
        const mEntries = entries.filter((e) => {
          if (!e.date) return false;
          const [y, m] = e.date.split('-').map(Number);
          return y === year && m - 1 === monthIndex;
        });
        const mAgg = aggregateEntries(mEntries, services, settings.taxRate);
        return {
          label: name,
          value: chartMetric === 'earnings' ? mAgg.gross : mAgg.count,
        };
      });
    }

    // Month view: days 1..daysInMonth
    const year = dashboardDate.getFullYear();
    const month = dashboardDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayEntries = periodEntries.filter((e) => {
        const [, , d] = (e.date || '').split('-').map(Number);
        return d === day;
      });
      const dAgg = aggregateEntries(dayEntries, services, settings.taxRate);
      return {
        label: String(day),
        value: chartMetric === 'earnings' ? dAgg.gross : dAgg.count,
      };
    });
  };

  // Filter history records with search
  const filteredHistory = periodEntries
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .filter((e) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const name = entryName(e, services).toLowerCase();
      const cat = entryCategory(e, services).toLowerCase();
      const proj = (e.project || '').toLowerCase();
      return name.includes(q) || cat.includes(q) || proj.includes(q);
    });

  const displayedHistory = showAllHistory ? filteredHistory : filteredHistory.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">Дашборд</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Общий обзор ваших показателей</p>
        </div>
        <PeriodSwitcher
          mode={dashboardPeriod}
          date={dashboardDate}
          onModeChange={setDashboardPeriod}
          onShift={shiftDashboardPeriod}
        />
      </div>

      {/* Bento Grid: 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <SummaryCard
            label="Чистыми"
            value={formatMoney(periodAgg.net)}
            isHighlight={true}
            icon={<Wallet className="w-5 h-5" />}
          />
        </div>
        <SummaryCard
          label="Итого (до налогов)"
          value={formatMoney(periodAgg.gross)}
          icon={<Coins className="w-5 h-5" />}
        />
        <SummaryCard
          label={`Налог (${settings.taxRate}%)`}
          value={formatMoney(periodAgg.tax)}
          icon={<Percent className="w-5 h-5" />}
        />
        <SummaryCard
          label="Сумма контейнеров"
          value={formatMoney(periodAgg.containers)}
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {/* Revolut-style Quick Actions Row */}
      <QuickActions />

      {/* Row: Analytics Chart & Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart card */}
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white font-heading">Аналитика</h3>
            <div className="w-44">
              <CustomSelect
                value={chartMetric}
                onChange={(val) => setChartMetric(val as 'earnings' | 'count')}
                options={[
                  { value: 'earnings', label: 'Заработок (₽)' },
                  { value: 'count', label: 'Количество (шт.)' },
                ]}
              />
            </div>
          </div>
          {chartMetric === 'earnings' ? (
            <IncomeBarChart data={getChartData()} unit=" ₽" color="#FF7A00" />
          ) : (
            <CountLineChart data={getChartData()} unit=" шт." color="#FFA64D" />
          )}
        </div>

        {/* Goal progress card */}
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white font-heading">Цель по доходу</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">В этом месяце</p>
          </div>
          <ProgressRing current={monthAgg.gross} target={settings.incomeGoal} />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white font-heading">История записей</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-xs sm:text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-[#FF7A00] w-40 sm:w-56 transition-colors shadow-sm"
              />
            </div>
            {filteredHistory.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-[#1c1c1e] text-[#FF7A00] hover:bg-black/10 dark:hover:bg-[#252528] flex items-center gap-1.5 transition-colors"
              >
                <span>{showAllHistory ? 'Свернуть' : 'Все записи'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs uppercase tracking-wider">
                <th className="py-3 px-3">Дата</th>
                <th className="py-3 px-3">Категория</th>
                <th className="py-3 px-3">Тип работы</th>
                <th className="py-3 px-3">Кол-во</th>
                <th className="py-3 px-3">Сумма</th>
                <th className="py-3 px-3 text-right">Действие</th>
              </tr>
            </thead>
            <tbody>
              {displayedHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Нет записей за выбранный период
                  </td>
                </tr>
              ) : (
                displayedHistory.map((e) => (
                  <tr key={e.id} className="border-b border-black/[0.04] dark:border-white/[0.04] hover:bg-[#FF7A00]/5 transition-colors duration-200">
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono tabular-nums text-xs">
                      {formatDisplayDate(e.date)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="bg-black/5 dark:bg-[#1c1c1e] text-gray-800 dark:text-gray-200 border border-black/5 dark:border-white/5 text-xs px-3 py-1 rounded-full font-semibold inline-block">
                        {entryCategory(e, services)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#1a1a1a] dark:text-white font-medium">
                      {entryName(e, services)}
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono tabular-nums text-xs">
                      {e.quantity || 1} шт.
                    </td>
                    <td className="py-3 px-3 font-bold font-mono tabular-nums text-[#1a1a1a] dark:text-white whitespace-nowrap">
                      {formatMoney(sumOf(e, services))}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteEntry(e.id)}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-black/5 dark:bg-[#1c1c1e] text-gray-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                        title="Удалить запись"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
