# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start the development server on http://localhost:3000
- `npm run build` - Build the Next.js application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## Application Architecture

This is an AI-powered podcast generation application built with Next.js 15 that converts web content into conversational podcasts with synthesized audio.

### Core Processing Pipeline

The application follows a three-stage pipeline:
1. **Web Scraping** (`/api/scrape`) - Uses Firecrawl to extract content from URLs
2. **Conversation Generation** (`/api/generate-podcast`) - Uses OpenAI's gpt-5-mini to create dialogue
3. **Audio Synthesis** (`/api/text-to-speech`) - Uses ElevenLabs to convert text to speech

### Key Architectural Components

**Frontend (`src/app/page.tsx`)**
- Single-page React application with URL input form
- Manages the complete pipeline state and user interaction
- Displays scraped content, generated conversation, and final audio
- Uses two predefined voices: Blondie and Bradford from ElevenLabs

**API Routes (`src/app/api/`)**
- `/api/scrape` - Firecrawl integration for web content extraction
- `/api/generate-podcast` - OpenAI integration for conversation generation using structured output with Zod schemas
- `/api/text-to-speech` - ElevenLabs Text-to-Dialogue API integration

**Server Actions (`src/actions/dialogue.ts`)**
- Handles ElevenLabs dialogue creation with proper error handling
- Implements Result pattern for type-safe error handling

**Utilities (`src/utils/elevenlabs.ts`)**
- ElevenLabs client initialization and configuration
- Stream processing utilities for audio data conversion
- Centralized error handling functions

**Types (`src/types/index.ts`)**
- `DialogueInput` - Defines voice and text pairs for synthesis
- `CreateDialogueRequest` - API request structure for dialogue generation
- `Result<T>` - Functional error handling pattern

### AI Model Configuration

**OpenAI Integration:**
- Model: `gpt-5-mini` via `@ai-sdk/openai`
- Uses `generateObject` with Zod schema for structured conversation output
- Schema enforces Speaker1/Speaker2 pattern with natural speech annotations

**Conversation Schema:**
```typescript
conversation: z.array(
  z.object({
    speaker: z.enum(["Speaker1", "Speaker2"]),
    text: z.string().describe("The text spoken by this speaker, including natural speech patterns and nuances like [laughs], [pauses], [excited], etc.")
  })
)
```

### Environment Variables

Required environment variables:
- `OPENAI_API_KEY` - OpenAI API key for conversation generation
- `FIRECRAWL_API_KEY` - Firecrawl API key for web scraping
- `ELEVENLABS_API_KEY` - ElevenLabs API key for text-to-speech

### Error Handling Pattern

The codebase uses a functional Result pattern:
- `Result<T> = { ok: true; value: T } | { ok: false; error: string }`
- `Ok(value)` and `Err(error)` helper functions
- Consistent error handling across API routes and server actions

### Voice Configuration

Two hardcoded ElevenLabs voices are used:
- Speaker1: Blondie (`exsUS4vynmxd379XN4yO`)
- Speaker2: Bradford (`NNl6r8mD7vthiJatiJt1`)

The application maps Speaker1 to the first voice and Speaker2 to the second voice for consistent character assignment in generated podcasts.
- Never start the dev server yourself