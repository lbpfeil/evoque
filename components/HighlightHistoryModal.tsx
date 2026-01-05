import React from 'react';
import { X, TrendingUp } from 'lucide-react';
import { useStore } from './StoreContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HighlightHistoryModalProps {
    highlightId: string | null;
    onClose: () => void;
}

const HighlightHistoryModal: React.FC<HighlightHistoryModalProps> = ({ highlightId, onClose }) => {
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
            date: 'Next',
            interval: card.interval,
            easeFactor: card.easeFactor
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Learning Curve</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="mb-6">
                        <p className="text-sm text-zinc-500 dark:text-zinc-500 italic mb-2">"{highlight.text.substring(0, 100)}{highlight.text.length > 100 ? '...' : ''}"</p>
                    </div>

                    <div className="h-64 w-full">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" fontSize={12} label={{ value: 'Interval (days)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#2563eb', fontSize: '12px' }}
                                    />
                                    <Line type="monotone" dataKey="interval" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm">
                                No review history yet.
                            </div>
                        )}
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-md text-center">
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider font-semibold">Repetitions</p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{card?.repetitions || 0}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-md text-center">
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider font-semibold">Ease Factor</p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{card?.easeFactor?.toFixed(2) || '-'}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-md text-center">
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider font-semibold">Next Review</p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                {card ? new Date(card.nextReviewDate).toLocaleDateString() : '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HighlightHistoryModal;
