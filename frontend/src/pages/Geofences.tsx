/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import MapComponent from '@/src/components/ui/MapComponent';
import {
  useCreateGeofenceMutation,
  useDeleteGeofenceMutation,
  useGetGeofencesQuery,
} from '../services/api/geofencesApi';

const CATEGORY_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Delivery Zone', value: 'delivery_zone' },
  { label: 'Restricted Zone', value: 'restricted_zone' },
  { label: 'Toll Zone', value: 'toll_zone' },
  { label: 'Customer Area', value: 'customer_area' },
];

const MANUAL_CATEGORY_OPTIONS = CATEGORY_OPTIONS.filter((option) => option.value !== 'all');

const CATEGORY_LABELS: Record<string, string> = {
  delivery_zone: 'Delivery Zone',
  restricted_zone: 'Restricted Zone',
  toll_zone: 'Toll Zone',
  customer_area: 'Customer Area',
};

const formatCategoryLabel = (value?: string) => {
  if (!value) return 'General';
  return CATEGORY_LABELS[value] || value.replace(/_/g, ' ');
};

const DEFAULT_CENTER: [number, number] = [12.9629, 77.5775];
const DEFAULT_CATEGORY = 'delivery_zone';

type DraftZone = {
  id: string;
  coordinates: [number, number][];
  name: string;
  category: string;
  description: string;
  saving?: boolean;
};
export const Geofences = () => {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [draftZones, setDraftZones] = useState<DraftZone[]>([]);
  const [expandedCoordinates, setExpandedCoordinates] = useState<Record<string, boolean>>({});
  const [createGeofence] = useCreateGeofenceMutation();
  const [deleteGeofence] = useDeleteGeofenceMutation();
  const categoryParam = categoryFilter === 'all' ? undefined : categoryFilter;
  const { data: geofences = [], isLoading: loading } = useGetGeofencesQuery(categoryParam);

  const handleDeleteZone = async (id: string) => {
    try {
      await deleteGeofence(id).unwrap();
    } catch (error) {
      console.error('Failed to delete geofence:', error);
    }
  };

  const handleShapeCreated = (coordinates: [number, number][]) => {
    if (!coordinates.length) return;
    setDraftZones((prev) => [
      ...prev,
      {
        id: crypto.randomUUID?.() || `${Date.now()}-${prev.length}`,
        coordinates,
        name: '',
        category: DEFAULT_CATEGORY,
        description: '',
      },
    ]);
  };

  const updateDraft = (id: string, field: keyof DraftZone, value: string) => {
    setDraftZones((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, [field]: value } : draft)),
    );
  };

  const removeDraft = (id: string) => {
    setDraftZones((prev) => prev.filter((draft) => draft.id !== id));
  };

  const saveDraft = async (id: string) => {
    const draft = draftZones.find((zone) => zone.id === id);
    if (!draft) return;
    setDraftZones((prev) =>
      prev.map((zone) => (zone.id === id ? { ...zone, saving: true } : zone)),
    );
    try {
      await createGeofence({
        name: draft.name.trim() || `Zone ${draft.id.slice(-4)}`,
        description: draft.description || 'Manual drawing',
        category: draft.category,
        coordinates: draft.coordinates,
      }).unwrap();
      removeDraft(id);
    } catch (error) {
      console.error('Failed to save drafted zone', error);
      setDraftZones((prev) =>
        prev.map((zone) => (zone.id === id ? { ...zone, saving: false } : zone)),
      );
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
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
          <Card title="Active Zones" subtitle="Current containment protocols">
            <div className="flex flex-wrap gap-2 mt-3">
              {CATEGORY_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={categoryFilter === option.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="space-y-3 mt-4">
              {geofences.length === 0 && (
                <p className="text-xs text-outline">
                  No geofences found. Draw a zone on the map to start.
                </p>
              )}
              {geofences.map((geo: any) => {
                const isRestricted = geo.category?.toLowerCase().includes('restrict');
                const showCoords = expandedCoordinates[geo.id];
                const coords = geo.coordinates ?? [];
                const sanitizedCoords =
                  coords.length &&
                  coords[0][0] === coords[coords.length - 1][0] &&
                  coords[0][1] === coords[coords.length - 1][1]
                    ? coords.slice(0, -1)
                    : coords;
                return (
                  <div
                    key={geo.id}
                    className="p-4 bg-surface-container-low border-l-4 border-primary-container hover:bg-surface-container-highest transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display text-sm">{geo.name}</h4>
                        <p className="text-[10px] text-outline uppercase tracking-[0.3em] mt-1">
                          {formatCategoryLabel(geo.category)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 tracking-widest uppercase ${
                            isRestricted
                              ? 'bg-red-100 text-red-600'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {isRestricted ? 'Warning' : 'Active'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteZone(geo.id);
                          }}
                          className="text-red-500 hover:text-red-400 p-0.5"
                          title="Delete Zone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-outline mt-2">
                      {geo.description || 'No description provided'}
                    </p>
                    {geo.created_at && (
                      <p className="text-[10px] text-outline mt-1">
                        Created {new Date(geo.created_at).toLocaleString()}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCoordinates((prev) => ({
                            ...prev,
                            [geo.id]: !prev[geo.id],
                          }));
                        }}
                        className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary"
                      >
                        {showCoords ? 'Hide coordinates' : 'Show coordinates'}
                      </button>
                      {showCoords && sanitizedCoords.length === 0 && (
                        <span className="text-[10px] text-outline">No coordinates yet</span>
                      )}
                    </div>
                    {showCoords && sanitizedCoords.length > 0 && (
                      <div className="mt-2 space-y-1 text-[10px] font-mono text-outline">
                        {sanitizedCoords.map((coord: [number, number], idx: number) => (
                          <p key={`${geo.id}-${idx}`}>
                            Point {idx + 1}: {coord[0].toFixed(6)}, {coord[1].toFixed(6)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="xl:col-span-8 space-y-6">
          <Card title="Operational Map" subtitle="Draw or inspect zones">
            <div className="text-[10px] text-outline tracking-[0.2em] uppercase pt-4">
              Draw a polygon to start a new zone draft. Each shape opens its own form below.
            </div>
            <div className="h-[420px] overflow-hidden rounded-sm mt-3">
              <MapComponent
                center={DEFAULT_CENTER}
                geofences={geofences}
                onShapeCreated={handleShapeCreated}
              />
            </div>
            <p className="text-xs text-outline uppercase tracking-[0.3em] mt-3">
              Drag the map tools to sketch new polygons that will automatically snap into the
              registry.
            </p>
            {draftZones.length > 0 && (
              <div className="mt-6 space-y-4">
                {draftZones.map((draft, index) => (
                  <Card key={draft.id} className="bg-surface-container-low">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-outline">
                          Draft zone #{index + 1}
                        </p>
                        <h4 className="font-display text-lg">{draft.name || 'Untitled zone'}</h4>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeDraft(draft.id)}>
                        Discard
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mt-3 md:grid-cols-2">
                      <Input
                        label="Name"
                        placeholder="Zone name"
                        value={draft.name}
                        onChange={(e) => updateDraft(draft.id, 'name', e.target.value)}
                      />
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
                          Category
                        </label>
                        <select
                          className="w-full border-b-2 border-outline-variant bg-surface-container-low px-4 py-3 text-sm font-sans text-on-surface outline-none transition-colors focus:border-primary-container"
                          value={draft.category}
                          onChange={(e) => updateDraft(draft.id, 'category', e.target.value)}
                        >
                          {MANUAL_CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-[10px] font-bold tracking-[0.2em] mb-2 text-outline uppercase">
                        Description
                      </label>
                      <textarea
                        className="w-full min-h-[80px] resize-none bg-surface-container-low border border-outline-variant px-4 py-3 text-sm font-sans outline-none transition-colors focus:border-primary-container"
                        placeholder="Optional context for the containment protocol"
                        value={draft.description}
                        onChange={(e) => updateDraft(draft.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
                      <span className="text-[10px] text-outline tracking-[0.2em] uppercase">
                        {draft.coordinates.length} points captured
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => saveDraft(draft.id)}
                        disabled={draft.saving}
                        size="sm"
                      >
                        {draft.saving ? 'Saving…' : 'Save zone'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
