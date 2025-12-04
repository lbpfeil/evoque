import { Book, Highlight } from '../types';

interface ParsedEntry {
  title: string;
  author: string;
  content: string;
  type: 'Highlight' | 'Note' | 'Bookmark';
  location: string;
  locationStart: number;
  locationEnd: number;
  dateAdded: string;
  rawDate: string;
}

const parseLocation = (locString: string): { start: number, end: number } => {
  if (!locString) return { start: 0, end: 0 };

  // Handle "123-125" or "123"
  const parts = locString.split('-');
  const start = parseInt(parts[0], 10);
  const end = parts.length > 1 ? parseInt(parts[1], 10) : start;

  return {
    start: isNaN(start) ? 0 : start,
    end: isNaN(end) ? 0 : end
  };
};

export const parseMyClippings = (text: string): { books: Book[], highlights: Highlight[] } => {
  const entries = text.split('==========').filter((e) => e.trim().length > 0);
  const booksMap = new Map<string, Book>();
  const parsedHighlights: ParsedEntry[] = [];
  const parsedNotes: ParsedEntry[] = [];

  entries.forEach((entry) => {
    try {
      const lines = entry.trim().split('\n');
      if (lines.length < 3) return;

      // Line 1: Title (Author)
      const titleLine = lines[0].trim();
      const authorMatch = titleLine.match(/\(([^)]+)\)$/);
      const author = authorMatch ? authorMatch[1] : 'Unknown Author';
      const title = authorMatch ? titleLine.replace(authorMatch[0], '').trim() : titleLine;

      // Line 2: Metadata
      const metaLine = lines[1].trim();

      // Check type
      let type: ParsedEntry['type'] = 'Highlight';
      if (metaLine.includes('Note') || metaLine.includes('Nota')) type = 'Note';
      else if (metaLine.includes('Bookmark')) type = 'Bookmark';

      if (type === 'Bookmark') return;

      // Parse Location
      // Supports English "location" and Portuguese "posição"
      const locationMatch = metaLine.match(/(?:location|posição)\s([\d-]+)/i);
      const location = locationMatch ? locationMatch[1] : '0';
      const { start, end } = parseLocation(location);

      // Parse Date
      const dateMatch = metaLine.match(/(?:Added on|Adicionado:)\s(.+)$/i);
      let dateAdded = new Date().toISOString();
      let rawDate = '';
      if (dateMatch) {
        rawDate = dateMatch[1];
        // Attempt to parse date, fallback to now if invalid
        const parsed = Date.parse(rawDate);
        if (!isNaN(parsed)) dateAdded = new Date(parsed).toISOString();
      }

      // Content
      const content = lines.slice(3).join('\n').trim();
      if (!content) return;

      // Generate Book ID
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

      const parsedEntry: ParsedEntry = {
        title,
        author,
        content,
        type,
        location,
        locationStart: start,
        locationEnd: end,
        dateAdded,
        rawDate
      };

      if (type === 'Highlight') {
        parsedHighlights.push(parsedEntry);
      } else if (type === 'Note') {
        parsedNotes.push(parsedEntry);
      }

    } catch (err) {
      console.error('Error parsing entry:', err, entry);
      // Continue to next entry
    }
  });

  // Convert parsed highlights to domain objects and associate notes
  const finalHighlights: Highlight[] = [];

  parsedHighlights.forEach(ph => {
    const bookId = btoa(unescape(encodeURIComponent(`${ph.title}-${ph.author}`)));

    // Find associated note
    // A note is associated if it's for the same book and its location is within or close to the highlight's location
    const associatedNote = parsedNotes.find(pn => {
      const sameBook = pn.title === ph.title && pn.author === ph.author;
      if (!sameBook) return false;

      // Check if note location is within highlight range (inclusive)
      // Or if it's very close (e.g. next position)
      return pn.locationStart >= ph.locationStart && pn.locationStart <= ph.locationEnd + 1;
    });

    finalHighlights.push({
      id: crypto.randomUUID(),
      bookId,
      text: ph.content,
      location: ph.location,
      dateAdded: ph.dateAdded,
      note: associatedNote ? associatedNote.content : undefined
    });

    // Update book count
    const book = booksMap.get(bookId);
    if (book) {
      book.highlightCount++;
    }
  });

  return {
    books: Array.from(booksMap.values()),
    highlights: finalHighlights
  };
};