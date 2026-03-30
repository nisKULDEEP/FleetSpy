import React from 'react';
import { Card } from '@/src/components/ui/TacticalUI';
import { cn } from '@/src/lib/utils';

export const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <Card className="flex flex-col justify-between h-full">
    <div className="flex justify-between items-start">
      <div className={cn('p-2 rounded-sm', color)}>
        <Icon className="w-5 h-5 text-on-surface" />
      </div>
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-semibold tracking-widest text-outline uppercase">{label}</p>
      <h3 className="text-3xl font-display mt-1">{value}</h3>
    </div>
  </Card>
);
