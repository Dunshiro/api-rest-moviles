require('dotenv').config();

const express = require('express');
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  })
});

const db = admin.firestore();
const app = express();

app.use(express.json()); // Para poder parsear JSON

app.get('/', (req, res) => {
    res.send('API REST de Moviles II');
});

// LIBROS
app.get('/libros/lista', async (req, res) => {
    const librosSnapshot = await db.collection('libros').get();
    const libros = [];
    librosSnapshot.forEach(doc => {
        libros.push({
            id: doc.id,
            data: doc.data()
        });
    });
    res.json(libros);
});

app.get('/libros/:id', async (req, res) => {
    const id = req.params.id;
    const libro = await db.collection('libros').doc(id).get();

    if (!libro.exists) {
        return res.status(404).json({message: 'Libro no encontrado'});
    }

    res.json({id: libro.id, data: libro.data()});
});

app.post('/libros', async (req, res) => {
    const newLibro = req.body;

    if (!newLibro.titulo || !newLibro.autor || !newLibro.anio_publicacion || !newLibro.genero || !newLibro.imagen) {
        return res.status(400).json({message: 'Todos los campos son obligatorios.'});
    }

    const libro = await db.collection('libros').add(newLibro);
    res.status(201).json({id: libro.id});
});

app.put('/libros/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('libros').doc(id).set(req.body, { merge: true });
    res.json({message: 'Libro actualizado'});
});

app.delete('/libros/delete/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('libros').doc(id).delete();
    res.status(204).end();
});

app.post('/libros/bulk', async (req, res) => {
    const libros = req.body;

    // Validar los campos necesarios
    for (let libro of libros) {
        if (!libro.titulo || !libro.autor || !libro.anio_publicacion || !libro.genero || !libro.imagen) {
            return res.status(400).json({message: 'Todos los campos son obligatorios'});
        }
    }

    // Añadir todos los libros a la base de datos
    for (let libro of libros) {
        await db.collection('libros').add(libro);
    }

    res.status(201).json({message: 'Libros añadidos correctamente'});
});

// USUARIOS
app.get('/usuarios/lista', async (req, res) => {
    const usuariosSnapshot = await db.collection('usuarios').get();
    const usuarios = [];
    usuariosSnapshot.forEach(doc => {
        usuarios.push({
            id: doc.id,
            data: doc.data()
        });
    });
    res.json(usuarios);
});

app.get('/usuarios/:id', async (req, res) => {
    const id = req.params.id;
    const usuario = await db.collection('usuarios').doc(id).get();

    if (!usuario.exists) {
        return res.status(404).json({message: 'Usuario no encontrado'});
    }

    res.json({id: usuario.id, data: usuario.data()});
});

app.post('/usuarios', async (req, res) => {
    const newUser = req.body;

    // Validar los campos necesarios
    if (!newUser.nombres || !newUser.apellidos || !newUser.telefono || !newUser.direccion || !newUser.rol || !newUser.dni || !newUser.email || !newUser.password) {
        return res.status(400).json({message: 'Todos los campos son obligatorios'});
    }

    if (newUser.dni.length !== 8) {
        return res.status(400).json({message: 'El DNI debe tener exactamente 8 caracteres'});
    }

    // Crear el usuario en la autenticación de Firebase
    const userCredential = await admin.auth().createUser({
        email: newUser.email,
        password: newUser.password
    });

    // Añadir el usuario a Firestore utilizando el UID del usuario como el ID del documento
    const user = await db.collection('usuarios').doc(userCredential.uid).set({
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
        telefono: newUser.telefono,
        direccion: newUser.direccion,
        rol: newUser.rol,
        dni: newUser.dni
    });

    res.status(201).json({id: userCredential.uid});
});

app.put('/usuarios/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('usuarios').doc(id).set(req.body, { merge: true });
    res.json({message: 'Usuario actualizado'});
});

app.delete('/usuarios/delete/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('usuarios').doc(id).delete();
    await admin.auth().deleteUser(id);
    res.status(204).end();
})

// PRESTAMOS
app.get('/prestamos/lista', async (req, res) => {
    const prestamosSnapshot = await db.collection('prestamos').get();
    const prestamos = [];
    prestamosSnapshot.forEach(doc => {
        prestamos.push({
            id: doc.id,
            data: doc.data()
        });
    });
    res.json(prestamos);
});

app.get('/prestamos/:id', async (req, res) => {
    const id = req.params.id;
    const prestamo = await db.collection('prestamos').doc(id).get();

    if (!prestamo.exists) {
        return res.status(404).json({message: 'Préstamo no encontrado'});
    }

    res.json({id: prestamo.id, data: prestamo.data()});
});

app.post('/prestamos', async (req, res) => {
    const newPrestamo = req.body;

    // Validar los campos necesarios
    if (!newPrestamo.libro_id || !newPrestamo.usuario_id || !newPrestamo.fecha_prestamo || !newPrestamo.fecha_devolucion) {
        return res.status(400).json({message: 'Todos los campos son obligatorios'});
    }

    const prestamo = await db.collection('prestamos').add(newPrestamo);
    res.status(201).json({id: prestamo.id});
});

app.put('/prestamos/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('prestamos').doc(id).set(req.body, { merge: true });
    res.json({message: 'Préstamo actualizado'});
});

app.delete('/prestamos/delete/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('prestamos').doc(id).delete();
    res.status(204).end();
});

app.post('/prestamos/bulk', async (req, res) => {
    const prestamos = req.body;

    // Validar los campos necesarios
    for (let prestamo of prestamos) {
        if (!prestamo.libro_id || !prestamo.usuario_id || !prestamo.fecha_prestamo || !prestamo.fecha_devolucion) {
            return res.status(400).json({message: 'Todos los campos son obligatorios'});
        }
    }

    // Añadir todos los préstamos a la base de datos
    for (let prestamo of prestamos) {
        await db.collection('prestamos').add(prestamo);
    }

    res.status(201).json({message: 'Préstamos añadidos correctamente'});
});

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
