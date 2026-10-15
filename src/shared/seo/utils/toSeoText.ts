// src/shared/lib/seo/toSeoText.ts
import 'server-only';

type ToSeoTextOptions = {
  maxLen?: number; // typical: 160-200
  fallback?: string;
  preserveEmoji?: boolean; // default true
};

/**
 * Converts rich / escaped / long text into safe plain-text snippet
 * for <meta name="description">, OpenGraph, Twitter.
 */
export function toSeoText(input: unknown, opts: ToSeoTextOptions = {}): string {
  const { maxLen = 180, fallback = '', preserveEmoji = true } = opts;

  if (typeof input !== 'string') {
    return fallback;
  }

  // 1) Normalize line breaks + trim
  let s = input.replace(/\r\n?/g, '\n').trim();
  if (!s) {
    return fallback;
  }

  // 1.1) Remove custom markers @@...@@ (anything inside, non-greedy)
  // Supports multiple markers in one string.
  s = s.replace(/@@[\s\S]*?@@/g, ' ');

  // 2) Decode common JSON-style escapes if they exist in "text form"
  s = tryDecodeJsonEscapes(s);

  // 3) Decode HTML entities (&amp; &#39; &nbsp; ...)
  s = decodeHtmlEntities(s);

  // 4) Strip HTML tags (if desc contains HTML)
  s = stripHtmlTags(s);

  // 5) Normalize whitespace (incl. NBSP, thin spaces, etc.)
  s = s
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!s) {
    return fallback;
  }

  // 6) Remove control chars (keep normal unicode)
  s = s.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!s) {
    return fallback;
  }

  // 7) Optional: drop most emojis/symbols (if you want cleaner SERP)
  if (!preserveEmoji) {
    s = s
      .replace(/[\p{Extended_Pictographic}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!s) {
      return fallback;
    }
  }

  // 8) Truncate nicely
  return truncateAtWordBoundary(s, maxLen);
}

function stripHtmlTags(s: string): string {
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<br\s*\/?>/gi, ' ');
  s = s.replace(/<\/p\s*>/gi, ' ');
  return s.replace(/<[^>]+>/g, ' ');
}

function decodeHtmlEntities(s: string): string {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    ndash: '–',
    mdash: '—',
    hellip: '…',
    laquo: '«',
    raquo: '»',
  };

  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, entity) => {
    const e = String(entity);

    if (e.startsWith('#x') || e.startsWith('#X')) {
      const code = Number.parseInt(e.slice(2), 16);
      if (Number.isFinite(code) && code > 0) {
        return safeFromCodePoint(code);
      }
      return m;
    }

    if (e.startsWith('#')) {
      const code = Number.parseInt(e.slice(1), 10);
      if (Number.isFinite(code) && code > 0) {
        return safeFromCodePoint(code);
      }
      return m;
    }

    const key = e.toLowerCase();
    return named[key] ?? m;
  });
}

function safeFromCodePoint(code: number): string {
  try {
    if (code >= 0xd800 && code <= 0xdfff) {
      return '';
    }
    if (code > 0x10ffff) {
      return '';
    }
    return String.fromCodePoint(code);
  } catch {
    return '';
  }
}

function tryDecodeJsonEscapes(s: string): string {
  const looksEscaped =
    s.includes('\\u') || s.includes('\\"') || s.includes('\\\\');
  if (!looksEscaped) {
    return s;
  }

  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    const candidate = s.startsWith("'")
      ? `"${s.slice(1, -1).replace(/"/g, '\\"')}"`
      : s;

    try {
      const parsed = JSON.parse(candidate);
      return typeof parsed === 'string' ? parsed : s;
    } catch {
      return s;
    }
  }

  try {
    const parsed = JSON.parse(
      `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
    );
    return typeof parsed === 'string' ? parsed : s;
  } catch {
    return s;
  }
}

function truncateAtWordBoundary(s: string, maxLen: number): string {
  if (maxLen <= 0) {
    return '';
  }
  if (s.length <= maxLen) {
    return s;
  }

  const cut = s.slice(0, maxLen);

  const lastSpace = cut.lastIndexOf(' ');
  const lastPunct = Math.max(
    cut.lastIndexOf('.'),
    cut.lastIndexOf('!'),
    cut.lastIndexOf('?'),
    cut.lastIndexOf('…'),
  );

  const idx = Math.max(lastSpace, lastPunct);
  const trimmed = idx >= Math.floor(maxLen * 0.6) ? cut.slice(0, idx) : cut;

  return trimmed.trimEnd() + '…';
}
