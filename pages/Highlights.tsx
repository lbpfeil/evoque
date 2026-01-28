import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../components/StoreContext';
import { Search, Tag as TagIcon, ChevronUp, ChevronDown, ChevronsUpDown, Book, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { SortOption, Highlight } from '../types';
import HighlightEditModal from '../components/HighlightEditModal';
import HighlightHistoryModal from '../components/HighlightHistoryModal';
import { TagManagerSidebar } from '../components/TagManagerSidebar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { cn } from '../lib/utils';
import { HighlightTableRow } from '../components/HighlightTableRow';
import { PageHeader } from '../components/patterns/PageHeader';
import { Button } from '../components/ui/button';

export const Highlights = () => {
  const { t } = useTranslation('highlights');
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

  // Pagination State
  const pageLimit = 50;
  const [currentPage, setCurrentPage] = useState(1);

  // Local state for selection & editing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Highlight edit modal
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);

  // Stats modal
  const [statsHighlightId, setStatsHighlightId] = useState<string | null>(null);

  // Tag Manager Sidebar
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  // Ref for table container to scroll to top
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top when page changes
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set()); // Also clear selection on filter change to avoid confusion
  }, [searchTerm, selectedBookId, selectedTagId, studyFilter]);

  // Reset tag filter when book filter changes if the selected tag is not valid anymore
  useEffect(() => {
    if (selectedTagId !== 'all') {
      const selectedTag = tags.find(t => t.id === selectedTagId);
      if (selectedTag?.bookId) {
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
    if (!date) return t('dates.never');
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedHighlights.length / pageLimit);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageLimit;
    return filteredAndSortedHighlights.slice(startIndex, startIndex + pageLimit);
  }, [filteredAndSortedHighlights, currentPage, pageLimit]);

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
    if (selectedIds.size === currentItems.length && currentItems.length > 0) {
      // Deselect all on current page
      const newSet = new Set(selectedIds);
      currentItems.forEach(h => newSet.delete(h.id));
      setSelectedIds(newSet);
    } else {
      // Select all on current page
      const newSet = new Set(selectedIds);
      currentItems.forEach(h => newSet.add(h.id));
      setSelectedIds(newSet);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(t('bulk.deleteConfirm', { count: selectedIds.size }))) {
      await bulkDeleteHighlights(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  // Sort handler
  const handleSort = (column: 'book' | 'highlight' | 'note' | 'date') => {
    setSortConfig(prev => {
      if (prev.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        return { column, direction: 'desc' };
      }
    });
  };

  // Sort icon helper
  const getSortIcon = (column: 'book' | 'highlight' | 'note' | 'date') => {
    if (sortConfig.column !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 ml-xxs" /> : <ChevronDown className="w-3 h-3 ml-xxs" />;
  };

  return (
    <div className="space-y-md relative h-full flex flex-col w-full px-md sm:px-lg">
      {/* Header */}
      <PageHeader
        title={t('title')}
        description={t('stats.summary', { highlightCount: highlights.length, bookCount: stats.uniqueBooks, lastDate: formatDate(stats.lastHighlight) })}
        size="compact"
        className="pt-lg pb-xs"
        actions={
          <Button
            onClick={() => setIsTagManagerOpen(true)}
            variant="ghost"
            size="compact"
            className="flex items-center gap-xs rounded-full"
          >
            <TagIcon className="w-3.5 h-3.5" />
            {t('actions.manageTags')}
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-background py-xs -mx-xs px-xs border-b border-transparent">
        <div className="flex flex-wrap items-center gap-xs bg-card p-xs rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md">

          {/* Bulk Actions (Conditional) */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-xs animate-in fade-in slide-in-from-left-2 duration-200 mr-xs bg-foreground text-background px-sm py-xs rounded-lg shadow-md">
              <span className="text-caption font-semibold whitespace-nowrap">{t('bulk.selected', { count: selectedIds.size })}</span>
              <div className="h-4 w-[1px] bg-background/20 mx-xxs" />

              {/* Bulk Tag Trigger */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="compact" className="text-overline uppercase tracking-wider font-bold flex items-center gap-xxs">
                    <TagIcon className="w-3 h-3" /> {t('bulk.tag')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <div className="max-h-[300px] overflow-y-auto p-xxs">
                    <div className="px-xs py-xs text-caption font-medium text-muted-foreground border-b border-border mb-xxs">
                      {t('bulk.assignTo', { count: selectedIds.size })}
                    </div>
                    {(() => {
                      const availableTagsForBulk = selectedBookId === 'all'
                        ? tags.filter(tg => !tg.bookId)
                        : tags.filter(tg => !tg.bookId || tg.bookId === selectedBookId);

                      const sortedBulkTags = availableTagsForBulk.sort((a, b) => a.name.localeCompare(b.name));

                      if (sortedBulkTags.length === 0) return <div className="px-xs text-caption italic text-muted-foreground">{t('bulk.noTags')}</div>;

                      return sortedBulkTags.map(tag => (
                        <div key={tag.id} onClick={() => bulkAssignTag(Array.from(selectedIds), tag.id)} className="cursor-pointer hover:bg-accent px-xs py-xs rounded text-caption flex items-center gap-xs transition-colors duration-200">
                          {tag.bookId ? <Book className="w-3 h-3 text-tag-book" /> : <TagIcon className="w-3 h-3 text-muted-foreground" />}
                          <span>{tag.name}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="h-4 w-[1px] bg-background/20 mx-xxs" />

              <Button onClick={handleBulkDelete} variant="ghost" size="compact" className="text-overline uppercase tracking-wider font-bold flex items-center gap-xxs hover:text-destructive">
                {t('bulk.delete')}
              </Button>
            </div>
          )}

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-sm top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-sm py-xs bg-background border border-input rounded-lg text-body transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>

          {/* Book Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button role="combobox" variant="outline" size="compact" className="w-full sm:w-auto min-w-[160px] max-w-[240px] justify-between">
                <span className="truncate font-medium text-foreground">
                  {selectedBookId === 'all' ? t('filters.allBooks') : books.find(b => b.id === selectedBookId)?.title}
                </span>
                <ChevronsUpDown className="ml-xs h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder={t('filters.searchBooks')} className="h-9" />
                <CommandList>
                  <CommandEmpty>{t('filters.noBookFound')}</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => setSelectedBookId('all')}
                      className="data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto cursor-pointer"
                    >
                      <Check className={cn("mr-xs h-4 w-4", selectedBookId === 'all' ? "opacity-100" : "opacity-0")} />
                      {t('filters.allBooks')}
                    </CommandItem>
                    {sortedBooks.map(book => (
                      <CommandItem
                        key={book.id}
                        value={book.title}
                        onSelect={() => setSelectedBookId(book.id)}
                        className="data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto cursor-pointer"
                      >
                        <Check className={cn("mr-xs h-4 w-4", selectedBookId === book.id ? "opacity-100" : "opacity-0")} />
                        <span className="truncate">{book.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Tag Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button role="combobox" variant="outline" size="compact" className="w-full sm:w-auto min-w-[140px] justify-between">
                <span className="truncate font-medium text-foreground">
                  {selectedTagId === 'all' ? t('filters.allTags') : tags.find(tg => tg.id === selectedTagId)?.name}
                </span>
                <ChevronsUpDown className="ml-xs h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder={t('filters.searchTags')} className="h-9" />
                <CommandList>
                  <CommandEmpty>{t('filters.noTagFound')}</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => setSelectedTagId('all')}
                      className="data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto cursor-pointer"
                    >
                      <Check className={cn("mr-xs h-4 w-4", selectedTagId === 'all' ? "opacity-100" : "opacity-0")} />
                      {t('filters.allTags')}
                    </CommandItem>
                    {/* Simple Tag List for Filter (Flattened or Recursive - simplified here for brevity, usually recursive) */}
                    {(() => {
                      // Reuse the recursive render logic or similar flattening
                      const visibleTags = tags.filter(tg => selectedBookId === 'all' ? !tg.bookId : (!tg.bookId || tg.bookId === selectedBookId));
                      return visibleTags.sort((a, b) => a.name.localeCompare(b.name)).map(tag => (
                        <CommandItem
                          key={tag.id}
                          value={tag.name}
                          onSelect={() => setSelectedTagId(tag.id)}
                          className="data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto cursor-pointer"
                        >
                          <Check className={cn("mr-xs h-4 w-4", selectedTagId === tag.id ? "opacity-100" : "opacity-0")} />
                          {tag.bookId && <Book className="w-3 h-3 mr-xxs text-tag-book" />}
                          <span className={tag.bookId ? "text-tag-book" : ""}>{tag.name}</span>
                        </CommandItem>
                      ));
                    })()}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button role="combobox" variant="outline" size="compact" className="w-full sm:w-auto min-w-[120px] justify-between">
                <span className="truncate font-medium text-foreground">
                  {studyFilter === 'all' ? t('filters.allStatus') : studyFilter === 'in-study' ? t('filters.inStudy') : t('filters.notInStudy')}
                </span>
                <ChevronsUpDown className="ml-xs h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[150px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => setStudyFilter('all')}
                      className="data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto cursor-pointer"
                    >
                      <Check className={cn("mr-xs h-4 w-4", studyFilter === 'all' ? "opacity-100" : "opacity-0")} /> {t('filters.allStatus')}
                    </CommandItem>
                    <CommandItem
                      value="in-study"
                      onSelect={() => setStudyFilter('in-study')}
                      className="data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto cursor-pointer"
                    >
                      <Check className={cn("mr-xs h-4 w-4", studyFilter === 'in-study' ? "opacity-100" : "opacity-0")} /> {t('filters.inStudy')}
                    </CommandItem>
                    <CommandItem
                      value="not-in-study"
                      onSelect={() => setStudyFilter('not-in-study')}
                      className="data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto cursor-pointer"
                    >
                      <Check className={cn("mr-xs h-4 w-4", studyFilter === 'not-in-study' ? "opacity-100" : "opacity-0")} /> {t('filters.notInStudy')}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Sorting Dropdown (Optional or kept as buttons if preferred) */}
          <Button
            onClick={() => handleSort('date')}
            variant="outline"
            size="compact"
            className="flex items-center gap-xxs"
          >
            {t('filters.sortDate')} {getSortIcon('date') || <ChevronDown className="w-3 h-3 ml-xxs opacity-30" />}
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto border border-border rounded-xl bg-card shadow-sm"
      >
        <table className="w-full text-left text-caption">
          <thead className="bg-muted text-overline uppercase tracking-wider font-semibold text-muted-foreground sticky top-0 z-10 border-b border-border">
            <tr>
              <th className="px-md py-sm w-[40px] font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  className="appearance-none w-4 h-4 rounded border border-input checked:bg-primary checked:border-primary transition-colors duration-200 cursor-pointer relative top-1"
                  checked={currentItems.length > 0 && selectedIds.size >= currentItems.length && currentItems.every(i => selectedIds.has(i.id))}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-md py-sm w-[180px] max-w-[200px]">
                <Button
                  onClick={() => handleSort('book')}
                  variant="ghost"
                  size="compact"
                  className="flex items-center gap-xxs h-auto p-0 hover:text-foreground"
                >
                  {t('table.bookAuthor')}
                  {getSortIcon('book')}
                </Button>
              </th>
              <th className="px-md py-sm min-w-[300px]">
                <Button
                  onClick={() => handleSort('highlight')}
                  variant="ghost"
                  size="compact"
                  className="flex items-center gap-xxs h-auto p-0 hover:text-foreground"
                >
                  {t('table.highlight')}
                  {getSortIcon('highlight')}
                </Button>
              </th>
              <th className="px-md py-sm w-[280px]">
                <Button
                  onClick={() => handleSort('note')}
                  variant="ghost"
                  size="compact"
                  className="flex items-center gap-xxs h-auto p-0 hover:text-foreground"
                >
                  {t('table.note')}
                  {getSortIcon('note')}
                </Button>
              </th>
              <th className="px-md py-sm w-[140px]">{t('table.tags')}</th>
              <th className="px-md py-sm w-[80px]">
                <Button
                  onClick={() => handleSort('date')}
                  variant="ghost"
                  size="compact"
                  className="flex items-center gap-xxs h-auto p-0 hover:text-foreground"
                >
                  {t('table.date')}
                  {getSortIcon('date')}
                </Button>
              </th>
              <th className="px-md py-sm w-[90px]">{t('table.status')}</th>
            </tr>
          </thead>
          <tbody
            key={currentPage}
            className="divide-y divide-border animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-md py-2xl text-center text-muted-foreground italic">
                  {t('emptyState.noResults')}
                </td>
              </tr>
            ) : (
              currentItems.map(highlight => (
                <HighlightTableRow
                  key={highlight.id}
                  highlight={highlight}
                  book={books.find(b => b.id === highlight.bookId)}
                  isSelected={selectedIds.has(highlight.id)}
                  onToggleSelection={toggleSelection}
                  onEdit={(id) => setEditingHighlightId(id)}
                  studyStatus={getHighlightStudyStatus(highlight.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredAndSortedHighlights.length > 0 && (
        <div className="py-md flex flex-col sm:flex-row items-center justify-between gap-md border-t border-border">
          <div className="text-body text-muted-foreground">
            {t('pagination.page', { current: currentPage, total: totalPages })}
          </div>

          <div className="flex items-center gap-xs">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="compact"
              className="flex items-center gap-xxs"
            >
              <ChevronLeft className="w-4 h-4" /> {t('pagination.previous')}
            </Button>
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="compact"
              className="flex items-center gap-xxs"
            >
              {t('pagination.next')} <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Highlight Edit Modal */}
      <HighlightEditModal highlightId={editingHighlightId} onClose={() => setEditingHighlightId(null)} />
      <HighlightHistoryModal highlightId={statsHighlightId} onClose={() => setStatsHighlightId(null)} />

      {/* Tag Manager Sidebar */}
      <TagManagerSidebar open={isTagManagerOpen} onOpenChange={setIsTagManagerOpen} />
    </div>
  );
};

export default Highlights;