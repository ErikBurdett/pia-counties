import ICAL from "ical.js";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  eventLink?: string;
  location?: string;
  isAllDay?: boolean;
};

function twoYearsFromNow() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 2);
  return date;
}

export function normalizeCalendarFeedUrl(icsUrl: string) {
  const stableUrl = icsUrl.replace(/&(?:nocache|utm_source)=[^&]*/g, "");
  return stableUrl.startsWith("webcal://") ? `https://${stableUrl.slice("webcal://".length)}` : stableUrl;
}

export async function fetchCalendarFeed(icsUrl: string): Promise<string> {
  const response = await fetch(normalizeCalendarFeedUrl(icsUrl), { cache: "no-store" });
  if (!response.ok) throw new Error(`Calendar feed failed with ${response.status}`);

  const text = await response.text();
  if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error("Calendar response was not ICS text.");
  return text;
}

export function combineIcsFeeds(icsTexts: string[]) {
  const events = icsTexts
    .map((text) => text.replace(/BEGIN:VCALENDAR|END:VCALENDAR/gi, "").trim())
    .filter(Boolean)
    .join("\n");

  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PatriotsInAction//CountyCalendar//EN\n${events}\nEND:VCALENDAR`;
}

function extractCommunityEventLink(description = "") {
  return description.match(/https:\/\/community\.patriotsinaction\.com\/[^\s<)"]+/i)?.[0];
}

function toEvent(component: ICAL.Component, occurrence?: { startDate: ICAL.Time; endDate?: ICAL.Time }): CalendarEvent {
  const event = new ICAL.Event(component);
  const startTime = occurrence?.startDate || event.startDate;
  const endTime = occurrence?.endDate || event.endDate;
  const start = startTime.toJSDate();
  const end = endTime?.toJSDate();

  return {
    id: `${event.uid || event.summary}-${start.toISOString()}`,
    title: event.summary || "Untitled event",
    start,
    end,
    eventLink: extractCommunityEventLink(event.description || ""),
    location: event.location || undefined,
    isAllDay: Boolean(startTime.isDate),
  };
}

function expandRecurringEvents(component: ICAL.Component, futureLimit = twoYearsFromNow()) {
  const event = new ICAL.Event(component);
  if (!event.isRecurring()) return [toEvent(component)];

  const results: CalendarEvent[] = [];
  const iterator = event.iterator();
  const seen = new Set<string>();
  let next = iterator.next();

  while (next) {
    const start = next.toJSDate();
    if (start > futureLimit) break;

    const key = start.toISOString();
    if (!seen.has(key)) {
      seen.add(key);
      const duration = event.endDate?.subtractDate(event.startDate);
      const endDate = duration ? next.clone() : undefined;
      if (endDate && duration) endDate.addDuration(duration);
      results.push(toEvent(component, { startDate: next, endDate }));
    }
    next = iterator.next();
  }

  return results;
}

export function parseIcsEvents(icsText: string): CalendarEvent[] {
  const calendar = new ICAL.Component(ICAL.parse(icsText));
  const now = new Date();
  const seen = new Set<string>();

  return calendar
    .getAllSubcomponents("vevent")
    .flatMap((component) => expandRecurringEvents(component))
    .filter((event) => (event.end || event.start) >= now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .filter((event) => {
      const key = `${event.title.toLowerCase()}-${event.start.toISOString()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
