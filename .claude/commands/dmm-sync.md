# DMM 온라인 크레인 게임 피규어 동기화

DMM 온라인 크레인 게임(DMMオンクレ)의 신규/입하 예정 피규어를 Firestore DB에 동기화한다.

## 워크플로우

### Step 1: DMM 페이지 데이터 가져오기

DMM 오운크레 사이트는 로그인이 필요하다. 다음 순서로 시도:

1. **사용자가 URL을 제공한 경우**: WebFetch로 해당 URL을 가져온다.
2. **WebFetch가 실패한 경우 (로그인 리다이렉트 등)**: 사용자에게 다음을 요청한다:
   - 브라우저에서 DMM 오운크레 페이지를 열고
   - 페이지 HTML 소스를 복사해서 붙여넣거나
   - 스크린샷을 제공하거나
   - 피규어 목록을 텍스트로 직접 제공
3. **대안 소스**: 사용자가 tokutame.net 등 공개 소스 URL을 제공하면 그것을 사용한다.

### Step 2: 피규어 데이터 파싱

가져온 페이지/데이터에서 각 피규어의 정보를 추출한다:

- **nameJa** (필수): 일본어 상품명 - DB 중복 체크의 기준 키
- **nameKo**: 한국어 이름 (일본어에서 번역)
- **nameEn**: 영어 이름 (일본어에서 번역)
- **imageUrl**: 피규어 이미지 URL
- **date**: 입하 예정일 (YYYY-MM-DD)
- **time**: 입하 시간 (HH:mm, 없으면 "00:00")
- **sourceUrl**: 원본 페이지 URL

파싱 시 주의사항:
- DMM 페이지에서는 보통 상품명, 이미지, 입하일이 카드/리스트 형태로 나열된다
- 날짜가 "4月15日" 형식이면 현재 연도를 기준으로 YYYY-MM-DD로 변환
- 이름 번역 시 작품명은 공식 한국어/영어 제목을 사용 (예: 鬼滅の刃 → 귀멸의 칼날 / Demon Slayer)

### Step 3: 중복 체크 및 동기화

1. 파싱한 데이터를 JSON 배열로 만들어 `tmp-sync-figures.json` 파일에 저장한다
2. 동기화 스크립트를 실행한다:

```bash
npx tsx scripts/sync-figures.ts tmp-sync-figures.json
```

이 스크립트는 자동으로:
- 해당 월의 기존 DB 데이터를 조회
- **nameJa**가 일치하는 피규어는 스킵
- 새로운 피규어만 Firestore에 추가 (이미지는 외부 URL 직접 저장)

3. 실행 결과를 사용자에게 보고한다:
   - 추가된 피규어 수
   - 스킵된 피규어 수 (이미 DB에 있음)
   - 실패한 피규어 수 및 원인

### Step 4: 정리

- `tmp-sync-figures.json` 임시 파일을 삭제한다
- 추가된 피규어 목록을 요약해서 보여준다

## JSON 데이터 형식

```json
[
  {
    "nameKo": "귀멸의 칼날 카마도 탄지로",
    "nameEn": "Demon Slayer Kamado Tanjiro",
    "nameJa": "『鬼滅の刃』竈門炭治郎",
    "imageUrl": "https://example.com/image.jpg",
    "date": "2026-05-15",
    "time": "14:00",
    "sourceUrl": "https://www.dmm.com/netgame/kuji/"
  }
]
```

## 주의사항

- `serviceAccountKey.json`이 프로젝트 루트에 있어야 한다 (Firebase Admin SDK 인증용)
- 이미지 URL은 검증 없이 직접 저장된다 (외부 URL이 유효한지 사전에 확인 필요)
- nameJa가 정확히 일치해야 중복으로 판단한다 (부분 일치 아님)
