const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema(
  {
    paciente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: [true, 'El ID del paciente es obligatorio']
    },
    profesional_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profesional',
      required: [true, 'El ID del profesional es obligatorio']
    },
    especialidad: {
      type: String,
      required: [true, 'La especialidad es obligatoria'],
      trim: true
    },
    fecha_hora: {
      type: Date,
      required: [true, 'La fecha y hora del turno son obligatorias']
    },
    estado: {
      type: String,
      enum: {
        values: ['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'ATENDIDO'],
        message: 'El estado {VALUE} no es válido. Debe ser PENDIENTE, CONFIRMADO, CANCELADO o ATENDIDO'
      },
      default: 'PENDIENTE'
    },
    motivo: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: { createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion' }
  }
);

// Índices requeridos según especificación del Centro de Salud
turnoSchema.index({ paciente_id: 1, fecha_hora: -1 });
turnoSchema.index({ profesional_id: 1, fecha_hora: 1 });
turnoSchema.index({ fecha_hora: 1, estado: 1 });

module.exports = mongoose.model('Turno', turnoSchema);
