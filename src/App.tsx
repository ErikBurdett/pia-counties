import { useEffect, useState, type FormEvent, type ReactNode, type UIEvent } from "react";
import { Link, Navigate, NavLink, Route, Routes, useParams } from "react-router-dom";
import { AdSlot } from "./components/AdSlot";
import { getCandidatesForCounty, getCandidatesForState, type Candidate } from "./data/candidates";
import { counties, getCountiesForState, getCounty, getStateBySlug, states, type CountyPageKey, type CountySite } from "./data/counties";
import { site } from "./data/site";
import { apiUrl } from "./lib/api";
import type { AdRouteType } from "./lib/ads";
import { fetchCalendarFeed, parseIcsEvents, type CalendarEvent } from "./lib/calendar";
import { sendCountyFormEmail } from "./lib/email";
import { fetchRssFeedItems } from "./lib/rss-client";
import type { NewsFeedItem } from "./lib/rss-feed";

const countyPages: { key: CountyPageKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "elections", label: "Elections & More" },
  { key: "candidates", label: "Candidates" },
  { key: "news", label: "News & Events" },
  { key: "events", label: "Calendar" },
  { key: "tv", label: "TV" },
  { key: "partners", label: "Partners" },
  { key: "contact", label: "Contact" },
];

const candidateProjectUrl = "https://secure.anedot.com/patriots-for-action/donate";
const candidateProjectDisclaimer =
  "Contributions to Patriots for Action PAC are used to fund voter education, candidate interviews, and election outreach across Texas. Contributions are not tax-deductible. Not authorized by any candidate or candidate's committee.";
