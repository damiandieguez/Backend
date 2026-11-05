const userService = require('../../src/services/userService');
const Usuario = require('../../src/models/userModel');
const jwt = require('jsonwebtoken');

// Mock del modelo de Mongoose
jest.mock('../../src/models/userModel');

describe('Unit Tests: Servicio de Usuarios (userService)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secreto_test';
  });

  describe('register()', () => {
    test('Debe lanzar error 400 si el correo electrónico ya está registrado', async () => {
      Usuario.findOne.mockResolvedValue({ _id: '123', email: 'existente@test.com' });

      await expect(
        userService.register({
          email: 'existente@test.com',
          password: 'Password123!',
          rol: 'PACIENTE'
        })
      ).rejects.toMatchObject({
        message: 'El correo electrónico ya se encuentra registrado',
        statusCode: 400
      });

      expect(Usuario.findOne).toHaveBeenCalledWith({ email: 'existente@test.com' });
    });

    test('Debe registrar exitosamente un usuario nuevo y no incluir la contraseña en la respuesta', async () => {
      Usuario.findOne.mockResolvedValue(null);

      // Simular instancia de usuario y método save
      const mockUserInstance = {
        _id: 'nuevo_id_123',
        email: 'nuevo@test.com',
        password: 'hashed_password',
        rol: 'PACIENTE',
        activo: true,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'nuevo_id_123',
          email: 'nuevo@test.com',
          password: 'hashed_password',
          rol: 'PACIENTE',
          activo: true
        })
      };

      Usuario.mockImplementation(() => mockUserInstance);

      const resultado = await userService.register({
        email: 'nuevo@test.com',
        password: 'Password123!',
        rol: 'PACIENTE'
      });

      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(resultado).toBeDefined();
      expect(resultado.email).toBe('nuevo@test.com');
      expect(resultado.password).toBeUndefined(); // Contraseña eliminada
    });
  });

  describe('login()', () => {
    test('Debe lanzar error 400 si falta email o contraseña', async () => {
      await expect(userService.login('', '123456')).rejects.toMatchObject({
        message: 'Email y contraseña son obligatorios',
        statusCode: 400
      });

      await expect(userService.login('test@test.com', '')).rejects.toMatchObject({
        message: 'Email y contraseña son obligatorios',
        statusCode: 400
      });
    });

    test('Debe lanzar error 401 si el usuario no existe', async () => {
      Usuario.findOne.mockResolvedValue(null);

      await expect(
        userService.login('noexiste@test.com', 'Password123!')
      ).rejects.toMatchObject({
        message: 'Credenciales inválidas',
        statusCode: 401
      });
    });

    test('Debe lanzar error 403 si la cuenta del usuario está inactiva', async () => {
      Usuario.findOne.mockResolvedValue({
        email: 'inactivo@test.com',
        activo: false
      });

      await expect(
        userService.login('inactivo@test.com', 'Password123!')
      ).rejects.toMatchObject({
        message: expect.stringContaining('inactiva'),
        statusCode: 403
      });
    });

    test('Debe lanzar error 401 si la contraseña es incorrecta', async () => {
      const mockUser = {
        email: 'user@test.com',
        activo: true,
        compararPassword: jest.fn().mockResolvedValue(false)
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      await expect(
        userService.login('user@test.com', 'WrongPassword')
      ).rejects.toMatchObject({
        message: 'Credenciales inválidas',
        statusCode: 401
      });

      expect(mockUser.compararPassword).toHaveBeenCalledWith('WrongPassword');
    });

    test('Debe iniciar sesión exitosamente y retornar token JWT y datos de usuario', async () => {
      const mockUser = {
        _id: 'user_999',
        email: 'admin@centrosalud.com',
        rol: 'ADMIN',
        activo: true,
        perfil_id: null,
        compararPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'user_999',
          email: 'admin@centrosalud.com',
          rol: 'ADMIN',
          activo: true,
          password: 'secret_hash'
        })
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      const resultado = await userService.login('admin@centrosalud.com', 'Admin123!');

      expect(mockUser.compararPassword).toHaveBeenCalledWith('Admin123!');
      expect(mockUser.save).toHaveBeenCalled();
      expect(resultado.token).toBeDefined();
      expect(resultado.usuario.password).toBeUndefined();
      expect(resultado.usuario.email).toBe('admin@centrosalud.com');

      // Verificar que el token sea decodificable
      const decoded = jwt.verify(resultado.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user_999');
      expect(decoded.rol).toBe('ADMIN');
    });
  });

  describe('getUserById()', () => {
    test('Debe lanzar error 404 si el usuario no existe', async () => {
      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(userService.getUserById('id_inexistente')).rejects.toMatchObject({
        message: 'Usuario no encontrado',
        statusCode: 404
      });
    });

    test('Debe retornar los datos del usuario si se encuentra', async () => {
      const mockUserData = { _id: '123', email: 'test@hospital.com', rol: 'PROFESIONAL' };
      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserData)
      });

      const user = await userService.getUserById('123');
      expect(user).toEqual(mockUserData);
    });
  });
});
