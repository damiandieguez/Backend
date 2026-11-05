const mongoose = require('mongoose');

const historiaClinicaSchema = new mongoose.Schema(
  {
    fecha_creacion: {
      type: Date,
      default: Date.now
    },
    antecedentes: {
      type: [String],
      default: []
    },
    alergias: {
      type: [String],
      default: []
    },
    observaciones: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const pacienteSchema = new mongoose.Schema(
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
    dni: {
      type: String,
      required: [true, 'El DNI es obligatorio'],
      unique: true,
      trim: true
    },
    fecha_nacimiento: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria']
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
      },
      direccion: {
        type: String,
        trim: true
      }
    },
    historia_clinica: {
      type: historiaClinicaSchema,
      default: () => ({})
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

// Índices adicionales según especificación del Centro de Salud (dni ya tiene índice único en el schema)
pacienteSchema.index({ 'contacto.email': 1 });
pacienteSchema.index({ nombre: 1, apellido: 1 });

module.exports = mongoose.model('Paciente', pacienteSchema);
