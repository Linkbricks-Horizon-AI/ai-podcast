# HORIZON-AI POD CAST GENERATOR 🎙️

AI 기반 팟캐스트 대화 생성기 - URL, 텍스트, 문서를 자연스러운 한국어 팟캐스트 대화로 변환합니다.

## ✨ 최근 업데이트

- **2025-01-01**
  - **페르소나 커스터마이징**: 각 화자의 성격과 대화 스타일을 자유롭게 설정 가능
  - **UI/UX 개선**: Voices 컨테이너 확장 및 페르소나 입력 박스 크기 최적화
  - **로고 크기 조정**: 페이지 하단 로고 크기 최적화 (72px)
  - **버튼 상태 관리**: 오디오 생성 중 Generate Conversation 버튼 자동 비활성화

- **2024-12-31**
  - **음성 선택 기능 추가**: 33개의 다양한 ElevenLabs 음성 중 선택 가능
  - **음성 미리듣기**: 각 음성별 샘플 재생 버튼 추가
  - **드롭다운 UI 개선**: 반응형 음성 선택 인터페이스

- **2024-12-30**
  - MP3 다운로드 버튼 추가 (재생/정지, 되감기 버튼 옆)
  - Conversation UI 개선 (감정 태그 자동 숨김 처리)
  - 컨테이너 높이 자동 정렬 시스템 구현
  - 스크롤 최적화 및 반응형 레이아웃 개선

## 🌟 주요 기능

- **다양한 입력 소스 지원**
  - URL 스크래핑 (웹 기사, 블로그 포스트)
  - 텍스트 직접 입력
  - 파일 업로드 (이미지, PDF, DOCX, XLSX, PPTX, CSV, TXT, MD)
  
- **한국어 팟캐스트 생성**
  - GPT-4o를 활용한 자연스러운 한국어 대화 생성
  - 두 명의 화자 (활기찬 Speaker1, 비관적인 Speaker2)
  - 실시간 스트리밍 대화 표시
  
- **음성 합성**
  - ElevenLabs API를 통한 고품질 TTS
  - **33개의 다양한 음성 선택 가능** (Narrative, Conversational, Characters 등)
  - 화자별 다른 목소리 적용 (드롭다운으로 선택)
  - 음성 미리듣기 기능 제공
  - 즉시 재생 가능한 오디오 파일 생성
  - MP3 다운로드 기능 (타임스탬프 포함 파일명)

## 🛠 기술 스택

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Services**:
  - OpenAI GPT-5-mini (팟캐스트 대화 생성)
  - OpenAI GPT-4o (이미지 분석, 문서 요약)
  - ElevenLabs (TTS, eleven_v3 모델)
  - Firecrawl (웹 스크래핑)
- **Document Parsing**:
  - pdf-parse (PDF)
  - mammoth (DOCX)
  - xlsx (Excel)
  - jszip & xml2js (PPTX)

## 📋 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/ai-podcast.git
cd ai-podcast
```

### 2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 API 키를 설정:

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Firecrawl API (웹 스크래핑)
FIRECRAWL_API_KEY=your_firecrawl_api_key

# 파일 업로드 설정 (MB 단위)
MAX_UPLOAD_FILE_SIZE=20
NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE=20
```

### 4. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

http://localhost:3000에서 애플리케이션을 확인할 수 있습니다.

### 5. 프로덕션 빌드
```bash
npm run build
npm run start
```

## 🌐 Render.com 배포 가이드

### 1. Render 계정 및 프로젝트 설정
1. [Render.com](https://render.com)에서 계정 생성
2. GitHub 저장소 연결

### 2. Web Service 생성
1. Dashboard에서 "New +" → "Web Service" 선택
2. GitHub 저장소 선택
3. 서비스 설정:
   - **Name**: horizon-ai-podcast-generator
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: Free 또는 원하는 플랜 선택

### 3. 환경 변수 설정
Render Dashboard → Environment에서 다음 환경 변수 추가:

```
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
MAX_UPLOAD_FILE_SIZE=20
NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE=20
NODE_ENV=production
```

### 4. 배포
1. "Create Web Service" 클릭
2. 자동으로 빌드 및 배포 시작
3. 배포 완료 후 제공된 URL로 접속

### 5. 자동 배포 설정
- GitHub main 브랜치에 push하면 자동으로 재배포됨

## 📝 사용 방법

### URL 입력
1. "URL to convert" 라디오 버튼 선택
2. 웹 페이지 URL 입력 (뉴스 기사, 블로그 등)
3. "Generate Conversation" 클릭

### 텍스트 입력
1. "Text to convert" 라디오 버튼 선택
2. 텍스트 직접 입력
3. "Generate Conversation" 클릭

### 파일 업로드
1. "File to convert" 라디오 버튼 선택
2. 파일 드래그 앤 드롭 또는 클릭하여 선택
3. "Generate Conversation" 클릭

### 지원 파일 형식
- **이미지**: JPG, PNG, GIF, WEBP
- **문서**: PDF, DOCX, PPTX, XLSX, CSV, TXT, MD
- **최대 크기**: 20MB

## 🎯 주요 기능 설명

### 실시간 스트리밍
대화가 생성되는 동안 실시간으로 화면에 표시됩니다.

### 감정 표현
대화에 [excited], [skeptical] 등의 감정 태그가 포함되어 더욱 생동감 있는 음성 생성이 가능합니다.

### 화자 특성 및 페르소나
- **Speaker1**: 활기차고 순진한 성격, 모든 것에 열정적
  - 기본 음성: Blondie (Conversational)
  - 33개 음성 중 자유롭게 선택 가능
  - **페르소나 커스터마이징 가능**: 텍스트 입력으로 성격, 말투, 특징 자유 설정
- **Speaker2**: 비관적이고 오만한 성격, 회의적인 시각
  - 기본 음성: Bradford (Narrative & Story)
  - 33개 음성 중 자유롭게 선택 가능
  - **페르소나 커스터마이징 가능**: 텍스트 입력으로 성격, 말투, 특징 자유 설정

### 오디오 컨트롤
- **재생/일시정지**: 생성된 팟캐스트 재생 제어
- **되감기**: 처음부터 다시 재생
- **MP3 다운로드**: 생성된 오디오를 MP3 파일로 저장

## 🐛 문제 해결

### 빌드 오류
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### API 키 오류
- 모든 환경 변수가 올바르게 설정되었는지 확인
- API 키의 유효성 및 사용 한도 확인

## 📄 라이센스

MIT License

## 🤝 기여

기여를 환영합니다! Pull Request를 보내주세요.

## 📧 문의

문제가 있거나 제안사항이 있으면 Issues를 통해 알려주세요.

---

Made with ❤️ by HORIZON-AI Team