import React from 'react';
import { Card } from '@/src/components/ui/TacticalUI';

export const LiveAlertsCard = ({ liveAlerts }: any) => {
  const formatLocation = (alert: any) => {
    if (!alert?.location) return 'Location unknown';
    return `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}`;
  };

  return (
    <Card title="Live Alerts" subtitle="Websocket Realtime Monitoring">
      <div className="space-y-2 mt-4 bg-on-surface p-4 h-48 overflow-y-auto">
        {liveAlerts.length === 0 ? (
          <div className="text-outline text-xs text-center mt-8">Awaiting Signal...</div>
        ) : (
          liveAlerts.map((alert: any, idx: number) => (
            <div
              key={idx}
              className="bg-surface-container/50 border-l-2 border-error p-2 text-[10px]"
            >
              <div className="flex justify-between items-center">
                <span className="text-error font-bold uppercase tracking-[0.2em]">
                  {alert.eventType?.toUpperCase()}
                </span>
                <span className="text-outline text-[10px]">
                  {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : '—'}
                </span>
              </div>
              <p className="text-xs text-white font-semibold leading-snug">
                {alert.vehicle?.vehicleNumber} in{' '}
                <span className="text-primary-container">{alert.geofence?.geofenceName}</span>
              </p>
              <p className="text-[10px] text-outline">
                {alert.geofence?.category || 'General'} — {formatLocation(alert)}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
