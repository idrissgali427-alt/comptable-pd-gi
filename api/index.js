// api/index.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 1. Charger les variables d'environnement (y compris MONGO_URI)
dotenv.config(); 

const app = express();

// --- Middleware ---
app.use(express.json());

// --- Connexion Mongoose ---
const MONGO_URI = process.env.MONGO_URI; // Assurez-vous que ceci est dans Vercel !
if (!MONGO_URI) {
    console.error("MONGO_URI n'est pas défini. Vérifiez les variables d'environnement.");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('Connexion MongoDB Atlas réussie !'))
        .catch(err => console.error('Erreur de connexion MongoDB :', err));
}

// --- Définition des Schémas et Modèles (à inclure ici ou à importer) ---
// (Incluez ici la définition de vos modèles Entreprise et Versement)
// const Entreprise = mongoose.model('Entreprise', new mongoose.Schema({...}));

// --- Routes API (Comme dans votre code existant) ---

// Exemple de Route GET: Récupérer toutes les entreprises
app.get('/api/entreprises', async (req, res) => {
    try {
        // Remplacer 'Entreprise' par votre modèle réel
        const entreprises = await Entreprise.find(); 
        res.json(entreprises);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Incluez toutes vos autres routes (POST, PUT, DELETE pour entreprises et versements) ici...

// --- Gestion des fichiers statiques (Frontend) ---
// La ligne ci-dessous permet de servir votre HTML/CSS/JS directement.
// C'est souvent géré par la configuration `vercel.json` (routes), mais une ligne de sécurité :
app.use(express.static('public')); 

// 2. EXPORT de l'application Express (CRUCIAL pour Vercel Serverless)
module.exports = app;