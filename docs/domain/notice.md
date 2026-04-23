# Notice 도메인 명세

기준일: 2026-04-23

---

## 개요

공지사항(Notice) 도메인. 고객센터(`/cs`) 하위 커뮤니티 메뉴로 진입하며,
목록(NoticePage)과 상세(NoticeDetailPage)로 구성된다.

---

## 라우트

| 경로 | 컴포넌트 | 보호 |
|---|---|---|
| `/notice` | `NoticePage` | 없음 (공개) |
| `/notice/:id` | `NoticeDetailPage` | 없음 (공개) |

---

## API 엔드포인트

> 2026-04-23 백엔드 확정 — 목록 경로가 `/search/notices`로 변경됨 (검색 서버 라우팅)

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/search/notices` | 공지 목록 (페이지네이션 + 검색) — 검색 서버 |
| GET | `/notices/:id` | 공지 상세 (이미지 + 본문) |

### 목록 요청 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `page` | number | 0 | 페이지 번호 (0-based) |
| `size` | number | `NOTICE_PAGE_SIZE` (10) | 페이지당 항목 수 — `src/shared/utils/constants.js` |
| `period` | string | `PERIODS[0].value` | 기간 필터 (`WEEK` \| `MONTH` \| `THREE_MONTH` \| `ALL`) |
| `keyword` | string | — | 검색어 |
| `searchType` | string | `SEARCH_TYPES[0].value` | 검색 기준 (`title` \| `content`) |

### 목록 응답 구조

> ⚠️ **백엔드 미확정** — 아래 필드명은 가정값임. 실제 명세 수령 후 교체 필요.  
> 교체 위치: `src/api/noticeApi.js` `normalizeNoticeItem` fallback 체인

```json
{
  "data": {
    "content": [
      {
        "noticeId": null,
        "title": "[필독] 스위피 첫 구매 고객을 위한 이용 가이드",
        "isFixed": true,
        "createdAt": null
      },
      {
        "noticeId": 53,
        "title": "[EVENT] 신규 가입 1만 원 쿠폰 팩 증정 이벤트",
        "isFixed": false,
        "createdAt": "2026-01-15"
      }
    ],
    "totalPages": 5,
    "totalElements": 50,
    "pageNumber": 0,
    "pageSize": 10
  }
}
```

- 고정 공지(`isFixed: true`)는 `noticeId: null`, `createdAt: null`
- 고정 공지는 항목 상단 노출, id 열에 "공지" 텍스트 표시

### 상세 응답 구조

> ⚠️ **백엔드 미확정** — 아래 필드명은 가정값임. 실제 명세 수령 후 교체 필요.  
> 교체 위치: `src/api/noticeApi.js` `normalizeNoticeDetail` fallback 체인

```json
{
  "data": {
    "noticeId": 53,
    "title": "[EVENT] 신규 가입 1만 원 쿠폰 팩 증정 이벤트",
    "isFixed": false,
    "createdAt": "2026-01-15",
    "images": [
      "https://cdn.swiffy.co.kr/notice/53/img1.jpg",
      "https://cdn.swiffy.co.kr/notice/53/img2.jpg"
    ],
    "content": "안녕하세요 스위피입니다.\n\n본문 내용이 들어갑니다."
  }
}
```

- `images`: 이미지 URL 배열 (없으면 빈 배열 `[]`)
- `content`: 줄바꿈 `\n` 포함 텍스트 (whitespace-pre-wrap 렌더링)

---

## 검색 UI (목록 하단)

2행 구성. 검색 버튼 누를 때 서버 요청.

```
[ 기간 드롭다운 ▼ ]  [ 검색 기준 드롭다운 ▼ ]   ← 1행
[ 검색어 입력창                       ] [검색]   ← 2행
```

### 드롭다운 1 — 기간 (`period`)

| UI 표시 | API 전송값 | 기본값 |
|---|---|:---:|
| 일주일 | `WEEK` | ✅ |
| 한달 | `MONTH` | |
| 3개월 | `THREE_MONTH` | |
| 전체 | `ALL` | |

- 선택 즉시 서버 재요청 + 페이지 1로 리셋
- ⚠️ 백엔드 파라미터 값 확인 필요 (`WEEK` 형식인지, 날짜 범위인지)

### 드롭다운 2 — 검색 기준 (`searchType`)

| UI 표시 | API 전송값 | 기본값 |
|---|---|:---:|
| 제목 | `title` | ✅ |
| 내용 | `content` | |

- 검색 버튼 누를 때 `keyword`와 함께 전송
- `keyword`가 없으면 `searchType`은 전송하지 않음

### 검색어 입력 + 버튼

- 입력창에 검색어 작성 후 검색 버튼 클릭 시 서버 요청
- 검색 시 페이지 1로 리셋

---

## 비즈니스 규칙

- 고정 공지(`isFixed: true`)는 목록 최상단 고정, 번호 대신 "공지" 표시 (초록색 강조)
- 일반 공지는 id를 번호로 표시
- 상세 페이지: 이미지 먼저 노출, 이미지 없으면 텍스트 바로 표시
- 페이지네이션: 서버 사이드, 공유 `Pagination` 컴포넌트 사용
