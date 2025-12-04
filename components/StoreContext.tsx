import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, Highlight, StudyCard, StudyStatus } from '../types';
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [highlights, setHighlights] = useState<Highlight[]>(MOCK_HIGHLIGHTS);
  const [studyCards, setStudyCards] = useState<StudyCard[]>(MOCK_CARDS);

  // Load from local storage on mount (simplified)
  useEffect(() => {
    const savedBooks = localStorage.getItem('khm_books');
    const savedHighlights = localStorage.getItem('khm_highlights');
    const savedCards = localStorage.getItem('khm_cards');

    if (savedBooks) setBooks(JSON.parse(savedBooks));
    if (savedHighlights) setHighlights(JSON.parse(savedHighlights));
    if (savedCards) setStudyCards(JSON.parse(savedCards));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('khm_books', JSON.stringify(books));
    localStorage.setItem('khm_highlights', JSON.stringify(highlights));
    localStorage.setItem('khm_cards', JSON.stringify(studyCards));
  }, [books, highlights, studyCards]);

  const importData = (text: string) => {
    const { books: parsedBooks, highlights: parsedHighlights } = parseMyClippings(text);

    // Merge Books
    let newBooksCount = 0;
    const updatedBooks = [...books];
    parsedBooks.forEach(pb => {
      const exists = updatedBooks.find(b => b.id === pb.id);
      if (!exists) {
        updatedBooks.push(pb);
        newBooksCount++;
      } else {
        // Update existing book meta
        exists.highlightCount = Math.max(exists.highlightCount, pb.highlightCount);
      }
    });

    // Merge Highlights
    let newHighlightsCount = 0;
    const updatedHighlights = [...highlights];
    const updatedCards = [...studyCards];

    parsedHighlights.forEach(ph => {
      const exists = updatedHighlights.find(h => h.text === ph.text && h.bookId === ph.bookId);
      if (!exists) {
        updatedHighlights.push({ ...ph, importedAt: new Date().toISOString() });
        // Create a new study card for this highlight
        updatedCards.push({
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

    // Update book counts accurately
    updatedBooks.forEach(b => {
      b.highlightCount = updatedHighlights.filter(h => h.bookId === b.id).length;
    });

    setBooks(updatedBooks);
    setHighlights(updatedHighlights);
    setStudyCards(updatedCards);

    return { newBooks: newBooksCount, newHighlights: newHighlightsCount };
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
      getHighlightStudyStatus
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