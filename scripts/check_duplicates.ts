
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

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

const parsePDF = async (filePath: string) => {
    console.log(`\n--- Analyzing: ${path.basename(filePath)} ---`);
    const file = new MockFile(filePath);
    const arrayBuffer = await file.arrayBuffer();

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

    const bookMetaPattern = /^(.+?)\s+por\s+(.+?)\s+Visualização/m;
    const metaMatch = fullText.match(bookMetaPattern);
    const title = metaMatch ? metaMatch[1].trim() : 'Unknown';
    const author = metaMatch ? metaMatch[2].trim() : 'Unknown';

    const highlights: any[] = [];
    const highlightPattern = /Destaque\s+\([^)]+\)\s+(e\s+nota\s+)?\|\s+Página\s+(\d+)\s+([^]*?)(?=Destaque\s+\([^)]+\)\s+(?:e\s+nota\s+)?\||$)/gi;

    let match;
    while ((match = highlightPattern.exec(fullText)) !== null) {
        const page = parseInt(match[2]);
        let content = match[3].trim();
        // Cleanup
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
    const file2 = path.resolve('lbp_context/pdf-amazonkindle-hadoismilanos-2.pdf');
    const h2 = await parsePDF(file2);

    console.log(`\nFound ${h2.length} highlights.`);

    // Check for duplicates
    const contentMap = new Map();
    const duplicates = [];

    for (const h of h2) {
        const normContent = h.content;
        if (contentMap.has(normContent)) {
            duplicates.push({ original: contentMap.get(normContent), duplicate: h });
        } else {
            contentMap.set(normContent, h);
        }
    }

    if (duplicates.length > 0) {
        console.log(`\n⚠️ FOUND INTERNAL DUPLICATES (${duplicates.length}):`);
        duplicates.forEach((d, i) => {
            console.log(`\nDuplicate #${i + 1}:`);
            console.log(`  Text: "${d.original.content.substring(0, 50)}..."`);
            console.log(`  Item A: Page ${d.original.page}, ID: ${d.original.id}`);
            console.log(`  Item B: Page ${d.duplicate.page}, ID: ${d.duplicate.id}`);
            console.log(`\n  Explanation: The file contains the same text twice on different pages (or same page).`);
            console.log(`  If you deleted "Item A", "Item B" will still be imported because it has a different ID.`);
            console.log(`  (Note: The new Text-Based blocking should prevent this IF the text is exactly same)`);
        });
    } else {
        console.log("\nNo internal duplicates found based on exact text content.");
    }

    // Also list all IDs to verify against the 'Blocked' ID from user log
    console.log("\nListing all generated IDs:");
    h2.forEach(h => console.log(` - ${h.id} (Page ${h.page})`));
};

run().catch(console.error);
