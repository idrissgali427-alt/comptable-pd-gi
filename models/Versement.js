// models/Versement.js

const mongoose = require('mongoose');

const versementSchema = new mongoose.Schema({
    // Clé étrangère vers la collection 'Entreprise'
    entrepriseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Entreprise', 
        required: true 
    },
    
    // Champs de données financières
    dateVersement: { type: Date, required: true },
    caAchat: { type: Number, default: 0 },
    caProduction: { type: Number, default: 0 },
    montantDepot: { type: Number, default: 0 },
    montantPointsVente: { type: Number, default: 0 },
    caVente: { type: Number, default: 0 },
    montantDepenses: { type: Number, default: 0 },

    // Informations redondantes pour faciliter les requêtes rapides
    typeEntreprise: { type: String, required: true },
    dg: { type: String, required: true },
    comptable: { type: String, required: true }
}, { 
    timestamps: true 
});

// Exporter le modèle pour qu'il puisse être utilisé dans server.js
module.exports = mongoose.model('Versement', versementSchema);