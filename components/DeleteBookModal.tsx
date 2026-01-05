import React, { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useStore } from './StoreContext';

interface DeleteBookModalProps {
  bookId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteBookModal: React.FC<DeleteBookModalProps> = ({ bookId, onConfirm, onCancel }) => {
  const { getBook, highlights, studyCards, currentSession } = useStore();
  const [confirmed, setConfirmed] = useState(false);

  const bookData = useMemo(() => {
    if (!bookId) return null;

    const book = getBook(bookId);
    if (!book) return null;

    const bookHighlights = highlights.filter(h => h.bookId === bookId);
    const highlightIds = bookHighlights.map(h => h.id);
    const bookCards = studyCards.filter(c => highlightIds.includes(c.highlightId));
    const isInActiveSession = currentSession?.bookId === bookId;

    return {
      book,
      highlightCount: bookHighlights.length,
      cardCount: bookCards.length,
      isInActiveSession
    };
  }, [bookId, getBook, highlights, studyCards, currentSession]);

  if (!bookData) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Delete "{bookData.book.title}"?
            </h3>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2">
              <p>This action will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{bookData.highlightCount} highlight{bookData.highlightCount !== 1 ? 's' : ''}</li>
                <li>{bookData.cardCount} study card{bookData.cardCount !== 1 ? 's' : ''}</li>
                <li>All review history for this book</li>
                <li>All chapter tags associated with this book</li>
              </ul>
              {bookData.isInActiveSession && (
                <p className="text-red-600 font-medium mt-3 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  This book is in your active study session
                </p>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2">
              <input
                type="checkbox"
                id="confirm-delete"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 text-red-600 rounded border-zinc-300 dark:border-zinc-600 focus:ring-red-500"
              />
              <label htmlFor="confirm-delete" className="text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                I understand this action cannot be undone
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed}
            className="px-4 py-2 text-xs font-medium text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBookModal;
