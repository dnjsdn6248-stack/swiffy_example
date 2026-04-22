import { apiSlice } from './apiSlice'

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /** 결제 준비 — 주문 생성 후 Toss 위젯 requestPayment 호출 전에 실행 */
    preparePayment: builder.mutation({
      query: (body) => ({ url: '/payments/prepare', method: 'POST', body }),
    }),

    /** 결제 승인 — Toss successUrl 리다이렉트 후 실행 */
    confirmPayment: builder.mutation({
      query: (body) => ({ url: '/payments/confirm', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),

  }),
})

export const { usePreparePaymentMutation, useConfirmPaymentMutation } = paymentApi
