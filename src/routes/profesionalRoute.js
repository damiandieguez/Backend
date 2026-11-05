const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profesionalController');
const { verifyToken } = require('../middleware/verifyToken');

// Rutas de lectura (catálogo de profesionales y especialidades)
router.get('/', profesionalController.getAll);
router.get('/:id', profesionalController.getById);

// Rutas sensibles protegidas por JWT (Creación, Actualización y Eliminación)
router.post('/', verifyToken, profesionalController.create);
router.put('/:id', verifyToken, profesionalController.update);
router.delete('/:id', verifyToken, profesionalController.delete);

module.exports = router;
