'use client';

import { useState } from 'react';
import { DialogueInput } from '@/types';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{speaker: string; text: string}> | null>(null);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<{content: string; title: string} | null>(null);

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
              } else if (update.type === 'complete' && update.data?.conversation) {
                setConversation(update.data.conversation);
                setIsConversationComplete(true);
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
      
      // Revoke previous audio URL to free memory
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
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

  return (
    <div className="font-sans min-h-screen p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          AI Podcast Generator
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Website to Podcast
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter a URL to convert to podcast:
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://example.com/article"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {isLoading ? 'Generating Conversation...' : 'Generate Conversation from URL'}
          </button>
        </form>

        {scrapedContent && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Scraped Content:
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {scrapedContent.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                {scrapedContent.content.substring(0, 200)}...
              </p>
            </div>
          </div>
        )}

        {conversation && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Generated Conversation:
              {!isConversationComplete && (
                <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                  (Streaming...)
                </span>
              )}
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg space-y-3 max-h-96 overflow-y-auto">
              {conversation.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="font-semibold text-blue-600 dark:text-blue-400 min-w-0 flex-shrink-0">
                    {getSpeakerName(item.speaker)}:
                  </div>
                  <div className="text-gray-900 dark:text-white">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
            
            {isConversationComplete && (
              <div className="mt-4">
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isGeneratingAudio && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  )}
                  {isGeneratingAudio ? 'Generating Audio...' : 'Generate Audio'}
                </button>
              </div>
            )}
          </div>
        )}

        {audioUrl && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Generated Podcast:
            </h2>
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
