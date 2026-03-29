// ==========================================
// Wedding Photo Booth - Heisei Purikura Style
// with AI Thought Bubbles
// ==========================================

const CONFIG = {
  groomName: 'Taro',
  brideName: 'Hanako',
  date: '2026.04.18',
  message: 'Welcome to Our Wedding',
  photoBaseUrl: 'https://our-wedding.example.com/photos/',
  autoCloseSeconds: 30,
  maxParticles: 35,
  spawnInterval: 300,
  countdownSeconds: 3,
  // Thought bubble settings
  thoughtRefreshInterval: 8000,  // ms between new thoughts
  maxThoughts: 5,                // max simultaneous thoughts
};

// ------------------------------------------
// Particle colors
// ------------------------------------------
const HEART_COLORS = ['#FF69B4', '#FF1493', '#FFB6C1', '#FF6EB4', '#FFB6D9', '#FF82AB'];
const STAR_COLORS = ['#FFD700', '#FFF68F', '#FFEC8B', '#FFD39B', '#FFDAB9', '#FFF'];
const SPARKLE_COLORS = ['#fff', '#FFD700', '#FF69B4', '#DA70D6', '#87CEFA'];

// ------------------------------------------
// Particle classes
// ------------------------------------------
class Heart {
  constructor(w, h) {
    this.type = 'heart';
    this.canvasW = w;
    this.canvasH = h;
    this.reset();
  }
  reset() {
    this.x = Math.random() * this.canvasW;
    this.y = this.canvasH + 20 + Math.random() * 40;
    this.size = 10 + Math.random() * 20;
    this.speedY = 0.5 + Math.random() * 1.0;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.015 + Math.random() * 0.015;
    this.wobbleAmt = 0.4 + Math.random() * 0.6;
    this.opacity = 0.5 + Math.random() * 0.5;
    this.fadeRate = 0.001 + Math.random() * 0.002;
    this.rotation = (Math.random() - 0.5) * 0.5;
    this.rotSpeed = (Math.random() - 0.5) * 0.01;
    this.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    this.outlined = Math.random() < 0.3;
    this.age = 0;
    this.alive = true;
  }
  update() {
    this.age++;
    this.y -= this.speedY;
    this.x += Math.sin(this.age * this.wobbleSpeed + this.wobblePhase) * this.wobbleAmt;
    this.rotation += this.rotSpeed;
    this.opacity -= this.fadeRate;
    if (this.y < -this.size * 2 || this.opacity <= 0) this.alive = false;
  }
}

class Star {
  constructor(w, h) {
    this.type = 'star';
    this.canvasW = w;
    this.canvasH = h;
    this.reset();
  }
  reset() {
    this.x = Math.random() * this.canvasW;
    this.y = this.canvasH + 10 + Math.random() * 30;
    this.size = 6 + Math.random() * 14;
    this.speedY = 0.3 + Math.random() * 0.8;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.01 + Math.random() * 0.015;
    this.wobbleAmt = 0.3 + Math.random() * 0.5;
    this.opacity = 0.5 + Math.random() * 0.5;
    this.fadeRate = 0.001 + Math.random() * 0.002;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = 0.01 + Math.random() * 0.02;
    this.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    this.age = 0;
    this.alive = true;
  }
  update() {
    this.age++;
    this.y -= this.speedY;
    this.x += Math.sin(this.age * this.wobbleSpeed + this.wobblePhase) * this.wobbleAmt;
    this.rotation += this.rotSpeed;
    this.opacity -= this.fadeRate;
    if (this.y < -this.size * 2 || this.opacity <= 0) this.alive = false;
  }
}

