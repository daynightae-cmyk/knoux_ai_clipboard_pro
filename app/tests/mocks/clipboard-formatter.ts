export class ContentFormatter {
  format(input: string, format = "text") {
    const content = input || "";
    const metadata: any = {
      format,
      length: content.length,
      charCount: content.length,
      wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
      language: "english",
    };
    if (format === "code") {
      metadata.language = "javascript";
      metadata.highlighted = content;
    }
    if (format === "link") {
      try {
        const url = new URL(content);
        metadata.domain = url.hostname;
        metadata.secure = url.protocol === "https:";
      } catch {}
    }
    if (/password|secret|token|api[_-]?key/i.test(content)) {
      metadata.sensitive = true;
      metadata.masked = true;
    }
    return { content, format, metadata };
  }
}
