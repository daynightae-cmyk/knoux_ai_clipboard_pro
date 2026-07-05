export class Summarizer {
  async summarize(input: string, options: { maxLength?: number; extractKeyPoints?: boolean } = {}) {
    const maxLength = options.maxLength || 160;
    const compact = input.replace(/\s+/g, " ").trim();
    const summary = compact.slice(0, maxLength);
    const keyPoints = compact
      .split(/[.!?]+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 5)
      .map((part) => part.slice(0, 99));
    return { success: true, data: { summary, keyPoints } };
  }
}

export const ContentSummarizer = Summarizer;
