import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../components/StoreContext';
import { calculateNextReview } from '../services/sm2';
import { Brain, Check, RefreshCw, ArrowRight, Edit2, Clock, Target, Zap, List } from 'lucide-react';
import { StudyCard, Highlight } from '../types';

const Study = () => {
  const navigate = useNavigate();
  const {
    getCardsDue,
    highlights,
    updateCard,
    updateHighlight,
    books,
    currentSession,
    startSession,
    submitReview,
    sessionStats,
    studyCards,
    isLoaded,
    resetSession
  } = useStore();

  const [showAnswer, setShowAnswer] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNote, setEditedNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showQueueInfo, setShowQueueInfo] = useState(false);

  // Derived state from session
  const queueIds = currentSession ? currentSession.cardIds : [];
  const completedCount = currentSession ? currentSession.completedIds.length : 0;
  const currentIndex = completedCount;
  const sessionComplete = queueIds.length > 0 && currentIndex >= queueIds.length;

  const currentCardId = queueIds[currentIndex];
  // Find card in studyCards (which might be updated)
  const currentCard = studyCards.find(c => c.id === currentCardId);
  const currentHighlight = currentCard ? highlights.find(h => h.id === currentCard.highlightId) : null;
  const currentBook = currentHighlight ? books.find(b => b.id === currentHighlight.bookId) : null;

  const totalDue = getCardsDue().length;

  useEffect(() => {
    if (isLoaded) {
      startSession();
    }
  }, [isLoaded]);

  const handleResponse = useCallback((quality: number) => {
    if (!currentCard) return;

    // 1. Update Card (SM-2 Algorithm)
    const updatedCard = calculateNextReview(currentCard, quality);
    updateCard(updatedCard);

    // 2. Update Session
    submitReview(currentCard.id, quality);

    setShowAnswer(false);
    setIsEditingNote(false);
  }, [currentCard, updateCard, submitReview]);

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
      if (isEditingNote && e.key === 'Escape') {
        e.preventDefault();
        handleSaveNote();
        return;
      }

      if (isEditingNote) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (!showAnswer && !sessionComplete && currentCard) setShowAnswer(true);
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
  }, [showAnswer, isEditingNote, handleResponse, handleEditNote, handleSaveNote, sessionComplete, currentCard]);

  // Conditional Returns - MUST be after all hooks
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full text-zinc-500">Loading study session...</div>;
  }

  if (!currentSession && totalDue === 0) {
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
            <p className="text-5xl font-bold text-zinc-900">{sessionStats.reviewed}</p>
          </div>
          <div className="w-px bg-zinc-200 h-20"></div>
          <div className="text-center">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Accuracy</p>
            <p className="text-5xl font-bold text-zinc-900">
              {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-zinc-500">
            You have {totalDue - sessionStats.reviewed} cards remaining in the queue.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-10 py-4 bg-black text-white rounded-md font-medium hover:bg-zinc-800 transition-colors shadow-xl shadow-zinc-200/50"
          >
            Finish Session
          </button>
        </div>
      </div>
    );
  }

  if (!currentHighlight || !currentBook) {
    if (currentSession && !sessionComplete && queueIds.length > 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Session Sync Error</h2>
            <p className="text-zinc-500 max-w-md mx-auto mb-6">
              The current card seems to be missing. This can happen if you deleted a highlight while a session was active.
            </p>
            <button
              onClick={resetSession}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              Reset Session
            </button>
          </div>
        </div>
      );
    }
    return <div className="p-10 text-center text-zinc-500">Loading card...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-zinc-200">
        <div className="flex items-center justify-between text-xs">
          <div className="text-zinc-400 font-medium flex items-center gap-2">
            <span>CARD {currentIndex + 1} / {queueIds.length}</span>
            <div className="relative group">
              <button
                className="p-1 hover:bg-zinc-100 rounded-full"
                onMouseEnter={() => setShowQueueInfo(true)}
                onMouseLeave={() => setShowQueueInfo(false)}
              >
                <List className="w-3 h-3" />
              </button>
              {showQueueInfo && (
                <div className="absolute top-full left-0 mt-2 bg-black text-white p-3 rounded shadow-lg w-48 z-50">
                  <p className="font-semibold mb-1">Queue Status</p>
                  <div className="flex justify-between text-zinc-400">
                    <span>Session:</span>
                    <span className="text-white">{queueIds.length}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Total Due:</span>
                    <span className="text-white">{totalDue}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Backlog:</span>
                    <span className="text-white">{Math.max(0, totalDue - queueIds.length)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compact Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-zinc-400" />
              <span className="text-zinc-600">{sessionStats.reviewed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-zinc-400" />
              <span className="text-zinc-600">{sessionStats.streak}</span>
            </div>
          </div>
        </div>

        {/* Thin Progress Bar */}
        <div className="h-px bg-zinc-200 mt-3">
          <div
            className="h-full bg-black transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex) / queueIds.length) * 100}%` }}
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