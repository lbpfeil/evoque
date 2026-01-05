import React from 'react';
import { DeckStats } from '../types';
import { cn } from '../lib/utils';

interface Deck {
    id: string;
    title: string;
    author?: string;
    stats: DeckStats;
    isAllBooks?: boolean;
}

interface DeckTableProps {
    decks: Deck[];
    onDeckClick: (deckId: string) => void;
}

export const DeckTable: React.FC<DeckTableProps> = ({ decks, onDeckClick }) => {
    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">
            {/* Table Header */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-2 py-1 grid grid-cols-[1fr_48px] sm:grid-cols-[1fr_48px_64px_48px_48px] gap-2 items-center">
                <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Deck</div>
                <div className="hidden sm:block text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-right">New</div>
                <div className="hidden sm:block text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-right">Learning</div>
                <div className="hidden sm:block text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-right">Review</div>
                <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-right">Total</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-zinc-100 dark:divide-y dark:divide-zinc-800">
                {decks.map((deck) => (
                    <button
                        key={deck.id}
                        onClick={() => onDeckClick(deck.id)}
                        className={cn(
                            "w-full px-2 py-1 grid grid-cols-[1fr_48px] sm:grid-cols-[1fr_48px_64px_48px_48px] gap-2 items-center",
                            "hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left",
                            deck.isAllBooks && "bg-zinc-50/50 dark:bg-zinc-800/50 font-medium"
                        )}
                    >
                        {/* Deck Name */}
                        <div className="min-w-0">
                            <div className={cn(
                                "text-sm sm:text-xs text-zinc-900 dark:text-zinc-100 truncate",
                                deck.isAllBooks && "font-semibold"
                            )}>
                                {deck.title}
                            </div>
                            {deck.author && (
                                <div className="text-xs sm:text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                                    {deck.author}
                                </div>
                            )}
                        </div>

                        {/* New Count - Hidden on mobile */}
                        <div className={cn(
                            "hidden sm:block text-xs text-right tabular-nums",
                            deck.stats.new > 0 ? "text-blue-600 font-medium" : "text-zinc-400 dark:text-zinc-500"
                        )}>
                            {deck.stats.new}
                        </div>

                        {/* Learning Count - Hidden on mobile */}
                        <div className={cn(
                            "hidden sm:block text-xs text-right tabular-nums",
                            deck.stats.learning > 0 ? "text-amber-600 font-medium" : "text-zinc-400 dark:text-zinc-500"
                        )}>
                            {deck.stats.learning}
                        </div>

                        {/* Review Count - Hidden on mobile */}
                        <div className={cn(
                            "hidden sm:block text-xs text-right tabular-nums",
                            deck.stats.review > 0 ? "text-green-600 font-medium" : "text-zinc-400 dark:text-zinc-500"
                        )}>
                            {deck.stats.review}
                        </div>

                        {/* Total Count */}
                        <div className={cn(
                            "text-sm sm:text-xs text-right tabular-nums font-semibold",
                            deck.stats.total > 0 ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"
                        )}>
                            {deck.stats.total}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
