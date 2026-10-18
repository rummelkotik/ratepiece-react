import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PIE_COLORS } from '../../lib/constants';
import { formatMoney } from '../../lib/format';

interface CategoryDoughnutProps {
  data: Record<string, number>;
  totalGross: number;
}

export const CategoryDoughnut: React.FC<CategoryDoughnutProps> = ({
  data,
  totalGross,
}) => {
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  if (chartData.length === 0 || totalGross === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        Нет данных для категорий
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Chart */}
      <div className="w-48 h-48 relative flex-shrink-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
                borderColor: '#FF7A00',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                color: '#FFFFFF',
                fontSize: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 15px rgba(255,122,0,0.3)',
              }}
              formatter={(value: number) => [formatMoney(value), '']}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Gross Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Итого</span>
          <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-[#1a1a1a] dark:text-white truncate max-w-[100px]">
            {formatMoney(totalGross)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2 overflow-y-auto max-h-48 pr-1">
        {chartData.map((item, index) => {
          const color = PIE_COLORS[index % PIE_COLORS.length];
          const percent = totalGross > 0 ? Math.round((item.value / totalGross) * 100) : 0;
          return (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-border-card/40 last:border-0"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-text-main truncate font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 text-text-muted">
                <span>{percent}%</span>
                <span className="font-semibold text-text-main">{formatMoney(item.value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
