import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus, X, Book } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from './ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from './ui/popover';
import { useStore } from './StoreContext';
import { Tag } from '../types';

interface TagSelectorProps {
    highlightId: string;
    bookId?: string; // New prop for scope
    className?: string;
}

export function TagSelector({ highlightId, bookId, className }: TagSelectorProps) {
    const { tags, highlights, assignTagToHighlight, removeTagFromHighlight, addTag, getBook } = useStore();
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const highlight = highlights.find(h => h.id === highlightId);
    const selectedTagIds = highlight?.tags || [];

    const book = bookId ? getBook(bookId) : undefined;

    // Filter tags: Global tags + Tags for this book
    const availableTags = tags.filter(t => !t.bookId || (bookId && t.bookId === bookId));

    // Sort: Global first, then Book specific? Or alphabetical?
    // Let's sort alphabetical but maybe group them in display if needed.
    const sortedTags = [...availableTags].sort((a, b) => a.name.localeCompare(b.name));

    const selectedTags = tags.filter(t => selectedTagIds.includes(t.id));

    const handleSelectTag = (tagId: string) => {
        if (selectedTagIds.includes(tagId)) {
            removeTagFromHighlight(highlightId, tagId);
        } else {
            assignTagToHighlight(highlightId, tagId);
        }
    };

    const handleCreateGlobalTag = () => {
        if (!searchValue.trim()) return;
        const newTagId = addTag(searchValue.trim());
        assignTagToHighlight(highlightId, newTagId);
        setSearchValue('');
    };

    const handleCreateChapter = () => {
        if (!searchValue.trim() || !bookId) return;
        const newTagId = addTag(searchValue.trim(), undefined, bookId);
        assignTagToHighlight(highlightId, newTagId);
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

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
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
                                            ? "bg-amber-50 text-amber-700 border-amber-200" // Distinct style for chapters
                                            : "bg-zinc-100 text-zinc-700 border-zinc-200"
                                    )}
                                >
                                    {tag.bookId && <Book className="w-3 h-3 mr-1 opacity-50" />}
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-zinc-400 text-xs italic">Add tags...</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search tags..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>
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
                        </CommandEmpty>
                        <CommandGroup heading="Tags">
                            {sortedTags.map((tag) => (
                                <CommandItem
                                    key={tag.id}
                                    value={tag.name}
                                    onSelect={() => handleSelectTag(tag.id)}
                                    className="text-xs"
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-3 w-3 items-center justify-center rounded-sm border border-primary",
                                            selectedTagIds.includes(tag.id)
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50 [&_svg]:invisible"
                                        )}
                                    >
                                        <Check className={cn("h-3 w-3")} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {tag.bookId && <Book className="w-3 h-3 text-amber-500" />}
                                        <span>{getTagPath(tag)}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
