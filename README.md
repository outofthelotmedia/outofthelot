# Out of the Lot — Website

## Files
```
outofthelot/
├── index.html              ← Homepage
├── about-show.html         ← "This is OOTL" full page + Important Dates
├── about-scott.html        ← Scott's full bio page
├── episodes.html           ← All playlists (Series 1, Parking Lot Prattle, Shorts)
├── contact.html            ← Contact page
├── lancia.html             ← Secret page (linked from "Lancia" in the footer)
├── poem.html               ← Secret page (linked from "Scott" under the Lancia photo)
├── css/
│   ├── style.css           ← Global styles (nav, hero, footer, etc.)
│   └── article.css         ← Shared styles for all the long-form pages
├── js/main.js               ← Scroll effects + latest-episode loader
├── worker/
│   ├── youtube-proxy-worker.js  ← Cloudflare Worker that hides your API key
│   └── README.md            ← Step-by-step setup for the above (do this!)
├── assets/                  ← Images
└── README.md                ← This file
```

---

## Step 1 — Set Up Your YouTube API Key SAFELY

Your old key got exposed because it lived in plain text inside a public
GitHub repo. **Don't put the key directly in `js/main.js` again** — do
the free Cloudflare Worker setup instead, so the key never touches this
repo or your page source.

👉 Full walkthrough: **`worker/README.md`**

It takes about 10 minutes and is free. Until you do it, the homepage
just shows the fallback "Latest Episode" spot — nothing breaks.

---

## Step 2 — Update Content

- **Filler paragraphs**: `about-show.html`, `lancia.html`, and the placeholder
  cars in the "About the Show" section are marked with `[Filler paragraph...]`
  — swap those out with your own writing whenever you're ready.
- **Important Dates**: at the bottom of `about-show.html`. Add new entries by
  copying an existing `<li>` in the `.article-list`.
- **New playlists**: `episodes.html` has one `<section class="playlist-section">`
  per playlist. Copy one to add a fourth playlist later — just change the
  `list=` YouTube playlist ID in the `iframe src`, the playlist title, and
  the "Watch on YouTube" link.

---

## Step 3 — Deploy for Free (GitHub Pages)

This is the easiest free hosting. No server. No cost. Automatic HTTPS.

### One-time setup:
1. Create a free account at https://github.com
2. Install Git: https://git-scm.com/downloads
3. Open terminal in the `outofthelot` folder

```bash
git init
git add .
git commit -m "Launch"
```

4. Create a new repo on GitHub (call it `outofthelot`)
5. Follow GitHub's instructions to push (they show you the exact commands)
6. Go to your repo → **Settings** → **Pages** → Source: **main branch** → Save
7. Your site is live at `https://yourusername.github.io/outofthelot`

### Connect your domain (outofthelot.com):
1. In your GitHub Pages settings, add custom domain: `outofthelot.com`
2. Create a file called `CNAME` in the project root containing just:
   ```
   outofthelot.com
   ```
3. Log into wherever you bought the domain (GoDaddy, Namecheap, etc.)
4. Add these DNS records:
   ```
   A     @    185.199.108.153
   A     @    185.199.109.153
   A     @    185.199.110.153
   A     @    185.199.111.153
   CNAME www  yourusername.github.io
   ```
5. Wait 10–30 minutes. Done. Free SSL included.

### Updating the site later:
```bash
git add .
git commit -m "Updated about section"
git push
```
GitHub rebuilds it automatically in ~60 seconds.

---

## Claude for VS Code

Since you mentioned wanting the Claude VS Code plugin — that's called **Claude Code**.
Install it here: https://marketplace.visualstudio.com/items?itemName=Anthropic.claude-code

With it open in your project folder, you can just describe changes and it edits the files directly.

---

## Customising Colors / Fonts

Everything is in `css/style.css` at the top:

```css
:root {
  --dark:   #122121;   /* main background */
  --orange: #fe7f00;   /* accent orange */
  --cream:  #F4F1EA;   /* text color */
}
```

Change those three values and the whole site updates — `css/article.css`
reads from the same variables automatically.

---

## Questions?
Email: scott@outofthelot.com (or just ask Claude)
