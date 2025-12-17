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

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate deterministic UUIDs for books (same book = same ID)
const generateDeterministicUUID = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.substring(0, 8)}-${hex.substring(0, 4)}-4${hex.substring(1, 4)}-${hex.substring(0, 4)}-${hex}${hex}`.substring(0, 36);
};

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

const parseDate = (dateString: string): string => {
  try {
    // Try standard parsing first
    const standardDate = Date.parse(dateString);
    if (!isNaN(standardDate)) return new Date(standardDate).toISOString();

    // Handle Portuguese format: "terça-feira, 22 de julho de 2025 02:05:09"
    // Regex to extract: day, month, year, time
    const ptRegex = /(\d{1,2})\s+de\s+([a-zç]+)\s+de\s+(\d{4})\s+(\d{2}:\d{2}:\d{2})/i;
    const match = dateString.match(ptRegex);

    if (match) {
      const day = parseInt(match[1], 10);
      const monthStr = match[2].toLowerCase();
      const year = parseInt(match[3], 10);
      const time = match[4];

      const months: { [key: string]: number } = {
        'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
        'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
      };

      if (months[monthStr] !== undefined) {
        const date = new Date(year, months[monthStr], day);
        const [hours, minutes, seconds] = time.split(':').map(Number);
        date.setHours(hours, minutes, seconds);
        return date.toISOString();
      }
    }

    return new Date().toISOString();
  } catch (e) {
    console.warn('Failed to parse date:', dateString, e);
    return new Date().toISOString();
  }
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
      if (/Note|Nota/i.test(metaLine)) type = 'Note';
      else if (/Bookmark|Marcador/i.test(metaLine)) type = 'Bookmark';

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
        dateAdded = parseDate(rawDate);
      }

      // Content
      // Skip empty lines between metadata and content
      let contentStartIndex = 2;
      while (lines[contentStartIndex] && lines[contentStartIndex].trim() === '') {
        contentStartIndex++;
      }
      const content = lines.slice(contentStartIndex).join('\n').trim();

      if (!content) return;

      // Generate Book ID (deterministic UUID)
      const bookId = generateDeterministicUUID(`${title}-${author}`);

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
    const bookId = generateDeterministicUUID(`${ph.title}-${ph.author}`);

    // Find associated note
    // A note is associated if it's for the same book and its location is within or close to the highlight's location
    const associatedNote = parsedNotes.find(pn => {
      const sameBook = pn.title === ph.title && pn.author === ph.author;
      if (!sameBook) return false;

      // Check if note location matches the end of the highlight location
      // This is a common pattern in Kindle clippings where the note is appended at the end position
      return pn.locationStart === ph.locationEnd;
    });

    finalHighlights.push({
      id: generateUUID(),
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