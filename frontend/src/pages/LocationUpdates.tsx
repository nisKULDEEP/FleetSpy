import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polygon, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import {
  useGetVehiclesQuery,
  useGetVehicleLocationQuery,
  useUpdateVehicleLocationMutation,
} from '@/src/services/api/vehiclesApi';
import { useGetGeofencesQuery } from '@/src/services/api/geofencesApi';
import { toast } from 'sonner';

const MapClickHandler = ({
  onLocationSelect,
}: {
  onLocationSelect: (coords: [number, number]) => void;
}) => {
  useMapEvents({
    click: (event) => {
      onLocationSelect([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
};

const RecenterMap = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return null;
};

const GeofenceBounds = ({ geofences }: { geofences: any[] }) => {
  const map = useMap();

  useEffect(() => {
    const coords = geofences
      .flatMap((zone) => zone.coordinates ?? [])
      .filter((coord): coord is [number, number] => Array.isArray(coord) && coord.length === 2);

    if (coords.length === 0) return;

    map.fitBounds(coords, { padding: [32, 32], maxZoom: 15 });
  }, [geofences, map]);

  return null;
};

const FALLBACK_COORDS: [number, number] = [12.9629, 77.5775];

const formatDatetimeLocal = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
};

const formatCategoryLabel = (value?: string) => (value ? value.replace(/_/g, ' ') : 'General');

export const LocationUpdates = () => {
  const { data: vehicles = [], isLoading: loadingVehicles } = useGetVehiclesQuery();
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const { data: geofences = [] } = useGetGeofencesQuery();
  const { data: vehicleLocation, refetch: refetchVehicleLocation } = useGetVehicleLocationQuery(
    selectedVehicle,
    { skip: !selectedVehicle },
  );
  const [updateVehicleLocation] = useUpdateVehicleLocationMutation();

  const [formState, setFormState] = useState({
    latitude: FALLBACK_COORDS[0].toString(),
    longitude: FALLBACK_COORDS[1].toString(),
    timestamp: '',
  });
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(FALLBACK_COORDS);
  const [activeGeofences, setActiveGeofences] = useState<any[]>([]);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0].id);
    }
  }, [vehicles, selectedVehicle]);

  useEffect(() => {
    if (!vehicleLocation?.current_location) return;
    setFormState({
      latitude: vehicleLocation.current_location.latitude?.toString() ?? '',
      longitude: vehicleLocation.current_location.longitude?.toString() ?? '',
      timestamp: formatDatetimeLocal(vehicleLocation.current_location.timestamp),
    });
    setMarkerPosition([
      vehicleLocation.current_location.latitude,
      vehicleLocation.current_location.longitude,
    ]);
    setActiveGeofences(vehicleLocation.current_geofences || []);
  }, [vehicleLocation]);

  useEffect(() => {
    const lat = Number(formState.latitude);
    const lng = Number(formState.longitude);
    if (
      formState.latitude.trim() !== '' &&
      formState.longitude.trim() !== '' &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng)
    ) {
      setMarkerPosition([lat, lng]);
    }
  }, [formState.latitude, formState.longitude]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedVehicle) {
      toast.error('Select a vehicle to update.');
      return;
    }
    const payload = {
      vehicle_id: selectedVehicle,
      latitude: Number(formState.latitude),
      longitude: Number(formState.longitude),
      timestamp: formState.timestamp
        ? new Date(formState.timestamp).toISOString()
        : new Date().toISOString(),
    };
    if (Number.isNaN(payload.latitude) || Number.isNaN(payload.longitude)) {
      toast.error('Provide valid coordinates.');
      return;
    }

    try {
      const response = await updateVehicleLocation(payload).unwrap();
      setMarkerPosition([payload.latitude, payload.longitude]);
      setActiveGeofences(response.current_geofences || []);
      toast.success('Vehicle location updated');
      refetchVehicleLocation();
    } catch (error) {
      console.error('Location update failed:', error);
      toast.error('Failed to update location');
    }
  };

  const handleMapSelection = (coords: [number, number]) => {
    setFormState((prev) => ({
      ...prev,
      latitude: coords[0].toString(),
      longitude: coords[1].toString(),
    }));
    setMarkerPosition(coords);
  };

  return (
    <div className="motion-safe:animate-in fade-in duration-500 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display tracking-tighter">Location Updates</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">
            Issue ad-hoc telemetry pings and observe which geometries the asset is inside.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
          <Card title="Telemetry Override" subtitle="Set the coordinates, timestamp, and vehicle">
            <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] mb-2 text-outline uppercase">
                  Vehicle
                </label>
                <select
                  className="w-full border border-outline-variant rounded bg-surface p-3 text-sm"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle: { id: string; vehicle_number: string }) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  label="Latitude"
                  placeholder="37.7749"
                  value={formState.latitude}
                  onChange={(e) => setFormState((prev) => ({ ...prev, latitude: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Input
                  label="Longitude"
                  placeholder="-122.4194"
                  value={formState.longitude}
                  onChange={(e) => setFormState((prev) => ({ ...prev, longitude: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Input
                  label="Timestamp"
                  type="datetime-local"
                  value={formState.timestamp}
                  onChange={(e) => setFormState((prev) => ({ ...prev, timestamp: e.target.value }))}
                />
              </div>
              <div>
                <Button variant="primary" className="w-full" type="submit">
                  Push Location
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Geofence Status" subtitle="Zones the selected vehicle currently touches">
            <div className="space-y-3 mt-4">
              {activeGeofences.length === 0 ? (
                <p className="text-[10px] text-outline uppercase tracking-[0.2em]">
                  Vehicle is not inside any known zone.
                </p>
              ) : (
                activeGeofences.map((zone) => (
                  <div
                    key={zone.geofence_id}
                    className="flex items-center justify-between text-[10px]"
                  >
                    <div>
                      <p className="font-bold uppercase tracking-[0.3em]">{zone.geofence_id}</p>
                      <p className="text-xs text-outline">{zone.geofence_name}</p>
                    </div>
                    <span
                      className="text-[10px] font-semibold"
                      title={formatCategoryLabel(zone.category)}
                    >
                      {formatCategoryLabel(zone.category)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="xl:col-span-8">
          <Card className="p-0 overflow-hidden h-full min-h-[600px]">
            <div className="bg-surface-container-low h-full min-h-[460px]">
              <MapContainer
                center={markerPosition || FALLBACK_COORDS}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {geofences.map(
                  (zone: { id: string; coordinates: [number, number][]; category?: string }) => (
                    <Polygon
                      key={zone.id}
                      positions={zone.coordinates}
                      pathOptions={{
                        color: zone.category?.toLowerCase().includes('restricted')
                          ? '#ef4444'
                          : '#FFD700',
                        fillColor: zone.category?.toLowerCase().includes('restricted')
                          ? '#ef4444'
                          : '#FFD700',
                        fillOpacity: 0.4,
                      }}
                    />
                  ),
                )}
                {markerPosition && <Marker position={markerPosition} />}
                <RecenterMap position={markerPosition} />
                <MapClickHandler onLocationSelect={handleMapSelection} />
                <GeofenceBounds geofences={geofences} />
              </MapContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
