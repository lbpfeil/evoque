import React, { useState, useMemo } from 'react';
import { useStore } from '../components/StoreContext';
import { Search, Filter, Trash2, Edit2, Check, X, Book, ArrowUpDown, Plus, Minus, Brain, TrendingUp, Tag as TagIcon } from 'lucide-react';
import { SortOption } from '../types';
import HighlightStats from '../components/HighlightStats';
import BookContextModal from '../components/BookContextModal';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ text: '', note: '' });

  // Book context modal
  const [modalBookId, setModalBookId] = useState<string | null>(null);

  // Stats modal
  const [statsHighlightId, setStatsHighlightId] = useState<string | null>(null);

  // Tag Manager Sidebar
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

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

  // Edit Handlers
  const startEditing = (h: any) => {
    setEditingId(h.id);
    setEditForm({ text: h.text, note: h.note || '' });
  };

  const saveEdit = () => {
    if (editingId) {
      updateHighlight(editingId, { text: editForm.text, note: editForm.note });
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const formatDate = (dateString?: string) => {
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
    <div className="space-y-6 relative h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Highlights</h1>
          <p className="text-zinc-500 mt-1 font-light text-sm">
            Manage and organize your collection of {highlights.length} highlights.
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

      {/* Statistics */}
      <HighlightStats highlights={highlights} studyCards={studyCards} books={books} />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-3 rounded-md border border-zinc-200 shadow-sm">
        <div className="flex gap-3 w-full md:w-auto flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search text or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs"
            />
          </div>

          <div className="relative">
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="pl-2.5 pr-7 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs appearance-none min-w-[120px]"
            >
              <option value="all">All Books</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              className="pl-2.5 pr-7 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs appearance-none min-w-[120px]"
            >
              <option value="all">All Tags</option>
              {tags.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <TagIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-2.5 pr-7 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs appearance-none min-w-[120px]"
            >
              <option value="imported">Recently Imported</option>
              <option value="date">Highlight Date</option>
              <option value="book">Book Title</option>
              <option value="length">Text Length</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={studyFilter}
              onChange={(e) => setStudyFilter(e.target.value as any)}
              className="pl-2.5 pr-7 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs appearance-none min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="in-study">In Study</option>
              <option value="not-in-study">Not in Study</option>
            </select>
            <Brain className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Bulk Actions Indicator */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 animate-fade-in bg-zinc-900 text-white px-3 py-1 rounded-sm shadow-md w-full md:w-auto justify-between">
            <span className="text-xs font-medium">{selectedIds.size} selected</span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkAddToStudy}
                className="flex items-center gap-1.5 text-[10px] hover:text-zinc-300 transition-colors uppercase tracking-wide font-semibold"
                title="Add to Study"
              >
                <Plus className="w-3 h-3" />
                Study
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 text-[10px] hover:text-zinc-300 transition-colors uppercase tracking-wide font-semibold"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto border border-zinc-200 rounded-md bg-white shadow-sm">
        <table className="w-full text-left text-xs text-zinc-600">
          <thead className="bg-zinc-50 text-[10px] uppercase font-semibold text-zinc-500 sticky top-0 z-10 border-b border-zinc-200">
            <tr>
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  className="accent-black w-3.5 h-3.5 cursor-pointer align-middle"
                  checked={selectedIds.size > 0 && selectedIds.size === filteredAndSortedHighlights.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-3 py-2 w-[15%]">Autor - Livro</th>
              <th className="px-3 py-2 w-[25%]">Highlight</th>
              <th className="px-3 py-2 w-[15%]">Note</th>
              <th className="px-3 py-2 w-[15%]">Tags</th>
              <th className="px-3 py-2 w-20 whitespace-nowrap">Data</th>
              <th className="px-3 py-2 w-20 whitespace-nowrap">Importado</th>
              <th className="px-3 py-2 w-24">Status</th>
              <th className="px-3 py-2 w-20 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredAndSortedHighlights.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-12 text-center text-zinc-400">
                  No highlights match your filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedHighlights.map(highlight => {
                const book = books.find(b => b.id === highlight.bookId);
                const isEditing = editingId === highlight.id;
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
                    <td className="px-3 py-2 align-top">
                      <input
                        type="checkbox"
                        className="accent-black w-3.5 h-3.5 cursor-pointer mt-0.5"
                        checked={isSelected}
                        onChange={() => toggleSelection(highlight.id)}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => setModalBookId(book?.id || null)}
                          className="font-medium text-zinc-900 line-clamp-2 leading-tight text-left hover:underline"
                          title={book?.title}
                        >
                          {book?.title || 'Unknown Book'}
                        </button>
                        <span className="text-[10px] text-zinc-400 line-clamp-1" title={book?.author}>
                          {book?.author || 'Unknown Author'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      {isEditing ? (
                        <textarea
                          value={editForm.text}
                          onChange={(e) => setEditForm(prev => ({ ...prev, text: e.target.value }))}
                          className="w-full p-2 border border-zinc-300 rounded-sm focus:ring-1 focus:ring-black focus:border-black outline-none text-xs font-serif"
                          rows={4}
                        />
                      ) : (
                        <div className="font-serif text-zinc-800 line-clamp-6 leading-snug text-[13px]" title={highlight.text}>
                          "{highlight.text}"
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {isEditing ? (
                        <textarea
                          placeholder="Add a note..."
                          value={editForm.note}
                          onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                          className="w-full p-2 border border-zinc-300 rounded-sm focus:ring-1 focus:ring-black focus:border-black outline-none text-xs bg-zinc-50 italic"
                          rows={3}
                        />
                      ) : (
                        highlight.note ? (
                          <div className="text-zinc-600 italic text-xs bg-zinc-50 p-1.5 rounded border border-zinc-100 leading-tight">
                            {highlight.note}
                          </div>
                        ) : (
                          <span className="text-zinc-300 text-[10px] italic">No note</span>
                        )
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <TagSelector highlightId={highlight.id} />
                    </td>
                    <td className="px-3 py-2 align-top whitespace-nowrap text-[10px] text-zinc-400">
                      {formatDate(highlight.dateAdded)}
                    </td>
                    <td className="px-3 py-2 align-top whitespace-nowrap text-[10px] text-zinc-400">
                      {formatDate(highlight.importedAt)}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {getStudyBadge(highlight.id)}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      {isEditing ? (
                        <div className="flex flex-row gap-1 items-center justify-end">
                          <button
                            onClick={saveEdit}
                            className="p-1 bg-black text-white rounded-sm hover:bg-zinc-800"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 border border-zinc-300 text-zinc-600 rounded-sm hover:bg-zinc-100"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-row gap-1 items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {isInStudy ? (
                            <button
                              onClick={() => removeFromStudy(highlight.id)}
                              className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                              title="Remove from Study"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => addToStudy(highlight.id)}
                              className="p-1 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                              title="Add to Study"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => setStatsHighlightId(highlight.id)}
                            className="p-1 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                            title="View Stats"
                          >
                            <TrendingUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => startEditing(highlight)}
                            className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-sm transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this highlight?')) deleteHighlight(highlight.id);
                            }}
                            className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Book Context Modal */}
      <BookContextModal bookId={modalBookId} onClose={() => setModalBookId(null)} />
      <HighlightHistoryModal highlightId={statsHighlightId} onClose={() => setStatsHighlightId(null)} />

      {/* Tag Manager Sidebar */}
      <TagManagerSidebar open={isTagManagerOpen} onOpenChange={setIsTagManagerOpen} />
    </div>
  );
};

export default Highlights;