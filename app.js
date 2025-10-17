// Configuración
const GAS_URL = "https://script.google.com/macros/s/AKfycbxMV5csdT9IKUtabp2BIJqEF3Yq_-bOszsfqCBy4R_-tQmtAw_GbEPadSwZmBBXB0NM/exec";

// Función simple para hacer requests
async function makeRequest(url, options = {}) {
  try {
    console.log('📤 Enviando request a:', url);
    const response = await fetch(url, options);
    const text = await response.text();
    console.log('📥 Respuesta recibida:', text);
    return JSON.parse(text);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Cargar registros
async function cargarRegistros() {
  try {
    const url = `${GAS_URL}?action=readData`;
    const data = await makeRequest(url);
    
    if (data.success) {
      renderTable(data.rows);
      mostrarEstado('success', 'Datos cargados correctamente');
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error cargando registros:', error);
    mostrarEstado('error', 'Error: ' + error.message);
    document.getElementById('tabla-registros').innerHTML = '<tr><td colspan="6">Error cargando datos</td></tr>';
  }
}

// Renderizar tabla
function renderTable(registros) {
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
        <button onclick="editarRegistro(${JSON.stringify(registro).replace(/"/g, '&quot;')})" title="Editar">✏️</button>
        <button onclick="eliminarRegistro('${registro.id}')" title="Eliminar">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Guardar registro
async function guardarRegistro(e) {
  e.preventDefault();
  
  const id = document.getElementById('id').value;
  const formData = {
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

  try {
    const payload = {
      action: id ? 'updateData' : 'createData',
      id: id || undefined,
      ...formData
    };

    const data = await makeRequest(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (data.success) {
      mostrarEstado('success', id ? 'Registro actualizado' : 'Registro creado');
      limpiarFormulario();
      await cargarRegistros();
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error guardando:', error);
    mostrarEstado('error', 'Error: ' + error.message);
  }
}

// Eliminar registro
async function eliminarRegistro(id) {
  if (!confirm('¿Estás seguro de eliminar este registro?')) return;

  try {
    const data = await makeRequest(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteData', id: id })
    });

    if (data.success) {
      mostrarEstado('success', 'Registro eliminado');
      await cargarRegistros();
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error eliminando:', error);
    mostrarEstado('error', 'Error: ' + error.message);
  }
}

// Editar registro
function editarRegistro(registro) {
  document.getElementById('id').value = registro.id || '';
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
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Limpiar formulario
function limpiarFormulario() {
  document.getElementById('crud-form').reset();
  document.getElementById('id').value = '';
}

// Mostrar estado simple
function mostrarEstado(tipo, mensaje) {
  const estadoElemento = document.getElementById('estadoTexto');
  if (estadoElemento) {
    estadoElemento.textContent = mensaje;
    estadoElemento.style.color = tipo === 'success' ? 'lightgreen' : 'lightcoral';
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando aplicación...');
  
  document.getElementById('crud-form').addEventListener('submit', guardarRegistro);
  document.getElementById('btn-limpiar').addEventListener('click', limpiarFormulario);
  
  // Cargar datos iniciales
  cargarRegistros();
});

// Hacer funciones globales para los botones
window.editarRegistro = editarRegistro;
window.eliminarRegistro = eliminarRegistro;
