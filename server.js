// server.js (Code Final, Fusionné et Corrigé)

// Importations des modules nécessaires
require('dotenv').config(); // Charge les variables d'environnement du fichier .env

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); 

// Initialisation d'Express
const app = express();
const PORT = process.env.PORT || 3000; 
const MONGODB_URI = process.env.MONGODB_URI; // Récupère l'URI du fichier .env

// Vérification de la variable d'environnement
if (!MONGODB_URI) {
    console.error("❌ ERREUR: La variable MONGODB_URI n'est pas définie dans le fichier .env.");
    process.exit(1);
}

// Middlewares
app.use(cors()); 
app.use(express.json()); // Pour analyser les corps de requête JSON
app.use(express.urlencoded({ extended: true })); // Pour les données de formulaire classiques

// Configuration pour servir les fichiers statiques (HTML, CSS, JS client)
// Assurez-vous que vos fichiers frontend sont dans un dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));


// ----------------------------------------------------
// --- Modèles Mongoose ---
// ----------------------------------------------------

// Modèle Entreprise
const entrepriseSchema = new mongoose.Schema({
    typeEntreprise: { type: String, required: true },
    dg: { type: String, required: true },
    date: { type: Date, required: true },
    comptable: { type: String, required: true }
}, { timestamps: true });
const Entreprise = mongoose.model('Entreprise', entrepriseSchema);

// Modèle Versement
const versementSchema = new mongoose.Schema({
    entrepriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
    typeEntreprise: { type: String, required: true }, // Redondance pour faciliter les requêtes
    dg: { type: String, required: true },             // Redondance
    comptable: { type: String, required: true },      // Redondance
    dateVersement: { type: Date, required: true },
    caAchat: { type: Number, default: 0 },
    caProduction: { type: Number, default: 0 },
    montantDepot: { type: Number, default: 0 },
    montantPointsVente: { type: Number, default: 0 },
    caVente: { type: Number, default: 0 },
    montantDepenses: { type: Number, default: 0 }
}, { timestamps: true });
const Versement = mongoose.model('Versement', versementSchema);


// ----------------------------------------------------
// --- Routes API (CRUD) ---
// ----------------------------------------------------

// 1. ENTREPRISES
app.get('/api/entreprises', async (req, res) => {
    try {
        const entreprises = await Entreprise.find().sort({ date: 1 });
        res.status(200).json(entreprises);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des entreprises.", error: error.message });
    }
});

app.post('/api/entreprises', async (req, res) => {
    try {
        const newEntreprise = new Entreprise(req.body);
        await newEntreprise.save();
        res.status(201).json(newEntreprise);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de l'entreprise.", error: error.message });
    }
});

app.put('/api/entreprises/:id', async (req, res) => {
    try {
        const updatedEntreprise = await Entreprise.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedEntreprise) return res.status(404).json({ message: "Entreprise non trouvée." });
        res.status(200).json(updatedEntreprise);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la modification de l'entreprise.", error: error.message });
    }
});

app.delete('/api/entreprises/:id', async (req, res) => {
    try {
        const entreprise = await Entreprise.findByIdAndDelete(req.params.id);
        if (!entreprise) return res.status(404).json({ message: "Entreprise non trouvée." });
        
        // Supprime tous les versements associés (bonne pratique de cohérence)
        await Versement.deleteMany({ entrepriseId: entreprise._id });

        res.status(200).json({ message: "Entreprise et versements associés supprimés." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
    }
});


// 2. VERSEMENTS
app.get('/api/versements', async (req, res) => {
    try {
        const versements = await Versement.find().sort({ dateVersement: -1 });
        res.status(200).json(versements);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des versements.", error: error.message });
    }
});

app.post('/api/versements', async (req, res) => {
    try {
        // Récupère les infos DG/Comptable/Type pour les intégrer au versement (dénormalisation)
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
        // Note: L'update ne met pas à jour automatiquement les champs DG/Comptable si l'entreprise mère change.
        // C'est un choix de design (ici, on ne les met à jour que lors du POST initial).
        const updatedVersement = await Versement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedVersement) return res.status(404).json({ message: "Versement non trouvé." });
        res.status(200).json(updatedVersement);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la modification du versement.", error: error.message });
    }
});

app.delete('/api/versements/:id', async (req, res) => {
    try {
        const versement = await Versement.findByIdAndDelete(req.params.id);
        if (!versement) return res.status(404).json({ message: "Versement non trouvé." });
        res.status(200).json({ message: "Versement supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
    }
});


// ----------------------------------------------------
// --- Connexion à MongoDB et Démarrage du Serveur ---
// ----------------------------------------------------

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connexion à MongoDB Atlas réussie!');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ ERREUR DE CONNEXION À MONGOOSE:', err.message);
    process.exit(1); // Arrêt propre en cas d'échec
  });