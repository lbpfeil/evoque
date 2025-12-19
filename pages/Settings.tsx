import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../components/StoreContext';
import { useAuth } from '../components/AuthContext';
import { Upload, Library, User, Sliders, FileText, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type TabId = 'import' | 'library' | 'account' | 'preferences';

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { books, highlights, studyCards, importData } = useStore();
  const [activeTab, setActiveTab] = useState<TabId>((searchParams.get('tab') as TabId) || 'import');

  // Import tab state
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ newBooks: number; newHighlights: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  const tabs = [
    { id: 'import' as TabId, name: 'Import', icon: Upload },
    { id: 'library' as TabId, name: 'Library', icon: Library },
    { id: 'account' as TabId, name: 'Account', icon: User },
    { id: 'preferences' as TabId, name: 'Preferences', icon: Sliders },
  ];

  // Import handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      alert('Please upload a .txt file (My Clippings.txt)');
      return;
    }

    setIsProcessing(true);
    setImportError(null);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      setTimeout(async () => {
        try {
          const res = await importData(text);
          setImportResult(res);
        } catch (err: any) {
          console.error(err);
          setImportError(err.message || "Failed to import highlights. Please check the file format.");
        } finally {
          setIsProcessing(false);
        }
      }, 800);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // No filtering needed anymore
  const filteredBooks = books;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <header className="mb-3">
        <h1 className="text-base font-semibold text-zinc-900">Settings</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage your library, import highlights, and preferences.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 mb-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-3 py-1 text-xs font-medium rounded-t transition-colors flex items-center gap-1.5
              ${activeTab === tab.id
                ? 'bg-white text-zinc-900 border-t border-x border-zinc-200 -mb-px'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }
            `}
          >
            <tab.icon className="w-3 h-3" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div className="space-y-3">
            <div>
              <h2 className="text-xs font-semibold text-zinc-600">Import Highlights</h2>
              <p className="text-[10px] text-zinc-400 mt-0.5">Upload your 'My Clippings.txt' file from Kindle</p>
            </div>

            {/* Success Notification */}
            {importResult && (
              <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-xs text-green-800">
                    Imported {importResult.newBooks} books, {importResult.newHighlights} highlights
                  </span>
                </div>
                <button 
                  onClick={() => setActiveTab('library')} 
                  className="text-xs text-green-700 hover:underline shrink-0"
                >
                  View Library →
                </button>
              </div>
            )}

            {/* Error Notification */}
            {importError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
                <strong className="font-semibold">Error: </strong>
                <span>{importError}</span>
              </div>
            )}

            {/* Drop Zone */}
            <div
              className={`
                relative border border-dashed rounded p-8 text-center transition-all
                ${dragActive ? 'border-black bg-zinc-50' : 'border-zinc-300 bg-white hover:border-zinc-400'}
                ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".txt"
                onChange={handleChange}
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-full flex items-center justify-center">
                  {isProcessing ? (
                    <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-900">
                    {isProcessing ? 'Processing highlights...' : 'Drag & drop file here'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    or <label htmlFor="file-upload" className="text-black hover:underline cursor-pointer font-medium">browse to upload</label>
                  </p>
                </div>

                {!isProcessing && (
                  <div className="flex items-center text-[10px] text-zinc-400 bg-zinc-50 px-2 py-1 rounded border border-zinc-200">
                    <FileText className="w-3 h-3 mr-1.5" />
                    My Clippings.txt
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-zinc-50 border border-zinc-200 rounded p-3 flex gap-2 items-start">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-600 space-y-1">
                <p className="font-semibold text-zinc-900">Instructions</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] leading-relaxed">
                  <li>Connect your Kindle to your computer via USB</li>
                  <li>Open the "Kindle" drive in your file explorer</li>
                  <li>Find the "documents" folder</li>
                  <li>Locate "My Clippings.txt" and upload it here</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="space-y-3">
            <div>
              <h2 className="text-xs font-semibold text-zinc-600">Book Library</h2>
              <p className="text-[10px] text-zinc-400 mt-0.5">{books.length} books in your collection</p>
            </div>

            {/* Books List */}
            {filteredBooks.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 rounded border border-dashed border-zinc-300">
                <p className="text-xs text-zinc-400">
                  No books in library. Import highlights to get started.
                </p>
                {books.length === 0 && (
                  <button
                    onClick={() => setActiveTab('import')}
                    className="mt-2 text-xs text-black hover:underline"
                  >
                    Go to Import Tab →
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredBooks.map(book => (
                  <Link
                    key={book.id}
                    to={`/library/${book.id}`}
                    className="flex items-center gap-2 py-2 px-3 border border-zinc-200 rounded hover:bg-zinc-50 transition-colors"
                  >
                    {/* Cover thumbnail */}
                    <div className="w-10 h-14 bg-zinc-100 rounded border border-zinc-200 shrink-0 overflow-hidden">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Library className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    {/* Book info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-900 truncate">
                        {book.title.length > 100 ? `${book.title.substring(0, 100)}...` : book.title}
                      </h3>
                      <p className="text-xs text-zinc-500 truncate">{book.author} • {book.highlightCount} highlights</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Last: {formatDate(book.lastImported)}
                      </p>
                    </div>
                    
                    {/* Arrow icon */}
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-zinc-600">Account Settings</h2>
              <p className="text-[10px] text-zinc-400 mt-0.5">Manage your account and profile</p>
            </div>

            {/* Profile Information */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 mb-1.5">Profile Information</h3>
              <div className="bg-zinc-50 border border-zinc-200 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600">Email:</span>
                  <span className="text-xs font-medium text-zinc-900">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600">Plan:</span>
                  <span className="text-xs font-medium text-zinc-900">Free</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 mb-1.5">Statistics</h3>
              <div className="bg-zinc-50 border border-zinc-200 rounded p-3">
                <p className="text-xs text-zinc-600">
                  <span className="font-semibold text-zinc-900">{books.length}</span> Books •{' '}
                  <span className="font-semibold text-zinc-900">{highlights.length}</span> Highlights •{' '}
                  <span className="font-semibold text-zinc-900">{studyCards.length}</span> Study Cards
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <h3 className="text-xs font-semibold text-red-600 mb-1.5">Danger Zone</h3>
              <div className="bg-red-50 border border-red-200 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-900">Export All Data</p>
                    <p className="text-[10px] text-zinc-500">Download JSON backup</p>
                  </div>
                  <button className="h-6 px-2 text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors">
                    Export
                  </button>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-red-200">
                  <div>
                    <p className="text-xs font-medium text-red-900">Delete Account</p>
                    <p className="text-[10px] text-red-600">Permanently delete everything</p>
                  </div>
                  <button className="h-6 px-2 text-[10px] text-red-600 hover:bg-red-100 rounded transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-zinc-600">Study Preferences</h2>
              <p className="text-[10px] text-zinc-400 mt-0.5">Customize spaced repetition and study behavior</p>
            </div>

            {/* Spaced Repetition */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 mb-1.5">Spaced Repetition (SM-2)</h3>
              <div className="bg-zinc-50 border border-zinc-200 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-700">Daily Review Limit</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      defaultValue={10}
                      className="h-6 w-16 px-1.5 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <span className="text-[10px] text-zinc-400">cards/book/day</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Display & Interface */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 mb-1.5">Display & Interface</h3>
              <div className="bg-zinc-50 border border-zinc-200 rounded p-3 space-y-2">
                <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-zinc-300" />
                  Show keyboard shortcuts hints
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-zinc-300" />
                  Auto-reveal answer after 3 seconds
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button className="h-7 px-4 text-xs bg-black hover:bg-zinc-800 text-white rounded transition-colors">
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
