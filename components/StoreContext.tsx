import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, Highlight, StudyCard, StudyStatus, UserSettings, StudySession, ReviewLog } from '../types';
import { MOCK_BOOKS, MOCK_HIGHLIGHTS, MOCK_CARDS } from '../services/mockData';
import { parseMyClippings } from '../services/parser';

interface StoreContextType {
  books: Book[];
  highlights: Highlight[];
  studyCards: StudyCard[];
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
  getHighlightStudyStatus: (highlightId: string) => StudyStatus;
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  currentSession: StudySession | null;
  startSession: () => void;
  submitReview: (cardId: string, quality: number) => void;
  resetSession: () => void;
  sessionStats: { reviewed: number; correct: number; streak: number };
  reviewLogs: ReviewLog[];
  isLoaded: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [highlights, setHighlights] = useState<Highlight[]>(MOCK_HIGHLIGHTS);
  const [studyCards, setStudyCards] = useState<StudyCard[]>(MOCK_CARDS);
  const [settings, setSettings] = useState<UserSettings>({
    maxReviewsPerDay: 15,
    newCardsPerDay: 10
  });
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedBooks = localStorage.getItem('khm_books');
      const savedHighlights = localStorage.getItem('khm_highlights');
      const savedCards = localStorage.getItem('khm_cards');
      const savedSettings = localStorage.getItem('khm_settings');
      const savedSession = localStorage.getItem('khm_session');
      const savedLogs = localStorage.getItem('khm_logs');

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
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedSession) setCurrentSession(JSON.parse(savedSession));
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed)) setReviewLogs(parsed);
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
    localStorage.setItem('khm_settings', JSON.stringify(settings));
    if (currentSession) localStorage.setItem('khm_session', JSON.stringify(currentSession));
    else localStorage.removeItem('khm_session');
    localStorage.setItem('khm_logs', JSON.stringify(reviewLogs));
  }, [books, highlights, studyCards, settings, currentSession, reviewLogs, isLoaded]);

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

  const getHighlightStudyStatus = (highlightId: string): StudyStatus => {
    const card = studyCards.find(c => c.highlightId === highlightId);
    if (!card) return 'not-started';
    if (card.repetitions >= 5) return 'mastered';
    return 'learning';
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const startSession = () => {
    const today = new Date().toDateString();

    if (currentSession && new Date(currentSession.date).toDateString() === today) {
      return;
    }

    const due = getCardsDue();
    if (due.length === 0) return;

    const sortedDue = [...due].sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());

    const sessionCards = sortedDue.slice(0, settings.maxReviewsPerDay);

    setCurrentSession({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      cardIds: sessionCards.map(c => c.id),
      completedIds: [],
      results: []
    });
  };

  const submitReview = (cardId: string, quality: number) => {
    if (!currentSession) return;

    const card = studyCards.find(c => c.id === cardId);
    if (!card) return;

    const isCorrect = quality >= 3;

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        completedIds: [...prev.completedIds, cardId],
        results: [...prev.results, { cardId, quality, timestamp: Date.now() }]
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

  return (
    <StoreContext.Provider value={{
      books,
      highlights,
      studyCards,
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
      getHighlightStudyStatus,
      settings,
      updateSettings,
      currentSession,
      startSession,
      submitReview,
      resetSession,
      sessionStats,
      reviewLogs,
      isLoaded
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