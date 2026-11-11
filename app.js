const prizes = [
  { name: '珍鯖鬆', image: 'assets/prize-floss.png', color: '#f7c948', soft: '#fff4c8' },
  { name: '鯖鬆醬心蛋捲', image: 'assets/prize-roll.png', color: '#ef6c5b', soft: '#ffe2dc' },
  { name: '鯖鬆吃雪花酥', image: 'assets/prize-snowflake.png', color: '#51b7b0', soft: '#dff7f3' },
  { name: '螢幕擦拭布', image: 'assets/prize-cloth.jpg', color: '#3689c9', soft: '#dceffc' }
];

const canvas = document.querySelector('#wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.querySelector('#spinButton');
const resultModal = document.querySelector('#resultModal');
const resultTitle = document.querySelector('#resultTitle');
const resultImage = document.querySelector('#resultImage');
const againButton = document.querySelector('#againButton');
const liveRegion = document.querySelector('#liveRegion');
const confetti = document.querySelector('#confetti');
const fullscreenButton = document.querySelector('#fullscreenButton');
let currentRotation = 0;
let spinning = false;
let selectedIndex = 0;

const imageCache = prizes.map(prize => {
  const image = new Image();
  image.src = prize.image;
  image.decode?.().catch(() => {});
  return image;
});

function fitText(text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `900 ${size}px "PingFang TC", "Microsoft JhengHei", sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 26) {
    size -= 2;
    ctx.font = `900 ${size}px "PingFang TC", "Microsoft JhengHei", sans-serif`;
  }
  return size;
}

function drawWheel() {
  const size = canvas.width;
  const center = size / 2;
  const outer = size * .46;
  const inner = size * .155;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(center, center);

  prizes.forEach((prize, index) => {
    const start = -Math.PI / 2 + index * Math.PI / 2;
    const end = start + Math.PI / 2;
    const middle = (start + end) / 2;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, outer, start, end);
    ctx.closePath();
    ctx.fillStyle = prize.color;
    ctx.fill();
    ctx.strokeStyle = '#fffdf4';
    ctx.lineWidth = 12;
    ctx.stroke();

    const image = imageCache[index];
    const imageRadius = size * .285;
    const ix = Math.cos(middle) * imageRadius;
    const iy = Math.sin(middle) * imageRadius;
    const box = size * .185;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ix, iy, box / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#fff';
    ctx.fillRect(ix - box / 2, iy - box / 2, box, box);
    if (image.complete && image.naturalWidth) {
      const scale = Math.max(box / image.naturalWidth, box / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      ctx.drawImage(image, ix - w / 2, iy - h / 2, w, h);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(ix, iy, box / 2, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255,255,255,.95)';
    ctx.stroke();

    ctx.save();
    ctx.translate(Math.cos(middle) * size * .39, Math.sin(middle) * size * .39);
    ctx.rotate(middle + Math.PI / 2);
    const fontSize = fitText(prize.name, size * .29, 38);
    ctx.font = `900 ${fontSize}px "PingFang TC", "Microsoft JhengHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(255,255,255,.95)';
    ctx.strokeText(prize.name, 0, 0);
    ctx.fillStyle = '#073b5c';
    ctx.fillText(prize.name, 0, 0);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, outer + 9, 0, Math.PI * 2);
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#073b5c';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, inner, 0, Math.PI * 2);
  ctx.fillStyle = '#073b5c';
  ctx.fill();
  ctx.restore();
}

imageCache.forEach(image => image.addEventListener('load', drawWheel));
drawWheel();

document.querySelector('#prizeList').innerHTML = prizes.map((prize, index) => `
  <article class="prize-item" style="--item-color:${prize.soft}">
    <img src="${prize.image}" alt="${prize.name}">
    <h3>${prize.name}</h3>
    <span class="prize-number" aria-hidden="true">${index + 1}</span>
  </article>
`).join('');

function secureRandomIndex(max) {
  if (!globalThis.crypto?.getRandomValues) return Math.floor(Math.random() * max);
  const limit = Math.floor(0x100000000 / max) * max;
  const values = new Uint32Array(1);
  do globalThis.crypto.getRandomValues(values); while (values[0] >= limit);
  return values[0] % max;
}

function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audio = new AudioContext();
    [523.25, 659.25, 783.99].forEach((frequency, i) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, audio.currentTime + i * .12);
      gain.gain.exponentialRampToValueAtTime(.18, audio.currentTime + i * .12 + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + i * .12 + .35);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(audio.currentTime + i * .12);
      oscillator.stop(audio.currentTime + i * .12 + .38);
    });
    setTimeout(() => audio.close(), 900);
  } catch (_) {}
}

function celebrate() {
  confetti.replaceChildren();
  const colors = ['#f7c948', '#ef5b4c', '#51b7b0', '#3689c9', '#ffffff'];
  for (let i = 0; i < 72; i += 1) {
    const piece = document.createElement('i');
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--duration', `${2.5 + Math.random() * 2}s`);
    piece.style.setProperty('--rotation', `${Math.random() * 180}deg`);
    piece.style.setProperty('--drift', `${-120 + Math.random() * 240}px`);
    piece.style.animationDelay = `${Math.random() * .65}s`;
    confetti.appendChild(piece);
  }
  setTimeout(() => confetti.replaceChildren(), 5000);
}

function showResult() {
  const prize = prizes[selectedIndex];
  resultTitle.textContent = prize.name;
  resultImage.src = prize.image;
  resultImage.alt = prize.name;
  resultModal.hidden = false;
  document.body.style.overflow = 'hidden';
  liveRegion.textContent = `恭喜獲得${prize.name}`;
  celebrate();
  playChime();
  againButton.focus();
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinButton.disabled = true;
  spinButton.querySelector('strong').textContent = '轉動中…';
  liveRegion.textContent = '轉盤開始轉動';
  selectedIndex = secureRandomIndex(prizes.length);

  const centerAngle = -45 + selectedIndex * 90;
  const landingAngle = (-90 - centerAngle + 360) % 360;
  const completedTurns = Math.floor(currentRotation / 360);
  const extraTurns = 6 + secureRandomIndex(2);
  currentRotation = (completedTurns + extraTurns) * 360 + landingAngle;
  canvas.style.transform = `rotate(${currentRotation}deg)`;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    spinning = false;
    spinButton.disabled = false;
    spinButton.querySelector('strong').textContent = '開始轉動';
    showResult();
  }, reducedMotion ? 80 : 5750);
}

spinButton.addEventListener('click', spin);
againButton.addEventListener('click', () => {
  resultModal.hidden = true;
  document.body.style.overflow = '';
  liveRegion.textContent = '轉盤已準備好，請下一位參觀者按下開始轉動';
  spinButton.focus();
});

fullscreenButton.addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch (_) {}
});

document.addEventListener('fullscreenchange', () => {
  fullscreenButton.setAttribute('aria-label', document.fullscreenElement ? '離開全螢幕' : '切換全螢幕');
});
