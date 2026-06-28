# Credit Cards UI

A React 18 single-page app for browsing and comparing Australian retail
finance products — credit cards, term deposits, and home loans. Built with
Vite, React Router, TanStack Query, TailwindCSS, and **Supabase** for data,
auth, and serverless backend.

There is no Node/Express server in this repo: the browser talks to Supabase
directly via the JS client.

## Available Scripts

- `npm run dev` – start the Vite dev server
- `npm run build` – build for production
- `npm run preview` – preview the production build
- `npm test` – run unit tests (Node's built-in runner)

## Project Structure

- `src/components` – reusable UI components
- `src/pages` – route pages (`/credit-cards`, `/compare`, `/home-loans`, …)
- `src/api` – per-resource Supabase wrappers (`creditCards`, `engagement`, `feedback`, …)
- `src/hooks` – custom React hooks and context providers
- `src/supabaseClient.js` – the singleton Supabase client

## Quick start

```bash
npm install
cp .env.example .env       # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Configuration via Environment Variables

Create a `.env` file (see `.env.example`) with:

| Variable | Description |
| -------- | ----------- |
| `VITE_SUPABASE_URL` | Supabase project URL (Project Settings → API). |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable / anon key. |
| `VITE_LOGIN_USER` | Username for the UI's login gate (`useAuth.jsx`). |
| `VITE_LOGIN_PASS` | Password for the UI's login gate. |
| `VITE_GA_ID` | Google Analytics 4 measurement ID. |
| `VITE_ADSENSE_CLIENT` | Google AdSense client ID. |
| `VITE_ADSENSE_SLOT` | AdSense slot ID for banner ads. |
| `VITE_AD_FREQUENCY` | Number of cards between AdSense units. |

The `.env` file is gitignored.

## Database

Schema lives in [`../creditcardsUI-vault/migration/001_init_schema.sql`](../creditcardsUI-vault/migration/001_init_schema.sql).
Run it in the Supabase SQL editor on a fresh project. Tables:

- `credit_cards` (CDR-shaped, JSONB nesteds)
- `leads`, `referrals`, `comments`, `reviews`, `clicks`, `email_events`
- `engagements` + `engagement_summary` view + three `SECURITY DEFINER` RPCs
  (`increment_like`, `increment_share`, `apply_review`) used by the client.

Row Level Security is enabled with permissive anon policies that match the
current "single env-var login, no real users" model — tighten when Supabase
Auth replaces `useAuth.jsx`.

## Monetization features

- Affiliate clicks are written to the `referrals` table before the partner redirect.
- Leads from the contact form land in the `leads` table.
- Sponsored cards (`is_sponsored = true`) sort to the top of the grid.
- Google AdSense units interleave between card listings.
- Basic GA4 events are wired via `gtag.js`.

## Deployment (free)

- **Database**: Supabase free tier (project pauses after one week of inactivity).
- **Frontend**: Cloudflare Pages or Vercel — `npm run build`, deploy `dist/`,
  set `VITE_SUPABASE_*` env vars in the dashboard.
