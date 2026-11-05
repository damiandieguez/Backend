const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
require('dotenv').config();

describe('Integration Tests: API RESTful Centro de Salud', () => {
  beforeAll(async () => {
    // Si no está conectado, conectar con la base de datos de test o desarrollo
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Cerrar conexión a la base de datos
    await mongoose.connection.close();
  });

  describe('GET /api (Healthcheck & Info)', () => {
    test('Debe responder 200 OK con la información de los endpoints de la API', async () => {
      const res = await request(app).get('/api');

      expect(res.statusCode).toBe(200);
      expect(res.body.nombre).toBe('API RESTful Centro de Salud');
      expect(res.body.endpoints).toBeDefined();
      expect(res.body.endpoints.turnos).toBe('/api/turnos');
    });

    test('Debe responder 404 ante rutas no existentes', async () => {
      const res = await request(app).get('/api/ruta_que_no_existe');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Ruta no encontrada');
    });
  });

  describe('POST /api/usuarios/login (Autenticación)', () => {
    test('Debe responder 400 si se envía el formulario vacío', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Debe responder 401 si las credenciales son incorrectas', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@centrosalud.com',
          password: 'Password_Incorrecto'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('inválidas');
    });

    test('Debe responder 200 y retornar token JWT con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@centrosalud.com',
          password: 'Admin123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.usuario.email).toBe('admin@centrosalud.com');
      expect(res.body.data.usuario.rol).toBe('ADMIN');
      expect(res.body.data.usuario.password).toBeUndefined();
    });
  });

  describe('Protección de rutas sensibles con JWT', () => {
    test('POST /api/turnos debe denegar el acceso (401) si no se envía token', async () => {
      const res = await request(app)
        .post('/api/turnos')
        .send({
          paciente_id: '60d5ecb8b5c9c22b5c8e4001',
          profesional_id: '60d5ecb8b5c9c22b5c8e4010',
          especialidad: 'Cardiología',
          fecha_hora: '2026-11-01T10:00:00Z'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No se proporcionó un token');
    });

    test('GET /api/usuarios debe denegar acceso a usuarios sin rol ADMIN', async () => {
      // 1. Iniciar sesión como Paciente
      const loginRes = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'juan.perez@email.com',
          password: 'Password123!'
        });

      const tokenPaciente = loginRes.body.data.token;

      // 2. Intentar listar usuarios siendo paciente
      const res = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${tokenPaciente}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Acceso restringido');
    });

    test('GET /api/usuarios debe permitir acceso si el usuario es ADMIN', async () => {
      // 1. Iniciar sesión como Admin
      const loginRes = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@centrosalud.com',
          password: 'Admin123!'
        });

      const tokenAdmin = loginRes.body.data.token;

      // 2. Listar usuarios como admin
      const res = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
