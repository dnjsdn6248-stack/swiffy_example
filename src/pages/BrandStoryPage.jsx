import { Link } from 'react-router-dom'
import { useGetBrandStoryQuery, useGetBrandStoryDetailQuery } from '@/api/searchApi'
import Spinner from '@/shared/components/Spinner'

export default function BrandStoryPage() {
  const { data: brandStory, isLoading: isMainLoading } = useGetBrandStoryQuery()
  const { data: detailCards = [], isLoading: isDetailLoading } = useGetBrandStoryDetailQuery()

  if (isMainLoading || isDetailLoading) return <Spinner fullscreen />

  const mainCard = brandStory?.mainCard ?? null
  const sortedCards = [...detailCards].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  return (
    <div className="bg-white min-h-screen">
      <main className="w-full">

        {/* 메인 카드 */}
        {mainCard && (
          <section className="w-full">
            <img
              src={mainCard.imageUrl}
              alt="브랜드 스토리 메인"
              className="w-full object-cover"
            />
            {mainCard.buttonText && mainCard.buttonUrl && (
              <div className="text-center py-10">
                {mainCard.buttonUrl.startsWith('http') ? (
                  <a
                    href={mainCard.buttonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#3ea76e] text-white font-medium hover:bg-[#318a57] hover:scale-105 transition-all"
                  >
                    {mainCard.buttonText}
                  </a>
                ) : (
                  <Link
                    to={mainCard.buttonUrl}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#3ea76e] text-white font-medium hover:bg-[#318a57] hover:scale-105 transition-all"
                  >
                    {mainCard.buttonText}
                  </Link>
                )}
              </div>
            )}
          </section>
        )}

        {/* 상세 카드 리스트 */}
        {sortedCards.length > 0 && (
          <section className="w-full">
            {sortedCards.map((card, idx) => (
              <img
                key={idx}
                src={card.imageUrl}
                alt={`브랜드 스토리 ${idx + 1}`}
                className="w-full object-cover"
              />
            ))}
          </section>
        )}

      </main>
    </div>
  )
}
