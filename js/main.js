/* ===========================
   OUT OF THE LOT — MAIN JS
   Shared across every page
   =========================== */

// ── Footer year (every page) ────────────────────────────────
const footerYearEl = document.getElementById('footerYear');
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();

// ── Navbar scroll state ───────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── Mobile nav toggle ─────────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Scroll-reveal ─────────────────────────────────────────────
const revealEls = document.querySelectorAll(
  '.about-inner, .episode-inner, .section-eyebrow, .about-title, .about-body, .image-placeholder, .page-about-layout, .page-about-body, .timeline-inner, .contact-grid, .playlist-inner, .lancia-figure, .poem-wrap'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.12 }
);
revealEls.forEach(el => revealObserver.observe(el));

// ── Scroll hint fade-out ──────────────────────────────────────
const scrollHint = document.getElementById('scrollHint');
if (scrollHint) {
  window.addEventListener('scroll', () => {
    scrollHint.style.opacity = window.scrollY > 80 ? '0' : '1';
    scrollHint.style.transition = 'opacity 0.5s ease';
  }, { passive: true });
}

/* ================================================================
   YOUTUBE — fetch latest long-form episode
   ------------------------------------------------------------------
   SECURITY NOTE:
   Your YouTube Data API key must NEVER live in this file, because
   this repo is public on GitHub and anyone could copy the key and
   run up your quota (or worse).

   Instead, this site calls a small serverless proxy (a Cloudflare
   Worker) that holds the real API key as a private secret on
   Cloudflare's servers. The browser only ever talks to the Worker
   URL below, which is NOT sensitive — it can't be used to do
   anything without the secret key that only lives on Cloudflare.

   See README.md → "YouTube API — Safe Setup" for the 10-minute
   walkthrough to deploy the Worker and connect it here.
   ================================================================ */

const WORKER_URL = 'https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev'; // <-- REPLACE after deploying the Worker (see README)

async function loadLatestEpisode() {
  const embedWrap = document.getElementById('episodeEmbed');
  const titleEl   = document.getElementById('episodeTitle');
  if (!embedWrap) return; // this page doesn't have the latest-episode block

  if (!WORKER_URL || WORKER_URL.includes('YOUR-WORKER-NAME')) {
    showFallbackEmbed(embedWrap, titleEl);
    return;
  }

  try {
    const res  = await fetch(WORKER_URL);
    const data = await res.json();
    if (data.error || !data.id) throw new Error(data.error || 'No video returned');

    embedWrap.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${data.id}?rel=0&modestbranding=1&color=white"
        title="${escapeHtml(data.title)}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    `;
    if (titleEl) titleEl.textContent = data.title;

  } catch (err) {
    console.warn('YouTube proxy error:', err);
    showFallbackEmbed(embedWrap, titleEl);
  }
}

function showFallbackEmbed(embedWrap, titleEl) {
  // Shows the channel page embed as a graceful fallback
  embedWrap.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed?listType=user_uploads&list=OutoftheLotMedia&rel=0&modestbranding=1"
      title="Out of the Lot — Latest Episodes"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      loading="lazy"
    ></iframe>
  `;
  if (titleEl) {
    titleEl.textContent = 'Connect the YouTube proxy in main.js to show the latest episode automatically.';
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

loadLatestEpisode();
