import * as pdfjsLib from 'pdfjs-dist';
import { Book, Highlight } from '../types';
import { generateDeterministicUUID, generateHighlightID } from './idUtils';

// Configure worker - use the worker from node_modules for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;



/**
 * Extract text content from PDF file
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};


// Portuguese month abbreviations → JS month index (0-based)
const PORTUGUESE_MONTHS: Record<string, number> = {
  'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
  'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11,
};

/**
 * Parse Portuguese date string like "11 de jan. de 2026" to ISO string
 */
const parsePortugueseDate = (dateStr: string): string => {
  const match = dateStr.match(/(\d{1,2})\s+de\s+(\w+)\.?\s+de\s+(\d{4})/);
  if (!match) return new Date().toISOString();
  const day = parseInt(match[1]);
  const monthKey = match[2].toLowerCase().substring(0, 3);
  const year = parseInt(match[3]);
  const month = PORTUGUESE_MONTHS[monthKey] ?? 0;
  return new Date(year, month, day).toISOString();
};

/**
 * Clean text extracted between tokens — remove PDF page number artifacts
 */
const cleanExtractedText = (text: string): string => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^\d+\s+/, '').trim();   // Leading page numbers
  cleaned = cleaned.replace(/\s+\d+\s*$/, '').trim(); // Trailing page numbers
  return cleaned;
};


/**
 * Parse NEW Amazon Kindle PDF format (2025+)
 * Headers: "Página X | Destaque (Color)" with separate "Nota:" blocks and dates
 */
const parseNewFormatHighlights = (
  text: string,
  userId: string,
  title: string,
  author: string,
  bookId: string
): Highlight[] => {
  const highlights: Highlight[] = [];

  // Token types for sequential parsing
  type TokenType = 'highlight' | 'continuation' | 'note' | 'date';
  interface Token {
    type: TokenType;
    page?: number;
    dateStr?: string;
    index: number;
    endIndex: number;
  }

  // Collect all tokens with their positions in the text
  const tokens: Token[] = [];
  let m: RegExpExecArray | null;

  const highlightRe = /Página\s+(\d+)\s+\|\s+Destaque\s+\([^)]+\)/gi;
  while ((m = highlightRe.exec(text)) !== null) {
    tokens.push({ type: 'highlight', page: parseInt(m[1]), index: m.index, endIndex: m.index + m[0].length });
  }

  const contRe = /Página\s+(\d+)\s+\|\s+Continuação do destaque/gi;
  while ((m = contRe.exec(text)) !== null) {
    tokens.push({ type: 'continuation', page: parseInt(m[1]), index: m.index, endIndex: m.index + m[0].length });
  }

  const noteRe = /\bNota:\s*/g;
  while ((m = noteRe.exec(text)) !== null) {
    tokens.push({ type: 'note', index: m.index, endIndex: m.index + m[0].length });
  }

  const dateRe = /\d{1,2}\s+de\s+\w+\.?\s+de\s+\d{4}/g;
  while ((m = dateRe.exec(text)) !== null) {
    tokens.push({ type: 'date', dateStr: m[0], index: m.index, endIndex: m.index + m[0].length });
  }

  // Sort by position in text
  tokens.sort((a, b) => a.index - b.index);

  // State machine to build highlights from token stream
  let current: { text: string; page: number; dateAdded: string; notes: string[] } | null = null;
  type State = 'idle' | 'highlight_text' | 'continuation_text' | 'note_text';
  let state: State = 'idle';

  const flush = () => {
    if (!current || !current.text) return;
    highlights.push({
      id: generateHighlightID(userId, title, author, current.text, `page-${current.page}`),
      bookId,
      text: current.text,
      location: `page-${current.page}`,
      dateAdded: current.dateAdded || new Date().toISOString(),
      note: current.notes.length > 0 ? current.notes.join('\n') : undefined,
    });
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];
    const content = cleanExtractedText(
      nextToken
        ? text.substring(token.endIndex, nextToken.index)
        : text.substring(token.endIndex)
    );

    switch (token.type) {
      case 'highlight':
        flush();
        current = { text: content, page: token.page!, dateAdded: '', notes: [] };
        state = 'highlight_text';
        break;

      case 'continuation':
        if (current && content) {
          current.text += (current.text ? ' ' : '') + content;
        }
        state = 'continuation_text';
        break;

      case 'note':
        if (current && content) {
          current.notes.push(content);
        }
        state = 'note_text';
        break;

      case 'date':
        // Capture the first date after a highlight/continuation as dateAdded
        if (current && !current.dateAdded && (state === 'highlight_text' || state === 'continuation_text')) {
          current.dateAdded = parsePortugueseDate(token.dateStr!);
        }
        // After a date, any text before the next token is junk (section headers, page numbers)
        state = 'idle';
        break;
    }
  }

  flush();

  return highlights;
};


