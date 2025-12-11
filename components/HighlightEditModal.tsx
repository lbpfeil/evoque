import React, { useState, useEffect } from 'react';
import { useStore } from './StoreContext';
import { X, BookOpen, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Portal } from './Portal';

interface HighlightEditModalProps {
    highlightId: string | null;
    onClose: () => void;
}

const HighlightEditModal: React.FC<HighlightEditModalProps> = ({ highlightId, onClose }) => {
    const { highlights, books, studyCards, reviewLogs, updateHighlight } = useStore();

    const [showStats, setShowStats] = useState(false);
    const [editForm, setEditForm] = useState({ text: '', note: '' });

    const highlight = highlightId ? highlights.find(h => h.id === highlightId) : null;
    const book = highlight ? books.find(b => b.id === highlight.bookId) : null;
    const card = highlightId ? studyCards.find(c => c.highlightId === highlightId) : null;

    useEffect(() => {
        if (highlight) {
            setEditForm({ text: highlight.text, note: highlight.note || '' });
        }
    }, [highlightId, highlight]);

    // Handle ESC key to close and save
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && highlightId) {
                handleClose();
            }
        };

        if (highlightId) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [highlightId, editForm, highlight]);


    if (!highlightId || !highlight || !book) return null;

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

    const handleClose = () => {
        // Auto-save if there are changes
        if (editForm.text !== highlight.text || editForm.note !== (highlight.note || '')) {
            updateHighlight(highlightId, { text: editForm.text, note: editForm.note });
        }
        onClose();
    };

    const handleChange = (field: 'text' | 'note', value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    // Track if mousedown started on overlay (to prevent closing when selecting text)
    const handleOverlayMouseDown = (e: React.MouseEvent) => {
        // Only set flag if click is directly on overlay, not on modal content
        if (e.target === e.currentTarget) {
            (e.currentTarget as HTMLElement).dataset.mousedownOnOverlay = 'true';
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        // Only close if both mousedown and click happened on overlay
        if (e.target === e.currentTarget && (e.currentTarget as HTMLElement).dataset.mousedownOnOverlay === 'true') {
            handleClose();
        }
        // Reset flag
        delete (e.currentTarget as HTMLElement).dataset.mousedownOnOverlay;
    };

    const logs = reviewLogs.filter(l => l.cardId === card?.id).sort((a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime());
    const statsData = logs.map(log => ({
        date: new Date(log.reviewedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        interval: log.interval,
        easeFactor: log.easeFactor
    }));

    if (card && logs.length > 0) {
        statsData.push({
            date: 'Próximo',
            interval: card.interval,
            easeFactor: card.easeFactor
        });
    }

    return (
        <Portal>
            <div
                className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onMouseDown={handleOverlayMouseDown}
                onClick={handleOverlayClick}
            >
                <div className="bg-white rounded-md shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="p-3 border-b border-zinc-200 flex items-start gap-3">
                        <img src={book.coverUrl} alt={book.title} className="w-14 h-[86px] object-cover rounded shadow-sm flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-bold text-zinc-900 mb-0.5 line-clamp-1">{book.title}</h2>
                            <p className="text-xs text-zinc-600 mb-2">{book.author}</p>
                            <div className="flex flex-wrap gap-3 text-[9px] text-zinc-400">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(highlight.dateAdded)}</span>
                                </div>
                                {highlight.location && (
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" />
                                        <span>{highlight.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-1 hover:bg-zinc-100 rounded transition-colors flex-shrink-0" title="Close">
                            <X className="w-4 h-4 text-zinc-600" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <div className="bg-zinc-50 border border-zinc-200 rounded p-2">
                            <label className="text-[9px] uppercase text-zinc-400 font-semibold mb-1 block">Highlight</label>
                            <textarea
                                value={editForm.text}
                                onChange={(e) => handleChange('text', e.target.value)}
                                className="w-full bg-transparent border-0 px-0 py-0 text-xs font-serif text-zinc-800 resize-none focus:outline-none placeholder:text-zinc-300"
                                rows={6}
                            />
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200 rounded p-2">
                            <label className="text-[9px] uppercase text-zinc-400 font-semibold mb-1 block">Note</label>
                            <textarea
                                value={editForm.note}
                                onChange={(e) => handleChange('note', e.target.value)}
                                className="w-full bg-transparent border-0 px-0 py-0 text-xs font-serif text-zinc-800 resize-none focus:outline-none placeholder:text-zinc-300"
                                rows={5}
                                placeholder="Add your personal note..."
                            />
                        </div>

                        <div className="border-t border-zinc-200 pt-2">
                            <button onClick={() => setShowStats(!showStats)} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 transition-colors w-full">
                                <TrendingUp className="w-3 h-3" />
                                <span className="font-medium">Study Statistics</span>
                                {showStats ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                            </button>

                            {showStats && (
                                <div className="mt-2 bg-zinc-50 rounded p-2 space-y-2">
                                    <div className="h-40 w-full">
                                        {statsData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={statsData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={9} />
                                                    <YAxis stroke="#9ca3af" fontSize={9} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb', fontSize: '10px' }} itemStyle={{ color: '#2563eb', fontSize: '10px' }} />
                                                    <Line type="monotone" dataKey="interval" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-zinc-400 text-[10px]">No review history yet.</div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-1.5">
                                        <div className="bg-white p-1.5 rounded text-center">
                                            <p className="text-[9px] text-zinc-400 uppercase tracking-wide font-semibold">Repetitions</p>
                                            <p className="text-sm font-bold text-zinc-900">{card?.repetitions || 0}</p>
                                        </div>
                                        <div className="bg-white p-1.5 rounded text-center">
                                            <p className="text-[9px] text-zinc-400 uppercase tracking-wide font-semibold">Ease Factor</p>
                                            <p className="text-sm font-bold text-zinc-900">{card?.easeFactor?.toFixed(2) || '-'}</p>
                                        </div>
                                        <div className="bg-white p-1.5 rounded text-center">
                                            <p className="text-[9px] text-zinc-400 uppercase tracking-wide font-semibold">Next Review</p>
                                            <p className="text-[10px] font-bold text-zinc-900">
                                                {card ? new Date(card.nextReviewDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>
        </Portal>
    );
};

export default HighlightEditModal;
