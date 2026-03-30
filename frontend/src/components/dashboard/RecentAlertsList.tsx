import React from 'react';

export const RecentAlertsList = ({ recentAlerts }: { recentAlerts: any[] }) => {
  return (
    <div className="space-y-4 mt-4">
      {recentAlerts.length > 0 ? (
        recentAlerts.map((alert) => (
          <div
            key={alert.id}
            className="border-l-2 border-outline-variant pl-4 py-2 hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">
                VIOLATION
              </span>
              <span className="text-[10px] font-semibold text-outline">
                {new Date(alert.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="font-display text-sm mt-1">{alert.vehicle_id}</p>
            <p className="text-xs text-outline mt-1 leading-relaxed">{alert.details}</p>
          </div>
        ))
      ) : (
        <p className="text-xs text-outline italic">No recent alerts detected.</p>
      )}
    </div>
  );
};
