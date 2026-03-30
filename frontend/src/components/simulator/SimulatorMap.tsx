import React from 'react';
import { Card } from '@/src/components/ui/TacticalUI';
import { MapContainer, TileLayer, Marker, Polyline, FeatureGroup, Polygon } from 'react-leaflet';

export const SimulatorMap = ({ route, geofences, step, vehicleIcon }: any) => {
  return (
    <Card className="p-0 overflow-hidden h-full min-h-[600px] flex flex-col relative">
      <div className="flex-1 relative bg-surface-container-low z-0">
        <MapContainer
          center={route[0] as [number, number]}
          zoom={15}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FeatureGroup>
            {geofences.map((target: any) =>
              target.coordinates ? (
                <Polygon
                  key={target.id}
                  positions={target.coordinates}
                  pathOptions={{
                    color: target.category === 'Restricted' ? '#ef4444' : '#10b981',
                    fillColor: target.category === 'Restricted' ? '#ef4444' : '#10b981',
                  }}
                />
              ) : null,
            )}
          </FeatureGroup>
          <Polyline
            positions={route}
            pathOptions={{ color: '#FFD700', dashArray: '5, 10', weight: 4 }}
          />

          {step > 0 && route[step - 1] && (
            <Marker position={route[step - 1] as [number, number]} icon={vehicleIcon} />
          )}
        </MapContainer>
      </div>
    </Card>
  );
};
