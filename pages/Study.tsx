import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../components/StoreContext';
import { DeckTable } from '../components/DeckTable';
import { Settings } from 'lucide-react';

const Study = () => {
  const navigate = useNavigate();
  const { books, getDeckStats, isLoaded } = useStore();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Loading...
      </div>
    );
  }

  // Calculate total stats for "All Books" deck
  const totalStats = getDeckStats();

  // Prepare decks array
  const decks = [
    {
      id: 'all',
      title: 'All Books',
      stats: totalStats,
      isAllBooks: true
    },
    ...books.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      stats: getDeckStats(book.id)
    }))
  ];

  const handleDeckClick = (deckId: string) => {
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

      {/* Deck Table */}
      {totalStats.total === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm mb-2">No cards due for review</p>
          <p className="text-zinc-400 text-xs">
            Import highlights or check back later
          </p>
        </div>
      ) : (
        <DeckTable decks={decks} onDeckClick={handleDeckClick} />
      )}
    </div>
  );
};

export default Study;