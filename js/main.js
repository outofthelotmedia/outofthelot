/* ===========================
   OUT OF THE LOT — MAIN JS
   =========================== */

const CHANNEL_ID   = 'UCbCUbULQdUKxiu4LdMonl6g';
const MIN_DURATION = 4 * 60; // 4 minutes in seconds

// ── Footer year ──────────────────────────────────────────────
document.getElementById('footerYear').textContent = new Date().getFullYear();

// ── Navbar scroll state ───────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

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
  '.about-inner, .episode-inner, .section-eyebrow, .about-title, .about-body, .image-placeholder'
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

// ── YouTube: fetch latest long-form episode ───────────────────
// Uses YouTube Data API v3 — replace API_KEY with yours (free, takes 2 min)
// See README.md for instructions.

const YT_API_KEY = AIzaSyBQjLcN8QGWXjVlUFudYsn4Y7nV8z3A1Mw; // <-- REPLACE THIS

async function loadLatestEpisode() {
  const embedWrap   = document.getElementById('episodeEmbed');
  const titleEl     = document.getElementById('episodeTitle');

  // If no API key yet, show a placeholder embed of the channel
  if (YT_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
    showFallbackEmbed(embedWrap, titleEl);
    return;
  }

  try {
    // 1. Fetch latest 10 videos from channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;
    const searchRes  = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items?.length) throw new Error('No videos found');

    // 2. Get durations to filter long-form
    const ids         = searchData.items.map(v => v.id.videoId).join(',');
    const detailsUrl  = `https://www.googleapis.com/youtube/v3/videos?key=${YT_API_KEY}&id=${ids}&part=contentDetails,snippet`;
    const detailsRes  = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    // 3. Filter to videos longer than MIN_DURATION and pick most recent
    const longForm = detailsData.items
      .map(v => ({
        id:       v.id,
        title:    v.snippet.title,
        duration: parseDuration(v.contentDetails.duration),
      }))
      .filter(v => v.duration >= MIN_DURATION);

    if (!longForm.length) throw new Error('No long-form videos found');

    const latest = longForm[0];

    // 4. Render embed
    embedWrap.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${latest.id}?rel=0&modestbranding=1&color=white"
        title="${escapeHtml(latest.title)}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    `;

    titleEl.textContent = latest.title;

  } catch (err) {
    console.warn('YouTube API error:', err);
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
    titleEl.textContent = '— Add your YouTube API key to show the latest episode automatically —';
  }
}

// ISO 8601 duration → seconds (e.g. PT1H23M45S → 5025)
function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

loadLatestEpisode();
