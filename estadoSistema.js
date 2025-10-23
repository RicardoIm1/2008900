// ========== estadoSistema.js (versión optimizada) ==========

// Nivel de intensidad simbólica de la “respiración”
let intensidadUso = 0;
let respiracionInterval;

// Inicia la respiración con animación optimizada (sin forzar repaints)
function iniciarRespiracion() {
  const dashboard = document.querySelector('.glass');
  if (!dashboard) return;

  // Limpia animación previa
  clearInterval(respiracionInterval);

  let fase = 0;
  respiracionInterval = setInterval(() => {
    fase += 0.02; // antes era 0.04, más suave y menos CPU
    const intensidad = Math.min(0.15 + intensidadUso / 80, 0.4);
    const escala = 1 + Math.sin(fase) * intensidad * 0.02;
    dashboard.style.transform = `scale(${escala})`;
  }, 500); // cada medio segundo, no cada 100ms
}

// Cambia el estado visual del panel con transiciones suaves
function setEstado(estado, mensaje = null) {
  const dashboard = document.querySelector('.glass');
  const estadoTexto = document.querySelector('#estadoTexto');
  if (!dashboard) return;

  // Incrementa brevemente la “intensidad” para reflejar actividad
  intensidadUso = Math.min(intensidadUso + 1, 10);
  iniciarRespiracion();
  setTimeout(() => (intensidadUso = Math.max(intensidadUso - 1, 0)), 8000);

  // Transiciones más ligeras
  dashboard.style.transition = 'background 0.4s ease, box-shadow 0.6s ease, border 0.4s ease';
  dashboard.classList.remove('loading', 'success', 'error');

  switch (estado) {
    case 'loading':
      dashboard.classList.add('loading');
      break;
    case 'success':
      dashboard.classList.add('success');
      break;
    case 'error':
      dashboard.classList.add('error');
      break;
  }

  // Texto de estado con iconos suaves
  if (estadoTexto) {
    const iconos = {
      loading: '<i class="fas fa-sync fa-spin"></i> Procesando...',
      success: '<i class="fas fa-check-circle"></i> Éxito ✅',
      error: '<i class="fas fa-exclamation-circle"></i> Error ❌'
    };
    estadoTexto.innerHTML = mensaje || iconos[estado] || 'Listo';
    estadoTexto.style.opacity = '1';
  }

  // Restaurar a cristalino después de unos segundos
  setTimeout(() => {
    dashboard.classList.remove('loading', 'success', 'error');
    dashboard.style.transition = 'background 2s ease, box-shadow 2s ease, border 2s ease';
  }, 5000);
}
