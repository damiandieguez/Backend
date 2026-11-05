require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Paciente = require('../models/pacienteModel');
const Profesional = require('../models/profesionalModel');
const Turno = require('../models/turnoModel');
const Usuario = require('../models/userModel');

// Función auxiliar para transformar objetos de MongoDB Extended JSON ({ $oid }, { $date }) a valores JS nativos
const convertirBson = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertirBson);
  }
  if (obj !== null && typeof obj === 'object') {
    if (obj.$oid) {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    if (obj.$date) {
      return new Date(obj.$date);
    }
    const nuevoObj = {};
    for (const [key, value] of Object.entries(obj)) {
      nuevoObj[key] = convertirBson(value);
    }
    return nuevoObj;
  }
  return obj;
};

const runSeed = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Leyendo ejemplos.json...');

    const rawData = fs.readFileSync(path.join(__dirname, '../../ejemplos.json'), 'utf8');
    const data = JSON.parse(rawData);

    // Limpiar colecciones previas
    console.log('[Seeder] Vaciando colecciones actuales...');
    await Promise.all([
      Paciente.deleteMany({}),
      Profesional.deleteMany({}),
      Turno.deleteMany({}),
      Usuario.deleteMany({})
    ]);

    // Insertar Pacientes
    const pacientes = convertirBson(data.pacientes);
    await Paciente.insertMany(pacientes);
    console.log(`[Seeder] Insertados ${pacientes.length} pacientes.`);

    // Insertar Profesionales
    const profesionales = convertirBson(data.profesionales);
    await Profesional.insertMany(profesionales);
    console.log(`[Seeder] Insertados ${profesionales.length} profesionales.`);

    // Insertar Turnos
    const turnos = convertirBson(data.turnos);
    await Turno.insertMany(turnos);
    console.log(`[Seeder] Insertados ${turnos.length} turnos.`);

    // Insertar Usuarios
    const usuarios = convertirBson(data.usuarios).map((u) => {
      // Si tiene password_hash en ejemplos.json, lo renombramos a password para el modelo
      const pass = u.password || u.password_hash || 'Password123!';
      return {
        ...u,
        password: pass
      };
    });

    // Para que se aplique o mantenga el hash correctamente:
    for (const u of usuarios) {
      const nuevoUsuario = new Usuario(u);
      // Evitamos re-hashear si ya es un hash bcrypt ($2b$ o $2a$)
      if (u.password.startsWith('$2b$') || u.password.startsWith('$2a$')) {
        nuevoUsuario.isModified = () => false; // no alterar el hash existente
      }
      await nuevoUsuario.save();
    }
    console.log(`[Seeder] Insertados ${usuarios.length} usuarios.`);

    console.log('[Seeder] Proceso de siembra finalizado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error al sembrar la base de datos:', error);
    process.exit(1);
  }
};

runSeed();
