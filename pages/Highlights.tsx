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
    if (selectedIds.size === filteredHighlights.length) {
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

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Highlights</h1>
        <p className="text-zinc-500 mt-2 font-light">
          Manage and organize your collection of {highlights.length} highlights.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-md border border-zinc-200 sticky top-0 z-10 shadow-sm">
        <div className="flex gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search text or notes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
            />
          </div>
          <div className="relative w-48 hidden md:block">
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-zinc-50 border border-zinc-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm appearance-none truncate"
            >
              <option value="all">All Books</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>
        </div>
        
        {/* Bulk Actions Indicator */}
        {selectedIds.size > 0 && (
           <div className="flex items-center gap-4 animate-fade-in bg-zinc-900 text-white px-4 py-1.5 rounded-sm shadow-md w-full md:w-auto justify-between">
             <span className="text-sm font-medium">{selectedIds.size} selected</span>
             <button 
               onClick={handleBulkDelete}
               className="flex items-center gap-2 text-xs hover:text-zinc-300 transition-colors"
             >
               <Trash2 className="w-4 h-4" />
               Delete
             </button>
           </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {/* Table Header like row */}
        <div className="flex items-center px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <div className="w-8">
            <input 
              type="checkbox" 
              className="accent-black"
              checked={selectedIds.size > 0 && selectedIds.size === filteredHighlights.length}
              onChange={toggleAll}
            />
          </div>
          <div className="flex-1">Content</div>
          <div className="w-32 hidden md:block text-right">Actions</div>
        </div>

        {filteredHighlights.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-zinc-300 rounded-md">
            <p className="text-zinc-400">No highlights match your filters.</p>
          </div>
        ) : (
          filteredHighlights.map(highlight => {
            const book = books.find(b => b.id === highlight.bookId);
            const isEditing = editingId === highlight.id;
            const isSelected = selectedIds.has(highlight.id);

            return (
              <div 
                key={highlight.id} 
                className={`
                  group bg-white border rounded-md p-6 transition-all hover:shadow-md
                  ${isSelected ? 'border-black ring-1 ring-black' : 'border-zinc-200'}
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="pt-1.5">
                    <input 
                      type="checkbox" 
                      className="accent-black w-4 h-4 cursor-pointer"
                      checked={isSelected}
                      onChange={() => toggleSelection(highlight.id)}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Book Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <Book className="w-3 h-3 text-zinc-400" />
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        {book?.title || 'Unknown Book'}
                      </span>
                      <span className="text-zinc-300 text-xs">•</span>
                      <span className="text-xs text-zinc-400">
                        Page {highlight.location}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <textarea
                          value={editForm.text}
                          onChange={(e) => setEditForm(prev => ({ ...prev, text: e.target.value }))}
                          className="w-full p-3 border border-zinc-300 rounded-sm focus:ring-1 focus:ring-black focus:border-black outline-none text-zinc-900 font-serif"
                          rows={3}
                        />
                        <input 
                          type="text"
                          placeholder="Add a note..."
                          value={editForm.note}
                          onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                          className="w-full p-3 border border-zinc-300 rounded-sm focus:ring-1 focus:ring-black focus:border-black outline-none text-sm text-zinc-700 bg-zinc-50 italic"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={saveEdit}
                            className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-sm hover:bg-zinc-800"
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                          <button 
                            onClick={cancelEdit}
                            className="flex items-center gap-1 px-3 py-1.5 border border-zinc-300 text-zinc-700 text-xs font-medium rounded-sm hover:bg-zinc-50"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <blockquote className="text-zinc-900 text-lg font-serif leading-relaxed">
                          "{highlight.text}"
                        </blockquote>
                        {highlight.note && (
                          <div className="bg-zinc-50 border-l-2 border-zinc-300 pl-3 py-2 text-sm text-zinc-700 italic">
                            <span className="font-semibold text-zinc-900 not-italic text-xs uppercase mr-2">Note</span>
                            {highlight.note}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions (Desktop) */}
                  {!isEditing && (
                    <div className="hidden md:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEditing(highlight)}
                        className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-sm transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm('Delete this highlight?')) deleteHighlight(highlight.id);
                        }}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Highlights;