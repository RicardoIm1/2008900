// Configuración - NUEVA URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbxjWyho305Dg-qGGk7dC_HT_le_GxPbtit2zU6KHkHeVD0v0WITz7UHjQcsm7HpQvYO/exec";

// Función para cargar datos (GET funciona bien)
async function cargarRegistros() {
  try {
    console.log('🔄 Cargando registros desde:', GAS_URL);
    
    const response = await fetch(GAS_URL);
    const text = await response.text();
    console.log('📥 Respuesta:', text);
    
    const data = JSON.parse(text);
    console.log('📊 Datos parseados:', data);
    
    if (data.success) {
      mostrarTabla(data.rows);
      mostrarMensaje('success', `✅ ${data.rows.length} registros cargados`);
    } else {
      throw new Error(data.error || 'Error del servidor');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    mostrarMensaje('error', '❌ Error: ' + error.message);
    document.getElementById('tabla-registros').innerHTML = '<tr><td colspan="6">Error cargando datos</td></tr>';
  }
}

// Guardar registro - SOLUCIÓN CORS
async function guardar(e) {
  e.preventDefault();
  
  const id = document.getElementById('id').value;
  const datos = {
    folio: document.getElementById('folio').value,
    nombre: document.getElementById('nombre').value,
    fechaDefuncion: document.getElementById('fechaDefuncion').value,
    area: document.getElementById('area').value,
    edad: document.getElementById('edad').value,
    sexo: document.getElementById('sexo').value,
    diagnostico: document.getElementById('diagnostico').value,
    expediente: document.getElementById('expediente').value,
    medico: document.getElementById('medico').value,
    observaciones: document.getElementById('observaciones').value
  };

  if (!datos.nombre) {
    mostrarMensaje('error', '❌ El nombre es obligatorio');
    return;
  }

  try {
    const payload = {
      action: id ? 'updateData' : 'createData',
      id: id || undefined,
      ...datos
    };

    console.log('💾 Enviando datos:', payload);

    // SOLUCIÓN CORS: Usar Google Apps Script como redirección
    await enviarDatosGAS(payload);
    
    // En la función guardar, cambia esta parte:
    mostrarMensaje('success', id ? '✅ Registro actualizado' : '✅ Registro creado');
    limpiarForm();
    
    // Esperar más tiempo para que Google Sheets procese
    setTimeout(() => {
      cargarRegistros();
      mostrarMensaje('success', '📊 Datos recargados');
    }, 3000); // 3 segundos en lugar de 2
        
      } catch (error) {
        console.error('❌ Error guardando:', error);
        mostrarMensaje('error', '❌ Error guardando: ' + error.message);
      }
    }

// Función mejorada para enviar datos evitando CORS
function enviarDatosGAS(payload) {
  return new Promise((resolve, reject) => {
    // Crear un iframe invisible para enviar la solicitud
    const iframe = document.createElement('iframe');
    iframe.name = 'gasPostFrame';
    iframe.style.display = 'none';
    
    // Crear formulario
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GAS_URL;
    form.target = 'gasPostFrame';
    form.style.display = 'none';
    
    // Agregar los datos como campo oculto en formato JSON
    const input = document.createElement('input');
    input.name = 'data';
    input.value = JSON.stringify(payload);
    form.appendChild(input);
    
    // Agregar al documento
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    
    // Manejar la carga del iframe
    iframe.onload = function() {
      console.log('✅ Solicitud POST completada');
      document.body.removeChild(iframe);
      document.body.removeChild(form);
      resolve();
    };
    
    iframe.onerror = function() {
      console.error('❌ Error en solicitud POST');
      document.body.removeChild(iframe);
      document.body.removeChild(form);
      reject(new Error('Error en la solicitud POST'));
    };
    
    // Enviar formulario
    form.submit();
    
    // Timeout de seguridad
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
        document.body.removeChild(form);
        resolve(); // Asumir éxito después de timeout
      }
    }, 10000);
  });
}

