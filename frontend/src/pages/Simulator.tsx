/* eslint-disable max-lines */
import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
import { socketService } from '@/src/services/sockets/socketService';
import { Socket } from 'socket.io-client';
import { useGetVehiclesQuery, useCreateVehicleMutation } from '@/src/services/api/vehiclesApi';
import { SimulationControls } from '@/src/components/simulator/SimulationControls';
import { TelemetryReadout } from '@/src/components/simulator/TelemetryReadout';
import { SimulatorMap } from '@/src/components/simulator/SimulatorMap';
import { LiveAlertsCard } from '@/src/components/simulator/LiveAlertsCard';
import { useGetGeofencesQuery, useCreateGeofenceMutation } from '@/src/services/api/geofencesApi';
import {
  vehicleIcon,
  presetRoute,
  Geofence,
  Alert,
} from '@/src/components/simulator/simulatorUtils';

const injectSimulatorZone = async (geofences: any[], createGeofence: any) => {
  try {
    const hasSimZone = geofences.some((g: Geofence) => g.name === 'Simulator Predefined Zone');

    if (!hasSimZone) {
      toast.info('Injecting Predefined Simulation Geofence...', { id: 'sim-zone-loading' });
      await createGeofence({
        name: 'Simulator Predefined Zone',
        category: 'Restricted',
        description: 'Auto-generated for active testing simulation',
        coordinates: [
          [52.5215, 13.4015],
          [52.5235, 13.4015],
          [52.5235, 13.4065],
          [52.5215, 13.4065],
          [52.5215, 13.4015],
        ],
      }).unwrap();
      toast.success('Predefined Simulation Geofence Created!', { id: 'sim-zone-loading' });
    }
  } catch (err: unknown) {
    console.warn('Could not inject predefined simulator zone', err);
    toast.error('Could not inject simulator zone');
  }
};

export const Simulator = () => {
  const {
    data: vehicles = [],
    isLoading: isLoadingVehicles,
    refetch: refetchVehicles,
  } = useGetVehiclesQuery();
  const [createVehicle] = useCreateVehicleMutation();
  const { data: geofences = [] } = useGetGeofencesQuery();
  const [createGeofence] = useCreateGeofenceMutation();

  const [selectedVehicle, setSelectedVehicle] = useState('');

  // Auto-inject a simulator vehicle if none exist
  useEffect(() => {
    const initVehicle = async () => {
      if (!isLoadingVehicles && vehicles && vehicles.length === 0) {
        try {
          await createVehicle({
            vehicle_number: 'TEST-SIM-01',
            vehicle_type: 'Truck',
            driver_name: 'Sim Driver',
            phone: '555-0000',
          }).unwrap();
          refetchVehicles();
        } catch (e) {
          console.error('Failed to auto-create simulator vehicle', e);
        }
      }
    };
    initVehicle();
  }, [isLoadingVehicles, vehicles, createVehicle, refetchVehicles]);

  // Auto-select first vehicle
  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0].id);
    }
  }, [vehicles, selectedVehicle]);

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000); // 1 ping per second
  const [step, setStep] = useState(0);

  const route = presetRoute;

  const [currentStatus, setCurrentStatus] = useState({
    insideGeofences: [] as string[],
    lastLat: 0,
    lastLng: 0,
  });

  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [vehicleHwSocket, setVehicleHwSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const handleAlert = (eventData: Alert) => {
      setLiveAlerts((prev) => [eventData, ...prev].slice(0, 10)); // Keep last 10 alerts
    };

    socketService.on('geofence_event', handleAlert);

    return () => {
      socketService.off('geofence_event', handleAlert);
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && selectedVehicle && vehicleHwSocket) {
      interval = setInterval(async () => {
        if (step >= route.length) {
          setIsRunning(false);
          clearInterval(interval);
          return;
        }

        const [lat, lng] = route[step];

        try {
          vehicleHwSocket.emit('vehicle_location', {
            vehicle_id: selectedVehicle,
            latitude: lat,
            longitude: lng,
            timestamp: new Date().toISOString(),
          });

          setCurrentStatus({
            insideGeofences: [], // Optionally updated by socket event or kept simple
            lastLat: lat,
            lastLng: lng,
          });
          setStep((s) => s + 1);
        } catch (error) {
          console.error('Ping failed:', error);
          setIsRunning(false);
        }
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isRunning, selectedVehicle, step, route, speed, vehicleHwSocket]);

  const handleStart = async () => {
    if (!selectedVehicle) {
      alert('Please select a vehicle first.');
      return;
    }

    await injectSimulatorZone(geofences || [], createGeofence);

    // Connect Vehicle Hardware Socket directly
    if (!vehicleHwSocket) {
      const socket = socketService.connectVehicle(selectedVehicle);
      socket.on('connect', () => {
        toast.info(`Hardware connected to network for ${selectedVehicle}`, { id: 'hw-conn' });
      });
      setVehicleHwSocket(socket);
    }

    if (step >= route.length) {
      setStep(0);
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleStop = () => {
    setIsRunning(false);
    setStep(0);
    setCurrentStatus({ insideGeofences: [], lastLat: 0, lastLng: 0 });
    if (vehicleHwSocket) {
      socketService.disconnectVehicle(selectedVehicle);
      setVehicleHwSocket(null);
      toast.info('Hardware disconnected');
    }
  };

  return (
    <div className="motion-safe:animate-in fade-in duration-500 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display tracking-tighter">Hardware Simulator</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">
            Mock active GPS telemetry for testing geofence containment protocols.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
          <SimulationControls
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            isRunning={isRunning}
            speed={speed}
            setSpeed={setSpeed}
            handleStart={handleStart}
            handlePause={handlePause}
            handleStop={handleStop}
          />

          <TelemetryReadout
            step={step}
            routeLength={route.length}
            currentStatus={currentStatus}
            isRunning={isRunning}
          />

          <LiveAlertsCard liveAlerts={liveAlerts} />
        </div>

        <div className="xl:col-span-8">
          <SimulatorMap route={route} geofences={geofences} step={step} vehicleIcon={vehicleIcon} />
        </div>
      </div>
    </div>
  );
};
