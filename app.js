import { setEstado, ejecutarConEstado } from './estadoSistema.js';

const GAS_URL = "https://script.google.com/macros/s/AKfycbz-tgeLs_rUxPcbmxPHPKavRzA_ltbOOigC4zaz-UMdhWlntccsyKOzuj_9datlA_1A/exec";

// --- UTIL: fetch JSON con manejo de errores ---
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    mode: 'cors'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// --- Renderizar tabla ---
function renderTable(registros) {
  const tbody = document.getElementById("tabla-registros");
  if (!tbody) return;
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
  try {
    const promise = fetchJson(`${GAS_URL}?action=readData`, { method: "GET" });
    const json = await ejecutarConEstado(promise, "Cargando registros...");
    if (!json.success) throw new Error(json.error || "Error al cargar");
    renderTable(json.rows);
    setEstado("success", "Registros cargados correctamente");
  } catch (err) {
    console.error(err);
    setEstado("error", "Error al cargar registros: " + (err.message || err));
    const tbody = document.getElementById("tabla-registros");
    if (tbody) tbody.innerHTML = `<tr><td colspan="6">Error al cargar registros</td></tr>`;
  }
}

// --- Guardar o actualizar registro ---
async function guardarRegistro(e) {
  e.preventDefault();
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

  try {
    const promise = fetchJson(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await ejecutarConEstado(promise, idVal ? "Actualizando registro..." : "Creando registro...");
    if (!json.success) throw new Error(json.error || "Error al guardar");
    setEstado("success", idVal ? "Registro actualizado" : "Registro creado");
    limpiarFormulario();
    await cargarRegistros();
  } catch (err) {
    console.error(err);
    setEstado("error", "Error al guardar: " + (err.message || err));
  }
}

// --- Eliminar registro ---
async function eliminarRegistro(id) {
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
    console.error(err);
    setEstado("error", "Error al eliminar: " + (err.message || err));
  }
}

// --- Editar registro ---
function editarRegistro(r) {
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
  document.getElementById('crud-form').reset();
  document.getElementById('id').value = '';
}

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('crud-form').addEventListener('submit', guardarRegistro);
  document.getElementById('btn-limpiar').addEventListener('click', limpiarFormulario);
  cargarRegistros();
});
