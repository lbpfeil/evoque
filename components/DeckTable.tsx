import React from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('study');

    return (
        <div className="border border-border rounded overflow-hidden">
            {/* Table Header */}
            <div className="bg-muted border-b border-border px-xs py-xxs grid grid-cols-[1fr_48px] sm:grid-cols-[1fr_48px_64px_48px_48px] gap-xs items-center">
                <div className="text-caption font-semibold text-muted-foreground">{t('table.deck')}</div>
                <div className="hidden sm:block text-caption font-semibold text-muted-foreground text-right">{t('table.new')}</div>
                <div className="hidden sm:block text-caption font-semibold text-muted-foreground text-right">{t('table.learning')}</div>
                <div className="hidden sm:block text-caption font-semibold text-muted-foreground text-right">{t('table.review')}</div>
                <div className="text-caption font-semibold text-muted-foreground text-right">{t('table.total')}</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
                {decks.map((deck) => (
                    /* Deck row button -- kept raw intentionally (Button styling conflicts with table row grid appearance) */
                    <button
                        key={deck.id}
                        onClick={() => onDeckClick(deck.id)}
                        className={cn(
                            "w-full px-xs py-xxs grid grid-cols-[1fr_48px] sm:grid-cols-[1fr_48px_64px_48px_48px] gap-xs items-center",
                            "hover:bg-accent/50 transition-colors text-left",
                            deck.isAllBooks && "bg-muted/50 font-medium"
                        )}
                    >
                        {/* Deck Name */}
                        <div className="min-w-0">
                            <div className={cn(
                                "text-body sm:text-caption text-foreground truncate",
                                deck.isAllBooks && "font-semibold"
                            )}>
                                {deck.title}
                            </div>
                            {deck.author && (
                                <div className="text-caption sm:text-overline text-muted-foreground truncate">
                                    {deck.author}
                                </div>
                            )}
                        </div>

                        {/* New Count - Hidden on mobile */}
                        <div className={cn(
                            "hidden sm:block text-caption text-right tabular-nums",
                            deck.stats.new > 0 ? "text-status-new font-medium" : "text-muted-foreground"
                        )}>
                            {deck.stats.new}
                        </div>

                        {/* Learning Count - Hidden on mobile */}
                        <div className={cn(
                            "hidden sm:block text-caption text-right tabular-nums",
                            deck.stats.learning > 0 ? "text-status-learning font-medium" : "text-muted-foreground"
                        )}>
                            {deck.stats.learning}
                        </div>

                        {/* Review Count - Hidden on mobile */}
                        <div className={cn(
                            "hidden sm:block text-caption text-right tabular-nums",
                            deck.stats.review > 0 ? "text-status-review font-medium" : "text-muted-foreground"
                        )}>
                            {deck.stats.review}
                        </div>

                        {/* Total Count */}
                        <div className={cn(
                            "text-body sm:text-caption text-right tabular-nums font-semibold",
                            deck.stats.total > 0 ? "text-foreground" : "text-muted-foreground"
                        )}>
                            {deck.stats.total}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
