import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('highlights');
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
            <div className={cn("flex flex-col gap-0.5", depth > 0 && "ml-sm border-l border-border pl-1.5")}>
                {childTags.map(tag => {
                    return (
                        <div key={tag.id} className="group">
                            <div className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-accent group-hover:bg-accent transition-colors duration-200">
                                <div className="flex items-center gap-xxs flex-1 overflow-hidden">
                                    {tags.some(t => t.parentId === tag.id) ? (
                                        <Folder className="w-3 h-3 text-muted-foreground shrink-0" />
                                    ) : (
                                        <TagIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                                    )}

                                    {editingTagId === tag.id ? (
                                        <div className="flex items-center gap-xxs flex-1">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-5 text-caption py-0 px-xxs"
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
                                        <span className="text-caption text-foreground truncate">
                                            {tag.name}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
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
                                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(tag.id)}
                                    >
                                        <Trash2 className="w-2.5 h-2.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5 text-muted-foreground hover:text-primary"
                                        onClick={() => {
                                            setSelectedParentId(tag.id);
                                            setNewTagName('');
                                        }}
                                        title={t('tagManager.addChildTag')}
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
            <div className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-accent group-hover:bg-accent transition-colors duration-200">
                <div className="flex items-center gap-xxs flex-1 overflow-hidden">
                    <TagIcon className="w-3 h-3 text-tag-book shrink-0" />

                    {editingTagId === tag.id ? (
                        <div className="flex items-center gap-xxs flex-1">
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-5 text-caption py-0 px-xxs"
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
                        <span className="text-caption text-tag-book truncate">
                            {tag.name}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
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
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
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
        const hasChildren = tags.some(tag => tag.parentId === id);
        const msg = hasChildren
            ? t('tagManager.deleteConfirmCascade')
            : t('tagManager.deleteConfirm');

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
                <SheetHeader className="mb-xs">
                    <SheetTitle className="text-heading">{t('tagManager.title')}</SheetTitle>
                    <SheetDescription className="text-caption">
                        {t('tagManager.description')}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pr-xs">
                    {/* Global Tags Section */}
                    <div className="mb-sm">
                        <div className="flex items-center gap-1.5 px-1.5 py-xxs mb-xxs">
                            <Folder className="w-3.5 h-3.5 text-primary" />
                            <span className="text-caption font-semibold text-foreground">{t('tagManager.globalTags')}</span>
                            <span className="text-overline text-muted-foreground">({globalTags.length})</span>
                        </div>
                        {renderTagTree(undefined)}
                    </div>

                    {/* Book-Specific Tags Section */}
                    {booksWithTags.length > 0 && (
                        <div className="border-t border-border pt-xs mt-xs">
                            <button
                                onClick={() => setShowBookTags(!showBookTags)}
                                className="flex items-center justify-between w-full px-1.5 py-xxs hover:bg-accent rounded transition-colors duration-200"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Book className="w-3.5 h-3.5 text-tag-book" />
                                    <span className="text-caption font-semibold text-foreground">{t('tagManager.bookTags')}</span>
                                    <span className="text-overline text-muted-foreground">({t('tagManager.booksCount', { count: booksWithTags.length })})</span>
                                </div>
                                {showBookTags ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                            </button>

                            {showBookTags && (
                                <div className="mt-xxs space-y-0.5">
                                    {booksWithTags.map(bookId => {
                                        const book = getBook(bookId);
                                        const bookTagList = tagsByBook[bookId];
                                        const isExpanded = expandedBooks.has(bookId);

                                        if (!book) return null;

                                        return (
                                            <div key={bookId} className="ml-xs">
                                                <button
                                                    onClick={() => toggleBookExpansion(bookId)}
                                                    className="flex items-center gap-1.5 w-full px-1.5 py-0.5 hover:bg-accent rounded transition-colors duration-200"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                                                    )}
                                                    <Book className="w-3 h-3 text-tag-book shrink-0" />
                                                    <span className="text-caption text-foreground truncate flex-1 text-left">
                                                        {book.title}
                                                    </span>
                                                    <span className="text-overline text-muted-foreground">
                                                        ({bookTagList.length})
                                                    </span>
                                                </button>

                                                {isExpanded && (
                                                    <div className="ml-sm mt-0.5">
                                                        {bookTagList.map(tag => (
                                                            <div key={tag.id} className="group">
                                                                {renderBookTag(tag)}
                                                            </div>
                                                        ))}

                                                        {/* Add new chapter tag input */}
                                                        <div className="flex items-center gap-xxs px-1.5 py-0.5 mt-xxs">
                                                            <Input
                                                                placeholder={t('tagManager.newChapterTag')}
                                                                value={newChapterTagName[bookId] || ''}
                                                                onChange={(e) => setNewChapterTagName(prev => ({
                                                                    ...prev,
                                                                    [bookId]: e.target.value
                                                                }))}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleCreateChapterTag(bookId);
                                                                }}
                                                                className="h-5 text-caption flex-1"
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

                <div className="pt-xxs mt-xxs border-t border-border">
                    <div className="flex flex-col gap-xxs">
                        {selectedParentId && (
                            <div className="flex items-center justify-between text-caption text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                <span>{t('tagManager.addingChildTo', { name: tags.find(tag => tag.id === selectedParentId)?.name })}</span>
                                <button onClick={() => setSelectedParentId(undefined)} className="hover:text-foreground transition-colors duration-200">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <div className="flex gap-xxs">
                            <Input
                                placeholder={selectedParentId ? t('tagManager.newChildTag') : t('tagManager.newRootTag')}
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                                className="h-7 text-caption"
                            />
                            <Button onClick={handleCreateTag} className="h-7 text-caption px-sm">{t('common:buttons.add')}</Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
