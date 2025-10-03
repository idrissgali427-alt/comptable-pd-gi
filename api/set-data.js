// /api/set-data.js
import { kv } from '@vercel/kv';

// Cette fonction sera exécutée lorsque vous enverrez des données à /api/set-data
export default async function handler(req, res) {
  // Assurez-vous que la méthode est POST (pour l'écriture)
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  // Vérification de l'en-tête de contenu
  if (req.headers['content-type'] !== 'application/json') {
      return res.status(400).json({ error: 'L\'en-tête Content-Type doit être application/json.' });
  }

  const { newValue } = req.body; // Récupère la nouvelle valeur envoyée

  if (!newValue) {
    return res.status(400).json({ error: 'Champ newValue manquant dans le corps de la requête.' });
  }

  try {
    // CLÉ : Met à jour la clé 'shared_status' avec la nouvelle valeur.
    await kv.set('shared_status', newValue); 

    // Confirmation de l'écriture
    res.status(200).json({ 
        message: 'Donnée mise à jour avec succès', 
        key: 'shared_status',
        new_value: newValue 
    });

  } catch (error) {
    // En cas d'échec de l'écriture (souvent un problème de clé Vercel non configurée en ligne)
    console.error('Erreur d’écriture KV :', error);
    res.status(500).json({ error: 'Échec de l’écriture des données KV', details: error.message });
  }
}