// Eliminar registro - SOLUCIÓN CORS
async function eliminar(id) {
  if (!confirm('¿Eliminar este registro?')) return;

  try {
    const payload = {
      action: 'deleteData',
      id: id
    };

    console.log('🗑️ Enviando eliminación:', payload);
    await enviarDatosGAS(payload);
    
    mostrarMensaje('success', '✅ Registro eliminado');
    
    // Esperar un poco y recargar los datos
    setTimeout(() => {
      cargarRegistros();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error eliminando:', error);
    mostrarMensaje('error', '❌ Error eliminando: ' + error.message);
  }
}

// El resto de las funciones se mantienen igual...
// Mostrar tabla
function mostrarTabla(registros) {
  const tbody = document.getElementById('tabla-registros');
  tbody.innerHTML = '';

  if (!registros || registros.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No hay registros</td></tr>';
    return;
  }

  registros.forEach((registro, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${registro.folio || ''}</td>
      <td>${registro.nombre || ''}</td>
      <td>${registro.fechaDefuncion || ''}</td>
      <td>${registro.area || ''}</td>
      <td>
        <button onclick="editar('${registro.id}')">✏️</button>
        <button onclick="eliminar('${registro.id}')">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Editar registro
async function editar(id) {
  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    
    if (data.success) {
      const registro = data.rows.find(r => r.id === id);
      if (registro) {
        document.getElementById('id').value = registro.id;
        document.getElementById('folio').value = registro.folio || '';
        document.getElementById('nombre').value = registro.nombre || '';
        document.getElementById('fechaDefuncion').value = registro.fechaDefuncion || '';
        document.getElementById('area').value = registro.area || '';
        document.getElementById('edad').value = registro.edad || '';
        document.getElementById('sexo').value = registro.sexo || '';
        document.getElementById('diagnostico').value = registro.diagnostico || '';
        document.getElementById('expediente').value = registro.expediente || '';
        document.getElementById('medico').value = registro.medico || '';
        document.getElementById('observaciones').value = registro.observaciones || '';
        
        mostrarMensaje('success', '✏️ Modo edición');
        window.scrollTo(0, 0);
      }
    }
  } catch (error) {
    mostrarMensaje('error', '❌ Error cargando registro');
  }
}

// Limpiar formulario
function limpiarForm() {
  document.getElementById('crud-form').reset();
  document.getElementById('id').value = '';
  mostrarMensaje('success', '🧹 Formulario limpiado');
}

// Mostrar mensaje
function mostrarMensaje(tipo, mensaje) {
  const elemento = document.getElementById('estadoTexto');
  if (elemento) {
    elemento.textContent = mensaje;
    elemento.style.color = tipo === 'success' ? '#90EE90' : '#FFB6C1';
    elemento.style.fontWeight = 'bold';
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Iniciando aplicación...');
  
  // CAMBIO AQUÍ: Usar guardarDirecto en lugar de guardar
  document.getElementById('crud-form').addEventListener('submit', guardarDirecto);
  document.getElementById('btn-limpiar').addEventListener('click', limpiarForm);
  
  // Mostrar registros locales si existen
  mostrarRegistrosLocales();
  
  // Cargar datos
  cargarRegistros();
  
  // Escuchar mensajes de la ventana emergente
  window.addEventListener('message', function(event) {
    if (event.data.type === 'registroGuardado') {
      console.log('✅ Mensaje de confirmación recibido:', event.data);
      mostrarMensaje('success', '✅ ' + event.data.nombre + ' guardado exitosamente');
      cargarRegistros();
    }
  });
  
  // Agregar botones de debug
  agregarBotonesDebug();
});

// Funciones globales para los botones
window.editar = editar;
window.eliminar = eliminar;

// Función para verificar manualmente si se guardó
async function verificarGuardado() {
  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    
    const ultimoRegistro = data.rows[0]; // El más reciente debería ser el primero
    console.log('Último registro:', ultimoRegistro);
    
    if (ultimoRegistro && ultimoRegistro.nombre === 'SANCHEZ VALENCIA ANTONIO') {
      mostrarMensaje('success', '✅ Verificado: El registro SÍ se guardó');
    } else {
      mostrarMensaje('error', '❌ El registro NO aparece en la base de datos');
    }
  } catch (error) {
    console.error('Error verificando:', error);
  }
}

// Agrega un botón temporal para verificar
function agregarBotonVerificacion() {
  const boton = document.createElement('button');
  boton.textContent = '🔍 Verificar Guardado';
  boton.onclick = verificarGuardado;
  boton.style.margin = '10px';
  boton.style.padding = '5px 10px';
  
  document.querySelector('.botones').appendChild(boton);
}

// En la inicialización, agrega:
document.addEventListener('DOMContentLoaded', function() {
  // ... código existente ...
  agregarBotonVerificacion();
});

// Función DIRECTA para guardar - Sin CORS issues
async function guardarDirecto(e) {
  e.preventDefault();
  
  const id = document.getElementById('id').value;
  const datos = {
    folio: document.getElementById('folio').value,
    nombre: document.getElementById('nombre').value,
    fechaDefuncion: document.getElementById('fechaDefuncion').value,
    area: document.getElementById('area').value,
    edad: document.getElementById('edad').value,
    sexo: document.getElementById('sexo').value,
    diagnostico: document.getElementById('diagnostico').value,
    expediente: document.getElementById('expediente').value,
    medico: document.getElementById('medico').value,
    observaciones: document.getElementById('observaciones').value
  };

  if (!datos.nombre) {
    mostrarMensaje('error', '❌ El nombre es obligatorio');
    return;
  }

  console.log('💾 Intentando guardar directo:', datos);

  try {
    // Método 1: Usar Google Sheets API v4
    await guardarConSheetsAPI(datos);
    
  } catch (error) {
    console.error('❌ Error con API:', error);
    // Método 2: Fallback - Guardar en localStorage temporal
    guardarEnLocalStorage(datos);
  }
}

// Método 1: Google Sheets API
async function guardarConSheetsAPI(datos) {
  // Esto requiere configuración de OAuth2, pero probemos un approach simple
  const payload = {
    action: 'createData',
    ...datos
  };

  // Crear un formulario que se envía a Google Apps Script
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = GAS_URL;
  form.target = '_blank'; // Abrir en nueva pestaña
  form.style.display = 'none';

  // Agregar todos los campos individualmente
  Object.keys(payload).forEach(key => {
    const input = document.createElement('input');
    input.name = key;
    input.value = payload[key] || '';
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  mostrarMensaje('success', '✅ Enviando datos... Revisa la nueva pestaña');
  
  // Recargar después de 3 segundos
  setTimeout(() => {
    cargarRegistros();
    mostrarMensaje('success', '📊 Datos recargados');
  }, 3000);
}

// Método 2: Fallback - Guardar en localStorage
function guardarEnLocalStorage(datos) {
  const timestamp = new Date().toISOString();
  const registro = {
    id: 'local-' + Date.now(),
    timestamp: timestamp,
    ...datos
  };

  // Guardar en localStorage
  const registrosLocales = JSON.parse(localStorage.getItem('defunciones_pendientes') || '[]');
  registrosLocales.push(registro);
  localStorage.setItem('defunciones_pendientes', JSON.stringify(registrosLocales));

  mostrarMensaje('warning', '⚠️ Guardado local (sin conexión). ID: ' + registro.id);
  limpiarForm();
  
  console.log('📱 Registro guardado localmente:', registro);
}

// Función para mostrar registros locales
function mostrarRegistrosLocales() {
  const registros = JSON.parse(localStorage.getItem('defunciones_pendientes') || '[]');
  console.log('📱 Registros locales:', registros);
  if (registros.length > 0) {
    mostrarMensaje('info', `📱 Tienes ${registros.length} registros pendientes de sincronizar`);
  }
}

// Agregar al final de app.js
function agregarBotonesDebug() {
  const contenedor = document.querySelector('.botones');
  
  const botonDebug = document.createElement('button');
  botonDebug.innerHTML = '🐛 Ver Estado';
  botonDebug.onclick = function() {
    console.log('=== DEBUG INFO ===');
    console.log('URL GAS:', GAS_URL);
    console.log('Formulario:', {
      nombre: document.getElementById('nombre').value,
      folio: document.getElementById('folio').value,
      fecha: document.getElementById('fechaDefuncion').value
    });
    
    // Probar la URL directamente
    window.open(GAS_URL, '_blank');
  };
  
  const botonLimpiarLocal = document.createElement('button');
  botonLimpiarLocal.innerHTML = '🧹 Limpiar Local';
  botonLimpiarLocal.onclick = function() {
    localStorage.removeItem('defunciones_pendientes');
    mostrarMensaje('success', 'LocalStorage limpiado');
  };
  
  contenedor.appendChild(botonDebug);
  contenedor.appendChild(botonLimpiarLocal);
}

// Llamar en DOMContentLoaded
agregarBotonesDebug();
