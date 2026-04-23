# Brand Story 뷰

## 경로
`/brand-story` → `BrandStoryPage.jsx`

## 레이아웃 구성

### 1. 메인 카드 섹션 (Hero)
- API: `useGetBrandStoryQuery` → GET /search/brand-story
- 응답: `{ mainCard: { imageUrl, buttonText, buttonUrl } }`
- `mainCard.imageUrl` → 전체 너비 이미지
- `mainCard.buttonText` + `mainCard.buttonUrl` → CTA 버튼 (내부 링크는 `<Link>`, 외부는 `<a>`)

### 2. 상세 카드 리스트 섹션
- API: `useGetBrandStoryDetailQuery` → GET /search/brand-story/detail
- 응답: `[{ imageUrl, displayOrder }]`
- `displayOrder` 기준 오름차순 정렬
- 이미지 목록을 세로 또는 그리드로 표시

## 상태 처리
- 로딩: `<Spinner fullscreen />`
- 에러: 에러 메시지 표시 (mainCard 에러와 detail 에러 각각 처리)
- mainCard가 null이면 섹션 렌더링 생략

## 데이터 의존성
- `searchApi.js` → `useGetBrandStoryQuery`, `useGetBrandStoryDetailQuery`
