const listaVentas = document.getElementById("listaVentas");

function cargarVentas() {
  fetch(`${API_BASE}/ventas`)
    .then((res) => res.json())
    .then((ventas) => {
      listaVentas.innerHTML = "";
      ventas.forEach((venta) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>Módulo:</strong> ${venta.modulo} <br>
          <strong>Descripción:</strong> ${venta.descripcion} <br>
          <strong>Total:</strong> $${venta.total.toFixed(2)}
        `;
        listaVentas.appendChild(li);
      });
    });
}

cargarVentas();
