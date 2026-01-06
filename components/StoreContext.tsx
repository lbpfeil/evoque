import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { Book, Highlight, StudyCard, StudyStatus, UserSettings, StudySession, ReviewLog, Tag, DeckStats, DailyProgress } from '../types';
import { generateUUID } from '../services/idUtils';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  fromSupabaseBook,
  fromSupabaseHighlight,
  fromSupabaseStudyCard,
  fromSupabaseTag,
  fromSupabaseSettings,
  fromSupabaseReviewLog,
  toSupabaseBook,
  toSupabaseHighlight,
  toSupabaseStudyCard,
  toSupabaseTag,
  toSupabaseSettings,
  toSupabaseReviewLog
} from '../lib/supabaseHelpers';

interface StoreContextType {
  books: Book[];
  highlights: Highlight[];
  studyCards: StudyCard[];
  tags: Tag[];
  importData: (text: string) => Promise<{ newBooks: number; newHighlights: number }>;
  getCardsDue: () => StudyCard[];
  updateCard: (card: StudyCard) => Promise<void>;
  getBook: (id: string) => Book | undefined;
  getBookHighlights: (bookId: string) => Highlight[];
  deleteHighlight: (id: string) => Promise<void>;
  updateHighlight: (id: string, updates: Partial<Highlight>) => Promise<void>;
  bulkDeleteHighlights: (ids: string[]) => Promise<void>;
  addToStudy: (highlightId: string) => Promise<void>;
  removeFromStudy: (highlightId: string) => Promise<void>;
  bulkAddToStudy: (highlightIds: string[]) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  getHighlightStudyStatus: (highlightId: string) => StudyStatus | 'not-started';
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  reloadSettings: () => Promise<void>;
  reloadAllData: () => Promise<void>;
  currentSession: StudySession | null;
  startSession: (bookId?: string) => void;
  submitReview: (cardId: string, quality: number, previousCard: StudyCard) => Promise<void>;
  resetSession: () => void;
  undoLastReview: () => Promise<void>;
  sessionStats: { reviewed: number; correct: number; streak: number };
  getDeckStats: (bookId?: string) => DeckStats;
  getBookCardsDue: (bookId: string) => StudyCard[];
  dailyProgress: DailyProgress;
  getReviewsToday: (bookId?: string) => number;
  reviewLogs: ReviewLog[];
  isLoaded: boolean;
  addTag: (name: string, parentId?: string, bookId?: string) => Promise<string>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  assignTagToHighlight: (highlightId: string, tagId: string) => Promise<void>;
  removeTagFromHighlight: (highlightId: string, tagId: string) => Promise<void>;
  bulkAssignTag: (highlightIds: string[], tagId: string) => Promise<void>;
  updateBookSettings: (bookId: string, settings: Partial<Book['settings']>) => Promise<void>;
  resetAllBooksToDefaults: () => Promise<void>;
  updateBookCover: (bookId: string, coverUrl: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const { user } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [studyCards, setStudyCards] = useState<StudyCard[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
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

  // Cache today's date to avoid repeated calculations (performance optimization)
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Load all data from Supabase
  const loadData = async () => {
    if (!user) {
      setIsLoaded(true);
      return;
    }
    try {
      // Load books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id);

      if (booksError) throw booksError;
      if (booksData) setBooks(booksData.map(fromSupabaseBook));

      // Load highlights
      const { data: highlightsData, error: highlightsError } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', user.id);

      if (highlightsError) throw highlightsError;
      const loadedHighlights = highlightsData ? highlightsData.map(fromSupabaseHighlight) : [];
      if (highlightsData) setHighlights(loadedHighlights);

      // Load study cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('study_cards')
        .select('*')
        .eq('user_id', user.id);

      if (cardsError) throw cardsError;
      if (cardsData) {
        // Filter out orphaned cards (cards pointing to non-existent highlights)
        const highlightIds = new Set(loadedHighlights.map(h => h.id));
        const validCards = cardsData
          .map(fromSupabaseStudyCard)
          .filter(card => {
            const isValid = highlightIds.has(card.highlightId);
            if (!isValid) {
              console.warn(`[ORPHAN CARD] Study card ${card.id} points to missing highlight ${card.highlightId}`);
            }
            return isValid;
          });

        setStudyCards(validCards);

        // Log orphan count if any
        const orphanCount = cardsData.length - validCards.length;
        if (orphanCount > 0) {
          console.warn(`[DATA CLEANUP] Filtered out ${orphanCount} orphaned study cards`);
        }
      }

      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }
      if (settingsData) {
        setSettings(fromSupabaseSettings(settingsData));

        if (settingsData.daily_progress) {
          // Check if the saved progress is for today
          const today = new Date().toISOString().split('T')[0];
          if (settingsData.daily_progress.date === today) {
            setDailyProgress(settingsData.daily_progress);
          } else {
            // If stored progress is old, reset it (keeping today's date)
            setDailyProgress({ date: today, bookReviews: {} });
            // We should probably flush this reset to DB, but the useEffect will handle it
          }
        }
      }

      // Session e progress ainda do localStorage (dados temporários)
      const savedSession = localStorage.getItem('khm_session');


      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (!session.history) session.history = [];
        const sessionDate = new Date(session.date).toDateString();
        const today = new Date().toDateString();
        if (sessionDate === today) {
          setCurrentSession(session);
        }
      }



      // dailyProgress removed from here - now loads from Supabase settings


    } catch (error) {
      console.error('Failed to load data from Supabase:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  // Load non-critical data (tags, reviewLogs) - deferred for better performance
  const loadNonCriticalData = async () => {
    if (!user) return;

    try {
      // Load tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id);

      if (tagsError) console.error('Failed to load tags:', tagsError);
      else if (tagsData) setTags(tagsData.map(fromSupabaseTag));

      // Load review logs
      const { data: logsData, error: logsError } = await supabase
        .from('review_logs')
        .select('*')
        .eq('user_id', user.id);

      console.log('DEBUG: Review Logs Load', { count: logsData?.length, error: logsError, userId: user.id });

      if (logsError) console.error('Failed to load review logs:', logsError);
      else if (logsData) setReviewLogs(logsData.map(fromSupabaseReviewLog));
    } catch (error) {
      console.error('Failed to load non-critical data:', error);
    }
  };

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, [user]);

  // Load non-critical data after initial load (deferred for performance)
  useEffect(() => {
    if (isLoaded && user) {
      // Defer by 100ms to prioritize initial render
      const timeoutId = setTimeout(() => {
        loadNonCriticalData();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoaded, user]);

  // Save session and daily progress to localStorage (temporary data only)
  useEffect(() => {
    if (!isLoaded) return;

    if (currentSession) {
      localStorage.setItem('khm_session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('khm_session');
    }

    localStorage.setItem('khm_daily_progress', JSON.stringify(dailyProgress));
  }, [currentSession, dailyProgress, isLoaded]);

  // Sync daily progress to Supabase settings when it changes
  useEffect(() => {
    if (!isLoaded || !user) return;

    // Debounce to avoid excessive writes during rapid updates (increased to 2s for better performance)
    const timeoutId = setTimeout(() => {
      updateSettings({ dailyProgress });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [dailyProgress, isLoaded, user]);

  const importData = async (input: { books: Book[], highlights: Highlight[] }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Input is already parsed (all parsing happens in Settings.tsx now)
      const parsedBooks = input.books;
      const parsedHighlights = input.highlights;

      // 0. Fetch deleted highlights first to filter them out (ID + Text content)
      const { data: deletedData, error: deletedError } = await supabase
        .from('deleted_highlights')
        .select('highlight_id, text_content')
        .eq('user_id', user.id);

      if (deletedError) {
        console.error('Failed to fetch deleted highlights:', deletedError);
      }

      const deletedIds = new Set(deletedData?.map(d => d.highlight_id) || []);
      // Create a set of deleted texts (normalized)
      const deletedTexts = new Set(deletedData?.map(d => d.text_content?.trim()).filter(Boolean) || []);

      console.group('Import: Graveyard Check');
      console.log(`Graveyard Size: ${deletedIds.size} IDs, ${deletedTexts.size} Texts`);

      // Filter out deleted highlights from the import
      const validHighlights = parsedHighlights.filter(ph => {
        // Block if ID exists in graveyard
        if (deletedIds.has(ph.id)) {
          console.log(`[Blocked by ID] ${ph.id.substring(0, 8)}...`);
          return false;
        }
        // Block if TEXT exists in graveyard (robust against ID changes due to page/metadata shifts)
        if (deletedTexts.has(ph.text.trim())) {
          console.log(`[Blocked by Text] "${ph.text.substring(0, 30)}..."`);
          return false;
        }

        return true;
      });
      console.log(`Passed: ${validHighlights.length} / ${parsedHighlights.length}`);
      console.groupEnd();

      // 1. Merge Highlights first to get the complete set
      let newHighlightsCount = 0;
      const nextHighlights = [...highlights];
      const nextCards = [...studyCards];

      validHighlights.forEach(ph => {
        const exists = nextHighlights.find(h => h.id === ph.id);
        if (!exists) {
          nextHighlights.push({ ...ph, importedAt: new Date().toISOString() });
          // Create a new study card for this highlight
          nextCards.push({
            id: generateUUID(),
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

      // Optimistic update
      setBooks(nextBooks);
      setHighlights(nextHighlights);
      setStudyCards(nextCards);

      // Sync with Supabase
      try {
        // Upsert books
        const booksToUpsert = parsedBooks.map(b => toSupabaseBook(b, user.id));
        if (booksToUpsert.length > 0) {
          const { error: booksError } = await supabase
            .from('books')
            .upsert(booksToUpsert, { onConflict: 'id' });
          if (booksError) throw booksError;
        }

        // Insert only NEW highlights (preserve local edits)
        // Only insert highlights that don't already exist in the database
        const newHighlights = validHighlights.filter(ph =>
          !highlights.find(h => h.id === ph.id)
        );
        const highlightsToInsert = newHighlights.map(h => toSupabaseHighlight(h, user.id));
        if (highlightsToInsert.length > 0) {
          const { error: highlightsError } = await supabase
            .from('highlights')
            .insert(highlightsToInsert);
          if (highlightsError) throw highlightsError;
        }

        // Upsert study cards (only new ones)
        const newCards = nextCards.filter(c =>
          !studyCards.find(sc => sc.id === c.id)
        );
        if (newCards.length > 0) {
          const cardsToUpsert = newCards.map(c => toSupabaseStudyCard(c, user.id));
          const { error: cardsError } = await supabase
            .from('study_cards')
            .upsert(cardsToUpsert, { onConflict: 'id' });
          if (cardsError) throw cardsError;
        }

        // Reload all data to ensure consistency
        const [booksData, highlightsData, cardsData] = await Promise.all([
          supabase.from('books').select('*').eq('user_id', user.id),
          supabase.from('highlights').select('*').eq('user_id', user.id),
          supabase.from('study_cards').select('*').eq('user_id', user.id)
        ]);

        if (booksData.data) setBooks(booksData.data.map(fromSupabaseBook));

        const reloadedHighlights = highlightsData.data ? highlightsData.data.map(fromSupabaseHighlight) : [];
        if (highlightsData.data) setHighlights(reloadedHighlights);

        if (cardsData.data) {
          // Filter out orphaned cards (same as loadData)
          const highlightIds = new Set(reloadedHighlights.map(h => h.id));
          const validCards = cardsData.data
            .map(fromSupabaseStudyCard)
            .filter(card => highlightIds.has(card.highlightId));

          setStudyCards(validCards);
        }

      } catch (supabaseError) {
        console.error('Failed to sync import with Supabase:', supabaseError);
        throw supabaseError;
      }

      return { newBooks: newBooksCount, newHighlights: newHighlightsCount };
    } catch (error: any) {
      console.error('Failed to import data:', error);
      throw new Error(error.message || 'Failed to process the file. Please ensure it is a valid My Clippings.txt file.');
    }
  };

  const getCardsDue = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    return studyCards.filter(card => {
      const cardDueDate = card.nextReviewDate.split('T')[0]; // Get YYYY-MM-DD format
      return cardDueDate <= today;
    });
  }, [studyCards]);

  const updateCard = async (updatedCard: StudyCard) => {
    if (!user) return;

    console.log('DEBUG: updateCard called', {
      cardId: updatedCard.id,
      repetitions: updatedCard.repetitions,
      nextReviewDate: updatedCard.nextReviewDate,
      interval: updatedCard.interval
    });

    // Optimistic update
    setStudyCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));

    // Sync with Supabase
    try {
      const supabaseCard = toSupabaseStudyCard(updatedCard, user.id);
      console.log('DEBUG: Supabase card data', supabaseCard);

      const { error } = await supabase
        .from('study_cards')
        .update(supabaseCard)
        .eq('id', updatedCard.id)
        .eq('user_id', user.id);
      // .select() removed - optimistic state already has the data

      console.log('DEBUG: updateCard result', { error });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update study card in Supabase:', error);

      // Try to reload just the failed card first (targeted rollback)
      const { data, error: fetchError } = await supabase
        .from('study_cards')
        .select('*')
        .eq('id', updatedCard.id)
        .eq('user_id', user.id)
        .single();

      if (data && !fetchError) {
        // Targeted rollback - replace only the failed card
        setStudyCards(prev => prev.map(c =>
          c.id === updatedCard.id ? fromSupabaseStudyCard(data) : c
        ));
      } else {
        // Fallback: full reload if single fetch fails
        console.warn('Single card fetch failed, performing full reload');
        const { data: allCards } = await supabase
          .from('study_cards')
          .select('*')
          .eq('user_id', user.id);
        if (allCards) setStudyCards(allCards.map(fromSupabaseStudyCard));
      }
    }
  };

  const getBook = useCallback((id: string) => books.find(b => b.id === id), [books]);

  const getBookHighlights = useCallback((bookId: string) => highlights.filter(h => h.bookId === bookId), [highlights]);

  const deleteHighlight = async (id: string) => {
    const highlight = highlights.find(h => h.id === id);
    if (!highlight || !user) return;

    // Optimistic update
    setHighlights(prev => prev.filter(h => h.id !== id));
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

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Add to graveyard to prevent re-import
      // We do this after successful delete, separate try/catch to not block if it fails
      try {
        await supabase
          .from('deleted_highlights')
          .upsert({
            user_id: user.id,
            highlight_id: id,
            book_id: highlight.bookId, // Save book_id to allow clearing graveyard when book is deleted
            text_content: highlight.text // Save text to block future re-imports even if ID changes
          }, { onConflict: 'user_id, highlight_id' });
      } catch (graveyardError) {
        console.error('Failed to add to graveyard:', graveyardError);
      }
    } catch (error) {
      console.error('Failed to delete highlight from Supabase:', error);
      // Reload data on error
      const { data } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', user.id);
      if (data) setHighlights(data.map(fromSupabaseHighlight));
    }
  };

  const bulkDeleteHighlights = async (ids: string[]) => {
    if (!user) return;

    const idsSet = new Set(ids);
    const affectedBookIds = new Set<string>();

    highlights.forEach(h => {
      if (idsSet.has(h.id)) affectedBookIds.add(h.bookId);
    });

    // Optimistic update
    setHighlights(prev => prev.filter(h => !idsSet.has(h.id)));
    setStudyCards(prev => prev.filter(c => !idsSet.has(c.highlightId)));

    // Remove from current session
    if (currentSession) {
      setCurrentSession(prev => {
        if (!prev) return null;
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
        const remainingCount = highlights.filter(h => h.bookId === b.id && !idsSet.has(h.id)).length;
        return { ...b, highlightCount: remainingCount };
      }
      return b;
    }));

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);

      if (error) throw error;

      // Add to graveyard to prevent re-import
      try {
        const graveyardEntries = ids.map(hid => {
          const h = highlights.find(item => item.id === hid);
          return {
            user_id: user.id,
            highlight_id: hid,
            book_id: h?.bookId, // Save book_id to allow clearing graveyard when book is deleted
            text_content: h?.text // Save text to block future re-imports
          };
        });

        await supabase
          .from('deleted_highlights')
          .upsert(graveyardEntries, { onConflict: 'user_id, highlight_id' });
      } catch (graveyardError) {
        console.error('Failed to add to graveyard (bulk):', graveyardError);
      }
    } catch (error) {
      console.error('Failed to bulk delete highlights from Supabase:', error);
      // Reload data on error
      const { data } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', user.id);
      if (data) setHighlights(data.map(fromSupabaseHighlight));
    }
  };

  const updateHighlight = async (id: string, updates: Partial<Highlight>) => {
    if (!user) return;

    // Optimistic update
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));

    // Sync with Supabase
    try {
      const highlight = highlights.find(h => h.id === id);
      if (!highlight) return;

      const updatedHighlight = { ...highlight, ...updates };
      const { error } = await supabase
        .from('highlights')
        .update(toSupabaseHighlight(updatedHighlight, user.id))
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update highlight in Supabase:', error);
      // Reload data on error
      const { data } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', user.id);
      if (data) setHighlights(data.map(fromSupabaseHighlight));
    }
  };

  const addToStudy = async (highlightId: string) => {
    if (!user) return;

    // Check if already in study
    const existingCard = studyCards.find(c => c.highlightId === highlightId);
    if (existingCard) return;

    // Get highlight to find its book
    const highlight = highlights.find(h => h.id === highlightId);
    if (!highlight) return;

    // Get book to check for custom initial ease factor
    const book = books.find(b => b.id === highlight.bookId);
    const initialEaseFactor = book?.settings?.initialEaseFactor
      || settings.defaultInitialEaseFactor
      || 2.5;

    // Create new study card
    const newCard: StudyCard = {
      id: generateUUID(),
      highlightId,
      easeFactor: initialEaseFactor,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date().toISOString()
    };

    // Optimistic update
    setStudyCards(prev => [...prev, newCard]);
    await updateHighlight(highlightId, { inStudy: true });

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('study_cards')
        .insert(toSupabaseStudyCard(newCard, user.id));

      if (error) throw error;
    } catch (error) {
      console.error('Failed to add study card to Supabase:', error);
      // Rollback on error
      setStudyCards(prev => prev.filter(c => c.id !== newCard.id));
      await updateHighlight(highlightId, { inStudy: false });
    }
  };

  const removeFromStudy = async (highlightId: string) => {
    if (!user) return;

    const card = studyCards.find(c => c.highlightId === highlightId);
    if (!card) return;

    // Optimistic update
    setStudyCards(prev => prev.filter(c => c.highlightId !== highlightId));
    await updateHighlight(highlightId, { inStudy: false });

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('study_cards')
        .delete()
        .eq('highlight_id', highlightId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to remove study card from Supabase:', error);
      // Reload data on error
      const { data } = await supabase
        .from('study_cards')
        .select('*')
        .eq('user_id', user.id);
      if (data) setStudyCards(data.map(fromSupabaseStudyCard));
    }
  };

  const bulkAddToStudy = async (highlightIds: string[]) => {
    if (!user) return;

    const newCards: StudyCard[] = [];
    const existingHighlightIds = new Set(studyCards.map(c => c.highlightId));

    highlightIds.forEach(highlightId => {
      if (!existingHighlightIds.has(highlightId)) {
        newCards.push({
          id: generateUUID(),
          highlightId,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date().toISOString()
        });
      }
    });

    if (newCards.length === 0) return;

    // Optimistic update
    setStudyCards(prev => [...prev, ...newCards]);
    setHighlights(prev => prev.map(h =>
      highlightIds.includes(h.id) ? { ...h, inStudy: true } : h
    ));

    // Sync with Supabase
    try {
      const cardsToInsert = newCards.map(c => toSupabaseStudyCard(c, user.id));
      const { error } = await supabase
        .from('study_cards')
        .insert(cardsToInsert);

      if (error) throw error;

      // Update highlights in Supabase
      for (const highlightId of highlightIds) {
        await updateHighlight(highlightId, { inStudy: true });
      }
    } catch (error) {
      console.error('Failed to bulk add study cards to Supabase:', error);
      // Rollback on error
      const newCardIds = new Set(newCards.map(c => c.id));
      setStudyCards(prev => prev.filter(c => !newCardIds.has(c.id)));
    }
  };

  const getHighlightStudyStatus = (highlightId: string): StudyStatus | 'not-started' => {
    const card = studyCards.find(c => c.highlightId === highlightId);
    if (!card) return 'not-started';
    // If repetitions is 0 but interval is > 0 OR it has been reviewed (interval=1 from Again), it's learning.
    // Truly new cards have repetitions=0 AND interval=0
    if (card.repetitions === 0 && card.interval === 0) return 'new';
    if (card.repetitions >= 5) return 'review';
    return 'learning';
  };

  const reloadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(fromSupabaseSettings(data));
    } catch (error) {
      console.error('Failed to reload settings from Supabase:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    // Optimistic update
    setSettings(prev => ({ ...prev, ...newSettings }));

    // Sync with Supabase
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          toSupabaseSettings(updatedSettings, user.id),
          {
            onConflict: 'user_id'
          }
        );

      if (error) throw error;

      // Reload settings after successful save to ensure sync
      await reloadSettings();
    } catch (error) {
      console.error('Failed to update settings in Supabase:', error);
      // Reload data on error
      await reloadSettings();
    }
  };

