# CartServer API 명세서

> Base URL: `https://localhost:8072/api/v1/cart`

## 공통 규칙

### `CartPageResponse`

```json
{
  "userId": 10,
  "items": [
    {
      "productId": 1002,
      "optionId": 0,
      "quantity": 1,
      "isSelected": true
    }
  ],
  "page": 0,
  "size": 5,
  "totalItems": 1,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

### `CartResponse`

```json
{
  "userId": 10,
  "items": [
    {
      "productId": 1001,
      "optionId": 2001,
      "quantity": 2,
      "isSelected": true
    }
  ]
}
```

---

## 1. 장바구니 조회

### `GET /api/v1/cart?page={page}`

현재 로그인한 사용자의 장바구니를 페이지 단위로 조회한다.

#### Request Parameters:

| Name   | Type      | Required | Description                            |
| :----- | :-------- | :------: | :------------------------------------- |
| `page` | `Integer` |    ❌    | 0부터 시작하는 페이지 번호. 기본값 `0` |

Success Response:

- `200 OK`

```json
{
  "userId": 10,
  "items": [
    {
      "productId": 1002,
      "optionId": 0,
      "quantity": 1,
      "isSelected": false
    },
    {
      "productId": 1001,
      "optionId": 2001,
      "quantity": 2,
      "isSelected": true
    }
  ],
  "page": 0,
  "size": 5,
  "totalItems": 7,
  "totalPages": 2,
  "hasNext": true,
  "hasPrevious": false
}
```

#### Empty Response

```json
{
  "userId": 10,
  "items": [],
  "page": 0,
  "size": 5,
  "totalItems": 0,
  "totalPages": 0,
  "hasNext": false,
  "hasPrevious": false
}
```

호환 경로:

- `GET /api/v1/cart/all?page={page}`

---

## 2. 상품 담기

### `POST /api/v1/cart/additem`

장바구니에 상품을 추가한다.

#### Request Body:

```json
{
  "productId": 1001,
  "optionId": 2001,
  "quantity": 2
}
```

#### Success Response:

- `201 CREATED`

```json
{
  "userId": 10,
  "items": [
    {
      "productId": 1001,
      "optionId": 2001,
      "quantity": 2,
      "isSelected": true
    }
  ]
}
```

옵션 없는 상품 예시:

```json
{
  "productId": 1002,
  "quantity": 1
}
```

---

## 3. 전체 선택 변경

### `PUT /api/v1/cart/select-all`

장바구니 전체 상품의 선택 상태를 변경한다.

Request Body:

```json
{
  "isSelectedAll": true
}
```

---

## 4. 개별 선택 변경

### `PUT /api/v1/cart/select`

개별 상품의 선택 상태를 변경한다.

Request Body:

```json
{
  "productId": 1001,
  "optionId": 2001,
  "isSelected": false
}
```

---

## 5. 옵션 변경

### `PUT /api/v1/cart/option`

장바구니 상품의 옵션을 변경한다.

#### Request Body:

```json
{
  "productId": 1001,
  "optionId": 2001,
  "newOptionId": 2002
}
```

#### Success Response

- **Code:** `200 OK`

```json
{
  "userId": 10,
  "items": [
    {
      "productId": 1001,
      "optionId": 2002,
      "quantity": 2,
      "isSelected": true
    }
  ]
}
```

---

## 6. 수량 변경

### `PUT /api/v1/cart/quantity`

장바구니 상품 수량을 변경한다.

Request Body:

```json
{
  "productId": 1001,
  "optionId": 2001,
  "quantity": 3
}
```

---

## 7. 단건 삭제

### `DELETE /api/v1/cart`

장바구니 상품 1개를 삭제한다.

#### Request Body:

```json
{
  "productId": 1001,
  "optionId": 2001
}
```

## 8. 선택 항목 삭제

### `DELETE /api/v1/cart/selected`

선택된 장바구니 상품을 삭제한다.

#### Request Body:

```text
없음
```

---