const candidateProjectCandidateIds = new Set(["mayes-middleton", "jim-wright", "thomas-smith"]);

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${site.name}`;
  }, [title]);
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/counties" element={<DirectoryPage />} />
      <Route path="/tv" element={<MainTvPage />} />
      <Route path="/privacy" element={<StaticPage title="Privacy Policy" />} />
      <Route path="/terms" element={<StaticPage title="Terms" />} />
      <Route path="/:stateSlug/candidates" element={<StateCandidatesPage />} />
      <Route path="/:stateSlug" element={<StatePage />} />
      <Route path="/:stateSlug/:countySlug" element={<CountyRoute page="home" />} />
      <Route path="/:stateSlug/:countySlug/:pageSlug" element={<CountyRoute />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function HomePage() {
  usePageTitle("County Patriot Networks");

  return (
    <Shell route="home">
      <section className="hero hero-home">
        <div>
          <p className="eyebrow">Join Our Interactive Community</p>
          <h1>County-by-county Patriot Networks.</h1>
          <p>{site.description}</p>
          <div className="actions">
            <Link className="button primary" to="/counties">Find Your County</Link>
            <a className="button" href={site.links.community}>Join Our Community</a>
            <a className="button red" href={site.links.merch}>Shop Merchandise</a>
          </div>
        </div>
        <img src={site.brand.patriot} alt="Patriots in Action patriot mark" />
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Nationwide</p>
          <h2>Same structure, local control</h2>
          <p>Every county starts with the same pages, voter resources, calendar, feeds, TV, partner calls to action, and EmailJS forms. County overrides can add custom content, links, feeds, and local details.</p>
        </div>
        <div className="card-grid three">
          <InfoCard title={`${states.length} states and DC`} body="State pages are generated from data, and each county gets a URL like /texas/potter." />
          <InfoCard title={`${counties.length.toLocaleString()} county sites`} body="County pages are generated from the national counties dataset and can be customized one county at a time." />
          <InfoCard title="Feeds and forms" body="Calendar ICS, news links, Vimeo TV, contact, and event submissions are wired into the shared template." />
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Patriots in Action TV</p>
          <h2>Latest PIA video updates</h2>
          <p>Watch recent interviews, candidate conversations, and updates from the Patriots in Action Vimeo channel.</p>
        </div>
        <VimeoFeed compact />
      </section>
    </Shell>
  );
}

function MainTvPage() {
  usePageTitle("PIA TV");

  return (
    <Shell route="static">
      <PageHero eyebrow="Patriots in Action TV" title="PIA TV" subtitle="Latest videos, interviews, candidate conversations, and updates from Patriots in Action." />
      <VimeoFeed />
    </Shell>
  );
}

function DirectoryPage() {
  usePageTitle("Find Your County");

  return (
    <Shell route="directory">
      <PageHero eyebrow="Counties" title="Find your county Patriot Network" subtitle="Choose a state to open local county pages for civic information, calendars, news, TV, partners, and forms." />
      <div className="directory-grid">
        {states.map((state) => (
          <Link key={state.abbr} className="directory-card" to={`/${state.slug}`}>
            <strong>{state.name}</strong>
            <span>{getCountiesForState(state.slug).length} counties</span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}

function StatePage() {
  const { stateSlug } = useParams();
  const state = getStateBySlug(stateSlug);
  const stateCounties = getCountiesForState(stateSlug);
  const stateCandidates = getCandidatesForState(stateSlug);

  usePageTitle(state ? `${state.name} Counties` : "Not Found");
  if (!state) return <NotFound />;

  return (
    <Shell route="state">
      <PageHero eyebrow={state.abbr} title={`${state.name} Patriot Networks`} subtitle="Select a county to open its local Patriots in Action site." />
      <section className="section split top-align">
        <div className="panel">
          <h2>{state.name} candidates</h2>
          <p>{stateCandidates.length ? `${stateCandidates.length} candidate profiles are available for ${state.name}.` : "Candidate profiles for this state will be added soon."}</p>
          <Link className="button primary" to={`/${state.slug}/candidates`}>View State Candidates</Link>
        </div>
        <div className="panel">
          <h2>County candidate pages</h2>
          <p>Each county site can list candidates running locally, including county, city, court, and precinct races.</p>
        </div>
      </section>
      <div className="directory-grid">
        {stateCounties.map((county) => (
          <Link key={county.fips} className="directory-card" to={`/${state.slug}/${county.slug}`}>
            <strong>{county.displayName}</strong>
            <span>{county.primaryCity || state.name}</span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}

function StateCandidatesPage() {
  const { stateSlug } = useParams();
  const state = getStateBySlug(stateSlug);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [candidateSort, setCandidateSort] = useState("name");
  const allCandidates = getCandidatesForState(stateSlug);
  const jurisdictionOptions = candidateJurisdictionOptions(allCandidates);
  const scopeOptions = candidateScopeOptions(allCandidates);
  const filteredCandidates = filterAndSortCandidates(allCandidates, {
    search: candidateSearch,
    jurisdiction: jurisdictionFilter,
    scope: scopeFilter,
    sort: candidateSort,
  });
  const statewideCandidates = filteredCandidates.filter((candidate) => candidate.scope === "statewide");
  const localCandidates = filteredCandidates.filter((candidate) => candidate.scope !== "statewide");
  const patriotMessagingCandidates = filteredCandidates.filter((candidate) => candidateProjectCandidateIds.has(candidate.id));
  const remainingStatewideCandidates = statewideCandidates.filter((candidate) => !candidateProjectCandidateIds.has(candidate.id));
  const remainingLocalCandidates = localCandidates.filter((candidate) => !candidateProjectCandidateIds.has(candidate.id));
  const hasJurisdictionFilter = jurisdictionFilter !== "all";

  usePageTitle(state ? `${state.name} Candidates` : "Not Found");
  if (!state) return <NotFound />;

  return (
    <Shell route="state">
      <PageHero eyebrow="Candidate Directory" title={`${state.name} candidates running for office`} subtitle="Browse statewide, district, county, city, and precinct candidates connected to Patriots in Action." />
      <CandidateFilters
        jurisdictions={jurisdictionOptions}
        jurisdiction={jurisdictionFilter}
        scope={scopeFilter}
        scopes={scopeOptions}
        search={candidateSearch}
        sort={candidateSort}
        total={allCandidates.length}
        visible={filteredCandidates.length}
        onJurisdictionChange={setJurisdictionFilter}
        onScopeChange={setScopeFilter}
        onSearchChange={setCandidateSearch}
        onSortChange={setCandidateSort}
      />
      {patriotMessagingCandidates.length && !hasJurisdictionFilter ? (
        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Patriot Messaging</p>
            <h2>Help these candidates reach Texas voters</h2>
            <p>Support voter education, candidate interviews, and election outreach across Texas through Patriots for Action PAC.</p>
          </div>
          <CandidateGrid candidates={patriotMessagingCandidates} emptyText="No Patriot Messaging candidates are available yet." />
        </section>
      ) : null}
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Local and District Races</p>
          <h2>{remainingLocalCandidates.length ? `${remainingLocalCandidates.length} local and district candidates` : "Local candidates coming soon"}</h2>
          <p>{hasJurisdictionFilter ? `Candidates matching ${jurisdictionFilter}. Statewide candidates are shown separately below.` : "County pages show county-specific races when a candidate can be matched to a county."}</p>
        </div>
        <CandidateGrid candidates={remainingLocalCandidates} emptyText={`No local ${state.name} candidates have been added yet.`} showCounty />
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Statewide Races</p>
          <h2>{remainingStatewideCandidates.length ? `${remainingStatewideCandidates.length} statewide candidates` : "Statewide candidates coming soon"}</h2>
          <p>{hasJurisdictionFilter ? `Statewide candidates are included with ${jurisdictionFilter} results because they appear on ballots across ${state.name}.` : "The source directory includes candidate names and offices, with room to add profile pages and campaign links later."}</p>
        </div>
        <CandidateGrid candidates={remainingStatewideCandidates} emptyText={`No statewide ${state.name} candidates have been added yet.`} />
      </section>
      {allCandidates.length ? <p className="source-note">Candidate data is modeled after the public Patriots in Action candidates directory.</p> : null}
    </Shell>
  );
}

function CountyRoute({ page }: { page?: CountyPageKey }) {
  const { stateSlug, countySlug, pageSlug } = useParams();
  const county = getCounty(stateSlug, countySlug);
  const resolvedPage = page || normalizeCountyPage(pageSlug);

  if (!county) return <NotFound />;
  if (!resolvedPage) return <Navigate to={`/${county.state.slug}/${county.slug}`} replace />;

  return <CountyPage county={county} page={resolvedPage} />;
}

function normalizeCountyPage(pageSlug?: string): CountyPageKey | undefined {
  if (!pageSlug) return "home";
  if (pageSlug === "submit-event") return "submit-event";
  return countyPages.some((page) => page.key === pageSlug) ? (pageSlug as CountyPageKey) : undefined;
}

function CountyPage({ county, page }: { county: CountySite; page: CountyPageKey }) {
  usePageTitle(`${county.displayName}, ${county.state.name}`);

  return (
    <CountyShell county={county} page={page}>
      {page === "home" ? <CountyHome county={county} /> : null}
      {page === "about" ? <CountyAbout county={county} /> : null}
      {page === "elections" ? <CountyElections county={county} /> : null}
      {page === "candidates" ? <CountyCandidates county={county} /> : null}
      {page === "news" ? <CountyNews county={county} /> : null}
      {page === "events" ? <CountyEvents county={county} /> : null}
      {page === "tv" ? <CountyTv /> : null}
      {page === "partners" ? <CountyPartners county={county} /> : null}
      {page === "contact" ? <CountyContact county={county} /> : null}
      {page === "submit-event" ? <CountySubmitEvent county={county} /> : null}
    </CountyShell>
  );
}

function CountyHome({ county }: { county: CountySite }) {
  return (
    <>
      <section className="county-hero">
        <div>
          <p className="eyebrow">Presented by {county.displayName} Patriots</p>
          <h1>{county.heroTitle}</h1>
          <p>{county.heroSubtitle}</p>
          <div className="actions">
            <a className="button primary" href={county.links.rewards}>Join Patriot Rewards</a>
            <Link className="button" to={`/${county.state.slug}/${county.slug}/events`}>Community Calendar</Link>
            <Link className="button" to={`/${county.state.slug}/${county.slug}/submit-event`}>Submit an Event</Link>
          </div>
        </div>
        <img src={site.brand.operationShowUp} alt="Operation Show Up cover" />
      </section>
      <AdSlot county={county} page="home" route="county" slot="county-home-inline" />
      <section className="section split">
        <div>
          <p className="eyebrow">Know Your Leaders. Become Empowered.</p>
          <h2>{county.intro}</h2>
          <p>Your Vote. Your Voice. Your Power. Every election matters, from your local school board to the White House.</p>
        </div>
        <EventCalendar county={county} compact />
      </section>
      <CountyNewsSection county={county} page="home" />
      <ActionGrid county={county} />
      <CustomBlocks county={county} page="home" />
    </>
  );
}

function CountyAbout({ county }: { county: CountySite }) {
  return (
    <>
      <PageHero eyebrow={county.displayName} title="Making our founders proud." subtitle="Patriot inaction is the cause. Patriots in Action is the cure." />
      <section className="section">
        <div className="card-grid three">
          <InfoCard title="Stay informed" body="Find local civic resources, voting information, news feeds, events, and community updates." />
          <InfoCard title="Take action" body="Submit events, connect with neighbors, partner with us, and participate where decisions are made." />
          <InfoCard title="Build locally" body="County pages can add custom blocks, links, feeds, and featured elements while keeping a shared structure." />
        </div>
      </section>
      <CustomBlocks county={county} page="about" />
    </>
  );
}

function CountyElections({ county }: { county: CountySite }) {
  return (
    <>
      <PageHero eyebrow="Elections & More" title="Important civic information" subtitle="Voting resources and leader lookups for your county, state, and federal districts." />
      <ActionGrid county={county} />
      <section className="section">
        <div className="card-grid three">
          <ResourceCard title="Ten Commandments" href="https://www.archives.gov/milestone-documents" />
          <ResourceCard title="Declaration of Independence" href="https://www.archives.gov/founding-docs/declaration" />
          <ResourceCard title="U.S. Constitution" href="https://www.archives.gov/founding-docs/constitution" />
          <ResourceCard title={`${county.state.name} Constitution`} href={`https://www.google.com/search?q=${encodeURIComponent(`${county.state.name} constitution`)}`} />
          <ResourceCard title="County Party" href={county.links.countyParty} />
          <ResourceCard title="Register to Vote" href={county.links.registerToVote} />
        </div>
      </section>
    </>
  );
}

