import { baseApi } from './baseApi';

export const alertsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAlerts: builder.query<any, any>({
      query: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return `/alerts${query ? `?${query}` : ''}`;
      },
      transformResponse: (res: any) => res.alerts || res,
      providesTags: ['Alert'],
    }),
    configureAlerts: builder.mutation({
      query: (data) => ({
        url: '/alerts/configure',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Alert'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAlertsQuery, useConfigureAlertsMutation } = alertsApi;
