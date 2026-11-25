// Content-Security-Policy builder (pure; used by proxy.ts, unit-tested).
//
// Why not a static `script-src 'self'` header in vercel.json? The Next.js App
// Router streams its RSC payload through small inline <script> tags, which a
// plain 'self' policy blocks — the page would render but never hydrate (no
// add-to-cart, no checkout). A per-request nonce keeps the policy strict (no
// 'unsafe-inline' for scripts) while allowing exactly the scripts Next emits.
export function buildCsp(nonce: string, isDev: boolean): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? ` 'unsafe-eval'` : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src 'self'${isDev ? ' ws:' : ''}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');
}
