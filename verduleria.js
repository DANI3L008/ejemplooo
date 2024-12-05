const API_BASE = "http://localhost:3000/api/verduleria";
const verduleriaForm = document.getElementById("verduleriaForm");
const listaVerduleria = document.getElementById("listaVerduleria");

// Validar nombre sin caracteres especiales ni números
function validarNombre(nombre) {
  const regex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  return regex.test(nombre);
}

// Agregar producto
verduleriaForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreProducto").value;
  if (!validarNombre(nombre)) {
    alert("El nombre contiene caracteres no permitidos.");
    return;
  }

  const producto = {
    nombre,
    familia: document.getElementById("familiaProducto").value,
    tipo: document.getElementById("tipoProducto").value,
    origen: document.getElementById("origenProducto").value,
    precio_unitario: parseFloat(document.getElementById("precioUnitario").value),
    precio_kilo: parseFloat(document.getElementById("precioKilo").value),
    cantidad_disponible: parseInt(document.getElementById("cantidadDisponible").value),
  };

  fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  })
    .then(() => {
      verduleriaForm.reset();
      cargarVerduleria();
    })
    .catch((error) => console.error("Error al agregar producto:", error));
});

// Cargar productos
function cargarVerduleria() {
  fetch(API_BASE)
    .then((res) => res.json())
    .then((productos) => {
      listaVerduleria.innerHTML = "";
      productos.forEach((producto) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${producto.nombre}</strong> - Cantidad: ${producto.cantidad_disponible} - $${producto.precio_unitario}/unidad
          <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
          <button onclick="modificarProducto(${producto.id})">Modificar</button>
          <button onclick="comprarProducto(${producto.id}, '${producto.nombre}', ${producto.precio_unitario})">Comprar</button>
        `;
        listaVerduleria.appendChild(li);
      });
    })
    .catch((error) => console.error("Error al cargar productos:", error));
}


// Eliminar producto
function eliminarProducto(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        alert("Producto eliminado con éxito");
        cargarVerduleria();
      })
      .catch((error) => console.error("Error al eliminar producto:", error));
  }
}

function modificarProducto(id) {
  console.log("ID del producto a modificar:", id); // Verificar si el ID es correcto

  // Obtener la información del producto desde el servidor
  fetch(`${API_BASE}/${id}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("No se pudo obtener el producto");
      }
      return res.json();
    })
    .then((producto) => {
      console.log("Producto obtenido para modificar:", producto); // Verificar el producto obtenido

      // Solicitar al usuario los nuevos valores
      const nombre = prompt("Ingrese el nuevo nombre del producto:", producto.nombre);
      const nuevaCantidad = prompt("Ingrese la nueva cantidad disponible:", producto.cantidad_disponible);
      const precioUnitario = prompt("Ingrese el nuevo precio unitario:", producto.precio_unitario);
      const precioKilo = prompt("Ingrese el nuevo precio por kilo:", producto.precio_kilo);

      // Validar los valores ingresados
      if (!nombre || !validarNombre(nombre) || isNaN(nuevaCantidad) || nuevaCantidad < 0 || isNaN(precioUnitario) || precioUnitario < 0 || isNaN(precioKilo) || precioKilo < 0) {
        alert("Entrada inválida. Por favor ingrese valores válidos.");
        return;
      }

      // Construir el objeto actualizado
      const productoActualizado = {
        nombre,
        familia: producto.familia,
        tipo: producto.tipo,
        origen: producto.origen,
        precio_unitario: parseFloat(precioUnitario),
        precio_kilo: parseFloat(precioKilo),
        cantidad_disponible: parseInt(nuevaCantidad),
      };

      console.log("Producto actualizado:", productoActualizado); // Verificar los datos antes de enviarlos

      // Enviar la actualización al servidor
      fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoActualizado),
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then((errorMessage) => {
              throw new Error(`Error al actualizar el producto: ${errorMessage}`);
            });
          }
          alert("Producto actualizado con éxito");
          cargarVerduleria();
        })
        .catch((error) => {
          console.error("Error al modificar producto:", error);
          alert("Hubo un error al intentar modificar el producto: " + error.message);
        });
    })
    .catch((error) => {
      console.error("Error al obtener producto para modificar:", error);
      alert("Hubo un error al intentar obtener el producto para modificar.");
    });
}




// Comprar producto
function comprarProducto(id, nombre, precioUnitario) {
  const cantidad = prompt("Ingrese la cantidad a comprar:");
  if (cantidad && !isNaN(cantidad) && cantidad > 0) {
    fetch(`${API_BASE}/comprar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad: parseInt(cantidad) }),
    })
      .then((res) => res.text())
      .then((mensaje) => {
        alert(mensaje);
        cargarVerduleria();
      })
      .catch((error) => console.error("Error al realizar la compra:", error));
  } else {
    alert("Entrada inválida.");
  }
}

// Inicializar carga de productos
cargarVerduleria();
