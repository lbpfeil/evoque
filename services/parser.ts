import { Book, Highlight } from '../types';

interface ParsedEntry {
  title: string;
  author: string;
  content: string;
  type: 'Highlight' | 'Note' | 'Bookmark';
  location: string;
  dateAdded: string;
}

export const parseMyClippings = (text: string): { books: Book[], highlights: Highlight[] } => {
  const entries = text.split('==========').filter((e) => e.trim().length > 0);
  const booksMap = new Map<string, Book>();
  const highlights: Highlight[] = [];

  entries.forEach((entry) => {
    const lines = entry.trim().split('\n');
    if (lines.length < 3) return;

    // Line 1: Title (Author)
    // Sometimes title and author are messed up, simple regex attempt
    const titleLine = lines[0].trim();
    const authorMatch = titleLine.match(/\(([^)]+)\)$/);
    const author = authorMatch ? authorMatch[1] : 'Unknown Author';
    const title = authorMatch ? titleLine.replace(authorMatch[0], '').trim() : titleLine;
    
    // Line 2: Metadata
    const metaLine = lines[1].trim();
    // Example: - Your Highlight on page 12 | location 123-125 | Added on Friday, December 15, 2023 10:00 AM
    
    // Check type
    let type: ParsedEntry['type'] = 'Highlight';
    if (metaLine.includes('Note')) type = 'Note';
    else if (metaLine.includes('Bookmark')) type = 'Bookmark';

    if (type === 'Bookmark') return; // Skip bookmarks for now

    const locationMatch = metaLine.match(/location\s([\d-]+)/);
    const location = locationMatch ? locationMatch[1] : 'Unknown';
    
    // Date parsing can be tricky due to locales. Storing raw string for MVP or simplified Date.
    const dateMatch = metaLine.match(/Added on\s(.+)$/);
    let dateAdded = new Date().toISOString();
    if (dateMatch) {
       // Attempt to parse date, fallback to now
       const parsed = Date.parse(dateMatch[1]);
       if (!isNaN(parsed)) dateAdded = new Date(parsed).toISOString();
    }

    // Line 4+: Content
    // Skip empty line 3
    const content = lines.slice(3).join('\n').trim();

    if (!content) return;

    // Generate Book ID based on title+author to avoid dupes
    const bookId = btoa(unescape(encodeURIComponent(`${title}-${author}`)));

    if (!booksMap.has(bookId)) {
      booksMap.set(bookId, {
        id: bookId,
        title,
        author,
        lastImported: new Date().toISOString(),
        highlightCount: 0,
        coverUrl: `https://picsum.photos/300/450?random=${Math.floor(Math.random() * 1000)}`
      });
    }

    const currentBook = booksMap.get(bookId)!;
    currentBook.highlightCount++;

    highlights.push({
      id: crypto.randomUUID(),
      bookId,
      text: content,
      location,
      dateAdded,
    });
  });

  return {
    books: Array.from(booksMap.values()),
    highlights
  };
};