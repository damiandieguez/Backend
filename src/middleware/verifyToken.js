const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar la validez del JSON Web Token (JWT)
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado: No se proporcionó un token de autenticación'
    });
  }

  // Espera formato "Bearer <token>" o directamente "<token>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado: Token no válido o vacío'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, rol, perfil_id }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado. Por favor inicie sesión nuevamente.'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Token no válido o corrupto'
    });
  }
};

/**
 * Middleware para autorizar según uno o varios roles (ej: ADMIN, PROFESIONAL)
 */
const authorizeRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso restringido: Se requiere uno de los siguientes roles: [${rolesPermitidos.join(', ')}]`
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
