/**
 * Derives a page's meta description from its markdown source. Pages under
 * docs/ carry no frontmatter (docs style contract), so the description comes
 * from the first prose paragraph instead.
 */

/** Google typically shows about this many characters of a description. */
const MAX_DESCRIPTION_CHARS = 160;
const ELLIPSIS = "…";

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const CODE_FENCE = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm;
const CUSTOM_CONTAINER = /^(:{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm;
const BLANK_LINE = /\r?\n[ \t]*\r?\n/;
/** Headings, tables, lists, quotes, raw HTML, images, and container markers. */
const NON_PROSE_START = /^(#|\||[-*+]\s|\d+\.\s|>|<|!\[|:::)/;

const INLINE_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/!\[[^\]]*\]\([^)]*\)/g, ""],
  [/\[([^\]]+)\]\([^)]*\)/g, "$1"],
  [/`([^`]+)`/g, "$1"],
  [/\*\*(.+?)\*\*/g, "$1"],
  [/\*(.+?)\*/g, "$1"],
  [/<[^>]+>/g, ""],
  [/\s+/g, " "],
];

/**
 * Returns the first prose paragraph of `markdown` as plain text, cut to
 * MAX_DESCRIPTION_CHARS at a word boundary, or null when the page has none.
 */
export function extractPageDescription(markdown: string): string | null {
  const body = markdown
    .replace(FRONTMATTER, "")
    .replace(HTML_COMMENT, "")
    .replace(CODE_FENCE, "")
    .replace(CUSTOM_CONTAINER, "");

  for (const block of body.split(BLANK_LINE)) {
    const trimmed = block.trim();
    if (!trimmed || NON_PROSE_START.test(trimmed)) continue;
    const text = toPlainText(trimmed);
    if (text) return truncateAtWord(text, MAX_DESCRIPTION_CHARS);
  }
  return null;
}

function toPlainText(markdownBlock: string): string {
  return INLINE_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    markdownBlock,
  ).trim();
}

function truncateAtWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars - ELLIPSIS.length);
  const lastSpace = cut.lastIndexOf(" ");
  const wordSafe = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return wordSafe.replace(/[\s,;:.—-]+$/, "") + ELLIPSIS;
}
