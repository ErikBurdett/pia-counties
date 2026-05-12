# Patriots in Action Counties

Simple nationwide React app for data-driven Patriots in Action county sites.

## Routes

- `/` landing page
- `/counties` state directory
- `/:state/:county` county home, for example `/texas/potter`
- `/:state/:county/about`
- `/:state/:county/elections`
- `/:state/:county/news`
- `/:state/:county/events`
- `/:state/:county/tv`
- `/:state/:county/partners`
- `/:state/:county/contact`
- `/:state/:county/submit-event`

## Data

County pages are generated from `@nickgraffis/us-counties` in `src/data/counties.ts`. Add county-specific content, links, calendars, feeds, and custom blocks through the `countyOverrides` map using keys like `texas/potter`.

## Forms

Contact and event submission forms use EmailJS. Set:

- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

The EmailJS template receives `title`, `name`, `email`, `reply_to`, `to_email`, `county_name`, `county_slug`, `state_name`, `state_slug`, `message`, `page_url`, and `submitted_at`.

## Feeds

County calendar pages use `/api/calendar`, which proxies allowlisted ICS URLs from county data. Potter County has the current community calendar configured.

The TV page uses `/api/vimeo-showcase` to proxy videos from the Patriots in Action Vimeo user feed. Set `PIA_VIMEO_ACCESS_TOKEN` or `VIMEO_ACCESS_TOKEN` on the deployment for the proxy.

## Commands

Use Node 22 from the workspace `.nvmrc`.

```bash
npm install
npm run dev
npm run lint
npm run build
```
