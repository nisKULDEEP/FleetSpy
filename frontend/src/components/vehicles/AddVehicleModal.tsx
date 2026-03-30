import React from 'react';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import { motion, AnimatePresence } from 'motion/react';

interface AddVehicleModalProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  formData: {
    vehicle_number: string;
    vehicle_type: string;
    driver_name: string;
    phone: string;
  };
  setFormData: (data: any) => void;
  handleAddVehicle: (e: React.FormEvent) => Promise<void>;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  showAddModal,
  setShowAddModal,
  formData,
  setFormData,
  handleAddVehicle,
}) => {
  return (
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
  );
};
