/* eslint-disable max-lines-per-function */
import React, { useEffect, useState } from 'react';
import { useGetVehiclesQuery } from '../services/api/vehiclesApi';
import { useGetGeofencesQuery } from '../services/api/geofencesApi';
import { useGetAlertsQuery } from '../services/api/alertsApi';
import { useGetViolationHistoryQuery } from '../services/api/violationsApi';
import { Card } from '@/src/components/ui/TacticalUI';
import DashboardMap from '@/src/components/ui/DashboardMap';
import { Truck, MapPin, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { socketService } from '@/src/services/sockets/socketService';

const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <Card className="flex flex-col justify-between h-full">
    <div className="flex justify-between items-start">
      <div className={cn('p-2 rounded-sm', color)}>
        <Icon className="w-5 h-5 text-on-surface" />
      </div>
      <span
        className={cn(
          'text-[10px] font-bold uppercase tracking-widest',
          trend > 0 ? 'text-emerald-600' : 'text-red-600',
        )}
      ></span>
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-semibold tracking-widest text-outline uppercase">{label}</p>
      <h3 className="text-3xl font-display mt-1">{value}</h3>
    </div>
  </Card>
);

export const Dashboard = () => {
  const { data: vehicles = [], isLoading: loadingVehicles } = useGetVehiclesQuery();
  const { data: geofences = [], isLoading: loadingGeofences } = useGetGeofencesQuery();
  const { data: alerts = [], isLoading: loadingAlerts } = useGetAlertsQuery({});
  const { data: violationHistory, isLoading: loadingViolations } = useGetViolationHistoryQuery({});

  const [stats, setStats] = useState({ vehicles: 0, geofences: 0, alerts: 0, violations: 0 });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  const loading = loadingVehicles || loadingGeofences || loadingAlerts || loadingViolations;
  const activeUnits = vehicles;

  useEffect(() => {
    setStats({
      vehicles: vehicles.length,
      geofences: geofences.length,
      alerts: alerts.length,
      violations: violationHistory?.violations?.length ?? 0,
    });
  }, [vehicles, geofences, alerts, violationHistory]);

  useEffect(() => {
    setRecentAlerts((violationHistory?.violations ?? []).slice(0, 3));
  }, [violationHistory]);

  useEffect(() => {
    const token = localStorage.getItem('fleetspy_token');
    if (!token) return;

    socketService.connect();

    const handleConnect = () => {
      console.log('Connected to FleetSpy tactical stream');
    };

    const handleAlert = (alertData: any) => {
      console.log('Received ALERT!', alertData);
      setRecentAlerts((prev) => [alertData, ...prev].slice(0, 5));
      setStats((prev) => ({ ...prev, violations: prev.violations + 1 }));
      // Optional: you can show a toast or notification here
    };

    socketService.on('connect', handleConnect);
    socketService.on('alert', handleAlert);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('alert', handleAlert);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-widest uppercase text-xs">
            Synchronizing Tactical Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="motion-safe:animate-in fade-in duration-500 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display tracking-tighter">Dashboard</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">
            Real-time fleet intelligence dashboard with live geospatial tracking, alert monitoring,
            and operational insights.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-low p-4 text-right border-r-4 border-primary-container">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              Active Vehicles
            </p>
            <p className="text-2xl font-display">{stats.vehicles}</p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-display tracking-wide mb-2">Platform Features</h3>
          <ul className="space-y-3 mt-4">
            <li className="flex items-start gap-2 text-sm text-outline/80">
              <div className="mt-1 min-w-[6px] h-1.5 w-1.5 rounded-full bg-primary" /> Real-time
              geographic positions on Tactical Map.
            </li>
            <li className="flex items-start gap-2 text-sm text-outline/80">
              <div className="mt-1 min-w-[6px] h-1.5 w-1.5 rounded-full bg-primary" /> Define custom
              boundaries and safe-zones mapping.
            </li>
            <li className="flex items-start gap-2 text-sm text-outline/80">
              <div className="mt-1 min-w-[6px] h-1.5 w-1.5 rounded-full bg-primary" /> Immutable
              event trails for audits and compliance.
            </li>
            <li className="flex items-start gap-2 text-sm text-outline/80">
              <div className="mt-1 min-w-[6px] h-1.5 w-1.5 rounded-full bg-primary" /> Manage
              operational asset inventory instantly.
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-4 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Truck}
          label="Total Vehicles"
          value={stats.vehicles}
          trend={0}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          icon={MapPin}
          label="Total Geofences"
          value={stats.geofences}
          trend={0}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          icon={Activity}
          label="Total Violations"
          value={stats.violations}
          trend={0}
          color="bg-rose-500/10 text-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px] rounded-lg overflow-hidden border border-outline/20 relative group">
          <div className="absolute inset-0 z-10 pointer-events-none border border-primary/20 rounded-lg" />
          <DashboardMap units={activeUnits} />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <Card className="h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display tracking-wide">Recent Alerts</h3>
              <span className="text-[10px] font-bold text-outline uppercase tracking-[0.3em]">
                Live
              </span>
            </div>
            <div className="space-y-3 mt-4">
              {recentAlerts.length === 0 ? (
                <p className="text-xs text-outline/80">
                  Waiting for incoming violations or historical data to populate.
                </p>
              ) : (
                recentAlerts.map((alert) => (
                  <div
                    key={alert.id || alert.alert_id || `${alert.vehicle_id}-${alert.timestamp}`}
                    className="border border-outline-variant rounded-sm bg-surface-container-low p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        {alert.vehicle_number || 'Unknown vehicle'}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-outline">
                        {alert.type || alert.event_type || 'Alert'}
                      </span>
                    </div>
                    <p className="text-xs text-outline">{alert.details || alert.geofence_name}</p>
                    {alert.timestamp && (
                      <p className="text-[10px] font-mono text-outline/90">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
