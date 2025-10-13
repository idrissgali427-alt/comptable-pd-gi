// dbConnect.js

const mongoose = require('mongoose');

// Utiliser l'objet global pour mettre en cache la connexion (crucial pour le serverless)
// Ceci permet de ne se connecter qu'une seule fois par instance de fonction Vercel
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    // Cela sera visible dans les logs Vercel si la variable est manquante
    throw new Error('La variable MONGODB_URI n\'est pas définie. Vérifiez Vercel.');
  }

  // 1. Si la connexion est déjà dans le cache, on la retourne immédiatement
  if (cached.conn) {
    return cached.conn;
  }

  // 2. Si aucune promesse n'existe, on crée une nouvelle connexion
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // CLÉ : désactive le buffering des commandes (évite les timeouts)
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connexion à MongoDB Atlas établie et mise en cache.');
      return mongoose;
    });
  }

  // 3. Attend la promesse et la met en cache
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    // Si la connexion échoue (mauvaise URL, IP non autorisée), on réinitialise
    cached.promise = null;
    throw e;
  }
}

module.exports = dbConnect;