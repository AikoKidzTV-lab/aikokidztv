import { z } from 'zod';

// Email Validation Schema
const emailSchema = z.string().email().refine((email) => {
  // Prevent common injection patterns
  const injectionPattern = /['";<>&]/;
  return !injectionPattern.test(email);
}, "Invalid characters in email address");

/**
 * Validates an email address against strict security rules.
 * @param {string} email - The email address to validate.
 * @returns {{success: boolean, error?: string}}
 */
export const validateEmail = (email) => {
  try {
    emailSchema.parse(email);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Validation failed" };
  }
};
