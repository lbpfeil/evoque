import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../components/StoreContext';
import { ArrowLeft, Calendar, Tag, BookOpen, Trash2 } from 'lucide-react';
import DeleteBookModal from '../components/DeleteBookModal';

const BookDetails = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { getBook, getBookHighlights, deleteBook } = useStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const book = getBook(bookId || '');
  const highlights = getBookHighlights(bookId || '');

  if (!book) return <div className="p-10 text-center text-zinc-500">Book not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-10 items-start border-b border-zinc-200 pb-10">
         <div className="w-32 md:w-56 flex-shrink-0 mx-auto md:mx-0 bg-zinc-100 rounded-sm border border-zinc-200 shadow-sm">
           <img src={book.coverUrl} alt={book.title} className="w-full h-auto rounded-sm grayscale opacity-95" />
         </div>

         <div className="flex-1 text-center md:text-left space-y-6">
           <div>
             <Link to="/library" className="hidden md:inline-flex items-center text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-black mb-4 transition-colors">
                <ArrowLeft className="w-3 h-3 mr-1" /> Back to Library
             </Link>
             <h1 className="text-4xl font-bold text-zinc-900 mb-2 tracking-tight">{book.title}</h1>
             <p className="text-xl text-zinc-500 font-light">{book.author}</p>
           </div>
           
           <div className="flex flex-wrap justify-center md:justify-start gap-4">
             <div className="flex items-center text-sm text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-sm border border-zinc-200">
                <Calendar className="w-4 h-4 mr-2 text-zinc-400" />
                Imported {new Date(book.lastImported).toLocaleDateString()}
             </div>
             <div className="flex items-center text-sm text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-sm border border-zinc-200">
                <Tag className="w-4 h-4 mr-2 text-zinc-400" />
                {book.highlightCount} highlights
             </div>
           </div>

           <div className="pt-2 flex gap-3">
             <button className="bg-black hover:bg-zinc-800 text-white px-8 py-3 rounded-md font-medium transition-colors inline-flex items-center shadow-lg shadow-zinc-200/50">
               <BookOpen className="w-4 h-4 mr-2" />
               Start Study Session
             </button>

             <button
               onClick={() => setShowDeleteModal(true)}
               className="bg-white hover:bg-red-50 text-red-600 border border-red-300 px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center"
             >
               <Trash2 className="w-4 h-4 mr-2" />
               Delete Book
             </button>
           </div>
         </div>
      </div>

      {/* Highlights List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-widest">Highlights</h2>
            <span className="text-xs font-mono text-zinc-400">{highlights.length} ENTRIES</span>
        </div>
        
        <div className="grid gap-6">
          {highlights.map(highlight => (
            <div key={highlight.id} className="bg-white p-8 rounded-md border border-zinc-200 hover:border-zinc-300 transition-all">
               <blockquote className="text-zinc-800 text-lg leading-relaxed mb-6 font-serif">
                 "{highlight.text}"
               </blockquote>
               {highlight.note && (
                 <div className="bg-zinc-50 p-4 rounded-sm border-l-2 border-zinc-400 text-sm text-zinc-700 mb-4 italic">
                   <span className="font-semibold text-zinc-900 not-italic block mb-1">Note:</span> 
                   {highlight.note}
                 </div>
               )}
               <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-4">
                  <span className="text-xs font-mono text-zinc-400">
                    LOC {highlight.location}
                  </span>
                  <span className="text-xs text-zinc-400">{new Date(highlight.dateAdded).toLocaleDateString()}</span>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Book Modal */}
      {showDeleteModal && (
        <DeleteBookModal
          bookId={bookId || null}
          onConfirm={async () => {
            await deleteBook(bookId || '');
            navigate('/settings?tab=library');
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default BookDetails;