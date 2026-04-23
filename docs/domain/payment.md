# Payment 도메인

기준일: 2026-04-23

## 개요

`paymentserver`는 프론트와 TossPayments를 연결하는 결제 브리지 역할을 담당한다.  
외부 공개 경로는 `gatewayserver` 기준 `/api/v1/payments/**` 이고, 내부 `paymentserver`는 `/payments/**` 경로를 사용한다.

> **Base URL:** `https://localhost:8072/api/v1`

---

## 결제 상태값 정의

| status | 설명 |
|---|---|
| `READY` | 결제 준비 (prepare 완료) |
| `PAID` | 결제 승인 완료 (confirm 완료) |
| `CANCELLED` | 결제 취소 완료 |

---

## API 엔드포인트 (`src/api/paymentApi.js`)

`apiSlice.injectEndpoints()`로 정의.

| 훅 | 메서드 | 경로 | 구현 여부 |
|---|---|---|:---:|
| `usePreparePaymentMutation()` | POST | `/payments/prepare` | ✅ |
| `useConfirmPaymentMutation()` | POST | `/payments/confirm` | ✅ |
| `useCancelPaymentMutation()` | POST | `/payments/{paymentId}/cancel` | ❌ 미구현 |
| `useGetPaymentByOrderIdQuery(orderId)` | GET | `/payments/orders/{orderId}` | ❌ 미구현 |
| SSE 구독 | GET | `/payments/orders/{orderId}/events` | ❌ 미구현 |

---

## `POST /payments/prepare`

결제 준비 레코드를 생성한다. 주문 생성 후 Toss 위젯 `requestPayment()` 호출 전에 실행.

### Request Body

| Name | Type | Required | Description |
|---|---|:---:|---|
| `orderId` | Long | ✅ | 주문 ID |
| `orderName` | String | ✅ | 주문명 또는 대표 상품명 |
| `amount` | Long | ✅ | 결제 금액 (1 이상) |
| `customerName` | String | ❌ | 주문자명 |
| `customerEmail` | String | ❌ | 주문자 이메일 |
| `currency` | String | ❌ | 통화 코드, 기본값 `KRW` |

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

### Success Response — `201 Created`

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

### Error Response

| Code | 설명 |
|---|---|
| `400` | 요청 파라미터 누락 또는 검증 실패 |
| `401` | 인증 실패 |
| `403` | 권한 없음 |
| `500` | 서버 내부 오류 |

---

## `POST /payments/confirm`

Toss 위젯 결제 성공 후 받은 결제 정보를 최종 승인한다.  
`successUrl` 리다이렉트 시 URL 파라미터(`paymentKey`, `orderId`, `amount`)를 그대로 전달.

### Request Body

| Name | Type | Required | Description |
|---|---|:---:|---|
| `paymentKey` | String | ✅ | Toss 위젯이 반환한 결제 키 |
| `orderId` | Long | ✅ | 주문 ID |
| `amount` | Long | ✅ | 결제 금액 |

```json
{
  "paymentKey": "tgen_20260417123456abc123",
  "orderId": 200001,
  "amount": 12900
}
```

### Success Response — `200 OK`

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
  "status": "PAID",
  "failureCode": null,
  "failureMessage": null,
  "approvedAt": "2026-04-17T15:30:00",
  "canceledAt": null
}
```

### Error Response

| Code | 설명 |
|---|---|
| `400` | 요청 파라미터 누락 또는 검증 실패 |
| `401` | 인증 실패 |
| `403` | 권한 없음 |
| `409` | Toss 승인 실패 또는 결제 상태 충돌 |
| `500` | 서버 내부 오류 |

---

## `POST /payments/{paymentId}/cancel`

승인된 결제를 취소한다.

### Path Parameters

| Name | Type | Required | Description |
|---|---|:---:|---|
| `paymentId` | String | ✅ | 내부 결제 ID (`paymentId`) |

### Request Body

| Name | Type | Required | Description |
|---|---|:---:|---|
| `reason` | String | ✅ | 취소 사유 (자유 텍스트) |
| `reasonType` | String | ✅ | 취소 사유 타입 (`"USER"` 등 enum) |
| `cancelAmount` | Long | ✅ | 취소 금액 |

```json
{
  "reason": "고객 단순 변심",
  "reasonType": "USER",
  "cancelAmount": 12900
}
```

### Success Response — `200 OK`

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
  "status": "CANCELLED",
  "failureCode": null,
  "failureMessage": null,
  "approvedAt": "2026-04-17T15:30:00",
  "canceledAt": "2026-04-17T16:00:00"
}
```

