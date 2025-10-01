'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DialogueInput, Language } from '@/types';
import { SUPPORTED_LANGUAGES, getPrompts } from '@/locales/prompts';

// CSS for sound wave animation
const soundWaveStyle = `
  @keyframes soundWave {
    0%, 100% {
      transform: scaleY(0.5);
    }
    50% {
      transform: scaleY(1);
    }
  }
`;

export default function Home() {
  // Default URL per request
  const [url, setUrl] = useState('https://www.horizonai.ai');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{ speaker: string; text: string }> | null>(null);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<{ content: string; title: string } | null>(null);
  const [hasRequestedAudio, setHasRequestedAudio] = useState(false);
  const [conversationTurns, setConversationTurns] = useState(0);
  const prevTurnsRef = useRef(0);
  const [newStartIndex, setNewStartIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputMode, setInputMode] = useState<'url' | 'text' | 'file'>('url');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  
  // 음성 목록과 선택된 음성
  const [voiceList, setVoiceList] = useState<{name: string; style: string; id: string; previewFile: string}[]>([]);
  const [selectedVoice1, setSelectedVoice1] = useState('exsUS4vynmxd379XN4yO'); // Blondie default
  const [selectedVoice2, setSelectedVoice2] = useState('NNl6r8mD7vthiJatiJt1'); // Bradford default
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // 언어 선택 상태
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('korean');
  
  // 페르소나 상태 - 언어에 따라 기본값 변경
  const currentPrompts = useMemo(() => getPrompts(selectedLanguage), [selectedLanguage]);
  const [persona1, setPersona1] = useState(currentPrompts.defaultPersona1);
  const [persona2, setPersona2] = useState(currentPrompts.defaultPersona2);

  // 언어 변경 시 페르소나 업데이트
  useEffect(() => {
    setPersona1(currentPrompts.defaultPersona1);
    setPersona2(currentPrompts.defaultPersona2);
  }, [selectedLanguage, currentPrompts]);

  // voices.json 로드
  useEffect(() => {
    fetch('/voices.json')
      .then(res => res.json())
      .then(data => {
        setVoiceList(data);
      })
      .catch(err => console.error('Failed to load voices:', err));
  }, []);

  const voices = useMemo(() => [
    { id: selectedVoice1, name: voiceList.find(v => v.id === selectedVoice1)?.name || 'Speaker1' },
    { id: selectedVoice2, name: voiceList.find(v => v.id === selectedVoice2)?.name || 'Speaker2' },
  ], [selectedVoice1, selectedVoice2, voiceList]);

  const maxFileSize = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE || '20'); // MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      setFileError(`File size exceeds ${maxFileSize}MB (current: ${fileSizeMB.toFixed(2)}MB)`);
      setSelectedFile(null);
      return;
    }

    // Check file type - accept images and documents
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'text/plain', 'text/markdown', 'text/csv',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'application/vnd.ms-powerpoint', // ppt
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setFileError('Unsupported file type. Please upload an image or document.');
      setSelectedFile(null);
      return;
    }

    setFileError('');
    setSelectedFile(file);
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setAudioUrl(null);
    setConversation(null);
    setIsConversationComplete(false);
    // Don't show scraped content for file uploads
    setScrapedContent(null);
    setHasRequestedAudio(false);
    setConversationTurns(0);
    
    try {
      // Create FormData with file
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Process file with OpenAI
      const processResponse = await fetch('/api/process-file', {
        method: 'POST',
        body: formData,
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      const { content, title } = await processResponse.json();
      
      // Don't set scraped content for file uploads - it's only for URL scraping
      // setScrapedContent({ content, title: title || selectedFile.name });

      // Generate podcast conversation
      const podcastResponse = await fetch('/api/generate-podcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content, 
          title: title || selectedFile.name,
          persona1,
          persona2,
          language: selectedLanguage
        }),
      });

      if (!podcastResponse.ok) {
        const errorData = await podcastResponse.json();
        throw new Error(errorData.error || 'Failed to generate podcast');
      }

      // Handle streaming response
      const reader = podcastResponse.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const update = JSON.parse(line);
              
              if (update.type === 'partial' && update.data?.conversation) {
                setConversation(update.data.conversation);
                setConversationTurns(Array.isArray(update.data.conversation) ? update.data.conversation.length : 0);
              } else if (update.type === 'complete' && update.data?.conversation) {
                setConversation(update.data.conversation);
                setIsConversationComplete(true);
                setConversationTurns(Array.isArray(update.data.conversation) ? update.data.conversation.length : 0);
              } else if (update.type === 'error') {
                throw new Error(update.error || 'Streaming error');
              }
            } catch (parseError) {
              console.error('Error parsing streaming response:', parseError);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error generating podcast from file:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setIsLoading(true);
    setAudioUrl(null);
    setConversation(null);
    setIsConversationComplete(false);
    // Don't show scraped content for text input
    setScrapedContent(null);
    setHasRequestedAudio(false);
    setConversationTurns(0);
    
    try {
      // Generate podcast conversation with text input
      const podcastResponse = await fetch('/api/generate-podcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: textInput, 
          title: 'Direct Text Input',
          persona1,
          persona2,
          language: selectedLanguage
        }),
      });

      if (!podcastResponse.ok) {
        const errorData = await podcastResponse.json();
        throw new Error(errorData.error || 'Failed to generate podcast');
      }

      // Handle streaming response
      const reader = podcastResponse.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';
        
        // Process complete lines
        for (const line of lines) {
          if (line.trim()) {
            try {
              const update = JSON.parse(line);
              
              if (update.type === 'partial' && update.data?.conversation) {
                setConversation(update.data.conversation);
                setConversationTurns(Array.isArray(update.data.conversation) ? update.data.conversation.length : 0);
              } else if (update.type === 'complete' && update.data?.conversation) {
                setConversation(update.data.conversation);
                setIsConversationComplete(true);
                setConversationTurns(Array.isArray(update.data.conversation) ? update.data.conversation.length : 0);
              } else if (update.type === 'error') {
                throw new Error(update.error || 'Streaming error');
              }
            } catch (parseError) {
              console.error('Error parsing streaming response:', parseError);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error generating podcast:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;

    setIsLoading(true);
    setAudioUrl(null);
    setConversation(null);
    setIsConversationComplete(false);
    setScrapedContent(null);
    setHasRequestedAudio(false);
    setConversationTurns(0);
    
    try {
      // Step 1: Scrape the URL
      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!scrapeResponse.ok) {
        const errorData = await scrapeResponse.json();
        throw new Error(errorData.error || 'Failed to scrape URL');
      }

      const scrapeData = await scrapeResponse.json();
      setScrapedContent(scrapeData);

      // Step 2: Generate podcast conversation with streaming
      const podcastResponse = await fetch('/api/generate-podcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: scrapeData.content, 
          title: scrapeData.title,
          persona1,
          persona2,
          language: selectedLanguage
        }),
      });

      if (!podcastResponse.ok) {
        const errorData = await podcastResponse.json();
        throw new Error(errorData.error || 'Failed to generate podcast');
      }

      // Handle streaming response
      const reader = podcastResponse.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';
        
        // Process complete lines
        for (const line of lines) {
          if (line.trim()) {
            try {
              const update = JSON.parse(line);
              
              if (update.type === 'partial' && update.data?.conversation) {
                setConversation(update.data.conversation);
                setConversationTurns(Array.isArray(update.data.conversation) ? update.data.conversation.length : 0);
              } else if (update.type === 'complete' && update.data?.conversation) {
                setConversation(update.data.conversation);
                setIsConversationComplete(true);
                setConversationTurns(Array.isArray(update.data.conversation) ? update.data.conversation.length : 0);
              } else if (update.type === 'error') {
                throw new Error(update.error || 'Streaming error');
              }
            } catch (parseError) {
              console.error('Error parsing streaming response:', parseError);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error generating podcast:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudio = useCallback(async () => {
    if (!conversation || !isConversationComplete) return;

    setIsGeneratingAudio(true);
    
    try {
      const dialogueInputs: DialogueInput[] = conversation.map((item: { speaker: string; text: string }) => ({
        text: item.text,
        voiceId: item.speaker === 'Speaker1' ? voices[0].id : voices[1].id
      }));

      const audioResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: dialogueInputs }),
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const audioData = await audioResponse.json();
      
      // Revoke previous audio URL to free memory (if it was a blob URL)
      if (audioUrl) {
        try { URL.revokeObjectURL(audioUrl); } catch {}
      }
      
      setAudioUrl(audioData.audioBase64);
    } catch (error) {
      console.error('Error generating audio:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [conversation, isConversationComplete, voices, audioUrl]);

  const getSpeakerName = (speaker: string) => {
    return speaker === 'Speaker1' ? voices[0].name : voices[1].name;
  };

  // Remove emotion annotations from text for display
  const removeEmotionTags = (text: string) => {
    if (!text) return '';
    return text.replace(/\s*\[[^\]]+\]\s*/g, ' ').trim();
  };

  // Automatically start generating audio when conversation is complete
  useEffect(() => {
    if (isConversationComplete && conversation && !isGeneratingAudio && !audioUrl && !hasRequestedAudio) {
      setHasRequestedAudio(true);
      // Fire and forget; internal state handles progress and errors
      void handleGenerateAudio();
    }
  }, [isConversationComplete, conversation, isGeneratingAudio, audioUrl, hasRequestedAudio, handleGenerateAudio]);

  // Agentic progress steps
  type StepStatus = 'pending' | 'in_progress' | 'complete';
  const steps = useMemo(() => {
    const hasScraped = !!scrapedContent;
    const hasConversation = !!conversation;
    const convoDone = isConversationComplete;
    const hasAudio = !!audioUrl;

    const scrapeStatus: StepStatus = isLoading && !hasScraped ? 'in_progress' : hasScraped ? 'complete' : 'pending';
    const convoStatus: StepStatus = hasConversation && !convoDone ? 'in_progress' : convoDone ? 'complete' : hasScraped ? 'pending' : 'pending';
    const audioStatus: StepStatus = isGeneratingAudio ? 'in_progress' : hasAudio ? 'complete' : convoDone ? 'pending' : 'pending';
    const doneStatus: StepStatus = hasAudio ? 'complete' : 'pending';

    return [
      { key: 'scrape', label: 'Scrape Source', status: scrapeStatus as StepStatus },
      { key: 'conversation', label: 'Generate Conversation', status: convoStatus as StepStatus },
      { key: 'audio', label: 'Generate Audio', status: audioStatus as StepStatus },
      { key: 'done', label: 'Ready', status: doneStatus as StepStatus },
    ];
  }, [scrapedContent, conversation, isConversationComplete, isGeneratingAudio, audioUrl, isLoading]);

  const currentAction = useMemo(() => {
    const inProgress = steps.find((s) => s.status === 'in_progress');
    if (inProgress) {
      if (inProgress.key === 'conversation') {
        return `Streaming conversation (${conversationTurns} turns)`;
      }
      if (inProgress.key === 'audio') {
        return 'Calling TTS and composing audio';
      }
      return inProgress.label;
    }
    if (audioUrl) return isPlaying ? 'Playing podcast' : 'Podcast ready';
    if (isLoading) return 'Starting…';
    
    // Dynamic message based on input mode
    if (inputMode === 'url') return 'Awaiting URL';
    if (inputMode === 'text') return 'Awaiting Text';
    if (inputMode === 'file') return 'Awaiting File';
    return 'Awaiting Input';
  }, [steps, audioUrl, isLoading, conversationTurns, isPlaying, inputMode]);

  const nextSteps = useMemo(() => {
    const firstPendingIdx = steps.findIndex((s) => s.status !== 'complete');
    if (firstPendingIdx === -1) return [] as string[];
    const labels = steps.slice(firstPendingIdx).map((s) => s.label);
    // If something is in progress, include remaining after it
    const inProgressIdx = steps.findIndex((s) => s.status === 'in_progress');
    if (inProgressIdx >= 0) return steps.slice(inProgressIdx + 1).map((s) => s.label);
    return labels;
  }, [steps]);

  // Track boundaries for animating newly streamed items
  useEffect(() => {
    if (conversationTurns > prevTurnsRef.current) {
      setNewStartIndex(prevTurnsRef.current);
      prevTurnsRef.current = conversationTurns;
    } else if (conversationTurns < prevTurnsRef.current) {
      prevTurnsRef.current = conversationTurns;
      setNewStartIndex(0);
    }
  }, [conversationTurns]);

  // Simple SVG avatar for each speaker (gradient + initial)
  const Avatar = ({ name, tone }: { name: string; tone: 'left' | 'right' }) => {
    const initial = (name || '?').slice(0, 1).toUpperCase();
    const gradId = `grad-${tone}`;
    const g1 = tone === 'left' ? '#8b5cf6' : '#06b6d4';
    const g2 = tone === 'left' ? '#ec4899' : '#22c55e';
    return (
      <svg viewBox="0 0 40 40" className="h-8 w-8 rounded-full shadow-md">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={g1} />
            <stop offset="100%" stopColor={g2} />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="19" fill={`url(#${gradId})`} opacity="0.9" />
        <text x="50%" y="54%" textAnchor="middle" fontSize="18" fontWeight="700" fill="white" fontFamily="system-ui, -apple-system, Segoe UI, Roboto">{initial}</text>
      </svg>
    );
  };

  // Audio controls logic
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    // When a new audio URL arrives, ensure we reset play state and load it
    setIsPlaying(false);
    try { el.pause(); } catch {}
    el.currentTime = 0;
    // src bound in JSX; calling load helps reset metadata
    try { el.load(); } catch {}
  }, [audioUrl]);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (!audioUrl) return;
    try {
      if (el.paused) {
        await el.play();
        setIsPlaying(true);
      } else {
        el.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      console.error('Audio play/pause error', e);
    }
  };

  const restartAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    if (!audioUrl) return;
    try {
      el.currentTime = 0;
      if (!el.paused) {
        el.play();
      }
    } catch (e) {
      console.error('Audio restart error', e);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = audioUrl;
      
      // Generate filename with current date/time
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `podcast-${timestamp}.mp3`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Audio download error', e);
    }
  };

  // 음성 미리듣기 함수
  const handlePreviewVoice = (voiceId: string) => {
    if (playingPreview === voiceId) {
      // 재생 중이면 중지
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
      setPlayingPreview(null);
    } else {
      // 새로운 미리듣기 재생
      const voice = voiceList.find(v => v.id === voiceId);
      if (!voice) return;

      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }

      const audio = new Audio(`/voice-previews/${voice.previewFile}`);
      audio.volume = 0.5;
      audio.onended = () => setPlayingPreview(null);
      audio.onpause = () => setPlayingPreview(null);
      audio.play().catch(err => {
        console.error('Failed to play preview:', err);
        setPlayingPreview(null);
      });

      previewAudioRef.current = audio;
      setPlayingPreview(voiceId);
    }
  };

  return (
    <div className="relative font-sans min-h-screen p-6 lg:p-8 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <style jsx>{soundWaveStyle}</style>
      {/* Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-fuchsia-500/25 to-indigo-500/25 blur-3xl glow-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-cyan-400/20 to-emerald-500/20 blur-3xl glow-pulse" />

      <div className="relative max-w-7xl mx-auto w-full h-full flex flex-col">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500">HORIZON-AI POD CAST GENERATOR</span>
        </h1>

        {/* Agentic progress header */}
        <div className="mb-6 rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Agent status:</span> {currentAction}
            </div>
            {nextSteps.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Next: {nextSteps.join(' -> ')}
              </div>
            )}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                {s.status === 'complete' && (
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                )}
                {s.status === 'in_progress' && (
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                )}
                {s.status === 'pending' && (
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                )}
                <span className={`text-xs ${s.status === 'in_progress' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {i + 1}. {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Three-column workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 lg:items-stretch">
          {/* Left: Source */}
          <div className="lg:col-span-3 rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-4 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Source</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  value="url"
                  checked={inputMode === 'url'}
                  onChange={(e) => setInputMode(e.target.value as 'url')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                URL to convert
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 dark:bg-white/10 border border-white/40 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="https://example.com/article"
                disabled={isLoading || inputMode !== 'url'}
                required={inputMode === 'url'}
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim() || inputMode !== 'url' || isGeneratingAudio}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-md font-medium hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {isLoading && inputMode === 'url' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                {isLoading && inputMode === 'url' ? 'Generating Conversation…' : 'Generate Conversation'}
              </button>
            </form>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Scraped Preview</h3>
              {scrapedContent ? (
                <div className="bg-white/60 dark:bg-white/5 p-3 rounded border border-white/40 dark:border-white/10 backdrop-blur">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                    {scrapedContent.title}
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-4">
                    {scrapedContent.content.substring(0, 400)}…
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">No source loaded yet.</p>
              )}
              <hr className="mt-3 border-gray-200 dark:border-gray-700" />
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  value="text"
                  checked={inputMode === 'text'}
                  onChange={(e) => setInputMode(e.target.value as 'text')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                Text to convert
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 dark:bg-white/10 border border-white/40 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter text directly..."
                rows={4}
                disabled={isLoading || inputMode !== 'text'}
              />
              <button
                type="button"
                disabled={isLoading || !textInput.trim() || inputMode !== 'text' || isGeneratingAudio}
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-md font-medium hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-md"
                onClick={() => handleTextSubmit()}
              >
                {isLoading && inputMode === 'text' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                {isLoading && inputMode === 'text' ? 'Generating Conversation…' : 'Generate Conversation'}
              </button>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  value="file"
                  checked={inputMode === 'file'}
                  onChange={(e) => setInputMode(e.target.value as 'file')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                File to convert
              </label>
              <div className="space-y-3">
                <label 
                  htmlFor="file-upload"
                  className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    inputMode === 'file' && !isLoading 
                      ? 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white/50 dark:bg-white/5' 
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {selectedFile ? (
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {selectedFile.name}
                        </span>
                      ) : (
                        <>
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      이미지: JPG, PNG, GIF, WEBP
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      문서: PDF, DOCX, PPTX, XLSX, CSV, TXT, MD
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      최대 파일 크기: {maxFileSize}MB
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*,.txt,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.md"
                    onChange={handleFileChange}
                    disabled={isLoading || inputMode !== 'file'}
                  />
                </label>
                {fileError && (
                  <p className="text-xs text-red-500 dark:text-red-400">{fileError}</p>
                )}
                <button
                  type="button"
                  disabled={isLoading || !selectedFile || inputMode !== 'file' || !!fileError || isGeneratingAudio}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-md font-medium hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-md"
                  onClick={() => handleFileSubmit()}
                >
                  {isLoading && inputMode === 'file' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  )}
                  {isLoading && inputMode === 'file' ? 'Generating Conversation…' : 'Generate Conversation'}
                </button>
              </div>
            </div>
          </div>

          {/* Middle: Conversation */}
          <div className="lg:col-span-6 rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation</h2>
              {!isConversationComplete && conversation && (
                <span className="text-xs text-blue-600 dark:text-blue-400">Streaming…</span>
              )}
            </div>
            
            {/* Language Selection Radio Buttons */}
            <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-7 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <label
                    key={lang.code}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-xs font-medium hover:bg-white/40 dark:hover:bg-white/10 min-w-0"
                    style={{
                      backgroundColor: selectedLanguage === lang.code ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: selectedLanguage === lang.code ? 'rgb(37, 99, 235)' : 'inherit'
                    }}
                    title={`${lang.nativeName} (${lang.label})`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang.code}
                      checked={selectedLanguage === lang.code}
                      onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <span className="truncate text-[0.7rem]">{lang.nativeName}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white/40 dark:bg-white/5 rounded p-4 space-y-3 overflow-y-auto border border-white/30 dark:border-white/10 backdrop-blur flex-1">
              {conversation ? (
                conversation.map((item, index) => {
                  const left = item.speaker === 'Speaker1';
                  const isNew = index >= newStartIndex;
                  return (
                    <div key={index} className={`flex gap-3 ${left ? 'justify-start' : 'justify-end'}`}>
                      {left && <div className="mt-0.5"><Avatar name={getSpeakerName(item.speaker)} tone="left" /></div>}
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md border backdrop-blur-md transition-all ${isNew ? 'animate-fade-in-up' : ''} ${left ? 'bg-white/80 border-white/50 text-gray-900' : 'bg-blue-600/90 border-white/30 text-white'}`}>
                        <div className={`text-xs mb-1 ${left ? 'text-blue-700' : 'text-white/80'}`}>{getSpeakerName(item.speaker)}</div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{removeEmotionTags(item.text)}</div>
                      </div>
                      {!left && <div className="mt-0.5"><Avatar name={getSpeakerName(item.speaker)} tone="right" /></div>}
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">No conversation yet. Generate to start streaming.</div>
              )}
            </div>
          </div>

          {/* Right: Audio + Agent details */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full">
            <div className="rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Audio</h2>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {isConversationComplete && !audioUrl && (
                  <span>Generating audio from {conversationTurns} turns…</span>
                )}
                {!isConversationComplete && (
                  <span>Waiting for conversation to finish…</span>
                )}
              </div>
              {audioUrl ? (
                <div className="flex items-center justify-center gap-3 py-2">
                  <button
                    onClick={togglePlay}
                    className={`relative inline-flex items-center justify-center h-16 w-16 rounded-full text-white shadow-xl transition transform hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isPlaying ? 'bg-gradient-to-br from-indigo-600 to-fuchsia-600' : 'bg-gradient-to-br from-indigo-600 to-fuchsia-600'
                    }`}
                    aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {!isPlaying && (
                      <span className="absolute inset-0 rounded-full bg-indigo-500/30 blur-md pulse-ring" aria-hidden />
                    )}
                    <span className="relative text-2xl leading-none">
                      {isPlaying ? '❚❚' : '▶'}
                    </span>
                  </button>
                  <button
                    onClick={restartAudio}
                    className="inline-flex items-center justify-center h-12 w-12 rounded-full text-white bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg transition transform hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    aria-label="Restart audio"
                    title="Restart"
                  >
                    <span className="text-lg leading-none">↻</span>
                  </button>
                  <button
                    onClick={downloadAudio}
                    className="inline-flex items-center justify-center h-12 w-12 rounded-full text-white bg-gradient-to-br from-green-600 to-green-700 shadow-lg transition transform hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    aria-label="Download audio"
                    title="Download MP3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <audio
                    ref={audioRef}
                    src={audioUrl || undefined}
                    preload="metadata"
                    className="hidden"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>
              ) : (
                <div className="w-full h-24 bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 backdrop-blur overflow-hidden relative">
                  {isGeneratingAudio ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Background gradient animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
                      
                      {/* Sound wave animation */}
                      <div className="relative flex items-center gap-1 z-10">
                        {[...Array(7)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                            style={{
                              height: `${[35, 45, 30, 50, 25, 40, 35][i]}px`,
                              animation: `soundWave ${[1.0, 1.2, 0.8, 1.4, 0.9, 1.1, 1.3][i]}s ease-in-out infinite`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Text with enhanced styling */}
                      <div className="absolute bottom-2 left-0 right-0 text-center">
                        <span className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                          AI 음성 합성 중... {conversationTurns && `(${conversationTurns} turns)`}
                        </span>
                      </div>
                      
                      {/* Floating particles */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute h-1 w-1 bg-blue-400 rounded-full animate-ping"
                            style={{
                              top: `${20 + i * 25}%`,
                              left: `${10 + i * 30}%`,
                              animationDelay: `${i * 0.3}s`,
                              animationDuration: '2s'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span>No audio yet.</span>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Voices</h3>
              <div className="flex-1 flex flex-col space-y-3">
                {/* Speaker 1 */}
                <div className="flex-1 flex flex-col">
                  <label className="text-xs font-medium text-blue-600 dark:text-blue-400 block mb-1">
                    Speaker 1
                  </label>
                  <div className="flex gap-1 mb-2">
                    <select
                      value={selectedVoice1}
                      onChange={(e) => setSelectedVoice1(e.target.value)}
                      className="flex-1 min-w-0 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-1.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {voiceList.map(voice => (
                        <option key={voice.id} value={voice.id} title={`${voice.name} (${voice.style})`}>
                          {voice.name.length > 20 ? voice.name.substring(0, 20) + '...' : voice.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handlePreviewVoice(selectedVoice1)}
                      className="flex-shrink-0 px-2 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                      title="미리듣기"
                    >
                      {playingPreview === selectedVoice1 ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" strokeWidth="2" />
                          <rect x="14" y="4" width="4" height="16" strokeWidth="2" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={persona1}
                    onChange={(e) => setPersona1(e.target.value)}
                    placeholder="Speaker 1 페르소나 입력..."
                    className="flex-1 w-full min-h-[100px] text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Speaker 2 */}
                <div className="flex-1 flex flex-col">
                  <label className="text-xs font-medium text-blue-600 dark:text-blue-400 block mb-1">
                    Speaker 2
                  </label>
                  <div className="flex gap-1 mb-2">
                    <select
                      value={selectedVoice2}
                      onChange={(e) => setSelectedVoice2(e.target.value)}
                      className="flex-1 min-w-0 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-1.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {voiceList.map(voice => (
                        <option key={voice.id} value={voice.id} title={`${voice.name} (${voice.style})`}>
                          {voice.name.length > 20 ? voice.name.substring(0, 20) + '...' : voice.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handlePreviewVoice(selectedVoice2)}
                      className="flex-shrink-0 px-2 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                      title="미리듣기"
                    >
                      {playingPreview === selectedVoice2 ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" strokeWidth="2" />
                          <rect x="14" y="4" width="4" height="16" strokeWidth="2" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={persona2}
                    onChange={(e) => setPersona2(e.target.value)}
                    placeholder="Speaker 2 페르소나 입력..."
                    className="flex-1 w-full min-h-[100px] text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Logo */}
        <div className="mt-12 pb-6 flex justify-center items-center">
          <a 
            href="https://www.horizonai.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          >
            <img 
              src="/logo_dark.png" 
              alt="HORIZON-AI - BEYOND GENERATION" 
              className="h-[72px] w-auto"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
