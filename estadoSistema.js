// 📁 estadoSistema.js
// Módulo universal para manejar los estados visuales del sistema (loading, success, error)
// Aplica las clases directamente sobre el contenedor principal .glass

export function setEstado(estado, mensaje = null) {
  const dashboard = document.querySelector('.glass');
  const estadoTexto = document.querySelector('#estadoTexto');

  if (!dashboard) {
    console.warn('⚠️ No se encontró el contenedor .glass');
    return;
  }

  // Limpiamos clases previas
  dashboard.classList.remove('loading', 'success', 'error');

  // Aplicamos el nuevo estado
  dashboard.classList.add(estado);

  // Si existe un elemento con id estadoTexto, actualizamos el mensaje
  if (estadoTexto) {
    switch (estado) {
      case 'loading':
        estadoTexto.innerHTML = mensaje || '<i class="fas fa-sync fa-spin"></i> Cargando...';
        break;
      case 'success':
        estadoTexto.innerHTML = mensaje || '<i class="fas fa-check-circle"></i> Operación exitosa ✅';
        break;
      case 'error':
        estadoTexto.innerHTML = mensaje || '<i class="fas fa-exclamation-circle"></i> Ocurrió un error ❌';
        break;
      default:
        estadoTexto.innerHTML = mensaje || 'Estado desconocido';
    }
  }
}

// ⚙️ Función auxiliar: cambia estado automáticamente
//   según promesa asíncrona (útil para guardar, cargar datos, etc.)
export async function ejecutarConEstado(promise, mensajeCarga = 'Procesando...') {
  setEstado('loading', mensajeCarga);
  try {
    const resultado = await promise;
    setEstado('success');
    return resultado;
  } catch (err) {
    console.error(err);
    setEstado('error', 'Error durante la operación');
    throw err;
  }
}