  const deleteCard = async (cardId: string) => {
    const card = studyCards.find(c => c.id === cardId);
    if (!card || !user) return;

    // Find the book this card belongs to
    const highlight = highlights.find(h => h.id === card.highlightId);

    // Update daily progress if card was reviewed today
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

    // Optimistic update
    setStudyCards(prev => prev.filter(c => c.id !== cardId));

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

    await updateHighlight(card.highlightId, { inStudy: false });

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('study_cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete study card from Supabase:', error);
      // Reload data on error
      const { data } = await supabase
        .from('study_cards')
        .select('*')
        .eq('user_id', user.id);
      if (data) setStudyCards(data.map(fromSupabaseStudyCard));
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
    const isSessionEmpty = currentSession && currentSession.cardIds.length === 0;
    const shouldReset = isNewDay || isDifferentDeck || isSessionEmpty;

    if (!shouldReset) {
      return;
    }

    const due = bookId ? getBookCardsDue(bookId) : getCardsDue();
    if (due.length === 0) return;

    // Check daily limit for specific book
    if (bookId) {
      const book = books.find(b => b.id === bookId);
      const dailyLimit = book?.settings?.dailyReviewLimit || settings.maxReviewsPerDay || 10;

      const reviewsToday = dailyProgress.bookReviews[bookId] || 0;
      if (reviewsToday >= dailyLimit) {
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
      const remaining = dailyLimit - reviewsToday;
      const sessionCards = sortedDue.slice(0, remaining);

      setCurrentSession({
        id: generateUUID(),
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

      // For each book, get cards available today (respecting per-book daily limit)
      books.forEach(book => {
        const dailyLimit = book.settings?.dailyReviewLimit || settings.maxReviewsPerDay || 10;
        const bookCards = getBookCardsDue(book.id);
        const reviewsToday = dailyProgress.bookReviews[book.id] || 0;

        if (reviewsToday < dailyLimit && bookCards.length > 0) {
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
            const remaining = dailyLimit - reviewsToday;
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
        id: generateUUID(),
        date: new Date().toISOString(),
        cardIds: sessionCards.map(c => c.id),
        completedIds: [],
        results: [],
        history: [],
        bookId: undefined
      });
    }
  };

  const submitReview = async (cardId: string, quality: number, previousCard: StudyCard) => {
    if (!currentSession || !user) return;

    const isCorrect = quality >= 3;

    // Update daily progress - find book from card's highlight
    const highlight = highlights.find(h => h.id === previousCard.highlightId);
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
          previousCard: { ...previousCard },  // Use the ACTUAL previous state
          quality,
          timestamp: Date.now()
        }]
      };
    });

