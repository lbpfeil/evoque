import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../components/StoreContext';
import { DeleteCardPopover } from '../components/DeleteCardPopover';
import { ArrowLeft, CheckCircle, Zap, Edit2, Target, Clock } from 'lucide-react';
import { calculateNextReview } from '../services/sm2';

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
    const [showDeletePopover, setShowDeletePopover] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);

    // Derived state from session
    const queueIds = currentSession ? currentSession.cardIds : [];
    const completedCount = currentSession ? currentSession.completedIds.length : 0;
    const currentIndex = completedCount;
    const sessionComplete = queueIds.length > 0 && currentIndex >= queueIds.length;

    const currentCardId = queueIds[currentIndex];
    const currentCard = studyCards.find(c => c.id === currentCardId);
    const currentHighlight = currentCard ? highlights.find(h => h.id === currentCard.highlightId) : null;
    const currentBook = currentHighlight ? books.find(b => b.id === currentHighlight.bookId) : null;

    // Start session on mount
    useEffect(() => {
        if (isLoaded) {
            startSession(deckId || undefined);
        }
    }, [isLoaded, deckId]);

    const handleResponse = useCallback(async (quality: number) => {
        if (!currentCard) return;

        // Save previous state BEFORE updating
        const previousCard = { ...currentCard };

        // 1. Update Card (SM-2 Algorithm)
        const updatedCard = calculateNextReview(currentCard, quality);
        await updateCard(updatedCard);

        // 2. Update Session and Save Review Log (pass previous state)
        await submitReview(currentCard.id, quality, previousCard);

        setShowAnswer(false);
        setIsEditingHighlight(false);
        setIsEditingNote(false);
    }, [currentCard, updateCard, submitReview]);

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
        setShowAnswer(false);
        setIsEditingHighlight(false);
        setIsEditingNote(false);
    }, [undoLastReview]);

    const handleBack = useCallback(() => {
        navigate('/study');
    }, [navigate]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
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

            if (isEditingHighlight || isEditingNote) return;

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
    }, [showAnswer, isEditingHighlight, isEditingNote, handleResponse, handleEditNote, handleSaveHighlight, handleSaveNote, handleUndo, sessionComplete, currentCard]);

    // Loading state
    if (!isLoaded) {
        return (
            <div className="h-screen flex items-center justify-center text-zinc-500">
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
                <div className="text-zinc-500">
                    <p className="text-base font-medium mb-2">
                        {isDailyLimitReached ? 'Daily limit reached!' : 'No cards available'}
                    </p>
                    <p className="text-sm text-zinc-400">
                        {isDailyLimitReached
                            ? `You've completed all 10 reviews for this book today. Come back tomorrow for more!`
                            : deckId
                                ? 'This deck has no cards due for review.'
                                : 'You have no cards due for review.'}
                    </p >
                </div >
                <button
                    onClick={() => navigate('/study')}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors text-sm"
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
                <h2 className="text-2xl font-bold text-zinc-900">Session Complete!</h2>
                <div className="flex gap-12">
                    <div className="text-center">
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Reviewed</p>
                        <p className="text-4xl font-bold text-zinc-900">{sessionStats.reviewed}</p>
                    </div>
                    <div className="w-px bg-zinc-200 h-16"></div>
                    <div className="text-center">
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Accuracy</p>
                        <p className="text-4xl font-bold text-zinc-900">
                            {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/study')}
                    className="px-10 py-4 bg-black text-white rounded-md font-medium hover:bg-zinc-800 transition-colors shadow-xl shadow-zinc-200/50"
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
                    <p className="text-sm text-zinc-400">
                        The current card data is missing or corrupted.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/study')}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors text-sm"
                >
                    Back to Decks
                </button>
            </div>
        );
    }

    const progress = ((currentIndex) / queueIds.length) * 100;
    const isEditing = isEditingHighlight || isEditingNote;

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Compact Header */}
            <header className="px-4 py-2 border-b border-zinc-200">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 hover:bg-zinc-100 px-2 py-1 rounded transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="text-xs text-zinc-600">Back to Decks</span>
                    </button>

                    <div className="text-xs text-zinc-400">
                        Card {currentIndex + 1} / {queueIds.length}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-600 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {sessionStats.reviewed}
                        </span>
                        <span className="text-xs text-zinc-600 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {sessionStats.streak}
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-[3px] bg-zinc-200 mt-2 rounded-full overflow-hidden">
                    <div
                        className="h-full progress-bar-animated transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Book Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            {currentBook.coverUrl && (
                                <img
                                    src={currentBook.coverUrl}
                                    alt={currentBook.title}
                                    className="w-10 h-14 object-cover rounded-sm shadow-sm"
                                />
                            )}
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">{currentBook.title}</h3>
                                <p className="text-xs text-zinc-400">{currentBook.author}</p>
                            </div>
                        </div>
                        {currentHighlight.createdAt && (
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-400">
                                    {new Date(currentHighlight.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tags Display */}
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
                            <div className="flex flex-wrap gap-1 mb-3">
                                {displayTags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${tag.bookId
                                            ? 'bg-amber-500 text-white'  // Book-specific
                                            : 'bg-blue-500 text-white'   // Global
                                            }`}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                                {remainingCount > 0 && (
                                    <button
                                        onClick={() => setShowAllTags(!showAllTags)}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-300 text-zinc-700 hover:bg-zinc-400 transition-colors cursor-pointer"
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
                        <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                                    Edit Highlight
                                </span>
                                {isSaving && <Clock className="w-3 h-3 text-zinc-400 animate-spin" />}
                            </div>
                            <textarea
                                value={editedHighlight}
                                onChange={(e) => setEditedHighlight(e.target.value)}
                                onBlur={handleSaveHighlight}
                                className="w-full bg-white border border-zinc-200 rounded-sm p-3 text-base text-zinc-800 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none font-serif"
                                rows={6}
                                autoFocus
                            />
                            <p className="text-[10px] text-zinc-400 mt-2">Press ESC or click outside to save</p>
                        </div>
                    ) : (
                        <div className="relative group">
                            <blockquote
                                className="text-lg md:text-xl font-serif text-zinc-800 leading-relaxed text-justify"
                            >
                                "{currentHighlight.text}"
                            </blockquote>
                            <button
                                onClick={handleEditHighlight}
                                className="absolute -top-1 -right-1 p-1 text-zinc-400 hover:text-black transition-colors opacity-0 group-hover:opacity-100"
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
                                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                                            Edit Note
                                        </span>
                                        {isSaving && <Clock className="w-3 h-3 text-zinc-400 animate-spin" />}
                                    </div>
                                    <textarea
                                        value={editedNote}
                                        onChange={(e) => setEditedNote(e.target.value)}
                                        onBlur={handleSaveNote}
                                        className="w-full bg-white border border-zinc-200 rounded-sm p-3 text-sm text-zinc-800 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                                        rows={6}
                                        placeholder="Add your note here..."
                                        autoFocus
                                    />
                                    <p className="text-[10px] text-zinc-400 mt-2">Press ESC or click outside to save</p>
                                </div>
                            ) : (
                                <div className="bg-zinc-50 border-l-2 border-black rounded-sm p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                                            My Note
                                        </span>
                                        <button
                                            onClick={handleEditNote}
                                            className="p-1 text-zinc-400 hover:text-black transition-colors"
                                            title="Edit Note (E)"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    {currentHighlight.note ? (
                                        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{currentHighlight.note}</p>
                                    ) : (
                                        <p className="text-sm text-zinc-400 italic">No note attached. Press E to add one.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Footer - Controls */}
            <div className="border-t border-zinc-200 bg-white p-4">
                <div className="max-w-2xl mx-auto relative">
                    {/* Delete button - fixed to left */}
                    <button
                        onClick={() => setShowDeletePopover(true)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 rounded-md transition-colors"
                        title="Delete Card"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Main controls - centered with margin for delete button */}
                    <div className="ml-12">
                        {!showAnswer ? (
                            <button
                                onClick={() => setShowAnswer(true)}
                                className="w-full py-3 bg-black hover:bg-zinc-800 text-white rounded-md font-medium text-sm transition-all active:scale-[0.99]"
                            >
                                Reveal Answer <span className="text-xs text-zinc-400 ml-2">(Space / Enter)</span>
                            </button>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    onClick={() => handleResponse(1)}
                                    disabled={isEditing}
                                    className="py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Again</span>
                                    <span className="text-[10px] opacity-75">(1)</span>
                                </button>
                                <button
                                    onClick={() => handleResponse(2)}
                                    disabled={isEditing}
                                    className="py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Hard</span>
                                    <span className="text-[10px] opacity-75">(2)</span>
                                </button>
                                <button
                                    onClick={() => handleResponse(3)}
                                    disabled={isEditing}
                                    className="py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Good</span>
                                    <span className="text-[10px] opacity-75">(3 / Enter)</span>
                                </button>
                                <button
                                    onClick={() => handleResponse(4)}
                                    disabled={isEditing}
                                    className="py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Easy</span>
                                    <span className="text-[10px] opacity-75">(4)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Popover */}
            {showDeletePopover && (
                <DeleteCardPopover
                    onConfirm={() => {
                        deleteCard(currentCard!.id);
                        setShowDeletePopover(false);
                    }}
                    onCancel={() => setShowDeletePopover(false)}
                />
            )}
        </div>
    );
};

export default StudySession;
