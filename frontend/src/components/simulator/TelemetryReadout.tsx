import React from 'react';
import { Card } from '@/src/components/ui/TacticalUI';
import { Activity } from 'lucide-react';

export const TelemetryReadout = ({ step, routeLength, currentStatus, isRunning }: any) => {
  return (
    <Card title="Telemetry Readout" subtitle="Live spoofed ping status">
      <div className="space-y-4 mt-4 bg-on-surface text-emerald-500 font-mono text-xs p-4 h-48 overflow-y-auto">
        <div>
          <strong>STEP:</strong> {step} / {routeLength}
        </div>
        <div>
          <strong>LAT:</strong> {currentStatus.lastLat ? currentStatus.lastLat.toFixed(6) : 'N/A'}
        </div>
        <div>
          <strong>LNG:</strong> {currentStatus.lastLng ? currentStatus.lastLng.toFixed(6) : 'N/A'}
        </div>
        <div>
          <strong>ZONE:</strong>
          {currentStatus.insideGeofences.length > 0 ? (
            <span className="text-red-400 font-bold uppercase ml-2 animate-pulse">
              {currentStatus.insideGeofences.join(', ')}
            </span>
          ) : (
            <span className="text-outline uppercase ml-2">Clear</span>
          )}
        </div>
        {isRunning && (
          <div className="mt-4 animate-pulse flex items-center gap-2">
            <Activity className="w-4 h-4" /> TRANSMITTING...
          </div>
        )}
      </div>
    </Card>
  );
};
