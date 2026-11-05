const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const { verifyToken } = require('../middleware/verifyToken');

// Rutas de lectura (accesibles para consulta)
router.get('/', pacienteController.getAll);
router.get('/:id', pacienteController.getById);

// Rutas sensibles protegidas por JWT (Creación, Actualización y Eliminación)
router.post('/', verifyToken, pacienteController.create);
router.put('/:id', verifyToken, pacienteController.update);
router.delete('/:id', verifyToken, pacienteController.delete);

module.exports = router;