function CountyCandidates({ county }: { county: CountySite }) {
  const countyCandidates = getCandidatesForCounty(county);

  return (
    <>
      <PageHero eyebrow="Candidate Directory" title={`${county.displayName} candidates`} subtitle={`Candidates running for local offices connected to ${county.displayName}, ${county.state.name}.`} />
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Local Ballot Watch</p>
          <h2>{countyCandidates.length ? `${countyCandidates.length} local candidates` : "Candidate profiles coming soon"}</h2>
          <p>Find candidates connected to county, city, court, and precinct races. Statewide candidates are listed in the state directory.</p>
        </div>
        <CandidateGrid
          candidates={countyCandidates}
          emptyText={`No ${county.displayName} candidate profiles have been added yet.`}
        />
        <div className="actions">
          <Link className="button" to={`/${county.state.slug}/candidates`}>View {county.state.name} Candidates</Link>
          <a className="button primary" href="https://patriotsinaction.com/candidates/">Open PIA Candidate Directory</a>
        </div>
      </section>
    </>
  );
}

function CountyNews({ county }: { county: CountySite }) {
  return (
    <>
      <PageHero eyebrow="News & Events" title="Stay informed" subtitle="Local news, national news, obituaries, interviews, and community updates." />
      <CountyNewsSection county={county} page="news" />
    </>
  );
}

