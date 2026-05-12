import type { CountyPageKey } from "./counties";

export type AdSlotId =
  | "county-home-inline"
  | "county-news-inline"
  | "county-page-footer"
  | "site-footer";

export type AdPlacement = "leaderboard" | "inline" | "compact";
export type AdDisplayMode = "card" | "image-only";

export type AdImageSet = {
  desktop: string;
  mobile?: string;
  alt: string;
};

export type AdTargeting = {
  slots: AdSlotId[];
  countyKeys?: string[];
  stateSlugs?: string[];
  pages?: CountyPageKey[];
  routes?: Array<"home" | "directory" | "state" | "county" | "static">;
};

export type AdCreative = {
  id: string;
  campaignId: string;
  sponsor: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  placement: AdPlacement;
  display: AdDisplayMode;
  image: AdImageSet;
  priority: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
  targeting: AdTargeting;
};

export const ads: AdCreative[] = [
  {
    id: "patriot-dispatch-2026",
    campaignId: "pia-house-dispatch",
    sponsor: "Patriot Dispatch",
    title: "Stay connected with Patriot Dispatch",
    body: "Get updates and resources for local action from Patriots in Action.",
    cta: "Get Updates",
    href: "https://community.patriotsinaction.com/",
    placement: "inline",
    display: "card",
    image: {
      desktop: "/ads/PatriotDispatch.jpg",
      mobile: "/ads/PatriotDispatch.jpg",
      alt: "Patriot Dispatch",
    },
    priority: 90,
    active: true,
    targeting: {
      slots: ["county-page-footer"],
      routes: ["county"],
      pages: ["home", "about"],
    },
  },
  {
    id: "patriot-dispatch-site-footer-2026",
    campaignId: "pia-house-dispatch",
    sponsor: "Patriot Dispatch",
    title: "Stay connected with Patriot Dispatch",
    body: "Get updates and resources for local action from Patriots in Action.",
    cta: "Get Updates",
    href: "https://community.patriotsinaction.com/",
    placement: "inline",
    display: "card",
    image: {
      desktop: "/ads/PatriotDispatch.jpg",
      mobile: "/ads/PatriotDispatch.jpg",
      alt: "Patriot Dispatch",
    },
    priority: 90,
    active: true,
    targeting: {
      slots: ["site-footer"],
      routes: ["home"],
    },
  },
  {
    id: "pia-rewards-2026",
    campaignId: "pia-house-rewards",
    sponsor: "Patriot Rewards",
    title: "Save with Patriot Rewards",
    body: "Explore preferred partners, member benefits, and offers built for the PIA community.",
    cta: "View Rewards",
    href: "https://patriotsinaction.com/partners",
    placement: "inline",
    display: "card",
    image: {
      desktop: "/ads/PATRIOTREWARDS.jpg",
      mobile: "/ads/PatriotRewards-250.jpg",
      alt: "Patriot Rewards partner offers",
    },
    priority: 75,
    active: true,
    targeting: {
      slots: ["county-home-inline"],
      routes: ["county"],
      pages: ["home", "partners", "elections"],
    },
  },
  {
    id: "pia-merch-2026",
    campaignId: "pia-house-merch",
    sponsor: "PIA Merch Store",
    title: "Gear up for local action",
    body: "Shop patriotic apparel and resources for your county Patriot Network.",
    cta: "Shop Merch",
    href: "https://shop.patriotsinaction.com/",
    placement: "compact",
    display: "image-only",
    image: {
      desktop: "/ads/Merch.jpg",
      mobile: "/ads/Merch.jpg",
      alt: "Shop Patriots in Action merchandise",
    },
    priority: 60,
    active: true,
    targeting: {
      slots: ["county-news-inline"],
      routes: ["county"],
      pages: ["home", "news", "events", "tv", "contact"],
    },
  },
  {
    id: "pia-tv-2026",
    campaignId: "pia-house-tv",
    sponsor: "Patriots in Action TV",
    title: "Watch Patriots in Action TV",
    body: "Interviews, updates, and stories from Patriots in Action.",
    cta: "Watch Now",
    href: "https://vimeo.com/patriotsinactiontv",
    placement: "compact",
    display: "image-only",
    image: {
      desktop: "/ads/PIATV.jpg",
      mobile: "/ads/PIATVSmall.jpg",
      alt: "Patriots in Action TV",
    },
    priority: 80,
    active: true,
    targeting: {
      slots: ["county-page-footer"],
      routes: ["county"],
      pages: ["news", "tv"],
    },
  },
  {
    id: "patriot-messaging-2026",
    campaignId: "pia-house-messaging",
    sponsor: "Patriot Messaging",
    title: "Coordinate faster with Patriot Messaging",
    body: "Keep your county network informed with tools built for quick outreach.",
    cta: "Learn More",
    href: "https://community.patriotsinaction.com/",
    placement: "inline",
    display: "card",
    image: {
      desktop: "/ads/PatriotMessaging.jpg",
      mobile: "/ads/PatriotMessaging.jpg",
      alt: "Patriot Messaging",
    },
    priority: 70,
    active: true,
    targeting: {
      slots: ["county-page-footer"],
      routes: ["county"],
      pages: ["events", "contact", "submit-event"],
    },
  },
  {
    id: "patriot-trailer-store-2026",
    campaignId: "pia-house-trailer-store",
    sponsor: "Patriot Trailer Store",
    title: "Visit the Patriot Trailer Store",
    body: "Shop gear and resources for local Patriots in Action events.",
    cta: "Shop Now",
    href: "https://shop.patriotsinaction.com/",
    placement: "compact",
    display: "image-only",
    image: {
      desktop: "/ads/PatriotTrailerStore.jpg",
      mobile: "/ads/PatriotTrailerStore.jpg",
      alt: "Patriot Trailer Store",
    },
    priority: 70,
    active: true,
    targeting: {
      slots: ["county-page-footer"],
      routes: ["county"],
      pages: ["elections", "partners"],
    },
  },
];
