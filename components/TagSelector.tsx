import React, { useState, useMemo } from 'react';
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
                <div className="flex items-center border-b px-2 py-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        type="text"
                        placeholder="Search tags..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                {/* Tags List */}
                <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                    {sortedTags.length === 0 ? (
                        <div className="p-2 text-xs text-zinc-500 flex flex-col gap-1">
                            <span>No tags found.</span>

                            {searchValue && (
                                <>
                                    <button
                                        onClick={handleCreateGlobalTag}
                                        className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded text-left"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Create Global "{searchValue}"
                                    </button>

                                    {bookId && (
                                        <button
                                            onClick={handleCreateChapter}
                                            className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded text-left"
                                        >
                                            <Book className="w-3 h-3" />
                                            Create Chapter "{searchValue}"
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="p-1">
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Tags</div>
                            {sortedTags.map((tag) => {
                                const isSelected = selectedTagIds.includes(tag.id);
                                return (
                                    <div
                                        key={tag.id}
                                        onClick={() => handleSelectTag(tag.id)}
                                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-3 w-3 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50"
                                            )}
                                        >
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            {tag.bookId && <Book className="w-3 h-3 text-amber-500" />}
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
                    className={cn("h-auto p-1 hover:bg-zinc-100 justify-start font-normal text-left", className)}
                >
                    {selectedTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {selectedTags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className={cn(
                                        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
                                        tag.bookId
                                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-500 dark:border-amber-800"
                                            : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
                                        variant === 'minimal' && "rounded-full px-2"
                                    )}
                                >
                                    {tag.bookId && <Book className="w-3 h-3 mr-1 opacity-50" />}
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className={cn("text-zinc-400 text-xs italic flex items-center gap-1", variant === 'minimal' && "opacity-0 group-hover:opacity-100 transition-opacity duration-200")}>
                            <Plus className="w-3 h-3" />
                            <span className={cn(variant === 'minimal' && "hidden sm:inline")}>Add tags...</span>
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <div className="flex flex-col">
                    {/* Search Input */}
                    <div className="flex items-center border-b px-2 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            type="text"
                            placeholder="Search tags..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    {/* Tags List */}
                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                        {sortedTags.length === 0 ? (
                            <div className="p-2 text-xs text-zinc-500 flex flex-col gap-1">
                                <span>No tags found.</span>

                                {searchValue && (
                                    <>
                                        <button
                                            onClick={handleCreateGlobalTag}
                                            className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded text-left"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Create Global "{searchValue}"
                                        </button>

                                        {bookId && (
                                            <button
                                                onClick={handleCreateChapter}
                                                className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded text-left"
                                            >
                                                <Book className="w-3 h-3" />
                                                Create Chapter "{searchValue}"
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="p-1">
                                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Tags</div>
                                {sortedTags.map((tag) => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    return (
                                        <div
                                            key={tag.id}
                                            onClick={() => handleSelectTag(tag.id)}
                                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-3 w-3 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50"
                                                )}
                                            >
                                                {isSelected && <Check className="h-3 w-3" />}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                {tag.bookId && <Book className="w-3 h-3 text-amber-500" />}
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
