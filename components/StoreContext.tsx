import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, Highlight, StudyCard, StudyStatus, UserSettings, StudySession, ReviewLog, Tag, DeckStats, DailyProgress } from '../types';
import { MOCK_BOOKS, MOCK_HIGHLIGHTS, MOCK_CARDS, MOCK_TAGS } from '../services/mockData';
import { parseMyClippings } from '../services/parser';

interface StoreContextType {
  books: Book[];
  highlights: Highlight[];
  studyCards: StudyCard[];
  tags: Tag[];
  importData: (text: string) => { newBooks: number; newHighlights: number };
  getCardsDue: () => StudyCard[];
  updateCard: (card: StudyCard) => void;
  getBook: (id: string) => Book | undefined;
  getBookHighlights: (bookId: string) => Highlight[];
  deleteHighlight: (id: string) => void;
  updateHighlight: (id: string, updates: Partial<Highlight>) => void;
  bulkDeleteHighlights: (ids: string[]) => void;
  addToStudy: (highlightId: string) => void;
  removeFromStudy: (highlightId: string) => void;
  bulkAddToStudy: (highlightIds: string[]) => void;
  deleteCard: (cardId: string) => void;
  getHighlightStudyStatus: (highlightId: string) => StudyStatus | 'not-started';
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  currentSession: StudySession | null;
  startSession: (bookId?: string) => void;
  submitReview: (cardId: string, quality: number) => void;
  resetSession: () => void;
  undoLastReview: () => void;
  sessionStats: { reviewed: number; correct: number; streak: number };
  getDeckStats: (bookId?: string) => DeckStats;
  getBookCardsDue: (bookId: string) => StudyCard[];
  dailyProgress: DailyProgress;
  getReviewsToday: (bookId?: string) => number;
  reviewLogs: ReviewLog[];
  isLoaded: boolean;
  addTag: (name: string, parentId?: string, bookId?: string) => string;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  assignTagToHighlight: (highlightId: string, tagId: string) => void;
  removeTagFromHighlight: (highlightId: string, tagId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [highlights, setHighlights] = useState<Highlight[]>(MOCK_HIGHLIGHTS);
  const [studyCards, setStudyCards] = useState<StudyCard[]>(MOCK_CARDS);
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const [settings, setSettings] = useState<UserSettings>({
    maxReviewsPerDay: 15,
    newCardsPerDay: 10
  });
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: new Date().toISOString().split('T')[0],
    bookReviews: {}
  });

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedBooks = localStorage.getItem('khm_books');
      const savedHighlights = localStorage.getItem('khm_highlights');
      const savedCards = localStorage.getItem('khm_cards');
      const savedTags = localStorage.getItem('khm_tags');
      const savedSettings = localStorage.getItem('khm_settings');
      const savedSession = localStorage.getItem('khm_session');
      const savedLogs = localStorage.getItem('khm_logs');
      const savedProgress = localStorage.getItem('khm_daily_progress');

      if (savedBooks) {
        const parsed = JSON.parse(savedBooks);
        if (Array.isArray(parsed)) setBooks(parsed);
      }
      if (savedHighlights) {
        const parsed = JSON.parse(savedHighlights);
        if (Array.isArray(parsed)) setHighlights(parsed);
      }
      if (savedCards) {
        const parsed = JSON.parse(savedCards);
        if (Array.isArray(parsed)) setStudyCards(parsed);
      }
      if (savedTags) {
        const parsed = JSON.parse(savedTags);
        if (Array.isArray(parsed)) setTags(parsed);
      }
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedSession) {
        const session = JSON.parse(savedSession);
        // Ensure history array exists (for backward compatibility)
        if (!session.history) {
          session.history = [];
        }
        // Reset session if it's from a previous day
        const sessionDate = new Date(session.date).toDateString();
        const today = new Date().toDateString();
        if (sessionDate !== today) {
          localStorage.removeItem('khm_session');
        } else {
          setCurrentSession(session);
        }
      }
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed)) setReviewLogs(parsed);
      }
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const today = new Date().toISOString().split('T')[0];
        // Reset progress if it's a new day
        if (progress.date === today) {
          setDailyProgress(progress);
        } else {
          setDailyProgress({ date: today, bookReviews: {} });
        }
      }
    } catch (error) {
      console.error('Failed to load data from local storage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem('khm_books', JSON.stringify(books));
    localStorage.setItem('khm_highlights', JSON.stringify(highlights));
    localStorage.setItem('khm_cards', JSON.stringify(studyCards));
    localStorage.setItem('khm_tags', JSON.stringify(tags));
    localStorage.setItem('khm_settings', JSON.stringify(settings));
    if (currentSession) localStorage.setItem('khm_session', JSON.stringify(currentSession));
    else localStorage.removeItem('khm_session');
    localStorage.setItem('khm_logs', JSON.stringify(reviewLogs));
    localStorage.setItem('khm_daily_progress', JSON.stringify(dailyProgress));
  }, [books, highlights, studyCards, tags, settings, currentSession, reviewLogs, dailyProgress, isLoaded]);

  const importData = (text: string) => {
    try {
      const { books: parsedBooks, highlights: parsedHighlights } = parseMyClippings(text);

      // 1. Merge Highlights first to get the complete set
      let newHighlightsCount = 0;
      const nextHighlights = [...highlights];
      const nextCards = [...studyCards];

      parsedHighlights.forEach(ph => {
        const exists = nextHighlights.find(h => h.text === ph.text && h.bookId === ph.bookId);
        if (!exists) {
          nextHighlights.push({ ...ph, importedAt: new Date().toISOString() });
          // Create a new study card for this highlight
          nextCards.push({
            id: crypto.randomUUID(),
            highlightId: ph.id,
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReviewDate: new Date().toISOString()
          });
          newHighlightsCount++;
        }
      });

      // 2. Merge Books and update counts based on nextHighlights
      let newBooksCount = 0;

      // Start with existing books, mapped to new objects to avoid mutation if we change them
      const booksMap = new Map<string, Book>(books.map(b => [b.id, { ...b }]));

      parsedBooks.forEach(pb => {
        if (!booksMap.has(pb.id)) {
          booksMap.set(pb.id, pb);
          newBooksCount++;
        }
      });

      // 3. Recalculate counts for ALL books in the map
      const nextBooks = Array.from(booksMap.values()).map(b => {
        const count = nextHighlights.filter(h => h.bookId === b.id).length;
        return { ...b, highlightCount: count };
      });

      setBooks(nextBooks);
      setHighlights(nextHighlights);
      setStudyCards(nextCards);

      return { newBooks: newBooksCount, newHighlights: newHighlightsCount };
    } catch (error: any) {
      console.error('Failed to import data:', error);
      throw new Error(error.message || 'Failed to process the file. Please ensure it is a valid My Clippings.txt file.');
    }
  };

  const getCardsDue = () => {
    const now = new Date();
    return studyCards.filter(card => new Date(card.nextReviewDate) <= now);
  };

  const updateCard = (updatedCard: StudyCard) => {
    setStudyCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const getBook = (id: string) => books.find(b => b.id === id);

  const getBookHighlights = (bookId: string) => highlights.filter(h => h.bookId === bookId);

  const deleteHighlight = (id: string) => {
    const highlight = highlights.find(h => h.id === id);
    if (!highlight) return;

    // Remove highlight
    setHighlights(prev => prev.filter(h => h.id !== id));
    // Remove associated study card
    setStudyCards(prev => prev.filter(c => c.highlightId !== id));

    // Remove from current session if present
    if (currentSession) {
      setCurrentSession(prev => {
        if (!prev) return null;
        const cardToRemove = studyCards.find(c => c.highlightId === id);
        if (!cardToRemove) return prev;
        return {
          ...prev,
          cardIds: prev.cardIds.filter(cid => cid !== cardToRemove.id),
          completedIds: prev.completedIds.filter(cid => cid !== cardToRemove.id)
        };
      });
    }

    // Update book count
    setBooks(prev => prev.map(b => {
      if (b.id === highlight.bookId) {
        return { ...b, highlightCount: Math.max(0, b.highlightCount - 1) };
      }
      return b;
    }));
  };

  const bulkDeleteHighlights = (ids: string[]) => {
    const idsSet = new Set(ids);
    const affectedBookIds = new Set<string>();

    highlights.forEach(h => {
      if (idsSet.has(h.id)) affectedBookIds.add(h.bookId);
    });

    setHighlights(prev => prev.filter(h => !idsSet.has(h.id)));
    setStudyCards(prev => prev.filter(c => !idsSet.has(c.highlightId)));

    // Remove from current session
    if (currentSession) {
      setCurrentSession(prev => {
        if (!prev) return null;
        // Find all card IDs associated with these highlights
        const cardsToRemove = studyCards.filter(c => idsSet.has(c.highlightId)).map(c => c.id);
        const cardsToRemoveSet = new Set(cardsToRemove);

        return {
          ...prev,
          cardIds: prev.cardIds.filter(cid => !cardsToRemoveSet.has(cid)),
          completedIds: prev.completedIds.filter(cid => !cardsToRemoveSet.has(cid))
        };
      });
    }

    // Re-calculate counts for affected books
    setBooks(prev => prev.map(b => {
      if (affectedBookIds.has(b.id)) {
        // We need to calculate the count based on the *new* highlights state, 
        // but since setState is async/batched, we do it manually here based on previous state filtering
        const remainingCount = highlights.filter(h => h.bookId === b.id && !idsSet.has(h.id)).length;
        return { ...b, highlightCount: remainingCount };
      }
      return b;
    }));
  };

  const updateHighlight = (id: string, updates: Partial<Highlight>) => {
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const addToStudy = (highlightId: string) => {
    // Check if already in study
    const existingCard = studyCards.find(c => c.highlightId === highlightId);
    if (existingCard) return;

    // Create new study card
    const newCard: StudyCard = {
      id: crypto.randomUUID(),
      highlightId,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date().toISOString()
    };

    setStudyCards(prev => [...prev, newCard]);
    updateHighlight(highlightId, { inStudy: true });
  };

  const removeFromStudy = (highlightId: string) => {
    setStudyCards(prev => prev.filter(c => c.highlightId !== highlightId));
    updateHighlight(highlightId, { inStudy: false });
  };

  const bulkAddToStudy = (highlightIds: string[]) => {
    const newCards: StudyCard[] = [];
    const existingHighlightIds = new Set(studyCards.map(c => c.highlightId));

    highlightIds.forEach(highlightId => {
      if (!existingHighlightIds.has(highlightId)) {
        newCards.push({
          id: crypto.randomUUID(),
          highlightId,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date().toISOString()
        });
      }
    });

    setStudyCards(prev => [...prev, ...newCards]);
    setHighlights(prev => prev.map(h =>
      highlightIds.includes(h.id) ? { ...h, inStudy: true } : h
    ));
  };

  const getHighlightStudyStatus = (highlightId: string): StudyStatus | 'not-started' => {
    const card = studyCards.find(c => c.highlightId === highlightId);
    if (!card) return 'not-started';
    if (card.repetitions === 0) return 'new';
    if (card.repetitions >= 5) return 'review';
    return 'learning';
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const deleteCard = (cardId: string) => {
    const card = studyCards.find(c => c.id === cardId);
    if (!card) return;

    // Find the book this card belongs to
    const highlight = highlights.find(h => h.id === card.highlightId);

    // Update daily progress if card was reviewed today
    // Check two conditions:
    // 1. Card has lastReviewedAt and it's from today
    // 2. Card is in current session's completedIds (reviewed but not yet persisted)
    const today = new Date().toISOString().split('T')[0];
    let shouldDecrementProgress = false;

    if (highlight) {
      // Check if reviewed via lastReviewedAt
      if (card.lastReviewedAt) {
        const lastReviewDate = new Date(card.lastReviewedAt).toISOString().split('T')[0];
        if (lastReviewDate === today && dailyProgress.date === today) {
          shouldDecrementProgress = true;
        }
      }

      // Check if reviewed in current session (even if not persisted yet)
      if (!shouldDecrementProgress && currentSession && currentSession.completedIds.includes(cardId)) {
        shouldDecrementProgress = true;
      }

      // Decrement if card was reviewed today
      if (shouldDecrementProgress) {
        const bookId = highlight.bookId;
        setDailyProgress(prev => ({
          ...prev,
          bookReviews: {
            ...prev.bookReviews,
            [bookId]: Math.max(0, (prev.bookReviews[bookId] || 0) - 1)
          }
        }));
      }
    }

    // Remove card from study
    setStudyCards(prev => prev.filter(c => c.id !== cardId));

    // Update highlight status
    updateHighlight(card.highlightId, { inStudy: false });

    // Remove from current session if present
    if (currentSession) {
      setCurrentSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cardIds: prev.cardIds.filter(id => id !== cardId),
          completedIds: prev.completedIds.filter(id => id !== cardId)
        };
      });
    }
  };

  const startSession = (bookId?: string) => {
    console.log('startSession called', { currentSession, isLoaded, bookId });

    const today = new Date().toISOString().split('T')[0];

    // Reset daily progress if it's a new day
    if (dailyProgress.date !== today) {
      setDailyProgress({ date: today, bookReviews: {} });
    }

    // Check if we should reset the session
    const isNewDay = !currentSession || new Date(currentSession.date).toDateString() !== new Date().toDateString();
    const isDifferentDeck = currentSession && currentSession.bookId !== bookId;
    const shouldReset = isNewDay || isDifferentDeck;

    if (!shouldReset) {
      return;
    }

    const due = bookId ? getBookCardsDue(bookId) : getCardsDue();
    if (due.length === 0) return;

    // Check daily limit for specific book
    if (bookId) {
      const reviewsToday = dailyProgress.bookReviews[bookId] || 0;
      if (reviewsToday >= 10) {
        // No more cards available for this book today
        return;
      }
      // Filter out cards already reviewed today by checking their lastReviewedAt
      const cardsNotReviewedToday = due.filter(card => {
        if (!card.lastReviewedAt) return true;
        const lastReviewDate = new Date(card.lastReviewedAt).toISOString().split('T')[0];
        return lastReviewDate !== today;
      });

      if (cardsNotReviewedToday.length === 0) return;

      const sortedDue = [...cardsNotReviewedToday].sort((a, b) =>
        new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime()
      );
      const remaining = 10 - reviewsToday;
      const sessionCards = sortedDue.slice(0, remaining);

      setCurrentSession({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        cardIds: sessionCards.map(c => c.id),
        completedIds: [],
        results: [],
        history: [],
        bookId: bookId
      });
    } else {
      // All books session - get cards from each book respecting daily limits
      const cardsByBook = new Map<string, StudyCard[]>();

      // For each book, get cards available today (respecting 10-card limit)
      books.forEach(book => {
        const bookCards = getBookCardsDue(book.id);
        const reviewsToday = dailyProgress.bookReviews[book.id] || 0;

        if (reviewsToday < 10 && bookCards.length > 0) {
          // Filter cards not reviewed today
          const cardsNotReviewedToday = bookCards.filter(card => {
            if (!card.lastReviewedAt) return true;
            const lastReviewDate = new Date(card.lastReviewedAt).toISOString().split('T')[0];
            return lastReviewDate !== today;
          });

          if (cardsNotReviewedToday.length > 0) {
            // Sort by due date and limit to remaining for today
            const sorted = [...cardsNotReviewedToday].sort((a, b) =>
              new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime()
            );
            const remaining = 10 - reviewsToday;
            cardsByBook.set(book.id, sorted.slice(0, remaining));
          }
        }
      });

      // Alternate picking cards from different books
      const sessionCards: StudyCard[] = [];
      const bookIds = Array.from(cardsByBook.keys());
      let bookIndex = 0;

      while (cardsByBook.size > 0) {
        const currentBookId = bookIds[bookIndex % bookIds.length];
        const bookCards = cardsByBook.get(currentBookId);

        if (bookCards && bookCards.length > 0) {
          sessionCards.push(bookCards.shift()!);
        }

        // Remove book if no more cards
        if (bookCards && bookCards.length === 0) {
          cardsByBook.delete(currentBookId);
          bookIds.splice(bookIds.indexOf(currentBookId), 1);
          if (bookIds.length === 0) break;
        } else {
          bookIndex++;
        }
      }

      setCurrentSession({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        cardIds: sessionCards.map(c => c.id),
        completedIds: [],
        results: [],
        history: [],
        bookId: undefined
      });
    }
  };

  const submitReview = (cardId: string, quality: number) => {
    if (!currentSession) return;

    const card = studyCards.find(c => c.id === cardId);
    if (!card) return;

    const isCorrect = quality >= 3;

    // Update daily progress - find book from card's highlight
    const highlight = highlights.find(h => h.id === card.highlightId);
    if (highlight) {
      const bookId = highlight.bookId;
      const today = new Date().toISOString().split('T')[0];
      if (dailyProgress.date === today) {
        setDailyProgress(prev => ({
          ...prev,
          bookReviews: {
            ...prev.bookReviews,
            [bookId]: (prev.bookReviews[bookId] || 0) + 1
          }
        }));
      }
    }

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        completedIds: [...prev.completedIds, cardId],
        results: [...prev.results, { cardId, quality, timestamp: Date.now() }],
        history: [...prev.history, {
          cardId,
          previousCard: { ...card },  // Clone current state before update
          quality,
          timestamp: Date.now()
        }]
      };
    });

    setReviewLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      cardId,
      quality,
      reviewedAt: new Date().toISOString(),
      interval: card.interval,
      easeFactor: card.easeFactor
    }]);
  };

  const resetSession = () => {
    setCurrentSession(null);
    localStorage.removeItem('khm_session');
  };

  const sessionStats = {
    reviewed: currentSession?.completedIds.length || 0,
    correct: currentSession?.results.filter(r => r.quality >= 3).length || 0,
    streak: 0
  };

  // New deck statistics method
  const getDeckStats = (bookId?: string): DeckStats => {
    if (bookId) {
      // Individual book: show remaining cards for today (max 10 minus already reviewed)
      const cards = getBookCardsDue(bookId);
      const today = new Date().toISOString().split('T')[0];
      const reviewsToday = dailyProgress.bookReviews[bookId] || 0;
      const remaining = Math.max(0, 10 - reviewsToday);

      // Filter cards not reviewed today
      const cardsNotReviewedToday = cards.filter(card => {
        if (!card.lastReviewedAt) return true;
        const lastReviewDate = new Date(card.lastReviewedAt).toISOString().split('T')[0];
        return lastReviewDate !== today;
      });

      const limitedCards = cardsNotReviewedToday.slice(0, remaining);

      return {
        new: limitedCards.filter(c => c.repetitions === 0).length,
        learning: limitedCards.filter(c => c.repetitions >= 1 && c.repetitions < 5).length,
        review: limitedCards.filter(c => c.repetitions >= 5).length,
        total: limitedCards.length
      };
    } else {
      // All Books: sum of all individual book stats (daily totals)
      const allBookStats = books.map(book => getDeckStats(book.id));

      return {
        new: allBookStats.reduce((sum, stats) => sum + stats.new, 0),
        learning: allBookStats.reduce((sum, stats) => sum + stats.learning, 0),
        review: allBookStats.reduce((sum, stats) => sum + stats.review, 0),
        total: allBookStats.reduce((sum, stats) => sum + stats.total, 0)
      };
    }
  };

  // Get cards due for a specific book
  const getBookCardsDue = (bookId: string): StudyCard[] => {
    const bookHighlightIds = highlights
      .filter(h => h.bookId === bookId)
      .map(h => h.id);

    const now = new Date();
    return studyCards.filter(card => {
      const highlight = highlights.find(h => h.id === card.highlightId);
      return highlight &&
        bookHighlightIds.includes(highlight.id) &&
        new Date(card.nextReviewDate) <= now;
    });
  };

  // Get reviews completed today for a specific book or all books
  const getReviewsToday = (bookId?: string): number => {
    const today = new Date().toISOString().split('T')[0];
    if (dailyProgress.date !== today) return 0;

    if (bookId) {
      return dailyProgress.bookReviews[bookId] || 0;
    }

    // Return total reviews across all books
    return Object.values(dailyProgress.bookReviews).reduce<number>((sum, count) => sum + (count as number), 0);
  };

  // Undo last review
  const undoLastReview = () => {
    if (!currentSession || currentSession.history.length === 0) return;

    const lastReview = currentSession.history[currentSession.history.length - 1];

    // Restore card to previous state
    updateCard(lastReview.previousCard);

    // Decrement daily progress - mirror logic from submitReview
    const card = lastReview.previousCard;
    const highlight = highlights.find(h => h.id === card.highlightId);
    if (highlight) {
      const bookId = highlight.bookId;
      const today = new Date().toISOString().split('T')[0];
      if (dailyProgress.date === today) {
        setDailyProgress(prev => ({
          ...prev,
          bookReviews: {
            ...prev.bookReviews,
            [bookId]: Math.max(0, (prev.bookReviews[bookId] || 0) - 1)
          }
        }));
      }
    }

    // Remove from completed
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        completedIds: prev.completedIds.slice(0, -1),
        results: prev.results.slice(0, -1),
        history: prev.history.slice(0, -1)
      };
    });

    // Remove from review logs
    setReviewLogs(prev => prev.slice(0, -1));
  };

  // Tagging Methods
  const addTag = (name: string, parentId?: string, bookId?: string) => {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name,
      parentId,
      bookId
    };
    setTags(prev => [...prev, newTag]);
    return newTag.id;
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTag = (id: string) => {
    // Collect all tag IDs to delete (the tag itself + all descendants)
    const tagsToDelete = new Set<string>();
    tagsToDelete.add(id);

    // Iteratively find children to ensure deep hierarchy deletion
    let addedCount = 1;
    while (addedCount > 0) {
      addedCount = 0;
      tags.forEach(t => {
        if (!tagsToDelete.has(t.id) && t.parentId && tagsToDelete.has(t.parentId)) {
          tagsToDelete.add(t.id);
          addedCount++;
        }
      });
    }

    setTags(prev => prev.filter(t => !tagsToDelete.has(t.id)));

    // Also remove these tags from all highlights
    setHighlights(prev => prev.map(h => ({
      ...h,
      tags: h.tags?.filter(tId => !tagsToDelete.has(tId))
    })));
  };

  const assignTagToHighlight = (highlightId: string, tagId: string) => {
    setHighlights(prev => prev.map(h => {
      if (h.id === highlightId) {
        const currentTags = h.tags || [];
        if (currentTags.includes(tagId)) return h;
        return { ...h, tags: [...currentTags, tagId] };
      }
      return h;
    }));
  };

  const removeTagFromHighlight = (highlightId: string, tagId: string) => {
    setHighlights(prev => prev.map(h => {
      if (h.id === highlightId) {
        return { ...h, tags: h.tags?.filter(t => t !== tagId) };
      }
      return h;
    }));
  };

  return (
    <StoreContext.Provider value={{
      books,
      highlights,
      studyCards,
      tags,
      importData,
      getCardsDue,
      updateCard,
      getBook,
      getBookHighlights,
      deleteHighlight,
      updateHighlight,
      bulkDeleteHighlights,
      addToStudy,
      removeFromStudy,
      bulkAddToStudy,
      deleteCard,
      getHighlightStudyStatus,
      settings,
      updateSettings,
      currentSession,
      startSession,
      submitReview,
      resetSession,
      undoLastReview,
      sessionStats,
      getDeckStats,
      getBookCardsDue,
      dailyProgress,
      getReviewsToday,
      reviewLogs,
      isLoaded,
      addTag,
      updateTag,
      deleteTag,
      assignTagToHighlight,
      removeTagFromHighlight
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};