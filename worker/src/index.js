// Wedding Photo Booth - Cloudflare Worker
// Handles photo upload to R2, serving photos, and gallery

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'POST' && path === '/upload') {
      return handleUpload(request, env, url);
    }

    if (request.method === 'GET' && path === '/gallery') {
      return handleGallery(env, url);
    }

    if (request.method === 'GET' && path.startsWith('/photo/')) {
      return handleGetPhoto(path, env);
    }

    return new Response('Wedding Photo API', {
      status: 200,
      headers: CORS_HEADERS,
    });
  },
};

async function handleUpload(request, env, url) {
  try {
    const body = await request.json();
    const base64Data = body.image;

    if (!base64Data) {
      return new Response(JSON.stringify({ error: 'No image data' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Uint8Array.from(atob(base64Clean), c => c.charCodeAt(0));

    const photoId = generateId();
    const key = `photos/${photoId}.jpg`;

    await env.PHOTOS.put(key, imageBytes, {
      httpMetadata: { contentType: 'image/jpeg' },
    });

    const photoUrl = `${url.origin}/photo/${photoId}`;

    return new Response(JSON.stringify({ url: photoUrl, id: photoId }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

async function handleGetPhoto(path, env) {
  const photoId = path.replace('/photo/', '');
  const key = `photos/${photoId}.jpg`;

  const object = await env.PHOTOS.get(key);
  if (!object) {
    return new Response('<h1>Photo not found</h1>', {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/html' },
    });
  }

  const headers = new Headers(CORS_HEADERS);
  headers.set('Content-Type', 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=86400');
  headers.set('Content-Disposition', `inline; filename="wedding-photo-${photoId}.jpg"`);

  return new Response(object.body, { status: 200, headers });
}

async function handleGallery(env, url) {
  const listed = await env.PHOTOS.list({ prefix: 'photos/', limit: 500 });

  const photos = listed.objects
    .sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded))
    .map(obj => {
      const id = obj.key.replace('photos/', '').replace('.jpg', '');
      const date = new Date(obj.uploaded);
      const dateStr = date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
      return { id, url: `${url.origin}/photo/${id}`, date: dateStr, size: obj.size };
    });

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wedding Photo Gallery</title>
  <link href="https://fonts.googleapis.com/css2?family=Sacramento&family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Nunito', sans-serif;
      background: linear-gradient(135deg, #FFD1EC 0%, #E8CDFF 30%, #D1E8FF 60%, #FFD1EC 100%);
      background-size: 400% 400%;
      animation: bgShift 12s ease infinite;
      min-height: 100vh;
      padding: 20px;
    }
    @keyframes bgShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .header {
      text-align: center;
      padding: 30px 0 20px;
    }
    .header h1 {
      font-family: 'Sacramento', cursive;
      font-size: 3rem;
      color: #fff;
      text-shadow:
        -2px -2px 0 #DA70D6, 2px -2px 0 #DA70D6,
        -2px 2px 0 #DA70D6, 2px 2px 0 #DA70D6,
        0 0 20px rgba(218, 112, 214, 0.6);
    }
    .header p {
      color: #fff;
      font-weight: 900;
      font-size: 1rem;
      text-shadow: -1px -1px 0 #FF69B4, 1px -1px 0 #FF69B4,
        -1px 1px 0 #FF69B4, 1px 1px 0 #FF69B4;
      margin-top: 4px;
    }
    .count {
      text-align: center;
      color: #DA70D6;
      font-weight: 900;
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .photo-card {
      background: rgba(255,255,255,0.9);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 0 0 3px #FF69B4, 0 0 0 6px #fff,
        0 8px 24px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
    }
    .photo-card:hover { transform: translateY(-4px); }
    .photo-card img {
      width: 100%;
      aspect-ratio: 3/4;
      object-fit: cover;
      display: block;
      cursor: pointer;
    }
    .photo-info {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .photo-date {
      font-size: 0.75rem;
      font-weight: 700;
      color: #DA70D6;
    }
    .download-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 14px;
      background: linear-gradient(135deg, #FF69B4, #DA70D6);
      color: #fff;
      border: 2px solid #fff;
      border-radius: 50px;
      font-family: 'Nunito', sans-serif;
      font-size: 0.8rem;
      font-weight: 900;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.15s ease;
    }
    .download-btn:hover { transform: scale(1.05); }
    .download-btn:active { transform: scale(0.95); }
    .empty {
      text-align: center;
      padding: 60px 20px;
      color: #DA70D6;
      font-weight: 900;
      font-size: 1.2rem;
    }
    .download-all {
      display: block;
      max-width: 300px;
      margin: 0 auto 24px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #FF69B4, #FF1493);
      color: #fff;
      border: 3px solid #fff;
      border-radius: 50px;
      font-family: 'Nunito', sans-serif;
      font-size: 1rem;
      font-weight: 900;
      cursor: pointer;
      text-align: center;
      box-shadow: 0 4px 15px rgba(255,20,147,0.3);
      transition: transform 0.15s ease;
    }
    .download-all:hover { transform: scale(1.03); }
    .download-all:active { transform: scale(0.97); }
  </style>
</head>
<body>
  <div class="header">
    <h1>Wedding Photo Gallery</h1>
    <p>\u2661 Thank you for celebrating with us \u2661</p>
  </div>
  <p class="count">${photos.length} 枚の写真</p>
  ${photos.length > 0 ? `<button class="download-all" onclick="downloadAll()">📥 全写真をダウンロード</button>` : ''}
  <div class="gallery">
    ${photos.length === 0 ? '<div class="empty">まだ写真がありません 📷</div>' : ''}
    ${photos.map(p => `
      <div class="photo-card">
        <img src="${p.url}" alt="Wedding Photo" loading="lazy" onclick="window.open('${p.url}', '_blank')">
        <div class="photo-info">
          <span class="photo-date">${p.date}</span>
          <a href="${p.url}" download="wedding-photo-${p.id}.jpg" class="download-btn">💾 保存</a>
        </div>
      </div>
    `).join('')}
  </div>
  <script>
    async function downloadAll() {
      const links = document.querySelectorAll('.download-btn');
      for (const link of links) {
        link.click();
        await new Promise(r => setTimeout(r, 500));
      }
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
