'use client';

import { useState } from 'react';
import { DialogueInput } from '@/types';

export default function Home() {
  const [dialogueInputs, setDialogueInputs] = useState<DialogueInput[]>([
    { text: '', voiceId: 'exsUS4vynmxd379XN4yO' },
    { text: '', voiceId: 'NNl6r8mD7vthiJatiJt1' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const voices = [
    { id: 'exsUS4vynmxd379XN4yO', name: 'Blondie' },
    { id: 'NNl6r8mD7vthiJatiJt1', name: 'Bradford' },
  ];

  const addDialogueInput = () => {
    setDialogueInputs([...dialogueInputs, { text: '', voiceId: 'exsUS4vynmxd379XN4yO' }]);
  };

  const removeDialogueInput = (index: number) => {
    if (dialogueInputs.length > 1) {
      setDialogueInputs(dialogueInputs.filter((_, i) => i !== index));
    }
  };

  const updateDialogueInput = (index: number, field: keyof DialogueInput, value: string) => {
    const updated = [...dialogueInputs];
    updated[index] = { ...updated[index], [field]: value };
    setDialogueInputs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validInputs = dialogueInputs.filter(input => input.text.trim());
    if (validInputs.length === 0) return;

    setIsLoading(true);
    setAudioUrl(null);
    
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: validInputs }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const data = await response.json();
      
      // Revoke previous audio URL to free memory
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(data.audioBase64);
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Error generating audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVoiceName = (voiceId: string) => {
    return voices.find(v => v.id === voiceId)?.name || 'Unknown';
  };

  return (
    <div className="font-sans min-h-screen p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          AI Podcast Generator
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Podcast Segments
              </h2>
              <button
                type="button"
                onClick={addDialogueInput}
                disabled={isLoading}
                className="bg-green-600 text-white px-3 py-1 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                + Add Segment
              </button>
            </div>

            {dialogueInputs.map((input, index) => (
              <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">
                    Segment {index + 1} - {getVoiceName(input.voiceId)}
                  </h3>
                  {dialogueInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDialogueInput(index)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Speaker:
                  </label>
                  <select
                    value={input.voiceId}
                    onChange={(e) => updateDialogueInput(index, 'voiceId', e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text:
                  </label>
                  <textarea
                    value={input.text}
                    onChange={(e) => updateDialogueInput(index, 'text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={2}
                    placeholder={`Enter text for ${getVoiceName(input.voiceId)}...`}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || dialogueInputs.every(input => !input.text.trim())}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating Podcast...' : 'Generate Podcast'}
          </button>
        </form>

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
