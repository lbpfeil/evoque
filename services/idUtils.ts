
/**
 * Generates a deterministic UUID based on input string.
 * Uses a simple hashing algorithm (djb2-like) to create a consistent hash,
 * then formats it as a UUID-like string.
 */
export const generateDeterministicUUID = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    // Format as UUID: 8-4-4-4-12
    // We repeat the hash to fill the length
    const fullHex = (hex + hex + hex + hex + hex).substring(0, 32);

    return `${fullHex.substring(0, 8)}-${fullHex.substring(8, 12)}-4${fullHex.substring(13, 16)}-${fullHex.substring(16, 20)}-${fullHex.substring(20, 32)}`;
};

/**
 * Generates a standard random UUID.
 * Fallback for browser compatibility.
 */
export const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Generates a deterministic ID for a highlight based on its immutable core properties.
 * 
 * @param bookTitle Title of the book
 * @param author Author of the book
 * @param content The exact text content of the highlight (from source file)
 * @param location The location string (e.g. "page 15", "loc 1024")
 */
export const generateHighlightID = (bookTitle: string, author: string, content: string, location: string): string => {
    // Normalize inputs to ensure stability
    // - Trim whitespace
    // - We DO NOT lower case content because case might matter, but for stability we could.
    // - Combining all fields with a separator
    const key = `${bookTitle.trim()}|${author.trim()}|${location.trim()}|${content.trim()}`;

    // DEBUG: Log the key to help troubleshoot why IDs might change
    console.log(`[ID GEN] Key: "${key}" -> ID: ${generateDeterministicUUID(key)}`);

    return generateDeterministicUUID(key);
};
