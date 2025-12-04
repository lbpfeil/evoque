import React, { useState, useMemo } from 'react';
import { useStore } from '../components/StoreContext';
import { Search, Filter, Trash2, Edit2, Check, X, Book } from 'lucide-react';

const Highlights = () => {
  const { highlights, books, deleteHighlight, updateHighlight, bulkDeleteHighlights } = useStore();

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('all');

  // Local state for selection & editing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ text: '', note: '' });

  // Filter logic
  const filteredHighlights = useMemo(() => {
    return highlights.filter(h => {
      const matchesSearch = h.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.note && h.note.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBook = selectedBookId === 'all' || h.bookId === selectedBookId;
      return matchesSearch && matchesBook;
    });
  }, [highlights, searchTerm, selectedBookId]);

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
    if (selectedIds.size === filteredHighlights.length && filteredHighlights.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredHighlights.map(h => h.id)));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} highlights?`)) {
      bulkDeleteHighlights(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
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

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Highlights</h1>
        <p className="text-zinc-500 mt-1 font-light text-sm">
          Manage and organize your collection of {highlights.length} highlights.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-3 rounded-md border border-zinc-200 shadow-sm">
        <div className="flex gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search text or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs"
            />
          </div>
          <div className="relative w-40 hidden md:block">
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full pl-2.5 pr-7 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs appearance-none truncate"
            >
              <option value="all">All Books</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Bulk Actions Indicator */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 animate-fade-in bg-zinc-900 text-white px-3 py-1 rounded-sm shadow-md w-full md:w-auto justify-between">
            <span className="text-xs font-medium">{selectedIds.size} selected</span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-[10px] hover:text-zinc-300 transition-colors uppercase tracking-wide font-semibold"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
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
                  checked={selectedIds.size > 0 && selectedIds.size === filteredHighlights.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-3 py-2 w-[15%]">Autor - Livro</th>
              <th className="px-3 py-2 w-[35%]">Highlight</th>
              <th className="px-3 py-2 w-[25%]">Note</th>
              <th className="px-3 py-2 w-24 whitespace-nowrap">Data</th>
              <th className="px-3 py-2 w-24 whitespace-nowrap">Importado</th>
              <th className="px-3 py-2 w-16 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredHighlights.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-zinc-400">
                  No highlights match your filters.
                </td>
              </tr>
            ) : (
              filteredHighlights.map(highlight => {
                const book = books.find(b => b.id === highlight.bookId);
                const isEditing = editingId === highlight.id;
                const isSelected = selectedIds.has(highlight.id);

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
                        <span className="font-medium text-zinc-900 line-clamp-2 leading-tight" title={book?.title}>
                          {book?.title || 'Unknown Book'}
                        </span>
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
                    <td className="px-3 py-2 align-top whitespace-nowrap text-[10px] text-zinc-400">
                      {formatDate(highlight.dateAdded)}
                    </td>
                    <td className="px-3 py-2 align-top whitespace-nowrap text-[10px] text-zinc-400">
                      {formatDate(highlight.importedAt)}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      {isEditing ? (
                        <div className="flex flex-col gap-1 items-end">
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
                        <div className="flex flex-col gap-1 items-end opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
};

export default Highlights;