import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import { useStore } from './StoreContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface HighlightHistoryModalProps {
  highlightId: string | null;
  onClose: () => void;
}

const HighlightHistoryModal: React.FC<HighlightHistoryModalProps> = ({ highlightId, onClose }) => {
  const { t } = useTranslation('highlights');
  const { highlights, studyCards, reviewLogs } = useStore();

  if (!highlightId) return null;

  const highlight = highlights.find(h => h.id === highlightId);
  const card = studyCards.find(c => c.highlightId === highlightId);

  if (!highlight) return null;

  // Filter logs for this card
  const logs = reviewLogs.filter(l => l.cardId === card?.id).sort((a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime());

  // Prepare data
  const data = logs.map(log => ({
    date: new Date(log.reviewedAt).toLocaleDateString(),
    interval: log.interval,
    easeFactor: log.easeFactor
  }));

  // Add current state if available
  if (card && logs.length > 0) {
    data.push({
      date: t('editModal.next'),
      interval: card.interval,
      easeFactor: card.easeFactor
    });
  }

  return (
    <Dialog open={!!highlightId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('historyModal.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          <div>
            <p className="text-sm text-muted-foreground italic mb-2">
              "{highlight.text.substring(0, 100)}{highlight.text.length > 100 ? '...' : ''}"
            </p>
          </div>

          <div className="h-64 w-full">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    className="text-muted-foreground"
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    stroke="currentColor"
                  />
                  <YAxis
                    className="text-muted-foreground"
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    stroke="currentColor"
                    label={{ value: t('historyModal.intervalDays'), angle: -90, position: 'insideLeft', fill: 'currentColor' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '0.5rem',
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="interval"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                {t('historyModal.noHistory')}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted p-3 rounded-md text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('historyModal.repetitions')}</p>
              <p className="text-xl font-bold">{card?.repetitions || 0}</p>
            </div>
            <div className="bg-muted p-3 rounded-md text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('historyModal.easeFactor')}</p>
              <p className="text-xl font-bold">{card?.easeFactor?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-muted p-3 rounded-md text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('historyModal.nextReview')}</p>
              <p className="text-xl font-bold">
                {card ? new Date(card.nextReviewDate).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HighlightHistoryModal;
