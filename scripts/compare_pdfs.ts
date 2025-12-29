
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Mock File object since we are in Node
class MockFile {
    name: string;
    buffer: Buffer;

    constructor(filePath: string) {
        this.name = path.basename(filePath);
        this.buffer = fs.readFileSync(filePath);
    }

    async arrayBuffer() {
        return this.buffer.buffer.slice(this.buffer.byteOffset, this.buffer.byteOffset + this.buffer.byteLength);
    }
}

// Minimal ID Utils copy to avoid import issues
const generateDeterministicUUID = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    const fullHex = (hex + hex + hex + hex + hex).substring(0, 32);
    return `${fullHex.substring(0, 8)}-${fullHex.substring(8, 12)}-4${fullHex.substring(13, 16)}-${fullHex.substring(16, 20)}-${fullHex.substring(20, 32)}`;
};

const generateHighlightID = (bookTitle: string, author: string, content: string, location: string): { id: string, key: string } => {
    const key = `${bookTitle.trim()}|${author.trim()}|${location.trim()}|${content.trim()}`;
    return { id: generateDeterministicUUID(key), key };
};

// Main Extraction Logic (simplified from pdfParser.ts)
const parsePDF = async (filePath: string) => {
    console.log(`\n--- Parsing: ${path.basename(filePath)} ---`);
    const file = new MockFile(filePath);
    const arrayBuffer = await file.arrayBuffer();

    // Node-specific loading
    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        disableFontFace: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
    }

    // Meta
    const bookMetaPattern = /^(.+?)\s+por\s+(.+?)\s+Visualização/m;
    const metaMatch = fullText.match(bookMetaPattern);
    if (!metaMatch) { console.log("Metadata failed"); return []; }

    const title = metaMatch[1].trim().replace(/^\d+\s+/, '');
    const author = metaMatch[2].trim().replace(/^\d+\s+/, '');

    const highlights: any[] = [];
    const highlightPattern = /Destaque\s+\([^)]+\)\s+(e\s+nota\s+)?\|\s+Página\s+(\d+)\s+([^]*?)(?=Destaque\s+\([^)]+\)\s+(?:e\s+nota\s+)?\||$)/gi;

    let match;
    while ((match = highlightPattern.exec(fullText)) !== null) {
        const page = parseInt(match[2]);
        let content = match[3].trim();
        content = content.replace(/\s+Página\s+\d+\s*$/, '').trim();
        content = content.replace(/^\d+\s+/, '').trim();
        content = content.replace(/\s+\d+\s+Página/g, ' Página');
        content = content.replace(/\s+\d+\s*$/, '').trim();

        if (content.includes("e nota")) {
            const blocks = content.split(/\s{2,}/).map(b => b.trim()).filter(b => b.length > 0);
            if (blocks.length >= 1) content = blocks[0];
        }

        const { id, key } = generateHighlightID(title, author, content, `page-${page}`);
        highlights.push({ id, key, content, page });
    }
    return highlights;
};

const run = async () => {
    const file1 = path.resolve('lbp_context/pdf-amazonkindle-hadoismilanos-1.pdf');
    const file2 = path.resolve('lbp_context/pdf-amazonkindle-hadoismilanos-2.pdf');

    const h1 = await parsePDF(file1);
    const h2 = await parsePDF(file2);

    console.log(`\n\n=== COMPARISON ===`);
    console.log(`File 1 has ${h1.length} highlights.`);
    console.log(`File 2 has ${h2.length} highlights.`);

    console.log(`\nChecking common highlights for ID mismatches...`);

    // Find highlights that seem to be "the same" by content snippet but have different IDs
    let mismatchCount = 0;

    for (const item1 of h1) {
        // Try to find counterpart in h2 by exact ID
        const matchById = h2.find(item2 => item2.id === item1.id);

        if (matchById) {
            // Perfect match
        } else {
            // ID changed. Let's see why.
            // Try to find counterpart by content (approx)
            const matchByContent = h2.find(item2 => item2.content === item1.content);

            if (matchByContent) {
                mismatchCount++;
                console.log(`\n[MISMATCH FOUND] Highlight starting with: "${item1.content.substring(0, 30)}..."`);
                console.log(`  File 1 ID Key: [${item1.key}]`);
                console.log(`  File 2 ID Key: [${matchByContent.key}]`);

                // Identify diff
                if (item1.key !== matchByContent.key) {
                    console.log("  >>> Difference: keys are NOT equal.");
                }
            }
        }
    }

    if (mismatchCount === 0) {
        console.log("\nNo ID mismatches found for identical content. The IDs seem stable.");
    } else {
        console.log(`\nFound ${mismatchCount} highlights where IDs changed despite content looking same.`);
    }
};

run().catch(console.error);
