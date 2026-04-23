# Product 도메인

기준일: 2026-04-23

## 개요

상품 목록 조회, 상세 조회, 검색, 베스트/신상품 조회와 랜딩페이지용 섹션 데이터를 담당한다.

> 카테고리 API는 **Search Server** 소속 — `docs/domain/search.md` 참조.

---

## 비즈니스 정책

| 정책 | 값 | 코드 위치 |
|---|---|---|
| 기본 페이지 크기 | 12개 | `src/shared/utils/constants.js` → `PRODUCT_PAGE_SIZE` |
| 배송비 기준 | 50,000원 이상 무료 | `src/shared/utils/constants.js` → `SHIPPING_FREE_THRESHOLD` |
| 기본 배송비 | 3,000원 | `src/shared/utils/constants.js` → `SHIPPING_FEE` |

> 비즈니스 수치는 컴포넌트 하드코딩 금지 — `constants.js`에서만 정의하고 import.

---

## 상태 구조

```js
// Redux slice (productSlice) — UI 상태만
product
├── searchKeyword: string
├── pagination: { page: 1, size: PRODUCT_PAGE_SIZE }
└── filters
    ├── categoryId:  number | null
    ├── petType:     'DOG'|'CAT'|'ALL' | null
    ├── ageGroup:    null
    ├── weightClass: null
    ├── minPrice / maxPrice: null
    ├── sortBy:      'createdAt'|'price'|'rating'|'sales'
    └── sortDir:     'asc'|'desc'

// category (categorySlice) — 선택된 카테고리 ID만
category
└── selectedCategoryId: number | null
```

서버에서 내려온 상품 데이터는 RTK Query `api` 캐시에만 존재한다.

---

## normalizeProduct 변환 함수

서버 응답 필드명이 다를 수 있어 `productApi.js`에서 정규화:

```js
{
  id:          p.productId ?? p.id,
  name:        p.productName ?? p.title ?? p.name,
  brand:       p.brandName  ?? p.brand,
  desc:        p.content ?? p.description ?? p.desc,
  price:       p.price,
  category:    p.categoryName ?? p.category,
}
```

---

## API 엔드포인트 (`src/api/productApi.js`)

`apiSlice.injectEndpoints()`로 정의.

### 상품 Queries

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `useGetProductByIdQuery(id)` | GET | `/product/:id` | 상품 상세 — Product Server |
| `useGetProductOptionsQuery(id)` | GET | `/product/:id/options` | 상품 옵션 목록 — Product Server |
| `useGetProductCategoriesQuery()` | GET | `/product/categories` | 카테고리 트리 (숫자 ID) — Product Server |
| `useGetProductSummaryQuery(id)` | GET | `/product/frontend/:id` | 상품 요약 (이미지·이름·옵션) — 장바구니·주문 경량 조회용 |

> 상품 목록·검색·베스트셀러·신상품 등은 **Search Server** (`searchApi.js`)에서 조회.

> **카테고리 서버 구분**: `useGetProductCategoriesQuery` (Product Server, 숫자 ID) vs `useGetCategoriesQuery` (Search Server, 문자열 코드 `"SNACK_JERKY"` 등). 검색 필터에는 Search Server 카테고리 코드를 사용한다.

### 랜딩페이지 전용 Queries

> 랜딩페이지 섹션 데이터는 모두 **Search Server** (`searchApi.js`)에서 조회.

| 섹션 | 컴포넌트 | 훅 (searchApi.js) | 엔드포인트 |
|---|---|---|---|
| 히어로 배너 | `HeroSlider.jsx` | `useGetMainBannersQuery()` | `GET /search/products/main-banners` |
| 베스트셀러 | `BestSellers.jsx` | `useGetHomeBestsellerQuery()` | `GET /search/products/home-bestseller` |
| 취향저격 탭 | `ProductTabs.jsx` | `useGetTastePicksQuery(brandName?)` | `GET /search/products/taste-picks` |
| 포토리뷰 | `PhotoReviews.jsx` | `useGetReviewHighlightsQuery()` (reviewApi) | `GET /main/review-highlights` |

#### 배너 (`useGetMainBannersQuery`) 응답

서버 원본: `{ productId, imageUrl, displayOrder, isHero }`

```js
// transformResponse 후
{ id, img, href, alt, displayOrder }
```

#### 베스트셀러 (`useGetHomeBestsellerQuery`) 응답

```js
// transformResponse 후 (배열)
[{ id, rank, name, img, price, score, salesCount, createdAt, productUrl }]
```

#### 취향저격 탭 (`useGetTastePicksQuery`) 응답

- `tags[]`: 탭 버튼 목록 (`brandName`, `tagName`, `selected`)
- `selectedBrandName`: 현재 선택된 브랜드
- `products[]`: 해당 브랜드 상품 목록 (`id`, `name`, `img`, `price`, `brandName`, `productUrl`)

