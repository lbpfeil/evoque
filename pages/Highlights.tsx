import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../components/StoreContext';
import { Search, Filter, Trash2, Edit2, Check, X, Book, ArrowUpDown, Plus, Minus, Brain, TrendingUp, Tag as TagIcon } from 'lucide-react';
import { SortOption } from '../types';
import HighlightEditModal from '../components/HighlightEditModal';
import HighlightHistoryModal from '../components/HighlightHistoryModal';
import { TagSelector } from '../components/TagSelector';
import { TagManagerSidebar } from '../components/TagManagerSidebar';

const Highlights = () => {
  const {
    highlights,
    books,
    studyCards,
    tags,
    deleteHighlight,
    updateHighlight,
    bulkDeleteHighlights,
    addToStudy,
    removeFromStudy,
    bulkAddToStudy,
    getHighlightStudyStatus
  } = useStore();

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('all');
  const [selectedTagId, setSelectedTagId] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('imported');
  const [studyFilter, setStudyFilter] = useState<'all' | 'in-study' | 'not-in-study'>('all');

  // Local state for selection & editing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingField, setEditingField] = useState<string | null>(null); // Format: "highlightId-text" or "highlightId-note"
  const [editForm, setEditForm] = useState({ text: '', note: '' });

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
      switch (sortBy) {
        case 'date':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'imported':
          return new Date(b.importedAt || 0).getTime() - new Date(a.importedAt || 0).getTime();
        case 'book':
          const bookA = books.find(book => book.id === a.bookId);
          const bookB = books.find(book => book.id === b.bookId);
          return (bookA?.title || '').localeCompare(bookB?.title || '');
        case 'length':
          return b.text.length - a.text.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [highlights, searchTerm, selectedBookId, selectedTagId, sortBy, studyFilter, books, studyCards, tags]);

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

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} highlights?`)) {
      bulkDeleteHighlights(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleBulkAddToStudy = () => {
    bulkAddToStudy(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  // Edit Handlers - now per-field instead of per-row
  const startEditingField = (highlightId: string, field: 'text' | 'note', currentValue: string) => {
    setEditingField(`${highlightId}-${field}`);
    setEditForm(prev => ({ ...prev, [field]: currentValue }));
  };

  const saveFieldEdit = (highlightId: string, field: 'text' | 'note') => {
    const value = editForm[field];
    updateHighlight(highlightId, { [field]: value });
    setEditingField(null);
  };

  const cancelFieldEdit = () => {
    setEditingField(null);
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
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-sm">Review</span>;
      case 'learning':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-sm">Learning</span>;
      case 'new':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-semibold rounded-sm">New</span>;
      default:
        return <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-semibold rounded-sm">Not Started</span>;
    }
  };

  return (
    <div className="space-y-3 relative h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Highlights</h1>
          <p className="text-zinc-500 mt-1 font-light text-sm">
            {highlights.length} {highlights.length === 1 ? 'destaque' : 'destaques'} de {stats.uniqueBooks} {stats.uniqueBooks === 1 ? 'livro' : 'livros'}, último destaque em {formatDate(stats.lastHighlight)}.
          </p>
        </div>
        <button
          onClick={() => setIsTagManagerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md text-xs font-medium transition-colors"
        >
          <TagIcon className="w-3.5 h-3.5" />
          Manage Tags
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-md border border-zinc-200 shadow-sm">
        {/* Search - flex to fill available space */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>

        {/* Book Filter */}
        <div className="relative">
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="w-32 pl-2 pr-6 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black truncate"
            style={{ maxWidth: '128px' }}
          >
            <option value="all">All Books</option>
            {books.map(b => (
              <option key={b.id} value={b.id} className="truncate">{b.title}</option>
            ))}
          </select>
          <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
        </div>

        {/* Tag Filter */}
        <div className="relative">
          <select
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            className="w-28 pl-2 pr-6 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black truncate"
            style={{ maxWidth: '112px' }}
          >
            <option value="all">All Tags</option>
            {(() => {
              // Flatten tags with depth for display
              const flattenTags = (parentId?: string, depth = 0): React.ReactNode[] => {
                const children = tags.filter(t => {
                  // Only include tags that match the current filter context
                  if (t.parentId !== parentId) return false;

                  // If "All Books" is selected, only show global tags (no bookId)
                  if (selectedBookId === 'all') {
                    return !t.bookId;
                  }

                  // If a specific book is selected, show:
                  // 1. Global tags (no bookId)
                  // 2. Tags specific to the selected book
                  return !t.bookId || t.bookId === selectedBookId;
                });

                // Sort: Global first, then books? Or A-Z?
                children.sort((a, b) => a.name.localeCompare(b.name));

                return children.flatMap(tag => {
                  const book = tag.bookId ? books.find(b => b.id === tag.bookId) : undefined;
                  const prefix = '\u00A0'.repeat(depth * 3) + (depth > 0 ? '└ ' : '');
                  const label = `${prefix}${tag.name}${book ? ` (${book.title})` : ''}`;

                  return [
                    <option key={tag.id} value={tag.id} className="truncate">
                      {label}
                    </option>,
                    ...flattenTags(tag.id, depth + 1)
                  ];
                });
              };

              // Show root tags (including book chapters that are roots)
              return flattenTags(undefined);
            })()}
          </select>
          <TagIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-32 pl-2 pr-6 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            style={{ maxWidth: '128px' }}
          >
            <option value="imported">Recently Imported</option>
            <option value="date">Highlight Date</option>
            <option value="book">Book Title</option>
            <option value="length">Text Length</option>
          </select>
          <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={studyFilter}
            onChange={(e) => setStudyFilter(e.target.value as any)}
            className="w-24 pl-2 pr-6 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            style={{ maxWidth: '96px' }}
          >
            <option value="all">All Status</option>
            <option value="in-study">In Study</option>
            <option value="not-in-study">Not in Study</option>
          </select>
          <Brain className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
        </div>

        {/* Bulk Actions Indicator */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 animate-fade-in bg-zinc-900 text-white px-2 py-1 rounded shadow-md ml-auto">
            <span className="text-[10px] font-medium">{selectedIds.size} selected</span>
            <div className="flex gap-1.5">
              <button
                onClick={handleBulkAddToStudy}
                className="flex items-center gap-1 text-[9px] hover:text-zinc-300 transition-colors uppercase tracking-wide font-semibold"
                title="Add to Study"
              >
                <Plus className="w-2.5 h-2.5" />
                Study
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 text-[9px] hover:text-zinc-300 transition-colors uppercase tracking-wide font-semibold"
              >
                <Trash2 className="w-2.5 h-2.5" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto border border-zinc-200 rounded-md bg-white shadow-sm">
        <table className="w-full text-left text-xs text-zinc-600">
          <thead className="bg-zinc-50 text-[9px] uppercase font-semibold text-zinc-500 sticky top-0 z-10 border-b border-zinc-200">
            <tr>
              <th className="px-2 py-1 w-8">
                <input
                  type="checkbox"
                  className="accent-black w-3.5 h-3.5 cursor-pointer align-middle"
                  checked={selectedIds.size > 0 && selectedIds.size === filteredAndSortedHighlights.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-2 py-1 w-[15%]">Autor - Livro</th>
              <th className="px-2 py-1 w-[30%]">Highlight</th>
              <th className="px-2 py-1 w-[15%]">Note</th>
              <th className="px-2 py-1 w-[20%]">Tags</th>
              <th className="px-2 py-1 w-16 whitespace-nowrap">Data</th>
              <th className="px-2 py-1 w-16">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredAndSortedHighlights.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-12 text-center text-zinc-400">
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
                      hover:bg-zinc-50 transition-colors group
                      ${isSelected ? 'bg-zinc-50' : ''}
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
                          className="font-medium text-zinc-900 line-clamp-1 leading-tight text-xs text-left hover:underline"
                          title={book?.title}
                        >
                          {book?.title || 'Unknown Book'}
                        </button>
                        <span className="text-[9px] text-zinc-400 line-clamp-1" title={book?.author}>
                          {book?.author || 'Unknown Author'}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1 align-top max-w-[300px]">
                      <div className="font-serif text-zinc-800 line-clamp-2 leading-tight text-xs cursor-pointer hover:text-zinc-600" title={highlight.text} onClick={() => setEditingHighlightId(highlight.id)}>
                        "{highlight.text}"
                      </div>
                    </td>
                    <td className="px-2 py-1 align-top max-w-[200px]">
                      {highlight.note ? (
                        <div className="font-serif text-zinc-800 text-[10px] bg-zinc-50 px-1 py-0.5 rounded border border-zinc-100 leading-tight line-clamp-2 cursor-pointer hover:bg-zinc-100" title={highlight.note} onClick={() => setEditingHighlightId(highlight.id)}>
                          {highlight.note}
                        </div>
                      ) : (
                        <span className="text-zinc-300 text-[9px] italic cursor-pointer hover:text-zinc-400" onClick={() => setEditingHighlightId(highlight.id)}>Click to add note</span>
                      )}
                    </td>
                    <td className="px-2 py-1 align-top">
                      <TagSelector highlightId={highlight.id} bookId={highlight.bookId} />
                    </td>
                    <td className="px-2 py-1 align-top whitespace-nowrap text-[9px] text-zinc-400">
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
    </div>
  );
};

export default Highlights;