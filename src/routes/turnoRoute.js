const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const { verifyToken } = require('../middleware/verifyToken');

// Rutas de turnos (consultas y mutaciones protegidas con JWT)
router.get('/', verifyToken, turnoController.getAll);
router.get('/:id', verifyToken, turnoController.getById);
router.post('/', verifyToken, turnoController.create);
router.put('/:id', verifyToken, turnoController.update);
router.delete('/:id', verifyToken, turnoController.delete);

module.exports = router;
