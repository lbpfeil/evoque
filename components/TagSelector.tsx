import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
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
    className?: string;
}

export function TagSelector({ highlightId, className }: TagSelectorProps) {
    const { tags, highlights, assignTagToHighlight, removeTagFromHighlight, addTag } = useStore();
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const highlight = highlights.find(h => h.id === highlightId);
    const selectedTagIds = highlight?.tags || [];

    const selectedTags = tags.filter(t => selectedTagIds.includes(t.id));

    const handleSelectTag = (tagId: string) => {
        if (selectedTagIds.includes(tagId)) {
            removeTagFromHighlight(highlightId, tagId);
        } else {
            assignTagToHighlight(highlightId, tagId);
        }
    };

    const handleCreateTag = () => {
        if (!searchValue.trim()) return;
        const newTagId = addTag(searchValue.trim());
        assignTagToHighlight(highlightId, newTagId);
        setSearchValue('');
    };

    // Helper to get full path name (e.g., "Philosophy > Stoicism")
    const getTagPath = (tag: Tag): string => {
        if (!tag.parentId) return tag.name;
        const parent = tags.find(t => t.id === tag.parentId);
        return parent ? `${getTagPath(parent)} > ${tag.name}` : tag.name;
    };

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
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200"
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-zinc-400 text-xs italic">Add tags...</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search tags..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            <div className="p-2 text-xs text-zinc-500">
                                No tags found.
                                {searchValue && (
                                    <button
                                        onClick={handleCreateTag}
                                        className="mt-2 w-full flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Create "{searchValue}"
                                    </button>
                                )}
                            </div>
                        </CommandEmpty>
                        <CommandGroup heading="Tags">
                            {tags.map((tag) => (
                                <CommandItem
                                    key={tag.id}
                                    value={tag.name} // Use name for search
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
                                    <span>{getTagPath(tag)}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