### Error Response

| Code | 설명 |
|---|---|
| `400` | 요청 파라미터 누락 또는 검증 실패 |
| `401` | 인증 실패 |
| `403` | 권한 없음 |
| `404` | 결제 정보 없음 |
| `409` | 취소 상태 충돌 |
| `500` | 서버 내부 오류 |

---

## `GET /payments/orders/{orderId}`

주문 ID 기준으로 현재 결제 상태를 조회한다.

### Path Parameters

| Name | Type | Required | Description |
|---|---|:---:|---|
| `orderId` | Long | ✅ | 주문 ID |

### Success Response — `200 OK`

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
  "status": "PAID",
  "failureCode": null,
  "failureMessage": null,
  "approvedAt": "2026-04-17T15:30:00",
  "canceledAt": null
}
```

### Error Response

| Code | 설명 |
|---|---|
| `401` | 인증 실패 |
| `404` | 결제 정보 없음 |
| `500` | 서버 내부 오류 |

---

## `GET /payments/orders/{orderId}/events` — SSE

주문 ID 기준으로 결제 상태 이벤트를 SSE(Server-Sent Events)로 구독한다.  
프론트는 이 스트림을 열어두고 결제 완료/실패 메시지를 실시간으로 수신한다.

### Path Parameters

| Name | Type | Required | Description |
|---|---|:---:|---|
| `orderId` | Long | ✅ | 주문 ID |

### Response Headers

```
Content-Type: text/event-stream;charset=UTF-8
```

### Event: `payment-status`

```text
event: payment-status
id: 200001
data: {"orderId":200001,"paymentId":"pay_7b3e04d227af44d2b2a2b9f7b7f1c555","status":"PAID","message":"결제가 완료되었습니다.","failureCode":null,"failureMessage":null,"approvedAt":"2026-04-17T15:30:00","failedAt":null}
```

### Heartbeat

```text
:keepalive
```

> - heartbeat 간격: `100ms`
> - 재연결 시 마지막 상태 이벤트 1건을 replay 한다.
> - 승인 실패: `status: "FAILED"`, `message: "결제에 실패했습니다."`

### Error Response

| Code | 설명 |
|---|---|
| `401` | 인증 실패 |
| `500` | 서버 내부 오류 |

---

## 환경변수

| 변수 | 설명 | fallback |
|---|---|---|
| `VITE_TOSS_CLIENT_KEY` | Toss 결제 SDK 초기화 키 (`CheckoutPage.jsx`) | 없음 — 반드시 `.env`에 존재해야 함 |
| `VITE_BASE_URL` | 결제 성공/실패 콜백 URL 도메인 (`successUrl`, `failUrl`) | `window.location.origin` |

> - `.env` 파일 마지막 줄에 개행문자가 없으면 dotenv 파서가 해당 줄을 읽지 못한다. `cat -A .env` 실행 시 모든 줄 끝에 `$`가 있어야 정상.
> - `test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm`은 Toss 공식 문서 샘플 키. 실제 테스트 시 Toss 개발자 콘솔에서 발급한 프로젝트 전용 키(`test_ck_...`)로 교체 필요.

---

## 프론트 연동 흐름

```
1. createOrder       → POST /orders                → orderId 획득
2. preparePayment    → POST /payments/prepare      → 결제 레코드 생성 (status: READY)
3. requestPayment    → Toss 위젯 호출              → 사용자 결제 진행
4. successUrl 리다이렉트 → /payment/success?paymentKey=...&orderId=...&amount=...
5. confirmPayment    → POST /payments/confirm      → 최종 승인 (status: PAID)
6. navigate          → /order/detail/:orderId
```

> - `prepare`와 `confirm`은 모두 프론트가 직접 호출한다.
> - 외부 공개 경로는 모두 `gatewayserver` 기준 `/api/v1/payments/**`이다. 내부 `paymentserver` 경로 `/payments/**`를 직접 호출하지 않는다.
> - 프론트가 `userId`를 body에 보내지 않는다. `X-User-Id` 헤더는 gatewayserver가 인증 성공 후 내부적으로 주입한다.
> - 승인 완료 후 최종 결제 내역 화면은 `orderserver` 기준으로 조회한다.
> - 실시간 완료 알림이 필요하면 `GET /payments/orders/{orderId}/events` SSE를 구독한다.
