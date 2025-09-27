/**
 * Utility functions for security-related operations
 */

/**
 * Sanitizes a string to prevent XSS attacks
 * @param input The string to sanitize
 * @returns A sanitized string
 */
export const sanitizeString = (input: string | null | undefined): string => {
    if (input === null || input === undefined) {
        return '';
    }

    return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Sanitizes an object's string properties recursively
 * @param obj The object to sanitize
 * @returns A sanitized copy of the object
 */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const result = { ...obj } as Record<string, unknown>;

    Object.keys(result).forEach(key => {
        const value = result[key];

        if (typeof value === 'string') {
            result[key] = sanitizeString(value);
        } else if (value && typeof value === 'object') {
            result[key] = sanitizeObject(value as Record<string, unknown>);
        }
    });

    return result as T;
};

/**
 * Validates if a string contains only safe characters
 * @param input The string to validate
 * @param pattern Optional regex pattern to use for validation
 * @returns True if the string is safe, false otherwise
 */
export const isStringSafe = (
    input: string | null | undefined,
    pattern: RegExp = /^[a-zA-Z0-9\s.,;:!?@#$%^&*()_+\-=[\]{}'"`~\\|/<>]+$/
): boolean => {
    if (input === null || input === undefined) {
        return true;
    }

    return pattern.test(String(input));
};

/**
 * Strips HTML tags from a string
 * @param input The string to strip HTML from
 * @returns A string without HTML tags
 */
export const stripHtml = (input: string | null | undefined): string => {
    if (input === null || input === undefined) {
        return '';
    }

    return String(input).replace(/<\/?[^>]+(>|$)/g, '');
};

/**
 * Sanitizes user input for use in URLs
 * @param input The string to sanitize
 * @returns A URL-safe string
 */
export const sanitizeUrlParam = (input: string | null | undefined): string => {
    if (input === null || input === undefined) {
        return '';
    }

    return encodeURIComponent(String(input));
}; 