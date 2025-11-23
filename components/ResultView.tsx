import React, { useState, useEffect } from 'react';
import { DictionaryResult, Language, SavedWord } from '../types';
import { SpeakerIcon, BookIcon, ChatIcon } from './Icons';
import { playTTS, generateConceptImage } from '../services/geminiService';

interface ResultViewProps {
  result: DictionaryResult;
  sourceLang: Language;
  targetLang: Language;
  onSave: (word: SavedWord) => void;
  onOpenChat: () => void;
  isSaved: boolean;
}

const ResultView: React.FC<ResultViewProps> = ({ result, sourceLang, targetLang, onSave, onOpenChat, isSaved }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(result.imageUrl || null);
  const [loadingImage, setLoadingImage] = useState(!result.imageUrl);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    // If we don't have an image yet, fetch it
    if (!imageUrl && loadingImage) {
      generateConceptImage(result.term, targetLang)
        .then(url => {
            setImageUrl(url);
            setLoadingImage(false);
        })
        .catch(err => {
            console.error(err);
            setLoadingImage(false);
        });
    }
  }, [result.term, targetLang, imageUrl, loadingImage]);

  // Update result with generated image url if we save it
  const handleSave = () => {
    onSave({
        ...result,
        imageUrl: imageUrl || undefined,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sourceLang,
        targetLang
    });
  };

  const handlePlayAudio = async (text: string) => {
    if (audioPlaying) return;
    setAudioPlaying(true);
    await playTTS(text, targetLang);
    setAudioPlaying(false);
  };

  return (
    <div className="animate-flip-in pb-24">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <span className="text-9xl font-bold">{result.term.charAt(0)}</span>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
               <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-2">{result.term}</h1>
               {result.pronunciation && <p className="text-gray-500 font-mono text-sm mb-4">{result.pronunciation}</p>}
            </div>
            <button 
                onClick={() => handlePlayAudio(result.term)}
                className={`p-3 rounded-full ${audioPlaying ? 'bg-secondary animate-pulse' : 'bg-primary'} text-white shadow-lg hover:scale-105 transition-transform`}
            >
              <SpeakerIcon />
            </button>
          </div>

          <p className="text-xl text-primary font-medium mt-2">{result.definition}</p>

          <div className="mt-6 flex gap-3">
             <button 
                onClick={handleSave}
                disabled={isSaved}
                className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isSaved ? 'bg-gray-100 text-gray-400' : 'bg-secondary text-white shadow-md hover:bg-yellow-500'}`}
             >
               <BookIcon className="w-5 h-5" />
               {isSaved ? 'Saved' : 'Save to Notebook'}
             </button>
             <button 
                onClick={onOpenChat}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
             >
                <ChatIcon className="w-5 h-5" />
                Ask AI
             </button>
          </div>
        </div>
      </div>

      {/* Image & Vibe Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg h-64 relative flex items-center justify-center bg-gray-50">
           {loadingImage ? (
               <div className="animate-pulse flex flex-col items-center text-gray-400">
                   <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin mb-2"></div>
                   <span>Dreaming up an image...</span>
               </div>
           ) : (
               <img src={imageUrl || "https://picsum.photos/400/400"} alt={result.term} className="w-full h-full object-cover" />
           )}
           <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">AI Generated</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative">
           <h3 className="text-lg font-bold opacity-80 mb-3 uppercase tracking-wider text-indigo-100">The Vibe</h3>
           <div className="space-y-4">
              <p className="font-medium leading-relaxed">
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm mr-2">Context</span>
                {result.usageContext.culture}
              </p>
              <p className="font-medium leading-relaxed">
                 <span className="bg-white/20 px-2 py-0.5 rounded text-sm mr-2">Nuance</span>
                 {result.usageContext.nuance}
              </p>
              <div>
                  <span className="text-sm opacity-75 block mb-1">Similar words:</span>
                  <div className="flex flex-wrap gap-2">
                      {result.usageContext.synonyms.map(s => (
                          <span key={s} className="bg-white/20 px-3 py-1 rounded-full text-sm">{s}</span>
                      ))}
                  </div>
              </div>
           </div>
        </div>
      </div>

      {/* Examples */}
      <h3 className="text-2xl font-bold text-gray-800 mb-4 px-2">Examples</h3>
      <div className="space-y-4">
        {result.examples.map((ex, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-2">
                 <p className="text-lg font-semibold text-gray-800 leading-snug">{ex.target}</p>
                 <button onClick={() => handlePlayAudio(ex.target)} className="text-primary hover:text-secondary">
                     <SpeakerIcon className="w-5 h-5" />
                 </button>
             </div>
             <p className="text-gray-500 italic">{ex.native}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultView;
