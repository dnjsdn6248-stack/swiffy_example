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
