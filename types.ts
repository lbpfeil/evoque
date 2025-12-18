export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  lastImported: string;
  highlightCount: number;
}

export interface Highlight {
  id: string;
  bookId: string;
  text: string;
  note?: string;
  location: string;
  dateAdded: string;
  page?: string;
  isFavorite?: boolean;
  importedAt?: string;
  inStudy?: boolean;
  tags?: string[];
}

export interface StudyCard {
  id: string;
  highlightId: string;
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  nextReviewDate: string; // ISO Date string
  lastReviewedAt?: string;
}

export interface StudySessionStats {
  totalReviewed: number;
  correct: number;
  repeated: number;
  durationSeconds: number;
}

export type StudyStatus = 'new' | 'learning' | 'review';

export interface Tag {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  bookId?: string; // If present, this is a book-specific tag (Create Chapter)
}

export interface UserSettings {
  maxReviewsPerDay: number;
  newCardsPerDay: number;
  dailyProgress?: DailyProgress;
}

export interface ReviewResult {
  cardId: string;
  quality: number;
  timestamp: number;
}

export interface StudySession {
  id: string;
  date: string;
  cardIds: string[];
  completedIds: string[];
  results: ReviewResult[];
  history: ReviewHistory[];  // Track review history for undo
  bookId?: string;  // Track which book this session is for
}

export interface DailyProgress {
  date: string;  // ISO date string (YYYY-MM-DD)
  bookReviews: Record<string, number>;  // bookId -> count of reviews today
}

export interface ReviewLog {
  id: string;
  cardId: string;
  quality: number;
  reviewedAt: string;
  interval: number;
  easeFactor: number;
}

export interface DeckStats {
  new: number;      // Cards never studied (repetitions = 0)
  learning: number; // Cards in learning phase (repetitions 1-4)
  review: number;   // Mature cards (repetitions >= 5)
  total: number;    // Total due today
}

export interface ReviewHistory {
  cardId: string;
  previousCard: StudyCard;  // Card state before review
  quality: number;
  timestamp: number;
}

export type SortOption = 'imported' | 'date' | 'book' | 'length';
