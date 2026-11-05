const turnoService = require('../services/turnoService');

/**
 * Controlador de Turnos
 * Delegación ligera a turnoService y respuesta HTTP
 */
class TurnoController {
  /**
   * Crear un nuevo turno
   * POST /api/turnos
   */
  async create(req, res) {
    try {
      const nuevoTurno = await turnoService.createTurno(req.body);
      return res.status(201).json({
        success: true,
        message: 'Turno programado exitosamente',
        data: nuevoTurno
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al programar turno'
      });
    }
  }

  /**
   * Obtener todos los turnos con populate
   * GET /api/turnos
   */
  async getAll(req, res) {
    try {
      const turnos = await turnoService.getAllTurnos(req.query);
      return res.status(200).json({
        success: true,
        count: turnos.length,
        data: turnos
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener turnos'
      });
    }
  }

  /**
   * Obtener un turno por ID
   * GET /api/turnos/:id
   */
  async getById(req, res) {
    try {
      const turno = await turnoService.getTurnoById(req.params.id);
      return res.status(200).json({
        success: true,
        data: turno
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener turno'
      });
    }
  }

  /**
   * Actualizar un turno por ID
   * PUT /api/turnos/:id
   */
  async update(req, res) {
    try {
      const turnoActualizado = await turnoService.updateTurno(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Turno actualizado exitosamente',
        data: turnoActualizado
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al actualizar turno'
      });
    }
  }

  /**
   * Eliminar un turno por ID
   * DELETE /api/turnos/:id
   */
  async delete(req, res) {
    try {
      await turnoService.deleteTurno(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Turno eliminado exitosamente'
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al eliminar turno'
      });
    }
  }
}

module.exports = new TurnoController();
