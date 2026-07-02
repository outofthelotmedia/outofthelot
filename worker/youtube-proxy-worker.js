/**
 * OUT OF THE LOT — YouTube "Latest Episode" Proxy
 * -------------------------------------------------
 * Runs on Cloudflare Workers (free tier). This is the ONLY place your
 * real YouTube Data API key ever lives. It is stored as an encrypted
 * Cloudflare secret — never in this file, never in GitHub, never sent
 * to the browser.
 *
 * The site's js/main.js calls this worker's URL. The worker calls
 * YouTube on your behalf, filters for your latest LONG-FORM video
 * (4+ minutes, to skip Shorts), and returns just the video id + title.
 *
 * See worker/README.md for the full setup walkthrough.
 */

const CHANNEL_ID       = 'UCbCUbULQdUKxiu4LdMonl6g';
const MIN_LONGFORM_SEC = 4 * 60;

// Only these origins are allowed to call this worker. Update if your
// domain changes. This keeps randoms from burning your YouTube quota.
const ALLOWED_ORIGINS = [
  'https://outofthelot.com',
  'https://www.outofthelot.com',
  'http://localhost:8000', // handy for local testing, remove if you want
];

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = buildCorsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/latest-video') {
      return json({ error: 'Not found' }, 404, corsHeaders);
    }

    // Cache the result at Cloudflare's edge for 15 minutes so repeat
    // visits don't burn extra YouTube API quota.
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let cached = await cache.match(cacheKey);
    if (cached) return withCors(cached, corsHeaders);

    try {
      const apiKey = env.YOUTUBE_API_KEY; // set via `wrangler secret put`
      if (!apiKey) return json({ error: 'Server not configured' }, 500, corsHeaders);

      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`
      );
      const searchData = await searchRes.json();
      const ids = (searchData.items || []).map(v => v.id.videoId).filter(Boolean);
      if (!ids.length) return json({ id: null }, 200, corsHeaders);

      const detailRes  = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${ids.join(',')}&part=contentDetails,snippet`
      );
      const detailData = await detailRes.json();

      const longForm = (detailData.items || [])
        .map(v => ({ id: v.id, title: v.snippet.title, dur: parseDur(v.contentDetails.duration) }))
        .filter(v => v.dur >= MIN_LONGFORM_SEC);

      const latest = longForm[0] || null;
      const payload = latest ? { id: latest.id, title: latest.title } : { id: null };

      let response = json(payload, 200, corsHeaders);
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=900');
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (err) {
      return json({ error: 'Upstream error' }, 502, corsHeaders);
    }
  },
};

function parseDur(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0) : 0;
}

function buildCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(obj, status, corsHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function withCors(response, corsHeaders) {
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));
  return newResponse;
}
