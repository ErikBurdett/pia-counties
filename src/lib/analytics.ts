type GtagEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
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

function trackEvent(eventName: string, params: GtagEventParams) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
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

export {};
