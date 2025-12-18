import { Book, Highlight, StudyCard, Tag, UserSettings, ReviewLog } from '../types';

// ============================================
// BOOKS
// ============================================

export const toSupabaseBook = (book: Book, userId: string) => ({
    id: book.id,
    user_id: userId,
    title: book.title,
    author: book.author,
    cover_url: book.coverUrl || null,
    last_imported: book.lastImported,
    highlight_count: book.highlightCount
});

export const fromSupabaseBook = (row: any): Book => ({
    id: row.id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url,
    lastImported: row.last_imported,
    highlightCount: row.highlight_count
});

// ============================================
// HIGHLIGHTS
// ============================================

export const toSupabaseHighlight = (highlight: Highlight, userId: string) => ({
    id: highlight.id,
    user_id: userId,
    book_id: highlight.bookId,
    text: highlight.text,
    note: highlight.note || null,
    location: highlight.location,
    page: highlight.page || null,
    is_favorite: highlight.isFavorite || false,
    in_study: highlight.inStudy || false,
    date_added: highlight.dateAdded,
    imported_at: highlight.importedAt || new Date().toISOString(),
    tags: highlight.tags || []
});

export const fromSupabaseHighlight = (row: any): Highlight => ({
    id: row.id,
    bookId: row.book_id,
    text: row.text,
    note: row.note,
    location: row.location,
    page: row.page,
    isFavorite: row.is_favorite,
    inStudy: row.in_study,
    dateAdded: row.date_added,
    importedAt: row.imported_at,
    tags: row.tags || []
});

// ============================================
// STUDY CARDS
// ============================================

export const toSupabaseStudyCard = (card: StudyCard, userId: string) => ({
    id: card.id,
    user_id: userId,
    highlight_id: card.highlightId,
    ease_factor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
    next_review_date: card.nextReviewDate,
    last_reviewed_at: card.lastReviewedAt || null
});

export const fromSupabaseStudyCard = (row: any): StudyCard => ({
    id: row.id,
    highlightId: row.highlight_id,
    easeFactor: row.ease_factor,
    interval: row.interval,
    repetitions: row.repetitions,
    nextReviewDate: row.next_review_date,
    lastReviewedAt: row.last_reviewed_at
});

// ============================================
// TAGS
// ============================================

export const toSupabaseTag = (tag: Tag, userId: string) => ({
    id: tag.id,
    user_id: userId,
    name: tag.name,
    parent_id: tag.parentId || null,
    book_id: tag.bookId || null,
    color: tag.color || null
});

export const fromSupabaseTag = (row: any): Tag => ({
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    bookId: row.book_id,
    color: row.color
});

// ============================================
// USER SETTINGS
// ============================================

export const toSupabaseSettings = (settings: any, userId: string) => ({
    user_id: userId,
    max_reviews_per_day: settings.maxReviewsPerDay,
    new_cards_per_day: settings.newCardsPerDay,
    daily_progress: settings.dailyProgress
});

export const fromSupabaseSettings = (row: any) => ({
    maxReviewsPerDay: row.max_reviews_per_day,
    newCardsPerDay: row.new_cards_per_day,
    dailyProgress: row.daily_progress
});

// ============================================
// REVIEW LOGS
// ============================================

export const toSupabaseReviewLog = (log: any, userId: string) => ({
    id: log.id,
    user_id: userId,
    card_id: log.cardId,
    quality: log.quality,
    reviewed_at: log.reviewedAt,
    interval_days: log.interval,
    ease_factor: log.easeFactor
});

export const fromSupabaseReviewLog = (row: any) => ({
    id: row.id,
    cardId: row.card_id,
    quality: row.quality,
    reviewedAt: row.reviewed_at,
    interval: row.interval_days,
    easeFactor: row.ease_factor
});

