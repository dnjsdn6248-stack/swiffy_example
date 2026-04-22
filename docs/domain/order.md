# Order Server API 명세서

> **Base URL:** `http://localhost:8072/api/v1`

---

## order_state 코드 정의

| order_state | 설명 | 비고 |
| :--- | :--- | :--- |
| `ORDER_CHECKED_OUT` | 주문체크아웃 | 주문 프로세스 시작 |
| `INVENTORY_RESERVED` | 재고예약완료 | 결제 전 단계 |
| `INVENTORY_RESERVATION_FAILED` | 재고예약실패 | 재고 부족 등 |
| `PAYMENT_COMPLETED` | 결제완료 | 결제 승인 완료 |
| `PAYMENT_FAILED` | 결제실패 | 결제 거절 등 |
| `INVENTORY_DEDUCTION_FAILED` | 재고차감실패 | 최종 재고 처리 오류 |
| `INVENTORY_RELEASED` | 재고예약해제완료 | 주문 취소/실패로 인한 재고 복구 |
| `INVENTORY_RELEASE_FAILED` | 재고예약해제실패 | 재고 복구 프로세스 오류 |
| `ORDER_COMPLETED` | 주문완료 | 모든 주문 과정 정상 종료 |

---

## `POST /orders`

주문 checkout을 요청합니다.

### Request Body

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `user_id` | `Number` | ✅ | 사용자 ID |
| `user_name` | `String` | ❌ | 주문자 이름 |
| `receiver_name` | `String` | ❌ | 수령인 이름 |
| `receiver_phone` | `String` | ❌ | 수령인 연락처 |
| `receiver_addr` | `String` | ❌ | 배송지 주소 |
| `items` | `Array` | ✅ | 주문 상품 목록 |
| `items[].productId` | `Number` | ✅ | 상품 ID |
| `items[].optionId` | `Number` | ✅ | 옵션 ID |
| `items[].quantity` | `Number` | ✅ | 수량 |

```json
{
  "user_id": 1,
  "user_name": "홍길동",
  "receiver_name": "홍길동",
  "receiver_phone": "010-1234-5678",
  "receiver_addr": "서울특별시 강남구 테헤란로 123",
  "items": [
    { "productId": 10, "optionId": 101, "quantity": 2 },
    { "productId": 11, "optionId": 201, "quantity": 1 }
  ]
}
```

### Success Response

- **Code:** `201 Created`

```json
{ "orderId": 1 }
```

### Error Response

- **Code:** `500 Internal Server Error`

---

## `GET /orders`

사용자의 주문 목록을 조회합니다.

### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `start_date` | String (ISO Date) | No | - | 조회 시작일 (예: `2024-04-01`) |
| `end_date` | String (ISO Date) | No | - | 조회 종료일 (예: `2024-04-22`) |
| `status` | String (Enum) | No | - | 주문 상태 (`order_state` 코드 사용) |
| `page` | Integer | No | `0` | 페이지 번호 (0부터 시작) |

### Success Response

- **Code:** `200 OK`

```json
{
  "content": [
    {
      "order_id": 1,
      "user_id": 1,
      "amount": 35000,
      "receiver_name": "홍길동",
      "receiver_phone": "010-1234-5678",
      "receiver_addr": "서울특별시 강남구 테헤란로 123",
      "delete_yn": "N",
      "time": "2026-04-20T14:30:00",
      "order_state": "ORDER_COMPLETED",
      "failed_reason": null,
      "failed_at": null
    }
  ],
  "pageable": { "pageNumber": 0, "pageSize": 20 },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "size": 20,
  "number": 0,
  "numberOfElements": 1,
  "empty": false
}
```

### Error Response

- **Code:** `500 Internal Server Error`

---

## `GET /orders/{order_id}`

주문 상세 정보를 조회합니다.

### Path Parameters

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `order_id` | `Number` | ✅ | 주문 ID |

### Success Response

- **Code:** `200 OK`

```json
{
  "order_id": 1,
  "user_id": 1,
  "user_name": "홍길동",
  "amount": 35000,
  "total_item_count": 2,
  "product_total_price": 35000,
  "payment_method": "CARD",
  "paid_amount": 35000,
  "receiver_name": "홍길동",
  "receiver_phone": "010-1234-5678",
  "receiver_addr": "서울특별시 강남구 테헤란로 123",
  "delete_yn": "N",
  "time": "2026-04-20T14:30:00",
  "order_state": "PAYMENT_COMPLETED",
  "failed_reason": null,
  "failed_at": null,
  "items": [
    {
      "product_id": 10,
      "option_id": 101,
      "product_name": "어글어글 동물복지 연어마들렌",
      "option_name": "단품",
      "price": 17500,
      "quantity": 2,
      "total_price": 35000
    }
  ]
}
```

### Error Response

- **Code:** `404 Not Found`
- **Code:** `500 Internal Server Error`

---

## `GET /orders/me/history`

로그인 사용자의 주문 상품 내역을 조회합니다. (주문 단위가 아니라 item 단위)

### Success Response

- **Code:** `200 OK`

```json
[
  {
    "id": 1,
    "user_id": 1,
    "order_id": 10,
    "product_id": 100,
    "option_id": 1001,
    "product_name": "어글어글 동물복지 연어마들렌",
    "option_name": "단품",
    "price": 17500,
    "quantity": 2,
    "total_price": 35000,
    "order_state": "ORDER_COMPLETED",
    "failed_reason": null,
    "failed_at": null
  }
]
```

### No Content Response

- **Code:** `204 No Content` (주문 내역 없음)

### Error Response

- **Code:** `500 Internal Server Error`

---

## `DELETE /orders/{order_id}`

주문 취소를 요청합니다.

### Path Parameters

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `order_id` | `Number` | ✅ | 주문 ID |

### Success Response

- **Code:** `202 Accepted`

### Current Behavior

- **Code:** `409 Conflict` (취소 saga 비활성화 중)

### Error Response

- **Code:** `404 Not Found`
- **Code:** `500 Internal Server Error`

---

## `GET /orders/{order_id}/cs-history`

주문 취소/교환/반품 내역을 조회합니다.

현재 `OrderService.getCsHistory()`는 빈 리스트를 반환하므로 `204 No Content`가 반환됩니다.

### Path Parameters

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `order_id` | `String` | ✅ | 주문 ID |

### Success Response

- **Code:** `200 OK`

```json
[
  {
    "order_id": 1,
    "user_id": 1,
    "amount": 35000,
    "receiver_name": "홍길동",
    "receiver_phone": "010-1234-5678",
    "receiver_addr": "서울특별시 강남구 테헤란로 123",
    "delete_yn": "N",
    "time": "2026-04-20T14:30:00",
    "order_state": "ORDER_COMPLETED",
    "failed_reason": null,
    "failed_at": null
  }
]
```

### Current Behavior

- **Code:** `204 No Content` (현재 구현상 반환 데이터 없음)

### Error Response

- **Code:** `404 Not Found`
- **Code:** `500 Internal Server Error`
