import { baseApi } from './baseApi';

export const violationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getViolationHistory: builder.query<any, any>({
      query: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return `/violations/history${query ? `?${query}` : ''}`;
      },
      providesTags: ['Violation'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetViolationHistoryQuery } = violationsApi;
