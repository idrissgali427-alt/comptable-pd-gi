// models/Entreprise.js

const mongoose = require('mongoose');

const entrepriseSchema = new mongoose.Schema({
    typeEntreprise: { type: String, required: true },
    dg: { type: String, required: true },
    date: { type: Date, required: true },
    comptable: { type: String, required: true }
}, { 
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Exporter le modèle pour qu'il puisse être utilisé dans server.js
module.exports = mongoose.model('Entreprise', entrepriseSchema);