class Sparkle {
  constructor(w, h) {
    this.type = 'sparkle';
    this.canvasW = w;
    this.canvasH = h;
    this.reset();
  }
  reset() {
    this.x = Math.random() * this.canvasW;
    this.y = Math.random() * this.canvasH;
    this.size = 3 + Math.random() * 8;
    this.opacity = 0;
    this.maxOpacity = 0.6 + Math.random() * 0.4;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.03 + Math.random() * 0.04;
    this.color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
    this.lifetime = 120 + Math.random() * 180;
    this.age = 0;
    this.alive = true;
  }
  update() {
    this.age++;
    this.opacity = this.maxOpacity * Math.sin((this.age / this.lifetime) * Math.PI);
    if (this.age >= this.lifetime) this.alive = false;
  }
}

// ------------------------------------------
// Particle drawing
// ------------------------------------------
function drawHeart(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;
  const s = p.size;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s * 0.01, s * 0.1, -s * 0.45, -s * 0.2, 0, -s * 0.5);
  ctx.bezierCurveTo(s * 0.45, -s * 0.2, s * 0.01, s * 0.1, 0, s * 0.3);
  if (p.outlined) {
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  ctx.restore();
}

function drawStar(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;
  const spikes = 5, outerR = p.size, innerR = p.size * 0.4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const x = Math.cos(angle) * r, y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = p.color;
  ctx.shadowColor = p.color;
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.restore();
}

function drawSparkle(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = p.opacity;
  const s = p.size;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.1, -s * 0.1, s * 0.1, -s * 0.1, s, 0);
  ctx.bezierCurveTo(s * 0.1, s * 0.1, s * 0.1, s * 0.1, 0, s);
  ctx.bezierCurveTo(-s * 0.1, s * 0.1, -s * 0.1, s * 0.1, -s, 0);
  ctx.bezierCurveTo(-s * 0.1, -s * 0.1, -s * 0.1, -s * 0.1, 0, -s);
  ctx.fillStyle = p.color;
  ctx.fill();
  ctx.restore();
}

function drawParticle(ctx, p) {
  if (p.type === 'heart') drawHeart(ctx, p);
  else if (p.type === 'star') drawStar(ctx, p);
  else if (p.type === 'sparkle') drawSparkle(ctx, p);
}

// ------------------------------------------
// Background sparkles (DOM)
// ------------------------------------------
function createBgSparkles() {
  const container = document.getElementById('bgSparkles');
  if (!container) return;
  const chars = ['\u2726', '\u2727', '\u2728', '\u2606', '\u00B7'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('span');
    el.className = 'bg-sparkle';
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.top = Math.random() * 100 + '%';
    el.style.fontSize = (8 + Math.random() * 16) + 'px';
    el.style.animationDuration = (1.5 + Math.random() * 2.5) + 's';
    el.style.animationDelay = (Math.random() * 4) + 's';
    el.style.color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
    container.appendChild(el);
  }
}

// ------------------------------------------
// Thought Bubble Drawing
// ------------------------------------------
function drawThoughtBubble(ctx, x, y, text, maxWidth) {
  ctx.save();
  ctx.font = '900 15px "Zen Maru Gothic", "Nunito", sans-serif';

  // Word wrap
  const lines = wrapText(ctx, text, maxWidth - 24);
  const lineHeight = 20;
  const paddingX = 14;
  const paddingY = 10;
  const bubbleW = maxWidth;
  const bubbleH = lines.length * lineHeight + paddingY * 2;
  const bubbleX = x - bubbleW / 2;
  const bubbleY = y - bubbleH;

  // Main bubble
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.strokeStyle = '#FF69B4';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(255, 105, 180, 0.25)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  roundRectPath(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 16);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.stroke();

  // Thought dots (3 circles getting smaller)
  const dotX = x;
  const dotStartY = bubbleY + bubbleH + 4;
  for (let i = 0; i < 3; i++) {
    const r = 5 - i * 1.5;
    const dy = dotStartY + i * (r * 2 + 3);
    ctx.beginPath();
    ctx.arc(dotX - 5 + i * 3, dy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Text
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowBlur = 0;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, bubbleY + paddingY + i * lineHeight);
  }

  ctx.restore();

  return { x: bubbleX, y: bubbleY, w: bubbleW, h: bubbleH };
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let currentLine = '';
  for (const char of text) {
    const testLine = currentLine + char;
    if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ------------------------------------------
// Claude API Integration
// ------------------------------------------
async function generateThought(apiKey, numFaces) {
  const prompt = `あなたは結婚式のフォトブースに設置されたAIです。
カメラに映っているゲスト（${numFaces}人）の「今考えていそうなこと」を${numFaces}個生成してください。

ルール:
- 結婚式にちなんだ面白い・可愛い内容にする
- 1つあたり15文字以内の短い日本語
- 絵文字を1つ入れる
- ポジティブで楽しい内容のみ
- JSON配列で返す（例: ["ケーキ楽しみ🎂", "泣きそう😭"]）
- JSON配列のみを返し、他のテキストは含めない`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('API error:', response.status);
      return null;
    }

    const data = await response.json();
    const text = data.content[0].text.trim();
    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return null;
  } catch (err) {
    console.error('Thought generation error:', err);
    return null;
  }
}

