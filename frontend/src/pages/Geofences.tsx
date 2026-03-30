import React, { useState } from 'react';
import { useGetGeofencesQuery, useCreateGeofenceMutation } from '../services/api/geofencesApi';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import MapComponent from '@/src/components/ui/MapComponent';
import { Plus, Info, Layers, Crosshair } from 'lucide-react';

export const Geofences = () => {
  const { data: geofences = [], isLoading: loading } = useGetGeofencesQuery();
  const [createGeofence] = useCreateGeofenceMutation();
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    coordinates: [13.4, 52.52],
    radius: 500,
  });

  const handleCreateZone = async () => {
    try {
      const lat = formData.coordinates[1];
      const lng = formData.coordinates[0];
      const d = formData.radius / 111320; // rough degree approx

      const payload = {
        name: formData.name || `Zone ${Math.floor(Math.random() * 1000)}`,
        category: formData.category,
        description: `Center: ${lat}, ${lng}, Rad: ${formData.radius}m`,
        coordinates: [
          [lng - d, lat - d],
          [lng - d, lat + d],
          [lng + d, lat + d],
          [lng + d, lat - d],
          [lng - d, lat - d], // Close polygon
        ],
      };

      await createGeofence(payload).unwrap();
      fetchGeofences();
    } catch (error) {
      console.error('Failed to create geofence:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-widest uppercase text-xs">
            Calibrating Sector Grid...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="motion-safe:animate-in fade-in duration-500 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display tracking-tighter">Geofence Management</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">
            Define tactical boundaries and containment protocols for automated fleet monitoring.
          </p>
        </div>
        <Button variant="secondary" onClick={handleCreateZone} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Zone
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
          <Card title="Active Zones" subtitle="Current containment protocols">
            <div className="space-y-3 mt-4">
              {geofences.map((geo) => (
                <div
                  key={geo.id}
                  className="p-4 bg-surface-container-low border-l-4 border-primary-container hover:bg-surface-container-highest transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-display text-sm">{geo.name}</h4>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 tracking-widest uppercase ${geo.category === 'Restricted' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}
                    >
                      {geo.category === 'Restricted' ? 'Warning' : 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-outline mt-1">
                    {geo.description || 'Sector monitoring zone'}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                      {geo.category}
                    </span>
                    <Button variant="ghost" size="sm" className="text-[10px] p-0 h-auto">
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Precision Controls" subtitle="Manual coordinate entry">
            <div className="space-y-4 mt-4">
              <Input
                label="Latitude"
                value={formData.coordinates[1]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coordinates: [formData.coordinates[0], parseFloat(e.target.value)],
                  })
                }
              />
              <Input
                label="Longitude"
                value={formData.coordinates[0]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coordinates: [parseFloat(e.target.value), formData.coordinates[1]],
                  })
                }
              />
              <Input
                label="Radius (M)"
                value={formData.radius}
                type="number"
                onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
              />
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button variant="outline" className="text-[10px]">
                  Edit Shape
                </Button>
                <Button variant="secondary" className="text-[10px]" onClick={handleCreateZone}>
                  Apply Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-8">
          <Card className="p-0 overflow-hidden h-full min-h-[600px] flex flex-col">
<div className="flex-1 relative bg-surface-container-low h-full min-h-[400px]">
  <MapComponent vehicles={[]} geofences={geofences} />
</div>
</Card>
        </div>
      </div>
    </div>
  );
};
