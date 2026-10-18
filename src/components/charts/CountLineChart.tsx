import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface CountLineChartProps {
  data: Array<{ label: string; value: number }>;
  unit?: string;
  color?: string;
}

export const CountLineChart: React.FC<CountLineChartProps> = ({
  data,
  unit = ' шт.',
  color = '#FFA64D',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        Нет данных за выбранный период
      </div>
    );
  }

  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-white/95 dark:bg-black/90 backdrop-blur-xl border border-[#FF7A00] rounded-xl px-3.5 py-2 shadow-lg shadow-black/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(255,122,0,0.35)] select-none">
          {label && (
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
              {label}
            </div>
          )}
          <div className="text-sm font-bold text-gray-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
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
        <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid vertical={false} horizontal={true} strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.12} />
          <XAxis dataKey="label" hide={true} />
          <YAxis
            stroke="#71717A"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomLineTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#FF7A00' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
