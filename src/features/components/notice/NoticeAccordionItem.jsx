import { ChevronDown } from 'lucide-react'
import { useGetNoticeDetailQuery } from '@/api/noticeApi'
import Spinner from '@/shared/components/Spinner'

export default function NoticeAccordionItem({ notice, isOpen, onToggle }) {
  const { data, isLoading, isError } = useGetNoticeDetailQuery(notice.id, { skip: !isOpen })

  return (
    <div className="border-b border-[#f0f0f0]">

      {/* 헤더 행 */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-2 hover:bg-[#f9f9f9] transition-colors group text-left bg-transparent border-none cursor-pointer"
      >
        <div className="flex items-center gap-5 text-[14px] flex-1 min-w-0">
          <span className={`shrink-0 min-w-[40px] text-center text-[13px] font-bold ${notice.isPinned ? 'text-primary' : 'text-[#bbb]'}`}>
            {notice.displayLabel}
          </span>
          <span className={`truncate font-medium transition-colors ${isOpen ? 'text-primary' : 'text-[#444] group-hover:text-primary'}`}>
            {notice.title}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {notice.createdAt && (
            <span className="text-[12px] text-[#bbb] hidden sm:block">{notice.createdAt}</span>
          )}
          <ChevronDown
            size={16}
            className={`text-[#ccc] transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`}
          />
        </div>
      </button>

      {/* 펼쳐지는 본문 — NoticeDetailPage와 동일한 렌더 구조 */}
      {isOpen && (
        <div className="px-2 pb-10 pt-2 border-t border-[#f5f5f5]">

          {isLoading && <div className="py-8"><Spinner /></div>}

          {isError && (
            <p className="text-center text-[14px] text-[#999] py-8">
              공지사항을 불러올 수 없습니다.
            </p>
          )}

          {data && (
            <>
              {/* 헤더 */}
              <div className="pt-6 pb-5 border-b border-[#eee]">
                {data.isPinned && (
                  <span className="inline-block text-[11px] font-bold text-primary border border-primary rounded px-2 py-0.5 mb-3">
                    공지
                  </span>
                )}
                <h2 className="text-[18px] font-bold text-[#111] leading-snug mb-3">
                  {data.title}
                </h2>
                {data.createdAt && (
                  <p className="text-[13px] text-[#bbb]">{data.createdAt}</p>
                )}
              </div>

              {/* 본문 */}
              <div className="py-8">
                {/* 이미지 */}
                {data.images?.length > 0 && (
                  <div className="flex flex-col gap-3 mb-8">
                    {data.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`공지 이미지 ${i + 1}`}
                        className="w-full max-w-[820px] h-auto rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* 텍스트 */}
                {data.content && (
                  <p className="whitespace-pre-wrap text-[14px] leading-[1.9] text-[#444]">
                    {data.content}
                  </p>
                )}
              </div>

              {/* actions (CTA 버튼) */}
              {data.actions?.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[#eee]">
                  {[...data.actions]
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((action, i) => (
                      <a
                        key={i}
                        href={action.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary px-6 py-2.5 text-[14px] rounded-lg"
                      >
                        {action.label}
                      </a>
                    ))
                  }
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
