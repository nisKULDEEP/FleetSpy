import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import { Map as MapIcon, Plus, Info, Layers, Crosshair } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '@/src/services/api';

export const Geofences = () => {
  const [geofences, setGeofences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    coordinates: [13.40, 52.52],
    radius: 500,
  });

  const fetchGeofences = async () => {
    try {
      const data = await api.geofences.list();
      setGeofences(data);
    } catch (error) {
      console.error('Failed to fetch geofences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, []);

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
          [lng - d, lat - d] // Close polygon
        ]
      };
      
      await api.geofences.create(payload);
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
          <p className="font-display tracking-widest uppercase text-xs">Calibrating Sector Grid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="motion-safe:animate-in fade-in duration-500 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display tracking-tighter">Geofence Management</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">Define tactical boundaries and containment protocols for automated fleet monitoring.</p>
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
                <div key={geo.id} className="p-4 bg-surface-container-low border-l-4 border-primary-container hover:bg-surface-container-highest transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <h4 className="font-display text-sm">{geo.name}</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 tracking-widest uppercase ${geo.category === 'Restricted' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {geo.category === 'Restricted' ? 'Warning' : 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-outline mt-1">{geo.description || 'Sector monitoring zone'}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{geo.category}</span>
                    <Button variant="ghost" size="sm" className="text-[10px] p-0 h-auto">Configure</Button>
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
                onChange={(e) => setFormData({ ...formData, coordinates: [formData.coordinates[0], parseFloat(e.target.value)] })}
              />
              <Input 
                label="Longitude" 
                value={formData.coordinates[0]} 
                onChange={(e) => setFormData({ ...formData, coordinates: [parseFloat(e.target.value), formData.coordinates[1]] })}
              />
              <Input 
                label="Radius (M)" 
                value={formData.radius} 
                type="number" 
                onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
              />
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button variant="outline" className="text-[10px]">Edit Shape</Button>
                <Button variant="secondary" className="text-[10px]" onClick={handleCreateZone}>Apply Changes</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-8">
          <Card className="p-0 overflow-hidden h-full min-h-[600px] flex flex-col">
            <div className="flex-1 relative bg-surface-container-low">
              <img 
                src="https://picsum.photos/seed/geofence-map/1200/800?grayscale" 
                alt="Tactical Map" 
                className="w-full h-full object-cover opacity-60 grayscale"
                referrerPolicy="no-referrer"
              />
              
              {/* Tactical Overlays */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[400px] h-[400px] border-2 border-primary-container rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-primary-container rounded-full" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 bg-on-surface text-primary-container px-2 py-1 text-[10px] font-bold font-mono">
                    R: {formData.radius}.00M
                  </div>
                </div>
                <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-red-500/50 bg-red-500/10" />
              </div>

              {/* Map Controls */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <button className="bg-surface w-10 h-10 flex items-center justify-center hover:bg-surface-container-low shadow-sm border border-outline-variant">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="bg-surface w-10 h-10 flex items-center justify-center hover:bg-surface-container-low shadow-sm border border-outline-variant">
                  <Layers className="w-4 h-4" />
                </button>
                <button className="bg-on-surface text-surface w-10 h-10 flex items-center justify-center shadow-sm mt-4">
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>

              {/* Legend */}
              <div className="absolute bottom-6 left-6 bg-surface/90 backdrop-blur-md p-4 border-l-4 border-primary-container max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <h4 className="font-display text-xs tracking-widest uppercase">Radar Status: Active</h4>
                </div>
                <div className="space-y-1 text-[10px] font-bold text-outline uppercase">
                  <div className="flex justify-between"><span>Active Assets</span><span className="text-on-surface">24 Units</span></div>
                  <div className="flex justify-between"><span>Breach Attempts</span><span className="text-red-600">0 (24H)</span></div>
                </div>
              </div>
            </div>
            
            <div className="bg-on-surface text-surface p-4 flex justify-between items-center font-mono text-[10px]">
              <div className="flex gap-8">
                <span>SYS_REF: GRID_S7_ALPHA</span>
                <span>CURSOR: {formData.coordinates[1]}° N, {formData.coordinates[0]}° W</span>
              </div>
              <span className="text-primary-container">ELEVATION: 248M AMSL</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
