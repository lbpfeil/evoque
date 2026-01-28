import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../components/StoreContext';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { Upload, Library, User, Sliders, FileText, CheckCircle, AlertCircle, Download, Trash2, Loader2, Camera, ChevronDown, ChevronUp, Settings as SettingsIcon } from 'lucide-react';
import DeleteBookModal from '../components/DeleteBookModal';
import { PageHeader } from '../components/patterns/PageHeader';
import { resizeImage } from '../lib/imageUtils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

type TabId = 'import' | 'library' | 'account' | 'preferences';

const Settings = () => {
  const { t } = useTranslation(['settings', 'errors']);
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
    { id: 'import' as TabId, name: t('tabs.import'), icon: Upload },
    { id: 'library' as TabId, name: t('tabs.library'), icon: Library },
    { id: 'account' as TabId, name: t('tabs.account'), icon: User },
    { id: 'preferences' as TabId, name: t('tabs.preferences'), icon: Sliders },
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
      setImportError(t('errors:import.notLoggedIn'));
      return;
    }

    const isPDF = file.name.endsWith('.pdf');
    const isTXT = file.name.endsWith('.txt');
    const isTSV = file.name.endsWith('.tsv');

    if (!isPDF && !isTXT && !isTSV) {
      alert(t('errors:import.invalidFileType'));
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
            setImportError(t('errors:import.parseError'));
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
            setImportError(t('errors:import.parseError'));
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      console.error(err);
      setImportError(t('errors:import.parseError'));
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
      alert(t('errors:validation.imageRequired'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert(t('errors:validation.fileTooLarge2MB'));
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
      alert(t('errors:upload.avatarFailed', { message: error.message }));
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
      alert(t('errors:validation.imageRequired'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(t('errors:validation.fileTooLarge5MB'));
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
      alert(t('errors:upload.coverFailed', { message: error.message }));
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
    <div className="p-lg">
      {/* Header */}
      <PageHeader title={t('title')} description={t('subtitle')} size="compact" />

      {/* Tabs */}
      <div className="flex gap-xxs border-b border-border mb-sm">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant="ghost"
            size="sm"
            className={`
              rounded-t gap-xs
              ${activeTab === tab.id
                ? 'bg-card text-card-foreground border-t border-x border-border -mb-px'
                : 'text-muted-foreground'
              }
            `}
          >
            <tab.icon className="w-3 h-3" />
            {tab.name}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div className="space-y-sm">
            <div>
              <h2 className="text-caption font-semibold text-muted-foreground">{t('import.title')}</h2>
              <p className="text-overline text-muted-foreground mt-0.5">{t('import.subtitle')}</p>
            </div>

            {/* Success Notification */}
            {importResult && (
              <div className="bg-success/10 border border-success/30 rounded p-xs flex items-center justify-between">
                <div className="flex items-center gap-xs">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span className="text-caption text-success">
                    {t('import.success', { books: importResult.newBooks, highlights: importResult.newHighlights })}
                  </span>
                </div>
                <Button
                  onClick={() => setActiveTab('library')}
                  variant="link"
                  size="sm"
                  className="text-success hover:underline shrink-0 h-auto p-0"
                >
                  {t('import.viewLibrary')}
                </Button>
              </div>
            )}

            {/* Error Notification */}
            {importError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-sm py-xs rounded text-caption">
                <strong className="font-semibold">{t('import.error')}</strong>
                <span>{importError}</span>
              </div>
            )}

            {/* Drop Zone */}
            <div
              className={`
                relative border border-dashed rounded p-xl text-center transition-all
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}
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

              <div className="flex flex-col items-center justify-center space-y-sm">
                <div className="w-12 h-12 bg-muted text-foreground border border-border rounded-full flex items-center justify-center">
                  {isProcessing ? (
                    <div className="animate-spin w-5 h-5 border-2 border-foreground border-t-transparent rounded-full" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-xxs">
                  <p className="text-body font-medium text-foreground">
                    {isProcessing ? t('import.processing') : t('import.dragDrop')}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {t('import.browseUploadPrefix')} <label htmlFor="file-upload" className="text-foreground hover:underline cursor-pointer font-medium">{t('import.browseUpload')}</label>
                  </p>
                </div>

                {!isProcessing && (
                  <div className="flex items-center text-overline text-muted-foreground bg-muted px-xs py-xxs rounded border border-border">
                    <FileText className="w-3 h-3 mr-xs" />
                    {t('import.fileTypes')}
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-muted border border-border rounded p-sm flex gap-xs items-start">
              <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-caption text-muted-foreground space-y-xxs">
                <p className="font-semibold text-foreground">{t('import.instructions.title')}</p>
                <div className="space-y-xs text-caption leading-relaxed">
                  <div>
                    <p className="font-medium text-foreground">{t('import.instructions.option1Title')}</p>
                    <ol className="list-decimal list-inside space-y-0.5 ml-xs">
                      <li>{t('import.instructions.option1Step1')}</li>
                      <li>{t('import.instructions.option1Step2')}</li>
                      <li>{t('import.instructions.option1Step3')}</li>
                      <li>{t('import.instructions.option1Step4')}</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('import.instructions.option2Title')}</p>
                    <ol className="list-decimal list-inside space-y-0.5 ml-xs">
                      <li>{t('import.instructions.option2Step1')}</li>
                      <li>{t('import.instructions.option2Step2')}</li>
                      <li>{t('import.instructions.option2Step3')}</li>
                      <li>{t('import.instructions.option2Step4')}</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('import.instructions.option3Title')}</p>
                    <ol className="list-decimal list-inside space-y-0.5 ml-xs">
                      <li>{t('import.instructions.option3Step1')}</li>
                      <li>{t('import.instructions.option3Step2')}</li>
                      <li>{t('import.instructions.option3Step3')}</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="space-y-sm">
            <div>
              <h2 className="text-caption font-semibold text-muted-foreground">{t('library.title')}</h2>
              <p className="text-overline text-muted-foreground mt-0.5">{t('library.bookCount', { count: books.length })}</p>
            </div>

            {/* Books List */}
            {filteredBooks.length === 0 ? (
              <div className="text-center py-2xl bg-muted rounded border border-dashed border-border">
                <p className="text-caption text-muted-foreground">
                  {t('library.empty')}
                </p>
                {books.length === 0 && (
                  <Button
                    onClick={() => setActiveTab('import')}
                    variant="link"
                    size="sm"
                    className="mt-xs h-auto p-0"
                  >
                    {t('library.goToImport')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-xxs">
                {filteredBooks.map(book => (
                  <div key={book.id} className="relative py-xs px-sm border border-border rounded bg-card">
                    {/* Botão delete (canto superior direito) */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookToDelete(book.id);
                      }}
                      variant="ghost"
                      size="icon"
                      className="absolute top-xs right-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
                      title={t('library.deleteBook')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>

                    {/* Book card content */}
                    <div className="flex items-center gap-xs">
                      {/* Cover thumbnail with upload on hover */}
                      <div className="relative w-10 h-14 bg-muted rounded border border-border shrink-0 overflow-hidden group">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
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
                        <h3 className="text-body font-semibold text-card-foreground truncate">
                          {book.title.length > 100 ? `${book.title.substring(0, 100)}...` : book.title}
                        </h3>
                        <p className="text-caption text-muted-foreground truncate">{book.author} • {t('library.highlightsCount', { count: book.highlightCount })}</p>
                        <p className="text-overline text-muted-foreground mt-0.5">
                          {t('library.lastImport', { date: formatDate(book.lastImported) })}
                        </p>
                      </div>
                    </div>

                    {/* Book Settings Collapsible */}
                    <div className="mt-xs border-t border-border/50 pt-xs">
                      <Button
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
                        variant="ghost"
                        size="sm"
                        className="gap-xs text-muted-foreground h-auto p-0"
                      >
                        <SettingsIcon className="w-3 h-3" />
                        <span>{t('library.bookSettings')}</span>
                        {expandedBooks.has(book.id) ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </Button>

                      {expandedBooks.has(book.id) && (
                        <div className="mt-xs bg-muted rounded p-xs space-y-xs">
                          {/* Daily Review Limit */}
                          <div className="flex items-center justify-between">
                            <label className="text-caption text-foreground">{t('library.dailyLimit')}</label>
                            <div className="flex items-center gap-xs">
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={book.settings?.dailyReviewLimit ?? ''}
                                placeholder={String(settings.maxReviewsPerDay || 10)}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                                  updateBookSettings(book.id, { dailyReviewLimit: value });
                                }}
                                className="h-6 w-16"
                              />
                              <span className="text-overline text-muted-foreground">{t('library.cardsPerDay')}</span>
                            </div>
                          </div>

                          {/* Initial Ease Factor */}
                          <div className="flex items-center justify-between">
                            <label className="text-caption text-foreground">{t('library.easeFactor')}</label>
                            <div className="flex items-center gap-xs">
                              <Input
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
                                className="h-6 w-16"
                              />
                              <span className="text-overline text-muted-foreground">{t('library.newCards')}</span>
                            </div>
                          </div>

                          <p className="text-overline text-muted-foreground italic">
                            {t('library.useDefaults')}
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
          <div className="space-y-md">
            <div>
              <h2 className="text-caption font-semibold text-muted-foreground">{t('account.title')}</h2>
              <p className="text-overline text-muted-foreground mt-0.5">{t('account.subtitle')}</p>
            </div>

            {/* Profile Photo */}
            <div>
              <h3 className="text-caption font-semibold text-card-foreground mb-xs">{t('account.photo.title')}</h3>
              <div className="bg-muted border border-border rounded p-sm flex items-center gap-sm">
                {/* Avatar Preview */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-heading overflow-hidden">
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
                    className="inline-flex items-center gap-xs h-7 px-sm text-caption bg-secondary hover:bg-accent text-secondary-foreground rounded transition-colors cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    {t('account.photo.change')}
                  </label>
                  <p className="text-overline text-muted-foreground mt-xxs">
                    {t('account.photo.hint')}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div>
              <h3 className="text-caption font-semibold text-card-foreground mb-xs">{t('account.profile.title')}</h3>
              <div className="bg-muted border border-border rounded p-sm space-y-xs">
                <div className="flex items-center justify-between">
                  <span className="text-caption text-muted-foreground">{t('account.profile.name')}</span>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={handleSaveFullName}
                    placeholder={t('account.profile.namePlaceholder')}
                    className="h-6 w-48"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-caption text-muted-foreground">{t('account.profile.email')}</span>
                  <span className="text-caption font-medium text-foreground">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-caption text-muted-foreground">{t('account.profile.plan')}</span>
                  <span className="text-caption font-medium text-foreground">{t('account.profile.freePlan')}</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-caption font-semibold text-card-foreground mb-xs">{t('account.stats.title')}</h3>
              <div className="bg-muted border border-border rounded p-sm">
                <p className="text-caption text-muted-foreground">
                  <span className="font-semibold text-foreground">{books.length}</span> {t('account.stats.books')} •{' '}
                  <span className="font-semibold text-foreground">{highlights.length}</span> {t('account.stats.highlights')} •{' '}
                  <span className="font-semibold text-foreground">{studyCards.length}</span> {t('account.stats.studyCards')}
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <h3 className="text-caption font-semibold text-destructive mb-xs">{t('account.danger.title')}</h3>
              <div className="flex gap-xs">
                <Button variant="secondary" size="sm" className="flex-1 gap-xs border border-border">
                  <Download className="w-3 h-3" />
                  {t('account.danger.export')}
                </Button>
                <Button variant="secondary" size="sm" className="flex-1 gap-xs text-destructive hover:bg-destructive/10 border border-destructive/30">
                  <Trash2 className="w-3 h-3" />
                  {t('account.danger.delete')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="space-y-md">
            <div>
              <h2 className="text-caption font-semibold text-muted-foreground">{t('preferences.title')}</h2>
              <p className="text-overline text-muted-foreground mt-0.5">{t('preferences.subtitle')}</p>
            </div>

            {/* Study Options */}
            <div>
              <h3 className="text-caption font-semibold text-card-foreground mb-xs">{t('preferences.study.title')}</h3>
              <div className="bg-muted border border-border rounded p-sm space-y-xs">
                <div className="flex items-center justify-between">
                  <label className="text-caption text-foreground">{t('preferences.study.dailyLimit')}</label>
                  <div className="flex items-center gap-xs">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.maxReviewsPerDay || 10}
                      onChange={(e) => updateSettings({ maxReviewsPerDay: Number(e.target.value) })}
                      className="h-6 w-16"
                    />
                    <span className="text-overline text-muted-foreground">{t('preferences.study.cardsPerBookDay')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-caption text-foreground">{t('preferences.study.easeFactor')}</label>
                  <div className="flex items-center gap-xs">
                    <Input
                      type="number"
                      min="1.3"
                      max="3.5"
                      step="0.1"
                      value={settings.defaultInitialEaseFactor || 2.5}
                      onChange={(e) => updateSettings({ defaultInitialEaseFactor: Number(e.target.value) })}
                      className="h-6 w-16"
                    />
                    <span className="text-overline text-muted-foreground">{t('preferences.study.newCards')}</span>
                  </div>
                </div>

                <div className="pt-xs border-t border-border">
                  <Button
                    onClick={async () => {
                      if (confirm(t('preferences.study.applyGlobalConfirm'))) {
                        await resetAllBooksToDefaults();
                      }
                    }}
                    variant="secondary"
                    size="sm"
                    className="w-full gap-xs"
                  >
                    <SettingsIcon className="w-3 h-3" />
                    {t('preferences.study.applyGlobal')}
                  </Button>
                  <p className="text-overline text-muted-foreground mt-xxs text-center">
                    {t('preferences.study.applyGlobalHint')}
                  </p>
                </div>
              </div>
            </div>

            {/* Display & Interface */}
            <div>
              <h3 className="text-caption font-semibold text-card-foreground mb-xs">{t('preferences.display.title')}</h3>
              <div className="bg-muted border border-border rounded p-sm space-y-xs">
                <label className="flex items-center gap-xs text-caption text-foreground cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-border" />
                  {t('preferences.display.keyboardHints')}
                </label>
                <label className="flex items-center gap-xs text-caption text-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-border" />
                  {t('preferences.display.autoReveal')}
                </label>
                <p className="text-caption text-muted-foreground italic mt-xs">
                  {t('preferences.display.notFunctional')}
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
