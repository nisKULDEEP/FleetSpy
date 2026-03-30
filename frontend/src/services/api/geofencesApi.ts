import { baseApi } from './baseApi';

export const geofencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGeofences: builder.query<any, string | void>({
      query: (category) => `/geofences${category ? `?category=${category}` : ''}`,
      transformResponse: (res: any) => res.geofences || res,
      providesTags: ['Geofence'],
    }),
    createGeofence: builder.mutation({
      query: (data) => ({
        url: '/geofences',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Geofence'],
    }),
    deleteGeofence: builder.mutation({
      query: (id: string) => ({
        url: `/geofences/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Geofence'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetGeofencesQuery, useCreateGeofenceMutation, useDeleteGeofenceMutation } =
  geofencesApi;
