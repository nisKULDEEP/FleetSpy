import React, { useState } from 'react';
import { useGetAlertsQuery, useConfigureAlertsMutation } from '../services/api/alertsApi';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import { Bell, Zap, History, ExternalLink } from 'lucide-react';

export const Alerts = () => {
  const { data: alerts = [], isLoading: loading } = useGetAlertsQuery({});
  const [configureAlerts] = useConfigureAlertsMutation();
  const [formData, setFormData] = useState({
    type: 'SPEED_LIMIT',
    threshold: 80,
    vehicle_id: '',
  });

  const handleConfigureAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await configureAlerts(formData).unwrap();
      fetchAlerts();
    } catch (error) {
      console.error('Failed to configure alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-widest uppercase text-xs">Parsing Command Rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="motion-safe:animate-in fade-in duration-500 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display tracking-tighter">Alert Configurations</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">
            Advanced rule-based logic for autonomous fleet monitoring and precision execution.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-low p-4 text-right">
            <p className="text-2xl font-display">{alerts.length}</p>
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              Active Rules
            </p>
          </div>
          <div className="bg-surface-container-low p-4 text-right">
            <p className="text-2xl font-display">0.4s</p>
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              Latency Avg
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <Card title="Rule Logic Builder" subtitle="Configure new trigger parameters">
            <form className="space-y-6 mt-4" onSubmit={handleConfigureAlert}>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] mb-2 text-outline uppercase">
                  Asset Identifier
                </label>
                <Input
                  placeholder="e.g. veh_1"
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] mb-2 text-outline uppercase">
                  Trigger Condition
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'SPEED_LIMIT', label: 'Velocity Threshold', icon: Zap },
                    { id: 'GEOFENCE', label: 'Geofence Variance', icon: History },
                    { id: 'FUEL', label: 'Fuel Criticality', icon: Bell },
                  ].map((cond) => (
                    <div
                      key={cond.id}
                      onClick={() => setFormData({ ...formData, type: cond.id })}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${formData.type === cond.id ? 'bg-surface border-l-4 border-primary-container' : 'bg-surface-container-low hover:bg-surface-container-highest'}`}
                    >
                      <span className="text-xs font-display uppercase">{cond.label}</span>
                      <cond.icon
                        className={`w-4 h-4 ${formData.type === cond.id ? 'text-primary' : 'text-outline'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] mb-2 text-outline uppercase">
                  Threshold Value
                </label>
                <Input
                  type="number"
                  value={formData.threshold}
                  onChange={(e) =>
                    setFormData({ ...formData, threshold: parseInt(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="pt-4">
                <Button variant="primary" className="w-full" type="submit">
                  Deploy Rule
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-display tracking-[0.2em] uppercase">
                Active Command Rules
              </h3>
              <span className="text-[10px] font-bold text-outline uppercase">Auto-Refresh: 5s</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {alerts.map((rule) => (
                <div
                  key={rule.id}
                  className={`bg-surface p-6 tactical-shadow border-l-4 h-48 flex flex-col justify-between group hover:bg-surface-container-low transition-colors ${rule.type === 'SPEED_LIMIT' ? 'border-primary-container' : 'border-red-600'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${rule.type === 'SPEED_LIMIT' ? 'text-primary' : 'text-red-600'}`}
                      >
                        {rule.type}
                      </span>
                      <h4 className="text-xl font-display tracking-tighter uppercase">
                        Threshold: {rule.threshold}
                      </h4>
                    </div>
                    <div className="w-10 h-5 rounded-full p-1 flex items-center bg-on-surface justify-end">
                      <div className="w-3 h-3 bg-primary-container rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                      Asset: {rule.vehicle_id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-display tracking-[0.2em] uppercase mb-4">
              Execution History
            </h3>
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-on-surface text-surface font-display text-[10px] tracking-widest uppercase">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Rule Identifier</th>
                    <th className="p-4">Asset ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {[
                    {
                      time: '14:22:09.11',
                      rule: 'ZONE_EXIT_B',
                      asset: 'DR-092-ALPHA',
                      status: 'SENT',
                      color: 'bg-red-600',
                    },
                    {
                      time: '13:58:44.82',
                      rule: 'SPEED_VIOL_X',
                      asset: 'VT-441-OMEGA',
                      status: 'SUPPRESSED',
                      color: 'bg-outline',
                    },
                    {
                      time: '12:15:33.04',
                      rule: 'FUEL_CRIT_01',
                      asset: 'DR-112-BETA',
                      status: 'EXECUTED',
                      color: 'bg-primary',
                    },
                  ].map((log, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-4 font-mono">{log.time}</td>
                      <td className="p-4 font-bold">{log.rule}</td>
                      <td className="p-4">{log.asset}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${log.color}`} />
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <ExternalLink className="w-4 h-4 text-outline hover:text-on-surface cursor-pointer inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
