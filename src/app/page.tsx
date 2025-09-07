'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DialogueInput } from '@/types';

export default function Home() {
  // Default URL per request
  const [url, setUrl] = useState('https://openai.com/index/introducing-gpt-5/');
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

  const voices = [
    { id: 'exsUS4vynmxd379XN4yO', name: 'Blondie' },
    { id: 'NNl6r8mD7vthiJatiJt1', name: 'Bradford' },
  ];

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
          title: scrapeData.title 
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

  const handleGenerateAudio = async () => {
    if (!conversation || !isConversationComplete) return;

    setIsGeneratingAudio(true);
    
    try {
      const dialogueInputs: DialogueInput[] = conversation.map((item: any) => ({
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
  };

  const getVoiceName = (voiceId: string) => {
    return voices.find(v => v.id === voiceId)?.name || 'Unknown';
  };

  const getSpeakerName = (speaker: string) => {
    return speaker === 'Speaker1' ? voices[0].name : voices[1].name;
  };

  // Automatically start generating audio when conversation is complete
  useEffect(() => {
    if (isConversationComplete && conversation && !isGeneratingAudio && !audioUrl && !hasRequestedAudio) {
      setHasRequestedAudio(true);
      // Fire and forget; internal state handles progress and errors
      void handleGenerateAudio();
    }
  }, [isConversationComplete, conversation, isGeneratingAudio, audioUrl, hasRequestedAudio]);

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
    if (audioUrl) return 'Podcast ready';
    if (isLoading) return 'Starting…';
    return 'Awaiting URL';
  }, [steps, audioUrl, isLoading, conversationTurns]);

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

  return (
    <div className="relative font-sans min-h-screen p-6 lg:p-8 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      {/* Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-fuchsia-500/25 to-indigo-500/25 blur-3xl glow-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-cyan-400/20 to-emerald-500/20 blur-3xl glow-pulse" />

      <div className="relative max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500">AI Podcast Generator</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Source */}
          <div className="lg:col-span-3 rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-4 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Source</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL to convert
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 dark:bg-white/10 border border-white/40 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="https://example.com/article"
                disabled={isLoading}
                required
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-md font-medium hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                {isLoading ? 'Generating Conversation…' : 'Generate Conversation'}
              </button>
            </form>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
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
            </div>
          </div>

          {/* Middle: Conversation */}
          <div className="lg:col-span-6 rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation</h2>
              {!isConversationComplete && conversation && (
                <span className="text-xs text-blue-600 dark:text-blue-400">Streaming…</span>
              )}
            </div>
            <div className="bg-white/40 dark:bg-white/5 rounded p-4 space-y-3 flex-1 min-h-[240px] max-h-[520px] overflow-y-auto border border-white/30 dark:border-white/10 backdrop-blur">
              {conversation ? (
                conversation.map((item, index) => {
                  const left = item.speaker === 'Speaker1';
                  const isNew = index >= newStartIndex;
                  return (
                    <div key={index} className={`flex gap-3 ${left ? 'justify-start' : 'justify-end'}`}>
                      {left && <div className="mt-0.5"><Avatar name={getSpeakerName(item.speaker)} tone="left" /></div>}
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md border backdrop-blur-md transition-all ${isNew ? 'animate-fade-in-up' : ''} ${left ? 'bg-white/80 border-white/50 text-gray-900' : 'bg-blue-600/90 border-white/30 text-white'}`}>
                        <div className={`text-xs mb-1 ${left ? 'text-blue-700' : 'text-white/80'}`}>{getSpeakerName(item.speaker)}</div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{item.text}</div>
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
          <div className="lg:col-span-3 flex flex-col gap-4">
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
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div className="w-full h-24 bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 backdrop-blur">
                  {isGeneratingAudio ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                      <span>Generating audio…</span>
                    </div>
                  ) : (
                    <span>No audio yet.</span>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Voices</h3>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <div>
                  <span className="font-medium text-blue-600 dark:text-blue-400">Speaker 1:</span> {voices[0].name}
                </div>
                <div>
                  <span className="font-medium text-blue-600 dark:text-blue-400">Speaker 2:</span> {voices[1].name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
