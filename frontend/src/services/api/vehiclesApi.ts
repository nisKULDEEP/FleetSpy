import { baseApi } from './baseApi';

export const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query<any, void>({
      query: () => '/vehicles',
      transformResponse: (res: any) => res.vehicles || res,
      providesTags: ['Vehicle'],
    }),
    createVehicle: builder.mutation({
      query: (data) => ({
        url: '/vehicles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vehicle'],
    }),
    getVehicleLocation: builder.query({
      query: (id: string) => `/vehicles/location/${id}`,
    }),
    updateVehicleLocation: builder.mutation({
      query: (data) => ({
        url: '/vehicles/location',
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useGetVehicleLocationQuery,
  useUpdateVehicleLocationMutation,
} = vehiclesApi;
