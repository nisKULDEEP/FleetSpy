import React, { useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap } from 'react-leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import 'leaflet/dist/leaflet.css';

const GeomanSetup = ({
  onShapeCreated,
}: {
  onShapeCreated: (coords: [number, number][]) => void;
}) => {
  const map = useMap();
  useEffect(() => {
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: true,
      drawCircle: false,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
    });

    const handleCreate = (e: any) => {
      const layer = e.layer;
      const latlngs = layer.getLatLngs ? layer.getLatLngs()[0] : [layer.getLatLng()];
      const coords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
      if (coords.length > 0 && e.shape !== 'Marker') {
        coords.push(coords[0]); // close the polygon
      }
      onShapeCreated(coords);
    };

    map.on('pm:create', handleCreate);

    return () => {
      map.pm.removeControls();
      map.off('pm:create', handleCreate);
    };
  }, [map, onShapeCreated]);

  return null;
};

export const MapComponent = ({
  geofences,
  onShapeCreated,
  center = [52.52, 13.4],
}: {
  geofences: any[];
  onShapeCreated: (coords: [number, number][]) => void;
  center?: number[];
}) => {
  return (
    <MapContainer
      center={center as [number, number]}
      zoom={13}
      style={{ height: '100%', width: '100%', zIndex: 1 }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FeatureGroup>
        {geofences.map((target) =>
          target.coordinates ? (
            <Polygon
              key={target.id}
              positions={target.coordinates}
              pathOptions={{
                color: target.category === 'Restricted' ? '#ef4444' : '#FFD700',
                fillColor: target.category === 'Restricted' ? '#ef4444' : '#FFD700',
              }}
            />
          ) : null,
        )}
      </FeatureGroup>
      <GeomanSetup onShapeCreated={onShapeCreated} />
    </MapContainer>
  );
};
export default MapComponent;
