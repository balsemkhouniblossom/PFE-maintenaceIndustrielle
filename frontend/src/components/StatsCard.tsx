'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export function StatsCard({ title, value, icon, trend, color = 'primary' }: StatsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-indigo-500 hover:bg-indigo-600';
    }
  };

  const getTrendColor = () => {
    return trend?.isPositive ? 'text-emerald-600' : 'text-red-600';
  };

  return (
    <div className="panel h-32 shadow-hover">
      <div className={`panel-header ${getColorClasses()} text-white text-xs font-semibold uppercase tracking-wide px-3 py-2 transition-colors`}>
        {title}
      </div>
      <div className="panel-content p-4 h-24">
        <div className="flex items-center justify-between h-full">
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 font-mono mb-1">
              {value}
            </div>
            {trend && (
              <div className={`text-xs font-medium uppercase tracking-wide ${getTrendColor()}`}>
                {trend.isPositive ? '▲' : '▼'} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className="text-gray-400 text-xl">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}