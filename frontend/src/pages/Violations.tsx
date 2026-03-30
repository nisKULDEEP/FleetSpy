import React from 'react';
import { useGetViolationHistoryQuery } from '../services/api/violationsApi';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import { Search, Download, Calendar, ShieldAlert, Zap, Filter } from 'lucide-react';

export const Violations = () => {
  const { data: allViolations = [], isLoading: loading } = useGetViolationHistoryQuery({});
  // const violations = allViolations.filter((v: any) => v.type === 'GEOFENCE' || v.type === 'GEOFENCE_EXIT' || v.type === 'GEOFENCE_ENTER');
  const violations = allViolations.filter((v) =>
    ['GEOFENCE_EXIT', 'GEOFENCE_ENTER', 'GEOFENCE'].includes(v.type),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-widest uppercase text-xs">
            Auditing Security Logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="motion-safe:animate-in fade-in duration-500 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display tracking-tighter">Violation History</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">
            Audit log of all security breaches, operational violations, and containment failures.
          </p>
        </div>
      </header>

      <Card>
        <div className="space-y-4">
          {violations.map((v) => (
            <div
              key={v.id}
              className="p-6 bg-surface-container-low border-l-4 border-red-600 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-surface-container-highest transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                    Security Breach
                  </span>
                  <span className="text-[10px] font-mono text-outline">{v.timestamp}</span>
                </div>
                <h4 className="font-display text-lg uppercase tracking-tight">{v.details}</h4>
                <div className="flex gap-4 mt-2">
                  <span className="text-[10px] font-bold text-outline uppercase">
                    Asset: {v.vehicle_id}
                  </span>
                  <span className="text-[10px] font-bold text-outline uppercase">
                    Zone: {v.geofence_id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
