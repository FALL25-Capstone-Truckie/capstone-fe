/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate Vietnamese phone number
 */
export const isValidVietnamesePhone = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it starts with 0 and has 10 digits
    return /^0\d{9}$/.test(cleaned);
};

/**
 * Validate password strength
 * - At least 8 characters
 * - Contains at least 1 uppercase letter
 * - Contains at least 1 lowercase letter
 * - Contains at least 1 number
 */
export const isStrongPassword = (password: string): boolean => {
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password)
    );
};

/**
 * Check if a string is empty or just whitespace
 */
export const isEmptyString = (str: string): boolean => {
    return str.trim() === '';
};

/**
 * Validate Vietnamese zip code
 */
export const isValidZipCode = (zipCode: string): boolean => {
    // Vietnamese zip codes are 6 digits
    return /^\d{6}$/.test(zipCode);
}; 