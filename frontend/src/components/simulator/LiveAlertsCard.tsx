import React from 'react';
import { Card } from '@/src/components/ui/TacticalUI';

export const LiveAlertsCard = ({ liveAlerts }: any) => {
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
              <span className="text-error font-bold uppercase block">{alert.eventType}</span>
              <span className="text-outline block">
                {alert.vehicle.vehicleNumber} triggered zone:{' '}
                <span className="text-white">{alert.geofence.geofenceName}</span>
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
