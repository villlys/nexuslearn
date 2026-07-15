// index.js - Punto de entrada del servidor Express para NexusLearn
// (framework: herramienta y reglas para construir una aplicación desde 0)

const express = require('express');
// express (framework de Node.js para construir aplicaciones web)
// cors (middleware para habilitar CORS, que permite solicitudes desde diferentes dominios)
// ambos son necesarios para configurar el servidor.

const cors = require('cors');
// cors (Cross-Origin Resource Sharing) es una libreria que controla el acceso
// a dominios diferentes al servidor: permite a tu frontend en React hablar con tu backend.

require('dotenv').config();
// lee archivo .env y carga las variables DB_PASSWORD, PORT, etc.

const pool = require('./db');
// esto conecta tu archivo db.js para que se ejecute la conexión a PostgreSQL
// al importarlo aquí, Node ejecuta el código de db.js inmediatamente

const app = express(); // esta crea tu aplicacion/servidor

// Middleware: funciones que se ejecutan entre la llegada de la petición y la respuesta
// procesan datos antes de que lleguen a tus rutas.
// pueden verificar (token, convertir JSON, habilitar cors)

app.use(cors()); // middleware de CORS, se ejecuta en cada petición
app.use(express.json()); // middleware para leer JSON en las solicitudes entrantes

///ruta de usarios
const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);



// Rutas
app.get('/', (req, res) => {
    res.json({ message: '¡Bienvenido a NexusLearn!' });
    // crea tu primera ruta: cuando alguien visita http://localhost:3000/
    // recibe ese mensaje JSON (sirve para probar que el servidor funciona)
});


// Rutas de actividades
const actividadesRoutes = require('./routes/actividades'); //importa las rutas de actividades

app.use('/api/actividades', actividadesRoutes); //usa esas rutas para cualquier URL que empiece
//  con /api/actividades7

// Rutas de preguntas
const preguntasRoutes = require('./routes/preguntas'); //importa las rutas de preguntas
app.use('/api/preguntas', preguntasRoutes); //usa esas rutas para cualquier URL que empiece 
// con /api/preguntas

// Rutas de IA (Entrenador IA con Gemini)
const iaRoutes = require('./routes/ia');
app.use('/api/ia', iaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    // esto le dice al servidor en qué puerto escuchar, usa .env si existe
    // si no, revisa en CMD que arrancó bien
});