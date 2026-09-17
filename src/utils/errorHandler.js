/**
 * Standardized API Error Parser
 * Extracts readable error messages from backend responses or thrown errors.
 */

export function parseApiError(error) {
  if (!error) return "An unexpected error occurred. Please try again.";

  // If error is a string
  if (typeof error === "string") return error;

  // If error object has a response message from backend
  if (error.message) return error.message;

  if (error.error) {
    if (typeof error.error === "string") return error.error;
    if (error.error.message) return error.error.message;
  }

  // Network / Abort error checks
  if (error.name === "AbortError") {
    return "Request timed out. Please check your network connection and try again.";
  }

  return "Unable to connect to the server. Please check your internet connection.";
}
