# cart Server API 명세서

> **Base URL:** `https://localhost:8072/api/v1/`

---

## Cart 조회 API

### `GET /cart/`

현재 로그인한 사용자의 ACTIVE 장바구니를 조회한다. ACTIVE Cart가 없으면 새로 생성하지 않고 빈 목록을 반환한다.

#### Path Parameters

없음

#### Request Body

없음

#### Success Response

- **Code:** `200 OK`

```json
{
  "userId": 10,
  "items": [
    {
      "productId": 1001,
      "optionId": 2001,
      "quantity": 2
    },
    {
      "productId": 1002,
      "optionId": null,
      "quantity": 1
    }
  ]
}
```

#### Empty Response

- **Code:** `200 OK`

```json
{
  "userId": 10,
  "items": []
}
```

---

## Cart 상품 추가 API

### `POST /cart/additem`

장바구니에 상품을 추가한다. ACTIVE Cart가 없으면 생성한다. 동일한 `productId + optionId` 상품이 이미 있으면 수량을 합산한다.

> **optionId 규칙:** 옵션이 없는 상품은 `optionId: 0`으로 전송한다. 장바구니 아이템은 `productId + optionId` 조합으로 식별되므로 `0`은 "옵션 없음"을 의미하는 고정 sentinel 값이다.

#### Path Parameters

없음

#### Request Body

```json
// 옵션이 있는 상품
{
  "productId": 1001,
  "optionId": 2001,
  "quantity": 2
}

// 옵션이 없는 상품
{
  "productId": 1002,
  "optionId": 0,
  "quantity": 1
}
```

#### Success Response

- **Code:** `201 CREATED`

```json
{
  "userId": 10,
  "items": [
    {
      "productId": 1001,
      "optionId": 2001,
      "quantity": 2
    }
  ]
}
```

---

## Cart 상품 수량 변경 API

### `PUT /cart/frontend/item/quantity`

장바구니 상품 수량을 변경한다. 대상 상품은 `cartItemId`가 아니라 `productId + optionId`로 식별한다. `quantity`가 `0`이면 해당 상품을 삭제한다.

#### Path Parameters

없음

#### Request Body

```json
{
  "productId": 1001,
  "optionId": 2001,
  "quantity": 3
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
      "optionId": 2001,
      "quantity": 3
    }
  ]
}
```

---

## Cart 상품 옵션 변경 API

### `PUT /cart/frontend/item/option`

장바구니 상품 옵션을 변경한다. 대상 상품은 `productId + optionId`로 식별하고, 변경할 옵션은 `newOptionId`로 전달한다. 변경 대상 옵션이 이미 장바구니에 있으면 수량을 합치고 기존 항목은 삭제한다.

#### Path Parameters

없음

#### Request Body

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
      "quantity": 2
    }
  ]
}
```

---

## Cart 상품 단건 삭제 API

### `DELETE /cart/frontend/item`

장바구니 상품을 단건 삭제한다. 대상 상품은 `cartItemId`가 아니라 `productId + optionId`로 식별한다.

#### Path Parameters

없음

#### Request Body

```json
{
  "productId": 1001,
  "optionId": 2001
}
```

#### Success Response

- **Code:** `200 OK`

```json
{
  "userId": 10,
  "items": []
}
```

---

## Cart 전체 선택 상태 변경 API

### `PUT /cart/frontend/item/select-all`

장바구니 전체 상품의 선택 상태를 변경한다. 선택 상태는 선택 삭제 같은 장바구니 명령 처리에만 사용하며, `GET /cart/frontend/` 응답에는 포함하지 않는다.

#### Path Parameters

없음

#### Request Body

```json
{
  "isSelectedAll": true
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
      "optionId": 2001,
      "quantity": 2
    }
  ]
}
```

---

## Cart 개별 선택 상태 변경 API (미완성)

### `PUT /cart/frontend/item/select`

장바구니 상품 1개의 선택 상태를 변경한다. 대상 상품은 `productId + optionId`로 식별한다. 선택 상태는 응답에 포함하지 않는다.

#### Path Parameters

없음

#### Request Body

```json
{
  "productId": 1001,
  "optionId": 2001,
  "isSelected": false
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
      "optionId": 2001,
      "quantity": 2
    }
  ]
}
```

---

## Cart 선택 상품 삭제 API (미완성)

### `DELETE /cart/frontend/item/selected`

현재 서버에 선택 상태로 저장된 장바구니 상품을 삭제한다.

#### Path Parameters

없음

#### Request Body

없음

#### Success Response

- **Code:** `200 OK`

```json
{
  "userId": 10,
  "items": []
}
```
