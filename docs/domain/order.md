# Order Server API 명세서

> **Base URL:** `http://localhost:8072/api/v1`

---

## `POST /orders`

주문 checkout을 요청합니다.

OrderServer는 요청받은 상품 ID, 옵션 ID, 수량을 기준으로 ProductServer에 동기 검증을 요청하고, Product 검증 결과 기준으로 주문과 주문 상세 snapshot을 저장합니다.
이후 `OrderCheckedOut` outbox 이벤트를 저장합니다.

### Request Body

```json
{
  "user_id": 1,
  "receiver_name": "홍길동",
  "receiver_phone": "010-1234-5678",
  "receiver_addr": "서울특별시 강남구 테헤란로 123",
  "items": [
    {
      "productId": 10,
      "optionId": 101,
      "quantity": 2
    },
    {
      "productId": 11,
      "optionId": 201,
      "quantity": 1
    }
  ]
}
```

### Success Response

- **Code:** `201 Created`

```text
1번 주문이 접수되었습니다. 현재 상태는 ORDER_CHECKED_OUT 입니다.
```

### Error Response

- **Code:** `500 Internal Server Error`

```text
주문 처리 실패: 주문 처리 실패
```

---

## `GET /orders`

사용자의 주문 목록을 조회합니다.

### Headers

| Name        | Type   | Required | Description |
| :---------- | :----- | :------: | :---------- |
| `X-User-Id` | `Long` |    ✅    | 사용자 ID   |

### Query Parameters

| Name         | Type         | Required | Description               |
| :----------- | :----------- | :------: | :------------------------ |
| `start_date` | `LocalDate`  |    ❌    | 조회 시작일, `yyyy-MM-dd` |
| `end_date`   | `LocalDate`  |    ❌    | 조회 종료일, `yyyy-MM-dd` |
| `status`     | `OrderState` |    ❌    | 주문 상태                 |
| `page`       | `int`        |    ❌    | 페이지 번호, 기본값 `0`   |

### Request Example

```http
GET /api/v1/orders?start_date=2026-04-01&end_date=2026-04-20&status=ORDER_COMPLETED&page=0
X-User-Id: 1
```

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
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
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

```text
주문 목록 조회 실패
```

---

## `GET /orders/{order_id}`

주문 상세 정보를 조회합니다.

### Path Parameters

| Name       | Type   | Required | Description |
| :--------- | :----- | :------: | :---------- |
| `order_id` | `Long` |    ✅    | 주문 ID     |

### Success Response

- **Code:** `200 OK`

```json
{
  "order_id": 1,
  "user_id": 1,
  "amount": 35000,
  "receiver_name": "홍길동",
  "receiver_phone": "010-1234-5678",
  "receiver_addr": "서울특별시 강남구 테헤란로 123",
  "delete_yn": "N",
  "time": "2026-04-20T14:30:00",
  "order_state": "PAYMENT_FAILED",
  "failed_reason": "카드 한도 초과",
  "failed_at": "2026-04-20T14:35:00",
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

```text
해당 주문을 찾을 수 없습니다.
```

- **Code:** `500 Internal Server Error`

```text
주문 상세 조회 실패
```

---

## `GET /orders/me/history`

로그인 사용자의 주문 상품 내역을 조회합니다.

주문 단위가 아니라 주문 상세 item 단위로 이력을 반환합니다.

### Headers

| Name        | Type   | Required | Description |
| :---------- | :----- | :------: | :---------- |
| `X-User-Id` | `Long` |    ✅    | 사용자 ID   |

### Request Example

```http
GET /api/v1/orders/me/history
X-User-Id: 1
```

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

- **Code:** `204 No Content`

사용자의 주문 내역이 없는 경우입니다.

### Error Response

- **Code:** `500 Internal Server Error`

응답 body 없음.

---

## `GET /orders/history/{user_id}`

특정 사용자의 주문 상품 내역을 조회합니다.

> Deprecated API입니다. 사용자용 API는 `GET /orders/me/history` 사용을 권장합니다.

### Path Parameters

| Name      | Type   | Required | Description |
| :-------- | :----- | :------: | :---------- |
| `user_id` | `Long` |    ✅    | 사용자 ID   |

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

- **Code:** `204 No Content`

사용자의 주문 내역이 없는 경우입니다.

---

## `DELETE /orders/{order_id}`

주문 취소를 요청합니다.

현재 코드 기준으로 주문 취소 saga는 비활성화되어 있어 정상적으로 취소 요청이 접수되지 않고 `409 Conflict`가 반환됩니다.

### Path Parameters

| Name       | Type   | Required | Description |
| :--------- | :----- | :------: | :---------- |
| `order_id` | `Long` |    ✅    | 주문 ID     |

### Success Response

- **Code:** `202 Accepted`

```text
1번 주문 취소 요청이 접수되었습니다.
```

### Current Behavior

- **Code:** `409 Conflict`

```text
주문 취소 saga는 현재 이벤트 흐름에서 비활성화되어 있습니다.
```

### Error Response

- **Code:** `404 Not Found`

```text
해당 주문을 찾을 수 없습니다.
```

- **Code:** `500 Internal Server Error`

```text
취소 처리 중 오류가 발생했습니다.
```

---

## `GET /orders/{order_id}/cs-history`

주문 취소/교환/반품 내역을 조회합니다.

현재 `OrderService.getCsHistory()`는 빈 리스트를 반환하므로, 주문이 존재하면 `204 No Content`가 반환됩니다.

### Path Parameters

| Name       | Type   | Required | Description |
| :--------- | :----- | :------: | :---------- |
| `order_id` | `Long` |    ✅    | 주문 ID     |

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

- **Code:** `204 No Content`

현재 구현상 반환 데이터가 없습니다.

### Error Response

- **Code:** `404 Not Found`

```text
해당 주문을 찾을 수 없습니다.
```

- **Code:** `500 Internal Server Error`

```text
주문 취소/교환/반품 내역 조회 실패
```
