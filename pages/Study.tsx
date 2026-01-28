import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../components/StoreContext';
import { DeckTable } from '../components/DeckTable';
import { EmptyDeckPopover } from '../components/EmptyDeckPopover';
import { StudyHeatmap } from '../components/StudyHeatmap';
import { PageHeader } from '../components/patterns/PageHeader';
import { Button } from '../components/ui/button';

const Study = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('study');
  const { books, getDeckStats, isLoaded, reviewLogs } = useStore();
  const [showEmptyPopover, setShowEmptyPopover] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {t('loading')}
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

  return (
    <div className="p-md sm:p-lg">
      {/* Header */}
      <PageHeader title={t('title')} description={t('subtitle')} size="compact" />

      {/* Review Activity Heatmap */}
      {reviewLogs.length > 0 && (
        <StudyHeatmap reviewLogs={reviewLogs} />
      )}

      {/* Prominent All Books Button */}
      <Button
        onClick={() => handleDeckClick('all')}
        className="w-full mb-md px-sm sm:px-md py-sm flex items-center justify-between group"
      >
        <div className="flex items-center gap-xs sm:gap-sm">
          <div className="flex items-center justify-center w-8 h-8 bg-background/10 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-body font-semibold">{t('allBooks.title')}</div>
            <div className="text-caption text-background/70 hidden sm:block">{t('allBooks.subtitle')}</div>
          </div>
        </div>

        {/* Stats - Mobile: only show total */}
        <div className="sm:hidden text-right">
          <div className="text-lg font-bold">{totalStats.total}</div>
          <div className="text-background/50 text-overline">{t('stats.due')}</div>
        </div>

        {/* Stats - Desktop: show all */}
        <div className="hidden sm:flex items-center gap-md text-caption">
          <div className="flex items-center gap-sm">
            <div className="text-center">
              <div className="text-status-new font-semibold">{totalStats.new}</div>
              <div className="text-background/50 text-overline">{t('stats.new')}</div>
            </div>
            <div className="text-center">
              <div className="text-status-learning font-semibold">{totalStats.learning}</div>
              <div className="text-background/50 text-overline">{t('stats.learning')}</div>
            </div>
            <div className="text-center">
              <div className="text-status-review font-semibold">{totalStats.review}</div>
              <div className="text-background/50 text-overline">{t('stats.review')}</div>
            </div>
          </div>
          <div className="text-right ml-md">
            <div className="text-lg font-bold">{totalStats.total}</div>
            <div className="text-background/50 text-overline">{t('stats.total')}</div>
          </div>
        </div>
      </Button>

      {/* Individual Books Section */}
      <div className="mb-xs">
        <h2 className="text-caption font-semibold text-muted-foreground">{t('byBook.title')}</h2>
      </div>

      {/* Deck Table (without All Books row) */}
      {books.length === 0 ? (
        <div className="text-center py-2xl">
          <p className="text-muted-foreground text-body mb-xs">{t('emptyState.noBooks')}</p>
          <p className="text-muted-foreground text-caption">
            {t('emptyState.importPrompt')}
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