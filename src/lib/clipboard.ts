/**
 * Utility functions for clipboard operations
 */

/**
 * Safely copy text to clipboard with fallbacks
 * @param text The text to copy to clipboard
 * @returns A promise that resolves when the text is copied
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.warn('Clipboard API not available: Not in browser environment');
    return false;
  }

  // Check if the clipboard API is available
  if (!navigator.clipboard) {
    console.warn('Clipboard API not available: Using fallback method');
    
    try {
      // Fallback method using document.execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return success;
    } catch (err) {
      console.error('Failed to copy text using fallback:', err);
      return false;
    }
  }
  
  // Use the clipboard API
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}
