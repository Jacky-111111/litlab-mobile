import { AppConfig } from "./config";

/** Origin for `GET /shared/c/{slug}/qr.png?origin=` (no trailing slash). */
export const shareQrOrigin = AppConfig.webURL.replace(/\/$/, "");

/** Canonical web share page; same string encoded in QR as on the website. */
export function buildShareCollectionPageUrl(slug: string): string {
  const base = AppConfig.webURL.replace(/\/$/, "");
  return `${base}/shared-collection.html?slug=${encodeURIComponent(slug)}`;
}

/**
 * Parse `slug` from a share URL or custom-scheme URL with `slug` query param.
 */
export function parseShareSlugFromUrl(urlString: string): string | null {
  try {
    const u = new URL(urlString);
    const isHttps = u.protocol === "https:" || u.protocol === "http:";
    if (isHttps) {
      const pathOk =
        u.pathname === "/shared-collection.html" ||
        u.pathname.endsWith("/shared-collection.html");
      if (pathOk) {
        const slug = u.searchParams.get("slug");
        if (slug && slug.length > 0) return slug;
      }
    }
    const slug = u.searchParams.get("slug");
    if (slug && slug.length > 0) return slug;
  } catch {
    /* invalid URL */
  }
  return null;
}
