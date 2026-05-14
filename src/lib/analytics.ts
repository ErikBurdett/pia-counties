type GtagEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: "event", eventName: string, params?: GtagEventParams) => void;
  }
}

export type AdTrackingPayload = {
  adId: string;
  campaignId: string;
  slotId: string;
  sponsor: string;
  page?: string;
  county?: string;
  destinationUrl: string;
};

export function trackAdImpression(payload: AdTrackingPayload) {
  trackEvent("ad_impression", adTrackingParams(payload));
}

export function trackAdClick(payload: AdTrackingPayload) {
  trackEvent("ad_click", adTrackingParams(payload));
}

export function initGoogleTagManager() {
  const gtmId = googleTagManagerId();
  if (!gtmId || typeof window === "undefined" || typeof document === "undefined") return;
  if (document.querySelector(`script[data-gtm-id="${gtmId}"]`)) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "gtm.js", "gtm.start": Date.now() });

  const script = document.createElement("script");
  script.async = true;
  script.dataset.gtmId = gtmId;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  document.head.appendChild(script);
}

export function trackPageView(path: string, title: string) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "page_view",
    page_location: window.location.href,
    page_path: path,
    page_title: title,
  });
}

function trackEvent(eventName: string, params: GtagEventParams) {
  if (typeof window === "undefined") return;

  window.dataLayer?.push({ event: eventName, ...params });
  if (typeof window.gtag === "function") window.gtag("event", eventName, params);
}

function adTrackingParams(payload: AdTrackingPayload): GtagEventParams {
  return {
    ad_id: payload.adId,
    campaign_id: payload.campaignId,
    slot_id: payload.slotId,
    sponsor: payload.sponsor,
    page: payload.page,
    county: payload.county,
    destination_url: payload.destinationUrl,
  };
}

function googleTagManagerId() {
  if (!import.meta.env.PROD && import.meta.env.VITE_GTM_ENABLE_LOCAL !== "true") return "";
  return import.meta.env.VITE_GTM_ID || "GTM-KDNSLKZ7";
}

export {};
