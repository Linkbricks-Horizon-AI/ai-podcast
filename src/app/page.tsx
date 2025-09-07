'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('JBFqnCBsd6RMkjVDRZzb');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const voices = [
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
    { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setAudioUrl(null); // Clear existing audio
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voiceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const blob = await response.blob();
      // Revoke previous audio URL to free memory
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Error generating audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Text to Speech
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="voice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select voice:
            </label>
            <select
              id="voice"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter text to convert to speech:
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
              placeholder="Type your text here..."
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Speech'}
          </button>
        </form>

        {audioUrl && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Generated Audio:
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
