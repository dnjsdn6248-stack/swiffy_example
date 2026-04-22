# Payment Server API 명세서

> **Base URL:** `https://localhost:8072/api/v1/payments`

현재 프로젝트에서 `paymentserver`는 프론트와 TossPayments를 연결하는 결제 브리지 역할을 담당합니다.  
외부 공개 경로는 모두 `gatewayserver` 기준 `/api/v1/payments/**` 이고, 내부 `paymentserver`는 `/payments/**` 경로를 사용합니다.

---

### `POST /payments/prepare`

결제 준비 레코드를 생성하고, 프론트가 Toss 위젯을 띄우는 데 필요한 기본 정보를 반환합니다.

#### **Request Headers**

| Name | Value / Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `Accept` | `application/json` | ✅ | 응답 데이터 형식 |
| `Content-Type` | `application/json` | ✅ | JSON 요청 본문 |
| `X-XSRF-TOKEN` | `{csrf-token}` | ✅ | CSRF 토큰 |
| `Cookie` | 인증 쿠키 + `XSRF-TOKEN` | ✅ | 로그인 및 CSRF 검증 |

#### **Request Body**

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `orderId` | `Long` | ✅ | 주문 ID |
| `orderName` | `String` | ✅ | 주문명 또는 대표 상품명 |
| `amount` | `Long` | ✅ | 결제 금액 (`1` 이상) |
| `customerName` | `String` | ❌ | 주문자명 |
| `customerEmail` | `String` | ❌ | 주문자 이메일 |
| `currency` | `String` | ❌ | 통화 코드, 기본값 `KRW` |

#### **Request Body Example**

```json
{
  "orderId": 200001,
  "orderName": "어글어글 스팀 100g 8종",
  "amount": 12900,
  "customerName": "홍길동",
  "customerEmail": "test@example.com",
  "currency": "KRW"
}
```

#### **Success Response**

* **Code:** `201 CREATED`
* **Response Headers:**
  * `Content-Type: application/json; charset=utf-8`
* **Content:**

```json
{
  "paymentId": "pay_7b3e04d227af44d2b2a2b9f7b7f1c555",
  "orderId": 200001,
  "orderName": "어글어글 스팀 100g 8종",
  "amount": 12900,
  "customerName": "홍길동",
  "customerEmail": "test@example.com",
  "currency": "KRW",
  "status": "READY"
}
```

#### **참고사항**

* 프론트는 `userId`를 body에 보내지 않습니다.
* `X-User-Id` 헤더는 gatewayserver가 인증 성공 후 내부적으로 주입합니다.
* `paymentId`는 이후 취소 API 경로에 사용됩니다.
* `prepare`는 결제 준비 단계이며 실제 승인 완료는 `confirm`에서 처리됩니다.

---

### `POST /payments/confirm`

Toss 위젯 결제 후 받은 `paymentKey`, `orderId`, `amount`를 이용해 백엔드가 Toss 승인 API를 호출합니다.

#### **Request Headers**

| Name | Value / Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `Accept` | `application/json` | ✅ | 응답 데이터 형식 |
| `Content-Type` | `application/json` | ✅ | JSON 요청 본문 |
| `X-XSRF-TOKEN` | `{csrf-token}` | ✅ | CSRF 토큰 |
| `Cookie` | 인증 쿠키 + `XSRF-TOKEN` | ✅ | 로그인 및 CSRF 검증 |

#### **Request Body**

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `paymentKey` | `String` | ✅ | Toss 위젯이 반환한 결제 키 |
| `orderId` | `Long` | ✅ | 주문 ID |
| `amount` | `Long` | ✅ | 결제 금액 |

#### **Request Body Example**

```json
{
  "paymentKey": "tgen_20260417123456abc123",
  "orderId": 200001,
  "amount": 12900
}
```

#### **Success Response**

* **Code:** `200 OK`
* **Response Headers:**
  * `Content-Type: application/json; charset=utf-8`
* **Content:**

```json
{
  "paymentId": "pay_7b3e04d227af44d2b2a2b9f7b7f1c555",
  "orderId": 200001,
  "userId": 7,
  "provider": "TOSS",
  "method": "CARD",
  "easyPayProvider": null,
  "amount": 12900,
  "currency": "KRW",
  "paymentKey": "tgen_20260417123456abc123",
  "status": "APPROVED",
  "failureCode": null,
  "failureMessage": null,
  "approvedAt": "2026-04-17T15:30:00",
  "canceledAt": null
}
```

#### **Error Response**

* **Code:** `409 CONFLICT`
  * **Description:** Toss 승인 실패 또는 결제 상태 충돌
  * **Content Example:**

```json
{
  "timestamp": "2026-04-17T15:32:00",
  "status": 409,
  "error": "Conflict",
  "message": "Toss 승인 API 호출에 실패했습니다."
}
```

#### **참고사항**

* 승인 성공 시 `paymentserver`는 내부적으로 `PaymentCompleted` outbox 이벤트를 적재합니다.
* 승인 실패 시 `paymentserver`는 내부적으로 `PaymentFailed` outbox 이벤트를 적재합니다.
* 승인 성공/실패 시 주문 단위 SSE 구독 채널에도 결과 이벤트를 발행합니다.

---

### `POST /payments/{paymentId}/cancel`

승인된 결제를 취소합니다.

#### **Path Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `paymentId` | `String` | ✅ | 내부 결제 ID |

#### **Request Headers**

