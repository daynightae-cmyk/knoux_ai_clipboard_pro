export class ContentNormalizer {
  normalize(input: unknown, format = "text") {
    if (typeof input !== "string") return "";
    if (format === "rtf") {
      return input.replace(/^\{\s*(?:\\?r?tf1|tf1)\s?/i, "").replace(/\}$/, "").trim();
    }
    let value = input.replace(/\r\n?/g, "\n");
    if (format === "html") value = value.replace(/<[^>]*>/g, "");
    value = value.replace(/<[^>]*>/g, "");
    value = value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    value = value.replace(/[ \t]+/g, " ").trim();
    value = value.replace(/\n{3,}/g, "\n\n");
    return value;
  }

  detectType(input: string) {
    if (/^https?:\/\//.test(input)) return "link";
    if (/^\{\s*(?:\\?r?tf1|tf1)/i.test(input)) return "rtf";
    if (/<[a-z][\s\S]*>/i.test(input)) return "html";
    if (/function|const|let|var|=>/.test(input)) return "code";
    return "text";
  }
}
