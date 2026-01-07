import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../components/StoreContext';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { Upload, Library, User, Sliders, FileText, CheckCircle, AlertCircle, Download, Trash2, Loader2, Camera, ChevronDown, ChevronUp, Settings as SettingsIcon } from 'lucide-react';
import DeleteBookModal from '../components/DeleteBookModal';
import { resizeImage } from '../lib/imageUtils';

type TabId = 'import' | 'library' | 'account' | 'preferences';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { books, highlights, studyCards, importData, settings, updateSettings, deleteBook, updateBookSettings, resetAllBooksToDefaults, updateBookCover } = useStore();
  const [activeTab, setActiveTab] = useState<TabId>((searchParams.get('tab') as TabId) || 'import');

  // Import tab state
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ newBooks: number; newHighlights: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Account tab state
  const [fullName, setFullName] = useState(settings.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingCoverId, setUploadingCoverId] = useState<string | null>(null);

  // Library tab state
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());

  // Sync with settings when they change
  useEffect(() => {
    setFullName(settings.fullName || '');
    setAvatarUrl(settings.avatarUrl || '');
  }, [settings]);

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
    if (!user) {
      setImportError('You must be logged in to import files');
      return;
    }

    const isPDF = file.name.endsWith('.pdf');
    const isTXT = file.name.endsWith('.txt');
    const isTSV = file.name.endsWith('.tsv');

    if (!isPDF && !isTXT && !isTSV) {
      alert('Please upload a .txt, .pdf, or .tsv file');
      return;
    }

    setIsProcessing(true);
    setImportError(null);
    setImportResult(null);

    try {
      if (isPDF) {
        // Dynamic import PDF parser only when needed
        const { parsePDFKindleHighlights } = await import('../services/pdfParser');
        const { books, highlights } = await parsePDFKindleHighlights(file, user.id);

        const res = await importData({ books, highlights });
        setImportResult(res);
        setIsProcessing(false);
      } else if (isTSV) {
        // Process TSV file (Anki format) with dynamic import
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          try {
            // Dynamic import Anki parser only when needed
            const { parseAnkiTSV } = await import('../services/ankiParser');
            const { books, highlights } = parseAnkiTSV(text, user!.id);
            const res = await importData({ books, highlights });
            setImportResult(res);
          } catch (err: any) {
            console.error(err);
            setImportError(err.message || "Failed to import Anki highlights. Please check the TSV format.");
          } finally {
            setIsProcessing(false);
          }
        };
        // Read as latin1 for better encoding support
        reader.readAsText(file, 'ISO-8859-1');
      } else {
        // Process TXT file with dynamic import
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          try {
            // Dynamic import TXT parser only when needed
            const { parseMyClippings } = await import('../services/parser');
            const { books, highlights } = parseMyClippings(text, user!.id);
            const res = await importData({ books, highlights });
            setImportResult(res);
          } catch (err: any) {
            console.error(err);
            setImportError(err.message || "Failed to import highlights. Please check the file format.");
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || "Failed to import highlights. Please check the file format.");
      setIsProcessing(false);
    }
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

  // Avatar upload handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      // Generate file path: userId/avatar.ext
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL with cache-busting timestamp
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add timestamp to force browser to reload image
      const avatarUrlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;

      // Save URL to user settings (without timestamp for storage)
      console.log('Saving avatar URL to settings:', data.publicUrl);
      await updateSettings({ avatarUrl: data.publicUrl });
      
      // Set local state with timestamp to force immediate reload
      setAvatarUrl(avatarUrlWithTimestamp);
      console.log('Avatar URL saved successfully');
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Failed to upload avatar: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Book cover upload handler
  const handleCoverUpload = async (bookId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingCoverId(bookId);
    try {
      console.log('Resizing image...');
      const resizedBlob = await resizeImage(file, 300, 450, 0.85);

      const filePath = `${user.id}/books/${bookId}/cover.jpg`;

      console.log('Uploading to Supabase...');
      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, resizedBlob, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

      // Add timestamp to force browser to reload image (cache-busting)
      const coverUrlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;

      console.log('Updating book cover URL...');
      await updateBookCover(bookId, coverUrlWithTimestamp);

      console.log('Book cover uploaded successfully');
    } catch (error: any) {
      console.error('Cover upload failed:', error);
      alert(`Failed to upload cover: ${error.message}`);
    } finally {
      setUploadingCoverId(null);
      e.target.value = '';
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleSaveFullName = async () => {
    if (fullName !== settings.fullName) {
      await updateSettings({ fullName });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <header className="mb-3">
        <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage your library, import highlights, and preferences.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 mb-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-3 py-1 text-xs font-medium rounded-t transition-colors flex items-center gap-1.5
              ${activeTab === tab.id
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-t border-x border-zinc-200 dark:border-zinc-800 -mb-px'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
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
              <h2 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Import Highlights</h2>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Upload 'My Clippings.txt', Kindle PDF export, or Anki TSV file</p>
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
                ${dragActive ? 'border-black bg-zinc-50 dark:bg-zinc-950' : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600'}
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
                accept=".txt,.pdf,.tsv"
                onChange={handleChange}
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center">
                  {isProcessing ? (
                    <div className="animate-spin w-5 h-5 border-2 border-black dark:border-white border-t-transparent rounded-full" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {isProcessing ? 'Processing highlights...' : 'Drag & drop file here'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    or <label htmlFor="file-upload" className="text-black dark:text-white hover:underline cursor-pointer font-medium">browse to upload</label>
                  </p>
                </div>

                {!isProcessing && (
                  <div className="flex items-center text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800">
                    <FileText className="w-3 h-3 mr-1.5" />
                    .txt, .pdf, or .tsv
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-3 flex gap-2 items-start">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Instructions</p>
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div>
                    <p className="font-medium text-zinc-800 dark:text-zinc-300">Option 1: My Clippings.txt</p>
                    <ol className="list-decimal list-inside space-y-0.5 ml-2">
                      <li>Connect your Kindle to your computer via USB</li>
                      <li>Open the "Kindle" drive in your file explorer</li>
                      <li>Find the "documents" folder</li>
                      <li>Locate "My Clippings.txt" and upload it here</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-800 dark:text-zinc-300">Option 2: PDF Export</p>
                    <ol className="list-decimal list-inside space-y-0.5 ml-2">
                      <li>On your Kindle, select a book and view highlights</li>
                      <li>Choose "Email highlights" to send them to your email</li>
                      <li>Download the PDF attachment from the email</li>
                      <li>Upload the PDF file here</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-800 dark:text-zinc-300">Option 3: Anki TSV</p>
                    <ol className="list-decimal list-inside space-y-0.5 ml-2">
                      <li>Export your Anki deck as TSV (tab-separated values)</li>
                      <li>Format: [highlight] TAB [note] TAB [book title] TAB [author]</li>
                      <li>Upload the .tsv file here</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="space-y-3">
            <div>
              <h2 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Book Library</h2>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{books.length} books in your collection</p>
            </div>

            {/* Books List */}
            {filteredBooks.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-950 rounded border border-dashed border-zinc-300 dark:border-zinc-700">
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  No books in library. Import highlights to get started.
                </p>
                {books.length === 0 && (
                  <button
                    onClick={() => setActiveTab('import')}
                    className="mt-2 text-xs text-black dark:text-white hover:underline"
                  >
                    Go to Import Tab →
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredBooks.map(book => (
                  <div key={book.id} className="relative py-2 px-3 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">
                    {/* Botão delete (canto superior direito) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookToDelete(book.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors z-10"
                      title="Delete book"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Book card content */}
                    <div className="flex items-center gap-2">
                      {/* Cover thumbnail with upload on hover */}
                      <div className="relative w-10 h-14 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-800 shrink-0 overflow-hidden group">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                            <Library className="w-4 h-4" />
                          </div>
                        )}

                        {/* Hover overlay with camera icon */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer">
                            {uploadingCoverId === book.id ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <Camera className="w-4 h-4 text-white" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleCoverUpload(book.id, e)}
                              disabled={uploadingCoverId === book.id}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Book info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {book.title.length > 100 ? `${book.title.substring(0, 100)}...` : book.title}
                        </h3>
                        <p className="text-xs text-zinc-500 truncate">{book.author} • {book.highlightCount} highlights</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          Last: {formatDate(book.lastImported)}
                        </p>
                      </div>
                    </div>

                    {/* Book Settings Collapsible */}
                    <div className="mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                      <button
                        onClick={() => {
                          setExpandedBooks(prev => {
                            const next = new Set(prev);
                            if (next.has(book.id)) {
                              next.delete(book.id);
                            } else {
                              next.add(book.id);
                            }
                            return next;
                          });
                        }}
                        className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        <SettingsIcon className="w-3 h-3" />
                        <span>Book Settings</span>
                        {expandedBooks.has(book.id) ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedBooks.has(book.id) && (
                        <div className="mt-2 bg-zinc-50 dark:bg-zinc-950 rounded p-2 space-y-2">
                          {/* Daily Review Limit */}
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-zinc-700 dark:text-zinc-300">Daily Review Limit:</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={book.settings?.dailyReviewLimit ?? ''}
                                placeholder={String(settings.maxReviewsPerDay || 10)}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                                  updateBookSettings(book.id, { dailyReviewLimit: value });
                                }}
                                className="h-6 w-16 px-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                              />
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">cards/day</span>
                            </div>
                          </div>

                          {/* Initial Ease Factor */}
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-zinc-700 dark:text-zinc-300">Initial Ease Factor:</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1.3"
                                max="3.5"
                                step="0.1"
                                value={book.settings?.initialEaseFactor ?? ''}
                                placeholder={String(settings.defaultInitialEaseFactor || 2.5)}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                                  updateBookSettings(book.id, { initialEaseFactor: value });
                                }}
                                className="h-6 w-16 px-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                              />
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">(new cards)</span>
                            </div>
                          </div>

                          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 italic">
                            Leave empty to use global defaults
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Account Settings</h2>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Manage your account and profile</p>
            </div>

            {/* Profile Photo */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Profile Photo</h3>
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-3 flex items-center gap-3">
                {/* Avatar Preview */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getUserInitials(user?.email || '')
                    )}
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center gap-1.5 h-7 px-3 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded transition-colors cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    Change Photo
                  </label>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Profile Information</h3>
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Name:</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={handleSaveFullName}
                    placeholder="Your full name"
                    className="h-6 px-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded w-48 focus:outline-none focus:ring-1 focus:ring-black bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Email:</span>
                  <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Plan:</span>
                  <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Free</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Statistics</h3>
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{books.length}</span> Books •{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{highlights.length}</span> Highlights •{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{studyCards.length}</span> Study Cards
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <h3 className="text-xs font-semibold text-red-600 mb-1.5">Danger Zone</h3>
              <div className="flex gap-2">
                <button className="flex-1 h-7 px-3 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded transition-colors border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1.5">
                  <Download className="w-3 h-3" />
                  Export Data
                </button>
                <button className="flex-1 h-7 px-3 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 text-red-600 rounded transition-colors border border-red-200 dark:border-red-800 flex items-center justify-center gap-1.5">
                  <Trash2 className="w-3 h-3" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Study Preferences</h2>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Customize spaced repetition and study behavior</p>
            </div>

            {/* Study Options */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Study Options</h3>
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-700 dark:text-zinc-300">Default Daily Review Limit</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.maxReviewsPerDay || 10}
                      onChange={(e) => updateSettings({ maxReviewsPerDay: Number(e.target.value) })}
                      className="h-6 w-16 px-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">cards/book/day</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-700 dark:text-zinc-300">Default Initial Ease Factor</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1.3"
                      max="3.5"
                      step="0.1"
                      value={settings.defaultInitialEaseFactor || 2.5}
                      onChange={(e) => updateSettings({ defaultInitialEaseFactor: Number(e.target.value) })}
                      className="h-6 w-16 px-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">(new cards)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={async () => {
                      if (confirm('Apply current global settings to all books?\n\nThis will remove custom settings from all books and use the global defaults above.')) {
                        await resetAllBooksToDefaults();
                      }
                    }}
                    className="w-full h-7 px-3 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded transition-colors flex items-center justify-center gap-1.5"
                  >
                    <SettingsIcon className="w-3 h-3" />
                    Apply Global Settings to All Books
                  </button>
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1 text-center">
                    Removes custom daily limits and ease factors from all books
                  </p>
                </div>
              </div>
            </div>

            {/* Display & Interface */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Display & Interface</h3>
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-3 space-y-2">
                <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700" />
                  Show keyboard shortcuts hints
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700" />
                  Auto-reveal answer after 3 seconds
                </label>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 italic mt-2">
                  Note: These settings are not yet functional
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Book Modal */}
      {bookToDelete && (
        <DeleteBookModal
          bookId={bookToDelete}
          onConfirm={async () => {
            await deleteBook(bookToDelete);
            setBookToDelete(null);
          }}
          onCancel={() => setBookToDelete(null)}
        />
      )}
    </div>
  );
};

export default Settings;
