import { buildNewsFeedItems } from "../src/lib/rss-feed";

type VercelRequest = {
  query: {
    url?: string | string[];
  };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (key: string, value: string) => void;
  send: (body: string) => void;
  json: (body: unknown) => void;
};

const allowedFeedHosts = new Set(["news.google.com"]);

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeRssFeedUrl(value: string | undefined) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !allowedFeedHosts.has(url.hostname)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const feedUrl = normalizeRssFeedUrl(first(request.query.url));

  if (!feedUrl) {
    response.status(400).json({ error: "RSS feed URL is not allowed." });
    return;
  }

  try {
    const feedResponse = await fetch(feedUrl, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": "PatriotsInActionFeeds/1.0",
      },
    });

    if (!feedResponse.ok) {
      response
        .status(feedResponse.status === 429 ? 429 : 502)
        .json({ error: `RSS feed could not be loaded. Upstream status: ${feedResponse.status}.` });
      return;
    }

    const xml = await feedResponse.text();
    const items = await buildNewsFeedItems(xml);

    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    response.json({ items });
  } catch {
    response.status(502).json({ error: "RSS feed could not be loaded." });
  }
}
