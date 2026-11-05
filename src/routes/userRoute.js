const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/verifyToken');

// Rutas públicas de autenticación
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas por JWT (administración de usuarios)
router.get('/', verifyToken, authorizeRoles('ADMIN'), userController.getAll);
router.get('/:id', verifyToken, userController.getById);
router.put('/:id', verifyToken, userController.update);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), userController.delete);

module.exports = router;
