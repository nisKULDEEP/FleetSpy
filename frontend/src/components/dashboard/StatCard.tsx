import React from 'react';

export const StatCard: React.FC<any> = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-surface p-6 tactical-shadow border-l-4 border-on-surface hover:border-primary-container transition-colors group">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-none ${color} text-on-surface mb-4 inline-block`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span
          className={`text-[10px] font-bold tracking-widest ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {trend > 0 ? '+' : ''}
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-[10px] font-bold text-outline uppercase tracking-[0.2em] mb-1">{label}</h3>
    <p className="text-3xl font-display tracking-tighter group-hover:text-primary transition-colors">
      {value}
    </p>
  </div>
);
