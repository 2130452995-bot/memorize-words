import React, { useState } from 'react';
import { SavedWord, Language } from '../types';
import { generateStory } from '../services/geminiService';
import { SparklesIcon, XMarkIcon } from './Icons';

interface NotebookViewProps {
  savedWords: SavedWord[];
  onDelete: (id: string) => void;
  onStudy: () => void;
  sourceLang: Language;
  targetLang: Language;
}

const NotebookView: React.FC<NotebookViewProps> = ({ savedWords, onDelete, onStudy, sourceLang, targetLang }) => {
  const [story, setStory] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  const handleMakeStory = async () => {
    if (savedWords.length < 2) {
        alert("Save at least 2 words to make a story!");
        return;
    }
    setLoadingStory(true);
    try {
        const terms = savedWords.map(w => w.term);
        const generated = await generateStory(terms, targetLang, sourceLang);
        setStory(generated);
    } catch (e) {
        console.error(e);
        alert("Failed to weave a story. Try again!");
    } finally {
        setLoadingStory(false);
    }
  };

  return (
    <div className="animate-flip-in pb-24">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-gray-800">My Notebook</h2>
          <span className="bg-secondary text-white px-3 py-1 rounded-full font-bold text-sm shadow-sm">{savedWords.length} words</span>
      </div>

      {savedWords.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
              <p className="text-xl">Your notebook is empty.</p>
              <p>Go search and save some cool words!</p>
          </div>
      ) : (
          <>
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={onStudy}
                    className="flex-1 bg-white border-2 border-primary text-primary py-3 rounded-xl font-bold shadow-sm hover:bg-primary hover:text-white transition-colors"
                >
                    Study Flashcards
                </button>
                <button 
                    onClick={handleMakeStory}
                    disabled={loadingStory}
                    className="flex-1 bg-gradient-to-r from-secondary to-orange-400 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-shadow flex justify-center items-center gap-2"
                >
                    {loadingStory ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                        <SparklesIcon className="w-5 h-5" />
                    )}
                    Weave Story
                </button>
            </div>

            {story && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 relative animate-flip-in">
                    <button onClick={() => setStory(null)} className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-500">
                        <XMarkIcon />
                    </button>
                    <h3 className="font-bold text-indigo-800 mb-2 uppercase text-sm tracking-widest">AI Story Time</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{story}</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedWords.map((word) => (
                    <div key={word.id} className="bg-white rounded-2xl p-4 shadow-sm relative group">
                        <button 
                            onClick={() => onDelete(word.id)}
                            className="absolute top-2 right-2 text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                             {word.imageUrl && (
                                 <img src={word.imageUrl} alt={word.term} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                             )}
                             <div>
                                 <p className="font-bold text-lg text-gray-800">{word.term}</p>
                                 <p className="text-sm text-gray-500 truncate max-w-[150px]">{word.definition}</p>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
          </>
      )}
    </div>
  );
};

export default NotebookView;
