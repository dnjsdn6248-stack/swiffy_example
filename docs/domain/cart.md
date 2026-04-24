# CartServer API 명세서

> Base URL: `https://localhost:8072/api/v1/cart`
> 기준일: 2026-04-24 (전면 확정)

---

## 공통 규칙

### `CartResponse`

```json
{
  "userId": 10,
  "selectedItemCount": 1,
  "allSelected": false,
  "hasSelectedItems": true,
  "items": [
    {
      "productId": 1002,
      "optionId": 0,
      "quantity": 1,
      "isSelected": false,
      "isSoldOut": true
    }
  ]
}
```

> ⚠️ 페이지네이션 없음 — 전체 항목을 한 번에 반환. 구 응답의 `page` · `size` · `totalItems` · `totalPages` · `hasNext` · `hasPrevious` 모두 제거됨.

---

## 1. 장바구니 조회

### `GET /api/v1/cart`

- 페이지네이션 없음 — 전체 항목 반환
- 정렬: 최신 담기 순서 내림차순
- 장바구니 없으면 빈 응답 반환 (생성 안 함)
- Request Parameter: 없음

Success Response `200 OK`:

```json
{
  "userId": 10,
  "selectedItemCount": 1,
  "allSelected": false,
  "hasSelectedItems": true,
  "items": [
    {
      "productId": 1002,
      "optionId": 0,
      "quantity": 1,
      "isSelected": false,
      "isSoldOut": true
    },
    {
      "productId": 1001,
      "optionId": 2001,
      "quantity": 2,
      "isSelected": true,
      "isSoldOut": false
    }
  ]
}
```

빈 장바구니:

```json
{
  "userId": 10,
  "selectedItemCount": 0,
  "allSelected": false,
  "hasSelectedItems": false,
  "items": []
}
```

호환 경로: `GET /api/v1/cart/all`

### transformResponse 후 내부 필드

| 내부 필드            | 백엔드 필드          | 비고                         |
| -------------------- | -------------------- | ---------------------------- |
| `userId`             | `userId`             |                              |
| `selectedItemCount`  | `selectedItemCount`  | 선택된 항목 수               |
| `allSelected`        | `allSelected`        | 전체 선택 여부               |
| `hasSelectedItems`   | `hasSelectedItems`   | 선택 항목 존재 여부          |
| `items[].productId`  | `productId`          |                              |
| `items[].optionId`   | `optionId`           | 없으면 `0` (sentinel)        |
| `items[].quantity`   | `quantity`           |                              |
| `items[].isSelected` | `isSelected`         |                              |
| `items[].isSoldOut`  | `isSoldOut`          | 품절 여부 — UI 비활성화 처리 |

---

## 2. 상품 담기

### `POST /api/v1/cart/additem`

Request Body:

```json
{ "productId": 1001, "optionId": 2001, "quantity": 2 }
```

옵션 없는 상품: `optionId` 생략 가능

Success Response `201 CREATED`: CartResponse

---

## 3. 전체 선택 변경

### `PUT /api/v1/cart/select-all`

Request Body:

```json
{ "isSelectedAll": true }
```

---

## 4. 개별 선택 변경

### `PUT /api/v1/cart/select`

- 대상: `productId + optionId`
- `isSelected` 생략 시 `true`

Request Body:

```json
{ "productId": 1001, "optionId": 2001, "isSelected": false }
```

---

## 5. 옵션 변경

### `PUT /api/v1/cart/option`

Request Body:

```json
{ "productId": 1001, "optionId": 2001, "newOptionId": 2002 }
```

Success Response `200 OK`: CartResponse

---

## 6. 수량 변경

### `PUT /api/v1/cart/quantity`

- 대상: `productId + optionId`
- `quantity = 0` 이면 해당 항목 삭제

Request Body:

```json
{ "productId": 1001, "optionId": 2001, "quantity": 3 }
```

---

## 7. 단건 삭제

### `DELETE /api/v1/cart`

- 대상: `productId + optionId`

Request Body:

```json
{ "productId": 1001, "optionId": 2001 }
```

---

## ⚠️ 제거된 엔드포인트

| 엔드포인트              | 이유                 |
| ----------------------- | -------------------- |
| `DELETE /cart/selected` | 새 명세에서 제거됨   |

> 선택 항목 일괄 삭제 기능이 필요하다면 `DELETE /cart`를 항목별로 순차 호출하는 방식으로 대체 구현 가능.
