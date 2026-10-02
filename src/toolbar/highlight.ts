// A small highlighter for the two formats of the panel: JSON and HTML.
// It wraps each token in a span with a class, and the CSS sets the colors.

export type Language = "json" | "html"

/**
 * Escapes a text for use in HTML.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/**
 * Returns a token in a span with a class.
 */
function token(name: string, text: string): string {
  return `<span class="token ${name}">${escapeHtml(text)}</span>`
}

// A string (and a colon after a key), a keyword, or a number
const JSON_TOKENS =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

// A tag start or end, an attribute with its value, or the end of a tag
const HTML_TOKENS = /(<\/?)([\w:-]+)|([\w:-]+)(=)("[^"]*"|'[^']*')|(\/?>)/g

/**
 * Highlights JSON.
 */
function highlightJson(code: string): string {
  let output = ""
  let last = 0
  for (const match of code.matchAll(JSON_TOKENS)) {
    output += escapeHtml(code.slice(last, match.index))
    const [text, string, colon, keyword] = match
    if (string && colon) {
      output += token("key", string) + escapeHtml(colon)
    } else if (string) {
      output += token("string", string)
    } else if (keyword) {
      output += token("keyword", keyword)
    } else {
      output += token("number", text)
    }
    last = match.index + text.length
  }
  return output + escapeHtml(code.slice(last))
}

/**
 * Highlights HTML tags and their attributes.
 */
function highlightHtml(code: string): string {
  let output = ""
  let last = 0
  for (const match of code.matchAll(HTML_TOKENS)) {
    output += escapeHtml(code.slice(last, match.index))
    const [text, open, tag, name, equals, value, close] = match
    if (tag) {
      output += token("punctuation", open) + token("tag", tag)
    } else if (name) {
      output += token("attribute", name) + token("punctuation", equals) + token("value", value)
    } else {
      output += token("punctuation", close)
    }
    last = match.index + text.length
  }
  return output + escapeHtml(code.slice(last))
}

/**
 * Returns the code as HTML with a span for each token.
 *
 * @param code - The source code.
 * @param language - "json" or "html".
 */
export function highlight(code: string, language: Language): string {
  return language === "json" ? highlightJson(code) : highlightHtml(code)
}
