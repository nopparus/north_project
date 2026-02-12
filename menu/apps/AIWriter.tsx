
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, Sparkles, Wand2 } from 'lucide-react';

const AIWriter: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: 'You are a professional writing assistant. Keep your responses structured, clear, and high-impact.'
        }
      });
      setResponse(result.text || 'No response generated.');
    } catch (error) {
      console.error(error);
      setResponse('An error occurred while generating content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
            <Sparkles size={20} />
          </div>
          <h2 className="text-2xl font-bold">AI Studio</h2>
        </div>
        <p className="text-zinc-500">Transform your thoughts into professional copy instantly.</p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What should we write today? Describe your idea..."
            className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all resize-none text-lg"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="absolute bottom-4 right-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            Generate
          </button>
        </div>

        {response && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 animate-in zoom-in-95 duration-300">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-6">Generated Content</h3>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-zinc-200 leading-relaxed text-lg">
                {response}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWriter;
