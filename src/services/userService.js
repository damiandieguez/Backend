const Usuario = require('../models/userModel');
const jwt = require('jsonwebtoken');

/**
 * Servicio de Usuarios - Lógica de negocio y acceso a base de datos
 */
class UserService {
  /**
   * Registrar un nuevo usuario en el sistema
   */
  async register(userData) {
    const { email, password, rol, perfil_id, perfil_ref } = userData;

    // Verificar si el correo ya existe
    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      const error = new Error('El correo electrónico ya se encuentra registrado');
      error.statusCode = 400;
      throw error;
    }

    const nuevoUsuario = new Usuario({
      email,
      password,
      rol,
      perfil_id,
      perfil_ref
    });

    await nuevoUsuario.save();

    // No retornar la contraseña en la respuesta
    const usuarioRespuesta = nuevoUsuario.toObject();
    delete usuarioRespuesta.password;

    return usuarioRespuesta;
  }

  /**
   * Autenticación de usuario y generación de token JWT
   */
  async login(email, password) {
    if (!email || !password) {
      const error = new Error('Email y contraseña son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() });
    if (!usuario) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    if (!usuario.activo) {
      const error = new Error('La cuenta se encuentra inactiva. Contacte al administrador');
      error.statusCode = 403;
      throw error;
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Actualizar último login
    usuario.ultimo_login = new Date();
    await usuario.save();

    // Generar JSON Web Token
    const payload = {
      id: usuario._id,
      email: usuario.email,
      rol: usuario.rol,
      perfil_id: usuario.perfil_id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    const usuarioRespuesta = usuario.toObject();
    delete usuarioRespuesta.password;

    return {
      usuario: usuarioRespuesta,
      token
    };
  }

  /**
   * Obtener todos los usuarios (excluyendo contraseña)
   */
  async getAllUsers(filtros = {}) {
    const query = {};
    if (filtros.rol) query.rol = filtros.rol;
    if (filtros.activo !== undefined) query.activo = filtros.activo === 'true' || filtros.activo === true;

    return await Usuario.find(query).select('-password').sort({ fecha_creacion: -1 });
  }

  /**
   * Obtener un usuario por su ID
   */
  async getUserById(id) {
    const usuario = await Usuario.findById(id).select('-password');
    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return usuario;
  }

  /**
   * Actualizar datos de un usuario
   */
  async updateUser(id, updateData) {
    // Si se actualiza contraseña, asegurar que se pase por el hook de save
    if (updateData.password) {
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
      }

      Object.assign(usuario, updateData);
      await usuario.save();
      const respuesta = usuario.toObject();
      delete respuesta.password;
      return respuesta;
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!usuarioActualizado) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return usuarioActualizado;
  }

  /**
   * Eliminar un usuario
   */
  async deleteUser(id) {
    const usuarioEliminado = await Usuario.findByIdAndDelete(id).select('-password');
    if (!usuarioEliminado) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return usuarioEliminado;
  }
}

module.exports = new UserService();
