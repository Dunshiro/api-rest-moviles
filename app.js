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

// Rutas para libros
app.get('/libros', async (req, res) => {
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

app.post('/libros', async (req, res) => {
    const newLibro = req.body;
    const libro = await db.collection('libros').add(newLibro);
    res.status(201).json({id: libro.id});
});

app.put('/libros/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('libros').doc(id).set(req.body, { merge: true });
    res.json({message: 'Libro actualizado'});
});

app.delete('/libros/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('libros').doc(id).delete();
    res.status(204).end();
});

// Rutas para empleados
app.get('/empleados', async (req, res) => {
    const empleadosSnapshot = await db.collection('empleados').get();
    const empleados = [];
    empleadosSnapshot.forEach(doc => {
        empleados.push({
            id: doc.id,
            data: doc.data()
        });
    });
    res.json(empleados);
});

app.post('/empleados', async (req, res) => {
    const newEmpleado = req.body;
    const empleado = await db.collection('empleados').add(newEmpleado);
    res.status(201).json({id: empleado.id});
});

app.put('/empleados/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('empleados').doc(id).set(req.body, { merge: true });
    res.json({message: 'Empleado actualizado'});
});

app.delete('/empleados/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('empleados').doc(id).delete();
    res.status(204).end();
});

// Rutas para prestamos
app.get('/prestamos', async (req, res) => {
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

app.post('/prestamos', async (req, res) => {
    const newPrestamo = req.body;
    const prestamo = await db.collection('prestamos').add(newPrestamo);
    res.status(201).json({id: prestamo.id});
});

app.put('/prestamos/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('prestamos').doc(id).set(req.body, { merge: true });
    res.json({message: 'Préstamo actualizado'});
});

app.delete('/prestamos/:id', async (req, res) => {
    const id = req.params.id;
    await db.collection('prestamos').doc(id).delete();
    res.status(204).end();
});

// Iniciar el servidor
app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
