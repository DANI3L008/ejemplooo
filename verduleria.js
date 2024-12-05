const mysql = require('mysql2');

// Configuración de conexión a la base de datos
const dbConfigStock = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'verduleria_db',
};
const connection = mysql.createConnection(dbConfigStock);

// Mostrar productos desde la base de datos
function cargarProductosVerduleria() {
  connection.query('SELECT * FROM verduleria_stock', (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return;
    }
    const listaVerduleriaUI = document.getElementById('listaVerduleria');
    listaVerduleriaUI.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos

    results.forEach((producto) => {
      const li = document.createElement('li');
      li.textContent = `
        Nombre: ${producto.nombre}, 
        Familia: ${producto.familia}, 
        Tipo: ${producto.tipo}, 
        Origen: ${producto.origen}, 
        Precio Unidad: $${producto.precio_uni}, 
        Precio Kilo: $${producto.precio_kg}, 
        Cantidad: ${producto.cantidad}
      `;
      listaVerduleriaUI.appendChild(li);
    });
  });
}

// Agregar producto (Formulario)
document.getElementById('verduleriaForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const nombre = document.getElementById('nombreProducto').value;
  const familia = document.getElementById('familiaProducto').value;
  const tipo = document.getElementById('tipoProducto').value;
  const origen = document.getElementById('origenProducto').value;
  const precioUnitario = parseFloat(document.getElementById('precioUnitario').value);
  const precioKilo = parseFloat(document.getElementById('precioKilo').value);
  const cantidad = 0; // Se inicializa en 0 al agregar un producto nuevo

  connection.query(
    'INSERT INTO verduleria_stock (nombre, familia, tipo, origen, precio_uni, precio_kg, cantidad) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nombre, familia, tipo, origen, precioUnitario, precioKilo, cantidad],
    (err) => {
      if (err) {
        console.error('Error al agregar producto:', err);
        return;
      }
      cargarProductosVerduleria(); // Recargar la lista de productos después de agregar uno nuevo
      document.getElementById('verduleriaForm').reset(); // Limpiar el formulario
    }
  );
});

// Cargar productos al iniciar
cargarProductosVerduleria();
