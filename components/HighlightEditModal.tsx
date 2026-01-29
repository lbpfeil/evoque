import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from './StoreContext';
import { BookOpen, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface HighlightEditModalProps {
  highlightId: string | null;
  onClose: () => void;
}

const HighlightEditModal: React.FC<HighlightEditModalProps> = ({ highlightId, onClose }) => {
  const { t } = useTranslation('highlights');
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

  const logs = reviewLogs.filter(l => l.cardId === card?.id).sort((a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime());
  const statsData = logs.map(log => ({
    date: new Date(log.reviewedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    interval: log.interval,
    easeFactor: log.easeFactor
  }));

  if (card && logs.length > 0) {
    statsData.push({
      date: t('editModal.next'),
      interval: card.interval,
      easeFactor: card.easeFactor
    });
  }

  return (
    <Dialog open={!!highlightId} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Header with book info */}
        <DialogHeader className="p-sm border-b border-border flex-shrink-0">
          <div className="flex items-start gap-sm">
            <img src={book.coverUrl} alt={book.title} className="w-14 h-[86px] object-cover rounded shadow-sm flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-heading font-bold mb-0.5 line-clamp-1">
                {book.title}
              </DialogTitle>
              <p className="text-caption text-muted-foreground mb-xs">{book.author}</p>
              <div className="flex flex-wrap gap-sm text-overline text-muted-foreground">
                <div className="flex items-center gap-xxs">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(highlight.dateAdded)}</span>
                </div>
                {highlight.location && (
                  <div className="flex items-center gap-xxs">
                    <BookOpen className="w-3 h-3" />
                    <span>{highlight.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content area - scrollable */}
        <div className="flex-1 overflow-y-auto p-sm space-y-xs">
          {/* Highlight text area */}
          <div className="bg-muted border border-border rounded p-xs">
            <label className="text-overline uppercase text-muted-foreground font-semibold mb-xxs block">{t('editModal.highlight')}</label>
            <textarea
              value={editForm.text}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full bg-transparent border-0 px-0 py-0 text-caption text-foreground resize-none focus:outline-none placeholder:text-muted-foreground"
              rows={6}
            />
          </div>

          {/* Note text area */}
          <div className="bg-muted border border-border rounded p-xs">
            <label className="text-overline uppercase text-muted-foreground font-semibold mb-xxs block">{t('editModal.note')}</label>
            <textarea
              value={editForm.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className="w-full bg-transparent border-0 px-0 py-0 text-caption text-foreground resize-none focus:outline-none placeholder:text-muted-foreground"
              rows={5}
              placeholder={t('editModal.notePlaceholder')}
            />
          </div>

          {/* Stats toggle button */}
          {card && (
            <Button
              variant="outline"
              onClick={() => setShowStats(!showStats)}
              className="w-full flex items-center justify-between h-auto p-xs"
            >
              <span className="flex items-center gap-xs text-muted-foreground font-medium">
                <TrendingUp className="w-3 h-3" />
                {t('editModal.learningStats')}
              </span>
              {showStats ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
            </Button>
          )}

          {/* Stats section (collapsible) */}
          {showStats && card && (
            <div className="space-y-sm pt-xs">
              {/* Chart */}
              {statsData.length > 0 && (
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: 'currentColor', fontSize: 10 }}
                        stroke="currentColor"
                        className="text-muted-foreground"
                      />
                      <YAxis
                        tick={{ fill: 'currentColor', fontSize: 10 }}
                        stroke="currentColor"
                        className="text-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          borderRadius: '0.375rem',
                          border: '1px solid var(--border)',
                          fontSize: '10px',
                          color: 'var(--card-foreground)'
                        }}
                        itemStyle={{ color: 'var(--primary)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="interval"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--primary)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-xs">
                <div className="bg-muted p-xs rounded text-center">
                  <p className="text-overline text-muted-foreground uppercase font-semibold">{t('editModal.reps')}</p>
                  <p className="text-body font-bold">{card.repetitions}</p>
                </div>
                <div className="bg-muted p-xs rounded text-center">
                  <p className="text-overline text-muted-foreground uppercase font-semibold">{t('editModal.ease')}</p>
                  <p className="text-body font-bold">{card.easeFactor.toFixed(2)}</p>
                </div>
                <div className="bg-muted p-xs rounded text-center">
                  <p className="text-overline text-muted-foreground uppercase font-semibold">{t('editModal.interval')}</p>
                  <p className="text-body font-bold">{card.interval}d</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HighlightEditModal;
