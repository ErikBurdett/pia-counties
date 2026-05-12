type VercelRequest = {
  query: {
    showcase_id?: string | string[];
    page?: string | string[];
    per_page?: string | string[];
  };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (key: string, value: string) => void;
  json: (body: unknown) => void;
};

const allowedShowcases = new Set(["12047150"]);

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function numberParam(value: string | undefined, fallback: number, max: number) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), max);
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const showcaseId = (first(request.query.showcase_id) || "").replace(/\D+/g, "");
  if (!allowedShowcases.has(showcaseId)) {
    response.status(403).json({ error: "Showcase is not allowed." });
    return;
  }

  const token = process.env.PIA_VIMEO_ACCESS_TOKEN || process.env.VIMEO_ACCESS_TOKEN;
  if (!token) {
    response.status(500).json({ error: "Missing Vimeo token." });
    return;
  }

  const page = numberParam(first(request.query.page), 1, 50);
  const perPage = numberParam(first(request.query.per_page), 12, 50);
  const fields = [
    "uri",
    "name",
    "description",
    "link",
    "created_time",
    "release_time",
    "duration",
    "pictures.sizes.link",
    "pictures.sizes.width",
    "pictures.sizes.height",
    "player_embed_url",
    "paging.next",
    "paging.previous",
    "total",
  ].join(",");

  const url = new URL(`https://api.vimeo.com/showcases/${showcaseId}/videos`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("fields", fields);

  try {
    const vimeoResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.vimeo.*+json;version=3.4",
      },
    });

    if (!vimeoResponse.ok) {
      response.status(vimeoResponse.status === 429 ? 429 : 502).json({ error: "Vimeo feed could not be loaded." });
      return;
    }

    response.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");
    response.json(await vimeoResponse.json());
  } catch {
    response.status(502).json({ error: "Vimeo feed could not be loaded." });
  }
}
