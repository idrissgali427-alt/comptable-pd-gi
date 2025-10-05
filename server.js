// server.js

// --- 1. IMPORTATION DES MODULES ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Le port sera soit celui fourni par l'hébergeur (process.env.PORT), soit 3000 en local
const port = process.env.PORT || 3000;

// --- 2. CONFIGURATION DE LA BASE DE DONNÉES (MongoDB Atlas) ---

// ⚠️ Assurez-vous que ce mot de passe soit bien celui que vous avez configuré sur MongoDB Atlas
const DB_URI = 'mongodb+srv://comptable-pd-gi:MonNouveauMdpFacile123@cluster0.nmq9sos.mongodb.net/comptable_db?retryWrites=true&w=majority'; 


// Définir le Schéma de Données (La structure de vos informations)
const DataSchema = new mongoose.Schema({
  // Champ pour le contenu que vous voulez enregistrer (ex: une note, une transaction)
  contenu: {
    type: String,
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

// Créer le Modèle de Données
const DonneesUtilisateur = mongoose.model('Donnee', DataSchema);

// Tenter la connexion à la base de données
mongoose.connect(DB_URI)
  .then(() => console.log('✅ Connexion à MongoDB Atlas réussie!'))
  .catch(err => {
    console.error('❌ Erreur de connexion à MongoDB :', err.message);
    // Arrêter l'application si la connexion échoue
    process.exit(1); 
  });


// --- 3. MIDDLEWARE ---

// Permet à Express de lire le corps des requêtes en JSON
app.use(express.json()); 

// Configure CORS (Autoriser les requêtes du front-end)
app.use(cors()); 


// --- 4. ROUTES D'API ---

// Route de test (Accueil)
app.get('/', (req, res) => {
  res.send('Bienvenue sur le back-end Node.js ! API en cours d\'exécution.');
});

// POST : Route pour ENREGISTRER de nouvelles données
app.post('/api/donnees', async (req, res) => {
    try {
        // req.body.contenu contient les données envoyées par votre front-end
        const nouvelleDonnee = new DonneesUtilisateur({
            contenu: req.body.contenu 
        });
        
        await nouvelleDonnee.save();
        
        res.status(201).json(nouvelleDonnee);
        
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Erreur lors de l\'enregistrement des données.', error: err.message });
    }
});


// GET : Route pour RÉCUPÉRER toutes les données
app.get('/api/donnees', async (req, res) => {
    try {
        // Récupère toutes les entrées, triées par la plus récente en premier
        const donnees = await DonneesUtilisateur.find().sort({ dateCreation: 'desc' });
        
        res.json(donnees);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur de récupération des données du serveur.', error: err.message });
    }
});


// --- 5. DÉMARRAGE DU SERVEUR ---

app.listen(port, () => {
  console.log(`Serveur démarré et écoutant sur le port ${port}`);
});