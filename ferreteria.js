// Módulo de conexión a la base de datos para la Ferretería
const API_BASE = "http://localhost:3000/api/ferreteria";
const ventasAPI = "http://localhost:3000/api/ventas";
const ferreteriaForm = document.getElementById("ferreteriaForm");
const listaFerreteria = document.getElementById("listaFerreteria");

// Validar nombre sin caracteres especiales ni números
function validarNombre(nombre) {
  const regex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  return regex.test(nombre);
}

// Agregar producto a la ferretería
ferreteriaForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreProductoFerreteria").value;
  if (!validarNombre(nombre)) {
    alert("El nombre contiene caracteres no permitidos.");
    return;
  }

  const producto = {
    nombre,
    familia: document.getElementById("familiaProductoFerreteria").value,
    departamento: document.getElementById("departamentoProductoFerreteria").value,
    tamaño: document.getElementById("tamañoProductoFerreteria").value,
    precio: parseFloat(document.getElementById("precioProductoFerreteria").value),
    cantidad_disponible: parseInt(document.getElementById("cantidadDisponibleFerreteria").value),
  };

  fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  })
    .then(() => {
      ferreteriaForm.reset();
      cargarFerreteria();
    })
    .catch((error) => console.error("Error al agregar producto a la ferretería:", error));
});

// Cargar productos de la ferretería
function cargarFerreteria() {
  fetch(API_BASE)
    .then((res) => res.json())
    .then((productos) => {
      listaFerreteria.innerHTML = "";
      productos.forEach((producto) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${producto.nombre}</strong> - Cantidad: ${producto.cantidad_disponible} - $${producto.precio.toFixed(2)}
          <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
          <button onclick="modificarProducto(${producto.id})">Modificar</button>
          <button onclick="comprarProducto(${producto.id}, '${producto.nombre}', ${producto.precio})">Comprar</button>
        `;
        listaFerreteria.appendChild(li);
      });
    })
    .catch((error) => console.error("Error al cargar productos de la ferretería:", error));
}

// Eliminar producto de la ferretería
function eliminarProducto(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    })
      .then(() => cargarFerreteria())
      .catch((error) => console.error("Error al eliminar producto de la ferretería:", error));
  }
}

// Modificar producto de la ferretería
function modificarProducto(id) {
  fetch(`${API_BASE}/${id}`)
    .then((res) => res.json())
    .then((producto) => {
      const nuevaCantidad = prompt("Ingrese la nueva cantidad disponible:", producto.cantidad_disponible);
      const nuevoPrecio = prompt("Ingrese el nuevo precio:", producto.precio);

      if (nuevaCantidad && !isNaN(nuevaCantidad) && nuevoPrecio && !isNaN(nuevoPrecio)) {
        fetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cantidad_disponible: parseInt(nuevaCantidad), precio: parseFloat(nuevoPrecio) }),
        })
          .then(() => cargarFerreteria())
          .catch((error) => console.error("Error al modificar producto de la ferretería:", error));
      } else {
        alert("Cantidad o precio inválido.");
      }
    })
    .catch((error) => console.error("Error al obtener producto para modificar:", error));
}

// Comprar producto de la ferretería
function comprarProducto(id, nombre, precio) {
  const cantidad = prompt("Ingrese la cantidad a comprar:");
  if (cantidad && !isNaN(cantidad) && cantidad > 0) {
    fetch(`${API_BASE}/${id}`)
      .then((res) => res.json())
      .then((producto) => {
        if (producto.cantidad_disponible >= cantidad) {
          let total = precio * cantidad;

          // Aplicar descuento del 15% si el total es mayor o igual a $1000
          if (total >= 1000) {
            total *= 0.85;
          }

          const nuevaCantidad = producto.cantidad_disponible - cantidad;

          // Actualizar cantidad disponible
          fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cantidad_disponible: nuevaCantidad }),
          })
            .then(() => {
              // Registrar la venta
              fetch(ventasAPI, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ modulo: "Ferretería", descripcion: nombre, cantidad, total }),
              })
                .then(() => {
                  alert(`Compra realizada con éxito. Total a pagar: $${total.toFixed(2)}\nGracias por su compra.`);
                  cargarFerreteria();
                })
                .catch((error) => console.error("Error al registrar la venta de la ferretería:", error));
            })
            .catch((error) => console.error("Error al actualizar cantidad del producto de la ferretería:", error));
        } else {
          alert("No hay suficiente stock disponible.");
        }
      })
      .catch((error) => console.error("Error al realizar la compra en la ferretería:", error));
  } else {
    alert("Entrada inválida.");
  }
}

// Inicializar carga de productos
cargarFerreteria();
