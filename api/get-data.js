// /api/get-data.js
import { kv } from '@vercel/kv';

// Cette fonction sera exécutée lorsque vous accéderez à l'URL /api/get-data
export default async function handler(req, res) {
  // Optionnel : s'assurer qu'on accepte seulement GET pour la lecture
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez GET.' });
  }

  try {
    // CORRECTION : Recherche de la clé 'shared_status' (la même que dans le fichier d'écriture)
    const status = await kv.get('shared_status'); 

    // Si la donnée est trouvée, la renvoyer
    res.status(200).json({ 
        message: 'Data fetched successfully', 
        data: status || 'Key not found in KV' 
    });

  } catch (error) {
    // En cas d'erreur (souvent dû à un problème de connexion KV)
    console.error('KV Read Error:', error);
    res.status(500).json({ error: 'Failed to read from Vercel KV', details: error.message });
  }
}