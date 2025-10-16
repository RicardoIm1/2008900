// Módulo de estado visual con retorno automático al color base
export function setEstado(estado) {
  const contenedor = document.querySelector('.glass') || document.body;

  // limpia estados previos
  contenedor.classList.remove('loading', 'success', 'error');

  // aplica el nuevo
  contenedor.classList.add(estado);

  // si es success o error, regresa al color neutro después de un instante
  if (estado === 'success' || estado === 'error') {
    setTimeout(() => {
      contenedor.classList.remove(estado);
    }, 1500); // duración visible: 1.5 s
  }
}

export async function ejecutarConEstado(promesa, estadoInicial = 'loading') {
  const contenedor = document.querySelector('.glass') || document.body;
  setEstado(estadoInicial);
  try {
    const resultado = await promesa;
    setEstado('success');
    return resultado;
  } catch (error) {
    setEstado('error');
    throw error;
  }
}
