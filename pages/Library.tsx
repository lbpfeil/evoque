import React, { useState } from 'react';
import { useStore } from '../components/StoreContext';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

const Library = () => {
  const { books } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 pb-8">
        <div>
           <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Library</h1>
           <p className="text-zinc-500 mt-2 font-light">Manage your {books.length} book collection.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by title or author..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 text-zinc-600 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-md border border-dashed border-zinc-300">
          <p className="text-zinc-400">No books found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
          {filteredBooks.map(book => (
            <Link to={`/library/${book.id}`} key={book.id} className="group flex flex-col">
              <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded-sm bg-zinc-100 border border-zinc-200">
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0 grayscale opacity-90" 
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-sm"></div>
              </div>
              <h3 className="font-bold text-zinc-900 leading-tight mb-1 group-hover:underline decoration-1 underline-offset-4">
                {book.title}
              </h3>
              <p className="text-sm text-zinc-500">{book.author}</p>
              <div className="mt-2 text-xs text-zinc-400 font-mono">
                {book.highlightCount} HIGHLIGHTS
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;