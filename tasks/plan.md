# UFO캐처 피규어 캘린더 - 아키텍처 계획

## 1. 기술 스택

| 영역 | 기술 | 선정 이유 |
|------|------|-----------|
| **프레임워크** | Next.js 15 (App Router) | 정적 사이트 + Firestore 클라이언트 연동 |
| **언어** | TypeScript | 타입 안전성 |
| **UI** | React 19 + Tailwind CSS 4 | 빠른 UI 개발, 캘린더 레이아웃 |
| **DB** | Firebase Firestore | 클라이언트에서 직접 읽기, 무료 티어 충분 |
| **이미지 저장** | Firebase Storage | 클라우드 이미지 저장 |
| **데이터 관리** | Firebase Admin SDK (스크립트) | Claude가 CLI 스크립트로 데이터 추가/삭제 |

## 2. 데이터 모델

### Firestore 컬렉션

```
firestore/
├── figures/                    # 피규어 컬렉션
│   └── {figureId}/
│       ├── nameKo: string      // 한국어 이름
│       ├── nameEn: string      // 영어 이름
│       ├── nameJa: string      // 일본어 이름
│       ├── imageUrl: string    // Firebase Storage 이미지 URL
│       ├── date: timestamp     // 캘린더 표시 날짜
│       ├── time: string        // 시간 (HH:mm)
│       ├── sourceUrl: string   // 원본 크레인 게임 사이트 URL
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
```

### 데이터 관리 흐름

```
사용자가 Claude에게 URL 제공
    ↓
Claude가 URL 파싱 (피규어 이름, 이미지, 날짜/시간 추출)
    ↓
Claude가 스크립트 실행 (Firebase Admin SDK)
    ↓
Firestore에 피규어 데이터 저장 + Storage에 이미지 업로드
    ↓
웹 캘린더에 자동 반영 (Firestore 실시간 읽기)
```

## 3. 보안

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /figures/{figureId} {
      // 누구나 읽기 가능 (공개 캘린더)
      allow get, list: if true;
      // 쓰기는 Firebase Admin SDK만 가능 (Security Rules 무시)
      // 클라이언트에서는 쓰기 불가
      allow create, update, delete: if false;
    }
  }
}
```

### Storage Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /figures/{fileName} {
      allow read: if true;
      // 쓰기는 Admin SDK만 가능
      allow write: if false;
    }
  }
}
```

> **참고**: Firebase Admin SDK는 Security Rules를 무시하므로,
> 클라이언트 쓰기를 완전 차단(`if false`)해도 스크립트에서는 정상 동작합니다.

## 4. 디렉토리 구조

```
F:/ufoCalender/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   ├── page.tsx               # 메인 캘린더 페이지
│   │   └── globals.css            # 글로벌 스타일 (Tailwind)
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── CalendarView.tsx   # 월간 캘린더 메인
│   │   │   ├── CalendarHeader.tsx # 년/월 네비게이션
│   │   │   ├── CalendarCell.tsx   # 일별 셀
│   │   │   ├── FigureCard.tsx     # 피규어 썸네일+이름
│   │   │   └── FigureModal.tsx    # 피규어 상세 모달
│   │   ├── mobile/
│   │   │   └── MobileListView.tsx # 모바일 목록 뷰
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   └── Modal.tsx
│   │   └── layout/
│   │       └── Header.tsx
│   ├── lib/
│   │   ├── firebase.ts           # Firebase 클라이언트 초기화
│   │   └── firestore.ts          # Firestore 읽기 함수
│   ├── hooks/
│   │   └── useCalendar.ts        # 캘린더 데이터 훅
│   └── types/
│       └── index.ts              # 타입 정의
├── scripts/
│   ├── add-figure.ts             # 피규어 추가 스크립트 (Admin SDK)
│   ├── delete-figure.ts          # 피규어 삭제 스크립트
│   ├── list-figures.ts           # 피규어 목록 조회
│   └── firebase-admin.ts         # Admin SDK 초기화
├── .env.local                    # Firebase 클라이언트 설정
├── .env                          # Firebase Admin SDK 설정 (서비스 계정 경로)
├── serviceAccountKey.json        # Firebase 서비스 계정 키 (gitignore!)
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 5. 스크립트 설계

### add-figure.ts

```typescript
// 사용법: npx ts-node scripts/add-figure.ts
// Claude가 URL을 파싱한 후 이 스크립트를 실행하여 Firestore에 추가

import { addDoc, collection, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

interface FigureInput {
  nameKo: string;
  nameEn: string;
  nameJa: string;
  imageSource: string;  // 이미지 URL (다운로드 후 Storage에 업로드)
  date: string;         // YYYY-MM-DD
  time?: string;        // HH:mm
  sourceUrl: string;    // 원본 URL
}

// 1. 이미지 다운로드
// 2. Firebase Storage에 업로드
// 3. Firestore에 문서 추가
```

### delete-figure.ts

```typescript
// 사용법: npx ts-node scripts/delete-figure.ts <figureId>
// Firestore 문서 삭제 + Storage 이미지 삭제
```

### list-figures.ts

```typescript
// 사용법: npx ts-node scripts/list-figures.ts [--month 2026-04]
// 피규어 목록 조회 (전체 또는 월별)
```

## 6. 환경 변수

```
# .env.local (클라이언트용 - 읽기 전용)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# .env (Admin SDK용 - 스크립트 전용)
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```
