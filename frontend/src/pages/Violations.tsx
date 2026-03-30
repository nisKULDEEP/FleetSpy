import React from 'react';
import { useGetViolationHistoryQuery } from '../services/api/violationsApi';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import { Search, Download, Calendar, ShieldAlert, Zap, Filter } from 'lucide-react';

export const Violations = () => {
  const { data: violations = [], isLoading: loading } = useGetViolationHistoryQuery({});

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
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Audit Log
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Critical Breaches
            </span>
          </div>
          <h3 className="text-3xl font-display">{violations.length}</h3>
          <p className="text-xs text-red-600/70 mt-1">Last 24 hours</p>
        </Card>
        <Card>
          <div className="flex items-center gap-3 text-primary mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Speed Violations
            </span>
          </div>
          <h3 className="text-3xl font-display">48</h3>
          <p className="text-xs text-outline mt-1">Last 24 hours</p>
        </Card>
        <Card>
          <div className="flex items-center gap-3 text-outline mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Incidents</span>
          </div>
          <h3 className="text-3xl font-display">156</h3>
          <p className="text-xs text-outline mt-1">Current month</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <Input placeholder="Filter by Asset ID or Zone..." className="pl-12" />
          </div>
          <div className="flex gap-2">
            <Input type="date" className="w-auto" />
            <Button variant="ghost">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

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
              <Button variant="outline" size="sm" className="text-[10px]">
                View Details
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-outline-variant flex justify-between items-center text-[10px] font-bold text-outline uppercase tracking-widest">
          <span>Showing {violations.length} of 156 incidents</span>
          <div className="flex gap-4">
            <button className="hover:text-on-surface disabled:opacity-30" disabled>
              Previous
            </button>
            <button className="hover:text-on-surface">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
};
