# Safe YouTube API Setup (10 minutes, free)

Your site is hosted on GitHub Pages, which is 100% static — there's no
server to hide a secret on. That's exactly why your old key got exposed:
it was sitting in `js/main.js`, in a public repo, for anyone (or any bot)
to scrape.

The fix is **Cloudflare Workers** — a free serverless function that holds
your real API key and does the YouTube lookup on your behalf. Your site
never touches the key; it just asks the Worker "what's the latest video?"
and gets back a video id + title. GitHub, and anyone viewing your page
source, never sees the key.

This is a one-time setup.

---

## 1. Get your YouTube API key (if you haven't already)

1. Go to https://console.cloud.google.com
2. Create a project (any name)
3. **APIs & Services → Library** → search "YouTube Data API v3" → Enable
4. **APIs & Services → Credentials → Create Credentials → API Key**
5. Copy the key
6. Click into the key you just made and click **Restrict Key** →
   under "API restrictions" choose **YouTube Data API v3** only. This
   limits the blast radius if the key ever leaks again.

## 2. Create a free Cloudflare account

1. Go to https://dash.cloudflare.com/sign-up (free tier is plenty —
   100,000 requests/day)
2. Go to **Workers & Pages** in the sidebar → **Create** → **Create Worker**
3. Give it a name, e.g. `ootl-youtube-proxy`. Deploy the default template
   for now — you'll replace the code next.

## 3. Add the code

1. In your new Worker, click **Edit Code**
2. Delete the placeholder code
3. Paste in the contents of `worker/youtube-proxy-worker.js` (in this zip)
4. Click **Save and Deploy**

## 4. Add your API key as a secret (never as plain code)

1. In the Worker's dashboard, go to **Settings → Variables**
2. Under **Environment Variables**, click **Add Variable**
3. Name: `YOUTUBE_API_KEY`
4. Value: paste your real key
5. **Important:** click **Encrypt** so it's stored as a secret, not plain text
6. Save

(If you use the `wrangler` CLI instead, the equivalent command is:
`wrangler secret put YOUTUBE_API_KEY`)

## 5. Update the allowed origins

Open `worker/youtube-proxy-worker.js` and check the `ALLOWED_ORIGINS`
list near the top — it should contain your real domain
(`https://outofthelot.com`). This stops other websites from using your
Worker (and your quota) without permission. Re-deploy after any edit.

## 6. Point your site at the Worker

1. Copy your Worker's URL — it'll look like:
   `https://ootl-youtube-proxy.YOUR-SUBDOMAIN.workers.dev`
2. Open `js/main.js` in your site and find this line near the bottom:
   ```js
   const PROXY_URL = 'https://YOUR-WORKER-SUBDOMAIN.workers.dev/latest-video';
   ```
3. Replace it with your real Worker URL + `/latest-video`, e.g.:
   ```js
   const PROXY_URL = 'https://ootl-youtube-proxy.YOUR-SUBDOMAIN.workers.dev/latest-video';
   ```
4. Commit and push. That's it — no key anywhere in the repo.

---

## Why this is safe

- The API key lives only inside Cloudflare, encrypted, never in a file.
- Nothing in your GitHub repo — public or private — ever contains the key.
- Viewing your site's page source or network tab shows only your Worker's
  URL, not the YouTube key.
- The `ALLOWED_ORIGINS` check stops other sites from riding on your quota.
- Results are cached for 15 minutes at Cloudflare's edge, so normal
  traffic barely touches your YouTube quota at all.

## If you'd rather not set up a Worker right now

That's fine — leave `PROXY_URL` as the placeholder. The site will just
show the existing fallback embed in the "Latest Episode" spot until you
do this setup. Nothing breaks either way.
