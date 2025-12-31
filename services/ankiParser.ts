import { Book, Highlight } from '../types';
import { generateDeterministicUUID, generateHighlightID } from './idUtils';

// UUID Generators (same as parser.ts)


/**
 * Fix common encoding issues from Windows-1252/ISO-8859-1 to UTF-8
 */
const fixEncoding = (text: string): string => {
  // Map of common encoding issues (UTF-8 bytes displayed as Windows-1252)
  const encodingMap: Record<string, string> = {
    // Portuguese accented characters
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã£': 'ã',
    'Ã§': 'ç',
    'Ã´': 'ô',
    'Ãª': 'ê',
    'Ã¢': 'â',
    'Ã': 'à',
    'Ã¼': 'ü',
    'Ã±': 'ñ',
    'Ã­': 'í',
    'Ã£o': 'ão',
    'Ã§Ã£o': 'ção',
    'Ã§Ãµes': 'ções',

    // Uppercase
    'Ã': 'É',
    'Ã': 'Á',
    'Ãƒ': 'Ã',

    // Quotation marks and dashes
    'â€œ': '"',
    'â€': '"',
    'â€™': "'",
    'â€˜': "'",
    'â€"': '—',
    'â€"': '–',
    'â€¦': '...',

    // Common � replacement (often é, ê, ã, ç, etc.)
    '�': '',  // Will be handled by trying to detect context
  };

  let fixed = text;

  // First pass: apply known mappings
  for (const [bad, good] of Object.entries(encodingMap)) {
    fixed = fixed.replace(new RegExp(bad, 'g'), good);
  }

  // Second pass: try to infer remaining � characters from context
  // This is a heuristic - not perfect but helps
  fixed = fixed
    .replace(/n�o/g, 'não')
    .replace(/�/g, 'é')  // Most common case
    .replace(/Ã/g, 'É')
    .replace(/tamb�m/g, 'também')
    .replace(/voc�/g, 'você')
    .replace(/�/g, 'á')
    .replace(/vers�o/g, 'versão')
    .replace(/raz�o/g, 'razão')
    .replace(/decis�o/g, 'decisão')
    .replace(/rela��o/g, 'relação')
    .replace(/aten��o/g, 'atenção')
    .replace(/vis�o/g, 'visão');

  return fixed;
};

/**
 * Parse Anki TSV export file
 *
 * Format: [highlight text]\t[note]\t[book title]\t[author]
 *
 * @param text - Raw file content
 * @returns Object with books and highlights arrays
 */
export const parseAnkiTSV = (text: string): { books: Book[], highlights: Highlight[] } => {
  // Fix encoding issues first
  const fixedText = fixEncoding(text);

  const lines = fixedText.split('\n').filter(l => l.trim());
  const booksMap = new Map<string, Book>();
  const highlights: Highlight[] = [];

  lines.forEach((line, index) => {
    try {
      // Split by tab - limit to first 4 fields in case of extra tabs
      const fields = line.split('\t');

      if (fields.length < 4) {
        console.warn(`Linha ${index + 1}: esperado 4 campos, encontrado ${fields.length}. Ignorando.`);
        return;
      }

      // Extract and trim fields (take only first 4)
      const [highlightText, noteText, bookTitle, author] = fields.slice(0, 4).map(f => f.trim());

      // Validate required fields
      if (!highlightText || !bookTitle || !author) {
        console.warn(`Linha ${index + 1}: campos obrigatórios vazios (text="${highlightText}", title="${bookTitle}", author="${author}"). Ignorando.`);
        return;
      }

      // Generate deterministic Book ID
      const bookId = generateDeterministicUUID(`${bookTitle}-${author}`);

      // Create or update book in map
      if (!booksMap.has(bookId)) {
        booksMap.set(bookId, {
          id: bookId,
          title: bookTitle,
          author: author,
          lastImported: new Date().toISOString(),
          highlightCount: 0,
          coverUrl: undefined
        });
      }

      // Create highlight
      highlights.push({
        id: generateHighlightID(bookTitle, author, highlightText, `anki-${index + 1}`),
        bookId,
        text: highlightText,
        note: noteText && noteText.trim() !== '' ? noteText : undefined, // Empty string → undefined
        location: `anki-${index + 1}`, // Unique identifier
        dateAdded: new Date().toISOString(),
        importedAt: new Date().toISOString()
      });

      // Increment book highlight count
      const book = booksMap.get(bookId)!;
      book.highlightCount++;

    } catch (error) {
      console.error(`Erro ao processar linha ${index + 1}:`, error);
      console.error(`Conteúdo da linha: ${line.substring(0, 100)}...`);
    }
  });

  return {
    books: Array.from(booksMap.values()),
    highlights
  };
};
