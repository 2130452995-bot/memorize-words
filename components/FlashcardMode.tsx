import React, { useState } from 'react';
import { SavedWord } from '../types';
import { XMarkIcon, SpeakerIcon } from './Icons';
import { playTTS } from '../services/geminiService';

interface FlashcardModeProps {
  words: SavedWord[];
  onClose: () => void;
}

const FlashcardMode: React.FC<FlashcardModeProps> = ({ words, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentWord = words[currentIndex];

  const nextCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 200);
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTTS(currentWord.term, currentWord.targetLang);
  };

  const handleExampleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentWord.examples[0]?.target) {
        playTTS(currentWord.examples[0].target, currentWord.targetLang);
    }
  };

  if (!currentWord) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>

      <div className="w-full max-w-md perspective-1000 h-[500px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
         <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front */}
            <div className="absolute w-full h-full bg-white rounded-3xl p-8 shadow-2xl backface-hidden flex flex-col items-center justify-center text-center">
                <span className="absolute top-6 left-6 text-gray-400 font-mono text-sm">
                    {currentIndex + 1} / {words.length}
                </span>
                
                {currentWord.imageUrl && (
                    <img src={currentWord.imageUrl} alt="concept" className="w-32 h-32 rounded-2xl object-cover mb-8 shadow-md" />
                )}
                
                <h2 className="text-4xl font-black text-gray-800 mb-4">{currentWord.term}</h2>
                <button onClick={handleAudio} className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-colors">
                    <SpeakerIcon className="w-6 h-6" />
                </button>
                <p className="mt-8 text-gray-400 text-sm animate-pulse">Tap to flip</p>
            </div>

            {/* Back */}
            <div className="absolute w-full h-full bg-gradient-to-br from-primary to-indigo-600 rounded-3xl p-8 shadow-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center text-white">
                <h3 className="text-2xl font-bold mb-4 border-b border-white/20 pb-2">{currentWord.definition}</h3>
                
                <div className="bg-white/10 rounded-xl p-4 w-full relative group">
                    <p className="text-lg italic mb-2 pr-6">"{currentWord.examples[0].target}"</p>
                    <p className="text-sm opacity-70">{currentWord.examples[0].native}</p>
                    <button 
                        onClick={handleExampleAudio}
                        className="absolute top-2 right-2 text-white/70 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors"
                    >
                        <SpeakerIcon className="w-4 h-4" />
                    </button>
                </div>

                <button 
                    onClick={nextCard}
                    className="mt-8 bg-white text-primary px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    Next Card
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FlashcardMode;