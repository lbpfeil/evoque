import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../components/StoreContext';
import { calculateNextReview } from '../services/sm2';
import { Brain, Check, RefreshCw, ArrowRight, Edit2, Clock, Target, Zap } from 'lucide-react';
import { StudyCard, Highlight } from '../types';

const Study = () => {
  const { getCardsDue, highlights, updateCard, updateHighlight, books } = useStore();
  const [queue, setQueue] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, correct: 0, streak: 0, startTime: Date.now() });

  // Note editing state
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNote, setEditedNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const due = getCardsDue();
    setQueue(due.sort(() => Math.random() - 0.5).slice(0, 20));
  }, []);

  const currentCard = queue[currentIndex];
  const currentHighlight = currentCard ? highlights.find(h => h.id === currentCard.highlightId) : null;
  const currentBook = currentHighlight ? books.find(b => b.id === currentHighlight.bookId) : null;

  const handleResponse = useCallback((quality: number) => {
    if (!currentCard) return;

    const updatedCard = calculateNextReview(currentCard, quality);
    updateCard(updatedCard);

    const isCorrect = quality >= 3;
    setStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      streak: isCorrect ? prev.streak + 1 : 0,
      startTime: prev.startTime
    }));

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setIsEditingNote(false);
    } else {
      setSessionComplete(true);
    }
  }, [currentCard, currentIndex, queue.length, updateCard]);

  const handleSaveNote = useCallback(async () => {
    if (!currentHighlight) return;

    setIsSaving(true);
    updateHighlight(currentHighlight.id, { note: editedNote });

    setTimeout(() => {
      setIsSaving(false);
      setIsEditingNote(false);
    }, 300);
  }, [currentHighlight, editedNote, updateHighlight]);

  const handleEditNote = useCallback(() => {
    if (!currentHighlight) return;
    setEditedNote(currentHighlight.note || '');
    setIsEditingNote(true);
  }, [currentHighlight]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC saves when editing
      if (isEditingNote && e.key === 'Escape') {
        e.preventDefault();
        handleSaveNote();
        return;
      }

      // Don't trigger other shortcuts when editing
      if (isEditingNote) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (!showAnswer) setShowAnswer(true);
          break;
        case '1':
          if (showAnswer) handleResponse(2);
          break;
        case '2':
          if (showAnswer) handleResponse(4);
          break;
        case 'e':
        case 'E':
          if (showAnswer) handleEditNote();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAnswer, isEditingNote, handleResponse, handleEditNote, handleSaveNote]);

  const getAverageTime = () => {
    if (stats.reviewed === 0) return 0;
    const elapsed = (Date.now() - stats.startTime) / 1000;
    return Math.round(elapsed / stats.reviewed);
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
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-zinc-200">
        <div className="flex items-center justify-between text-xs">
          <div className="text-zinc-400 font-medium">
            CARD {currentIndex + 1} / {queue.length}
          </div>

          {/* Compact Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-zinc-400" />
              <span className="text-zinc-600">{stats.reviewed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-zinc-400" />
              <span className="text-zinc-600">{stats.streak}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span className="text-zinc-600">{getAverageTime()}s</span>
            </div>
          </div>
        </div>

        {/* Thin Progress Bar */}
        <div className="h-px bg-zinc-200 mt-3">
          <div
            className="h-full bg-black transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-2xl w-full space-y-6">
          {/* Book Info - Compact */}
          <div className="flex items-center gap-2.5">
            <img
              src={currentBook.coverUrl}
              alt={currentBook.title}
              className="w-8 h-12 object-cover rounded-sm shadow-sm"
            />
            <div>
              <h3 className="text-xs font-semibold text-zinc-900">{currentBook.title}</h3>
              <p className="text-[10px] text-zinc-400">{currentBook.author}</p>
            </div>
          </div>

          {/* Highlight Text */}
          <div>
            <blockquote className="text-xl md:text-2xl font-serif text-zinc-800 leading-relaxed">
              "{currentHighlight.text}"
            </blockquote>
          </div>

          {/* Answer Section */}
          {showAnswer && (
            <div className="animate-fade-in-up">
              {isEditingNote ? (
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Edit Note</span>
                    {isSaving && <Clock className="w-3 h-3 text-zinc-400 animate-spin" />}
                  </div>
                  <textarea
                    value={editedNote}
                    onChange={(e) => setEditedNote(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-sm p-3 text-sm text-zinc-800 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                    rows={3}
                    placeholder="Add your note here..."
                    autoFocus
                  />
                  <p className="text-[10px] text-zinc-400 mt-2">Press ESC to save</p>
                </div>
              ) : (
                <div className="bg-zinc-50 border-l-2 border-black rounded-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">My Note</span>
                    <button
                      onClick={handleEditNote}
                      className="p-1 text-zinc-400 hover:text-black transition-colors"
                      title="Edit Note (E)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {currentHighlight.note ? (
                    <p className="text-sm text-zinc-700 leading-relaxed">{currentHighlight.note}</p>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">No note attached. Press E to add one.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compact Controls */}
      <div className="px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-3 bg-black hover:bg-zinc-800 text-white rounded-md font-medium text-sm transition-all active:scale-[0.99]"
            >
              Reveal <span className="text-xs text-zinc-400 ml-2">(Space)</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleResponse(2)}
                disabled={isEditingNote}
                className="py-3 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-400 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Again <span className="text-xs text-zinc-400">(1)</span>
              </button>
              <button
                onClick={() => handleResponse(4)}
                disabled={isEditingNote}
                className="py-3 bg-black hover:bg-zinc-800 text-white rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Good <span className="text-xs text-zinc-300">(2)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Study;