// ------------------------------------------
// Settings Manager
// ------------------------------------------
class SettingsManager {
  static load() {
    return {
      apiKey: localStorage.getItem('wb_apiKey') || '',
      groomName: localStorage.getItem('wb_groomName') || 'Taro',
      brideName: localStorage.getItem('wb_brideName') || 'Hanako',
      date: localStorage.getItem('wb_date') || '2026.04.18',
      message: localStorage.getItem('wb_message') || 'Welcome to Our Wedding',
    };
  }

  static save(settings) {
    localStorage.setItem('wb_apiKey', settings.apiKey);
    localStorage.setItem('wb_groomName', settings.groomName);
    localStorage.setItem('wb_brideName', settings.brideName);
    localStorage.setItem('wb_date', settings.date);
    localStorage.setItem('wb_message', settings.message);
  }

  static hasApiKey() {
    return !!localStorage.getItem('wb_apiKey');
  }
}

// ------------------------------------------
// Main Application
// ------------------------------------------
class WeddingPhotoBooth {
  constructor(settings) {
    CONFIG.groomName = settings.groomName;
    CONFIG.brideName = settings.brideName;
    CONFIG.date = settings.date;
    CONFIG.message = settings.message;
    this.apiKey = settings.apiKey;

    // Update displayed text
    document.getElementById('dispNames').innerHTML =
      `${CONFIG.groomName} <span class="amp">&</span> ${CONFIG.brideName}`;
    document.getElementById('dispMessage').textContent =
      `\u2661 ${CONFIG.message} \u2661`;
    document.getElementById('dispDate').textContent =
      `\u2727 ${CONFIG.date} \u2727`;

    this.video = document.getElementById('video');
    this.effectsCanvas = document.getElementById('effectsCanvas');
    this.effectsCtx = this.effectsCanvas.getContext('2d');
    this.compositeCanvas = document.getElementById('compositeCanvas');
    this.compositeCtx = this.compositeCanvas.getContext('2d');
    this.photoCanvas = document.getElementById('photoCanvas');
    this.photoCtx = this.photoCanvas.getContext('2d');
    this.flash = document.getElementById('flash');
    this.countdown = document.getElementById('countdown');
    this.countdownNum = document.getElementById('countdownNum');
    this.modalOverlay = document.getElementById('modalOverlay');
    this.captureBtn = document.getElementById('captureBtn');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.retakeBtn = document.getElementById('retakeBtn');
    this.autoCloseBar = document.getElementById('autoCloseBar');
    this.qrContainer = document.getElementById('qrCode');

    this.particles = [];
    this.lastSpawn = 0;
    this.animating = true;
    this.autoCloseTimer = null;
    this.currentPhotoData = null;
    this.photoCounter = 0;
    this.capturing = false;

    // Face detection state
    this.faceDetections = [];
    this.thoughts = [];       // { faceIndex, text, x, y }
    this.lastThoughtTime = 0;
    this.isGeneratingThoughts = false;
    this.faceModelLoaded = false;

    this.init();
  }

