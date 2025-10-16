// 📁 estadoSistema.js
// Módulo universal para manejar estados visuales (loading, success, error)
// con transiciones suaves y compatibilidad total con tus estilos base.

export function setEstado(estado, mensaje = null) {
  const dashboard = document.querySelector('.glass');
  const estadoTexto = document.querySelector('#estadoTexto');

  if (!dashboard) {
    console.warn('⚠️ No se encontró el contenedor .glass');
    return;
  }

  // Activar animación de transición suave
  dashboard.style.transition = 'background 0.8s ease, box-shadow 0.8s ease, border 0.8s ease, opacity 0.4s ease';
  dashboard.style.opacity = '0.7';

  // Pequeño retardo para aplicar el nuevo estado tras desvanecer
  setTimeout(() => {
    dashboard.classList.remove('loading', 'success', 'error');
    dashboard.classList.add(estado);

    // Restaurar opacidad con efecto “fade-in”
    dashboard.style.opacity = '1';
  }, 200);

  // Actualizar mensaje de estado
  if (estadoTexto) {
    switch (estado) {
      case 'loading':
        estadoTexto.innerHTML = mensaje || '<i class="fas fa-sync fa-spin"></i> Cargando...';
        break;
      case 'success':
        estadoTexto.innerHTML = mensaje || '<i class="fas fa-check-circle"></i> Operación exitosa ✅';
        break;
      case 'error':
        estadoTexto.innerHTML = mensaje || '<i class="fas fa-exclamation-circle"></i> Error detectado ❌';
        break;
      default:
        estadoTexto.innerHTML = mensaje || 'Estado desconocido';
    }

    // Animar el texto también
    estadoTexto.style.transition = 'opacity 0.5s ease';
    estadoTexto.style.opacity = '0';
    setTimeout(() => (estadoTexto.style.opacity = '1'), 100);
  }
}

// Función auxiliar: ejecuta una promesa mostrando estados automáticos
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
