import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../components/StoreContext';
import { DeckTable } from '../components/DeckTable';
import { EmptyDeckPopover } from '../components/EmptyDeckPopover';
import { Settings } from 'lucide-react';

const Study = () => {
  const navigate = useNavigate();
  const { books, getDeckStats, isLoaded } = useStore();
  const [showEmptyPopover, setShowEmptyPopover] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Loading...
      </div>
    );
  }

  // Calculate total stats for "All Books"
  const totalStats = getDeckStats();

  const handleDeckClick = (deckId: string) => {
    // Check if deck has cards before navigating
    const stats = deckId === 'all' ? totalStats : getDeckStats(deckId);

    if (stats.total === 0) {
      setShowEmptyPopover(true);
      return;
    }

    if (deckId === 'all') {
      navigate('/study/session');
    } else {
      navigate(`/study/session?deck=${deckId}`);
    }
  };

  const handleSettings = () => {
    // TODO: Open settings modal
    console.log('Settings clicked');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <header className="mb-3">
        <h1 className="text-base font-semibold text-zinc-900">Study</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Start your daily study session with all books, or choose a specific book below for focused practice.
        </p>
      </header>

      {/* Settings Button */}
      <div className="flex justify-end mb-3">
        <button
          onClick={handleSettings}
          className="p-1 hover:bg-zinc-100 rounded transition-colors"
          title="Study Settings"
        >
          <Settings className="w-3.5 h-3.5 text-zinc-600" />
        </button>
      </div>

      {/* Prominent All Books Button */}
      <button
        onClick={() => handleDeckClick('all')}
        className="w-full mb-4 px-4 py-3 bg-black hover:bg-zinc-800 text-white rounded-md transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold">Study All Books</div>
            <div className="text-xs text-white/70">Review cards from your entire library</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-blue-300 font-semibold">{totalStats.new}</div>
              <div className="text-white/50 text-[10px]">New</div>
            </div>
            <div className="text-center">
              <div className="text-amber-300 font-semibold">{totalStats.learning}</div>
              <div className="text-white/50 text-[10px]">Learning</div>
            </div>
            <div className="text-center">
              <div className="text-green-300 font-semibold">{totalStats.review}</div>
              <div className="text-white/50 text-[10px]">Review</div>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-lg font-bold">{totalStats.total}</div>
            <div className="text-white/50 text-[10px]">Total</div>
          </div>
        </div>
      </button>

      {/* Individual Books Section */}
      <div className="mb-2">
        <h2 className="text-xs font-semibold text-zinc-600">Study by Book</h2>
      </div>

      {/* Deck Table (without All Books row) */}
      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm mb-2">No books imported yet</p>
          <p className="text-zinc-400 text-xs">
            Import your Kindle highlights to start studying
          </p>
        </div>
      ) : (
        <DeckTable
          decks={books.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            stats: getDeckStats(book.id)
          }))}
          onDeckClick={handleDeckClick}
        />
      )}

      {/* Empty Deck Popover */}
      {showEmptyPopover && (
        <EmptyDeckPopover onClose={() => setShowEmptyPopover(false)} />
      )}
    </div>
  );
};

export default Study;