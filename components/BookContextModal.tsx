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
        <DialogHeader className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-4">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-24 h-36 object-cover rounded-sm shadow-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold mb-1 line-clamp-2">
                {book.title}
              </DialogTitle>
              <p className="text-muted-foreground mb-3">{book.author}</p>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('bookModal.imported', { date: formatDate(book.lastImported) })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  <span>{t('bookModal.highlights', { count: bookHighlights.length })}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Highlights List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {bookHighlights.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('bookModal.noHighlights')}</p>
            </div>
          ) : (
            bookHighlights.map((highlight, index) => (
              <div
                key={highlight.id}
                className="bg-muted border border-border rounded-md p-4 hover:border-primary/30 transition-colors duration-200"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-muted-foreground mt-0.5">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-serif text-foreground leading-relaxed mb-2">
                      "{highlight.text}"
                    </p>
                    {highlight.note && (
                      <div className="bg-card border-l-2 border-foreground p-3 rounded-sm">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">{t('bookModal.myNote')}</span>
                        <p className="text-xs text-muted-foreground italic">{highlight.note}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
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
        <div className="p-4 border-t border-border bg-muted flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200 text-sm font-medium"
          >
            {t('common:buttons.close')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookContextModal;
