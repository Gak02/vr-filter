// Wedding Photo Booth - Cloudflare Worker
// Handles photo upload to R2 and serving photos

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
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // POST /upload - Upload a photo
    if (request.method === 'POST' && path === '/upload') {
      return handleUpload(request, env, url);
    }

    // GET /photo/:id - Serve a photo
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

    // Remove data URL prefix if present
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
    // Return a simple HTML page for not found
    return new Response('<h1>Photo not found</h1>', {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/html' },
    });
  }

  const headers = new Headers(CORS_HEADERS);
  headers.set('Content-Type', 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=86400');
  // Allow the browser to display the image and offer download
  headers.set('Content-Disposition', `inline; filename="wedding-photo-${photoId}.jpg"`);

  return new Response(object.body, { status: 200, headers });
}
