const mongoose = require('mongoose');

const especialidadSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la especialidad es obligatorio'],
      trim: true
    },
    descripcion: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const profesionalSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true
    },
    matricula: {
      type: String,
      required: [true, 'La matrícula es obligatoria'],
      unique: true,
      trim: true
    },
    contacto: {
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      telefono: {
        type: String,
        trim: true
      }
    },
    especialidades: {
      type: [especialidadSchema],
      default: []
    },
    usuario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null
    }
  },
  {
    timestamps: { createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion' }
  }
);

// Índices adicionales según especificación del Centro de Salud (matricula ya tiene índice único en el schema)
profesionalSchema.index({ 'especialidades.nombre': 1 });

module.exports = mongoose.model('Profesional', profesionalSchema);
