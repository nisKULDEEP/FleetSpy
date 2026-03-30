/* eslint-disable max-lines-per-function */
import React, { useEffect } from 'react';
import { useGetVehiclesQuery } from '../services/api/vehiclesApi';
import { useGetGeofencesQuery } from '../services/api/geofencesApi';
import { useGetAlertsQuery } from '../services/api/alertsApi';
import { useGetViolationHistoryQuery } from '../services/api/violationsApi';
import { Card, Button } from '@/src/components/ui/TacticalUI';
import DashboardMap from '@/src/components/ui/DashboardMap';
import { Truck, MapPin, AlertTriangle, Activity } from 'lucide-react';

const chartData = [
  { name: '00:00', value: 0 },
  { name: '06:00', value: 0 },
  { name: '12:00', value: 0 },
  { name: '18:00', value: 0 },
];

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
      >
        {trend > 0 ? '+' : ''}
        {trend}%
      </span>
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-semibold tracking-widest text-outline uppercase">{label}</p>
      <h3 className="text-3xl font-display mt-1">{value}</h3>
    </div>
  </Card>
);

import { cn } from '@/src/lib/utils';

import { socketService } from '@/src/services/sockets/socketService';

export const Dashboard = () => {
  const { data: vehicles = [], isLoading: loadingVehicles } = useGetVehiclesQuery();
  const { data: geofences = [], isLoading: loadingGeofences } = useGetGeofencesQuery();
  const { data: alerts = [], isLoading: loadingAlerts } = useGetAlertsQuery({});
  const { data: violations = [], isLoading: loadingViolations } = useGetViolationHistoryQuery({});

  const loading = loadingVehicles || loadingGeofences || loadingAlerts || loadingViolations;

  const stats = {
    vehicles: vehicles.length,
    geofences: geofences.length,
    alerts: alerts.length,
    violations: violations.length,
  };
  const activeUnits = vehicles;
  const recentAlerts = violations.slice(0, 3);

  useEffect(() => {
    {
      /* WebSocket Connection */
    }
    const token = localStorage.getItem('fleetspy_token');
    if (!token) return;

    socketService.connect();

    const handleConnect = () => {
      console.log('Connected to FleetSpy tactical stream');
    };

    const handleAlert = (alertData: any) => {
      console.log('Received ALERT!', alertData);
      // setRecentAlerts((prev) => [alertData, ...prev].slice(0, 5));
      // setStats((prev) => ({ ...prev, violations: prev.violations + 1 }));
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
          <h1 className="text-5xl font-display tracking-tighter">Strategic Overview</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">
            Real-time fleet intelligence and mission-critical metrics for Sector 7 operations.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-low p-4 text-right border-r-4 border-primary-container">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              Active Units
            </p>
            <p className="text-2xl font-display">{stats.vehicles} / 30</p>
          </div>
          <div className="bg-surface-container-low p-4 text-right border-r-4 border-emerald-600">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              System Load
            </p>
            <p className="text-2xl font-display">32%</p>
          </div>
        </div>
      </header>

      
      
      <div className="grid grid-cols-1 md:grid-cols-2 mt-4 lg:grid-cols-4 gap-6">
        <StatCard icon={Truck} label="Total Vehicles" value={stats.vehicles} trend={0} color="bg-blue-500/10 text-blue-500" />
        <StatCard icon={MapPin} label="Total Geofences" value={stats.geofences} trend={0} color="bg-emerald-500/10 text-emerald-500" />
        <StatCard icon={AlertTriangle} label="Total Alert Rules" value={stats.alerts} trend={0} color="bg-amber-500/10 text-amber-500" />
        <StatCard icon={Activity} label="Total Violations" value={stats.violations} trend={0} color="bg-rose-500/10 text-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px] rounded-lg overflow-hidden border border-outline/20 relative group">
          <div className="absolute inset-0 z-10 pointer-events-none border border-primary/20 rounded-lg" />
          <DashboardMap units={activeUnits} />
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-display tracking-wide mb-2">FleetSpy Platform</h3>
            <p className="text-sm text-outline/80 leading-relaxed mb-4">
              Advanced real-time fleet tracking, geofencing, and automated alert monitoring platform. Build strict supervision over mission critical assets with fast updates and boundary enforcement.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-display tracking-wide mb-2">Platform Features</h3>
            <ul className="space-y-3 mt-4">
              <li className="flex items-start gap-2 text-sm text-outline/80">
                 <div className="mt-1 min-w-[6px] h-1.5 w-1.5 rounded-full bg-primary" /> Real-time geographic positions on Tactical Map.
              </li>
              <li className="flex items-start gap-2 text-sm text-outline/80">
                 <div className="mt-1 min-w-[6px] h-1.5 w-1.5 rounded-full bg-primary" /> Define custom boundaries and safe-zones mapping.
              </li>
              <li className="flex items-start gap-2 text-sm text-outline/80">
                 <div className="mt-1 min-w-[6px] h-1.5 w-1.5 rounded-full bg-primary" /> Immutable event trails for audits and compliance.
              </li>
              <li className="flex items-start gap-2 text-sm text-outline/80">
                 <div className="mt-1 min-w-[6px] h-1.5 w-1.5 rounded-full bg-primary" /> Manage operational asset inventory instantly.
              </li>
            </ul>
          </Card>
        </div>
      </div>

    </div>
  );
};
