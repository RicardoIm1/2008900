// 📁 estadoSistema.js
let intensidadUso = 0;
let respiracionInterval;

/* function iniciarRespiracion() {
  const dashboard = document.querySelector('.glass');
  if (!dashboard) return;

  clearInterval(respiracionInterval);
  let fase = 0;
  respiracionInterval = setInterval(() => {
    fase += 0.04 + Math.random() * 0.02; // añade “arritmia”
    const intensidad = Math.min(0.2 + intensidadUso / 50, 0.7);
    const escala = 1 + Math.sin(fase) * intensidad * 0.05;
    dashboard.style.transform = `scale(${escala})`;
  }, 100);
}
 */
export function setEstado(estado, mensaje = null) {
  const dashboard = document.querySelector('.glass');
  const estadoTexto = document.querySelector('#estadoTexto');

  if (!dashboard) {
    console.warn('⚠️ No se encontró el contenedor .glass');
    return;
  }

  intensidadUso = Math.min(intensidadUso + 1, 20); // sube la energía del sistema
  iniciarRespiracion();
  setTimeout(() => (intensidadUso = Math.max(intensidadUso - 1, 0)), 10000); // decae lentamente

  dashboard.style.transition =
    'background 0.5s ease, box-shadow 0.8s ease, transform 1s ease';
  dashboard.classList.remove('loading', 'success', 'error');

  let bgColor;
  switch (estado) {
    case 'loading':
      bgColor = 'rgba(255, 255, 0, 0.15)';
      break;
    case 'success':
      bgColor = 'rgba(0, 255, 100, 0.25)';
      break;
    case 'error':
      bgColor = 'rgba(255, 50, 50, 0.25)';
      break;
    default:
      bgColor = 'rgba(255,255,255,0.1)';
  }

  dashboard.style.background = bgColor;

  if (estadoTexto) {
    const iconos = {
      loading: '<i class="fas fa-sync fa-spin"></i> Procesando...',
      success: '<i class="fas fa-check-circle"></i> Éxito ✅',
      error: '<i class="fas fa-exclamation-circle"></i> Error ❌'
    };
    estadoTexto.innerHTML = mensaje || iconos[estado] || 'Listo';
    estadoTexto.style.opacity = '1';
  }

  // 🔄 Restaurar a cristalino en 5 s
  setTimeout(() => {
    dashboard.style.transition = 'background 5s ease';
    dashboard.style.background = 'rgba(255, 255, 255, 0.1)';
  }, 5000);
}

// Ejecuta una promesa mostrando estados automáticos
export async function ejecutarConEstado(promise, mensajeCarga = 'Procesando...') {
  setEstado('loading', mensajeCarga);
  try {
    const resultado = await promise;
    setEstado('success', 'Operación completada con éxito ✅');
    return resultado;
  } catch (err) {
    console.error(err);
    setEstado('error', 'Error durante la operación ❌');
    throw err;
  }
}
