import React, { useState } from 'react';
import { useGetVehiclesQuery, useCreateVehicleMutation } from '../services/api/vehiclesApi';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import { Truck, Plus, Search, Filter, Phone, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Vehicles = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: vehicles = [], isLoading: loading } = useGetVehiclesQuery();
  const [createVehicle] = useCreateVehicleMutation();
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: '',
    driver_name: '',
    phone: '',
  });

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVehicle(formData).unwrap();
      setShowAddModal(false);
      setFormData({ vehicle_number: '', vehicle_type: '', driver_name: '', phone: '' });
    } catch (error) {
      console.error('Failed to add vehicle:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-widest uppercase text-xs">
            Scanning Asset Registry...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="motion-safe:animate-in fade-in duration-500 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display tracking-tighter">Asset Inventory</h1>
          <p className="text-outline font-medium mt-2 max-w-xl">
            Comprehensive registry of all fleet vehicles, personnel, and operational status.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Register Asset
        </Button>
      </header>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b-2 border-outline-variant">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-outline">
                  Asset Details
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-outline">
                  Class
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-outline">
                  Personnel
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-outline">
                  Contact
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-outline">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-surface-container-highest rounded-sm">
                        <Truck className="w-4 h-4 text-on-surface" />
                      </div>
                      <div>
                        <p className="font-display text-sm">{v.vehicle_number}</p>
                        <p className="text-[10px] font-mono text-outline">{v.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold px-2 py-1 bg-surface-container-highest uppercase">
                      {v.vehicle_type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-3 h-3 text-outline" />
                      <span className="text-xs font-medium">{v.driver_name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-outline" />
                      <span className="text-xs font-mono">{v.phone}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${v.status === 'In Transit' ? 'bg-emerald-500' : v.status === 'Idle' ? 'bg-primary-container' : 'bg-red-500'}`}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {v.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-on-surface/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <Card title="Register New Asset" subtitle="Enter vehicle and driver details">
                <form className="space-y-6 mt-4" onSubmit={handleAddVehicle}>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Vehicle Number"
                      placeholder="ABC-123"
                      required
                      value={formData.vehicle_number}
                      onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    />
                    <Input
                      label="Vehicle Type"
                      placeholder="Truck / Van / etc"
                      required
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Driver Name"
                    placeholder="Full Name"
                    required
                    value={formData.driver_name}
                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="1234567890"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      type="button"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="secondary" className="flex-1" type="submit">
                      Register
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
