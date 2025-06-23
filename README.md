# Credit Cards UI

This project provides a React 18 application for browsing and comparing Australian credit cards. It uses Vite, React Router, Axios, and TailwindCSS.

## Available Scripts

- `npm run dev` – start the development server
- `npm run build` – build for production
- `npm run preview` – preview the production build

## Project Structure

- `src/components` – reusable UI components
- `src/pages` – route pages (`/cards`, `/compare`)
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
