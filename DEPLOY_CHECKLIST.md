# Render.com 배포 체크리스트 ✅

## 사전 준비 사항

### 1. API 키 준비
- [ ] **OpenAI API Key** 준비
  - https://platform.openai.com/api-keys 에서 발급
  - GPT-4o 모델 사용 가능 확인
  
- [ ] **ElevenLabs API Key** 준비
  - https://elevenlabs.io 에서 발급
  - 음성 합성 크레딧 확인
  
- [ ] **Firecrawl API Key** 준비
  - https://firecrawl.dev 에서 발급
  - 웹 스크래핑 크레딧 확인

### 2. GitHub 저장소 확인
- [ ] 모든 코드가 GitHub에 푸시되었는지 확인
- [ ] render.yaml 파일 존재 확인
- [ ] package.json에 Node.js 버전 명시 확인

## Render.com 배포 단계

### 1. Render 계정 설정
- [ ] https://render.com 가입/로그인
- [ ] GitHub 계정 연결
- [ ] 저장소 접근 권한 부여

### 2. Web Service 생성
- [ ] Dashboard에서 **"New +"** 클릭
- [ ] **"Web Service"** 선택
- [ ] **saxoji/ai-podcast** 저장소 선택
- [ ] **Connect** 클릭

### 3. 서비스 구성
- [ ] **Name**: `horizon-ai-podcast-generator` (또는 원하는 이름)
- [ ] **Region**: Singapore (아시아 지역 추천) 또는 Oregon (미국)
- [ ] **Branch**: `master` (또는 `main`)
- [ ] **Runtime**: Node
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: `npm run start`
- [ ] **Instance Type**: 
  - Free (테스트용)
  - Starter ($7/month, 512MB RAM)
  - Standard ($25/month, 2GB RAM) - 권장

### 4. 환경 변수 설정
**"Environment"** 탭에서 다음 변수 추가:

- [ ] `NODE_ENV` = `production`
- [ ] `OPENAI_API_KEY` = `sk-...` (실제 API 키)
- [ ] `ELEVENLABS_API_KEY` = `...` (실제 API 키)  
- [ ] `FIRECRAWL_API_KEY` = `fc-...` (실제 API 키)
- [ ] `MAX_UPLOAD_FILE_SIZE` = `20`
- [ ] `NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE` = `20`

### 5. 배포 시작
- [ ] **"Create Web Service"** 클릭
- [ ] 빌드 로그 모니터링 (약 3-5분 소요)
- [ ] 배포 성공 메시지 확인

### 6. 배포 확인
- [ ] Render가 제공한 URL 접속 (예: `https://horizon-ai-podcast-generator.onrender.com`)
- [ ] 메인 페이지 로드 확인
- [ ] URL 입력 테스트
- [ ] 텍스트 입력 테스트  
- [ ] 파일 업로드 테스트
- [ ] 오디오 생성 테스트

## 문제 해결

### 빌드 실패 시
- [ ] Node.js 버전 확인 (18.0.0 이상)
- [ ] 패키지 의존성 확인
- [ ] Build Command 정확성 확인

### 런타임 오류 시
- [ ] 환경 변수 올바르게 설정되었는지 확인
- [ ] API 키 유효성 확인
- [ ] 로그 확인: Dashboard → Logs

### 성능 이슈
- [ ] Instance Type 업그레이드 고려
- [ ] 파일 업로드 크기 제한 조정
- [ ] API 사용량 모니터링

## 배포 후 관리

### 자동 배포 설정
- GitHub `master` 브랜치에 push 시 자동 재배포됨
- 배포 알림 설정: Settings → Notifications

### 모니터링
- [ ] Render Dashboard에서 CPU/메모리 사용량 확인
- [ ] 월간 사용 시간 확인 (Free tier: 750시간/월)
- [ ] API 사용량 모니터링
  - OpenAI 사용량: https://platform.openai.com/usage
  - ElevenLabs 크레딧: https://elevenlabs.io/subscription
  - Firecrawl 크레딧: Dashboard 확인

### 백업 및 복구
- [ ] 환경 변수 백업
- [ ] 데이터베이스 필요 시 PostgreSQL 추가 고려

## 추가 최적화

### 성능 개선
- [ ] CDN 설정 (Cloudflare)
- [ ] 이미지 최적화
- [ ] 캐싱 전략 구현

### 보안 강화
- [ ] Rate limiting 구현
- [ ] CORS 설정 검토
- [ ] API 키 로테이션 계획

### 비용 관리
- [ ] 월간 예산 설정
- [ ] 사용량 알림 설정
- [ ] 불필요한 서비스 정리

---

## 📞 지원 및 문의

- Render 지원: https://render.com/docs
- Next.js 문서: https://nextjs.org/docs
- 프로젝트 이슈: https://github.com/saxoji/ai-podcast/issues

---

**마지막 업데이트**: 2024-12-30
