const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.querySelector('#flow-canvas');
const progress = document.querySelector('.site-progress span');
const projects = [...document.querySelectorAll('.project')];
let mouse = { x: 0.55, y: 0.45, tx: 0.55, ty: 0.45 };

function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}
addEventListener('scroll', updateProgress, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.16 });
projects.forEach(project => observer.observe(project));

if (canvas) {
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, raf = 0;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', resize);
  addEventListener('pointermove', event => {
    mouse.tx = event.clientX / innerWidth;
    mouse.ty = event.clientY / innerHeight;
  }, { passive: true });
  resize();

  function draw(time) {
    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;
    ctx.clearRect(0, 0, width, height);
    const t = reducedMotion ? 1.2 : time * 0.00025;
    const cx = width * (0.68 + (mouse.x - 0.5) * 0.15);
    const cy = height * (0.48 + (mouse.y - 0.5) * 0.1);
    const halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.58);
    halo.addColorStop(0, 'rgba(71,126,121,.42)');
    halo.addColorStop(.38, 'rgba(31,70,79,.20)');
    halo.addColorStop(1, 'rgba(4,13,18,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'screen';
    for (let strand = 0; strand < 34; strand++) {
      const v = strand / 33;
      ctx.beginPath();
      for (let x = -50; x <= width + 50; x += 12) {
        const nx = x / Math.max(width, 1);
        const swell = Math.exp(-Math.pow((nx - .72) * 2.1, 2));
        const wave = Math.sin(nx * 6.2 + t * 1.6 + v * 3.4) * (45 + 105 * swell);
        const micro = Math.sin(nx * 13.5 - t * .8 + v * 9) * 14;
        const pointer = (mouse.y - .5) * 105 * swell;
        const y = cy + (v - .5) * height * .5 + wave + micro + pointer;
        if (x === -50) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = strand % 4 === 0 ? `rgba(204,239,125,${.07 + .08 * (1 - Math.abs(v - .5) * 2)})` : `rgba(74,161,175,${.025 + .05 * (1 - Math.abs(v - .5) * 2)})`;
      ctx.lineWidth = strand % 5 === 0 ? 2 : 1;
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    if (!reducedMotion && !document.hidden) raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reducedMotion) raf = requestAnimationFrame(draw);
  });
}

const pieces = document.querySelector('.hero-pieces');
if (pieces && !reducedMotion) {
  addEventListener('pointermove', event => {
    const x = (event.clientX / innerWidth - .5) * 18;
    const y = (event.clientY / innerHeight - .5) * 18;
    pieces.querySelector('.piece-a').style.transform = `translate(${-x}px, ${-y}px) rotate(-5deg)`;
    pieces.querySelector('.piece-b').style.transform = `translate(${x * .7}px, ${y * .7}px) rotate(7deg)`;
    pieces.querySelector('.piece-c').style.transform = `translate(${x * .5}px, ${-y * .5}px) rotate(-8deg)`;
  }, { passive: true });
}

function revealPage() { setTimeout(() => document.body.classList.add('ready'), 180); }
if (document.readyState === 'complete') revealPage();
else addEventListener('load', revealPage, { once: true });
