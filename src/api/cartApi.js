import { apiSlice } from './apiSlice'

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /cart  — 페이지네이션 없음, 전체 항목 반환
    getCart: builder.query({
      query: () => ({ url: '/cart' }),
      transformResponse: (res) => {
        const d = res.data ?? res
        return {
          userId:           d.userId,
          selectedItemCount: d.selectedItemCount ?? 0,
          allSelected:      d.allSelected       ?? false,
          hasSelectedItems: d.hasSelectedItems  ?? false,
          items: (d.items ?? []).map((item) => ({
            productId:  item.productId,
            optionId:   item.optionId  ?? 0,
            quantity:   item.quantity  ?? 1,
            isSelected: item.isSelected ?? false,
            isSoldOut:  item.isSoldOut  ?? false,
          })),
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ productId, optionId }) => ({
                type: 'Cart',
                id: `${productId}-${optionId}`,
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

    // PUT /cart/quantity  (quantity=0 이면 삭제)
    updateCartItemQuantity: builder.mutation({
      query: (body) => ({ url: '/cart/quantity', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // PUT /cart/option
    updateCartItemOption: builder.mutation({
      query: (body) => ({ url: '/cart/option', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // DELETE /cart  (단건)
    removeCartItem: builder.mutation({
      query: (body) => ({ url: '/cart', method: 'DELETE', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // PUT /cart/select
    selectCartItem: builder.mutation({
      query: (body) => ({ url: '/cart/select', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // PUT /cart/select-all
    selectAllCartItems: builder.mutation({
      query: (body) => ({ url: '/cart/select-all', method: 'PUT', body }),
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
} = cartApi
