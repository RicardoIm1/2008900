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

  fetch("https://script.google.com/macros/s/AKfycbyVrsvGZJsaAALN_7izjjgVYxAtXrQ1QmNTvGpNaUFU93Nfyddjx1kcbiQHY81Tfpsoww/exec", {
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
  fetch("https://script.google.com/macros/s/AKfycbyVrsvGZJsaAALN_7izjjgVYxAtXrQ1QmNTvGpNaUFU93Nfyddjx1kcbiQHY81Tfpsoww/exec")
    .then(res => res.json())
    .then(registros => {
      const cuerpoTabla = document.querySelector("#tabla-registros tbody");
      cuerpoTabla.innerHTML = ""; // Limpia tabla

      registros.forEach(reg => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${reg.folio}</td>
          <td>${reg.curp}</td>
          <td>${reg.motivo}</td>
          <td>${reg.cajera}</td>
          <td>${reg.referencia}</td>
          <td>${reg.observaciones}</td>
          <td>${reg.fecha}</td>
        `;
        cuerpoTabla.appendChild(fila);
      });
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
