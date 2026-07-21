// Vercel Edge Middleware — HTTP Basic Auth wall for the whole site.
//
// Runs before every request. While RewardRadar is in legal review we don't
// want the public to reach the app, but we DO want to share a link with
// auditors / lawyers. Basic Auth gives us a browser-native login prompt
// with zero code changes to React.
//
// Configuration (Vercel dashboard → Settings → Environment Variables):
//   SITE_USER  — the username auditors will type (e.g. "auditor")
//   SITE_PASS  — the shared password
//
// If either variable is unset, the middleware is a no-op — useful for
// local dev where you don't want to type credentials on every reload, and
// for a one-line "kill switch": just delete SITE_PASS in Vercel to disable
// auth without a redeploy. Set both to re-enable (redeploy required so the
// env var is picked up by the edge runtime).
//
// To rotate the password: update SITE_PASS in Vercel and redeploy. Browsers
// cache Basic Auth per-origin for the session — auditors will be re-prompted
// on their next visit after cache expiry.

export const config = {
  // Match every path except Vite's built asset bundle and Vercel's own
  // internal paths. We intentionally protect /radar.svg, /llms.txt, etc.
  // so nothing leaks about the site while it's private.
  matcher: '/((?!_vercel|assets/).*)',
};

export default function middleware(request) {
  const user = process.env.SITE_USER;
  const pass = process.env.SITE_PASS;

  // No credentials configured → auth disabled. Lets the site work locally
  // and lets you kill the auth wall by unsetting env vars.
  if (!user || !pass) return;

  const authHeader = request.headers.get('authorization') ?? '';
  const expected = `Basic ${btoa(`${user}:${pass}`)}`;

  if (authHeader === expected) {
    return; // credentials match → continue to the app
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="RewardRadar preview", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      // Don't cache the 401 — otherwise a browser can get stuck showing
      // the prompt after credentials are rotated.
      'Cache-Control': 'no-store',
    },
  });
}
