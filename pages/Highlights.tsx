import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../components/StoreContext';
import { Search, Filter, Trash2, ArrowUpDown, Brain, Tag as TagIcon, ChevronUp, ChevronDown, ChevronsUpDown, Book, Plus, Check } from 'lucide-react';
import { SortOption } from '../types';
import HighlightEditModal from '../components/HighlightEditModal';
import HighlightHistoryModal from '../components/HighlightHistoryModal';
import { TagSelector } from '../components/TagSelector';
import { TagManagerSidebar } from '../components/TagManagerSidebar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { cn } from '../lib/utils';

const Highlights = () => {
  const {
    highlights,
    books,
    studyCards,
    tags,
    bulkDeleteHighlights,
    bulkAssignTag,
    getHighlightStudyStatus
  } = useStore();

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('all');
  const [selectedTagId, setSelectedTagId] = useState('all');
  const [sortConfig, setSortConfig] = useState<{
    column: 'book' | 'highlight' | 'note' | 'date';
    direction: 'asc' | 'desc';
  }>({ column: 'date', direction: 'desc' });
  const [studyFilter, setStudyFilter] = useState<'all' | 'in-study' | 'not-in-study'>('all');

  // Local state for selection & editing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Highlight edit modal
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);

  // Stats modal
  const [statsHighlightId, setStatsHighlightId] = useState<string | null>(null);

  // Tag Manager Sidebar
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  // Reset tag filter when book filter changes if the selected tag is not valid anymore
  useEffect(() => {
    if (selectedTagId !== 'all') {
      const selectedTag = tags.find(t => t.id === selectedTagId);
      if (selectedTag?.bookId) {
        // If the selected tag is a chapter tag (has bookId)
        // and the book filter changed to "all" or a different book, reset tag filter
        if (selectedBookId === 'all' || selectedTag.bookId !== selectedBookId) {
          setSelectedTagId('all');
        }
      }
    }
  }, [selectedBookId, selectedTagId, tags]);

  // Calculate stats for header
  const stats = useMemo(() => {
    const uniqueBooks = new Set(highlights.map(h => h.bookId)).size;
    const lastHighlight = highlights.length > 0
      ? new Date(Math.max(...highlights.map(h => new Date(h.dateAdded).getTime())))
      : null;
    return { uniqueBooks, lastHighlight };
  }, [highlights]);

  const sortedBooks = useMemo(() => {
    return books.slice().sort((a, b) => a.title.localeCompare(b.title));
  }, [books]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'nunca';
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Helper to get all child tag IDs recursively
  const getChildTagIds = (parentId: string): string[] => {
    const children = tags.filter(t => t.parentId === parentId);
    let ids = children.map(c => c.id);
    children.forEach(c => {
      ids = [...ids, ...getChildTagIds(c.id)];
    });
    return ids;
  };

  // Filter and sort logic
  const filteredAndSortedHighlights = useMemo(() => {
    let filtered = highlights.filter(h => {
      const matchesSearch = h.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.note && h.note.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBook = selectedBookId === 'all' || h.bookId === selectedBookId;

      let matchesTag = true;
      if (selectedTagId !== 'all') {
        const targetTagIds = [selectedTagId, ...getChildTagIds(selectedTagId)];
        matchesTag = h.tags?.some(tId => targetTagIds.includes(tId)) || false;
      }

      let matchesStudy = true;
      if (studyFilter === 'in-study') {
        matchesStudy = studyCards.some(c => c.highlightId === h.id);
      } else if (studyFilter === 'not-in-study') {
        matchesStudy = !studyCards.some(c => c.highlightId === h.id);
      }

      return matchesSearch && matchesBook && matchesStudy && matchesTag;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.column) {
        case 'date':
          comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          break;
        case 'book':
          const bookA = books.find(book => book.id === a.bookId);
          const bookB = books.find(book => book.id === b.bookId);
          comparison = (bookA?.title || '').localeCompare(bookB?.title || '');
          break;
        case 'highlight':
          comparison = a.text.length - b.text.length;
          break;
        case 'note':
          const noteA = a.note || '';
          const noteB = b.note || '';
          comparison = noteA.localeCompare(noteB);
          break;
        default:
          return 0;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [highlights, searchTerm, selectedBookId, selectedTagId, sortConfig, studyFilter, books, studyCards, tags]);

  // Bulk Selection Handlers
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredAndSortedHighlights.length && filteredAndSortedHighlights.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedHighlights.map(h => h.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} highlights?`)) {
      await bulkDeleteHighlights(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  // Sort handler
  const handleSort = (column: 'book' | 'highlight' | 'note' | 'date') => {
    setSortConfig(prev => {
      if (prev.column === column) {
        // Toggle direction
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        // New column, default to desc
        return { column, direction: 'desc' };
      }
    });
  };

  // Sort icon helper
  const getSortIcon = (column: 'book' | 'highlight' | 'note' | 'date') => {
    if (sortConfig.column !== column) {
      return <ChevronsUpDown className="w-2.5 h-2.5 text-zinc-300 dark:text-zinc-600" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-2.5 h-2.5 text-zinc-600 dark:text-zinc-400" />
      : <ChevronDown className="w-2.5 h-2.5 text-zinc-600 dark:text-zinc-400" />;
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStudyBadge = (highlightId: string) => {
    const status = getHighlightStudyStatus(highlightId);

    switch (status) {
      case 'review':
        return <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[10px] font-semibold rounded-sm">Review</span>;
      case 'learning':
        return <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-semibold rounded-sm">Learning</span>;
      case 'new':
        return <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-[10px] font-semibold rounded-sm">New</span>;
      default:
        return <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 text-[10px] font-semibold rounded-sm">Not Started</span>;
    }
  };

  return (
    <div className="space-y-3 relative h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Highlights</h1>
          <p className="text-zinc-500 dark:text-zinc-500 mt-1 font-light text-sm">
            {highlights.length} {highlights.length === 1 ? 'destaque' : 'destaques'} de {stats.uniqueBooks} {stats.uniqueBooks === 1 ? 'livro' : 'livros'}, último destaque em {formatDate(stats.lastHighlight)}.
          </p>
        </div>
        <button
          onClick={() => setIsTagManagerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-xs font-medium transition-colors"
        >
          <TagIcon className="w-3.5 h-3.5" />
          Manage Tags
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Search - flex to fill available space */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>

        {/* Book Filter */}
        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <button
                role="combobox"
                className="w-48 pl-2 pr-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black focus:border-black flex items-center justify-between"
              >
                <span className="truncate">
                  {selectedBookId === 'all'
                    ? "All Books"
                    : books.find(b => b.id === selectedBookId)?.title || "All Books"}
                </span>
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search books..." className="h-9 text-xs" />
                <CommandList>
                  <CommandEmpty>No book found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      disabled={false}
                      onSelect={() => {
                        setSelectedBookId('all');
                      }}
                      className="text-xs data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3",
                          selectedBookId === 'all' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      All Books
                    </CommandItem>
                    {sortedBooks.map((book) => (
                      <CommandItem
                        key={book.id}
                        value={book.title}
                        disabled={false}
                        onSelect={() => setSelectedBookId(book.id)}
                        className="text-xs data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-3 w-3",
                            selectedBookId === book.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col truncate">
                          <span className="font-bold truncate" title={book.title}>{book.title}</span>
                          {book.author && <span className="text-zinc-500 font-normal text-[10px] truncate" title={book.author}>{book.author}</span>}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>


        {/* Tag Filter */}
        {/* Tag Filter */}
        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <button
                role="combobox"
                className="w-40 pl-2 pr-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black focus:border-black flex items-center justify-between"
              >
                <span className="truncate">
                  {selectedTagId === 'all'
                    ? "All Tags"
                    : tags.find(t => t.id === selectedTagId)?.name || "All Tags"}
                </span>
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search tags..." className="h-9 text-xs" />
                <CommandList>
                  <CommandEmpty>No tag found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      disabled={false}
                      onSelect={() => setSelectedTagId('all')}
                      className="text-xs data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3",
                          selectedTagId === 'all' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      All Tags
                    </CommandItem>
                    {(() => {
                      const renderTags = (parentId?: string, depth = 0): React.ReactNode[] => {
                        const children = tags.filter(t => {
                          const tParent = t.parentId ?? undefined;
                          const compareParent = parentId ?? undefined;
                          if (tParent !== compareParent) return false;

                          if (selectedBookId === 'all') {
                            return !t.bookId;
                          }
                          return !t.bookId || t.bookId === selectedBookId;
                        });

                        children.sort((a, b) => a.name.localeCompare(b.name));

                        return children.flatMap(tag => {
                          const prefix = depth > 0 ? (
                            <span className="text-zinc-400 mr-1" style={{ paddingLeft: `${depth * 12}px` }}>└</span>
                          ) : null;

                          return [
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              disabled={false}
                              onSelect={() => setSelectedTagId(tag.id)}
                              className="text-xs data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3 w-3",
                                  selectedTagId === tag.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {prefix}
                              {tag.bookId && <Book className="w-3 h-3 mr-1 text-amber-500" />}
                              <span className={cn("truncate", tag.bookId ? "text-amber-700 dark:text-amber-500" : "text-zinc-700 dark:text-zinc-300")}>
                                {tag.name}
                              </span>
                            </CommandItem>,
                            ...renderTags(tag.id, depth + 1)
                          ];
                        });
                      };
                      return renderTags(undefined);
                    })()}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <button
                role="combobox"
                className="w-32 pl-2 pr-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black focus:border-black flex items-center justify-between"
              >
                <span className="truncate">
                  {studyFilter === 'all'
                    ? "All Status"
                    : studyFilter === 'in-study'
                      ? "In Study"
                      : "Not in Study"}
                </span>
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[150px] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      disabled={false}
                      onSelect={() => setStudyFilter('all')}
                      className="text-xs data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3",
                          studyFilter === 'all' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      All Status
                    </CommandItem>
                    <CommandItem
                      value="in-study"
                      disabled={false}
                      onSelect={() => setStudyFilter('in-study')}
                      className="text-xs data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3",
                          studyFilter === 'in-study' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      In Study
                    </CommandItem>
                    <CommandItem
                      value="not-in-study"
                      disabled={false}
                      onSelect={() => setStudyFilter('not-in-study')}
                      className="text-xs data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3",
                          studyFilter === 'not-in-study' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Not in Study
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Bulk Actions Indicator */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 animate-fade-in bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-1 rounded shadow-md ml-auto">
            <span className="text-[10px] font-medium">{selectedIds.size} selected</span>

            <div className="h-3 w-[1px] bg-white/20 dark:bg-black/20 mx-1" />

            {/* Bulk Tag Trigger */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-1 text-[9px] hover:text-zinc-300 dark:hover:text-zinc-600 transition-colors uppercase tracking-wide font-semibold"
                >
                  <TagIcon className="w-2.5 h-2.5" />
                  Tag
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="end">
                <div className="max-h-[300px] overflow-y-auto p-1">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    Assign to {selectedIds.size} highlights
                  </div>
                  {(() => {
                    const availableTagsForBulk = selectedBookId === 'all'
                      ? tags.filter(t => !t.bookId)
                      : tags.filter(t => !t.bookId || t.bookId === selectedBookId);

                    const sortedBulkTags = availableTagsForBulk.sort((a, b) => a.name.localeCompare(b.name));

                    if (sortedBulkTags.length === 0) {
                      return <div className="px-2 py-2 text-xs text-zinc-400 italic">No tags available</div>;
                    }

                    return sortedBulkTags.map(tag => (
                      <div
                        key={tag.id}
                        onClick={() => {
                          bulkAssignTag(Array.from(selectedIds), tag.id);
                          // We don't close automatically to allow multiple tags, or we could. 
                          // User flow: usually select one. 
                          // For now, let's just do it.
                        }}
                        className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors"
                      >
                        {tag.bookId ? <Book className="w-3 h-3 text-amber-500" /> : <TagIcon className="w-3 h-3 text-zinc-400" />}
                        <span className={tag.bookId ? "text-amber-700 dark:text-amber-500" : "text-zinc-700 dark:text-zinc-300"}>
                          {tag.name}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </PopoverContent>
            </Popover>

            <div className="h-3 w-[1px] bg-white/20 dark:bg-black/20 mx-1" />

            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 text-[9px] hover:text-zinc-300 dark:hover:text-zinc-600 transition-colors uppercase tracking-wide font-semibold"
            >
              <Trash2 className="w-2.5 h-2.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 shadow-sm">
        <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-2 py-1.5 w-8">
                <input
                  type="checkbox"
                  className="accent-black w-3.5 h-3.5 cursor-pointer align-middle"
                  checked={selectedIds.size > 0 && selectedIds.size === filteredAndSortedHighlights.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-2 py-1.5 w-[15%]">
                <button
                  onClick={() => handleSort('book')}
                  className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  <span>Livro</span>
                  {getSortIcon('book')}
                </button>
              </th>
              <th className="px-2 py-1.5 w-[30%]">
                <button
                  onClick={() => handleSort('highlight')}
                  className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  <span>Destaque</span>
                  {getSortIcon('highlight')}
                </button>
              </th>
              <th className="px-2 py-1.5 w-[15%]">
                <button
                  onClick={() => handleSort('note')}
                  className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  <span>Nota</span>
                  {getSortIcon('note')}
                </button>
              </th>
              <th className="px-2 py-1.5 w-[20%]">Tags</th>
              <th className="px-2 py-1.5 w-16 whitespace-nowrap">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  <span>Data</span>
                  {getSortIcon('date')}
                </button>
              </th>
              <th className="px-2 py-1.5 w-16">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredAndSortedHighlights.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-zinc-400 dark:text-zinc-500">
                  No highlights match your filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedHighlights.map(highlight => {
                const book = books.find(b => b.id === highlight.bookId);
                const isSelected = selectedIds.has(highlight.id);
                const isInStudy = studyCards.some(c => c.highlightId === highlight.id);

                return (
                  <tr
                    key={highlight.id}
                    className={`
                      hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group
                      ${isSelected ? 'bg-zinc-50 dark:bg-zinc-800' : ''}
                    `}
                  >
                    <td className="px-2 py-1 align-top">
                      <input
                        type="checkbox"
                        className="accent-black w-3.5 h-3.5 cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleSelection(highlight.id)}
                      />
                    </td>
                    <td className="px-2 py-1 align-top max-w-[150px]">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => setEditingHighlightId(highlight.id)}
                          className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-tight text-xs text-left hover:underline"
                          title={book?.title}
                        >
                          {book?.title || 'Unknown Book'}
                        </button>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 line-clamp-1" title={book?.author}>
                          {book?.author || 'Unknown Author'}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1 align-top max-w-[300px]">
                      <div className="font-serif text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight text-xs cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-400" title={highlight.text} onClick={() => setEditingHighlightId(highlight.id)}>
                        "{highlight.text}"
                      </div>
                    </td>
                    <td className="px-2 py-1 align-top max-w-[200px]">
                      {highlight.note ? (
                        <div className="font-serif text-zinc-800 dark:text-zinc-200 text-[10px] bg-zinc-50 dark:bg-zinc-950 px-1 py-0.5 rounded border border-zinc-100 dark:border-zinc-800 leading-tight line-clamp-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" title={highlight.note} onClick={() => setEditingHighlightId(highlight.id)}>
                          {highlight.note}
                        </div>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-600 text-[9px] italic cursor-pointer hover:text-zinc-400 dark:hover:text-zinc-500" onClick={() => setEditingHighlightId(highlight.id)}>Click to add note</span>
                      )}
                    </td>
                    <td className="px-2 py-1 align-top">
                      <TagSelector highlightId={highlight.id} bookId={highlight.bookId} />
                    </td>
                    <td className="px-2 py-1 align-top whitespace-nowrap text-[9px] text-zinc-400 dark:text-zinc-500">
                      {formatDateShort(highlight.dateAdded)}
                    </td>
                    <td className="px-2 py-1 align-top">
                      {getStudyBadge(highlight.id)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Highlight Edit Modal */}
      <HighlightEditModal highlightId={editingHighlightId} onClose={() => setEditingHighlightId(null)} />
      <HighlightHistoryModal highlightId={statsHighlightId} onClose={() => setStatsHighlightId(null)} />

      {/* Tag Manager Sidebar */}
      <TagManagerSidebar open={isTagManagerOpen} onOpenChange={setIsTagManagerOpen} />
    </div >
  );
};

export default Highlights;