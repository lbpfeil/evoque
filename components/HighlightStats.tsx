import React, { useMemo } from 'react';
import { Highlight, StudyCard, Book } from '../types';
import { BookOpen, FileText, Brain, Library } from 'lucide-react';

interface HighlightStatsProps {
    highlights: Highlight[];
    studyCards: StudyCard[];
    books: Book[];
}

const HighlightStats: React.FC<HighlightStatsProps> = ({ highlights, studyCards, books }) => {
    const stats = useMemo(() => {
        const highlightsWithNotes = highlights.filter(h => h.note && h.note.trim().length > 0).length;
        const highlightsInStudy = studyCards.length;
        const uniqueBooks = new Set(highlights.map(h => h.bookId)).size;

        return {
            total: highlights.length,
            withNotes: highlightsWithNotes,
            withNotesPercent: highlights.length > 0 ? Math.round((highlightsWithNotes / highlights.length) * 100) : 0,
            inStudy: highlightsInStudy,
            inStudyPercent: highlights.length > 0 ? Math.round((highlightsInStudy / highlights.length) * 100) : 0,
            uniqueBooks
        };
    }, [highlights, studyCards]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {/* Total Highlights */}
            <div className="bg-white border border-zinc-200 rounded-md p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Total</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
                <p className="text-xs text-zinc-500 mt-0.5">highlights</p>
            </div>

            {/* With Notes */}
            <div className="bg-white border border-zinc-200 rounded-md p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-zinc-400" />
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">With Notes</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{stats.withNotes}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{stats.withNotesPercent}% of total</p>
            </div>

            {/* In Study */}
            <div className="bg-white border border-zinc-200 rounded-md p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-zinc-400" />
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">In Study</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{stats.inStudy}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{stats.inStudyPercent}% of total</p>
            </div>

            {/* Unique Books */}
            <div className="bg-white border border-zinc-200 rounded-md p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Library className="w-4 h-4 text-zinc-400" />
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Books</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{stats.uniqueBooks}</p>
                <p className="text-xs text-zinc-500 mt-0.5">unique sources</p>
            </div>
        </div>
    );
};

export default HighlightStats;
