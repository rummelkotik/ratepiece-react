import React from 'react';
import { useStore } from '../store/useStore';
import { PeriodSwitcher } from '../components/PeriodSwitcher';
import { SummaryCard } from '../components/SummaryCard';
import { IncomeBarChart } from '../components/charts/IncomeBarChart';
import { CategoryDoughnut } from '../components/charts/CategoryDoughnut';
import {
  aggregateEntries,
  filterEntriesByPeriod,
  getTopWork,
  shiftPeriodRef,
} from '../lib/calc';
import { formatMoney, formatTrend } from '../lib/format';
import { MONTH_NAMES_SHORT } from '../lib/constants';
import { TrendingUp, Award, Layers, DollarSign, FolderOpen } from 'lucide-react';

export const Analytics: React.FC = () => {
  const {
    entries,
    services,
    settings,
    analyticsPeriod,
    analyticsDate,
    setAnalyticsPeriod,
    shiftAnalyticsPeriod,
  } = useStore();

  // Current period entries & aggregation
  const currentEntries = filterEntriesByPeriod(entries, analyticsPeriod, analyticsDate);
  const currentAgg = aggregateEntries(currentEntries, services, settings.taxRate);

  // Previous period entries & aggregation for trends
  const prevDate = shiftPeriodRef(analyticsPeriod, analyticsDate, -1);
  const prevEntries = filterEntriesByPeriod(entries, analyticsPeriod, prevDate);
  const prevAgg = aggregateEntries(prevEntries, services, settings.taxRate);

  // Averages and top work: Average daily earnings based on unique working days
  const currentUniqueDays = new Set(currentEntries.map((e) => e.date).filter(Boolean)).size;
  const avgEarnings = currentUniqueDays > 0 ? currentAgg.gross / currentUniqueDays : 0;

  const prevUniqueDays = new Set(prevEntries.map((e) => e.date).filter(Boolean)).size;
  const prevAvgEarnings = prevUniqueDays > 0 ? prevAgg.gross / prevUniqueDays : 0;

  const topWork = getTopWork(currentAgg.byWork);

  // Chart data: Income by Days (for selected month)
  const daysInMonth = new Date(
    analyticsDate.getFullYear(),
    analyticsDate.getMonth() + 1,
    0
  ).getDate();

  const daysChartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      label: String(day),
      value: currentAgg.byDay[day] || 0,
    };
  });

  // Chart data: Income by Months (for selected year)
  const monthsChartData = MONTH_NAMES_SHORT.map((name, monthIndex) => ({
    label: name,
    value: currentAgg.byMonth[monthIndex] || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">Аналитика</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Подробная статистика по вашим доходам и работе</p>
        </div>
        <PeriodSwitcher
          mode={analyticsPeriod}
          date={analyticsDate}
          onModeChange={setAnalyticsPeriod}
          onShift={shiftAnalyticsPeriod}
        />
      </div>

      {/* 4 KPI Metrics with Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Общий доход"
          value={formatMoney(currentAgg.gross)}
          trend={formatTrend(currentAgg.gross, prevAgg.gross)}
          color="orange"
          isHighlight={true}
          icon={<DollarSign className="w-5 h-5 text-accent-orange" />}
        />
        <SummaryCard
          label="Кол-во работ"
          value={`${currentAgg.count} шт.`}
          trend={formatTrend(currentAgg.count, prevAgg.count)}
          color="default"
          icon={<Layers className="w-5 h-5 text-accent-orange" />}
        />
        <SummaryCard
          label="Средний в день"
          value={formatMoney(avgEarnings)}
          trend={formatTrend(avgEarnings, prevAvgEarnings)}
          color="orange"
          icon={<TrendingUp className="w-5 h-5 text-accent-orange" />}
        />
        <SummaryCard
          label="Самая прибыльная"
          value={topWork.name}
          subtext={formatMoney(topWork.sum)}
          valueClassName="text-sm font-semibold truncate"
          color="default"
          icon={<Award className="w-5 h-5 text-accent-orange" />}
        />
      </div>

      {/* 2 Charts: Days & Months */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white font-heading">Доход по дням</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Текущий месяц</span>
          </div>
          <IncomeBarChart data={daysChartData} unit=" ₽" color="#FF7A00" />
        </div>
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white font-heading">Доход по месяцам</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Годовая динамика</span>
          </div>
          <IncomeBarChart data={monthsChartData} unit=" ₽" color="#FFA64D" />
        </div>
      </div>

      {/* Split Row: Category Doughnut & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Doughnut Chart */}
        <div className="lg:col-span-2 bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-w-0">
          <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white font-heading mb-4">Доход по видам работ</h3>
          <CategoryDoughnut data={currentAgg.byCategory} totalGross={currentAgg.gross} />
        </div>

        {/* Key Indicators */}
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-w-0">
          <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white font-heading mb-4">Ключевые показатели</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-[#141414] text-[#FF7A00] flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Всего выполнено единиц</span>
                <span className="text-base font-bold font-mono tabular-nums text-[#1a1a1a] dark:text-white font-heading">{currentAgg.count} шт.</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-[#141414] text-[#FF7A00] flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Средний заработок в день</span>
                <span className="text-base font-bold font-mono tabular-nums text-[#1a1a1a] dark:text-white font-heading">{formatMoney(avgEarnings)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-[#141414] text-[#FF7A00] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Самая прибыльная работа</span>
                <span title={topWork.name} className="text-sm font-bold text-[#1a1a1a] dark:text-white truncate block font-heading">
                  {topWork.name}
                </span>
                <span className="text-xs text-accent-orange font-bold font-mono tabular-nums">
                  {formatMoney(topWork.sum)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Summary Tables: Main Works & Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Works */}
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white font-heading mb-3.5">Основные работы</h3>
          {currentAgg.rowsMain.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2.5 opacity-80" strokeWidth={1.5} />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">За этот период нет данных</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Категория</th>
                    <th className="py-2.5 px-3">Тип работы</th>
                    <th className="py-2.5 px-3 text-center">Кол-во</th>
                    <th className="py-2.5 px-3 text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {currentAgg.rowsMain.map((r, i) => (
                    <tr key={i} className="hover:bg-accent-orange/[0.04] transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="bg-black/5 dark:bg-[#1c1c1e] text-gray-800 dark:text-gray-200 border border-black/5 dark:border-white/5 text-xs px-3 py-1 rounded-full font-semibold inline-block">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#1a1a1a] dark:text-white">{r.name}</td>
                      <td className="py-2.5 px-3 text-center text-gray-500 dark:text-gray-400 font-mono tabular-nums">{r.quantity} шт.</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono tabular-nums text-[#1a1a1a] dark:text-white">
                        {formatMoney(r.totalSum)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Containers */}
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white font-heading mb-3.5">Контейнеры</h3>
          {currentAgg.rowsFrames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2.5 opacity-80" strokeWidth={1.5} />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">За этот период нет данных</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Категория</th>
                    <th className="py-2.5 px-3">Тип работы</th>
                    <th className="py-2.5 px-3 text-center">Кол-во</th>
                    <th className="py-2.5 px-3 text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {currentAgg.rowsFrames.map((r, i) => (
                    <tr key={i} className="hover:bg-accent-orange/[0.04] transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="bg-black/5 dark:bg-[#1c1c1e] text-gray-800 dark:text-gray-200 border border-black/5 dark:border-white/5 text-xs px-3 py-1 rounded-full font-semibold inline-block">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#1a1a1a] dark:text-white">{r.name}</td>
                      <td className="py-2.5 px-3 text-center text-gray-500 dark:text-gray-400 font-mono tabular-nums">{r.quantity} шт.</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono tabular-nums text-[#1a1a1a] dark:text-white">
                        {formatMoney(r.totalSum)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
