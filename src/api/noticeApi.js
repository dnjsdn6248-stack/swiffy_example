import { apiSlice } from './apiSlice'

/**
 * 공지 상세 정규화
 * 목록은 searchApi.js useSearchNoticesQuery 사용
 */
const normalizeNoticeDetail = (n) => ({
  id:        n.noticeId    ?? n.notice_id  ?? n.id    ?? null,
  title:     n.title       ?? n.subject    ?? n.name  ?? '',
  isFixed:   n.isFixed     ?? n.is_fixed   ?? n.pinned ?? n.fixed ?? false,
  createdAt: n.createdAt   ?? n.created_at ?? n.registeredAt ?? n.date ?? null,
  updatedAt: n.updatedAt   ?? n.updated_at ?? null,
  author:    n.author      ?? '',
  viewCount: n.viewCount   ?? 0,
  images:    n.images      ?? n.imageUrls  ?? n.imageList ?? n.imgUrls ?? [],
  content:   n.content     ?? n.body       ?? n.text  ?? '',
})

export const noticeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /** 공지 상세 — GET /notices/:id */
    getNoticeDetail: builder.query({
      query: (id) => `/notices/${id}`,
      transformResponse: (res) => normalizeNoticeDetail(res.data ?? res),
      providesTags: (result, error, id) => [{ type: 'Notice', id }],
    }),

  }),
})

export const { useGetNoticeDetailQuery } = noticeApi
