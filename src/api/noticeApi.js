import { apiSlice } from './apiSlice'
import { NOTICE_PAGE_SIZE } from '@/shared/utils/constants'

/**
 * 목록 아이템 정규화
 * 백엔드 필드명 확정 전 방어적 fallback 체인 적용
 */
const normalizeNoticeItem = (n) => ({
  id:        n.noticeId   ?? n.notice_id ?? n.id   ?? null,
  title:     n.title      ?? n.subject   ?? n.name ?? '',
  isFixed:   n.isFixed    ?? n.is_fixed  ?? n.pinned ?? n.fixed ?? false,
  createdAt: n.createdAt  ?? n.created_at ?? n.registeredAt ?? n.date ?? null,
})

/**
 * 상세 정규화
 */
const normalizeNoticeDetail = (n) => ({
  id:        n.noticeId   ?? n.notice_id ?? n.id   ?? null,
  title:     n.title      ?? n.subject   ?? n.name ?? '',
  isFixed:   n.isFixed    ?? n.is_fixed  ?? n.pinned ?? n.fixed ?? false,
  createdAt: n.createdAt  ?? n.created_at ?? n.registeredAt ?? n.date ?? null,
  images:    n.images     ?? n.imageUrls ?? n.imageList ?? n.imgUrls ?? [],
  content:   n.content    ?? n.body      ?? n.text  ?? '',
})

export const noticeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /** 공지 목록 — GET /notices */
    getNotices: builder.query({
      query: ({ page = 0, size = NOTICE_PAGE_SIZE, keyword = '', searchType = 'title', period = 'WEEK' } = {}) => ({
        url: '/search/notices',
        params: {
          page,
          size,
          period,
          ...(keyword && { keyword, searchType }),
        },
      }),
      transformResponse: (res) => {
        const raw = res.content ?? res.data?.content ?? res.data ?? []
        const items = Array.isArray(raw) ? raw : []
        return {
          content:       items.map(normalizeNoticeItem),
          totalPages:    res.totalPages    ?? res.data?.totalPages    ?? 1,
          totalElements: res.totalElements ?? res.data?.totalElements ?? items.length,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Notice', id })),
              { type: 'Notice', id: 'LIST' },
            ]
          : [{ type: 'Notice', id: 'LIST' }],
    }),

    /** 공지 상세 — GET /notices/:id */
    getNoticeDetail: builder.query({
      query: (id) => `/notices/${id}`,
      transformResponse: (res) => normalizeNoticeDetail(res.data ?? res),
      providesTags: (result, error, id) => [{ type: 'Notice', id }],
    }),

  }),
})

export const { useGetNoticesQuery, useGetNoticeDetailQuery } = noticeApi
