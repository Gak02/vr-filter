// ==========================================
// Wedding Photo Booth - Heisei Purikura Style
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
};

// ------------------------------------------
// Particle colors
// ------------------------------------------
const HEART_COLORS = ['#FF69B4', '#FF1493', '#FFB6C1', '#FF6EB4', '#FFB6D9', '#FF82AB'];
const STAR_COLORS = ['#FFD700', '#FFF68F', '#FFEC8B', '#FFD39B', '#FFDAB9', '#FFF'];
const SPARKLE_COLORS = ['#fff', '#FFD700', '#FF69B4', '#DA70D6', '#87CEFA'];

// ------------------------------------------
// Particle types
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
// Drawing functions
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

  const spikes = 5;
  const outerR = p.size;
  const innerR = p.size * 0.4;

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = p.color;
  ctx.fill();

  // Glow effect
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

  // 4-pointed star sparkle
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
  const sparkleChars = ['\u2726', '\u2727', '\u2728', '\u2606', '\u00B7'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('span');
    el.className = 'bg-sparkle';
    el.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
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
// Main Application
// ------------------------------------------
class WeddingPhotoBooth {
  constructor() {
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

    this.init();
  }

  async init() {
    createBgSparkles();
    this.setupEventListeners();
    await this.initCamera();
    this.setupCanvas();
    this.animate();
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

  // --- Particle spawning ---
  spawnParticle() {
    const roll = Math.random();
    if (roll < 0.45) {
      this.particles.push(new Heart(this.displayW, this.displayH));
    } else if (roll < 0.75) {
      this.particles.push(new Star(this.displayW, this.displayH));
    } else {
      this.particles.push(new Sparkle(this.displayW, this.displayH));
    }
  }

  // --- Animation Loop ---
  animate(timestamp = 0) {
    if (!this.animating) return;

    if (timestamp - this.lastSpawn > CONFIG.spawnInterval && this.particles.length < CONFIG.maxParticles) {
      this.spawnParticle();
      this.lastSpawn = timestamp;
    }

    this.effectsCtx.clearRect(0, 0, this.displayW, this.displayH);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (!p.alive) {
        this.particles.splice(i, 1);
        continue;
      }
      drawParticle(this.effectsCtx, p);
    }

    requestAnimationFrame((t) => this.animate(t));
  }

  // --- Countdown & Capture ---
  async startCapture() {
    if (this.capturing) return;
    this.capturing = true;

    // Countdown
    this.countdown.classList.add('active');
    for (let i = CONFIG.countdownSeconds; i >= 1; i--) {
      this.countdownNum.textContent = i;
      this.countdownNum.style.animation = 'none';
      // Force reflow
      void this.countdownNum.offsetWidth;
      this.countdownNum.style.animation = 'countPop 0.8s ease';
      await this.wait(1000);
    }
    this.countdown.classList.remove('active');

    // Flash
    this.flash.classList.add('active');
    setTimeout(() => this.flash.classList.remove('active'), 200);

    // Compose
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

    // --- Background ---
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#FFE4F0');
    bgGrad.addColorStop(0.3, '#F0E0FF');
    bgGrad.addColorStop(0.6, '#E4E8FF');
    bgGrad.addColorStop(1, '#FFE4F0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Polka dots
    this.drawPolkaDots(ctx, W, H);

    // --- Decorative border ---
    this.drawPurikuraBorder(ctx, W, H);

    // --- Header area ---
    ctx.textAlign = 'center';

    // Decorative line
    ctx.fillStyle = '#FF69B4';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(W * 0.2, 55, W * 0.6, 2);
    ctx.globalAlpha = 1;

    // Message
    ctx.font = '900 26px "Nunito", sans-serif';
    this.drawOutlinedText(ctx, `\u2661 ${CONFIG.message} \u2661`, W / 2, 48, '#fff', '#FF69B4', 2);

    // Names
    ctx.font = '72px "Sacramento", cursive';
    this.drawOutlinedText(ctx, `${CONFIG.groomName}  &  ${CONFIG.brideName}`, W / 2, 135, '#fff', '#DA70D6', 3);

    // Date
    ctx.font = '900 24px "Nunito", sans-serif';
    this.drawOutlinedText(ctx, `\u2727 ${CONFIG.date} \u2727`, W / 2, 175, '#FFD700', '#FF69B4', 2);

    // Decorative line
    ctx.fillStyle = '#FF69B4';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(W * 0.2, 190, W * 0.6, 2);
    ctx.globalAlpha = 1;

    // --- Photo area ---
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
    this.roundRect(ctx, padding - 4, photoY - 4, photoW + 8, photoH + 8, 20);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    this.roundRect(ctx, padding - 1, photoY - 1, photoW + 2, photoH + 2, 18);
    ctx.stroke();

    // Draw camera image (mirrored, cropped to fit)
    ctx.save();
    ctx.beginPath();
    this.roundRect(ctx, padding, photoY, photoW, photoH, 16);
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

    // Draw particles onto photo area
    ctx.save();
    const scX = photoW / this.displayW;
    const scY = photoH / this.displayH;
    ctx.translate(padding, photoY);
    ctx.beginPath();
    ctx.rect(0, 0, photoW, photoH);
    ctx.clip();
    for (const p of this.particles) {
      if (!p.alive) continue;
      const scaled = {
        ...p,
        x: p.x * scX,
        y: p.y * scY,
        size: p.size * scX,
      };
      drawParticle(ctx, scaled);
    }
    ctx.restore();

    // --- Footer stamps ---
    const footerY = photoY + photoH + 30;
    ctx.font = '900 22px "Nunito", sans-serif';
    this.drawOutlinedText(ctx, '\u2661 Best Day Ever \u2661', W / 2, footerY, '#fff', '#DA70D6', 2);

    // Scattered stamps on footer
    this.drawStamps(ctx, W, footerY + 15, H - footerY - 20);

    // --- Corner deco on photo ---
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
    // Outer glow
    ctx.save();
    ctx.shadowColor = 'rgba(255, 105, 180, 0.4)';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = borderW;
    this.roundRect(ctx, borderW, borderW, w - borderW * 2, h - borderW * 2, 30);
    ctx.stroke();
    ctx.restore();

    // Inner white line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    this.roundRect(ctx, borderW + 6, borderW + 6, w - borderW * 2 - 12, h - borderW * 2 - 12, 26);
    ctx.stroke();

    // Corner hearts
    const corners = [
      [24, 24], [w - 24, 24], [24, h - 24], [w - 24, h - 24]
    ];
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const [cx, cy] of corners) {
      ctx.fillText('\u2764', cx, cy);
    }

    // Edge stars
    const edgeStars = [
      [w / 2, 14], [w / 2, h - 14], [14, h / 2], [w - 14, h / 2]
    ];
    ctx.font = '16px sans-serif';
    for (const [cx, cy] of edgeStars) {
      ctx.fillText('\u2B50', cx, cy);
    }
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
    const positions = [
      [x + 20, y + 20], [x + w - 20, y + 20],
      [x + 20, y + h - 20], [x + w - 20, y + h - 20],
    ];
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

  roundRect(ctx, x, y, w, h, r) {
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

document.addEventListener('DOMContentLoaded', () => {
  new WeddingPhotoBooth();
});