/**
 * Parse OLD Amazon Kindle PDF format (pre-2025)
 * Headers: "Destaque (Color) e nota | Página X"
 */
const parseOldFormatHighlights = (
  text: string,
  userId: string,
  title: string,
  author: string,
  bookId: string
): Highlight[] => {
  const highlights: Highlight[] = [];

  const highlightPattern = /Destaque\s+\([^)]+\)\s+(e\s+nota\s+)?\|\s+Página\s+(\d+)\s+([^]*?)(?=Destaque\s+\([^)]+\)\s+(?:e\s+nota\s+)?\||$)/gi;

  let match;
  while ((match = highlightPattern.exec(text)) !== null) {
    const hasNote = !!match[1];
    const page = parseInt(match[2]);
    let content = match[3].trim();

    // Remove trailing "Página X" (section header for next highlight)
    content = content.replace(/\s+Página\s+\d+\s*$/, '').trim();

    // Remove PDF page numbers
    content = content.replace(/^\d+\s+/, '').trim();
    content = content.replace(/\s+\d+\s+Página/g, ' Página');
    content = content.replace(/\s+\d+\s*$/, '').trim();

    if (!content) continue;

    let highlightText = content;
    let noteText: string | undefined = undefined;

    if (hasNote) {
      const blocks = content
        .split(/\s{2,}/)
        .map(b => b.trim())
        .filter(b => b.length > 0);

      if (blocks.length >= 2) {
        highlightText = blocks[0];
        noteText = blocks.slice(1).join(' ').trim();
      } else if (blocks.length === 1) {
        const lines = content.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length >= 2) {
          highlightText = lines[0];
          noteText = lines.slice(1).join(' ').trim();
        }
      }
    }

    highlights.push({
      id: generateHighlightID(userId, title, author, highlightText, `page-${page}`),
      bookId,
      text: highlightText,
      location: `page-${page}`,
      dateAdded: new Date().toISOString(),
      note: noteText
    });
  }

  return highlights;
};


/**
 * Parse Amazon Kindle PDF highlights export
 * Supports both old format ("Destaque ... | Página X") and new format ("Página X | Destaque ...")
 * @param file - PDF file to parse
 * @param userId - User ID to include in book ID generation for multi-tenant isolation
 */
export const parsePDFKindleHighlights = async (file: File, userId: string): Promise<{ books: Book[], highlights: Highlight[] }> => {
  try {
    const text = await extractTextFromPDF(file);

    // Parse book metadata (title and author from first lines)
    const bookMetaPattern = /^(.+?)\s+por\s+(.+?)\s+Visualização/m;
    const metaMatch = text.match(bookMetaPattern);

    if (!metaMatch) {
      throw new Error('Formato de PDF inválido. Não foi possível identificar título e autor.');
    }

    // Remove PDF page numbers from title and author
    const title = metaMatch[1].trim().replace(/^\d+\s+/, '');
    const author = metaMatch[2].trim().replace(/^\d+\s+/, '');
    // Include userId in ID generation for multi-tenant isolation (prevents RLS conflicts)
    const bookId = generateDeterministicUUID(`${userId}-${title}-${author}`);

    const book: Book = {
      id: bookId,
      title,
      author,
      lastImported: new Date().toISOString(),
      highlightCount: 0,
      coverUrl: undefined
    };

    // Detect format: new format has "Página X | Destaque", old has "Destaque ... | Página X"
    const isNewFormat = /Página\s+\d+\s+\|\s+Destaque\s+\(/i.test(text);

    const highlights = isNewFormat
      ? parseNewFormatHighlights(text, userId, title, author, bookId)
      : parseOldFormatHighlights(text, userId, title, author, bookId);

    book.highlightCount = highlights.length;

    return {
      books: [book],
      highlights
    };

  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(
      error instanceof Error
        ? `Erro ao processar PDF: ${error.message}`
        : 'Erro desconhecido ao processar PDF'
    );
  }
};
