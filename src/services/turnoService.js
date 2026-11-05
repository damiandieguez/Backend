const Turno = require('../models/turnoModel');
const Paciente = require('../models/pacienteModel');
const Profesional = require('../models/profesionalModel');

/**
 * Servicio de Turnos - Lógica de negocio y consultas Mongoose con populate
 */
class TurnoService {
  /**
   * Crear un nuevo turno verificando que paciente y profesional existan
   */
  async createTurno(data) {
    const { paciente_id, profesional_id, fecha_hora } = data;

    // Validar existencia del paciente
    const paciente = await Paciente.findById(paciente_id);
    if (!paciente) {
      const error = new Error(`El paciente con ID ${paciente_id} no existe`);
      error.statusCode = 404;
      throw error;
    }

    // Validar existencia del profesional
    const profesional = await Profesional.findById(profesional_id);
    if (!profesional) {
      const error = new Error(`El profesional con ID ${profesional_id} no existe`);
      error.statusCode = 404;
      throw error;
    }

    // Opcional: Validar que el profesional no tenga ya un turno asignado en el mismo horario
    const conflicto = await Turno.findOne({
      profesional_id,
      fecha_hora: new Date(fecha_hora),
      estado: { $in: ['PENDIENTE', 'CONFIRMADO'] }
    });

    if (conflicto) {
      const error = new Error('El profesional ya tiene un turno reservado para esa fecha y hora');
      error.statusCode = 409;
      throw error;
    }

    const nuevoTurno = new Turno(data);
    await nuevoTurno.save();

    // Retornar el turno con los datos referenciados populados
    return await Turno.findById(nuevoTurno._id)
      .populate('paciente_id', 'nombre apellido dni contacto')
      .populate('profesional_id', 'nombre apellido matricula especialidades');
  }

  /**
   * Obtener turnos con populate de Paciente y Profesional
   */
  async getAllTurnos(filtros = {}) {
    const query = {};

    if (filtros.paciente_id) query.paciente_id = filtros.paciente_id;
    if (filtros.profesional_id) query.profesional_id = filtros.profesional_id;
    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.especialidad) query.especialidad = { $regex: filtros.especialidad, $options: 'i' };

    // Filtro por rango de fechas (opcional)
    if (filtros.fecha_desde || filtros.fecha_hasta) {
      query.fecha_hora = {};
      if (filtros.fecha_desde) query.fecha_hora.$gte = new Date(filtros.fecha_desde);
      if (filtros.fecha_hasta) query.fecha_hora.$lte = new Date(filtros.fecha_hasta);
    }

    return await Turno.find(query)
      .populate('paciente_id', 'nombre apellido dni contacto')
      .populate('profesional_id', 'nombre apellido matricula especialidades')
      .sort({ fecha_hora: 1 });
  }

  /**
   * Obtener un turno por ID con populate completo
   */
  async getTurnoById(id) {
    const turno = await Turno.findById(id)
      .populate('paciente_id', 'nombre apellido dni contacto historia_clinica')
      .populate('profesional_id', 'nombre apellido matricula especialidades contacto');

    if (!turno) {
      const error = new Error('Turno no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return turno;
  }

  /**
   * Actualizar un turno por ID
   */
  async updateTurno(id, updateData) {
    // Si actualizan paciente o profesional, validar su existencia
    if (updateData.paciente_id) {
      const paciente = await Paciente.findById(updateData.paciente_id);
      if (!paciente) {
        const error = new Error(`El paciente con ID ${updateData.paciente_id} no existe`);
        error.statusCode = 404;
        throw error;
      }
    }

    if (updateData.profesional_id) {
      const profesional = await Profesional.findById(updateData.profesional_id);
      if (!profesional) {
        const error = new Error(`El profesional con ID ${updateData.profesional_id} no existe`);
        error.statusCode = 404;
        throw error;
      }
    }

    const turnoActualizado = await Turno.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('paciente_id', 'nombre apellido dni contacto')
      .populate('profesional_id', 'nombre apellido matricula especialidades');

    if (!turnoActualizado) {
      const error = new Error('Turno no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return turnoActualizado;
  }

  /**
   * Eliminar un turno por ID
   */
  async deleteTurno(id) {
    const turnoEliminado = await Turno.findByIdAndDelete(id);
    if (!turnoEliminado) {
      const error = new Error('Turno no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return turnoEliminado;
  }
}

module.exports = new TurnoService();
