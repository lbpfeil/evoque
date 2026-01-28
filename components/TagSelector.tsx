import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Plus, Book, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from './ui/popover';
import { useStore } from './StoreContext';
import { Tag } from '../types';

interface TagSelectorProps {
    highlightId: string;
    bookId?: string;
    className?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    variant?: 'default' | 'minimal';
}

export function TagSelector({ highlightId, bookId, className, open: controlledOpen, onOpenChange, variant = 'default' }: TagSelectorProps) {
    const { t } = useTranslation('highlights');
    const { tags, highlights, assignTagToHighlight, removeTagFromHighlight, addTag, getBook } = useStore();
    const [internalOpen, setInternalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // Use controlled open if provided, otherwise use internal state
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    const highlight = highlights.find(h => h.id === highlightId);
    const selectedTagIds = highlight?.tags || [];

    const book = bookId ? getBook(bookId) : undefined;

    // Filter tags: Global tags + Tags for this book
    const availableTags = tags.filter(t => !t.bookId || (bookId && t.bookId === bookId));

    // Filter by search
    const filteredTags = useMemo(() => {
        if (!searchValue.trim()) return availableTags;
        const search = searchValue.toLowerCase();
        return availableTags.filter(t => t.name.toLowerCase().includes(search));
    }, [availableTags, searchValue]);

    const sortedTags = [...filteredTags].sort((a, b) => a.name.localeCompare(b.name));
    const selectedTags = tags.filter(t => selectedTagIds.includes(t.id));

    const handleSelectTag = (tagId: string) => {
        if (selectedTagIds.includes(tagId)) {
            removeTagFromHighlight(highlightId, tagId);
        } else {
            assignTagToHighlight(highlightId, tagId);
        }
    };

    const handleCreateGlobalTag = async () => {
        if (!searchValue.trim()) return;
        const newTagId = await addTag(searchValue.trim());
        await assignTagToHighlight(highlightId, newTagId);
        setSearchValue('');
    };

    const handleCreateChapter = async () => {
        if (!searchValue.trim() || !bookId) return;
        const newTagId = await addTag(searchValue.trim(), undefined, bookId);
        await assignTagToHighlight(highlightId, newTagId);
        setSearchValue('');
    };

    // Helper to get full path name
    const getTagPath = (tag: Tag): string => {
        let path = tag.name;
        if (tag.parentId) {
            const parent = tags.find(t => t.id === tag.parentId);
            if (parent) {
                path = `${getTagPath(parent)} > ${path}`;
            }
        }
        return path;
    };

    // Render content directly if in controlled mode
    const renderContent = () => (
        <div className="w-full sm:w-[360px] p-0 mx-auto">
            <div className="flex flex-col">
                {/* Search Input */}
                <div className="flex items-center border-b px-xs py-xs">
                    <Search className="mr-xs h-4 w-4 shrink-0 opacity-50" />
                    <input
                        type="text"
                        placeholder={t('tagSelector.searchPlaceholder')}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="flex h-8 w-full rounded-md bg-transparent text-body outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                {/* Tags List */}
                <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                    {sortedTags.length === 0 ? (
                        <div className="p-xs text-caption text-muted-foreground flex flex-col gap-xxs">
                            <span>{t('tagSelector.noTagsFound')}</span>

                            {searchValue && (
                                <>
                                    {/* tinted hover: no semantic token */}
                                    <button
                                        onClick={handleCreateGlobalTag}
                                        className="w-full flex items-center gap-xxs px-xs py-1.5 text-caption font-medium text-tag-global hover:bg-blue-50 rounded text-left"
                                    >
                                        <Plus className="w-3 h-3" />
                                        {t('tagSelector.createGlobal', { name: searchValue })}
                                    </button>

                                    {bookId && (
                                        <>
                                            {/* tinted hover: no semantic token */}
                                            <button
                                                onClick={handleCreateChapter}
                                                className="w-full flex items-center gap-xxs px-xs py-1.5 text-caption font-medium text-tag-book hover:bg-amber-50 rounded text-left"
                                            >
                                                <Book className="w-3 h-3" />
                                                {t('tagSelector.createChapter', { name: searchValue })}
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="p-xxs">
                            <div className="px-xs py-1.5 text-caption font-medium text-muted-foreground">{t('tagSelector.tagsLabel')}</div>
                            {sortedTags.map((tag) => {
                                const isSelected = selectedTagIds.includes(tag.id);
                                return (
                                    <div
                                        key={tag.id}
                                        onClick={() => handleSelectTag(tag.id)}
                                        className="relative flex cursor-pointer select-none items-center rounded-sm px-xs py-1.5 text-body outline-none hover:bg-accent hover:text-accent-foreground"
                                    >
                                        <div
                                            className={cn(
                                                "mr-xs flex h-3 w-3 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50"
                                            )}
                                        >
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                        <div className="flex items-center gap-xs text-caption">
                                            {tag.bookId && <Book className="w-3 h-3 text-tag-book" />}
                                            <span>{getTagPath(tag)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // If controlled externally, render content directly without Popover wrapper
    if (controlledOpen !== undefined) {
        return renderContent();
    }

    // Otherwise, use normal Popover pattern for backward compatibility
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("h-auto p-xxs hover:bg-accent justify-start font-normal text-left", className)}
                >
                    {selectedTags.length > 0 ? (
                        <div className="flex flex-wrap gap-xxs">
                            {selectedTags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className={cn(
                                        "inline-flex items-center px-xs py-0.5 rounded text-overline font-medium border",
                                        tag.bookId
                                            /* tinted tag badge: no semantic token */
                                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-500 dark:border-amber-800"
                                            : "bg-muted text-muted-foreground border-border",
                                        variant === 'minimal' && "rounded-full px-xs"
                                    )}
                                >
                                    {tag.bookId && <Book className="w-3 h-3 mr-xxs opacity-50" />}
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className={cn("text-muted-foreground text-caption italic flex items-center gap-xxs", variant === 'minimal' && "opacity-0 group-hover:opacity-100 transition-opacity duration-200")}>
                            <Plus className="w-3 h-3" />
                            <span className={cn(variant === 'minimal' && "hidden sm:inline")}>{t('tagSelector.addTags')}</span>
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <div className="flex flex-col">
                    {/* Search Input */}
                    <div className="flex items-center border-b px-xs py-xs">
                        <Search className="mr-xs h-4 w-4 shrink-0 opacity-50" />
                        <input
                            type="text"
                            placeholder={t('tagSelector.searchPlaceholder')}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="flex h-8 w-full rounded-md bg-transparent text-body outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    {/* Tags List */}
                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                        {sortedTags.length === 0 ? (
                            <div className="p-xs text-caption text-muted-foreground flex flex-col gap-xxs">
                                <span>{t('tagSelector.noTagsFound')}</span>

                                {searchValue && (
                                    <>
                                        {/* tinted hover: no semantic token */}
                                        <button
                                            onClick={handleCreateGlobalTag}
                                            className="w-full flex items-center gap-xxs px-xs py-1.5 text-caption font-medium text-tag-global hover:bg-blue-50 rounded text-left"
                                        >
                                            <Plus className="w-3 h-3" />
                                            {t('tagSelector.createGlobal', { name: searchValue })}
                                        </button>

                                        {bookId && (
                                            <>
                                                {/* tinted hover: no semantic token */}
                                                <button
                                                    onClick={handleCreateChapter}
                                                    className="w-full flex items-center gap-xxs px-xs py-1.5 text-caption font-medium text-tag-book hover:bg-amber-50 rounded text-left"
                                                >
                                                    <Book className="w-3 h-3" />
                                                    {t('tagSelector.createChapter', { name: searchValue })}
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="p-xxs">
                                <div className="px-xs py-1.5 text-caption font-medium text-muted-foreground">{t('tagSelector.tagsLabel')}</div>
                                {sortedTags.map((tag) => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    return (
                                        <div
                                            key={tag.id}
                                            onClick={() => handleSelectTag(tag.id)}
                                            className="relative flex cursor-pointer select-none items-center rounded-sm px-xs py-1.5 text-body outline-none hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-xs flex h-3 w-3 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50"
                                                )}
                                            >
                                                {isSelected && <Check className="h-3 w-3" />}
                                            </div>
                                            <div className="flex items-center gap-xs text-caption">
                                                {tag.bookId && <Book className="w-3 h-3 text-tag-book" />}
                                                <span>{getTagPath(tag)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
