import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "s", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "hr",
];

export function sanitizeNotes(html: string): string;
export function sanitizeNotes(html: string | undefined): string | undefined;
export function sanitizeNotes(html: string | undefined): string | undefined {
  if (html === undefined) return undefined;
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}
