import React from 'react';
import { Truck, Phone, User as UserIcon } from 'lucide-react';

interface VehicleTableProps {
  vehicles: any[];
}

export const VehicleTable: React.FC<VehicleTableProps> = ({ vehicles }) => {
  return (
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
                    className={`w-2 h-2 rounded-full ${
                      v.status === 'In Transit'
                        ? 'bg-emerald-500'
                        : v.status === 'Idle'
                          ? 'bg-primary-container'
                          : 'bg-red-500'
                    }`}
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
  );
};
