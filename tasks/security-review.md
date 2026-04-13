# 보안 리뷰 보고서 - UFO캐처 피규어 캘린더

**검토 범위:** Firebase (Firestore + Auth + Storage) + Next.js 15
**위험 수준:** 수정 후 LOW

---

## 요약

| 심각도 | 건수 | 상태 |
|--------|------|------|
| Critical | 1 | plan.md에 반영 완료 |
| High | 3 | plan.md에 반영 완료 |
| Medium | 3 | 구현 시 적용 필요 |
| Low | 1 | 구현 시 적용 필요 |

---

## Critical (반영 완료)

### 1. Firestore Rules - 모든 인증 사용자에게 쓰기 허용

**수정 전:** `request.auth != null` → 누구나 Firebase 계정 만들어 쓰기 가능
**수정 후:** `request.auth.token.admin == true` → Custom Claims로 관리자만 쓰기

---

## High (반영 완료)

### 2. Storage Rules - SVG 허용 및 파일명 미검증
**수정:** MIME 화이트리스트(jpeg/png/webp) + 파일명 정규식 검증 추가

### 3. 클라이언트 사이드 인증만으로 관리자 페이지 보호
**권고:** Next.js middleware.ts로 서버 사이드 보호 추가 (구현 시 적용)

### 4. Firebase API Key 노출
**권고:** Google Cloud Console에서 HTTP 참조자(Referer) 제한 설정

---

## Medium (구현 시 적용)

### 5. imageUrl 필드에 외부 URL 주입 가능
**권고:** Firestore Rules에서 Firebase Storage URL만 허용하거나, 클라이언트에서 업로드 후 URL만 저장

### 6. Firestore 무제한 읽기 - 스크래핑 가능
**권고:** Firebase App Check 활성화

### 7. Firebase Console 신규 가입 차단
**권고:** Authentication > Sign-in method에서 이메일/비밀번호 공개 등록 비활성화

---

## Low

### 8. .env.local Git 노출
**권고:** `.gitignore`에 `.env.local`, `.env.*.local` 포함 확인

---

## 최종 Security Rules (plan.md에 반영됨)

### Firestore
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /figures/{figureId} {
      allow get, list: if true;
      allow create, update: if request.auth != null
        && request.auth.token.admin == true;
      allow delete: if request.auth != null
        && request.auth.token.admin == true;
    }
  }
}
```

### Storage
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /figures/{fileName} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.auth.token.admin == true
                    && request.resource.size < 5 * 1024 * 1024
                    && request.resource.contentType in [
                         'image/jpeg', 'image/png', 'image/webp'
                       ]
                    && fileName.matches('[a-zA-Z0-9_\\-\\.]+\\.(jpg|jpeg|png|webp)');
      allow delete: if request.auth != null
                    && request.auth.token.admin == true;
      allow update: if false;
    }
  }
}
```

---

## 보안 체크리스트

- [x] Firestore Rules: Custom Claims(`admin == true`) 적용
- [x] Storage Rules: MIME 화이트리스트 + 파일명 정규식
- [x] Storage Rules: SVG 차단
- [ ] Firebase Console에서 신규 가입 비활성화
- [ ] Firebase API Key에 HTTP 참조자 제한 설정
- [ ] Next.js middleware.ts로 /admin 서버 사이드 보호
- [ ] Firebase App Check 활성화
- [ ] `.env.local`이 `.gitignore`에 포함 확인
- [ ] `serviceAccountKey.json` 절대 클라이언트에 포함 금지
