// Configuración
const GAS_URL = "https://script.google.com/macros/s/AKfycbxjWyho305Dg-qGGk7dC_HT_le_GxPbtit2zU6KHkHeVD0v0WITz7UHjQcsm7HpQvYO/exec";

// Función para cargar datos
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

// Guardar registro
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

    console.log('💾 Enviando:', payload);

    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('📨 Respuesta:', result);

    if (result.success) {
      mostrarMensaje('success', id ? '✅ Registro actualizado' : '✅ Registro creado');
      limpiarForm();
      await cargarRegistros();
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Error guardando:', error);
    mostrarMensaje('error', '❌ Error: ' + error.message);
  }
}

// Eliminar registro
async function eliminar(id) {
  if (!confirm('¿Eliminar este registro?')) return;

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteData', id: id })
    });

    const result = await response.json();

    if (result.success) {
      mostrarMensaje('success', '✅ Registro eliminado');
      await cargarRegistros();
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Error eliminando:', error);
    mostrarMensaje('error', '❌ Error: ' + error.message);
  }
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
  
  document.getElementById('crud-form').addEventListener('submit', guardar);
  document.getElementById('btn-limpiar').addEventListener('click', limpiarForm);
  
  // Cargar datos
  cargarRegistros();
});

// Funciones globales para los botones
window.editar = editar;
window.eliminar = eliminar;