브랜드 고정 3종: `오독오독` | `어글어글` | `스위피`

---

## Product Server API

> **Base URL:** `https://localhost:8072/api/v1/product`

### 공통 에러 응답

```json
{
  "message": "에러 메시지",
  "status": 401
}
```

| HTTP Status | 설명 |
|---|---|
| `400` | 요청 파라미터 누락 또는 검증 실패 |
| `401` | 비즈니스 로직 에러 |
| `500` | 서버 내부 오류 |

> 현재 `productserver`의 예외 응답 body `status` 값은 대부분 `401`로 내려옵니다.

---

### `GET /api/v1/product/{productId}` — 상품 상세 조회

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `productId` | Long | ✅ | 조회할 상품 ID |

**성공 응답 (200 OK)**

```json
{
  "productId": 185,
  "productName": "어글어글 스팀 100g 8종",
  "categoryId": 163,
  "categoryName": "오독오독",
  "brandName": "어글어글",
  "brandId": 3,
  "content": "기호성 높은 강아지 간식",
  "detailImageUrls": [
    "https://cdn.example.com/product/detail-1.jpg"
  ],
  "price": 12900,
  "priceDisplay": "12,900원",
  "status": "판매중",
  "tags": ["NEW"],
  "keywords": "강아지간식,스팀",
  "salesCount": 5200,
  "deliveryFee": 3000,
  "deliveryMethod": "택배",
  "stockQuantity": 42,
  "stockStatus": "AVAILABLE",
  "imageUrls": [
    "https://cdn.example.com/product/main.jpg"
  ],
  "options": [
    {
      "optionId": 10,
      "optionName": "닭가슴살",
      "extraPrice": 0,
      "stockQuantity": 10,
      "stockStatus": "AVAILABLE"
    }
  ]
}
```

#### 서버 → 프론트 필드 매핑 (`productApi.js` `transformResponse`)

| 서버 필드 | 프론트 필드 | 비고 |
|---|---|---|
| `productId` | `id` | |
| `productName` | `name` | |
| `brandName` | `brand` | |
| `content` | `desc` | 타이틀 아래 설명 |
| `detailImageUrls` | `detailImgs` | **배열** (중첩 배열 포함, `.flat()` 처리). 이전 오타 필드명 `detailImagelUrl`도 fallback으로 처리 |
| `price` | `price` | |
| `imageUrls` | `images` | 배열 |
| `imageUrls[0]` | `img` | 대표 이미지 |
| `stockStatus` | `stockStatus` | `AVAILABLE` / `SOLDOUT` |
| `stockQuantity` | `stockQuantity` | |
| `tags` | `tags` | **배열** (이전 스펙: string) |
| `deliveryFee` | — | 미사용 (프론트는 `constants.js`의 `SHIPPING_FEE` 사용) |
| `deliveryMethod` | — | 미사용 |
| `options[].optionId` | `options[].id` | |
| `options[].optionName` | `options[].label` | |
| `options[].extraPrice` | `options[].extra` | |
| `options[].stockStatus` | `options[].stockStatus` | `AVAILABLE` / `SOLDOUT` |

**에러 응답 (401)**

```json
{
  "message": "해당 상품을 찾을 수 없습니다.",
  "status": 401
}
```

---

### `GET /api/v1/product/{productId}/options` — 옵션 목록 조회

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `productId` | Long | ✅ | 조회할 상품 ID |

**성공 응답 (200 OK)**

```json
[
  {
    "optionId": 10,
    "optionName": "닭가슴살",
    "extraPrice": 0,
    "stockQuantity": 10,
    "stockStatus": "AVAILABLE"
  },
  {
    "optionId": 11,
    "optionName": "연어",
    "extraPrice": 500,
    "stockQuantity": 0,
    "stockStatus": "SOLDOUT"
  }
]
```

> 옵션이 없는 상품은 빈 배열(`[]`)을 반환합니다.

**에러 응답 (500)**

```json
{
  "message": "서버 내부 오류가 발생했습니다.",
  "status": 401
}
```

---

### `GET /api/v1/product/{productId}/options` — 옵션 목록 조회

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `productId` | Long | ✅ | 조회할 상품 ID |

**성공 응답 (200 OK)**

```json
[
  {
    "optionId": 10,
    "optionName": "닭가슴살",
    "extraPrice": 0,
    "stockQuantity": 10,
    "stockStatus": "AVAILABLE"
  },
  {
    "optionId": 11,
    "optionName": "연어",
    "extraPrice": 500,
    "stockQuantity": 0,
    "stockStatus": "SOLDOUT"
  }
]
```

> 옵션이 없는 상품은 빈 배열(`[]`)을 반환합니다.

