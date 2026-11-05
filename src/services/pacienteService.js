const Paciente = require('../models/pacienteModel');

/**
 * Servicio de Pacientes - Lógica de negocio y consultas Mongoose
 */
class PacienteService {
  /**
   * Crear un nuevo paciente
   */
  async createPaciente(data) {
    const { dni } = data;

    const pacienteExistente = await Paciente.findOne({ dni });
    if (pacienteExistente) {
      const error = new Error(`Ya existe un paciente registrado con el DNI ${dni}`);
      error.statusCode = 400;
      throw error;
    }

    const nuevoPaciente = new Paciente(data);
    return await nuevoPaciente.save();
  }

  /**
   * Obtener todos los pacientes con soporte de filtros
   */
  async getAllPacientes(filtros = {}) {
    const query = {};

    if (filtros.dni) {
      query.dni = filtros.dni;
    }
    if (filtros.nombre) {
      query.nombre = { $regex: filtros.nombre, $options: 'i' };
    }
    if (filtros.apellido) {
      query.apellido = { $regex: filtros.apellido, $options: 'i' };
    }

    return await Paciente.find(query)
      .populate('usuario_id', 'email rol activo')
      .sort({ apellido: 1, nombre: 1 });
  }

  /**
   * Obtener un paciente por su ID
   */
  async getPacienteById(id) {
    const paciente = await Paciente.findById(id).populate('usuario_id', 'email rol activo');
    if (!paciente) {
      const error = new Error('Paciente no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return paciente;
  }

  /**
   * Actualizar un paciente por ID
   */
  async updatePaciente(id, updateData) {
    // Si se modifica el DNI, validar que no pertenezca a otro paciente
    if (updateData.dni) {
      const existente = await Paciente.findOne({ dni: updateData.dni, _id: { $ne: id } });
      if (existente) {
        const error = new Error(`El DNI ${updateData.dni} ya está en uso por otro paciente`);
        error.statusCode = 400;
        throw error;
      }
    }

    const pacienteActualizado = await Paciente.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('usuario_id', 'email rol activo');

    if (!pacienteActualizado) {
      const error = new Error('Paciente no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return pacienteActualizado;
  }

  /**
   * Eliminar un paciente por ID
   */
  async deletePaciente(id) {
    const pacienteEliminado = await Paciente.findByIdAndDelete(id);
    if (!pacienteEliminado) {
      const error = new Error('Paciente no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return pacienteEliminado;
  }
}

module.exports = new PacienteService();
