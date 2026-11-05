const pacienteService = require('../services/pacienteService');

/**
 * Controlador de Pacientes
 * Delegación ligera a pacienteService y respuesta HTTP
 */
class PacienteController {
  /**
   * Crear un nuevo paciente
   * POST /api/pacientes
   */
  async create(req, res) {
    try {
      const nuevoPaciente = await pacienteService.createPaciente(req.body);
      return res.status(201).json({
        success: true,
        message: 'Paciente registrado exitosamente',
        data: nuevoPaciente
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al registrar paciente'
      });
    }
  }

  /**
   * Obtener todos los pacientes
   * GET /api/pacientes
   */
  async getAll(req, res) {
    try {
      const pacientes = await pacienteService.getAllPacientes(req.query);
      return res.status(200).json({
        success: true,
        count: pacientes.length,
        data: pacientes
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener pacientes'
      });
    }
  }

  /**
   * Obtener un paciente por ID
   * GET /api/pacientes/:id
   */
  async getById(req, res) {
    try {
      const paciente = await pacienteService.getPacienteById(req.params.id);
      return res.status(200).json({
        success: true,
        data: paciente
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener paciente'
      });
    }
  }

  /**
   * Actualizar un paciente por ID
   * PUT /api/pacientes/:id
   */
  async update(req, res) {
    try {
      const pacienteActualizado = await pacienteService.updatePaciente(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Paciente actualizado exitosamente',
        data: pacienteActualizado
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al actualizar paciente'
      });
    }
  }

  /**
   * Eliminar un paciente por ID
   * DELETE /api/pacientes/:id
   */
  async delete(req, res) {
    try {
      await pacienteService.deletePaciente(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Paciente eliminado exitosamente'
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al eliminar paciente'
      });
    }
  }
}

module.exports = new PacienteController();
