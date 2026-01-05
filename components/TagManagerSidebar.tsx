import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Edit2, ChevronRight, ChevronDown, Folder, Tag as TagIcon, Book } from 'lucide-react';
import { useStore } from './StoreContext';
import { Tag } from '../types';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from './ui/sheet';

interface TagManagerSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TagManagerSidebar({ open, onOpenChange }: TagManagerSidebarProps) {
    const { tags, addTag, updateTag, deleteTag, getBook } = useStore();
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined);

    // State for book-specific tags section
    const [showBookTags, setShowBookTags] = useState(() => {
        const saved = localStorage.getItem('tagManager_showBookTags');
        return saved ? JSON.parse(saved) : false;
    });

    const [expandedBooks, setExpandedBooks] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('tagManager_expandedBooks');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const [newChapterTagName, setNewChapterTagName] = useState<Record<string, string>>({});

    // Persist state
    useEffect(() => {
        localStorage.setItem('tagManager_showBookTags', JSON.stringify(showBookTags));
    }, [showBookTags]);

    useEffect(() => {
        localStorage.setItem('tagManager_expandedBooks', JSON.stringify([...expandedBooks]));
    }, [expandedBooks]);

    // Separate tags by type
    const globalTags = useMemo(() => tags.filter(t => !t.bookId), [tags]);
    const bookTags = useMemo(() => tags.filter(t => t.bookId), [tags]);

    // Group book tags by book
    const tagsByBook = useMemo(() => {
        return bookTags.reduce((acc, tag) => {
            if (!tag.bookId) return acc;
            if (!acc[tag.bookId]) acc[tag.bookId] = [];
            acc[tag.bookId].push(tag);
            return acc;
        }, {} as Record<string, Tag[]>);
    }, [bookTags]);

    const booksWithTags = Object.keys(tagsByBook);

    // Recursive function to render tag tree (for global tags)
    const renderTagTree = (parentId?: string, depth = 0) => {
        const childTags = globalTags.filter(t => {
            // Match both null and undefined as "no parent"
            const tParent = t.parentId ?? undefined;
            const compareParent = parentId ?? undefined;
            return tParent === compareParent;
        });

        if (childTags.length === 0 && parentId) return null;

        return (
            <div className={cn("flex flex-col gap-0.5", depth > 0 && "ml-3 border-l border-zinc-200 dark:border-zinc-800 pl-1.5")}>
                {childTags.map(tag => {
                    return (
                        <div key={tag.id} className="group">
                            <div className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
                                <div className="flex items-center gap-1 flex-1 overflow-hidden">
                                    {tags.some(t => t.parentId === tag.id) ? (
                                        <Folder className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                    ) : (
                                        <TagIcon className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                    )}

                                    {editingTagId === tag.id ? (
                                        <div className="flex items-center gap-1 flex-1">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-5 text-xs py-0 px-1"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdateTag(tag.id);
                                                    if (e.key === 'Escape') setEditingTagId(null);
                                                }}
                                            />
                                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleUpdateTag(tag.id)}>
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                                            {tag.name}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                        onClick={() => {
                                            setEditingTagId(tag.id);
                                            setEditName(tag.name);
                                        }}
                                    >
                                        <Edit2 className="w-2.5 h-2.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5 text-zinc-400 hover:text-red-600"
                                        onClick={() => handleDelete(tag.id)}
                                    >
                                        <Trash2 className="w-2.5 h-2.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5 text-zinc-400 hover:text-blue-600"
                                        onClick={() => {
                                            setSelectedParentId(tag.id);
                                            setNewTagName('');
                                        }}
                                        title="Add child tag"
                                    >
                                        <Plus className="w-2.5 h-2.5" />
                                    </Button>
                                </div>
                            </div>
                            {renderTagTree(tag.id, depth + 1)}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render individual book tag
    const renderBookTag = (tag: Tag) => {
        return (
            <div className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-1 flex-1 overflow-hidden">
                    <TagIcon className="w-3 h-3 text-amber-500 shrink-0" />

                    {editingTagId === tag.id ? (
                        <div className="flex items-center gap-1 flex-1">
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-5 text-xs py-0 px-1"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateTag(tag.id);
                                    if (e.key === 'Escape') setEditingTagId(null);
                                }}
                            />
                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleUpdateTag(tag.id)}>
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                    ) : (
                        <span className="text-xs text-amber-700 dark:text-amber-600 truncate">
                            {tag.name}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        onClick={() => {
                            setEditingTagId(tag.id);
                            setEditName(tag.name);
                        }}
                    >
                        <Edit2 className="w-2.5 h-2.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-zinc-400 hover:text-red-600"
                        onClick={() => handleDelete(tag.id)}
                    >
                        <Trash2 className="w-2.5 h-2.5" />
                    </Button>
                </div>
            </div>
        );
    };

    const handleCreateTag = () => {
        if (!newTagName.trim()) return;
        addTag(newTagName.trim(), selectedParentId);
        setNewTagName('');
        setSelectedParentId(undefined);
    };

    const handleCreateChapterTag = (bookId: string) => {
        const name = newChapterTagName[bookId]?.trim();
        if (!name) return;

        addTag(name, undefined, bookId);

        setNewChapterTagName(prev => ({
            ...prev,
            [bookId]: ''
        }));
    };

    const handleUpdateTag = (id: string) => {
        if (!editName.trim()) return;
        updateTag(id, { name: editName.trim() });
        setEditingTagId(null);
    };

    const handleDelete = (id: string) => {
        const hasChildren = tags.some(t => t.parentId === id);
        const msg = hasChildren
            ? "This will delete this tag and ALL its sub-tags (Cascade Delete). Are you sure?"
            : "Are you sure you want to delete this tag?";

        if (window.confirm(msg)) {
            deleteTag(id);
        }
    };

    const toggleBookExpansion = (bookId: string) => {
        const newExpanded = new Set(expandedBooks);
        if (newExpanded.has(bookId)) {
            newExpanded.delete(bookId);
        } else {
            newExpanded.add(bookId);
        }
        setExpandedBooks(newExpanded);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader className="mb-2">
                    <SheetTitle className="text-base">Manage Tags</SheetTitle>
                    <SheetDescription className="text-xs">
                        Organize your tags hierarchically.
                        Global tags and book-specific tags are shown separately below.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pr-2">
                    {/* Global Tags Section */}
                    <div className="mb-3">
                        <div className="flex items-center gap-1.5 px-1.5 py-1 mb-1">
                            <Folder className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Global Tags</span>
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500">({globalTags.length})</span>
                        </div>
                        {renderTagTree(undefined)}
                    </div>

                    {/* Book-Specific Tags Section */}
                    {booksWithTags.length > 0 && (
                        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 mt-2">
                            <button
                                onClick={() => setShowBookTags(!showBookTags)}
                                className="flex items-center justify-between w-full px-1.5 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Book className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Book-Specific Tags</span>
                                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500">({booksWithTags.length} books)</span>
                                </div>
                                {showBookTags ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                                ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                                )}
                            </button>

                            {showBookTags && (
                                <div className="mt-1 space-y-0.5">
                                    {booksWithTags.map(bookId => {
                                        const book = getBook(bookId);
                                        const bookTagList = tagsByBook[bookId];
                                        const isExpanded = expandedBooks.has(bookId);

                                        if (!book) return null;

                                        return (
                                            <div key={bookId} className="ml-2">
                                                <button
                                                    onClick={() => toggleBookExpansion(bookId)}
                                                    className="flex items-center gap-1.5 w-full px-1.5 py-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-2.5 h-2.5 text-zinc-400 dark:text-zinc-500" />
                                                    ) : (
                                                        <ChevronRight className="w-2.5 h-2.5 text-zinc-400 dark:text-zinc-500" />
                                                    )}
                                                    <Book className="w-3 h-3 text-amber-500 shrink-0" />
                                                    <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate flex-1 text-left">
                                                        {book.title}
                                                    </span>
                                                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
                                                        ({bookTagList.length})
                                                    </span>
                                                </button>

                                                {isExpanded && (
                                                    <div className="ml-3 mt-0.5">
                                                        {bookTagList.map(tag => (
                                                            <div key={tag.id} className="group">
                                                                {renderBookTag(tag)}
                                                            </div>
                                                        ))}

                                                        {/* Add new chapter tag input */}
                                                        <div className="flex items-center gap-1 px-1.5 py-0.5 mt-1">
                                                            <Input
                                                                placeholder="New chapter tag..."
                                                                value={newChapterTagName[bookId] || ''}
                                                                onChange={(e) => setNewChapterTagName(prev => ({
                                                                    ...prev,
                                                                    [bookId]: e.target.value
                                                                }))}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleCreateChapterTag(bookId);
                                                                }}
                                                                className="h-5 text-xs flex-1"
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-5 w-5"
                                                                onClick={() => handleCreateChapterTag(bookId)}
                                                            >
                                                                <Plus className="w-2.5 h-2.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="pt-1 mt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col gap-1">
                        {selectedParentId && (
                            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950 px-1.5 py-0.5 rounded">
                                <span>Adding child to: <strong>{tags.find(t => t.id === selectedParentId)?.name}</strong></span>
                                <button onClick={() => setSelectedParentId(undefined)} className="hover:text-zinc-900 dark:hover:text-zinc-100">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <div className="flex gap-1">
                            <Input
                                placeholder={selectedParentId ? "New child tag name..." : "New root tag name..."}
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                                className="h-7 text-xs"
                            />
                            <Button onClick={handleCreateTag} className="h-7 text-xs px-3">Add</Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
