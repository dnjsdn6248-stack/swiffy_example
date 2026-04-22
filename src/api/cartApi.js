import { apiSlice } from './apiSlice'

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /cart/
    getCart: builder.query({
      query: () => ({ url: '/cart/' }),
      transformResponse: (res) => {
        const d = res.data ?? res
        return {
          userId: d.userId,
          items: (d.items ?? []).map((item) => ({
            productId: item.productId,
            optionId:  item.optionId ?? null,
            quantity:  item.quantity ?? 1,
          })),
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ productId, optionId }) => ({
                type: 'Cart',
                id: `${productId}-${optionId ?? 'none'}`,
              })),
              { type: 'Cart', id: 'LIST' },
            ]
          : [{ type: 'Cart', id: 'LIST' }],
    }),

    // POST /cart/additem
    addCartItem: builder.mutation({
      query: (body) => ({ url: '/cart/additem', method: 'POST', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // PUT /cart/frontend/item/quantity — quantity=0 이면 삭제
    updateCartItemQuantity: builder.mutation({
      query: (body) => ({ url: '/cart/frontend/item/quantity', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // PUT /cart/frontend/item/option
    updateCartItemOption: builder.mutation({
      query: (body) => ({ url: '/cart/frontend/item/option', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // DELETE /cart/frontend/item
    removeCartItem: builder.mutation({
      query: (body) => ({ url: '/cart/frontend/item', method: 'DELETE', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // PUT /cart/frontend/item/select — 개별 선택 상태 (응답에 선택 상태 미포함)
    selectCartItem: builder.mutation({
      query: (body) => ({ url: '/cart/frontend/item/select', method: 'PUT', body }),
    }),

    // PUT /cart/frontend/item/select-all
    selectAllCartItems: builder.mutation({
      query: (body) => ({ url: '/cart/frontend/item/select-all', method: 'PUT', body }),
    }),

    // DELETE /cart/frontend/item/selected
    removeSelectedCartItems: builder.mutation({
      query: () => ({ url: '/cart/frontend/item/selected', method: 'DELETE' }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

  }),
})

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemQuantityMutation,
  useUpdateCartItemOptionMutation,
  useRemoveCartItemMutation,
  useSelectCartItemMutation,
  useSelectAllCartItemsMutation,
  useRemoveSelectedCartItemsMutation,
} = cartApi
