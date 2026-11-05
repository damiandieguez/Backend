const Profesional = require('../models/profesionalModel');

/**
 * Servicio de Profesionales - Lógica de negocio y consultas Mongoose
 */
class ProfesionalService {
  /**
   * Crear un nuevo profesional
   */
  async createProfesional(data) {
    const { matricula } = data;

    const existente = await Profesional.findOne({ matricula });
    if (existente) {
      const error = new Error(`Ya existe un profesional registrado con la matrícula ${matricula}`);
      error.statusCode = 400;
      throw error;
    }

    const nuevoProfesional = new Profesional(data);
    return await nuevoProfesional.save();
  }

  /**
   * Obtener todos los profesionales con soporte de filtros
   */
  async getAllProfesionales(filtros = {}) {
    const query = {};

    if (filtros.matricula) {
      query.matricula = filtros.matricula;
    }
    if (filtros.especialidad) {
      query['especialidades.nombre'] = { $regex: filtros.especialidad, $options: 'i' };
    }
    if (filtros.nombre) {
      query.nombre = { $regex: filtros.nombre, $options: 'i' };
    }
    if (filtros.apellido) {
      query.apellido = { $regex: filtros.apellido, $options: 'i' };
    }

    return await Profesional.find(query)
      .populate('usuario_id', 'email rol activo')
      .sort({ apellido: 1, nombre: 1 });
  }

  /**
   * Obtener un profesional por ID
   */
  async getProfesionalById(id) {
    const profesional = await Profesional.findById(id).populate('usuario_id', 'email rol activo');
    if (!profesional) {
      const error = new Error('Profesional no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return profesional;
  }

  /**
   * Actualizar un profesional por ID
   */
  async updateProfesional(id, updateData) {
    if (updateData.matricula) {
      const existente = await Profesional.findOne({
        matricula: updateData.matricula,
        _id: { $ne: id }
      });
      if (existente) {
        const error = new Error(`La matrícula ${updateData.matricula} ya pertenece a otro profesional`);
        error.statusCode = 400;
        throw error;
      }
    }

    const profesionalActualizado = await Profesional.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('usuario_id', 'email rol activo');

    if (!profesionalActualizado) {
      const error = new Error('Profesional no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return profesionalActualizado;
  }

  /**
   * Eliminar un profesional por ID
   */
  async deleteProfesional(id) {
    const profesionalEliminado = await Profesional.findByIdAndDelete(id);
    if (!profesionalEliminado) {
      const error = new Error('Profesional no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return profesionalEliminado;
  }
}

module.exports = new ProfesionalService();
