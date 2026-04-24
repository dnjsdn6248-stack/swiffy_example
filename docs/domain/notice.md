# Notice 도메인 명세

기준일: 2026-04-23

---

## 개요

공지사항(Notice) 도메인. 고객센터(`/cs`) 하위 커뮤니티 메뉴로 진입하며,
목록(NoticePage)과 상세(NoticeDetailPage)로 구성된다.

- **목록** — Search Server(`searchApi.js`) `useSearchNoticesQuery` 사용
- **상세** — 별도 서버(`noticeApi.js`) `useGetNoticeDetailQuery` 사용

---

## 라우트

| 경로 | 컴포넌트 | 보호 |
|---|---|---|
| `/notice` | `NoticePage` | 없음 (공개) |
| `/notice/:id` | `NoticeDetailPage` | 없음 (공개) |

---

## API 엔드포인트

> 2026-04-23 백엔드 확정

| 메서드 | 경로 | 훅 | 파일 | 설명 |
|---|---|---|---|---|
| GET | `/search/notices` | `useSearchNoticesQuery` | `searchApi.js` | 공지 목록 (Search Server) |
| GET | `/notices/:id` | `useGetNoticeDetailQuery` | `noticeApi.js` | 공지 상세 |

---

## 목록 API (`/search/notices`)

### 요청 파라미터

> ✅ 백엔드 확정 (`docs/domain/search.md` 기준)

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `page` | number | 0 | 페이지 번호 (0-based) |
| `size` | number | `NOTICE_PAGE_SIZE` (10) | 페이지당 항목 수 — `src/shared/utils/constants.js` |
| `searchRange` | string | `일주일` | 기간 필터 (`일주일` \| `한달` \| `세달` \| `전체`) |
| `keyword` | string | — | 검색어 (없으면 미전송) |
| `searchType` | string | `제목` | 검색 기준 (`제목` \| `내용`) — keyword 있을 때만 전송 |

### 응답 구조

Search Server 공통 포맷 (`search.md` 참조):

```json
{
  "status": "success",
  "totalElements": 50,
  "totalPages": 5,
  "currentPage": 0,
  "data": [
    {
      "noticeId": 53,
      "title": "[EVENT] 신규 가입 1만 원 쿠폰 팩 증정 이벤트",
      "content": "본문 요약...",
      "createdAt": "2026-01-15",
      "updatedAt": "2026-01-15",
      "author": "스위피",
      "viewCount": 120,
      "noticeDetailUrl": "/notices/53"
    }
  ],
  "extra": { "menuTitle": "NOTICE" }
}
```

### 정규화 후 컴포넌트 수신값 (`searchApi.js` `normalizePage` + normalize 함수)

| 내부 필드 | 백엔드 원본 필드 |
|---|---|
| `id` | `noticeId` |
| `title` | `title` |
| `createdAt` | `createdAt` |
| `author` | `author` |
| `viewCount` | `viewCount` |
| `noticeDetailUrl` | `noticeDetailUrl` |

> ⚠️ **고정공지 미확정** — 현재 API는 고정공지 구분 없이 `noticeId` 번호 순서대로만 반환. 고정공지 표시 방식은 백엔드 확정 후 추가 예정.

---

## 상세 API (`/notices/:id`)

> ⚠️ **백엔드 미확정** — 아래 필드명은 가정값. 실제 명세 수령 후 교체 필요.
> 교체 위치: `src/api/noticeApi.js` `normalizeNoticeDetail` fallback 체인

| 내부 필드 | 백엔드 필드 후보 |
|---|---|
| `id` | `noticeId` → `notice_id` → `id` |
| `title` | `title` → `subject` → `name` |
| `isFixed` | `isFixed` → `is_fixed` → `pinned` → `fixed` |
| `createdAt` | `createdAt` → `created_at` → `registeredAt` → `date` |
| `updatedAt` | `updatedAt` → `updated_at` |
| `author` | `author` |
| `viewCount` | `viewCount` |
| `images` | `images` → `imageUrls` → `imageList` → `imgUrls` |
| `content` | `content` → `body` → `text` |

---

## 검색 UI (목록 하단)

2행 구성. 검색 버튼 누를 때 서버 요청.

```
[ 기간 드롭다운 ▼ ]  [ 검색 기준 드롭다운 ▼ ]   ← 1행
[ 검색어 입력창                       ] [검색]   ← 2행
```

### 드롭다운 1 — 기간 (`searchRange`) ✅ 확정

| UI 표시 | API 전송값 | 기본값 |
|---|---|:---:|
| 일주일 | `일주일` | ✅ |
| 한달 | `한달` | |
| 3개월 | `세달` | |
| 전체 | `전체` | |

- 선택 즉시 서버 재요청 + 페이지 1로 리셋

### 드롭다운 2 — 검색 기준 (`searchType`) ✅ 확정

| UI 표시 | API 전송값 | 기본값 |
|---|---|:---:|
| 제목 | `제목` | ✅ |
| 내용 | `내용` | |

- 검색 버튼 누를 때 `keyword`와 함께 전송
- `keyword`가 없으면 `searchType` 미전송

### 검색어 입력 + 버튼

- 입력창에 검색어 작성 후 검색 버튼 클릭 시 서버 요청
- 검색 시 페이지 1로 리셋

---

## 비즈니스 규칙

- 공지는 `noticeId` 번호 순서대로 표시
- ⚠️ 고정공지 표시 방식 미확정 — 백엔드 확정 후 적용 예정
- 상세 페이지: 이미지 먼저 노출, 이미지 없으면 텍스트 바로 표시
- 페이지네이션: 서버 사이드, 공유 `Pagination` 컴포넌트 사용
