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