// Módulo de conexión a la base de datos para el Café Internet
const API_BASE = "http://localhost:3000/api/cafe-internet";
const ventasAPI = "http://localhost:3000/api/ventas";
const cafeForm = document.getElementById("cafeForm");
const listaCafeInternet = document.getElementById("listaCafeInternet");

// Generar IP única para las computadoras del café internet
function generarIP() {
  const ipBase = "192.168.6.";
  const octeto = Math.floor(Math.random() * 254) + 1;
  return ipBase + octeto;
}

// Agregar computadora al café internet
cafeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreComputadora").value;
  if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(nombre)) {
    alert("El nombre contiene caracteres no permitidos.");
    return;
  }

  const computadora = {
    nombre,
    ip: generarIP(),
    precio_por_minuto: parseFloat(document.getElementById("precioMinuto").value),
    estado: "libre", // Estado inicial: libre
    tiempo_restante: 0,
  };

  fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(computadora),
  })
    .then(() => {
      cafeForm.reset();
      cargarCafeInternet();
    })
    .catch((error) => console.error("Error al agregar computadora:", error));
});

// Cargar computadoras del café internet
function cargarCafeInternet() {
  fetch(API_BASE)
    .then((res) => res.json())
    .then((computadoras) => {
      listaCafeInternet.innerHTML = "";
      computadoras.forEach((computadora) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${computadora.nombre}</strong> - IP: ${computadora.ip} - $${computadora.precio_por_minuto}/minuto
          - Estado: ${computadora.estado} - Tiempo Restante: ${computadora.tiempo_restante} minutos
          <button onclick="eliminarComputadora(${computadora.id})">Eliminar</button>
          <button onclick="rentarComputadora(${computadora.id})">Rentar</button>
          <button onclick="extenderTiempo(${computadora.id})">Extender Tiempo</button>
        `;
        listaCafeInternet.appendChild(li);
      });
    })
    .catch((error) => console.error("Error al cargar computadoras:", error));
}

// Eliminar computadora del café internet
function eliminarComputadora(id) {
  if (confirm("¿Estás seguro de que deseas eliminar esta computadora?")) {
    fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    })
      .then(() => cargarCafeInternet())
      .catch((error) => console.error("Error al eliminar computadora:", error));
  }
}

// Rentar una computadora con posibilidad de extender el tiempo
function rentarComputadora(id) {
  const tiempo = prompt("Ingrese el tiempo de uso en minutos:");
  if (tiempo && !isNaN(tiempo) && tiempo > 0) {
    fetch(`${API_BASE}/${id}`)
      .then((res) => res.json())
      .then((computadora) => {
        let total = computadora.precio_por_minuto * tiempo;
        const nuevoTiempoRestante = computadora.tiempo_restante + parseInt(tiempo);

        // Aplicar descuento del 6.66% si el tiempo total es mayor a 120 minutos
        if (nuevoTiempoRestante > 120) {
          total *= 0.9334;
        }

        // Actualizar tiempo restante y estado
        fetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tiempo_restante: nuevoTiempoRestante, estado: "ocupada" }),
        })
          .then(() => {
            // Registrar la renta
            fetch(ventasAPI, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ modulo: "Café Internet", descripcion: computadora.nombre, cantidad: tiempo, total }),
            })
              .then(() => {
                alert(`Renta realizada con éxito. Total a pagar: $${total.toFixed(2)}\nGracias por su compra.`);
                cargarCafeInternet();
              })
              .catch((error) => console.error("Error al registrar la venta:", error));
          })
          .catch((error) => console.error("Error al actualizar computadora:", error));
      })
      .catch((error) => console.error("Error al realizar renta:", error));
  } else {
    alert("Tiempo inválido.");
  }
}

// Extender tiempo de una computadora ocupada
function extenderTiempo(id) {
  const tiempoExtra = prompt("Ingrese el tiempo adicional en minutos:");
  if (tiempoExtra && !isNaN(tiempoExtra) && tiempoExtra > 0) {
    fetch(`${API_BASE}/${id}`)
      .then((res) => res.json())
      .then((computadora) => {
        const nuevoTiempoRestante = computadora.tiempo_restante + parseInt(tiempoExtra);
        let total = computadora.precio_por_minuto * tiempoExtra;

        // Aplicar descuento del 6.66% si el tiempo total es mayor a 120 minutos
        if (nuevoTiempoRestante > 120) {
          total *= 0.9334;
        }

        // Actualizar tiempo restante
        fetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tiempo_restante: nuevoTiempoRestante, estado: "ocupada" }),
        })
          .then(() => {
            // Registrar la extensión de la renta
            fetch(ventasAPI, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ modulo: "Café Internet", descripcion: computadora.nombre, cantidad: tiempoExtra, total }),
            })
              .then(() => {
                alert(`Tiempo extendido con éxito. Total a pagar: $${total.toFixed(2)}\nGracias por su compra.`);
                cargarCafeInternet();
              })
              .catch((error) => console.error("Error al registrar la extensión de la renta:", error));
          })
          .catch((error) => console.error("Error al actualizar computadora:", error));
      })
      .catch((error) => console.error("Error al extender tiempo:", error));
  } else {
    alert("Tiempo adicional inválido.");
  }
}

// Inicializar carga de computadoras
cargarCafeInternet();
