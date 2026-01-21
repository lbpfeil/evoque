import React, { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useStore } from './StoreContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Checkbox } from './ui/checkbox';

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

  // Reset confirmed state when modal opens/closes
  React.useEffect(() => {
    if (!bookId) {
      setConfirmed(false);
    }
  }, [bookId]);

  if (!bookData) return null;

  return (
    <AlertDialog open={!!bookId} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete "{bookData.book.title}"?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>This action will permanently delete:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>{bookData.highlightCount} highlight{bookData.highlightCount !== 1 ? 's' : ''}</li>
                <li>{bookData.cardCount} study card{bookData.cardCount !== 1 ? 's' : ''}</li>
                <li>All review history for this book</li>
                <li>All chapter tags associated with this book</li>
              </ul>
              {bookData.isInActiveSession && (
                <p className="text-destructive font-medium mt-3 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  This book is in your active study session
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center gap-2 py-2">
          <Checkbox
            id="confirm-delete"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(!!checked)}
          />
          <label htmlFor="confirm-delete" className="text-sm text-muted-foreground cursor-pointer">
            I understand this action cannot be undone
          </label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!confirmed}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            Delete Book
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBookModal;