  async init() {
    createBgSparkles();
    this.setupEventListeners();
    await this.initCamera();
    this.setupCanvas();
    await this.loadFaceModel();
    this.animate();
    this.startFaceDetectionLoop();
  }

  async loadFaceModel() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
      this.faceModelLoaded = true;
      console.log('Face detection model loaded');
    } catch (err) {
      console.error('Face model load error:', err);
    }
  }

  async initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      this.video.srcObject = stream;
      await this.video.play();
    } catch (err) {
      console.error('Camera error:', err);
      const container = document.getElementById('cameraContainer');
      const msg = document.createElement('div');
      msg.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.1rem;text-align:center;padding:20px;';
      msg.textContent = 'カメラへのアクセスを許可してください';
      container.appendChild(msg);
    }
  }

  setupCanvas() {
    const container = document.getElementById('cameraContainer');
    const update = () => {
      const r = container.getBoundingClientRect();
      this.effectsCanvas.width = r.width * window.devicePixelRatio;
      this.effectsCanvas.height = r.height * window.devicePixelRatio;
      this.effectsCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      this.displayW = r.width;
      this.displayH = r.height;
    };
    update();
    new ResizeObserver(update).observe(container);
  }

  setupEventListeners() {
    this.captureBtn.addEventListener('click', () => this.startCapture());
    this.retakeBtn.addEventListener('click', () => this.hideModal());
    this.downloadBtn.addEventListener('click', () => this.download());
  }

  // --- Face Detection Loop ---
  startFaceDetectionLoop() {
    setInterval(async () => {
      if (!this.faceModelLoaded || !this.video.videoWidth) return;

      try {
        const detections = await faceapi.detectAllFaces(
          this.video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 })
        );

        // Map detections to display coordinates (mirrored)
        const vw = this.video.videoWidth;
        const vh = this.video.videoHeight;
        const scaleX = this.displayW / vw;
        const scaleY = this.displayH / vh;

        this.faceDetections = detections.map(d => ({
          // Mirror the x coordinate since video is mirrored
          x: this.displayW - (d.box.x + d.box.width / 2) * scaleX,
          y: d.box.y * scaleY,
          w: d.box.width * scaleX,
          h: d.box.height * scaleY,
        }));

        // Generate new thoughts if faces detected and enough time passed
        const now = Date.now();
        if (
          this.faceDetections.length > 0 &&
          now - this.lastThoughtTime > CONFIG.thoughtRefreshInterval &&
          !this.isGeneratingThoughts
        ) {
          this.refreshThoughts();
        }

        // Clear thoughts if no faces
        if (this.faceDetections.length === 0) {
          this.thoughts = [];
        }
      } catch (err) {
        // Silently continue on detection errors
      }
    }, 500);
  }

  async refreshThoughts() {
    this.isGeneratingThoughts = true;
    this.lastThoughtTime = Date.now();

    const numFaces = Math.min(this.faceDetections.length, CONFIG.maxThoughts);
    const results = await generateThought(this.apiKey, numFaces);

    if (results && Array.isArray(results)) {
      this.thoughts = results.slice(0, numFaces).map((text, i) => ({
        text,
        faceIndex: i,
      }));
    }

    this.isGeneratingThoughts = false;
  }

  // --- Particle spawning ---
  spawnParticle() {
    const roll = Math.random();
    if (roll < 0.45) this.particles.push(new Heart(this.displayW, this.displayH));
    else if (roll < 0.75) this.particles.push(new Star(this.displayW, this.displayH));
    else this.particles.push(new Sparkle(this.displayW, this.displayH));
  }

  // --- Animation Loop ---
  animate(timestamp = 0) {
    if (!this.animating) return;

    if (timestamp - this.lastSpawn > CONFIG.spawnInterval && this.particles.length < CONFIG.maxParticles) {
      this.spawnParticle();
      this.lastSpawn = timestamp;
    }

    this.effectsCtx.clearRect(0, 0, this.displayW, this.displayH);

    // Draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (!p.alive) { this.particles.splice(i, 1); continue; }
      drawParticle(this.effectsCtx, p);
    }

    // Draw thought bubbles
    for (const thought of this.thoughts) {
      const face = this.faceDetections[thought.faceIndex];
      if (!face) continue;
      const bubbleX = face.x;
      const bubbleY = face.y - 15;
      const maxBubbleW = Math.min(160, this.displayW * 0.35);
      drawThoughtBubble(this.effectsCtx, bubbleX, bubbleY, thought.text, maxBubbleW);
    }

    requestAnimationFrame((t) => this.animate(t));
  }

  // --- Countdown & Capture ---
  async startCapture() {
    if (this.capturing) return;
    this.capturing = true;

    this.countdown.classList.add('active');
    for (let i = CONFIG.countdownSeconds; i >= 1; i--) {
      this.countdownNum.textContent = i;
      this.countdownNum.style.animation = 'none';
      void this.countdownNum.offsetWidth;
      this.countdownNum.style.animation = 'countPop 0.8s ease';
      await this.wait(1000);
    }
    this.countdown.classList.remove('active');

    this.flash.classList.add('active');
    setTimeout(() => this.flash.classList.remove('active'), 200);

    setTimeout(() => {
      const dataUrl = this.composePhoto();
      this.currentPhotoData = dataUrl;
      this.photoCounter++;
      this.showModal(dataUrl);
      this.capturing = false;
    }, 150);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Compose purikura-style photo ---
  composePhoto() {
    const W = 1080;
    const H = 1440;
    const canvas = this.compositeCanvas;
    const ctx = this.compositeCtx;
    canvas.width = W;
    canvas.height = H;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#FFE4F0');
    bgGrad.addColorStop(0.3, '#F0E0FF');
    bgGrad.addColorStop(0.6, '#E4E8FF');
    bgGrad.addColorStop(1, '#FFE4F0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    this.drawPolkaDots(ctx, W, H);
    this.drawPurikuraBorder(ctx, W, H);

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF69B4';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(W * 0.2, 55, W * 0.6, 2);
    ctx.globalAlpha = 1;

    ctx.font = '900 26px "Nunito", sans-serif';
    this.drawOutlinedText(ctx, `\u2661 ${CONFIG.message} \u2661`, W / 2, 48, '#fff', '#FF69B4', 2);
    ctx.font = '72px "Sacramento", cursive';
    this.drawOutlinedText(ctx, `${CONFIG.groomName}  &  ${CONFIG.brideName}`, W / 2, 135, '#fff', '#DA70D6', 3);
    ctx.font = '900 24px "Nunito", sans-serif';
    this.drawOutlinedText(ctx, `\u2727 ${CONFIG.date} \u2727`, W / 2, 175, '#FFD700', '#FF69B4', 2);

    ctx.fillStyle = '#FF69B4';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(W * 0.2, 190, W * 0.6, 2);
    ctx.globalAlpha = 1;

    // Photo area
    const padding = 50;
    const photoY = 210;
    const photoW = W - padding * 2;
    const photoH = H - photoY - 160;

    // Photo frame
    ctx.save();
    ctx.shadowColor = 'rgba(255, 105, 180, 0.3)';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#FFB6D9';
    ctx.lineWidth = 6;
    roundRectPath(ctx, padding - 4, photoY - 4, photoW + 8, photoH + 8, 20);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    roundRectPath(ctx, padding - 1, photoY - 1, photoW + 2, photoH + 2, 18);
    ctx.stroke();

    // Camera image (mirrored)
    ctx.save();
    ctx.beginPath();
    roundRectPath(ctx, padding, photoY, photoW, photoH, 16);
    ctx.clip();
    ctx.translate(padding + photoW, photoY);
    ctx.scale(-1, 1);

    const vw = this.video.videoWidth || 1280;
    const vh = this.video.videoHeight || 960;
    const photoRatio = photoW / photoH;
    const videoRatio = vw / vh;
    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (videoRatio > photoRatio) {
      sw = vh * photoRatio;
      sx = (vw - sw) / 2;
    } else {
      sh = vw / photoRatio;
      sy = (vh - sh) / 2;
    }
    ctx.drawImage(this.video, sx, sy, sw, sh, 0, 0, photoW, photoH);
    ctx.restore();

    // Particles on photo
    ctx.save();
    const scX = photoW / this.displayW;
    const scY = photoH / this.displayH;
    ctx.translate(padding, photoY);
    ctx.beginPath();
    ctx.rect(0, 0, photoW, photoH);
    ctx.clip();
    for (const p of this.particles) {
      if (!p.alive) continue;
      drawParticle(ctx, { ...p, x: p.x * scX, y: p.y * scY, size: p.size * scX });
    }
    ctx.restore();

    // Thought bubbles on composite photo
    ctx.save();
    ctx.translate(padding, photoY);
    ctx.beginPath();
    ctx.rect(0, 0, photoW, photoH);
    ctx.clip();
    for (const thought of this.thoughts) {
      const face = this.faceDetections[thought.faceIndex];
      if (!face) continue;
      const bx = face.x * scX;
      const by = (face.y - 15) * scY;
      const maxBW = Math.min(200, photoW * 0.35);
      drawThoughtBubble(ctx, bx, by, thought.text, maxBW);
    }
    ctx.restore();

    // Footer
    const footerY = photoY + photoH + 30;
    ctx.font = '900 22px "Nunito", sans-serif';
    this.drawOutlinedText(ctx, '\u2661 Best Day Ever \u2661', W / 2, footerY, '#fff', '#DA70D6', 2);
    this.drawStamps(ctx, W, footerY + 15, H - footerY - 20);
    this.drawCornerStamps(ctx, padding, photoY, photoW, photoH);

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  drawPolkaDots(ctx, w, h) {
    const colors = ['#FFD1EC', '#E8CDFF', '#D1E8FF', '#FFF0F5'];
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 10, 0, Math.PI * 2);
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawPurikuraBorder(ctx, w, h) {
    const borderW = 12;
    ctx.save();
    ctx.shadowColor = 'rgba(255, 105, 180, 0.4)';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = borderW;
    roundRectPath(ctx, borderW, borderW, w - borderW * 2, h - borderW * 2, 30);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    roundRectPath(ctx, borderW + 6, borderW + 6, w - borderW * 2 - 12, h - borderW * 2 - 12, 26);
    ctx.stroke();

    const corners = [[24, 24], [w - 24, 24], [24, h - 24], [w - 24, h - 24]];
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const [cx, cy] of corners) ctx.fillText('\u2764', cx, cy);

    const edges = [[w / 2, 14], [w / 2, h - 14], [14, h / 2], [w - 14, h / 2]];
    ctx.font = '16px sans-serif';
    for (const [cx, cy] of edges) ctx.fillText('\u2B50', cx, cy);
  }

  drawOutlinedText(ctx, text, x, y, fillColor, strokeColor, strokeWidth) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = strokeWidth * 2;
    ctx.strokeStyle = strokeColor;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
  }

  drawStamps(ctx, w, y, h) {
    const stamps = ['\u2661', '\u2606', '\u2726', '\u2727', '\u266A'];
    const colors = ['#FF69B4', '#FFD700', '#DA70D6', '#87CEFA', '#FF6EB4'];
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 12; i++) {
      const sx = 30 + Math.random() * (w - 60);
      const sy = y + Math.random() * h;
      ctx.font = `${10 + Math.random() * 14}px sans-serif`;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.textAlign = 'center';
      ctx.fillText(stamps[Math.floor(Math.random() * stamps.length)], sx, sy);
    }
    ctx.globalAlpha = 1;
  }

  drawCornerStamps(ctx, x, y, w, h) {
    const stamps = ['\u2661', '\u2606', '\u2726', '\u2727'];
    const positions = [[x + 20, y + 20], [x + w - 20, y + 20], [x + 20, y + h - 20], [x + w - 20, y + h - 20]];
    ctx.font = '24px sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < positions.length; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#FF69B4' : '#FFD700';
      ctx.fillText(stamps[i], positions[i][0], positions[i][1]);
    }
    ctx.globalAlpha = 1;
  }

  // --- Modal ---
  showModal(dataUrl) {
    const img = new Image();
    img.onload = () => {
      const maxH = window.innerHeight * 0.6;
      const ratio = img.width / img.height;
      let dispH = maxH;
      let dispW = dispH * ratio;
      if (dispW > window.innerWidth * 0.5) {
        dispW = window.innerWidth * 0.5;
        dispH = dispW / ratio;
      }
      this.photoCanvas.width = img.width;
      this.photoCanvas.height = img.height;
      this.photoCanvas.style.width = dispW + 'px';
      this.photoCanvas.style.height = dispH + 'px';
      this.photoCtx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;

    this.generateQR();
    this.modalOverlay.classList.add('active');
    this.startAutoClose();
  }

  hideModal() {
    this.modalOverlay.classList.remove('active');
    this.clearAutoClose();
  }

  generateQR() {
    this.qrContainer.innerHTML = '';
    const photoId = `photo_${Date.now()}_${this.photoCounter}`;
    const url = `${CONFIG.photoBaseUrl}${photoId}`;
    try {
      new QRCode(this.qrContainer, {
        text: url,
        width: 130,
        height: 130,
        colorDark: '#FF69B4',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M,
      });
    } catch (e) {
      this.qrContainer.innerHTML = '<p style="color:#DA70D6;font-size:0.8rem;">QR生成エラー</p>';
    }
  }

  startAutoClose() {
    this.clearAutoClose();
    const dur = CONFIG.autoCloseSeconds;
    this.autoCloseBar.style.transition = 'none';
    this.autoCloseBar.style.transform = 'scaleX(1)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.autoCloseBar.style.transition = `transform ${dur}s linear`;
        this.autoCloseBar.style.transform = 'scaleX(0)';
      });
    });
    this.autoCloseTimer = setTimeout(() => this.hideModal(), dur * 1000);
  }

  clearAutoClose() {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
    this.autoCloseBar.style.transition = 'none';
    this.autoCloseBar.style.transform = 'scaleX(1)';
  }

  download() {
    if (!this.currentPhotoData) return;
    const a = document.createElement('a');
    a.href = this.currentPhotoData;
    a.download = `wedding_${CONFIG.groomName}_${CONFIG.brideName}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// ------------------------------------------
// Initialization - Settings Screen
// ------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const settingsScreen = document.getElementById('settingsScreen');
  const app = document.getElementById('app');
  const startBtn = document.getElementById('startBtn');

  // Pre-fill saved settings
  const saved = SettingsManager.load();
  if (saved.apiKey) document.getElementById('apiKeyInput').value = saved.apiKey;
  if (saved.groomName) document.getElementById('groomInput').value = saved.groomName;
  if (saved.brideName) document.getElementById('brideInput').value = saved.brideName;
  if (saved.date) document.getElementById('dateInput').value = saved.date;
  if (saved.message) document.getElementById('messageInput').value = saved.message;

  startBtn.addEventListener('click', () => {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    if (!apiKey) {
      alert('APIキーを入力してください');
      return;
    }

    const settings = {
      apiKey,
      groomName: document.getElementById('groomInput').value.trim() || 'Taro',
      brideName: document.getElementById('brideInput').value.trim() || 'Hanako',
      date: document.getElementById('dateInput').value.trim() || '2026.04.18',
      message: document.getElementById('messageInput').value.trim() || 'Welcome to Our Wedding',
    };

    SettingsManager.save(settings);

    // Transition to app
    settingsScreen.style.display = 'none';
    app.style.display = '';

    new WeddingPhotoBooth(settings);
  });
});
