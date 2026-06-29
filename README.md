# Out of the Lot — Website

## Files
```
outofthelot/
├── index.html          ← The whole website
├── css/style.css       ← All styling
├── js/main.js          ← Scroll effects + YouTube API
├── assets/
│   ├── hero-road.jpg   ← Hero background image
│   ├── logo.png        ← Show logo
│   ├── road-icon.png   ← Road/arrow graphic
│   └── banner.png      ← Banner image
└── README.md           ← This file
```

---

## Step 1 — Get a Free YouTube API Key (5 minutes)

This unlocks the "latest episode" auto-loading.

1. Go to https://console.cloud.google.com
2. Create a free project (call it anything)
3. In the left menu → **APIs & Services** → **Library**
4. Search "YouTube Data API v3" → Enable it
5. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **API Key**
6. Copy the key
7. Open `js/main.js` and replace `YOUR_YOUTUBE_API_KEY` with your key

> It's free — YouTube gives you 10,000 units/day which is way more than you need.

---

## Step 2 — Add Your Content

Open `index.html` in VS Code and find these spots:

### Hero text (line ~55)
```html
<h1 class="hero-headline">
  enter<br />
  main text<br />
  right<br />
  here
</h1>
```
Replace those 4 lines with whatever you want.

### About the Show (line ~80)
Replace the placeholder text in the paragraph tag under `<!-- REPLACE THIS TEXT... -->`

### About Scott (line ~95)
Same thing — add your bio.

### Add Scott's photo
1. Save a photo as `assets/scott.jpg`
2. In `index.html`, find `<!-- REPLACE WITH:` and replace that whole block with:
```html
<img src="assets/scott.jpg" alt="Scott" style="width:100%; height:100%; object-fit:cover;" />
```

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
  --dark:   #1a2b2a;   /* main background */
  --orange: #f47c20;   /* accent orange */
  --cream:  #f0ebe0;   /* text color */
}
```

Change those three values and the whole site updates.

---

## Questions?
Email: outofthelot.media@gmail.com (or just ask Claude)
