import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('settings');
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
          <AlertDialogTitle className="flex items-center gap-sm">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {t('deleteBook.title', { title: bookData.book.title })}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-sm">
              <p>{t('deleteBook.warning')}</p>
              <ul className="list-disc list-inside ml-sm space-y-xxs">
                <li>{t('deleteBook.highlights', { count: bookData.highlightCount })}</li>
                <li>{t('deleteBook.studyCards', { count: bookData.cardCount })}</li>
                <li>{t('deleteBook.reviewHistory')}</li>
                <li>{t('deleteBook.chapterTags')}</li>
              </ul>
              {bookData.isInActiveSession && (
                <p className="text-destructive font-medium mt-sm flex items-center gap-xs">
                  <AlertTriangle className="w-3 h-3" />
                  {t('deleteBook.activeSession')}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center gap-sm py-sm">
          <Checkbox
            id="confirm-delete"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(!!checked)}
          />
          <label htmlFor="confirm-delete" className="text-body text-muted-foreground cursor-pointer">
            {t('deleteBook.confirm')}
          </label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!confirmed}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {t('deleteBook.button')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBookModal;