function CountyEvents({ county }: { county: CountySite }) {
  return (
    <>
      <PageHero eyebrow="Community Calendar" title={`${county.displayName} events`} subtitle="Find upcoming local events or submit one for review." />
      <section className="section split top-align">
        <EventCalendar county={county} />
        <div className="panel">
          <h2>Submit an Event</h2>
          <p>Share your local meeting, fundraiser, training, or civic action event with the Patriots in Action team.</p>
          <Link className="button primary" to={`/${county.state.slug}/${county.slug}/submit-event`}>Submit an Event</Link>
        </div>
      </section>
    </>
  );
}

function CountyTv() {
  return (
    <>
      <PageHero eyebrow="Patriots in Action TV" title="Interviews & updates" subtitle="Videos from the Patriots in Action Vimeo channel." />
      <VimeoFeed />
    </>
  );
}

function CountyPartners({ county }: { county: CountySite }) {
  return (
    <>
      <PageHero eyebrow="Partners" title="Partner with Patriots in Action" subtitle="Preferred partners, sponsorships, merchandise, and Patriot Rewards." />
      <section className="section">
        <div className="card-grid three">
          <ResourceCard title="Preferred Partners" href={county.links.partner} />
          <ResourceCard title="Patriot Rewards Program" href={county.links.rewards} />
          <ResourceCard title="Patriotic Merch Store" href={county.links.merch} />
        </div>
      </section>
    </>
  );
}

function CountyContact({ county }: { county: CountySite }) {
  return (
    <>
      <PageHero eyebrow={county.displayName} title="Connect with us" subtitle="Reach your county Patriot Network." />
      <section className="section split top-align">
        <div className="panel">
          <h2>Contact</h2>
          <p><strong>Phone:</strong> {county.phone || site.contact.phone}</p>
          <p><strong>Email:</strong> <a href={`mailto:${county.email}`}>{county.email}</a></p>
          <p><strong>Community:</strong> <a href={county.links.community}>Join the movement</a></p>
        </div>
        <CountyForm county={county} kind="contact" />
      </section>
    </>
  );
}

function CountySubmitEvent({ county }: { county: CountySite }) {
  return (
    <>
      <PageHero eyebrow={county.displayName} title="Submit an event" subtitle="Approved events may be added to the community calendar." />
      <section className="section narrow">
        <CountyForm county={county} kind="event" />
      </section>
    </>
  );
}

type RssFeedWidgetProps = {
  title: string;
  eyebrow: string;
  description: string;
  feedUrl: string;
  emptyText: string;
};

function CountyNewsSection({ county, page }: { county: CountySite; page: CountyPageKey }) {
  return (
    <section className="section news-section">
      <div className="section-heading">
        <p className="eyebrow">County Newsroom</p>
        <h2>Ultra-local feeds for {county.displayName}</h2>
        <p>Follow local articles, video coverage, obituaries, and Patriots in Action TV from one county news section.</p>
      </div>
      <div className="feed-grid">
        <div className="feed-column">
          <RssFeedWidget
            eyebrow="Local Articles"
            title="County & City News"
            description={`Online news articles focused on ${county.displayName} and nearby city coverage.`}
            feedUrl={county.feeds.localNewsUrl}
            emptyText="No local article results are available yet."
          />
          <RssFeedWidget
            eyebrow="Obituaries"
            title="Local Obituaries"
            description={`Recent obituary notices and memorial news for ${county.displayName}.`}
            feedUrl={county.feeds.obituariesUrl}
            emptyText="No local obituary results are available yet."
          />
        </div>
        <div className="feed-column">
          <RssFeedWidget
            eyebrow="Local Video"
            title="County News Videos"
            description={`Video news coverage mentioning ${county.displayName}, local communities, and civic updates.`}
            feedUrl={county.feeds.localVideoUrl}
            emptyText="No local video results are available yet."
          />
          <VimeoFeed compact />
        </div>
      </div>
      <AdSlot county={county} page={page} route="county" slot="county-news-inline" />
    </section>
  );
}

function RssFeedWidget({ title, eyebrow, description, feedUrl, emptyText }: RssFeedWidgetProps) {
  const [items, setItems] = useState<NewsFeedItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [status, setStatus] = useState("Loading feed...");

  useEffect(() => {
    let active = true;

    fetchRssFeedItems(feedUrl)
      .then((parsed) => {
        if (!active) return;
        setItems(parsed);
        setVisibleCount(5);
        setStatus(parsed.length ? "" : emptyText);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setVisibleCount(5);
        setStatus("This feed could not be loaded right now.");
      });

    return () => {
      active = false;
    };
  }, [emptyText, feedUrl]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <article className="feed-widget">
      <div className="panel-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {status ? <p className="status">{status}</p> : null}
      <div className="feed-list scroll-feed" onScroll={(event) => handleScrollLoadMore(event, hasMore, () => setVisibleCount((count) => count + 5))}>
        {visibleItems.map((item) => (
          <a className={item.imageUrl ? "feed-item" : "feed-item no-image"} href={item.link} key={item.id}>
            {item.imageUrl ? <img src={item.imageUrl} alt="" /> : null}
            <div>
              <strong>{item.title}</strong>
              <span>{[item.source, formatFeedDate(item.publishedAt)].filter(Boolean).join(" | ")}</span>
              {item.description ? <p>{item.description}</p> : null}
            </div>
          </a>
        ))}
        {hasMore ? <p className="feed-more">Scroll for more</p> : null}
      </div>
      <a className="feed-source" href={feedUrl}>Open RSS feed</a>
    </article>
  );
}

