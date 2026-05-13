import { getCountyCalendarFeed } from "../src/data/counties";
import { combineIcsFeeds, normalizeCalendarFeedUrl } from "../src/lib/calendar";

type VercelRequest = {
  method?: string;
  query: {
    state?: string | string[];
    county?: string | string[];
  };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (key: string, value: string) => void;
  send: (body: string) => void;
  json: (body: unknown) => void;
};

function setCorsHeaders(response: VercelResponse) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  const feedUrl = getCountyCalendarFeed(first(request.query.state), first(request.query.county));

  if (!feedUrl) {
    response.status(404).json({ error: "Calendar feed is not configured for this county yet." });
    return;
  }

  try {
    const feedResponse = await fetch(normalizeCalendarFeedUrl(feedUrl));
    if (!feedResponse.ok) {
      response
        .status(feedResponse.status === 429 ? 429 : 502)
        .json({ error: `Calendar feed could not be loaded. Upstream status: ${feedResponse.status}.` });
      return;
    }

    response.setHeader("Content-Type", "text/calendar; charset=utf-8");
    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    response.send(combineIcsFeeds([await feedResponse.text()]));
  } catch {
    response.status(502).json({ error: "Calendar feed could not be loaded." });
  }
}
