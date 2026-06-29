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
  '.about-inner, .episode-inner, .footer-content, .about-title, .about-body, .image-placeholder'
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
// To enable: replace YOUR_YOUTUBE_API_KEY with your real key.
// Get one free at: https://console.cloud.google.com (YouTube Data API v3)
const YT_API_KEY   = 'YOUR_YOUTUBE_API_KEY';
const CHANNEL_ID   = 'UCbCUbULQdUKxiu4LdMonl6g';
const MIN_SECS     = 4 * 60;

async function loadLatestEpisode() {
  const embedWrap = document.getElementById('episodeEmbed');
  const titleEl   = document.getElementById('episodeTitle');
  if (!embedWrap) return;

  if (YT_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
    // No key yet — the iframe fallback in HTML is already shown
    if (titleEl) titleEl.textContent = '';
    return;
  }

  try {
    const searchRes  = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`);
    const searchData = await searchRes.json();
    if (!searchData.items?.length) return;

    const ids        = searchData.items.map(v => v.id.videoId).join(',');
    const detailRes  = await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${YT_API_KEY}&id=${ids}&part=contentDetails,snippet`);
    const detailData = await detailRes.json();

    const longForm = detailData.items
      .map(v => ({ id: v.id, title: v.snippet.title, dur: parseDur(v.contentDetails.duration) }))
      .filter(v => v.dur >= MIN_SECS);

    if (!longForm.length) return;

    const latest = longForm[0];
    embedWrap.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${latest.id}?rel=0&modestbranding=1&color=white"
        title="${latest.title.replace(/"/g,'&quot;')}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen loading="lazy"
      ></iframe>`;
    if (titleEl) titleEl.textContent = latest.title;
  } catch (e) {
    console.warn('YouTube fetch error:', e);
  }
}

function parseDur(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? (parseInt(m[1]||0)*3600)+(parseInt(m[2]||0)*60)+parseInt(m[3]||0) : 0;
}

loadLatestEpisode();
