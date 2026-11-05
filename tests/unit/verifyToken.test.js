const jwt = require('jsonwebtoken');
const { verifyToken, authorizeRoles } = require('../../src/middleware/verifyToken');

describe('Unit Tests: Middleware de Autenticación y Autorización (verifyToken)', () => {
  const JWT_SECRET = 'test_secret_key_123';
  let mockReq;
  let mockRes;
  let nextFn;

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFn = jest.fn();
  });

  describe('verifyToken', () => {
    test('Debe retornar 401 si no se envía la cabecera Authorization', () => {
      verifyToken(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('No se proporcionó un token')
        })
      );
      expect(nextFn).not.toHaveBeenCalled();
    });

    test('Debe retornar 401 si el token viene vacío después de "Bearer "', () => {
      mockReq.headers['authorization'] = 'Bearer ';

      verifyToken(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Token no válido o vacío')
        })
      );
      expect(nextFn).not.toHaveBeenCalled();
    });

    test('Debe retornar 403 si el token es inválido o está corrupto', () => {
      mockReq.headers['authorization'] = 'Bearer token_invalido_xyz';

      verifyToken(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Token no válido')
        })
      );
      expect(nextFn).not.toHaveBeenCalled();
    });

    test('Debe retornar 401 si el token está expirado', () => {
      const expiredToken = jwt.sign(
        { id: '123', rol: 'PACIENTE' },
        JWT_SECRET,
        { expiresIn: '-1s' } // Ya expiró
      );

      mockReq.headers['authorization'] = `Bearer ${expiredToken}`;

      verifyToken(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('El token ha expirado')
        })
      );
      expect(nextFn).not.toHaveBeenCalled();
    });

    test('Debe decodificar el token y llamar a next() si el token es válido', () => {
      const payload = { id: 'usr_123', email: 'medico@test.com', rol: 'PROFESIONAL' };
      const validToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      mockReq.headers['authorization'] = `Bearer ${validToken}`;

      verifyToken(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.email).toBe(payload.email);
      expect(mockReq.user.rol).toBe(payload.rol);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRoles', () => {
    test('Debe permitir acceso (next) si el usuario tiene uno de los roles permitidos', () => {
      mockReq.user = { email: 'admin@test.com', rol: 'ADMIN' };
      const middleware = authorizeRoles('ADMIN', 'PROFESIONAL');

      middleware(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('Debe retornar 403 si el rol del usuario no está autorizado', () => {
      mockReq.user = { email: 'paciente@test.com', rol: 'PACIENTE' };
      const middleware = authorizeRoles('ADMIN');

      middleware(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Acceso restringido')
        })
      );
      expect(nextFn).not.toHaveBeenCalled();
    });
  });
});
