import React, { useState } from 'react';
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

    // Recursive function to render tag tree
    const renderTagTree = (parentId?: string, depth = 0) => {
        const childTags = tags.filter(t => t.parentId === parentId);

        if (childTags.length === 0 && parentId) return null;

        return (
            <div className={cn("flex flex-col gap-0.5", depth > 0 && "ml-3 border-l border-zinc-200 pl-1.5")}>
                {childTags.map(tag => {
                    const book = tag.bookId ? getBook(tag.bookId) : undefined;
                    return (
                        <div key={tag.id} className="group">
                            <div className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-zinc-50 group-hover:bg-zinc-100 transition-colors">
                                <div className="flex items-center gap-1 flex-1 overflow-hidden">
                                    {tags.some(t => t.parentId === tag.id) ? (
                                        <Folder className="w-3 h-3 text-zinc-400 shrink-0" />
                                    ) : (
                                        tag.bookId ? (
                                            <Book className="w-3 h-3 text-amber-500 shrink-0" />
                                        ) : (
                                            <TagIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                                        )
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
                                        <div className="flex flex-col truncate">
                                            <span className={cn("text-xs truncate", tag.bookId ? "text-amber-700" : "text-zinc-700")}>
                                                {tag.name}
                                            </span>
                                            {book && (
                                                <span className="text-[9px] text-zinc-400 truncate">
                                                    in {book.title}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5 text-zinc-400 hover:text-zinc-900"
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

    const handleCreateTag = () => {
        if (!newTagName.trim()) return;
        addTag(newTagName.trim(), selectedParentId);
        setNewTagName('');
        setSelectedParentId(undefined); // Reset parent selection after adding
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

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader className="mb-3">
                    <SheetTitle>Manage Tags</SheetTitle>
                    <SheetDescription>
                        Organize your tags hierarchically.
                        Global tags and Book chapters are shown below.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pr-2">
                    {renderTagTree(undefined)}
                </div>

                <div className="pt-2 mt-2 border-t border-zinc-200">
                    <div className="flex flex-col gap-1.5">
                        {selectedParentId && (
                            <div className="flex items-center justify-between text-xs text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded">
                                <span>Adding child to: <strong>{tags.find(t => t.id === selectedParentId)?.name}</strong></span>
                                <button onClick={() => setSelectedParentId(undefined)} className="hover:text-zinc-900">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <div className="flex gap-1.5">
                            <Input
                                placeholder={selectedParentId ? "New child tag name..." : "New root tag name..."}
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                            />
                            <Button onClick={handleCreateTag}>Add</Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
