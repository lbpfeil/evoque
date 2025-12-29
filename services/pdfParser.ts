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


/**
 * Parse Amazon Kindle PDF highlights export
 */
export const parsePDFKindleHighlights = async (file: File): Promise<{ books: Book[], highlights: Highlight[] }> => {
  try {
    // Extract text from PDF
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
    const bookId = generateDeterministicUUID(`${title}-${author}`);

    // Create book object
    const book: Book = {
      id: bookId,
      title,
      author,
      lastImported: new Date().toISOString(),
      highlightCount: 0,
      coverUrl: `https://picsum.photos/300/450?random=${Math.floor(Math.random() * 1000)}`
    };

    const highlights: Highlight[] = [];

    // Pattern to match highlights
    // Matches: "Destaque (cor) | Página X" or "Destaque (cor) e nota | Página X"
    // Note: The "Página X" before "Destaque" is a section header, not part of the pattern
    // It only appears for the first highlight of each page, not for subsequent highlights on the same page
    const highlightPattern = /Destaque\s+\([^)]+\)\s+(e\s+nota\s+)?\|\s+Página\s+(\d+)\s+([^]*?)(?=Destaque\s+\([^)]+\)\s+(?:e\s+nota\s+)?\||$)/gi;

    let match;
    while ((match = highlightPattern.exec(text)) !== null) {
      const hasNote = !!match[1]; // Group 1 captures "e nota " if present
      const page = parseInt(match[2]); // Group 2 is the page number
      let content = match[3].trim(); // Group 3 is the content

      // Remove trailing "Página X" (section header for next highlight)
      content = content.replace(/\s+Página\s+\d+\s*$/, '').trim();

      // Remove PDF page numbers (can appear at start, middle, or end)
      // Examples:
      // - "2 Página 89" → "Página 89" (start)
      // - "3 Some text" → "Some text" (start)
      // - "...text here 4 Página 95" → "...text here Página 95" (before "Página")
      // - "...partiu dali. 16" → "...partiu dali." (end)
      content = content.replace(/^\d+\s+/, '').trim(); // Remove leading page number
      content = content.replace(/\s+\d+\s+Página/g, ' Página'); // Remove page number before "Página"
      content = content.replace(/\s+\d+\s*$/, '').trim(); // Remove trailing page number

      if (!content) continue;

      let highlightText = content;
      let noteText: string | undefined = undefined;

      if (hasNote) {
        // When "e nota" is present:
        // - Text is separated by spacing (blank lines)
        // - First block = highlight
        // - Second block = note
        const blocks = content
          .split(/\s{2,}/)  // Split by 2 or more consecutive spaces (indicates separation)
          .map(b => b.trim())
          .filter(b => b.length > 0);

        if (blocks.length >= 2) {
          // First block = highlight
          highlightText = blocks[0];
          // Remaining blocks = note (join in case note has multiple parts)
          noteText = blocks.slice(1).join(' ').trim();
        } else if (blocks.length === 1) {
          // Edge case: only one block but has "e nota" marker
          // Try splitting by newlines as fallback
          const lines = content.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length >= 2) {
            highlightText = lines[0];
            noteText = lines.slice(1).join(' ').trim();
          }
        }
      }

      highlights.push({
        id: generateHighlightID(title, author, highlightText, `page-${page}`),
        bookId,
        text: highlightText,
        location: `page-${page}`,
        dateAdded: new Date().toISOString(),
        note: noteText
      });
    }

    // Update book highlight count
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
