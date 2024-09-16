export const isEdge =
  // @ts-ignore
  typeof WebSocketPair !== 'undefined' ||
  // @ts-ignore
  (typeof navigator !== 'undefined' &&
    // @ts-ignore
    navigator.userAgent === 'Cloudflare-Workers') ||
  // @ts-ignore
  (typeof EdgeRuntime !== 'undefined' &&
    // @ts-ignore
    ['edge-runtime', 'vercel'].includes(EdgeRuntime));

export const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export const isDeno =
  // @ts-ignore
  typeof Deno !== 'undefined' &&
  // @ts-ignore
  typeof Deno.version !== 'undefined' &&
  // @ts-ignore
  typeof Deno.version.deno !== 'undefined';
