import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../components/StoreContext';
import { DeleteCardPopover } from '../components/DeleteCardPopover';
import { TagSelector } from '../components/TagSelector';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';
import { ArrowLeft, CheckCircle, Edit2, Clock, Trash2, Tag as TagIcon, Copy } from 'lucide-react';
import { calculateNextReview } from '../services/sm2';
import { StudyCard } from '../types';
import { DEFAULT_DAILY_LIMIT } from '../lib/constants';

// Format date for display (e.g., "3 de fevereiro de 2026")
function formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Determine card status for visual indicator (aligned with getDeckStats)
function getCardStatus(card: StudyCard, t: (key: string) => string): { status: 'new' | 'learning' | 'review'; color: string; label: string } {
    if (card.repetitions === 0) {
        return { status: 'new', color: 'bg-status-new', label: t('status.new') };
    }
    if (card.repetitions >= 1 && card.repetitions < 5) {
        return { status: 'learning', color: 'bg-status-learning', label: t('status.learning') };
    }
    return { status: 'review', color: 'bg-status-review', label: t('status.review') };
}

const StudySession = () => {
    const { t } = useTranslation('session');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const deckId = searchParams.get('deck');

    const {
        studyCards,
        highlights,
        books,
        tags,
        settings,
        updateCard,
        updateHighlight,
        currentSession,
        startSession,
        submitReview,
        sessionStats,
        undoLastReview,
        isLoaded,
        getReviewsToday,
        deleteCard
    } = useStore();

    const [showAnswer, setShowAnswer] = useState(false);
    const [isEditingHighlight, setIsEditingHighlight] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [editedHighlight, setEditedHighlight] = useState('');
    const [editedNote, setEditedNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
    const [showDeletePopover, setShowDeletePopover] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [justCopied, setJustCopied] = useState(false);
    const [cardShowTime, setCardShowTime] = useState<number>(Date.now());

    // Derived state from session
    const queueIds = currentSession ? currentSession.cardIds : [];
    const completedCount = currentSession ? currentSession.completedIds.length : 0;
    const currentIndex = completedCount;
    const sessionComplete = queueIds.length > 0 && currentIndex >= queueIds.length;

    const currentCardId = queueIds[currentIndex];

    const currentCard = useMemo(
        () => studyCards.find(c => c.id === currentCardId),
        [studyCards, currentCardId]
    );

    const currentHighlight = useMemo(
        () => currentCard ? highlights.find(h => h.id === currentCard.highlightId) : null,
        [highlights, currentCard]
    );

    const currentBook = useMemo(
        () => currentHighlight ? books.find(b => b.id === currentHighlight.bookId) : null,
        [books, currentHighlight]
    );

    // Start session on mount
    useEffect(() => {
        if (isLoaded) {
            startSession(deckId || undefined);
        }
    }, [isLoaded, deckId]);

    // Reset showAnswer and timer when card changes (prevents flashing next card's answer)
    useEffect(() => {
        setShowAnswer(false);
        setIsEditingHighlight(false);
        setIsEditingNote(false);
        setCardShowTime(Date.now());  // Reset timer for new card
    }, [currentCardId]);

    const handleResponse = useCallback(async (quality: number) => {
        // Prevent double-click / duplicate submissions
        if (!currentCard || isSubmittingResponse) return;

        setIsSubmittingResponse(true);

        // Calculate duration for this card
        const durationMs = Date.now() - cardShowTime;

        // Save previous state BEFORE updating
        const previousCard = { ...currentCard };

        // 1. Calculate next review (SM-2 Algorithm) - local operation
        const updatedCard = calculateNextReview(currentCard, quality);

        // 2. Fire both operations in parallel (don't await)
        // Both functions do optimistic updates internally, so UI updates immediately
        Promise.allSettled([
            updateCard(updatedCard),
            submitReview(currentCard.id, quality, previousCard, durationMs)
        ]).then(results => {
            // Log failures but don't block UI
            results.forEach((result, idx) => {
                if (result.status === 'rejected') {
                    const operation = idx === 0 ? 'updateCard' : 'submitReview';
                    console.error(`${operation} failed:`, result.reason);
                }
            });
        }).finally(() => {
            setIsSubmittingResponse(false);
        });

        // Note: showAnswer reset handled by useEffect on currentCardId change
        // UI continues immediately - next card loads without waiting for DB
    }, [currentCard, isSubmittingResponse, updateCard, submitReview, cardShowTime]);

    const handleSaveHighlight = useCallback(async () => {
        if (!currentHighlight) return;

        setIsSaving(true);
        await updateHighlight(currentHighlight.id, { text: editedHighlight });

        setTimeout(() => {
            setIsSaving(false);
            setIsEditingHighlight(false);
        }, 300);
    }, [currentHighlight, editedHighlight, updateHighlight]);

    const handleSaveNote = useCallback(async () => {
        if (!currentHighlight) return;

        setIsSaving(true);
        await updateHighlight(currentHighlight.id, { note: editedNote });

        setTimeout(() => {
            setIsSaving(false);
            setIsEditingNote(false);
        }, 300);
    }, [currentHighlight, editedNote, updateHighlight]);

    const handleEditHighlight = useCallback(() => {
        if (!currentHighlight) return;
        setEditedHighlight(currentHighlight.text);
        setIsEditingHighlight(true);
    }, [currentHighlight]);

    const handleEditNote = useCallback(() => {
        if (!currentHighlight) return;
        setEditedNote(currentHighlight.note || '');
        setIsEditingNote(true);
    }, [currentHighlight]);

    const handleUndo = useCallback(async () => {
        await undoLastReview();
        // Note: showAnswer reset is handled by useEffect on currentCardId change
    }, [undoLastReview]);

    const handleBack = useCallback(() => {
        navigate('/study');
    }, [navigate]);

    const handleCopyToClipboard = useCallback(async () => {
        if (!currentBook || !currentHighlight) return;

        const text = `Título: ${currentBook.title}
Autor: ${currentBook.author}

${currentHighlight.text}`;

        try {
            await navigator.clipboard.writeText(text);
            setJustCopied(true);
            setTimeout(() => setJustCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    }, [currentBook, currentHighlight]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignore keyboard shortcuts when tag selector is open
            if (showTagSelector) {
                // Only allow ESC to close tag selector
                if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowTagSelector(false);
                }
                return;
            }

            // Ctrl+Z for undo
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                handleUndo();
                return;
            }

            // ESC to save when editing
            if (e.key === 'Escape') {
                if (isEditingHighlight) {
                    e.preventDefault();
                    handleSaveHighlight();
                    return;
                }
                if (isEditingNote) {
                    e.preventDefault();
                    handleSaveNote();
                    return;
                }
            }

            if (isEditingHighlight || isEditingNote || isSubmittingResponse) return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    if (!showAnswer && !sessionComplete && currentCard) setShowAnswer(true);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (!showAnswer && !sessionComplete && currentCard) {
                        setShowAnswer(true);
                    } else if (showAnswer && !isEditing) {
                        handleResponse(3); // Good
                    }
                    break;
                case '1':
                    if (showAnswer) handleResponse(1);
                    break;
                case '2':
                    if (showAnswer) handleResponse(2);
                    break;
                case '3':
                    if (showAnswer) handleResponse(3);
                    break;
                case '4':
                    if (showAnswer) handleResponse(4);
                    break;
                case 'e':
                case 'E':
                    if (showAnswer) {
                        e.preventDefault();
                        handleEditNote();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showAnswer, isEditingHighlight, isEditingNote, isSubmittingResponse, handleResponse, handleEditNote, handleSaveHighlight, handleSaveNote, handleUndo, sessionComplete, currentCard, showTagSelector]);

    // Loading state
    if (!isLoaded) {
        return (
            <div className="h-screen flex items-center justify-center text-muted-foreground text-body">
                {t('loading')}
            </div>
        );
    }

    // No cards available
    if (!currentSession || queueIds.length === 0) {
        // Check if daily limit was reached - use actual book/global limit
        const reviewsToday = deckId ? getReviewsToday(deckId) : 0;
        const book = deckId ? books.find(b => b.id === deckId) : null;
        const dailyLimit = book?.settings?.dailyReviewLimit || settings.maxReviewsPerDay || DEFAULT_DAILY_LIMIT;
        const isDailyLimitReached = deckId && reviewsToday >= dailyLimit;

        return (
            <div className="h-screen flex flex-col items-center justify-center text-center space-y-lg">
                <div className="text-muted-foreground">
                    <p className="text-body font-medium mb-xs">
                        {isDailyLimitReached ? t('dailyLimit.title') : t('noCards.title')}
                    </p>
                    <p className="text-body text-muted-foreground">
                        {isDailyLimitReached
                            ? t('dailyLimit.message')
                            : deckId
                                ? t('noCards.deckEmpty')
                                : t('noCards.allEmpty')}
                    </p >
                </div >
                <Button
                    onClick={() => navigate('/study')}
                >
                    {t('actions.backToDecks')}
                </Button>
            </div >
        );
    }

    // Session complete
    if (sessionComplete) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center space-y-xl">
                <h2 className="text-2xl font-bold text-foreground">{t('complete.title')}</h2>
                <div className="flex gap-3xl">
                    <div className="text-center">
                        <p className="text-muted-foreground text-caption font-bold uppercase tracking-widest mb-xs">{t('complete.reviewed')}</p>
                        <p className="text-4xl font-bold text-foreground">{sessionStats.reviewed}</p>
                    </div>
                    <div className="w-px bg-border h-16"></div>
                    <div className="text-center">
                        <p className="text-muted-foreground text-caption font-bold uppercase tracking-widest mb-xs">{t('complete.accuracy')}</p>
                        <p className="text-4xl font-bold text-foreground">
                            {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate('/study')}
                    className="px-2xl py-md shadow-xl shadow-foreground/10"
                >
                    {t('actions.backToDecks')}
                </Button>
            </div>
        );
    }

    // Missing card data
    if (!currentHighlight || !currentBook) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center space-y-lg">
                <div className="text-destructive">
                    <p className="text-body font-medium mb-xs">{t('error.title')}</p>
                    <p className="text-body text-muted-foreground">
                        {t('error.message')}
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/study')}
                >
                    {t('actions.backToDecks')}
                </Button>
            </div>
        );
    }

    const progress = ((currentIndex) / queueIds.length) * 100;
    const isEditing = isEditingHighlight || isEditingNote;

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Compact Header */}
            <header className="px-sm sm:px-md py-xs border-b border-border">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="min-h-[40px] min-w-[40px]"
                        title={t('actions.backToDecks')}
                    >
                        <ArrowLeft className="w-5 h-5 text-primary" />
                    </Button>

                    <div className="text-caption text-muted-foreground">
                        {t('progress.cardOf', { current: currentIndex + 1, total: queueIds.length })}
                    </div>

                    <div className="flex items-center gap-xxs">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowTagSelector(prev => !prev)}
                            className="p-xs -mr-xxs rounded-full min-h-[40px] sm:min-h-0"
                            title={t('actions.manageTags')}
                        >
                            <TagIcon className="w-4 h-4" />
                        </Button>
                        {/* Copy to Clipboard button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopyToClipboard}
                            disabled={!currentBook || !currentHighlight}
                            className="p-xs -mr-xxs rounded-full min-h-[40px] sm:min-h-0"
                            title={justCopied ? t('actions.copied') : t('actions.copyToClipboard')}
                        >
                            <Copy className={`w-4 h-4 ${justCopied ? 'text-success' : ''}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDeletePopover(true)}
                            className="p-xs -mr-xs rounded-full min-h-[40px] sm:min-h-0"
                            title={t('actions.deleteCard')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-[3px] bg-border mt-xs rounded-full overflow-hidden">
                    <div
                        className="h-full progress-bar-animated transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-lg sm:px-xl py-lg sm:py-xl">
                <div className="max-w-2xl mx-auto space-y-lg">
                    {/* Book Info */}
                    <div className="flex items-start justify-between gap-md">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {currentBook.coverUrl && (
                                <img
                                    key={currentBook.id}
                                    src={currentBook.coverUrl}
                                    alt={currentBook.title}
                                    className="w-16 h-24 object-cover rounded-sm shadow-sm flex-shrink-0"
                                />
                            )}
                            {/* Card Status Indicator */}
                            {currentCard && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 cursor-help ${getCardStatus(currentCard, t).color}`}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-center">
                                            <div className="font-medium">{getCardStatus(currentCard, t).label}</div>
                                            <div className="text-[10px] opacity-80">
                                                {currentCard.lastReviewedAt
                                                    ? t('status.lastSeen', { date: formatDateForDisplay(currentCard.lastReviewedAt) })
                                                    : t('status.firstReview')
                                                }
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <div className="min-w-0">
                                <h3 className="text-body font-semibold text-foreground">{currentBook.title}</h3>
                                <p className="text-caption text-muted-foreground">{currentBook.author}</p>
                            </div>
                        </div>

                        {/* Tags Display - Desktop (same row as book info) */}
                        {currentHighlight.tags && currentHighlight.tags.length > 0 && (() => {
                            const highlightTags = currentHighlight.tags
                                .map(tagId => tags.find(t => t.id === tagId))
                                .filter((tag): tag is typeof tags[0] => tag !== undefined)
                                .sort((a, b) => {
                                    // Global tags first (no bookId), then book-specific tags
                                    if (!a.bookId && b.bookId) return -1;
                                    if (a.bookId && !b.bookId) return 1;
                                    return 0;
                                });

                            const maxTags = 6;
                            const displayTags = showAllTags ? highlightTags : highlightTags.slice(0, maxTags);
                            const remainingCount = highlightTags.length - maxTags;

                            return (
                                <div className="hidden md:flex flex-wrap gap-xxs justify-end items-start max-w-xs">
                                    {displayTags.map(tag => (
                                        <span
                                            key={tag.id}
                                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-overline font-medium ${tag.bookId
                                                ? 'bg-amber-500 dark:bg-amber-600 text-white'  // Book-specific
                                                : 'bg-blue-500 dark:bg-blue-600 text-white'   // Global
                                                }`}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                    {remainingCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowAllTags(!showAllTags)}
                                            className="inline-flex items-center px-1.5 py-0.5 h-auto text-overline font-medium"
                                            title={showAllTags ? 'Show less' : `Show ${remainingCount} more tags`}
                                        >
                                            {showAllTags ? '−' : `+${remainingCount}`}
                                        </Button>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Tags Display - Mobile (below book info) */}
                    {currentHighlight.tags && currentHighlight.tags.length > 0 && (() => {
                        const highlightTags = currentHighlight.tags
                            .map(tagId => tags.find(t => t.id === tagId))
                            .filter((tag): tag is typeof tags[0] => tag !== undefined)
                            .sort((a, b) => {
                                // Global tags first (no bookId), then book-specific tags
                                if (!a.bookId && b.bookId) return -1;
                                if (a.bookId && !b.bookId) return 1;
                                return 0;
                            });

                        const maxTags = 6;
                        const displayTags = showAllTags ? highlightTags : highlightTags.slice(0, maxTags);
                        const remainingCount = highlightTags.length - maxTags;

                        return (
                            <div className="flex md:hidden flex-wrap gap-xxs mb-sm">
                                {displayTags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-overline font-medium ${tag.bookId
                                            ? 'bg-amber-500 dark:bg-amber-600 text-white'  // Book-specific
                                            : 'bg-blue-500 dark:bg-blue-600 text-white'   // Global
                                            }`}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                                {remainingCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowAllTags(!showAllTags)}
                                        className="inline-flex items-center px-1.5 py-0.5 h-auto text-overline font-medium"
                                        title={showAllTags ? 'Show less' : `Show ${remainingCount} more tags`}
                                    >
                                        {showAllTags ? '−' : `+${remainingCount}`}
                                    </Button>
                                )}
                            </div>
                        );
                    })()}

                    {/* Highlight Text - Editable */}
                    {isEditingHighlight ? (
                        <div className="relative">
                            <textarea
                                value={editedHighlight}
                                onChange={(e) => {
                                    setEditedHighlight(e.target.value);
                                    // Auto-resize
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                onBlur={handleSaveHighlight}
                                className="w-full text-lg md:text-xl font-serif italic text-foreground leading-relaxed text-justify bg-transparent border border-dashed border-border/50 rounded-sm resize-none focus:outline-none focus:ring-0 -m-1 p-1"
                                style={{ minHeight: '3rem' }}
                                autoFocus
                                onFocus={(e) => {
                                    // Set initial height on focus
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                            />
                            {isSaving && (
                                <div className="absolute top-0 right-0">
                                    <Clock className="w-3 h-3 text-muted-foreground animate-spin" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative group">
                            <blockquote
                                className="text-lg md:text-xl font-serif italic text-foreground leading-relaxed text-justify"
                            >
                                "{currentHighlight.text}"
                            </blockquote>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleEditHighlight}
                                className="absolute -top-xxs -right-xxs p-xxs opacity-0 group-hover:opacity-100"
                                title={t('edit.highlightLabel')}
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}

                    {/* Answer Section */}
                    {showAnswer && (
                        <div className="animate-fade-in-up">
                            {isEditingNote ? (
                                <div className="mt-xl">
                                    <div className="flex items-center justify-center gap-md mb-xl select-none">
                                        <div className="h-px flex-1 bg-border"></div>
                                        <span className="font-serif italic text-lg text-border">~</span>
                                        <div className="h-px flex-1 bg-border"></div>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            value={editedNote}
                                            onChange={(e) => {
                                                setEditedNote(e.target.value);
                                                // Auto-resize
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            onBlur={handleSaveNote}
                                            placeholder={t('edit.notePlaceholder')}
                                            className="w-full text-lg md:text-xl font-serif text-foreground leading-relaxed text-justify whitespace-pre-wrap bg-transparent border border-dashed border-border/50 rounded-sm resize-none focus:outline-none focus:ring-0 -m-1 p-1"
                                            style={{ minHeight: '3rem' }}
                                            autoFocus
                                            onFocus={(e) => {
                                                // Set initial height on focus
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                        />
                                        {isSaving && (
                                            <div className="absolute top-0 right-0">
                                                <Clock className="w-3 h-3 text-muted-foreground animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-xl">
                                    <div className="flex items-center justify-center gap-md mb-xl select-none">
                                        <div className="h-px flex-1 bg-border"></div>
                                        <span className="font-serif italic text-lg text-border">~</span>
                                        <div className="h-px flex-1 bg-border"></div>
                                    </div>

                                    <div className="relative group">
                                        {currentHighlight.note ? (
                                            <div className="text-lg md:text-xl font-serif text-foreground leading-relaxed text-justify whitespace-pre-wrap">
                                                {currentHighlight.note}
                                            </div>
                                        ) : (
                                            <div className="text-center py-md">
                                                <p className="text-body text-muted-foreground italic mb-xs">{t('note.empty')}</p>
                                                <Button
                                                    variant="ghost"
                                                    onClick={handleEditNote}
                                                    className="text-caption underline underline-offset-2 h-auto"
                                                >
                                                    {t('note.add')}
                                                </Button>
                                            </div>
                                        )}

                                        {currentHighlight.note && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleEditNote}
                                                className="absolute -top-xxs -right-xxs p-xxs opacity-0 group-hover:opacity-100"
                                                title={t('note.edit')}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Footer - Controls */}
            <div className="border-t border-border bg-background p-sm pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-md sm:pb-md">
                <div className="max-w-2xl mx-auto relative">
                    {/* Main controls - centered */}
                    <div>
                        {!showAnswer ? (
                            <Button
                                onClick={() => setShowAnswer(true)}
                                className="w-full py-3.5 sm:py-sm min-h-[48px] active:scale-[0.99]"
                            >
                                {t('actions.revealAnswer')} <span className="hidden sm:inline text-caption text-primary-foreground/60 ml-xs">{t('keyboard.revealHint')}</span>
                            </Button>
                        ) : (
                            <>
                            {/* SM-2 rating buttons -- intentional deviation, raw colors for quality feedback */}
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-xs">
                                <button
                                    onClick={() => handleResponse(1)}
                                    disabled={isEditing || isSubmittingResponse}
                                    className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white rounded-md font-medium text-body flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{t('rating.again')}</span>
                                    <span className="hidden sm:block text-overline opacity-75">{t('keyboard.again')}</span>
                                </button>
                                <button
                                    onClick={() => handleResponse(2)}
                                    disabled={isEditing || isSubmittingResponse}
                                    className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-md font-medium text-body flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{t('rating.hard')}</span>
                                    <span className="hidden sm:block text-overline opacity-75">{t('keyboard.hard')}</span>
                                </button>
                                <button
                                    onClick={() => handleResponse(3)}
                                    disabled={isEditing || isSubmittingResponse}
                                    className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md font-medium text-body flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{t('rating.good')}</span>
                                    <span className="hidden sm:block text-overline opacity-75">{t('keyboard.good')}</span>
                                </button>
                                <button
                                    onClick={() => handleResponse(4)}
                                    disabled={isEditing || isSubmittingResponse}
                                    className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded-md font-medium text-body flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{t('rating.easy')}</span>
                                    <span className="hidden sm:block text-overline opacity-75">{t('keyboard.easy')}</span>
                                </button>
                            </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Popover */}
            {
                showDeletePopover && (
                    <DeleteCardPopover
                        onConfirm={() => {
                            deleteCard(currentCard!.id);
                            setShowDeletePopover(false);
                        }}
                        onCancel={() => setShowDeletePopover(false)}
                    />
                )
            }

            {/* Tag Selector Modal */}
            {showTagSelector && currentHighlight && (
                <>
                    {/* Backdrop (click to close) */}
                    <div
                        className="fixed inset-0 bg-foreground/10 dark:bg-foreground/30 z-40"
                        onClick={() => setShowTagSelector(false)}
                    />

                    {/* TagSelector centered */}
                    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-xs w-full max-w-md sm:px-md">
                        <div className="bg-card rounded-md shadow-xl border border-border">
                            <TagSelector
                                highlightId={currentHighlight.id}
                                bookId={currentHighlight.bookId}
                                open={true}
                                onOpenChange={(isOpen) => {
                                    if (!isOpen) setShowTagSelector(false);
                                }}
                            />
                        </div>
                    </div>
                </>
            )}
        </div >
    );
};

export default StudySession;
