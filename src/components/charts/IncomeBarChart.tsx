import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface IncomeBarChartProps {
  data: Array<{ label: string; value: number }>;
  unit?: string;
  color?: string;
}

export const IncomeBarChart: React.FC<IncomeBarChartProps> = ({
  data,
  unit = ' ₽',
  color = '#FF7A00',
}) => {
  const gradientId = React.useId();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        Нет данных за выбранный период
      </div>
    );
  }

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-black/95 backdrop-blur-xl border border-[#FF7A00] rounded-xl px-3.5 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(255,122,0,0.35)] select-none">
          {label && (
            <div className="text-[11px] font-medium text-gray-400 mb-0.5">
              {label}
            </div>
          )}
          <div className="text-sm font-bold font-mono tabular-nums text-white tracking-tight flex items-baseline gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF7A00] shadow-[0_0_8px_#FF7A00]" />
            <span>{Number(val).toLocaleString('ru-RU')}{unit}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="60%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} horizontal={true} strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.12} />
          <XAxis dataKey="label" hide={true} />
          <YAxis
            stroke="#a3a3a3"
            tick={{ fill: '#a3a3a3', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : `${val}`)}
          />
          <Tooltip
            content={<CustomBarTooltip />}
            cursor={{ fill: 'rgba(255, 122, 0, 0.08)' }}
          />
          <Bar
            dataKey="value"
            fill={`url(#${gradientId})`}
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
