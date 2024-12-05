const express = require('express');
const cors = require('cors');
const connection = require('./db');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// --------------------------- Verdulería ---------------------------

// Obtener todos los productos de la verdulería
app.get('/api/verduleria', (req, res) => {
  const query = 'SELECT * FROM productos_verduleria';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener productos de la verdulería:', err);
      res.status(500).send('Error del servidor');
      return;
    }
    res.json(results);
  });
});

// Agregar producto a la verdulería
app.post('/api/verduleria', (req, res) => {
  const { nombre, familia, tipo, origen, precio_unitario, precio_kilo, cantidad_disponible } = req.body;
  const query = 'INSERT INTO productos_verduleria (nombre, familia, tipo, origen, precio_unitario, precio_kilo, cantidad_disponible) VALUES (?, ?, ?, ?, ?, ?, ?)';
  connection.query(query, [nombre, familia, tipo, origen, precio_unitario, precio_kilo, cantidad_disponible], (err) => {
    if (err) {
      console.error('Error al insertar producto en la verdulería:', err);
      res.status(500).send('Error del servidor');
      return;
    }
    res.send('Producto agregado con éxito a la verdulería');
  });
});

// Modificar un producto de la verdulería
app.put('/api/verduleria/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, familia, tipo, origen, precio_unitario, precio_kilo, cantidad_disponible } = req.body;

  if (!id || !nombre || !familia || !tipo || !origen || !precio_unitario || !precio_kilo || cantidad_disponible === undefined) {
    console.error(`Error: Datos incompletos para actualizar el producto (ID: ${id})`);
    return res.status(400).send('Datos incompletos para actualizar el producto');
  }

  const query = 'UPDATE productos_verduleria SET nombre = ?, familia = ?, tipo = ?, origen = ?, precio_unitario = ?, precio_kilo = ?, cantidad_disponible = ? WHERE id = ?';
  connection.query(query, [nombre, familia, tipo, origen, precio_unitario, precio_kilo, cantidad_disponible, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el producto:', err);
      return res.status(500).send('Error del servidor');
    }

    if (results.affectedRows === 0) {
      console.error(`Error: Producto con ID ${id} no encontrado`);
      return res.status(404).send('Producto no encontrado');
    }

    res.send('Producto actualizado con éxito');
  });
});


// Obtener un producto específico de la verdulería
app.get('/api/verduleria/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM productos_verduleria WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener el producto:', err);
      res.status(500).send('Error del servidor');
      return;
    }

    if (results.length === 0) {
      console.error(`Producto con ID ${id} no encontrado.`);
      return res.status(404).send('Producto no encontrado');
    }

    res.json(results[0]);
  });
});


// Eliminar un producto de la verdulería
app.delete('/api/verduleria/:id', (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send('ID del producto no proporcionado');
  }

  const query = 'DELETE FROM productos_verduleria WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar el producto:', err);
      return res.status(500).send('Error del servidor');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('Producto no encontrado');
    }

    res.send('Producto eliminado con éxito');
  });
});

// Manejar la compra de un producto en la verdulería
app.put('/api/verduleria/comprar/:id', (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  connection.query('SELECT * FROM productos_verduleria WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error al obtener el producto para la compra:', err);
      res.status(500).send('Error del servidor');
      return;
    }

    const producto = results[0];
    if (producto.cantidad_disponible < cantidad) {
      res.status(400).send('Stock insuficiente para realizar la compra');
      return;
    }

    const nuevaCantidad = producto.cantidad_disponible - cantidad;
    connection.query('UPDATE productos_verduleria SET cantidad_disponible = ? WHERE id = ?', [nuevaCantidad, id], (err) => {
      if (err) {
        console.error('Error al actualizar la cantidad disponible:', err);
        res.status(500).send('Error del servidor');
        return;
      }

      const total = producto.precio_unitario * cantidad;
      connection.query(
        'INSERT INTO ventas (modulo, descripcion, cantidad, total) VALUES (?, ?, ?, ?)',
        ['Verdulería', producto.nombre, cantidad, total],
        (err) => {
          if (err) {
            console.error('Error al registrar la venta:', err);
            res.status(500).send('Error del servidor');
            return;
          }
          res.send(`Compra realizada con éxito. Total a pagar: $${total.toFixed(2)}`);
        }
      );
    });
  });
});

// --------------------------- Ferretería ---------------------------

// Obtener todos los productos de la ferretería
app.get('/api/ferreteria', (req, res) => {
  const query = 'SELECT * FROM productos_ferreteria';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener productos de la ferretería:', err);
      res.status(500).send('Error del servidor');
      return;
    }
    res.json(results);
  });
});

// Agregar producto a la ferretería
app.post('/api/ferreteria', (req, res) => {
  const { nombre, familia, departamento, tamaño, precio, cantidad_disponible } = req.body;
  const query = 'INSERT INTO productos_ferreteria (nombre, familia, departamento, tamaño, precio, cantidad_disponible) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(query, [nombre, familia, departamento, tamaño, precio, cantidad_disponible], (err) => {
    if (err) {
      console.error('Error al insertar producto en la ferretería:', err);
      res.status(500).send('Error del servidor');
      return;
    }
    res.send('Producto agregado con éxito a la ferretería');
  });
});

