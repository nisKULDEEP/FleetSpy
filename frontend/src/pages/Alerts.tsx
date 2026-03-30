import React, { useState } from 'react';
import { useGetAlertsQuery, useConfigureAlertsMutation } from '../services/api/alertsApi';
import { useGetGeofencesQuery } from '../services/api/geofencesApi';
import { useGetVehiclesQuery } from '../services/api/vehiclesApi';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const EVENT_TYPES = [
  { label: 'Entry', value: 'entry' },
  { label: 'Exit', value: 'exit' },
  { label: 'Entry + Exit', value: 'both' },
];

export const Alerts = () => {
  const [formData, setFormData] = useState({
    geofence_id: '',
    vehicle_id: '',
    event_type: 'entry',
  });
  const [alertFilters, setAlertFilters] = useState({ geofence_id: '', vehicle_id: '' });

  const { data: geofences = [] } = useGetGeofencesQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();
  const { data: alerts = [], isLoading: alertsLoading } = useGetAlertsQuery(alertFilters);
  const [configureAlerts] = useConfigureAlertsMutation();

  const handleConfigureAlert = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.geofence_id || !formData.event_type) {
      toast.error('Choose a geofence and event type first.');
      return;
    }
    const payload: Record<string, string> = {
      geofence_id: formData.geofence_id,
      event_type: formData.event_type,
    };
    if (formData.vehicle_id) {
      payload.vehicle_id = formData.vehicle_id;
    }

    try {
      await configureAlerts(payload).unwrap();
      toast.success('Alert rule configured');
      setFormData({ geofence_id: '', vehicle_id: '', event_type: 'entry' });
      setAlertFilters({ geofence_id: '', vehicle_id: '' });
    } catch (error) {
      console.error('Failed to configure alert:', error);
      toast.error('Could not save alert rule.');
    }
  };

  const handleFilterChange = (field: keyof typeof alertFilters, value: string) => {
    setAlertFilters((prev) => ({ ...prev, [field]: value }));
  };

  if (alertsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-widest uppercase text-xs">Aligning Alert Mesh...</p>
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
            Tune the telemetry rules that trigger mission-critical notifications.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Rule Logic Builder" subtitle="Associate vehicles with geofences">
            <form className="space-y-6 mt-4" onSubmit={handleConfigureAlert}>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] mb-2 text-outline uppercase">
                  Geofence
                </label>
                <select
                  className="w-full bg-surface border border-outline-variant rounded p-3 text-sm"
                  value={formData.geofence_id}
                  onChange={(e) => setFormData({ ...formData, geofence_id: e.target.value })}
                  required
                >
                  <option value="">Select a geofence</option>
                  {geofences.map((geo) => (
                    <option key={geo.id} value={geo.id}>
                      {geo.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] mb-2 text-outline uppercase">
                  Vehicle (optional)
                </label>
                <select
                  className="w-full bg-surface border border-outline-variant rounded p-3 text-sm"
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                >
                  <option value="">All vehicles</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] mb-2 text-outline uppercase">
                  Event Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, event_type: type.value })}
                      className={`px-3 py-2 rounded text-[10px] uppercase tracking-[0.2em] font-bold border ${
                        formData.event_type === type.value
                          ? 'border-primary-container bg-primary-container/20 text-primary-container'
                          : 'border-outline-variant text-outline'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button variant="primary" className="w-full" type="submit">
                  Deploy Rule
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Filter Alerts" subtitle="Narrow down the active rules">
            <div className="space-y-4 mt-4">
              <div>
                <Input
                  label="Geofence"
                  placeholder="Filter by geofence"
                  value={alertFilters.geofence_id}
                  onChange={(e) => handleFilterChange('geofence_id', e.target.value)}
                  list="geofence-options"
                />
                <datalist id="geofence-options">
                  {geofences.map((geo) => (
                    <option key={geo.id} value={geo.id}>
                      {geo.name}
                    </option>
                  ))}
                </datalist>
              </div>
              <div>
                <Input
                  label="Vehicle"
                  placeholder="Filter by vehicle"
                  value={alertFilters.vehicle_id}
                  onChange={(e) => handleFilterChange('vehicle_id', e.target.value)}
                  list="vehicle-options"
                />
                <datalist id="vehicle-options">
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number}
                    </option>
                  ))}
                </datalist>
              </div>
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setAlertFilters({ geofence_id: '', vehicle_id: '' })}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Active Alert Rules" subtitle={`Showing ${alerts.length} rules`}>
            <div className="space-y-4 mt-4">
              {alerts.length === 0 ? (
                <div className="text-outline text-xs text-center py-8">
                  No alert rules match the criteria.
                </div>
              ) : (
                alerts.map((rule) => (
                  <div
                    key={rule.alert_id}
                    className="bg-surface-container-low border-l-4 border-primary-container p-4 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-outline font-bold">
                          {rule.status}
                        </p>
                        <h4 className="font-display text-lg uppercase tracking-tight">
                          {rule.geofence_name}
                        </h4>
                      </div>
                      <ExternalLink className="w-4 h-4 text-outline" />
                    </div>
                    <div className="flex flex-wrap gap-4 text-[10px] text-outline uppercase tracking-[0.3em]">
                      <span>Vehicle: {rule.vehicle_number || 'All Vehicles'}</span>
                      <span>Event: {rule.event_type}</span>
                    </div>
                    <p className="text-[10px] text-outline">
                      Created {new Date(rule.created_at).toLocaleString()}
                    </p>
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
