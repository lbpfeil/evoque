import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from './StoreContext';
import { BookOpen, Calendar, Hash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface BookContextModalProps {
  bookId: string | null;
  onClose: () => void;
}

const BookContextModal: React.FC<BookContextModalProps> = ({ bookId, onClose }) => {
  const { t } = useTranslation('highlights');
  const { getBook, getBookHighlights } = useStore();

  if (!bookId) return null;

  const book = getBook(bookId);
  const bookHighlights = getBookHighlights(bookId);

  if (!book) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={!!bookId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-lg border-b border-border flex-shrink-0">
          <div className="flex items-start gap-md">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-24 h-36 object-cover rounded-sm shadow-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-heading font-bold mb-xs line-clamp-2">
                {book.title}
              </DialogTitle>
              <p className="text-muted-foreground mb-sm">{book.author}</p>

              <div className="flex flex-wrap gap-md text-caption text-muted-foreground">
                <div className="flex items-center gap-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('bookModal.imported', { date: formatDate(book.lastImported) })}</span>
                </div>
                <div className="flex items-center gap-xs">
                  <Hash className="w-3.5 h-3.5" />
                  <span>{t('bookModal.highlights', { count: bookHighlights.length })}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Highlights List */}
        <div className="flex-1 overflow-y-auto p-lg space-y-md">
          {bookHighlights.length === 0 ? (
            <div className="text-center py-xl text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-sm opacity-50" />
              <p>{t('bookModal.noHighlights')}</p>
            </div>
          ) : (
            bookHighlights.map((highlight, index) => (
              <div
                key={highlight.id}
                className="bg-muted border border-border rounded-md p-md hover:border-primary/30 transition-colors duration-200"
              >
                <div className="flex items-start gap-sm">
                  <span className="text-caption font-bold text-muted-foreground mt-0.5">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-serif text-foreground leading-relaxed mb-sm">
                      "{highlight.text}"
                    </p>
                    {highlight.note && (
                      <div className="bg-card border-l-2 border-foreground p-sm rounded-sm">
                        <span className="text-overline uppercase font-semibold text-muted-foreground block mb-xs">{t('bookModal.myNote')}</span>
                        <p className="text-caption text-muted-foreground italic">{highlight.note}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-sm mt-sm text-overline text-muted-foreground">
                      {highlight.location && <span>{t('bookModal.location', { location: highlight.location })}</span>}
                      {highlight.dateAdded && <span>* {formatDate(highlight.dateAdded)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-md border-t border-border bg-muted flex justify-end flex-shrink-0">
          <Button onClick={onClose}>
            {t('common:buttons.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookContextModal;
