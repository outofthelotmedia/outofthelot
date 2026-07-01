/* ================================================================
   OUT OF THE LOT — YouTube API Proxy (Cloudflare Worker)
   ------------------------------------------------------------------
   This is the ONLY place your real YouTube API key should ever be
   pasted. It runs on Cloudflare's servers, not in the public GitHub
   repo, and not in the browser. Follow README.md to deploy it and
   store the key as a secret.
   ================================================================ */

const CHANNEL_ID   = 'UCbCUbULQdUKxiu4LdMonl6g';
const MIN_DURATION = 4 * 60; // 4 minutes, in seconds — used to skip Shorts

export default {
  async fetch(request, env) {
    // Restrict which sites are allowed to call this Worker.
    // Replace with your real domain(s) once you know them.
    const ALLOWED_ORIGINS = [
      'https://outofthelot.com',
      'https://www.outofthelot.com',
      'http://localhost:8000',
    ];

    const origin = request.headers.get('Origin') || '';
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const apiKey = env.YOUTUBE_API_KEY; // set with: wrangler secret put YOUTUBE_API_KEY

      // 1. Fetch latest 10 uploads from the channel
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;
      const searchRes  = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (!searchData.items?.length) throw new Error('No videos found');

      // 2. Get durations so we can filter out Shorts
      const ids        = searchData.items.map(v => v.id.videoId).join(',');
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${ids}&part=contentDetails,snippet`;
      const detailsRes  = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      // 3. Keep only long-form videos, most recent first
      const longForm = detailsData.items
        .map(v => ({
          id:       v.id,
          title:    v.snippet.title,
          duration: parseDuration(v.contentDetails.duration),
        }))
        .filter(v => v.duration >= MIN_DURATION);

      if (!longForm.length) throw new Error('No long-form videos found');

      return new Response(JSON.stringify(longForm[0]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

// ISO 8601 duration → seconds (e.g. PT1H23M45S → 5025)
function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}
