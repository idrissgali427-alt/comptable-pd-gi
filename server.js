// server.js

// --- Importations et Initialisation ---
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); 
const dbConnect = require('./dbConnect'); // Importe la fonction de connexion optimisée

const app = express();
const PORT = process.env.PORT || 3000; 

// --- Configuration CORS ---
const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:5173', 
    /\.vercel\.app$/, // Autorise tous les sous-domaines de Vercel
].filter(Boolean); 

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(pattern => (typeof pattern === 'string' ? pattern === origin : pattern.test(origin)))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
})); 

// Middlewares standards
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (Frontend)
app.use(express.static(path.join(__dirname, 'public')));


// --- Modèles Mongoose ---

const entrepriseSchema = new mongoose.Schema({
    typeEntreprise: { type: String, required: true },
    dg: { type: String, required: true },
    date: { type: Date, required: true },
    comptable: { type: String, required: true }
}, { timestamps: true });
// Fixe le re-déploiement sur Vercel en vérifiant si le modèle existe déjà
const Entreprise = mongoose.models.Entreprise || mongoose.model('Entreprise', entrepriseSchema); 

const versementSchema = new mongoose.Schema({
    entrepriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
    typeEntreprise: { type: String, required: true }, 
    dg: { type: String, required: true }, 
    comptable: { type: String, required: true }, 
    dateVersement: { type: Date, required: true },
    caAchat: { type: Number, default: 0 },
    caProduction: { type: Number, default: 0 },
    montantDepot: { type: Number, default: 0 },
    montantPointsVente: { type: Number, default: 0 },
    caVente: { type: Number, default: 0 },
    montantDepenses: { type: Number, default: 0 }
}, { timestamps: true });
const Versement = mongoose.models.Versement || mongoose.model('Versement', versementSchema); 


// --- Routes API (CRUD) ---

// 1. ENTREPRISES

app.get('/api/entreprises', async (req, res) => {
    try {
        await dbConnect(); // ✅ Corrigé
        const entreprises = await Entreprise.find().sort({ date: 1 });
        res.status(200).json(entreprises);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des entreprises.", error: error.message });
    }
});

app.post('/api/entreprises', async (req, res) => {
    try {
        await dbConnect(); // ✅ Corrigé
        const newEntreprise = new Entreprise(req.body);
        await newEntreprise.save(); 
        res.status(201).json(newEntreprise);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de l'entreprise.", error: error.message });
    }
});

app.put('/api/entreprises/:id', async (req, res) => {
    try {
        await dbConnect(); // ✅ Corrigé
        const updatedEntreprise = await Entreprise.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedEntreprise) return res.status(404).json({ message: "Entreprise non trouvée." });
        res.status(200).json(updatedEntreprise);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la modification de l'entreprise.", error: error.message });
    }
});

app.delete('/api/entreprises/:id', async (req, res) => {
    try {
        await dbConnect(); // ✅ Corrigé
        const entreprise = await Entreprise.findByIdAndDelete(req.params.id);
        if (!entreprise) return res.status(404).json({ message: "Entreprise non trouvée." });
        
        await Versement.deleteMany({ entrepriseId: entreprise._id });

        res.status(200).json({ message: "Entreprise et versements associés supprimés." });
    } catch (error) {
        console.error("Erreur de suppression:", error);
        res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
    }
});


// 2. VERSEMENTS

app.get('/api/versements', async (req, res) => {
    try {
        await dbConnect(); // ✅ Corrigé
        const versements = await Versement.find().sort({ dateVersement: -1 });
        res.status(200).json(versements);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des versements.", error: error.message });
    }
});

app.post('/api/versements', async (req, res) => {
    try {
        await dbConnect(); // ✅ Corrigé
        const entreprise = await Entreprise.findById(req.body.entrepriseId);
        if (!entreprise) return res.status(404).json({ message: "Entreprise non trouvée pour le versement." });
        
        const versementData = {
            ...req.body,
            typeEntreprise: entreprise.typeEntreprise,
            dg: entreprise.dg,
            comptable: entreprise.comptable,
        };
        
        const newVersement = new Versement(versementData);
        await newVersement.save();
        res.status(201).json(newVersement);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création du versement.", error: error.message });
    }
});

app.put('/api/versements/:id', async (req, res) => {
    try {
        await dbConnect(); // ✅ Corrigé
        const updatedVersement = await Versement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedVersement) return res.status(404).json({ message: "Versement non trouvé." });
        res.status(200).json(updatedVersement);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la modification du versement.", error: error.message });
    }
});

app.delete('/api/versements/:id', async (req, res) => {
    try {
        await dbConnect(); // ✅ Corrigé
        const versement = await Versement.findByIdAndDelete(req.params.id);
        if (!versement) return res.status(404).json({ message: "Versement non trouvé." });
        res.status(200).json({ message: "Versement supprimé avec succès." });
    } catch (error) {
        console.error("Erreur de suppression:", error);
        res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
    }
});


// --- Exportation pour Vercel / Démarrage pour Local ---

// Le serveur écoute seulement en mode développement
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, async () => {
        try {
            // Tente de se connecter lors du démarrage local
            await dbConnect(); 
        } catch (e) {
            console.error("Erreur de connexion locale, vérifiez votre .env", e);
        }
        console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
    });
}

// Ligne CRUCIALE pour Vercel : Export de l'application Express
module.exports = app;