import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { getCountyCalendarFeed } from "./src/data/counties";
import { combineIcsFeeds, normalizeCalendarFeedUrl } from "./src/lib/calendar";
import { buildNewsFeedItems } from "./src/lib/rss-feed";

function calendarApiDevMiddleware(): Plugin {
  return {
    name: "pia-calendar-api-dev",
    configureServer(server) {
      server.middlewares.use("/api/calendar", async (request, response) => {
        const requestUrl = new URL(request.url || "", "http://localhost");
        const state = requestUrl.searchParams.get("state") || undefined;
        const county = requestUrl.searchParams.get("county") || undefined;
        const feedUrl = getCountyCalendarFeed(state, county);

        if (!feedUrl) {
          response.statusCode = 404;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: "Calendar feed is not configured for this county yet." }));
          return;
        }

        try {
          const feedResponse = await fetch(normalizeCalendarFeedUrl(feedUrl));
          if (!feedResponse.ok) {
            response.statusCode = feedResponse.status === 429 ? 429 : 502;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify({ error: `Upstream calendar status: ${feedResponse.status}.` }));
            return;
          }

          response.statusCode = 200;
          response.setHeader("Access-Control-Allow-Origin", "*");
          response.setHeader("Cache-Control", "no-store");
          response.setHeader("Content-Type", "text/calendar; charset=utf-8");
          response.end(combineIcsFeeds([await feedResponse.text()]));
        } catch {
          response.statusCode = 502;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: "Calendar feed could not be loaded." }));
        }
      });
    },
  };
}

const allowedFeedHosts = new Set(["news.google.com"]);

function normalizeRssFeedUrl(value: string | null) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !allowedFeedHosts.has(url.hostname)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function rssApiDevMiddleware(): Plugin {
  return {
    name: "pia-rss-api-dev",
    configureServer(server) {
      server.middlewares.use("/api/rss-feed", async (request, response) => {
        const requestUrl = new URL(request.url || "", "http://localhost");
        const feedUrl = normalizeRssFeedUrl(requestUrl.searchParams.get("url"));

        if (!feedUrl) {
          response.statusCode = 400;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: "RSS feed URL is not allowed." }));
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
            response.statusCode = feedResponse.status === 429 ? 429 : 502;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify({ error: `Upstream RSS status: ${feedResponse.status}.` }));
            return;
          }

          const items = await buildNewsFeedItems(await feedResponse.text());

          response.statusCode = 200;
          response.setHeader("Access-Control-Allow-Origin", "*");
          response.setHeader("Cache-Control", "no-store");
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ items }));
        } catch {
          response.statusCode = 502;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: "RSS feed could not be loaded." }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [calendarApiDevMiddleware(), rssApiDevMiddleware(), react()],
});
