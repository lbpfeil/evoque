import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../components/StoreContext';
import { DeleteCardPopover } from '../components/DeleteCardPopover';
import { TagSelector } from '../components/TagSelector';
import { ArrowLeft, CheckCircle, Edit2, Clock, Trash2, Tag as TagIcon, Copy } from 'lucide-react';
import { calculateNextReview } from '../services/sm2';
import { StudyCard } from '../types';

// Determine card status for visual indicator (aligned with getDeckStats)
function getCardStatus(card: StudyCard): { status: 'new' | 'learning' | 'review'; color: string; label: string } {
    if (card.repetitions === 0) {
        return { status: 'new', color: 'bg-blue-500', label: 'New' };
    }
    if (card.repetitions >= 1 && card.repetitions < 5) {
        return { status: 'learning', color: 'bg-amber-500', label: 'Learning' };
    }
    return { status: 'review', color: 'bg-green-500', label: 'Review' };
}

const StudySession = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const deckId = searchParams.get('deck');

    const {
        studyCards,
        highlights,
        books,
        tags,
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

    // Reset showAnswer when card changes (prevents flashing next card's answer)
    useEffect(() => {
        setShowAnswer(false);
        setIsEditingHighlight(false);
        setIsEditingNote(false);
    }, [currentCardId]);

    const handleResponse = useCallback(async (quality: number) => {
        // Prevent double-click / duplicate submissions
        if (!currentCard || isSubmittingResponse) return;

        setIsSubmittingResponse(true);

        // Save previous state BEFORE updating
        const previousCard = { ...currentCard };

        // 1. Calculate next review (SM-2 Algorithm) - local operation
        const updatedCard = calculateNextReview(currentCard, quality);

        // 2. Fire both operations in parallel (don't await)
        // Both functions do optimistic updates internally, so UI updates immediately
        Promise.allSettled([
            updateCard(updatedCard),
            submitReview(currentCard.id, quality, previousCard)
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
    }, [currentCard, isSubmittingResponse, updateCard, submitReview]);

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
            <div className="h-screen flex items-center justify-center text-muted-foreground">
                Loading study session...
            </div>
        );
    }

    // No cards available
    if (!currentSession || queueIds.length === 0) {
        // Check if daily limit was reached
        const reviewsToday = deckId ? getReviewsToday(deckId) : 0;
        const isDailyLimitReached = deckId && reviewsToday >= 10;

        return (
            <div className="h-screen flex flex-col items-center justify-center text-center space-y-6">
                <div className="text-muted-foreground">
                    <p className="text-base font-medium mb-2">
                        {isDailyLimitReached ? 'Daily limit reached!' : 'No cards available'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {isDailyLimitReached
                            ? `You've completed all 10 reviews for this book today. Come back tomorrow for more!`
                            : deckId
                                ? 'This deck has no cards due for review.'
                                : 'You have no cards due for review.'}
                    </p >
                </div >
                <button
                    onClick={() => navigate('/study')}
                    className="px-6 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors text-sm"
                >
                    Back to Decks
                </button>
            </div >
        );
    }

    // Session complete
    if (sessionComplete) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center space-y-8">
                <h2 className="text-2xl font-bold text-foreground">Session Complete!</h2>
                <div className="flex gap-12">
                    <div className="text-center">
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">Reviewed</p>
                        <p className="text-4xl font-bold text-foreground">{sessionStats.reviewed}</p>
                    </div>
                    <div className="w-px bg-border h-16"></div>
                    <div className="text-center">
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">Accuracy</p>
                        <p className="text-4xl font-bold text-foreground">
                            {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/study')}
                    className="px-10 py-4 bg-foreground text-background rounded-md font-medium hover:bg-foreground/90 transition-colors shadow-xl shadow-foreground/10"
                >
                    Back to Decks
                </button>
            </div>
        );
    }

    // Missing card data
    if (!currentHighlight || !currentBook) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center space-y-6">
                <div className="text-red-500">
                    <p className="text-base font-medium mb-2">Card Error</p>
                    <p className="text-sm text-muted-foreground">
                        The current card data is missing or corrupted.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/study')}
                    className="px-6 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors text-sm"
                >
                    Back to Decks
                </button>
            </div>
        );
    }

    const progress = ((currentIndex) / queueIds.length) * 100;
    const isEditing = isEditingHighlight || isEditingNote;

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Compact Header */}
            <header className="px-3 sm:px-4 py-2 border-b border-border">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 hover:bg-accent px-2 py-1.5 sm:py-1 rounded transition-colors min-h-[40px] sm:min-h-0"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground hidden sm:inline">Back to Decks</span>
                    </button>

                    <div className="text-xs text-muted-foreground">
                        Card {currentIndex + 1} / {queueIds.length}
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowTagSelector(prev => !prev)}
                            className="p-2 -mr-1 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-accent min-h-[40px] sm:min-h-0"
                            title="Manage Tags"
                        >
                            <TagIcon className="w-4 h-4" />
                        </button>
                        {/* Copy to Clipboard button */}
                        <button
                            onClick={handleCopyToClipboard}
                            disabled={!currentBook || !currentHighlight}
                            className="p-2 -mr-1 text-muted-foreground hover:text-green-600 transition-colors rounded-full hover:bg-accent min-h-[40px] sm:min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={justCopied ? "Copiado!" : "Copiar para área de transferência"}
                        >
                            <Copy className={`w-4 h-4 ${justCopied ? 'text-green-600' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowDeletePopover(true)}
                            className="p-2 -mr-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-accent min-h-[40px] sm:min-h-0"
                            title="Delete Card"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-[3px] bg-border mt-2 rounded-full overflow-hidden">
                    <div
                        className="h-full progress-bar-animated transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Book Info */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {currentBook.coverUrl && (
                                <img
                                    src={currentBook.coverUrl}
                                    alt={currentBook.title}
                                    className="w-10 h-14 object-cover rounded-sm shadow-sm flex-shrink-0"
                                />
                            )}
                            {/* Card Status Indicator */}
                            {currentCard && (
                                <div
                                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getCardStatus(currentCard).color}`}
                                    title={getCardStatus(currentCard).label}
                                />
                            )}
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-foreground">{currentBook.title}</h3>
                                <p className="text-xs text-muted-foreground">{currentBook.author}</p>
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
                                <div className="hidden md:flex flex-wrap gap-1 justify-end items-start max-w-xs">
                                    {displayTags.map(tag => (
                                        <span
                                            key={tag.id}
                                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${tag.bookId
                                                ? 'bg-amber-500 dark:bg-amber-600 text-white'  // Book-specific
                                                : 'bg-blue-500 dark:bg-blue-600 text-white'   // Global
                                                }`}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                    {remainingCount > 0 && (
                                        <button
                                            onClick={() => setShowAllTags(!showAllTags)}
                                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                            title={showAllTags ? 'Show less' : `Show ${remainingCount} more tags`}
                                        >
                                            {showAllTags ? '−' : `+${remainingCount}`}
                                        </button>
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
                            <div className="flex md:hidden flex-wrap gap-1 mb-3">
                                {displayTags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${tag.bookId
                                            ? 'bg-amber-500 dark:bg-amber-600 text-white'  // Book-specific
                                            : 'bg-blue-500 dark:bg-blue-600 text-white'   // Global
                                            }`}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                                {remainingCount > 0 && (
                                    <button
                                        onClick={() => setShowAllTags(!showAllTags)}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                        title={showAllTags ? 'Show less' : `Show ${remainingCount} more tags`}
                                    >
                                        {showAllTags ? '−' : `+${remainingCount}`}
                                    </button>
                                )}
                            </div>
                        );
                    })()}

                    {/* Highlight Text - Editable */}
                    {isEditingHighlight ? (
                        <div className="bg-muted border border-border rounded-md p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                    Edit Highlight
                                </span>
                                {isSaving && <Clock className="w-3 h-3 text-muted-foreground animate-spin" />}
                            </div>
                            <textarea
                                value={editedHighlight}
                                onChange={(e) => setEditedHighlight(e.target.value)}
                                onBlur={handleSaveHighlight}
                                className="w-full bg-background border border-input rounded-sm p-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring resize-none font-serif"
                                rows={6}
                                autoFocus
                            />
                            <p className="text-[10px] text-muted-foreground mt-2">Press ESC or click outside to save</p>
                        </div>
                    ) : (
                        <div className="relative group">
                            <blockquote
                                className="text-lg md:text-xl font-serif italic text-foreground leading-relaxed text-justify"
                            >
                                "{currentHighlight.text}"
                            </blockquote>
                            <button
                                onClick={handleEditHighlight}
                                className="absolute -top-1 -right-1 p-1 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit Highlight"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Answer Section */}
                    {showAnswer && (
                        <div className="animate-fade-in-up">
                            {isEditingNote ? (
                                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
                                            Edit Note
                                        </span>
                                        {isSaving && <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500 animate-spin" />}
                                    </div>
                                    <textarea
                                        value={editedNote}
                                        onChange={(e) => setEditedNote(e.target.value)}
                                        onBlur={handleSaveNote}
                                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm p-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white resize-none"
                                        rows={6}
                                        placeholder="Add your note here..."
                                        autoFocus
                                    />
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2">Press ESC or click outside to save</p>
                                </div>
                            ) : (
                                <div className="mt-8">
                                    <div className="flex items-center justify-center gap-4 mb-8 select-none">
                                        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                                        <span className="font-serif italic text-lg text-zinc-300 dark:text-zinc-700">~</span>
                                        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                                    </div>

                                    <div className="relative group">
                                        {currentHighlight.note ? (
                                            <div className="text-lg md:text-xl font-serif text-zinc-800 dark:text-zinc-200 leading-relaxed text-justify whitespace-pre-wrap">
                                                {currentHighlight.note}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-sm text-zinc-400 dark:text-zinc-500 italic mb-2">No note attached</p>
                                                <button
                                                    onClick={handleEditNote}
                                                    className="text-xs text-zinc-500 dark:text-zinc-500 hover:text-black dark:hover:text-white underline underline-offset-2 transition-colors"
                                                >
                                                    Add a note
                                                </button>
                                            </div>
                                        )}

                                        {currentHighlight.note && (
                                            <button
                                                onClick={handleEditNote}
                                                className="absolute -top-6 right-0 p-1 text-zinc-300 dark:text-zinc-700 hover:text-black dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
                                                title="Edit Note (E)"
                                            >
                                                <span className="text-[10px] uppercase tracking-wider font-medium">Edit Note</span>
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Footer - Controls */}
            <div className="border-t border-border bg-background p-3 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-4">
                <div className="max-w-2xl mx-auto relative">
                    {/* Main controls - centered */}
                    <div>
                        {!showAnswer ? (
                            <button
                                onClick={() => setShowAnswer(true)}
                                className="w-full py-3.5 sm:py-3 min-h-[48px] bg-foreground hover:bg-foreground/90 text-background rounded-md font-medium text-sm transition-all active:scale-[0.99]"
                            >
                                Reveal Answer <span className="hidden sm:inline text-xs text-muted-foreground ml-2">(Space / Enter)</span>
                            </button>
                        ) : (
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                                <button
                                    onClick={() => handleResponse(1)}
                                    disabled={isEditing || isSubmittingResponse}
                                    className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Again</span>
                                    <span className="hidden sm:block text-[10px] opacity-75">(1)</span>
                                </button>
                                <button
                                    onClick={() => handleResponse(2)}
                                    disabled={isEditing || isSubmittingResponse}
                                    className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Hard</span>
                                    <span className="hidden sm:block text-[10px] opacity-75">(2)</span>
                                </button>
                                <button
                                    onClick={() => handleResponse(3)}
                                    disabled={isEditing || isSubmittingResponse}
                                    className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Good</span>
                                    <span className="hidden sm:block text-[10px] opacity-75">(3 / Enter)</span>
                                </button>
                                <button
                                    onClick={() => handleResponse(4)}
                                    disabled={isEditing || isSubmittingResponse}
                                    className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Easy</span>
                                    <span className="hidden sm:block text-[10px] opacity-75">(4)</span>
                                </button>
                            </div>
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
                    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-2 w-full max-w-md sm:px-4">
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
