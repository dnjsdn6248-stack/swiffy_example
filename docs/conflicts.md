# 충돌 리포트

API 명세 변경 적용 과정에서 발생한 이전 코드와의 충돌 기록.

---

## [CART-01] `DELETE /cart/selected` 제거

- **발생일**: 2026-04-24
- **관련 명세**: CartServer API 명세서 (2026-04-24 업데이트)
- **상태**: ✅ 해결 — 2026-04-24 Cart API 재업데이트로 선택삭제 복원

### 내용

기존 명세에 있던 `DELETE /api/v1/cart/selected` (선택 항목 일괄 삭제) 엔드포인트가 한때 제거됐으나, 이후 Cart API 재업데이트에서 엔드포인트 구조가 변경되어 복원됨.

### 최종 엔드포인트 구조

| 엔드포인트 | 용도 |
| ---------- | ---- |
| `DELETE /cart/selected` | **단건 삭제** — 카드 1개 「삭제」 버튼 |
| `DELETE /cart/selecteditems` | **복수 삭제** — 체크박스 선택 「선택삭제」 버튼 |

### 영향 범위

| 파일 | 변경 내용 |
| ---- | --------- |
| `src/api/cartApi.js` | `removeCartItem` URL → `/cart/selected`, `removeSelectedCartItems` 추가 (`DELETE /cart/selecteditems`) |
| `src/pages/CartPage.jsx` | 「선택삭제」 버튼 및 `handleRemoveSelected` 핸들러 복원, 더보기 페이지네이션 추가 |

### 현재 상태

선택삭제 기능 복원 완료 (2026-04-24). 단건·복수 삭제 엔드포인트 분리 적용.

---

## [CHECKOUT-01] `renderPaymentMethods` Promise fulfilled 미전이

- **발생일**: 2026-04-24
- **관련 파일**: `src/pages/CheckoutPage.jsx`
- **상태**: ✅ 해결 — useEffect 의존성 배열 수정

### 내용

Toss 결제위젯의 `renderPaymentMethods` Promise가 fulfilled 상태로 전이되지 않아 결제수단 UI가 로드되지 않는 문제.

### 원인

위젯 렌더링 useEffect의 의존성 배열에 `finalAmount > 0` (boolean 표현식)을 사용한 것이 원인.

```js
// 문제 코드
}, [widgets, finalAmount > 0, widgetsRendered])
```

**실행 흐름**:
1. `loadTossPayments` 완료 → `setWidgets(w)` → dep `widgets` 변화 → effect 실행
2. 이 시점에 `finalAmount = 0` (product fetch 진행 중) → `finalAmount <= 0` guard → 조기 반환
3. product fetch 완료 → `onReady` 호출 → `finalAmount` 증가
4. dep `finalAmount > 0`이 `false → true` 로 전환되어야 effect 재실행되는데, product fetch가 느리거나 실패하면 전환이 일어나지 않음
5. effect 재실행 없음 → `renderPaymentMethods` 호출되지 않음 → 스피너 무한 표시

### 해결

`finalAmount > 0` boolean 표현식 대신 `finalAmount` 값 자체를 의존성으로 사용.

```js
// 수정 코드
}, [widgets, finalAmount, widgetsRendered])
```

`finalAmount`가 0→양수로 변할 때, 그리고 이후 금액이 바뀔 때마다 effect가 재실행된다. `widgetsRendered` guard가 중복 렌더링을 방지하므로 안전하다.

### 영향 범위

| 파일 | 변경 내용 |
| ---- | --------- |
| `src/pages/CheckoutPage.jsx` | 위젯 렌더 useEffect dep `finalAmount > 0` → `finalAmount` |
