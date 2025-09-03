const canvas = document.getElementById('fondo');
const ctx = canvas.getContext('2d');
let velocidadFlujo = 0.8;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let partículas = Array.from({ length: 60 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 2 + 1,
  dx: Math.random() * 0.5 - 0.25,
  dy: Math.random() * 0.5 - 0.25
}));

function dibujarFondo() {
  ctx.fillStyle = 'rgba(200, 0, 50, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  partículas.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 80, 0.3)';
    ctx.fill();

    p.x += p.dx * velocidadFlujo;
    p.y += p.dy * velocidadFlujo;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });

  requestAnimationFrame(dibujarFondo);
}
dibujarFondo();