    // Create review log (use previous card state for accurate logging)
    const newLog = {
      id: generateUUID(),
      cardId,
      quality,
      reviewedAt: new Date().toISOString(),
      interval: previousCard.interval,
      easeFactor: previousCard.easeFactor
    };

    // Optimistic update
    setReviewLogs(prev => [...prev, newLog]);

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('review_logs')
        .insert(toSupabaseReviewLog(newLog, user.id));

      console.log('DEBUG: Review Log Save', { error, newLog });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save review log to Supabase:', error);
      // Don't rollback - logs are not critical for app functionality
    }
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

  // Get cards due for a specific book (must be defined before getDeckStats)
  const getBookCardsDue = useCallback((bookId: string): StudyCard[] => {
    const bookHighlightIds = highlights
      .filter(h => h.bookId === bookId)
      .map(h => h.id);

    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    return studyCards.filter(card => {
      const highlight = highlights.find(h => h.id === card.highlightId);
      const cardDueDate = card.nextReviewDate.split('T')[0]; // Get YYYY-MM-DD format
      return highlight &&
        bookHighlightIds.includes(highlight.id) &&
        cardDueDate <= today;
    });
  }, [highlights, studyCards]);

  // New deck statistics method
  const getDeckStats = useCallback((bookId?: string): DeckStats => {
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
  }, [books, getBookCardsDue, dailyProgress]);

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
  const undoLastReview = async () => {
    if (!currentSession || currentSession.history.length === 0 || !user) return;

    const lastReview = currentSession.history[currentSession.history.length - 1];

    // Restore card to previous state
    await updateCard(lastReview.previousCard);

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

    // Remove from review logs (local)
    const lastLog = reviewLogs[reviewLogs.length - 1];
    setReviewLogs(prev => prev.slice(0, -1));

    // Remove from Supabase
    if (lastLog) {
      try {
        const { error } = await supabase
          .from('review_logs')
          .delete()
          .eq('id', lastLog.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Failed to delete review log from Supabase:', error);
        } else {
          console.log('DEBUG: Review log deleted from Supabase', { logId: lastLog.id });
        }
      } catch (error) {
        console.error('Failed to delete review log:', error);
      }
    }
  };

  // Tagging Methods
  const addTag = async (name: string, parentId?: string, bookId?: string) => {
    if (!user) return '';

    const newTag: Tag = {
      id: generateUUID(),
      name,
      parentId,
      bookId
    };

    // Optimistic update
    setTags(prev => [...prev, newTag]);

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('tags')
        .insert(toSupabaseTag(newTag, user.id));

      if (error) throw error;
    } catch (error) {
      console.error('Failed to add tag to Supabase:', error);
      // Rollback on error
      setTags(prev => prev.filter(t => t.id !== newTag.id));
    }

    return newTag.id;
  };

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    if (!user) return;

    // Optimistic update
    setTags(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    // Sync with Supabase
    try {
      const tag = tags.find(t => t.id === id);
      if (!tag) return;

      const updatedTag = { ...tag, ...updates };
      const { error } = await supabase
        .from('tags')
        .update(toSupabaseTag(updatedTag, user.id))
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update tag in Supabase:', error);
      // Reload data on error
      const { data } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id);
      if (data) setTags(data.map(fromSupabaseTag));
    }
  };

  const deleteTag = async (id: string) => {
    if (!user) return;

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

    // Optimistic update
    setTags(prev => prev.filter(t => !tagsToDelete.has(t.id)));

    // Also remove these tags from all highlights
    setHighlights(prev => prev.map(h => ({
      ...h,
      tags: h.tags?.filter(tId => !tagsToDelete.has(tId))
    })));

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .in('id', Array.from(tagsToDelete))
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete tag from Supabase:', error);
      // Reload data on error
      const { data } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id);
      if (data) setTags(data.map(fromSupabaseTag));
    }
  };

  const deleteBook = async (id: string) => {
    if (!user) return;

    // 1. Coletar dados para possível rollback
    const affectedHighlights = highlights.filter(h => h.bookId === id);
    const affectedHighlightIds = affectedHighlights.map(h => h.id);
    const affectedCards = studyCards.filter(c =>
      affectedHighlightIds.includes(c.highlightId)
    );
    const affectedCardIds = affectedCards.map(c => c.id);

    // 2. Optimistic update - remover do estado local
    setBooks(prev => prev.filter(b => b.id !== id));
    setHighlights(prev => prev.filter(h => h.bookId !== id));
    setStudyCards(prev => prev.filter(c => !affectedHighlightIds.includes(c.highlightId)));
    setReviewLogs(prev => prev.filter(l => !affectedCardIds.includes(l.cardId)));

    // 3. Atualizar dailyProgress (remover bookReviews deste livro)
    setDailyProgress(prev => {
      const { [id]: _, ...remainingBookReviews } = prev.bookReviews;
      return {
        ...prev,
        bookReviews: remainingBookReviews
      };
    });

    // 4. Atualizar currentSession
    if (currentSession) {
      if (currentSession.bookId === id) {
        // Se era sessão deste livro, resetar completamente
        setCurrentSession(null);
      } else if (!currentSession.bookId) {
        // Se era sessão "All Books", remover cards deste livro
        setCurrentSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            cardIds: prev.cardIds.filter(cid => !affectedCardIds.includes(cid)),
            completedIds: prev.completedIds.filter(cid => !affectedCardIds.includes(cid))
          };
        });
      }
    }

    // 5. Sync com Supabase (CASCADE vai deletar tudo relacionado)
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // 6. Clear graveyard for this book (allow re-import)
      try {
        const { data: deletedFromGraveyard, error: graveyardError } = await supabase
          .from('deleted_highlights')
          .delete()
          .eq('book_id', id)
          .eq('user_id', user.id)
          .select();

        if (graveyardError) throw graveyardError;

        console.log(`Graveyard cleared: ${deletedFromGraveyard?.length || 0} highlights from book ${id}`);
      } catch (graveyardError) {
        console.error('Failed to clear graveyard (non-critical):', graveyardError);
        // Non-critical error - continue even if graveyard cleanup fails
      }

      // 7. Delete book cover from storage if exists
      const book = books.find(b => b.id === id);
      if (book?.coverUrl && book.coverUrl.includes('book-covers')) {
        try {
          const filePath = `${user.id}/books/${id}/cover.jpg`;
          const { error: storageError } = await supabase.storage
            .from('book-covers')
            .remove([filePath]);

          if (storageError) throw storageError;

          console.log(`Book cover deleted from storage: ${filePath}`);
        } catch (storageError) {
          console.error('Failed to delete book cover (non-critical):', storageError);
          // Non-critical error - continue even if cover deletion fails
        }
      }
    } catch (error) {
      console.error('Failed to delete book from Supabase:', error);

      // Rollback: recarregar todos os dados
      const [booksData, highlightsData, cardsData, logsData] = await Promise.all([
        supabase.from('books').select('*').eq('user_id', user.id),
        supabase.from('highlights').select('*').eq('user_id', user.id),
        supabase.from('study_cards').select('*').eq('user_id', user.id),
        supabase.from('review_logs').select('*').eq('user_id', user.id)
      ]);

      if (booksData.data) setBooks(booksData.data.map(fromSupabaseBook));
      if (highlightsData.data) setHighlights(highlightsData.data.map(fromSupabaseHighlight));
      if (cardsData.data) setStudyCards(cardsData.data.map(fromSupabaseStudyCard));
      if (logsData.data) setReviewLogs(logsData.data.map(fromSupabaseReviewLog));
    }
  };

  const updateBookSettings = async (bookId: string, newSettings: Partial<Book['settings']>) => {
    if (!user) return;

    // Find the book
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    // Merge new settings with existing
    const updatedSettings = {
      ...(book.settings || {}),
      ...newSettings
    };

    // Optimistic update
    setBooks(prev => prev.map(b =>
      b.id === bookId ? { ...b, settings: updatedSettings } : b
    ));

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('books')
        .update({ settings: updatedSettings })
        .eq('id', bookId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update book settings:', error);
      // Rollback
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id);
      if (data) setBooks(data.map(fromSupabaseBook));
    }
  };

  const resetAllBooksToDefaults = async () => {
    if (!user) return;

    // Optimistic update - remove settings from all books
    setBooks(prev => prev.map(b => ({ ...b, settings: undefined })));

    // Sync with Supabase - reset all books settings to empty object
    try {
      const { error } = await supabase
        .from('books')
        .update({ settings: {} })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to reset all books to defaults:', error);
      // Rollback
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id);
      if (data) setBooks(data.map(fromSupabaseBook));
    }
  };

  const updateBookCover = async (bookId: string, coverUrl: string) => {
    if (!user) return;

    const book = books.find(b => b.id === bookId);
    if (!book) return;

    // Optimistic update
    setBooks(prev => prev.map(b =>
      b.id === bookId ? { ...b, coverUrl } : b
    ));

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('books')
        .update({ cover_url: coverUrl })
        .eq('id', bookId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update book cover:', error);
      // Rollback
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id);
      if (data) setBooks(data.map(fromSupabaseBook));
    }
  };

  const assignTagToHighlight = async (highlightId: string, tagId: string) => {
    if (!user) return;

    // Optimistic update
    setHighlights(prev => prev.map(h => {
      if (h.id === highlightId) {
        const currentTags = h.tags || [];
        if (currentTags.includes(tagId)) return h;
        return { ...h, tags: [...currentTags, tagId] };
      }
      return h;
    }));

    // Sync with Supabase
    try {
      const highlight = highlights.find(h => h.id === highlightId);
      if (!highlight) return;

      const currentTags = highlight.tags || [];
      if (currentTags.includes(tagId)) return;

      const updatedHighlight = { ...highlight, tags: [...currentTags, tagId] };
      await updateHighlight(highlightId, { tags: updatedHighlight.tags });
    } catch (error) {
      console.error('Failed to assign tag to highlight:', error);
    }
  };

  const removeTagFromHighlight = async (highlightId: string, tagId: string) => {
    if (!user) return;

    // Optimistic update
    setHighlights(prev => prev.map(h => {
      if (h.id === highlightId) {
        return { ...h, tags: h.tags?.filter(t => t !== tagId) };
      }
      return h;
    }));

    // Sync with Supabase
    try {
      const highlight = highlights.find(h => h.id === highlightId);
      if (!highlight) return;

      const updatedTags = highlight.tags?.filter(t => t !== tagId) || [];
      await updateHighlight(highlightId, { tags: updatedTags });
    } catch (error) {
      console.error('Failed to remove tag from highlight:', error);
    }
  };

  const bulkAssignTag = async (highlightIds: string[], tagId: string) => {
    if (!user) return;

    // Optimistic update
    setHighlights(prev => prev.map(h => {
      if (highlightIds.includes(h.id)) {
        const currentTags = h.tags || [];
        if (currentTags.includes(tagId)) return h;
        return { ...h, tags: [...currentTags, tagId] };
      }
      return h;
    }));

    // Sync with Supabase
    try {
      // Fetch current highlights to ensure we have latest state before update
      const targetHighlights = highlights.filter(h => highlightIds.includes(h.id));

      // Update each highlight in Supabase
      // Note: A bulk update SQL function would be better for performance, but loop is safer for now without custom RPC
      await Promise.all(targetHighlights.map(async (h) => {
        const currentTags = h.tags || [];
        if (!currentTags.includes(tagId)) {
          const updatedTags = [...currentTags, tagId];
          await updateHighlight(h.id, { tags: updatedTags });
        }
      }));

    } catch (error) {
      console.error('Failed to bulk assign tag:', error);
      // Reload on error to ensure consistency
      const { data } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', user.id);
      if (data) setHighlights(data.map(fromSupabaseHighlight));
    }
  };



  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
    reloadSettings,
    reloadAllData: loadData,
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
    deleteBook,
    assignTagToHighlight,
    removeTagFromHighlight,
    bulkAssignTag,
    updateBookSettings,
    resetAllBooksToDefaults,
    updateBookCover
  }), [
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
    reloadSettings,
    loadData,
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
    deleteBook,
    assignTagToHighlight,
    removeTagFromHighlight,
    updateBookSettings,
    resetAllBooksToDefaults,
    updateBookCover
  ]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};