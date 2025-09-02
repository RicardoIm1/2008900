// 📸 Inicializa el escáner QR
function iniciarEscanerQR() {
  const qrScanner = new Html5Qrcode("qr-reader");
  const config = { fps: 10, qrbox: 250 };

  qrScanner.start(
    { facingMode: "environment" },
    config,
    (textoQR) => {
      document.getElementById("curp").value = textoQR;
      qrScanner.stop(); // Detiene escaneo tras lectura
    },
    (error) => {
      console.warn("Error escaneando:", error);
    }
  );
}

// 📤 Envía datos al Web App de GAS
function doPost(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    Logger.log("📥 Datos recibidos desde frontend:");
    Logger.log(e.postData.contents);

    const datos = JSON.parse(e.postData.contents);
    Logger.log("🔍 Datos parseados:");
    Logger.log(datos);

    const hoja = SpreadsheetApp.openById("TU_ID_DE_HOJA").getSheetByName("Registros");

    const folio = "F" + new Date().getTime();
    const fecha = new Date().toLocaleDateString("es-MX");
    const hora = new Date().toLocaleTimeString("es-MX");

    hoja.appendRow([
      folio, fecha, hora,
      datos.curp,
      "", "", "", "", "", "", "", // campos vacíos si no se usan
      datos.motivo,
      "", // edad
      datos.cajera,
      datos.referencia,
      datos.observaciones
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);

  } catch (error) {
    Logger.log("❌ Error al guardar:");
    Logger.log(error.message);

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

// 📋 Carga registros desde Google Sheets
function cargarTabla() {
  fetch("https://script.google.com/macros/s/AKfycbTU_WEBAPP_URL/exec")
    .then(res => res.json())
    .then(registros => {
      const cuerpoTabla = document.getElementById("tabla-pacientes");
      cuerpoTabla.innerHTML = "";

      registros.reverse().forEach(registro => {
        const fila = document.createElement("tr");
        [
          "FOLIO", "FECHA", "HORA", "CURP", "PATERNO", "MATERNO", "NOMBRE(S)",
          "FECHA DE NACIMIENTO", "SEXO", "ENTIDAD", "HOMOCLAVE", "MOTIVO", "EDAD", "CAJERA",
          "NUMERO DE REFERENCIA", "OBSERVACIONES"
        ].forEach(campo => {
          const celda = document.createElement("td");
          celda.textContent = registro[campo] || "";
          fila.appendChild(celda);
        });
        cuerpoTabla.appendChild(fila);
      });
    })
    .catch(err => {
      mostrarMensaje("❌ Error al cargar registros");
      console.error(err);
    });
}

// 🧾 Muestra mensajes al usuario
function mostrarMensaje(texto) {
  const msg = document.getElementById("mensaje");
  msg.textContent = texto;
  msg.style.display = "block";
  setTimeout(() => msg.style.display = "none", 3000);
}

// 🚀 Inicializa todo al cargar
window.onload = () => {
  iniciarEscanerQR();
  cargarTabla();
  document.getElementById("btn-enviar").addEventListener("click", enviarDatos);
};





