const profesionalService = require('../services/profesionalService');

/**
 * Controlador de Profesionales
 * Delegación ligera a profesionalService y respuesta HTTP
 */
class ProfesionalController {
  /**
   * Registrar un profesional
   * POST /api/profesionales
   */
  async create(req, res) {
    try {
      const nuevoProfesional = await profesionalService.createProfesional(req.body);
      return res.status(201).json({
        success: true,
        message: 'Profesional registrado exitosamente',
        data: nuevoProfesional
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al registrar profesional'
      });
    }
  }

  /**
   * Obtener todos los profesionales
   * GET /api/profesionales
   */
  async getAll(req, res) {
    try {
      const profesionales = await profesionalService.getAllProfesionales(req.query);
      return res.status(200).json({
        success: true,
        count: profesionales.length,
        data: profesionales
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener profesionales'
      });
    }
  }

  /**
   * Obtener un profesional por ID
   * GET /api/profesionales/:id
   */
  async getById(req, res) {
    try {
      const profesional = await profesionalService.getProfesionalById(req.params.id);
      return res.status(200).json({
        success: true,
        data: profesional
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener profesional'
      });
    }
  }

  /**
   * Actualizar profesional por ID
   * PUT /api/profesionales/:id
   */
  async update(req, res) {
    try {
      const profesionalActualizado = await profesionalService.updateProfesional(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Profesional actualizado exitosamente',
        data: profesionalActualizado
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al actualizar profesional'
      });
    }
  }

  /**
   * Eliminar profesional por ID
   * DELETE /api/profesionales/:id
   */
  async delete(req, res) {
    try {
      await profesionalService.deleteProfesional(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Profesional eliminado exitosamente'
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al eliminar profesional'
      });
    }
  }
}

module.exports = new ProfesionalController();
