# Credit Cards UI

This project provides a React 18 application for browsing and comparing Australian credit cards. It uses Vite, React Router, Axios, and TailwindCSS.

## Available Scripts

- `npm run dev` – start the development server
- `npm run build` – build for production
- `npm run preview` – preview the production build

## Project Structure

- `src/components` – reusable UI components
- `src/pages` – route pages (`/credit-cards`, `/compare`)
- `src/api` – API utilities (Axios)
- `src/hooks` – custom React hooks and context

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Run unit tests using Node's built-in runner:

```bash
npm test
```

The API should expose `/api/credit-cards` for card data.

When developing locally the UI expects the backend service to be running on
`http://localhost:3000` (or whatever `PORT` is set to). The Vite dev server is
configured to proxy `/api` requests to this backend, so start the API first then
run `npm run dev` to see card data loaded from MongoDB on page load.

You can override the backend URL by setting `VITE_API_BASE_URL` in your `.env`
file. This value is used both for the dev proxy and in API calls. If omitted,
`http://localhost:3000` is used by default.

## Configuration via Environment Variables

Create an `.env` file (see `.env.example`) and define the variables below. When
deploying to Railway, add them to the service's environment tab.

| Variable | Description |
| -------- | ----------- |
| `MONGO_URI` | MongoDB connection string used by the Express server. |
| `PORT` | Port the server listens on (defaults to `3000`). |
| `CRM_WEBHOOK_URL` | Optional webhook to receive new leads as JSON. |
| `VITE_API_BASE_URL` | Public URL of the API used by the frontend. |
| `VITE_GA_ID` | Google Analytics 4 measurement ID. |
| `VITE_ADSENSE_CLIENT` | Google AdSense client ID. |
| `VITE_ADSENSE_SLOT` | AdSense slot ID for banner ads. |

## Monetization Features

The application now supports lead capture and affiliate tracking.

- Affiliate clicks are logged via `/api/referrals` before redirecting to partners.
- Leads submitted through the contact form are stored in MongoDB and optionally forwarded to a CRM webhook.
- Sponsored cards are surfaced above organic results.
- Google AdSense units are rendered between card listings.
- Basic Google Analytics 4 tracking is wired using `gtag.js`.
