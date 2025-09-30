// main.js ou le script de votre site
import { db } from './firebase-config.js'; // Importez la base de données
import { collection, getDocs } from 'firebase/firestore';

async function afficherMesDonnees() {
  // Remplacez "produits" par le nom de votre collection dans Firestore
  const collectionRef = collection(db, "produits"); 
  
  try {
    const querySnapshot = await getDocs(collectionRef);
    const donnees = [];
    
    querySnapshot.forEach((doc) => {
      // Stocke l'ID et toutes les données du document
      donnees.push({ id: doc.id, ...doc.data() }); 
    });

    console.log("Les données à afficher sont :", donnees);
    
    // C'est ici que vous insérez le code pour modifier le DOM (votre HTML)
    // Ex: Afficher les données dans une liste ou un tableau
    
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
  }
}

// Appeler la fonction au chargement de la page
afficherMesDonnees();