function handleScrollLoadMore(event: UIEvent<HTMLElement>, hasMore: boolean, loadMore: () => void) {
  if (!hasMore) return;
  const element = event.currentTarget;
  const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
  if (isNearBottom) loadMore();
}

function EventCalendar({ county, compact = false }: { county: CountySite; compact?: boolean }) {
  const feedUrl = county.calendar.proxyUrl ? apiUrl(county.calendar.proxyUrl) : county.calendar.icsUrl;
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [status, setStatus] = useState("Loading community events...");

  useEffect(() => {
    let active = true;

    if (!feedUrl) return;

    fetchCalendarFeed(feedUrl)
      .then((text) => {
        if (!active) return;
        const parsed = parseIcsEvents(text);
        setEvents(parsed);
        setStatus(parsed.length ? "" : "No upcoming events are listed yet.");
      })
      .catch(() => {
        if (active) setStatus("The calendar feed could not be loaded right now.");
      });

    return () => {
      active = false;
    };
  }, [feedUrl]);

  const visible = compact ? events.slice(0, 3) : events.slice(0, 12);
  const displayedStatus = feedUrl ? status : "No calendar feed has been added for this county yet.";

  return (
    <div className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Community Calendar</p>
        <h2>Upcoming Events</h2>
      </div>
      {displayedStatus ? <p>{displayedStatus}</p> : null}
      <div className="event-list">
        {visible.map((event) => (
          <article className="event-card" key={event.id}>
            <strong>{event.title}</strong>
            <span>{formatDate(event)} {event.isAllDay ? "All day" : formatTime(event)}</span>
            {event.location ? <span>{event.location}</span> : null}
            {event.eventLink ? <a href={event.eventLink}>View event</a> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

type VimeoVideo = {
  uri?: string;
  name?: string;
  description?: string;
  link?: string;
  created_time?: string;
  release_time?: string;
  player_embed_url?: string;
  pictures?: { sizes?: { link: string; width: number }[] };
};

function VimeoFeed({ compact = false }: { compact?: boolean }) {
  const [videos, setVideos] = useState<VimeoVideo[]>([]);
  const [status, setStatus] = useState("Loading videos...");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const perPage = compact ? 8 : 12;

  useEffect(() => {
    let active = true;

    fetch(apiUrl(`/api/vimeo-showcase?page=1&per_page=${perPage}`))
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Vimeo error"))))
      .then((json: { data?: VimeoVideo[] }) => {
        if (!active) return;
        const nextVideos = sortVideosNewest(json.data || []);
        setVideos(nextVideos);
        setPage(1);
        setHasMore(nextVideos.length === perPage);
        setStatus(nextVideos.length ? "" : "No videos found in this Vimeo feed.");
      })
      .catch(() => {
        if (!active) return;
        setVideos([]);
        setPage(1);
        setHasMore(false);
        setStatus("Could not load the Vimeo feed. Check the Vimeo proxy token and deployment logs.");
      });

    return () => {
      active = false;
    };
  }, [perPage]);

  async function loadMoreVideos() {
    if (loadingMore || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const response = await fetch(apiUrl(`/api/vimeo-showcase?page=${nextPage}&per_page=${perPage}`));
      if (!response.ok) throw new Error("Vimeo error");
      const json = (await response.json()) as { data?: VimeoVideo[] };
      const nextVideos = sortVideosNewest(json.data || []);
      setVideos((currentVideos) => sortVideosNewest([...currentVideos, ...nextVideos]));
      setHasMore(nextVideos.length === perPage);
      setPage(nextPage);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className={compact ? "feed-widget" : "section"}>
      {compact ? (
        <div className="panel-heading">
          <p className="eyebrow">Patriots in Action TV</p>
          <h3>PIA Video Feed</h3>
          <p>Latest videos from <a href={site.links.vimeoTv}>Patriots in Action TV on Vimeo</a>.</p>
        </div>
      ) : null}
      {status ? <p className="status">{status}</p> : null}
      <div className="feed-list video-feed scroll-feed" onScroll={(event) => handleScrollLoadMore(event, hasMore && !loadingMore, loadMoreVideos)}>
        {videos.map((video) => {
          const thumbnail = videoThumbnail(video);
          return (
            <a className={thumbnail ? "feed-item video-feed-item" : "feed-item video-feed-item no-image"} href={video.link || site.links.vimeoTv} key={video.uri || video.link || video.name}>
              {thumbnail ? <img src={thumbnail} alt="" /> : null}
              <div>
                <strong>{video.name || "Patriots in Action TV"}</strong>
                <span>{["Vimeo", formatFeedDate(video.release_time || video.created_time)].filter(Boolean).join(" | ")}</span>
                {video.description ? <p>{video.description}</p> : null}
              </div>
            </a>
          );
        })}
        {hasMore || loadingMore ? <p className="feed-more">{loadingMore ? "Loading more..." : "Scroll for more"}</p> : null}
      </div>
      {!compact && (hasMore || loadingMore) ? (
        <button className="button primary" type="button" onClick={loadMoreVideos} disabled={loadingMore}>
          {loadingMore ? "Loading..." : "Load more videos"}
        </button>
      ) : null}
      {compact ? <a className="feed-source" href={site.links.vimeoTv}>Open Vimeo channel</a> : null}
    </section>
  );
}

function sortVideosNewest(videos: VimeoVideo[]) {
  return [...videos].sort((first, second) => videoTimestamp(second) - videoTimestamp(first));
}

function videoTimestamp(video: VimeoVideo) {
  const date = video.release_time || video.created_time;
  const timestamp = date ? new Date(date).getTime() : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function videoThumbnail(video: VimeoVideo) {
  const sizes = video.pictures?.sizes || [];
  return [...sizes].sort((first, second) => Math.abs(first.width - 220) - Math.abs(second.width - 220))[0]?.link;
}

function CountyForm({ county, kind }: { county: CountySite; kind: "contact" | "event" }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("website")) return;
    const values = Object.fromEntries(form.entries()) as Record<string, string>;

    setSending(true);
    setStatus("");
    try {
      await sendCountyFormEmail({
        county,
        title: kind === "contact" ? "County contact form" : "County event submission",
        replyTo: values.email || values.submitterEmail,
        values: {
          ...values,
          consent: values.consent === "on",
        },
      });
      event.currentTarget.reset();
      setStatus(kind === "contact" ? "Your message has been sent." : "Thank you. Your event has been submitted for review.");
    } catch {
      setStatus("Submission failed. Please check EmailJS settings or email us directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <input type="hidden" name="county" value={`${county.displayName}, ${county.state.name}`} />
      <label className="honeypot">Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      {kind === "contact" ? (
        <>
          <FormInput name="name" label="Name" required />
          <FormInput name="email" label="Email" type="email" required />
          <FormInput name="phone" label="Phone" />
          <FormInput name="subject" label="Subject" required />
          <FormInput name="message" label="Message" textarea required />
        </>
      ) : (
        <>
          <FormInput name="submitterName" label="Your Name" required />
          <FormInput name="submitterEmail" label="Your Email" type="email" required />
          <FormInput name="submitterPhone" label="Phone" />
          <FormInput name="eventName" label="Event Name" required />
          <FormInput name="eventDate" label="Event Date" type="date" required />
          <FormInput name="eventStartTime" label="Start Time" type="time" />
          <FormInput name="eventEndTime" label="End Time" type="time" />
          <FormInput name="eventLocation" label="Event Location" />
          <FormInput name="eventAddress" label="Event Address" />
          <FormInput name="eventUrl" label="Event URL / Community Link" type="url" />
          <FormInput name="eventDescription" label="Event Description" textarea required />
          <label className="checkbox"><input name="consent" type="checkbox" required /> I understand this submission will be reviewed before being added to the calendar.</label>
        </>
      )}
      {status ? <p className="status">{status}</p> : null}
      <button className="button primary" type="submit" disabled={sending}>{sending ? "Sending..." : kind === "contact" ? "Send Message" : "Submit Event"}</button>
    </form>
  );
}

function FormInput({ name, label, type = "text", required = false, textarea = false }: { name: string; label: string; type?: string; required?: boolean; textarea?: boolean }) {
  return (
    <label className="field">
      <span>{label}{required ? " *" : ""}</span>
      {textarea ? <textarea name={name} required={required} rows={5} /> : <input name={name} type={type} required={required} />}
    </label>
  );
}

function CountyShell({ county, page, children }: { county: CountySite; page: CountyPageKey; children: ReactNode }) {
  const base = `/${county.state.slug}/${county.slug}`;
  return (
    <Shell county={county} page={page} route="county">
      <nav className="county-tabs" aria-label={`${county.displayName} pages`}>
        {countyPages.map((page) => (
          <NavLink key={page.key} end={page.key === "home"} to={page.key === "home" ? base : `${base}/${page.key}`}>
            {page.label}
          </NavLink>
        ))}
      </nav>
      {children}
      <AdSlot county={county} page={page} route="county" slot="county-page-footer" />
    </Shell>
  );
}

function Shell({ county, children, page, route }: { county?: CountySite; children: ReactNode; page?: CountyPageKey; route: AdRouteType }) {
  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <span>Meet Your Neighbors!</span>
          <a href={`tel:${site.contact.phoneDial}`}>{site.contact.phone}</a>
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          {county?.primaryCity ? <span>{county.primaryCity}: weather coming soon</span> : null}
        </div>
      </header>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" to="/">
            <img src={site.brand.icon} alt="" />
            <span>{site.name}</span>
          </Link>
          <nav>
            <Link to="/counties">Counties</Link>
            <a href={site.links.community}>Community</a>
            <Link to="/texas/candidates">Candidates</Link>
            <Link to="/tv">PIA TV</Link>
            <a href={site.links.merch}>Merch</a>
            <Link to="/privacy">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
      {route !== "county" ? (
        <div className="container">
          <AdSlot county={county} page={page} route={route} slot="site-footer" />
        </div>
      ) : null}
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <img src={site.brand.footerLogo} alt={site.name} />
          <p>{site.tagline}</p>
          <p>Patriots Connect, LLC, DBA Patriots in Action, is an independent, privately owned business and is not sponsored by, controlled by, or officially associated with any political party or candidate.</p>
        </div>
        <div>
          <h3>Stay informed</h3>
          <Link to="/counties">County Directory</Link>
          <a href={site.links.community}>Join Our Interactive Community</a>
          <a href={site.links.merch}>Merch Store</a>
        </div>
        <div>
          <h3>Contact</h3>
          <a href={`tel:${site.contact.phoneDial}`}>{site.contact.phone}</a>
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <section className="page-hero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
}

function ActionGrid({ county }: { county: CountySite }) {
  return (
    <section className="section">
      <div className="card-grid four">
        <ResourceCard title="Precinct Map" href={county.links.precinctMap} />
        <ResourceCard title="Voting Locations" href={county.links.votingLocations} />
        <ResourceCard title="Sample Ballot" href={county.links.sampleBallot} />
        <ResourceCard title="Register to Vote" href={county.links.registerToVote} />
        <ResourceCard title="Local Elected Officials" href={county.links.localOfficials} />
        <ResourceCard title="State Elected Officials" href={county.links.stateOfficials} />
        <ResourceCard title="Federal Elected Officials" href={county.links.federalOfficials} />
        <ResourceCard title="County Party" href={county.links.countyParty} />
      </div>
    </section>
  );
}

function CustomBlocks({ county, page }: { county: CountySite; page: CountyPageKey }) {
  const blocks = county.customBlocks?.[page] || [];
  if (!blocks.length) return null;

  return (
    <section className="section">
      <div className="card-grid">
        {blocks.map((block) => (
          <InfoCard key={block.title} title={block.title} body={block.body} href={block.href} cta={block.cta} />
        ))}
      </div>
    </section>
  );
}

type CandidateFilterOptions = {
  search: string;
  jurisdiction: string;
  scope: string;
  sort: string;
};

function CandidateFilters({
  jurisdictions,
  jurisdiction,
  scope,
  scopes,
  search,
  sort,
  total,
  visible,
  onJurisdictionChange,
  onScopeChange,
  onSearchChange,
  onSortChange,
}: {
  jurisdictions: string[];
  jurisdiction: string;
  scope: string;
  scopes: string[];
  search: string;
  sort: string;
  total: number;
  visible: number;
  onJurisdictionChange: (value: string) => void;
  onScopeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}) {
  return (
    <section className="candidate-filters" aria-label="Filter candidates">
      <label className="field">
        <span>Search candidates</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, county, office, district..."
          type="search"
        />
      </label>
      <label className="field">
        <span>County / district</span>
        <select value={jurisdiction} onChange={(event) => onJurisdictionChange(event.target.value)}>
          <option value="all">All available areas</option>
          {jurisdictions.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Race type</span>
        <select value={scope} onChange={(event) => onScopeChange(event.target.value)}>
          <option value="all">All race types</option>
          {scopes.map((scopeName) => (
            <option key={scopeName} value={scopeName}>{candidateScopeLabel(scopeName)}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Sort by</span>
        <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
          <option value="name">Name A-Z</option>
          <option value="office">Office A-Z</option>
          <option value="county">County A-Z</option>
          <option value="race-type">Race type</option>
        </select>
      </label>
      <p className="candidate-filter-count">{visible} of {total} candidates shown</p>
    </section>
  );
}

function candidateJurisdictionOptions(candidates: Candidate[]) {
  return [...new Set(candidates.map(candidateJurisdiction).filter(Boolean))].sort((first, second) => first.localeCompare(second));
}

function candidateScopeOptions(candidates: Candidate[]) {
  const scopeOrder = ["statewide", "district", "county", "precinct", "city"];
  const availableScopes = new Set(candidates.map((candidate) => candidate.scope));
  return scopeOrder.filter((scope) => availableScopes.has(scope as Candidate["scope"]));
}

function filterAndSortCandidates(candidates: Candidate[], options: CandidateFilterOptions) {
  const query = options.search.trim().toLowerCase();

  return candidates
    .filter((candidate) => {
      const matchesSearch = !query || [
        candidate.name,
        candidate.office,
        candidate.countyName,
        candidate.district,
        candidate.scope,
        candidate.party,
      ].some((value) => value?.toLowerCase().includes(query));
      const matchesJurisdiction = options.jurisdiction === "all" || candidate.scope === "statewide" || candidateJurisdiction(candidate) === options.jurisdiction;
      const matchesScope = options.scope === "all" || candidate.scope === options.scope;
      return matchesSearch && matchesJurisdiction && matchesScope;
    })
    .sort((first, second) => candidateSortValue(first, options.sort).localeCompare(candidateSortValue(second, options.sort)) || first.name.localeCompare(second.name));
}

function candidateSortValue(candidate: Candidate, sort: string) {
  if (sort === "office") return candidate.office;
  if (sort === "county") return candidateJurisdiction(candidate) || "Statewide";
  if (sort === "race-type") return candidate.scope;
  return candidate.name;
}

function candidateJurisdiction(candidate: Candidate) {
  return candidate.countyName || candidate.district || (candidate.scope === "statewide" ? "Statewide" : "");
}

function candidateScopeLabel(scope: string) {
  return scope.charAt(0).toUpperCase() + scope.slice(1);
}

function CandidateGrid({ candidates, emptyText, showCounty = false }: { candidates: Candidate[]; emptyText: string; showCounty?: boolean }) {
  const [activeVideo, setActiveVideo] = useState<Candidate | null>(null);

  if (!candidates.length) return <p className="status">{emptyText}</p>;

  return (
    <>
      <div className="candidate-grid">
        {candidates.map((candidate) => (
          <article className="candidate-card" key={candidate.id}>
            {candidate.image ? <img className="candidate-photo" src={candidate.image} alt={candidate.name} /> : null}
            <div className="candidate-card-heading">
              <p className="eyebrow">{candidateLabel(candidate, showCounty)}</p>
              <h3>{candidate.name}</h3>
              <p>For {candidate.office}</p>
            </div>
            {candidate.videoEmbedUrl ? <CandidateVideoPreview candidate={candidate} onOpen={() => setActiveVideo(candidate)} /> : null}
            <CandidateDetails candidate={candidate} />
            {candidateProjectCandidateIds.has(candidate.id) ? (
              <div className="candidate-support">
                <a className="button red" href={candidateProjectUrl}>Help Get This Candidate&apos;s Message Out to Texas Voters</a>
                <p>{candidateProjectDisclaimer}</p>
              </div>
            ) : null}
          </article>
        ))}
      </div>
      {activeVideo ? <CandidateVideoModal candidate={activeVideo} onClose={() => setActiveVideo(null)} /> : null}
    </>
  );
}

function CandidateVideoPreview({ candidate, onOpen }: { candidate: Candidate; onOpen: () => void }) {
  return (
    <button className="candidate-video-preview" type="button" onClick={onOpen}>
      <iframe
        allow="autoplay; fullscreen; picture-in-picture"
        src={candidate.videoEmbedUrl}
        title={candidate.videoTitle || `${candidate.name} video`}
      />
      <span>Watch Interview</span>
    </button>
  );
}

function CandidateVideoModal({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="video-modal" role="dialog" aria-modal="true" aria-label={`${candidate.name} video`}>
      <button className="video-modal-backdrop" type="button" aria-label="Close video" onClick={onClose} />
      <div className="video-modal-panel">
        <div className="video-modal-header">
          <div>
            <p className="eyebrow">PIA TV Candidate Interview</p>
            <h2>{candidate.name}</h2>
          </div>
          <button className="button" type="button" onClick={onClose}>Close</button>
        </div>
        <iframe
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          src={candidate.videoEmbedUrl}
          title={candidate.videoTitle || `${candidate.name} video`}
        />
      </div>
    </div>
  );
}

function CandidateDetails({ candidate }: { candidate: Candidate }) {
  const rows = [
    { label: "Running For", value: candidate.office },
    { label: "Party", value: candidate.party },
    { label: "Ballotpedia Profile", value: candidate.ballotpediaUrl, linkText: candidate.name },
    { label: "Email", value: candidate.email, href: candidate.email ? `mailto:${candidate.email}` : undefined },
    { label: "Phone", value: candidate.phone, href: candidate.phone ? `tel:${candidate.phone.replace(/\D+/g, "")}` : undefined },
    { label: "Website", value: candidate.websiteUrl, linkText: "Website" },
  ].filter((row) => row.value);

  return (
    <dl className="candidate-details">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>
            {row.href || row.value?.startsWith("http") ? (
              <a href={row.href || row.value}>{row.linkText || row.value}</a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function candidateLabel(candidate: Candidate, showCounty: boolean) {
  if (showCounty && candidate.countyName) return candidate.countyName;
  if (candidate.scope === "statewide") return "Statewide";
  if (candidate.district) return candidate.district;
  return candidate.scope;
}

function InfoCard({ title, body, href, cta = "Learn more" }: { title: string; body: string; href?: string; cta?: string }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{body}</p>
      {href ? <a href={href}>{cta}</a> : null}
    </article>
  );
}

function ResourceCard({ title, href }: { title: string; href: string }) {
  return (
    <a className="resource-card" href={href}>
      <strong>{title}</strong>
      <span>Open resource</span>
    </a>
  );
}

function StaticPage({ title }: { title: string }) {
  usePageTitle(title);

  return (
    <Shell route="static">
      <PageHero eyebrow={site.name} title={title} subtitle="This page is a starter policy page for the new Patriots in Action application." />
      <section className="section narrow">
        <p>Use this page for the official {title.toLowerCase()} content before launch.</p>
      </section>
    </Shell>
  );
}

function NotFound() {
  usePageTitle("Not Found");

  return (
    <Shell route="static">
      <PageHero eyebrow="404" title="Page not found" subtitle="We could not find that Patriots in Action page." />
      <Link className="button primary" to="/counties">Find a County</Link>
    </Shell>
  );
}

function formatDate(event: CalendarEvent) {
  return event.start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(event: CalendarEvent) {
  if (event.isAllDay) return "";
  const start = event.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const end = event.end?.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return end ? `${start} - ${end}` : start;
}

function formatFeedDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default App;
