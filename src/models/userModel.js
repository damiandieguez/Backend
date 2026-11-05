const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    rol: {
      type: String,
      enum: {
        values: ['ADMIN', 'PROFESIONAL', 'PACIENTE'],
        message: 'El rol {VALUE} no es válido. Debe ser ADMIN, PROFESIONAL o PACIENTE'
      },
      default: 'PACIENTE'
    },
    activo: {
      type: Boolean,
      default: true
    },
    perfil_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'perfil_ref',
      default: null
    },
    perfil_ref: {
      type: String,
      enum: ['Paciente', 'Profesional', null],
      default: null
    },
    ultimo_login: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion' }
  }
);

// Pre-save hook para encriptar la contraseña si ha sido modificada
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para verificar la contraseña al iniciar sesión
userSchema.methods.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', userSchema);
