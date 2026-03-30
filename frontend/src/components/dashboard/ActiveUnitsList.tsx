import React from 'react';
import { cn } from '@/src/lib/utils';

export const ActiveUnitsList = ({ activeUnits }: { activeUnits: any[] }) => {
  return (
    <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto pr-2">
      {activeUnits.map((unit) => (
        <div
          key={unit.id}
          className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-highest transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-1 h-8',
                unit.status === 'In Transit' ? 'bg-emerald-500' : 'bg-primary-container',
              )}
            />
            <div>
              <p className="font-display text-sm">{unit.vehicle_number}</p>
              <p className="text-[10px] font-semibold text-outline uppercase">
                {unit.status} {'//'} {unit.speed} km/h
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
