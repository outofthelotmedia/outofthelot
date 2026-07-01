# Out of the Lot — Website

## Files
```
outofthelot/
├── index.html            ← Home page
├── about-show.html        ← "This is OOTL" — full article + Important Dates timeline
├── about-scott.html       ← Scott's bio page
├── contact.html           ← Contact page (Business, Partnerships, Questions, Complaints, Corrections)
├── episodes.html          ← All playlists (Series 1, Parking Lot Prattle, Shorts)
├── lancia.html             ← SECRET page — "The Best Car Ever to be Made" (linked from the word "Lancia" in the footer)
├── poem.html               ← SECRET page — "The New and Unfamiliar Road" (linked from the word "Scott" in the Lancia page photo caption)
├── css/style.css           ← All styling
├── js/main.js              ← Scroll effects + YouTube proxy call
├── cloudflare-worker/
│   └── worker.js           ← The serverless proxy that safely holds your YouTube API key
├── assets/
│   ├── hero-road.jpg
│   ├── logo.png
│   ├── road-icon.png
│   ├── banner.png
│   └── lancia-delta.jpg    ← Photo on the secret Lancia page
└── README.md
```

---

## YouTube API — Safe Setup (do this first)

Your old key got exposed because it was pasted directly into `js/main.js`, which lives in a **public** GitHub repo — anyone who looked at the code could copy it and burn through your quota (or worse).

The fix: the real key now lives on **Cloudflare**, not in this repo. Your site talks to a small "Worker" (a tiny serverless function), and the Worker — not your browser — talks to YouTube. The key is stored as a Cloudflare *secret*, which is never visible in your code, your repo, or your browser's dev tools.

### 1. Create a free Cloudflare account
Go to https://dash.cloudflare.com/sign-up (free tier is plenty for this).

### 2. Install Wrangler (Cloudflare's CLI)
```bash
npm install -g wrangler
wrangler login
```

### 3. Deploy the Worker
From inside the `cloudflare-worker` folder:
```bash
cd cloudflare-worker
wrangler init --from-dash    # or: wrangler deploy (if you already have a wrangler.toml)
```
If you don't have a `wrangler.toml` yet, create one next to `worker.js`:
```toml
name = "ootl-youtube-proxy"
main = "worker.js"
compatibility_date = "2026-06-30"
```
Then deploy:
```bash
wrangler deploy
```
This prints a URL like `https://ootl-youtube-proxy.yourname.workers.dev` — that's your Worker URL.

### 4. Add your real API key as a secret (never in the code)
```bash
wrangler secret put YOUTUBE_API_KEY
```
Paste your key when prompted. It's now stored encrypted on Cloudflare, not in this repo.

> Don't have a key yet? Get one free at https://console.cloud.google.com → enable "YouTube Data API v3" → Credentials → Create Credentials → API Key.

### 5. Lock down who can call your Worker
Open `cloudflare-worker/worker.js` and update `ALLOWED_ORIGINS` with your real domain (e.g. `https://outofthelot.com`).

### 6. Point the site at your Worker
Open `js/main.js` and replace:
```js
const WORKER_URL = 'https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev';
```
with the URL from Step 3.

That's it — the homepage's "Latest Episode" section will now pull automatically, and your real key is never exposed on GitHub.

---

## Step 2 — Add Your Own Content

Several pages have clearly-marked filler text — search for `<!-- REPLACE` comments in each file.

| Page | What to replace |
|---|---|
| `about-show.html` | The "This is OOTL" article paragraphs |
| `about-scott.html` | Scott's bio + `assets/scott.jpg` photo |
| `lancia.html` | The Lancia Delta article paragraphs |

### Adding Scott's photo
1. Save a photo as `assets/scott.jpg`
2. In `about-scott.html`, find `<!-- REPLACE WITH:` and swap the placeholder block for:
```html
<img src="assets/scott.jpg" alt="Scott" style="width:100%; height:100%; object-fit:cover;" />
```

### The two secret pages
- **`lancia.html`** — reached by clicking the word **"Lancia"** in the footer of every page.
- **`poem.html`** — reached by clicking the word **"Scott"** in the photo caption on the Lancia page.

Neither is linked from the nav or sitemap, so they stay easter eggs unless someone stumbles onto the right word.

---

## Step 3 — Deploy for Free (GitHub Pages)

Same as before — the site itself stays static and free on GitHub Pages. Only the YouTube key setup changed.

### One-time setup:
```bash
git init
git add .
git commit -m "Launch"
```
1. Create a new repo on GitHub (call it `outofthelot`)
2. Push using the commands GitHub gives you
3. Repo → **Settings** → **Pages** → Source: **main branch** → Save
4. Live at `https://yourusername.github.io/outofthelot`

### Connect your domain (outofthelot.com):
1. In GitHub Pages settings, add custom domain: `outofthelot.com`
2. Add a `CNAME` file in the project root containing just:
   ```
   outofthelot.com
   ```
3. In your domain registrar's DNS settings, add:
   ```
   A     @    185.199.108.153
   A     @    185.199.109.153
   A     @    185.199.110.153
   A     @    185.199.111.153
   CNAME www  yourusername.github.io
   ```
4. Wait 10–30 minutes. Free SSL included.

### Updating the site later:
```bash
git add .
git commit -m "Updated about section"
git push
```
GitHub rebuilds it automatically in ~60 seconds.

---

## Customising Colors / Fonts

Everything is in `css/style.css` at the top:
```css
:root {
  --dark:   #1a2b2a;   /* main background */
  --orange: #f47c20;   /* accent orange */
  --cream:  #f0ebe0;   /* text color */
}
```
Change those three values and the whole site updates.

---

## Questions?
Email: scott@outofthelot.com (or just ask Claude)
