/* ===========================
   OUT OF THE LOT — MAIN JS
   =========================== */

// Footer year
const fyEl = document.getElementById('footerYear');
if (fyEl) fyEl.textContent = new Date().getFullYear();

// Navbar scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// Mobile nav
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
navToggle?.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Scroll-reveal
const revealEls = document.querySelectorAll(
  '.about-inner, .episode-inner, .footer-content, .about-title, .about-body, .image-placeholder, .playlist-inner, .article-hero, .article-body'
);
revealEls.forEach(el => el.classList.add('reveal'));
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  }),
  { threshold: 0.1 }
);
revealEls.forEach(el => observer.observe(el));

// Scroll hint fade
const scrollHint = document.getElementById('scrollHint');
if (scrollHint) {
  window.addEventListener('scroll', () => {
    scrollHint.style.opacity = window.scrollY > 80 ? '0' : '1';
    scrollHint.style.transition = 'opacity 0.5s ease';
  }, { passive: true });
}

// ── YouTube: latest long-form episode ────────────────────────
//
// SAFE KEY SETUP — read this before touching anything below.
//
// This site is static (GitHub Pages), so any key placed directly in this
// file is visible to anyone who views the page source, even if it's never
// committed to the repo. The fix is to never let the browser hold the key
// at all: a small serverless proxy (free on Cloudflare Workers) holds the
// real YouTube API key as an encrypted secret, and this file just calls
// that proxy's URL. See /worker/README.md in this project for the full
// 10-minute setup — you only need to do it once.
//
// Once your proxy is deployed, paste its URL below. Nothing secret ever
// lives in this file or in GitHub.
const PROXY_URL = 'https://YOUR-WORKER-SUBDOMAIN.workers.dev/latest-video';
const MIN_SECS  = 4 * 60;

async function loadLatestEpisode() {
  const embedWrap = document.getElementById('episodeEmbed');
  const titleEl   = document.getElementById('episodeTitle');
  if (!embedWrap) return;

  if (PROXY_URL.includes('YOUR-WORKER-SUBDOMAIN')) {
    // Proxy not set up yet — leave the placeholder embed in place.
    if (titleEl) titleEl.textContent = '';
    return;
  }

  try {
    const res  = await fetch(PROXY_URL);
    if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
    const data = await res.json();

    if (!data?.id) return;

    embedWrap.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${data.id}?rel=0&modestbranding=1&color=white"
        title="${(data.title || '').replace(/"/g,'&quot;')}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen loading="lazy"
      ></iframe>`;
    if (titleEl) titleEl.textContent = data.title || '';
  } catch (e) {
    console.warn('Latest episode fetch error:', e);
  }
}

loadLatestEpisode();
