// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ REMPLACEZ ceci par vos propres clés de configuration !
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  // ... autres clés ...
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Exportation de la référence à la base de données (db)
export const db = getFirestore(app);