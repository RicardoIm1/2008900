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
function enviarDatos() {
  const datos = {
    curp: document.getElementById("curp").value,
    motivo: document.getElementById("motivo").value,
    cajera: document.getElementById("cajera").value,
    referencia: document.getElementById("referencia").value,
    observaciones: document.getElementById("observaciones").value
  };

  fetch("https://script.google.com/macros/s/AKfycbzxt0wpX4ubKZ8PfD6H_fpIVddpxQndLF-7-EBnXJ16vePnGfw6cBQug5MEcGSWiy1YAg/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
  .then(res => res.json())
  .then(respuesta => {
    if (respuesta.success) {
      mostrarMensaje("✅ Registro guardado");
      cargarTabla(); // Actualiza tabla
    } else {
      mostrarMensaje("⚠️ Error: " + respuesta.message);
    }
  })
  .catch(err => {
    console.error("Error de red:", err);
    mostrarMensaje("❌ Error de conexión");
  });
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




