import React from 'react';
import { useStore } from './StoreContext';
import { X, BookOpen, Calendar, Hash } from 'lucide-react';

interface BookContextModalProps {
    bookId: string | null;
    onClose: () => void;
}

const BookContextModal: React.FC<BookContextModalProps> = ({ bookId, onClose }) => {
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-24 h-36 object-cover rounded-sm shadow-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-2">{book.title}</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-3">{book.author}</p>

                        <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Imported {formatDate(book.lastImported)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5" />
                                <span>{bookHighlights.length} highlights</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm transition-colors flex-shrink-0"
                        title="Close"
                    >
                        <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>

                {/* Highlights List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {bookHighlights.length === 0 ? (
                        <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No highlights found for this book.</p>
                        </div>
                    ) : (
                        bookHighlights.map((highlight, index) => (
                            <div
                                key={highlight.id}
                                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mt-0.5">#{index + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-serif text-zinc-800 dark:text-zinc-200 leading-relaxed mb-2">
                                            "{highlight.text}"
                                        </p>
                                        {highlight.note && (
                                            <div className="bg-white dark:bg-zinc-900 border-l-2 border-zinc-900 dark:border-zinc-100 p-3 rounded-sm">
                                                <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1">My Note</span>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">{highlight.note}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                                            {highlight.location && <span>Location: {highlight.location}</span>}
                                            {highlight.dateAdded && <span>• {formatDate(highlight.dateAdded)}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookContextModal;
