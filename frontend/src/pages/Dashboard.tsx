import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/src/components/ui/TacticalUI';
import { Truck, MapPin, AlertTriangle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';
import { api } from '@/src/services/api';

const data = [
  { name: '00:00', value: 400 },
  { name: '04:00', value: 300 },
  { name: '08:00', value: 600 },
  { name: '12:00', value: 800 },
  { name: '16:00', value: 500 },
  { name: '20:00', value: 900 },
];

const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <Card className="flex flex-col justify-between h-full">
    <div className="flex justify-between items-start">
      <div className={cn("p-2 rounded-sm", color)}>
        <Icon className="w-5 h-5 text-on-surface" />
      </div>
      <span className={cn("text-[10px] font-bold uppercase tracking-widest", trend > 0 ? "text-emerald-600" : "text-red-600")}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-semibold tracking-widest text-outline uppercase">{label}</p>
      <h3 className="text-3xl font-display mt-1">{value}</h3>
    </div>
  </Card>
);

import { cn } from '@/src/lib/utils';

import { io } from 'socket.io-client';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    vehicles: 0,
    geofences: 0,
    alerts: 0,
    violations: 0,
  });
  const [activeUnits, setActiveUnits] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicles, geofences, alerts, violations] = await Promise.all([
          api.vehicles.list(),
          api.geofences.list(),
          api.alerts.list(),
          api.violations.history(),
        ]);

        setStats({
          vehicles: vehicles.length,
          geofences: geofences.length,
          alerts: alerts.length,
          violations: violations.length,
        });
        setActiveUnits(vehicles);
        setRecentAlerts(violations.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // WebSocket Connection
    const token = localStorage.getItem('fleetspy_token');
    if (!token) return;

    const socketUrl = import.meta.env.VITE_WS_URL || window.location.origin;
    const socket = io(`${socketUrl}/ws/alerts`, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to FleetSpy tactical stream');
    });

    socket.on('alert', (alertData) => {
      console.log('Received ALERT!', alertData);
      setRecentAlerts(prev => [alertData, ...prev].slice(0, 5));
      setStats(prev => ({ ...prev, violations: prev.violations + 1 }));
      // Optional: you can show a toast or notification here
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-widest uppercase text-xs">Synchronizing Tactical Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="motion-safe:animate-in fade-in duration-500 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display tracking-tighter">Strategic Overview</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">Real-time fleet intelligence and mission-critical metrics for Sector 7 operations.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-low p-4 text-right border-r-4 border-primary-container">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Active Units</p>
            <p className="text-2xl font-display">{stats.vehicles} / 30</p>
          </div>
          <div className="bg-surface-container-low p-4 text-right border-r-4 border-emerald-600">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">System Load</p>
            <p className="text-2xl font-display">32%</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Truck} label="Fleet Utilization" value={`${Math.round((stats.vehicles / 30) * 100)}%`} trend={12} color="bg-primary-container" />
        <StatCard icon={MapPin} label="Active Missions" value={stats.vehicles} trend={-5} color="bg-surface-container-highest" />
        <StatCard icon={AlertTriangle} label="Critical Alerts" value={stats.alerts.toString().padStart(2, '0')} trend={20} color="bg-red-100" />
        <StatCard icon={Activity} label="Avg Throughput" value="1.2k" trend={8} color="bg-emerald-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="Fleet Activity" subtitle="Real-time movement tracking (24h)">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#7e775f', fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#7e775f', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '0', color: '#fff' }}
                  itemStyle={{ color: '#FFD700' }}
                />
                <Area type="monotone" dataKey="value" stroke="#705d00" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recent Alerts" subtitle="Mission critical notifications">
          <div className="space-y-4 mt-4">
            {recentAlerts.length > 0 ? recentAlerts.map((alert) => (
              <div key={alert.id} className="border-l-2 border-outline-variant pl-4 py-2 hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">VIOLATION</span>
                  <span className="text-[10px] font-semibold text-outline">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="font-display text-sm mt-1">{alert.vehicle_id}</p>
                <p className="text-xs text-outline mt-1 leading-relaxed">{alert.details}</p>
              </div>
            )) : (
              <p className="text-xs text-outline italic">No recent alerts detected.</p>
            )}
            <Button variant="ghost" className="w-full text-[10px] mt-4">View All Alerts</Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Active Units" subtitle="Live status monitoring">
          <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto pr-2">
            {activeUnits.map((unit) => (
              <div key={unit.id} className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-highest transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn("w-1 h-8", unit.status === 'In Transit' ? 'bg-emerald-500' : 'bg-primary-container')} />
                  <div>
                    <p className="font-display text-sm">{unit.vehicle_number}</p>
                    <p className="text-[10px] font-semibold text-outline uppercase">{unit.status} // {unit.speed} km/h</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px]">Track</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Tactical Map" subtitle="Sector 7 grid visualization">
          <div className="h-[400px] w-full mt-4 bg-surface-container-low relative overflow-hidden group">
            <img 
              src="https://picsum.photos/seed/tactical-map/800/600?grayscale" 
              alt="Map" 
              className="w-full h-full object-cover opacity-50 grayscale group-hover:opacity-70 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-32 h-32 border-2 border-primary-container/30 rounded-full animate-ping" />
               <div className="absolute w-2 h-2 bg-primary-container rounded-full" />
            </div>
            <div className="absolute bottom-4 right-4 bg-on-surface text-surface p-2 text-[10px] font-mono">
              GRID: 52.52N 13.40E
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
