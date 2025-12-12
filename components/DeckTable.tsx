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
        <div className="border border-zinc-200 rounded overflow-hidden">
            {/* Table Header */}
            <div className="bg-zinc-50 border-b border-zinc-200 px-2 py-1 grid grid-cols-[1fr_48px_64px_48px_48px] gap-2 items-center">
                <div className="text-xs font-semibold text-zinc-600">Deck</div>
                <div className="text-xs font-semibold text-zinc-600 text-right">New</div>
                <div className="text-xs font-semibold text-zinc-600 text-right">Learning</div>
                <div className="text-xs font-semibold text-zinc-600 text-right">Review</div>
                <div className="text-xs font-semibold text-zinc-600 text-right">Total</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-zinc-100">
                {decks.map((deck) => (
                    <button
                        key={deck.id}
                        onClick={() => onDeckClick(deck.id)}
                        className={cn(
                            "w-full px-2 py-1 grid grid-cols-[1fr_48px_64px_48px_48px] gap-2 items-center",
                            "hover:bg-zinc-50 transition-colors text-left",
                            deck.isAllBooks && "bg-zinc-50/50 font-medium"
                        )}
                    >
                        {/* Deck Name */}
                        <div className="min-w-0">
                            <div className={cn(
                                "text-xs text-zinc-900 truncate",
                                deck.isAllBooks && "font-semibold"
                            )}>
                                {deck.title}
                            </div>
                            {deck.author && (
                                <div className="text-[10px] text-zinc-400 truncate">
                                    {deck.author}
                                </div>
                            )}
                        </div>

                        {/* New Count */}
                        <div className={cn(
                            "text-xs text-right tabular-nums",
                            deck.stats.new > 0 ? "text-blue-600 font-medium" : "text-zinc-400"
                        )}>
                            {deck.stats.new}
                        </div>

                        {/* Learning Count */}
                        <div className={cn(
                            "text-xs text-right tabular-nums",
                            deck.stats.learning > 0 ? "text-amber-600 font-medium" : "text-zinc-400"
                        )}>
                            {deck.stats.learning}
                        </div>

                        {/* Review Count */}
                        <div className={cn(
                            "text-xs text-right tabular-nums",
                            deck.stats.review > 0 ? "text-green-600 font-medium" : "text-zinc-400"
                        )}>
                            {deck.stats.review}
                        </div>

                        {/* Total Count */}
                        <div className={cn(
                            "text-xs text-right tabular-nums font-semibold",
                            deck.stats.total > 0 ? "text-zinc-900" : "text-zinc-400"
                        )}>
                            {deck.stats.total}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
