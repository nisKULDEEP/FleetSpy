import React, { useEffect, useMemo, useState } from 'react';
import { useGetViolationHistoryQuery } from '../services/api/violationsApi';
import { useGetVehiclesQuery } from '../services/api/vehiclesApi';
import { useGetGeofencesQuery } from '../services/api/geofencesApi';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';

const formatDate = (value: string) => (value ? new Date(value).toLocaleString() : '—');
const normalizeDate = (value: string) => (value ? new Date(value).toISOString() : '');

export const Violations = () => {
  const [filterInputs, setFilterInputs] = useState({
    vehicle_id: '',
    geofence_id: '',
    start_date: '',
    end_date: '',
  });
  const [historyParams, setHistoryParams] = useState({
    vehicle_id: '',
    geofence_id: '',
    start_date: '',
    end_date: '',
    limit: 25,
    offset: 0,
  });
  const [violations, setViolations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const { data: vehicles = [] } = useGetVehiclesQuery();
  const { data: geofences = [] } = useGetGeofencesQuery();
  const { data: historyPage, isLoading, isFetching } = useGetViolationHistoryQuery(historyParams);

  useEffect(() => {
    if (!historyPage) return;
    setTotalCount(historyPage.total_count ?? 0);
    if (historyParams.offset === 0) {
      setViolations(historyPage.violations || []);
    } else {
      setViolations((prev) => [...prev, ...(historyPage.violations || [])]);
    }
  }, [historyPage, historyParams.offset]);

  const handleApplyFilters = () => {
    setHistoryParams((prev) => ({
      ...prev,
      vehicle_id: filterInputs.vehicle_id,
      geofence_id: filterInputs.geofence_id,
      start_date: normalizeDate(filterInputs.start_date),
      end_date: normalizeDate(filterInputs.end_date),
      offset: 0,
    }));
  };

  const handleResetFilters = () => {
    setFilterInputs({ vehicle_id: '', geofence_id: '', start_date: '', end_date: '' });
    setHistoryParams((prev) => ({
      ...prev,
      vehicle_id: '',
      geofence_id: '',
      start_date: '',
      end_date: '',
      offset: 0,
    }));
  };

  const handleLoadMore = () => {
    setHistoryParams((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  const statusBreakdown = useMemo(
    () => ({
      total: violations.length,
      remaining: Math.max(totalCount - violations.length, 0),
    }),
    [violations.length, totalCount],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-widest uppercase text-xs">
            Auditing Security Logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="motion-safe:animate-in fade-in duration-500 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display tracking-tighter">Violation History</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">
            An audit trail of every geofence entry or exit that touched your fleet.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
          <Card title="Filters" subtitle="Scope by vehicle, geofence, or time period">
            <div className="space-y-4 mt-4">
              <div>
                <Input
                  label="Geofence"
                  placeholder="Search geofence"
                  value={filterInputs.geofence_id}
                  onChange={(e) =>
                    setFilterInputs((prev) => ({ ...prev, geofence_id: e.target.value }))
                  }
                  list="geo-options"
                />
                <datalist id="geo-options">
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
                  placeholder="Search vehicle"
                  value={filterInputs.vehicle_id}
                  onChange={(e) =>
                    setFilterInputs((prev) => ({ ...prev, vehicle_id: e.target.value }))
                  }
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
                <Input
                  label="Start Date"
                  type="datetime-local"
                  value={filterInputs.start_date}
                  onChange={(e) =>
                    setFilterInputs((prev) => ({ ...prev, start_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Input
                  label="End Date"
                  type="datetime-local"
                  value={filterInputs.end_date}
                  onChange={(e) =>
                    setFilterInputs((prev) => ({ ...prev, end_date: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Loaded Records" subtitle="Pagination state">
            <div className="space-y-2 mt-4 text-[10px] uppercase tracking-[0.3em] font-bold text-outline">
              <p>{violations.length} retrieved</p>
              <p>{statusBreakdown.remaining} remaining</p>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-8 space-y-6">
          <Card title="Violation Timeline" subtitle="Entry / exit events">
            <div className="space-y-4 mt-4">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="bg-surface p-6 tactical-shadow border-l-4 border-red-600 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em]">
                        {violation.type}
                      </p>
                      <h4 className="font-display text-lg uppercase tracking-tight">
                        {violation.geofence_name}
                      </h4>
                    </div>
                    <span className="text-[10px] text-outline">
                      {formatDate(violation.timestamp)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[10px] text-outline uppercase tracking-[0.3em]">
                    <span>Vehicle: {violation.vehicle_number}</span>
                    <span>Geofence ID: {violation.geofence_id}</span>
                    <span>Category: {violation.category}</span>
                  </div>
                  <div className="text-[10px] text-outline flex flex-wrap gap-6">
                    <span>Lat: {violation.latitude ?? '—'}</span>
                    <span>Lng: {violation.longitude ?? '—'}</span>
                  </div>
                  <p className="text-sm text-white font-bold">{violation.details}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-outline">
                      {violation.vehicle_id}
                    </span>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {violations.length < totalCount && (
              <div className="flex justify-center mt-6">
                <Button variant="secondary" onClick={handleLoadMore} disabled={isFetching}>
                  {isFetching ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
