/**
 * Content Sandbox & Sanitizer
 * Ensures copied HTML/Rich Content is safe to render in the UI.
 * Prevents XSS attacks from clipboard vectors.
 */

export class Sandbox {
  /**
   * Sanitizes HTML content by stripping scripts, event handlers, and dangerous tags.
   * Implementation uses strict string replacement to avoid DOM dependency in Backend.
   */
  public static sanitizeHTML(html: string): string {
    if (!html) return '';

    let safeHtml = html;

    // 1. Remove script tags and content
    safeHtml = safeHtml.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '');
    
    // 2. Remove iframe tags
    safeHtml = safeHtml.replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, '');
    
    // 3. Remove object/embed tags
    safeHtml = safeHtml.replace(/<object\b[^>]*>([\s\S]*?)<\/object>/gim, '');
    safeHtml = safeHtml.replace(/<embed\b[^>]*>([\s\S]*?)<\/embed>/gim, '');

    // 4. Remove event handlers (on*)
    // Catches onclick, onerror, onload, etc. inside tags
    safeHtml = safeHtml.replace(/<([^>]+?)\s+on[a-z]+\s*=[^>]*>/gim, '<$1>');

    // 5. Remove javascript: URIs in href
    safeHtml = safeHtml.replace(/href\s*=\s*["']javascript:[^"']*["']/gim, 'href="#"');

    return safeHtml;
  }

  /**
   * Sanitizes generic text input for command injection prevention
   * (If implementing CLI features later)
   */
  public static sanitizeCommandInput(input: string): string {
    // Remove shell operators
    return input.replace(/[|&;$\>\<`\\]/g, '');
  }
}
