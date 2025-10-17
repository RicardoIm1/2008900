import { setEstado, ejecutarConEstado } from './estadoSistema.js';

console.log("🚀 app.js cargado correctamente");

const GAS_URL = "https://script.google.com/macros/s/AKfycbz-tgeLs_rUxPcbmxPHPKavRzA_ltbOOigC4zaz-UMdhWlntccsyKOzuj_9datlA_1A/exec";

// --- UTIL: fetch JSON con manejo de errores ---
async function fetchJson(url, opts = {}) {
  console.log("🔍 Fetch a:", url);
  
  try {
    const res = await fetch(url, {
      ...opts,
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        ...opts.headers
      }
    });
    
    console.log("📥 Respuesta status:", res.status, res.statusText);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const text = await res.text();
    console.log("📄 Respuesta texto:", text);
    
    // Intentar parsear JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("❌ Error parseando JSON:", parseError);
      throw new Error("Respuesta no es JSON válido: " + text.substring(0, 100));
    }
    
  } catch (err) {
    console.error("❌ Error en fetchJson:", err);
    throw err;
  }
}

// --- Renderizar tabla ---
function renderTable(registros) {
  console.log("📋 Renderizando tabla con", registros?.length, "registros");
  const tbody = document.getElementById("tabla-registros");
  if (!tbody) {
    console.error("❌ No se encontró tabla-registros");
    return;
  }
  tbody.innerHTML = "";

  if (!registros || registros.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">Sin registros</td></tr>`;
    return;
  }

  registros.forEach((r, i) => {
    const fila = document.createElement("tr");

    const accionesTd = document.createElement("td");

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.title = "Editar";
    btnEditar.innerHTML = "✏️";
    btnEditar.style.marginRight = "5px";
    btnEditar.addEventListener("click", () => editarRegistro(r));

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.title = "Eliminar";
    btnEliminar.innerHTML = "🗑️";
    btnEliminar.addEventListener("click", () => eliminarRegistro(r.id));

    accionesTd.appendChild(btnEditar);
    accionesTd.appendChild(btnEliminar);

    fila.innerHTML = `
      <td>${i + 1}</td>
      <td>${r.folio || ""}</td>
      <td>${r.nombre || ""}</td>
      <td>${r.fechaDefuncion || ""}</td>
      <td>${r.area || ""}</td>
    `;
    fila.appendChild(accionesTd);
    tbody.appendChild(fila);
  });
}

// --- Cargar registros con estado ---
async function cargarRegistros() {
  console.log("🔄 Cargando registros...");
  
  try {
    // Usar URLSearchParams para asegurar que los parámetros se envíen correctamente
    const params = new URLSearchParams({
      action: "readData",
      timestamp: Date.now() // evitar cache
    });
    
    const url = `${GAS_URL}?${params.toString()}`;
    console.log("🔗 URL completa:", url);
    
    const promise = fetchJson(url, { 
      method: "GET",
      cache: 'no-cache'
    });
    
    const json = await ejecutarConEstado(promise, "Cargando registros...");
    console.log("📊 JSON recibido:", json);
    
    if (!json.success) throw new Error(json.error || "Error al cargar");
    renderTable(json.rows);
    setEstado("success", "Registros cargados correctamente");
  } catch (err) {
    console.error("❌ Error cargando registros:", err);
    setEstado("error", "Error al cargar registros: " + (err.message || err));
    const tbody = document.getElementById("tabla-registros");
    if (tbody) tbody.innerHTML = `<tr><td colspan="6">Error al cargar registros</td></tr>`;
  }
}

// --- Guardar o actualizar registro ---
async function guardarRegistro(e) {
  e.preventDefault();
  console.log("💾 Iniciando guardado...");
  
  const idVal = document.getElementById('id').value;
  const payload = {
    action: idVal ? "updateData" : "createData",
    id: idVal || undefined,
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

  console.log("📤 Payload:", payload);

  try {
    const promise = fetchJson(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const json = await ejecutarConEstado(promise, idVal ? "Actualizando registro..." : "Creando registro...");
    console.log("📥 Respuesta del servidor:", json);
    
    if (!json.success) throw new Error(json.error || "Error al guardar");
    
    setEstado("success", idVal ? "Registro actualizado" : "Registro creado");
    limpiarFormulario();
    await cargarRegistros();
  } catch (err) {
    console.error("❌ Error guardando:", err);
    setEstado("error", "Error al guardar: " + (err.message || err));
  }
}

// --- Eliminar registro ---
async function eliminarRegistro(id) {
  console.log("🗑️ Eliminando registro:", id);
  if (!confirm("¿Eliminar este registro?")) return;
  try {
    const promise = fetchJson(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteData", id })
    });
    const json = await ejecutarConEstado(promise, "Eliminando registro...");
    if (!json.success) throw new Error(json.error || "Error al eliminar");
    setEstado("success", "Registro eliminado");
    await cargarRegistros();
  } catch (err) {
    console.error("❌ Error eliminando:", err);
    setEstado("error", "Error al eliminar: " + (err.message || err));
  }
}

// --- Editar registro ---
function editarRegistro(r) {
  console.log("✏️ Editando registro:", r);
  document.getElementById('id').value = r.id || '';
  document.getElementById('folio').value = r.folio || '';
  document.getElementById('nombre').value = r.nombre || '';
  document.getElementById('fechaDefuncion').value = r.fechaDefuncion || '';
  document.getElementById('area').value = r.area || '';
  document.getElementById('edad').value = r.edad || '';
  document.getElementById('sexo').value = r.sexo || '';
  document.getElementById('diagnostico').value = r.diagnostico || '';
  document.getElementById('expediente').value = r.expediente || '';
  document.getElementById('medico').value = r.medico || '';
  document.getElementById('observaciones').value = r.observaciones || '';
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- Limpiar formulario ---
function limpiarFormulario() {
  console.log("🧹 Limpiando formulario");
  document.getElementById('crud-form').reset();
  document.getElementById('id').value = '';
}

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("🏁 DOM cargado, inicializando...");
  document.getElementById('crud-form').addEventListener('submit', guardarRegistro);
  document.getElementById('btn-limpiar').addEventListener('click', limpiarFormulario);
  cargarRegistros();
});
// --- Función de test temporal ---
async function testConexion() {
  console.log("🧪 Probando conexión...");
  
  // Test 1: URL directa
  const testUrl = `${GAS_URL}?action=test&timestamp=${Date.now()}`;
  console.log("🔗 Test URL:", testUrl);
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    console.log("📤 Test Response:", response);
    const text = await response.text();
    console.log("📄 Test Response Text:", text);
    
    const json = JSON.parse(text);
    console.log("📊 Test JSON:", json);
    
    return json;
  } catch (err) {
    console.error("❌ Test Error:", err);
    throw err;
  }
}

// Llamar al test en la inicialización
document.addEventListener("DOMContentLoaded", () => {
  console.log("🏁 DOM cargado, inicializando...");
  
  // Primero probar conexión
  testConexion().then(result => {
    console.log("✅ Test completado:", result);
    
    // Si el test funciona, inicializar la app
    document.getElementById('crud-form').addEventListener('submit', guardarRegistro);
    document.getElementById('btn-limpiar').addEventListener('click', limpiarFormulario);
    cargarRegistros();
  }).catch(err => {
    console.error("❌ Test falló:", err);
    setEstado("error", "Error de conexión: " + err.message);
  });
});
