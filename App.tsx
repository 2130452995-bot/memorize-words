import React, { useState, useEffect } from 'react';
import { Language, DictionaryResult, SavedWord } from './types';
import { lookupWord, createChat } from './services/geminiService';
import ResultView from './components/ResultView';
import NotebookView from './components/NotebookView';
import FlashcardMode from './components/FlashcardMode';
import ChatWidget from './components/ChatWidget';
import { ArrowLeftIcon } from './components/Icons';
import { Chat } from '@google/genai';

type ViewState = 'home' | 'result' | 'notebook';

function App() {
  const [view, setView] = useState<ViewState>('home');
  
  // State for search
  const [sourceLang, setSourceLang] = useState<Language>(Language.ENGLISH);
  const [targetLang, setTargetLang] = useState<Language>(Language.SPANISH);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State for data
  const [currentResult, setCurrentResult] = useState<DictionaryResult | null>(null);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  
  // State for Chat
  const [showChat, setShowChat] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  // State for Study
  const [studyMode, setStudyMode] = useState(false);

  // Load saved words from local storage
  useEffect(() => {
    const stored = localStorage.getItem('lingovibe_notebook');
    if (stored) {
      try {
        setSavedWords(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse notebook", e);
      }
    }
  }, []);

  // Save words to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('lingovibe_notebook', JSON.stringify(savedWords));
  }, [savedWords]);

  const handleSearch = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setView('result'); // Switch view immediately to show loading skeleton if we had one, but we use spinner
    setCurrentResult(null); // Clear previous
    setShowChat(false);

    try {
      const result = await lookupWord(searchQuery, sourceLang, targetLang);
      setCurrentResult(result);
      
      // Initialize Chat Session for this word
      const session = createChat(result.term, sourceLang, targetLang);
      setChatSession(session);

    } catch (error) {
      console.error(error);
      alert("Oops! The AI got tongue-tied. Try again.");
      setView('home');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWord = (wordWithImage: SavedWord) => {
    if (savedWords.some(w => w.term === wordWithImage.term)) return;
    setSavedWords(prev => [wordWithImage, ...prev]);
  };

  const handleDeleteWord = (id: string) => {
    setSavedWords(prev => prev.filter(w => w.id !== id));
  };

  // Determine if current result is already saved
  const isCurrentSaved = currentResult ? savedWords.some(w => w.term === currentResult.term) : false;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-10">
      
      {/* Navbar / Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        {view !== 'home' ? (
             <button onClick={() => setView('home')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600">
                <ArrowLeftIcon />
             </button>
        ) : (
             <div className="w-10"></div> // Spacer
        )}
        <h1 className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer" onClick={() => setView('home')}>
            LingoVibe
        </h1>
        <button 
            onClick={() => setView('notebook')}
            className="relative p-2 rounded-full hover:bg-gray-100"
        >
            <span className="text-xl">📒</span>
            {savedWords.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {savedWords.length}
                </span>
            )}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 mt-6">
        
        {view === 'home' && (
           <div className="flex flex-col items-center justify-center pt-10 animate-flip-in">
               <div className="text-center mb-8">
                   <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Unlock the World 🌍</h2>
                   <p className="text-gray-500 text-lg">Fun definitions, smart context, and AI stories.</p>
               </div>

               <div className="w-full bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                  <div className="flex gap-2 mb-4">
                      <div className="flex-1">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">I speak</label>
                          <select 
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value as Language)}
                            className="w-full mt-1 p-3 rounded-xl bg-gray-50 border-none font-semibold text-gray-700 focus:ring-2 focus:ring-primary outline-none"
                          >
                            {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                      </div>
                      <div className="flex-1">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">I'm learning</label>
                          <select 
                             value={targetLang}
                             onChange={(e) => setTargetLang(e.target.value as Language)}
                             className="w-full mt-1 p-3 rounded-xl bg-indigo-50 border-none font-semibold text-primary focus:ring-2 focus:ring-primary outline-none"
                          >
                             {Object.values(Language).filter(l => l !== sourceLang).map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                      </div>
                  </div>

                  <form onSubmit={handleSearch} className="relative mt-6">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type a word or phrase..."
                        className="w-full p-4 pr-14 text-lg bg-white border-2 border-gray-100 rounded-2xl shadow-inner focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-300 font-bold"
                      />
                      <button 
                        type="submit"
                        disabled={loading || !searchQuery}
                        className="absolute right-2 top-2 bottom-2 bg-primary text-white px-4 rounded-xl font-bold shadow-md hover:bg-indigo-600 transition-colors disabled:bg-gray-300"
                      >
                         {loading ? '...' : 'Go'}
                      </button>
                  </form>
               </div>
               
               {/* Quick Tips / Decor */}
               <div className="mt-12 grid grid-cols-2 gap-4 w-full opacity-60">
                   <div className="text-center p-4 bg-yellow-50 rounded-2xl text-yellow-700 text-sm font-medium">
                       ✨ Learn nuances, not just definitions.
                   </div>
                   <div className="text-center p-4 bg-pink-50 rounded-2xl text-pink-700 text-sm font-medium">
                       🖼️ Visual memory aids included.
                   </div>
               </div>
           </div>
        )}

        {view === 'result' && (
            loading ? (
                <div className="flex flex-col items-center justify-center pt-20">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-400 font-medium animate-pulse">Consulting the linguistic spirits...</p>
                </div>
            ) : currentResult ? (
                <ResultView 
                    result={currentResult} 
                    sourceLang={sourceLang}
                    targetLang={targetLang}
                    onSave={handleSaveWord}
                    onOpenChat={() => setShowChat(true)}
                    isSaved={isCurrentSaved}
                />
            ) : null
        )}

        {view === 'notebook' && (
            <NotebookView 
                savedWords={savedWords} 
                onDelete={handleDeleteWord}
                onStudy={() => setStudyMode(true)}
                sourceLang={sourceLang}
                targetLang={targetLang}
            />
        )}

      </main>

      {/* Floating Chat */}
      {showChat && (
          <ChatWidget chatSession={chatSession} onClose={() => setShowChat(false)} />
      )}

      {/* Study Mode Overlay */}
      {studyMode && savedWords.length > 0 && (
          <FlashcardMode words={savedWords} onClose={() => setStudyMode(false)} />
      )}

    </div>
  );
}

export default App;