// Modificar un producto de la ferretería
app.put('/api/ferreteria/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, familia, departamento, tamaño, precio, cantidad_disponible } = req.body;

  if (!id || !nombre || !familia || !departamento || !tamaño || !precio || cantidad_disponible === undefined) {
    console.error(`Error: Datos incompletos para actualizar el producto (ID: ${id})`);
    return res.status(400).send('Datos incompletos para actualizar el producto');
  }

  const query = 'UPDATE productos_ferreteria SET nombre = ?, familia = ?, departamento = ?, tamaño = ?, precio = ?, cantidad_disponible = ? WHERE id = ?';
  connection.query(query, [nombre, familia, departamento, tamaño, precio, cantidad_disponible, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el producto:', err);
      return res.status(500).send('Error del servidor');
    }

    if (results.affectedRows === 0) {
      console.error(`Error: Producto con ID ${id} no encontrado`);
      return res.status(404).send('Producto no encontrado');
    }

    res.send('Producto actualizado con éxito');
  });
});

// Manejar la compra de un producto de la ferretería
app.put('/api/ferreteria/comprar/:id', (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  connection.query('SELECT * FROM productos_ferreteria WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error al obtener el producto para la compra:', err);
      res.status(500).send('Error del servidor');
      return;
    }

    const producto = results[0];
    if (producto.cantidad_disponible < cantidad) {
      res.status(400).send('Stock insuficiente para realizar la compra');
      return;
    }

    const nuevaCantidad = producto.cantidad_disponible - cantidad;
    let total = producto.precio * cantidad;

    // Aplicar descuento del 15% si el total es mayor o igual a $1000
    if (total >= 1000) {
      total *= 0.85;
    }

    connection.query('UPDATE productos_ferreteria SET cantidad_disponible = ? WHERE id = ?', [nuevaCantidad, id], (err) => {
      if (err) {
        console.error('Error al actualizar la cantidad disponible:', err);
        res.status(500).send('Error del servidor');
        return;
      }

      connection.query(
        'INSERT INTO ventas (modulo, descripcion, cantidad, total) VALUES (?, ?, ?, ?)',
        ['Ferretería', producto.nombre, cantidad, total],
        (err) => {
          if (err) {
            console.error('Error al registrar la venta:', err);
            res.status(500).send('Error del servidor');
            return;
          }
          res.send(`Compra realizada con éxito. Total a pagar: $${total.toFixed(2)}`);
        }
      );
    });
  });
});


// --------------------------- Café Internet ---------------------------

// Obtener todas las computadoras del café internet
app.get('/api/cafe-internet', (req, res) => {
  const query = 'SELECT * FROM computadoras_cafe_internet';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener computadoras del café internet:', err);
      res.status(500).send('Error del servidor');
      return;
    }
    res.json(results);
  });
});

// Agregar una computadora al café internet
app.post('/api/cafe-internet', (req, res) => {
  const { nombre, ip, precio_por_minuto } = req.body;
  const query = 'INSERT INTO computadoras_cafe_internet (nombre, ip, precio_por_minuto, estado, tiempo_restante) VALUES (?, ?, ?, "libre", 0)';
  connection.query(query, [nombre, ip, precio_por_minuto], (err) => {
    if (err) {
      console.error('Error al insertar computadora en el café internet:', err);
      res.status(500).send('Error del servidor');
      return;
    }
    res.send('Computadora agregada con éxito al café internet');
  });
});

// Rentar una computadora del café internet
app.put('/api/cafe-internet/rentar/:id', (req, res) => {
  const { id } = req.params;
  const { tiempo } = req.body;

  connection.query('SELECT * FROM computadoras_cafe_internet WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error al obtener la computadora para la renta:', err);
      res.status(500).send('Error del servidor');
      return;
    }

    const computadora = results[0];
    let total = computadora.precio_por_minuto * tiempo;
    const nuevoTiempoRestante = computadora.tiempo_restante + parseInt(tiempo);

    // Aplicar descuento del 6.66% si el tiempo total es mayor a 120 minutos
    if (nuevoTiempoRestante > 120) {
      total *= 0.9334;
    }

    connection.query('UPDATE computadoras_cafe_internet SET tiempo_restante = ?, estado = "ocupada" WHERE id = ?', [nuevoTiempoRestante, id], (err) => {
      if (err) {
        console.error('Error al actualizar la computadora:', err);
        res.status(500).send('Error del servidor');
        return;
      }

      connection.query(
        'INSERT INTO ventas (modulo, descripcion, cantidad, total) VALUES (?, ?, ?, ?)',
        ['Café Internet', computadora.nombre, tiempo, total],
        (err) => {
          if (err) {
            console.error('Error al registrar la venta:', err);
            res.status(500).send('Error del servidor');
            return;
          }
          res.send(`Renta realizada con éxito. Total a pagar: $${total.toFixed(2)}`);
        }
      );
    });
  });
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
