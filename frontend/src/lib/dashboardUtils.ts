import { store } from '../store';
import { vehiclesApi } from '../services/api/vehiclesApi';

export const getArrayData = (res: any, key: string) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res[key])) return res[key];
  return [];
};

export const fetchLatestLocations = async (vehicles: any[]) => {
  return Promise.all(
    vehicles.map(async (v: any) => {
      try {
        const locData = await store
          .dispatch(vehiclesApi.endpoints.getVehicleLocation.initiate(v.id))
          .unwrap();
        return { ...v, location: locData.current_location };
      } catch {
        return { ...v, location: null };
      }
    }),
  );
};
