import React from 'react';
import { Card, Button } from '@/src/components/ui/TacticalUI';
import { Play, Pause, Square } from 'lucide-react';

export const SimulationControls = ({
  vehicles,
  selectedVehicle,
  setSelectedVehicle,
  isRunning,
  speed,
  setSpeed,
  handleStart,
  handlePause,
  handleStop,
}: any) => {
  return (
    <Card title="Simulation Controls" subtitle="Configure spoofing parameters">
      <div className="space-y-4 mt-4">
        <div className="w-full space-y-1">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
            Target Vehicle
          </label>
          <select
            className="w-full bg-surface-container-low border-b-2 border-outline-variant px-4 py-3 text-sm font-sans outline-none transition-colors focus:border-primary-container"
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            disabled={isRunning}
          >
            <option value="">-- Select Unit --</option>
            {vehicles.map((v: any) => (
              <option key={v.id} value={v.id}>
                {v.vehicle_number} ({v.id})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full space-y-1 mt-4">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
            Ping Interval (ms): {speed}
          </label>
          <input
            type="range"
            min="200"
            max="3000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-primary-container"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4">
          <Button
            variant={isRunning ? 'ghost' : 'secondary'}
            className="text-[10px] px-2 py-2"
            onClick={handleStart}
            disabled={isRunning}
          >
            <Play className="w-4 h-4 mx-auto" />
          </Button>
          <Button
            variant="outline"
            className="text-[10px] px-2 py-2 border-zinc-500"
            onClick={handlePause}
            disabled={!isRunning}
          >
            <Pause className="w-4 h-4 mx-auto" />
          </Button>
          <Button
            variant="outline"
            className="text-[10px] px-2 py-2 border-red-500 text-red-500 hover:bg-red-500/10"
            onClick={handleStop}
          >
            <Square className="w-4 h-4 mx-auto" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
