const express = require('express');
const cors = require('cors');

// Importar rutas
const userRoute = require('./src/routes/userRoute');
const pacienteRoute = require('./src/routes/pacienteRoute');
const profesionalRoute = require('./src/routes/profesionalRoute');
const turnoRoute = require('./src/routes/turnoRoute');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Ruta informativa de la API
app.get('/api', (req, res) => {
  res.status(200).json({
    nombre: 'API RESTful Centro de Salud',
    version: '1.0.0',
    descripcion: 'Sistema de gestión de turnos, pacientes, profesionales y usuarios',
    endpoints: {
      auth: '/api/usuarios/login',
      usuarios: '/api/usuarios',
      pacientes: '/api/pacientes',
      profesionales: '/api/profesionales',
      turnos: '/api/turnos'
    }
  });
});

// Montaje de rutas
app.use('/api/usuarios', userRoute);
app.use('/api/pacientes', pacienteRoute);
app.use('/api/profesionales', profesionalRoute);
app.use('/api/turnos', turnoRoute);

// Middleware para manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Middleware global de manejo de errores (500)
app.use((err, req, res, next) => {
  console.error('[Error Global]:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
