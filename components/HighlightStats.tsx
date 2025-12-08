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
        <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-md px-3 py-1.5 shadow-sm mb-3">
            {/* Total */}
            <div className="flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
                <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-zinc-900">{stats.total}</span>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wide">highlights</span>
                </div>
            </div>

            <div className="h-4 w-px bg-zinc-200" />

            {/* With Notes */}
            <div className="flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-zinc-400 shrink-0" />
                <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-zinc-900">{stats.withNotes}</span>
                    <span className="text-[9px] text-zinc-400">{stats.withNotesPercent}% com notas</span>
                </div>
            </div>

            <div className="h-4 w-px bg-zinc-200" />

            {/* In Study */}
            <div className="flex items-center gap-1.5">
                <Brain className="w-3 h-3 text-zinc-400 shrink-0" />
                <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-zinc-900">{stats.inStudy}</span>
                    <span className="text-[9px] text-zinc-400">{stats.inStudyPercent}% em estudo</span>
                </div>
            </div>

            <div className="h-4 w-px bg-zinc-200" />

            {/* Unique Books */}
            <div className="flex items-center gap-1.5">
                <Library className="w-3 h-3 text-zinc-400 shrink-0" />
                <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-zinc-900">{stats.uniqueBooks}</span>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wide">livros</span>
                </div>
            </div>
        </div>
    );
};

export default HighlightStats;
