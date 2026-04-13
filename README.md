# UFO캐처 피규어 캘린더

일본 프라이즈 피규어(UFO캐처/크레인게임 경품) 발매 일정을 한눈에 확인할 수 있는 캘린더 웹앱입니다.

## 주요 기능

- 월별 캘린더 뷰로 피규어 발매 일정 확인
- 모바일 리스트 뷰 지원
- 카테고리별 필터링 (피규어 / 인형 / 기타)
- 피규어 상세 모달 (이미지, 일본어/한국어/영어 이름)
- DMM 온라인 크레인 게임 데이터 동기화

## 기술 스택

- **프론트엔드**: Next.js 16, React 19, TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: Firebase Firestore
- **이미지**: Next.js Image 최적화

## 시작하기

### 환경 변수 설정

`.env.local` 파일을 생성하고 Firebase 설정을 추가합니다:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 스크립트

| 스크립트 | 설명 |
|---------|------|
| `scripts/sync-figures.ts` | JSON 파일에서 Firestore로 피규어 데이터 동기화 |
| `scripts/convert-dmm.ts` | DMM 온라인 크레인 게임 데이터 변환 |
| `scripts/add-figure.ts` | 개별 피규어 추가 |
| `scripts/delete-figure.ts` | 피규어 삭제 |
| `scripts/list-figures.ts` | 등록된 피규어 목록 조회 |
