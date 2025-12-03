import React, { useState, useEffect } from 'react';
import { useStore } from '../components/StoreContext';
import { calculateNextReview } from '../services/sm2';
import { Brain, Check, RefreshCw, X, ArrowRight } from 'lucide-react';
import { StudyCard, Highlight } from '../types';

const Study = () => {
  const { getCardsDue, highlights, updateCard, books } = useStore();
  const [queue, setQueue] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, correct: 0 });

  useEffect(() => {
    const due = getCardsDue();
    // Shuffle queue roughly
    setQueue(due.sort(() => Math.random() - 0.5).slice(0, 20)); // Limit to 20 for session
  }, []);

  const currentCard = queue[currentIndex];
  
  const currentHighlight = currentCard 
    ? highlights.find(h => h.id === currentCard.highlightId) 
    : null;
  
  const currentBook = currentHighlight 
    ? books.find(b => b.id === currentHighlight.bookId) 
    : null;

  const handleResponse = (quality: number) => {
    if (!currentCard) return;

    const updatedCard = calculateNextReview(currentCard, quality);
    updateCard(updatedCard);

    setStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (quality >= 3 ? 1 : 0)
    }));

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setSessionComplete(true);
    }
  };

  if (queue.length === 0 && !sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-full flex items-center justify-center">
           <Check className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">All Caught Up</h2>
          <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
            You have no cards due for review right now.
          </p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in space-y-12">
        <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">Session Complete</h2>
        <div className="flex gap-12">
          <div className="text-center">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Reviewed</p>
            <p className="text-5xl font-bold text-zinc-900">{stats.reviewed}</p>
          </div>
          <div className="w-px bg-zinc-200 h-20"></div>
          <div className="text-center">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Accuracy</p>
            <p className="text-5xl font-bold text-zinc-900">
              {stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0}%
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-10 py-4 bg-black text-white rounded-md font-medium hover:bg-zinc-800 transition-colors shadow-xl shadow-zinc-200/50"
        >
          Finish Session
        </button>
      </div>
    );
  }

  if (!currentHighlight || !currentBook) return <div className="p-10 text-center text-zinc-500">Loading card...</div>;

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col justify-center">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">
          <span>Card {currentIndex + 1} / {queue.length}</span>
          <span className="truncate max-w-[200px]">{currentBook.title}</span>
        </div>
        <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-300 ease-out" 
            style={{ width: `${((currentIndex) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 bg-white rounded-md border border-zinc-200 shadow-sm flex flex-col relative min-h-[400px]">
        <div className="p-10 md:p-16 flex-1 flex flex-col items-center justify-center text-center">
           <h3 className="text-2xl md:text-3xl font-serif text-zinc-800 leading-relaxed">
             {currentHighlight.text}
           </h3>
           
           {showAnswer && currentHighlight.note && (
             <div className="mt-8 p-6 bg-zinc-50 border-l-2 border-zinc-900 text-zinc-800 text-left w-full max-w-lg animate-fade-in-up rounded-sm">
               <span className="font-bold text-xs uppercase tracking-wider text-zinc-400 block mb-2">My Note</span> 
               {currentHighlight.note}
             </div>
           )}

           {showAnswer && !currentHighlight.note && (
             <div className="mt-8 text-zinc-400 italic font-serif animate-fade-in-up">
               (No note attached)
             </div>
           )}
        </div>

        {/* Controls */}
        <div className="p-8 border-t border-zinc-100">
          {!showAnswer ? (
            <button 
              onClick={() => setShowAnswer(true)}
              className="w-full py-4 bg-black hover:bg-zinc-800 text-white rounded-md font-medium text-lg shadow-lg shadow-zinc-200 transition-all active:scale-[0.99]"
            >
              Reveal
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <button 
                onClick={() => handleResponse(2)} // Fail
                className="py-4 bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 rounded-md font-medium text-base flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Review again
              </button>
              <button 
                onClick={() => handleResponse(4)} // Good
                className="py-4 bg-black hover:bg-zinc-800 text-white rounded-md font-medium text-base flex items-center justify-center gap-2 shadow-lg shadow-zinc-200 transition-all"
              >
                Next Card
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Study;