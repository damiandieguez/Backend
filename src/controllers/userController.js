const userService = require('../services/userService');

/**
 * Controlador de Usuarios y Autenticación
 * Responsabilidad: Manejar Request, llamar a userService y responder HTTP.
 */
class UserController {
  /**
   * Registro de usuario
   * POST /api/usuarios/register
   */
  async register(req, res) {
    try {
      const nuevoUsuario = await userService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: nuevoUsuario
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor al registrar usuario'
      });
    }
  }

  /**
   * Inicio de sesión (Login) y generación de JWT
   * POST /api/usuarios/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const resultado = await userService.login(email, password);
      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: resultado
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor en inicio de sesión'
      });
    }
  }

  /**
   * Listar todos los usuarios
   * GET /api/usuarios
   */
  async getAll(req, res) {
    try {
      const usuarios = await userService.getAllUsers(req.query);
      return res.status(200).json({
        success: true,
        count: usuarios.length,
        data: usuarios
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener usuarios'
      });
    }
  }

  /**
   * Obtener un usuario por ID
   * GET /api/usuarios/:id
   */
  async getById(req, res) {
    try {
      const usuario = await userService.getUserById(req.params.id);
      return res.status(200).json({
        success: true,
        data: usuario
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener usuario'
      });
    }
  }

  /**
   * Actualizar usuario por ID
   * PUT /api/usuarios/:id
   */
  async update(req, res) {
    try {
      const usuarioActualizado = await userService.updateUser(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al actualizar usuario'
      });
    }
  }

  /**
   * Eliminar usuario por ID
   * DELETE /api/usuarios/:id
   */
  async delete(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al eliminar usuario'
      });
    }
  }
}

module.exports = new UserController();
