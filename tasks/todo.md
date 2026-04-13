# UFO캐처 피규어 캘린더 - 구현 체크리스트

## Group 1: 프로젝트 초기화
- [x] Next.js 15 + TypeScript 프로젝트 생성
- [x] Tailwind CSS 4 설정
- [x] Firebase SDK 설치 (`firebase`)
- [x] Firebase Admin SDK 설치 (`firebase-admin`)
- [x] .env.local / .env.example 생성
- [x] .gitignore 설정 (serviceAccountKey.json, .env.local, etc.)
- [x] 타입 정의 (`src/types/index.ts`)
- [x] Firebase 클라이언트 초기화 (`src/lib/firebase.ts`)

## Group 2: 스크립트 (Firebase Admin SDK)
- [x] Admin SDK 초기화 (`scripts/firebase-admin.ts`)
- [x] 피규어 추가 스크립트 (`scripts/add-figure.ts`)
- [x] 피규어 삭제 스크립트 (`scripts/delete-figure.ts`)
- [x] 피규어 목록 조회 스크립트 (`scripts/list-figures.ts`)

## Group 3: 캘린더 UI (메인)
- [x] Firestore 읽기 함수 (`src/lib/firestore.ts`)
- [x] 캘린더 데이터 훅 (`src/hooks/useCalendar.ts`)
- [x] 루트 레이아웃 (`src/app/layout.tsx`)
- [x] 글로벌 스타일 (`src/app/globals.css`)
- [x] 헤더 컴포넌트 (`src/components/layout/Header.tsx`)
- [x] 캘린더 헤더 - 월 네비게이션 (`src/components/calendar/CalendarHeader.tsx`)
- [x] 캘린더 셀 - 시간대 태그 (`src/components/calendar/CalendarCell.tsx`)
- [x] 시간대 태그 뱃지 (`src/components/calendar/TimeTag.tsx`)
- [x] 캘린더 뷰 메인 (`src/components/calendar/CalendarView.tsx`)
- [x] 메인 페이지 (`src/app/page.tsx`)

## Group 4: 모달 시스템
- [x] 모달 공통 컴포넌트 (`src/components/ui/Modal.tsx`)
- [x] 날짜 모달 - 시간/이름 목록 (`src/components/calendar/DateModal.tsx`)
- [x] 상세 모달 - 이미지 + 이름 (`src/components/calendar/FigureModal.tsx`)

## Group 5: 모바일 대응
- [x] 모바일 목록 뷰 (`src/components/mobile/MobileListView.tsx`)
- [x] 반응형 레이아웃 적용 (데스크탑 그리드 ↔ 모바일 목록)

## Group 6: 검증
- [x] 빌드 성공 확인 (`npm run build`)
- [x] 개발 서버 동작 확인
- [x] 캘린더 표시 확인
- [x] 모달 네비게이션 확인 (캘린더 → 날짜 → 상세 → ✕ 복귀)
- [x] 모바일 반응형 확인
