import { apiSlice } from './apiSlice'

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /cart?page={page}
    getCart: builder.query({
      query: (page = 0) => ({ url: '/cart', params: { page } }),
      transformResponse: (res) => {
        const d = res.data ?? res
        return {
          userId:      d.userId,
          items: (d.items ?? []).map((item) => ({
            productId:  item.productId,
            optionId:   item.optionId ?? 0,
            quantity:   item.quantity ?? 1,
            isSelected: item.isSelected ?? false,
          })),
          page:        d.page ?? 0,
          size:        d.size ?? 5,
          totalItems:  d.totalItems ?? 0,
          totalPages:  d.totalPages ?? 0,
          hasNext:     d.hasNext ?? false,
          hasPrevious: d.hasPrevious ?? false,
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

    // PUT /cart/quantity
    updateCartItemQuantity: builder.mutation({
      query: (body) => ({ url: '/cart/quantity', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // PUT /cart/option
    updateCartItemOption: builder.mutation({
      query: (body) => ({ url: '/cart/option', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // DELETE /cart
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

    // DELETE /cart/selected
    removeSelectedCartItems: builder.mutation({
      query: () => ({ url: '/cart/selected', method: 'DELETE' }),
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
