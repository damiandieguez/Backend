const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[MongoDB] Conectado exitosamente en: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Error al conectar a la base de datos: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