| 서버 필드 | 프론트 필드 |
|---|---|
| `optionId` | `id` |
| `optionName` | `label` |
| `extraPrice` | `extra` |
| `stockQuantity` | `stockQuantity` |
| `stockStatus` | `stockStatus` |

> 훅: `useGetProductOptionsQuery(id)` — `src/api/productApi.js`

---

### `GET /api/v1/product/categories` — 카테고리 트리 조회

Product Server 기준 카테고리 트리. **숫자 ID** 사용.

> Search Server의 `useGetCategoriesQuery`(문자열 코드 ID, 검색 필터용)와 별개.

**성공 응답 (200 OK)**

```json
[
  {
    "categoryId": 100,
    "name": "Snack & Jerky",
    "displayOrder": 1,
    "children": [
      {
        "categoryId": 163,
        "name": "오독오독",
        "displayOrder": 1,
        "children": []
      }
    ]
  }
]
```

| 서버 필드 | 프론트 필드 |
|---|---|
| `categoryId` | `id` |
| `name` | `name` |
| `displayOrder` | `displayOrder` |
| `children` | `children` |

> 훅: `useGetProductCategoriesQuery()` — `src/api/productApi.js`

---

### `GET /api/v1/product/frontend/{productId}` — 상품 요약 조회

장바구니·주문 등 경량 상품 정보가 필요한 컨텍스트에서 사용.

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `productId` | Long | ✅ | 조회할 상품 ID |

**성공 응답 (200 OK)**

```json
{
  "imageUrl": "https://cdn.example.com/product/main.jpg",
  "productId": 185,
  "productName": "어글어글 동물복지 연어마들렌",
  "price": 12900,
  "options": [
    { "optionId": 1, "optionName": "단품" },
    { "optionId": 2, "optionName": "3개 세트" }
  ]
}
```

> 옵션이 없는 상품은 `options: []`를 반환합니다.

#### 서버 → 프론트 필드 매핑

| 서버 필드 | 프론트 필드 |
|---|---|
| `productId` | `id` |
| `productName` | `name` |
| `imageUrl` | `img` |
| `price` | `price` |
| `options[].optionId` | `options[].id` |
| `options[].optionName` | `options[].label` |

> 훅: `useGetProductSummaryQuery(id)` — `src/api/productApi.js`

**에러 응답 (401)**

```json
{
  "message": "해당 상품을 찾을 수 없습니다.",
  "status": 401
}
```

---

## 상품 상세 데이터 구조

```js
{
  id, name, brand, desc, price,
  img,              // 대표 이미지 (imageUrls[0])
  images,           // 이미지 배열 (imageUrls)
  stockStatus,      // 'AVAILABLE' | 'SOLDOUT'
  stockQuantity,    // 전체 재고 수량
  tags,             // string[] (예: ["NEW"])
  options: [{ id, label, extra, stockStatus, stockQuantity }],
  detailImgs,       // 상세 이미지 배열 (detailImageUrls)
  relatedProducts: [{ id, name, originalPrice, discountPrice, img, options }],
}
```

---

## optionId 처리 규칙

옵션이 없는 상품과 있는 상품을 백엔드에서 구별하기 위해 다음 규칙을 적용한다.

| 상황 | optionId 값 | 적용 위치 |
|---|---|---|
| 옵션이 있는 상품 | 선택된 옵션의 `id` | - |
| 옵션이 없는 상품 (`product.options` 가 빈 배열) | `0` | `ProductDetailPage` → `addCartItem`, `CheckoutPage` → `createOrder` |

```js
// ProductDetailPage.jsx — handleCart
optionId: product.options?.length > 0
  ? product.options.find(o => o.label === selectedOption)?.id
  : 0

// CheckoutPage.jsx — handlePayment
optionId: (productMap[i.productId]?.options?.length ?? 0) > 0 ? i.optionId : 0
```

> `CartPage`는 기존 장바구니 `item.optionId`를 식별자로 그대로 전달하므로 별도 처리 없음. 장바구니에 담을 때 이미 `0`으로 저장된다.

---

## 상품 상세 페이지 (`ProductDetailPage`)

- 경로: `/product/detail/:id`
- 옵션 선택 → 수량 스텝퍼(+/-) → 총 금액 = `(price + optionExtra) × qty`
- "함께 구매하면 좋은 제품" 섹션 표시
- CTA: 장바구니 / 구매하기

> 정기배송 기능 제거됨 (2026-04-23). `isSubscribable`, `deliveryCycles`, `subscriptionDiscount`, `bundleOptions` 필드 삭제.

---

## 필터 → RTK Query 연동 패턴

```js
const filters = useAppSelector(selectProductFilters)
const { page, size } = useAppSelector(selectProductPagination)

const { data } = useGetProductsQuery({ ...filters, page, size })
```

`setFilters` 호출 시 `pagination.page`가 자동으로 1로 리셋된다.
