/** Validate the absolute site URL; fails fast so canonical/sitemap URLs are never wrong. */
export function parseSiteUrl(
  raw: string | undefined,
  vercelEnv: string | undefined
): URL {
  const message =
    "SITE_URL must be set to the site's absolute URL (e.g. https://algoritmalar.com)";
  if (!raw) throw new Error(message);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(message);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error("SITE_URL must use http or https");
  if (vercelEnv === "production" && url.protocol !== "https:")
    throw new Error("SITE_URL must use https in production");
  return url;
}

export const siteUrl: URL = parseSiteUrl(
  process.env.SITE_URL,
  process.env.VERCEL_ENV
);