| Name | Value / Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `Accept` | `application/json` | ✅ | 응답 데이터 형식 |
| `Content-Type` | `application/json` | ✅ | JSON 요청 본문 |
| `X-XSRF-TOKEN` | `{csrf-token}` | ✅ | CSRF 토큰 |
| `Cookie` | 인증 쿠키 + `XSRF-TOKEN` | ✅ | 로그인 및 CSRF 검증 |

#### **Request Body**

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `reason` | `String` | ✅ | 취소 사유 |
| `reasonType` | `String` | ✅ | 취소 사유 타입 (`CUSTOMER_CHANGE_MIND` 등 enum 값) |
| `cancelAmount` | `Long` | ✅ | 취소 금액 |

#### **Request Body Example**

```json
{
  "reason": "고객 단순 변심",
  "reasonType": "CUSTOMER_CHANGE_MIND",
  "cancelAmount": 12900
}
```

#### **Success Response**

* **Code:** `200 OK`
* **Response Headers:**
  * `Content-Type: application/json; charset=utf-8`
* **Content:**

```json
{
  "paymentId": "pay_7b3e04d227af44d2b2a2b9f7b7f1c555",
  "orderId": 200001,
  "userId": 7,
  "provider": "TOSS",
  "method": "CARD",
  "easyPayProvider": null,
  "amount": 12900,
  "currency": "KRW",
  "paymentKey": "tgen_20260417123456abc123",
  "status": "CANCELED",
  "failureCode": null,
  "failureMessage": null,
  "approvedAt": "2026-04-17T15:30:00",
  "canceledAt": "2026-04-17T16:00:00"
}
```

---

### `GET /payments/orders/{orderId}`

주문 ID 기준으로 현재 결제 상태를 조회합니다.

#### **Path Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `orderId` | `Long` | ✅ | 주문 ID |

#### **Request Headers**

| Name | Value / Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `Accept` | `application/json` | ✅ | 응답 데이터 형식 |
| `Cookie` | 인증 쿠키 | ✅ | 로그인 사용자 식별 |

#### **Success Response**

* **Code:** `200 OK`
* **Response Headers:**
  * `Content-Type: application/json; charset=utf-8`
* **Content:**

```json
{
  "paymentId": "pay_7b3e04d227af44d2b2a2b9f7b7f1c555",
  "orderId": 200001,
  "userId": 7,
  "provider": "TOSS",
  "method": "CARD",
  "easyPayProvider": null,
  "amount": 12900,
  "currency": "KRW",
  "paymentKey": "tgen_20260417123456abc123",
  "status": "APPROVED",
  "failureCode": null,
  "failureMessage": null,
  "approvedAt": "2026-04-17T15:30:00",
  "canceledAt": null
}
```

---

### `GET /payments/orders/{orderId}/events`

주문 ID 기준으로 결제 상태를 SSE(Server-Sent Events)로 구독합니다.  
프론트는 이 스트림을 열어두고 결제 완료/실패 메시지를 실시간으로 받을 수 있습니다.

#### **Path Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `orderId` | `Long` | ✅ | 주문 ID |

#### **Request Headers**

| Name | Value / Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `Accept` | `text/event-stream` | ✅ | SSE 스트림 수신 |
| `Cookie` | 인증 쿠키 | ✅ | 로그인 사용자 식별 |

#### **Success Response**

* **Code:** `200 OK`
* **Response Headers:**
  * `Content-Type: text/event-stream;charset=UTF-8`

#### **Event Example: payment-status**

```text
event: payment-status
id: 200001
data: {"orderId":200001,"paymentId":"pay_7b3e04d227af44d2b2a2b9f7b7f1c555","status":"APPROVED","message":"결제가 완료되었습니다.","failureCode":null,"failureMessage":null,"approvedAt":"2026-04-17T15:30:00","failedAt":null}
```

#### **Heartbeat Example**

```text
:keepalive
```

#### **참고사항**

* heartbeat는 현재 `100ms` 간격으로 전송됩니다.
* 실제 상태 이벤트 이름은 `payment-status` 입니다.
* 승인 실패 시에는 `status: FAILED`, `message: 결제에 실패했습니다.` 형태로 내려옵니다.
* 현재 구현은 주문별 최근 이벤트 1건을 replay 하므로, 재연결 시 마지막 상태를 다시 받을 수 있습니다.

---

### 3. 프론트 연동 참고사항

* 외부 공개 경로는 모두 `gatewayserver` 기준 `/api/v1/payments/**` 입니다.
  * 내부 `paymentserver` 경로 `/payments/**`를 직접 호출하지 않습니다.
* `prepare`와 `confirm`은 모두 프론트가 직접 호출합니다.
* `prepare`는 결제 준비 단계이고, 실제 결제 승인 확정은 `confirm`에서 처리됩니다.
* `confirm` 성공 후 프론트는 필요 시 `GET /api/v1/payments/orders/{orderId}` 로 상태를 재조회할 수 있습니다.
* 실시간 완료 알림이 필요하면 `GET /api/v1/payments/orders/{orderId}/events` 를 구독합니다.
* 결제 성공/실패 결과는 최종적으로 `orderserver`가 주문 상태에 반영합니다.
* 프론트가 보여줄 최종 결제내역 화면은 `orderserver` 기준으로 조회하는 구조가 권장됩니다.
* 현재 1번 구조 기준으로 자동 saga 흐름이 완성되려면 `inventoryserver`가 `PaymentRequested` 이벤트를 발행해야 합니다.
