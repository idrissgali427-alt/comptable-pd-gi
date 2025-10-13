document.addEventListener('DOMContentLoaded', () => {

    // --- Initialisation et variables globales (Références DOM) ---
    const accountantNameInput = document.getElementById('accountantName');
    const dateTimeSpan = document.getElementById('current-date-time');
    
    // Navigation
    const sidebarNavLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Entreprises
    const formulaireEntrepriseForm = document.getElementById('formulaireEntrepriseForm');
    const tableEntreprisesBody = document.querySelector('#table-formulaire-entreprise tbody');
    const entrepriseIdInput = document.getElementById('entrepriseId');
    const comptableFormInput = document.getElementById('comptableForm');
    const cancelEntrepriseEditButton = document.getElementById('cancelEntrepriseEdit');

    // Versements
    const versementMensuelForm = document.getElementById('versementMensuelForm');
    const tableVersementMensuelBody = document.querySelector('#table-versement-mensuel tbody');
    const versementIdInput = document.getElementById('versementId');
    const typeEntrepriseVersementSelect = document.getElementById('typeEntrepriseVersement');
    const dateVersementInput = document.getElementById('dateVersement');
    const dgVersementInput = document.getElementById('dgVersement');
    const comptableVersementInput = document.getElementById('comptableVersement');
    const cancelVersementEditButton = document.getElementById('cancelVersementEdit');

    // Bilan et Conseils (selects)
    const bilanTypeEntrepriseSelect = document.getElementById('bilanTypeEntreprise');
    const conseilTypeEntrepriseSelect = document.getElementById('conseilTypeEntreprise');
    const genererBilanBtn = document.getElementById('genererBilanBtn');
    const bilanOutputDiv = document.getElementById('bilanOutput');
    const genererConseilsBtn = document.getElementById('genererConseilsBtn');
    const conseilsOutputDiv = document.getElementById('conseilsOutput');

    // Données et Graphiques
    let entreprises = [];
    let versements = [];
    let charts = {}; // Conteneur pour toutes les instances Chart.js

    // --- Utilitaires ---

    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        dateTimeSpan.textContent = now.toLocaleDateString('fr-FR', options);
    }
    setInterval(updateDateTime, 1000);
    updateDateTime(); // Appel initial

    function formatCurrency(amount) {
        return (amount || 0).toLocaleString('fr-FR') + ' XAF';
    }


    // --- GESTION DE LA NAVIGATION ---

    function showSection(sectionId) {
        // 1. Masquer toutes les sections
        contentSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        // 2. Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
        }
        
        // 3. Mettre à jour l'état actif du lien de navigation
        sidebarNavLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');

        // 4. Rafraîchir les métriques si c'est le tableau de bord
        if (sectionId === 'dashboard') {
            updateDashboardMetrics();
        }
    }

    // Écouteurs de clic pour la navigation
    sidebarNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-section');
            if (targetId) {
                showSection(targetId);
            }
        });
    });

    // --- Fonctions API : Récupérer les données ---
    // Les appels utilisent des chemins relatifs /api/... qui sont corrects pour Vercel

    async function fetchEntreprises() {
        try {
            const response = await fetch('/api/entreprises'); // CHEMIN RELATIF CORRECT
            if (!response.ok) throw new Error('Échec du chargement des entreprises');
            entreprises = await response.json();
        } catch (error) {
            console.error('Erreur API (Entreprises):', error);
            entreprises = [];
        }
    }

    async function fetchVersements() {
        try {
            const response = await fetch('/api/versements'); // CHEMIN RELATIF CORRECT
            if (!response.ok) throw new Error('Échec du chargement des versements');
            versements = await response.json();
        } catch (error) {
            console.error('Erreur API (Versements):', error);
            versements = [];
        }
    }

    async function loadAllDataAndDisplay() {
        await fetchEntreprises();
        await fetchVersements();
        displayEntreprises();
        displayVersements();
        updateEntrepriseSelects();
    }

    // --- Fonctions d'Affichage et de Mise à Jour ---
    
    // Met à jour tous les <select> d'entreprise
    function updateEntrepriseSelects() {
        const selects = [typeEntrepriseVersementSelect, bilanTypeEntrepriseSelect, conseilTypeEntrepriseSelect];
        
        selects.forEach(select => {
            const initialValue = select.value;
            select.innerHTML = '';
            
            if (select.id === 'typeEntrepriseVersement') {
                select.innerHTML = '<option value="">-- Sélectionner une entreprise --</option>';
            } else {
                select.innerHTML = '<option value="">Toutes les entreprises</option>';
            }

            entreprises.forEach(entreprise => {
                const option = document.createElement('option');
                option.value = entreprise._id; 
                option.textContent = `${entreprise.typeEntreprise} (${entreprise.dg})`;
                select.appendChild(option);
            });
            select.value = initialValue; 
        });
    }

    // Met à jour automatiquement DG et Comptable dans le formulaire de Versement
    typeEntrepriseVersementSelect.addEventListener('change', () => {
        const selectedId = typeEntrepriseVersementSelect.value;
        const selectedEntreprise = entreprises.find(e => e._id === selectedId);

        if (selectedEntreprise) {
            dgVersementInput.value = selectedEntreprise.dg;
            comptableVersementInput.value = selectedEntreprise.comptable;
        } else {
            dgVersementInput.value = '';
            comptableVersementInput.value = accountantNameInput.value;
        }
    });

    function displayEntreprises() {
        tableEntreprisesBody.innerHTML = '';
        entreprises.forEach((entreprise, index) => {
            const row = tableEntreprisesBody.insertRow();
            
            row.insertCell(0).textContent = index + 1;
            row.insertCell(1).textContent = entreprise.typeEntreprise;
            row.insertCell(2).textContent = entreprise.dg;
            row.insertCell(3).textContent = new Date(entreprise.date).toLocaleDateString('fr-FR');
            row.insertCell(4).textContent = entreprise.comptable;

            const actionsCell = row.insertCell(5);
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Modifier';
            editBtn.classList.add('btn', 'btn-edit');
            editBtn.onclick = () => editEntreprise(entreprise._id); 
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.classList.add('btn', 'btn-delete');
            deleteBtn.onclick = () => deleteEntreprise(entreprise._id); 
            actionsCell.appendChild(deleteBtn);
        });
    }
    
    function displayVersements() {
        tableVersementMensuelBody.innerHTML = '';
        versements.forEach((versement, index) => {
            const row = tableVersementMensuelBody.insertRow();
            
            row.insertCell(0).textContent = index + 1;
            row.insertCell(1).textContent = versement.typeEntreprise;
            row.insertCell(2).textContent = versement.dg;
            row.insertCell(3).textContent = versement.comptable;
            row.insertCell(4).textContent = new Date(versement.dateVersement).toLocaleDateString('fr-FR');
            row.insertCell(5).textContent = formatCurrency(versement.caAchat);
            row.insertCell(6).textContent = formatCurrency(versement.caProduction);
            row.insertCell(7).textContent = formatCurrency(versement.montantDepot);
            row.insertCell(8).textContent = formatCurrency(versement.montantPointsVente);
            row.insertCell(9).textContent = formatCurrency(versement.caVente);
            row.insertCell(10).textContent = formatCurrency(versement.montantDepenses);
            
            const actionsCell = row.insertCell(11);
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Modifier';
            editBtn.classList.add('btn', 'btn-edit');
            editBtn.onclick = () => editVersement(versement._id);
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.classList.add('btn', 'btn-delete');
            deleteBtn.onclick = () => deleteVersement(versement._id);
            actionsCell.appendChild(deleteBtn);
        });
        updateDashboardMetrics();
    }

    // --- Fonctions de Diagramme (MISE EN ŒUVRE DE CHART.JS) ---

    function updateDashboardMetrics() {
        // 1. Calculer les métriques totales (KPIs)
        const totalAchats = versements.reduce((sum, v) => sum + v.caAchat, 0);
        const totalProduction = versements.reduce((sum, v) => sum + v.caProduction, 0);
        const totalDepot = versements.reduce((sum, v) => sum + v.montantDepot, 0);
        const totalMontantsVersesPV = versements.reduce((sum, v) => sum + v.montantPointsVente, 0);
        const totalVentes = versements.reduce((sum, v) => sum + v.caVente, 0);
        const totalDepenses = versements.reduce((sum, v) => sum + v.montantDepenses, 0);

        document.getElementById('totalAchats').textContent = formatCurrency(totalAchats);
        document.getElementById('totalProduction').textContent = formatCurrency(totalProduction);
        document.getElementById('totalDepot').textContent = formatCurrency(totalDepot);
        document.getElementById('totalMontantsVersesPV').textContent = formatCurrency(totalMontantsVersesPV);

        // 2. Préparation des données pour les graphiques
        if (typeof Chart === 'undefined') {
            console.error("Chart.js n'est pas chargé. Vérifiez l'inclusion dans l'HTML.");
            return;
        }

        // --- Graphique 1: Vue d'ensemble des totaux financiers (Barres) ---
        const mainChartData = {
            labels: ['Achats', 'Production', 'Dépôt', 'PV'],
            datasets: [{
                label: 'Totaux (XAF)',
                data: [totalAchats, totalProduction, totalDepot, totalMontantsVersesPV],
                backgroundColor: ['#007bff', '#28a745', '#ffc107', '#17a2b8'],
            }]
        };
        createOrUpdateChart('mainDashboardChart', 'bar', mainChartData);

        // --- Graphique 2: CA Vente vs Dépenses (Doughnut) ---
        const summaryChartData = {
            labels: ['CA Vente', 'Dépenses', 'Marge Estimée'],
            datasets: [{
                label: 'Flux Majeurs',
                data: [totalVentes, totalDepenses, totalVentes - totalDepenses],
                backgroundColor: ['#28a745', '#dc3545', '#007bff'],
            }]
        };
        createOrUpdateChart('summaryChart', 'doughnut', summaryChartData);
    }

    // Fonction générique de création/mise à jour de graphique
    function createOrUpdateChart(canvasId, type, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (charts[canvasId]) {
            charts[canvasId].data = data;
            charts[canvasId].update();
        } else {
            charts[canvasId] = new Chart(ctx, {
                type: type,
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: (type === 'bar' || type === 'line') ? { y: { beginAtZero: true } } : {},
                }
            });
        }
    }


    // --- Actions CRUD pour les Entreprises ---

    formulaireEntrepriseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            typeEntreprise: document.getElementById('typeEntrepriseForm').value,
            dg: document.getElementById('dgForm').value,
            date: document.getElementById('dateForm').value,
            comptable: accountantNameInput.value
        };

        const id = entrepriseIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/entreprises/${id}` : '/api/entreprises'; // CHEMIN RELATIF CORRECT

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Erreur lors de la sauvegarde.');

            alert('Entreprise enregistrée avec succès !');
            formulaireEntrepriseForm.reset();
            entrepriseIdInput.value = '';
            cancelEntrepriseEditButton.style.display = 'none';
            await loadAllDataAndDisplay();

        } catch (error) {
            console.error('Erreur enregistrement entreprise:', error);
            alert("Une erreur est survenue lors de l'enregistrement. Vérifiez la console.");
        }
    });

    function editEntreprise(id) {
        const entrepriseToEdit = entreprises.find(emp => emp._id === id); 
        if (entrepriseToEdit) {
            entrepriseIdInput.value = entrepriseToEdit._id;
            document.getElementById('typeEntrepriseForm').value = entrepriseToEdit.typeEntreprise;
            document.getElementById('dgForm').value = entrepriseToEdit.dg;
            document.getElementById('dateForm').value = entrepriseToEdit.date.substring(0, 10);
            comptableFormInput.value = entrepriseToEdit.comptable;
            cancelEntrepriseEditButton.style.display = 'inline-block';
            showSection('formulaire-entreprise');
        }
    }

    async function deleteEntreprise(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette entreprise et ses versements ?')) {
            try {
                const response = await fetch(`/api/entreprises/${id}`, { method: 'DELETE' }); // CHEMIN RELATIF CORRECT
                if (!response.ok) throw new Error('Échec de la suppression.');

                alert('Suppression réussie !');
                await loadAllDataAndDisplay();

            } catch (error) {
                console.error('Erreur suppression entreprise:', error);
                alert(`Impossible de supprimer. Vérifiez la console.`);
            }
        }
    }

    // Annuler l'édition d'entreprise
    cancelEntrepriseEditButton.addEventListener('click', () => {
        formulaireEntrepriseForm.reset();
        entrepriseIdInput.value = '';
        cancelEntrepriseEditButton.style.display = 'none';
    });


    // --- Actions CRUD pour les Versements ---

    versementMensuelForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const entrepriseId = typeEntrepriseVersementSelect.value;
        if (!entrepriseId) {
            alert("Veuillez sélectionner une entreprise.");
            return;
        }

        const formData = {
            entrepriseId: entrepriseId,
            dateVersement: dateVersementInput.value,
            caAchat: parseFloat(document.getElementById('caAchat').value) || 0,
            caProduction: parseFloat(document.getElementById('caProduction').value) || 0,
            montantDepot: parseFloat(document.getElementById('montantDepot').value) || 0,
            montantPointsVente: parseFloat(document.getElementById('montantPointsVente').value) || 0,
            caVente: parseFloat(document.getElementById('caVente').value) || 0,
            montantDepenses: parseFloat(document.getElementById('montantDepenses').value) || 0,
        };

        const id = versementIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/versements/${id}` : '/api/versements'; // CHEMIN RELATIF CORRECT

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Erreur lors de la sauvegarde du versement.');

            alert('Versement enregistré avec succès !');
            versementMensuelForm.reset();
            versementIdInput.value = '';
            cancelVersementEditButton.style.display = 'none';
            await loadAllDataAndDisplay();

        } catch (error) {
            console.error('Erreur enregistrement versement:', error);
            alert("Une erreur est survenue lors de l'enregistrement du versement. Vérifiez la console.");
        }
    });

    function editVersement(id) {
        const versementToEdit = versements.find(v => v._id === id);
        if (versementToEdit) {
            versementIdInput.value = versementToEdit._id;
            
            typeEntrepriseVersementSelect.value = versementToEdit.entrepriseId;
            dateVersementInput.value = versementToEdit.dateVersement.substring(0, 10);
            document.getElementById('caAchat').value = versementToEdit.caAchat;
            document.getElementById('caProduction').value = versementToEdit.caProduction;
            document.getElementById('montantDepot').value = versementToEdit.montantDepot;
            document.getElementById('montantPointsVente').value = versementToEdit.montantPointsVente;
            document.getElementById('caVente').value = versementToEdit.caVente;
            document.getElementById('montantDepenses').value = versementToEdit.montantDepenses;
            
            dgVersementInput.value = versementToEdit.dg;
            comptableVersementInput.value = versementToEdit.comptable;
            
            cancelVersementEditButton.style.display = 'inline-block';
            showSection('versement-mensuel');
        }
    }

    async function deleteVersement(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce versement ?')) {
            try {
                const response = await fetch(`/api/versements/${id}`, { method: 'DELETE' }); // CHEMIN RELATIF CORRECT
                if (!response.ok) throw new Error('Échec de la suppression.');

                alert('Suppression réussie !');
                await loadAllDataAndDisplay();

            } catch (error) {
                console.error('Erreur suppression versement:', error);
                alert(`Impossible de supprimer. Vérifiez la console.`);
            }
        }
    }
    
    // Annuler l'édition de versement
    cancelVersementEditButton.addEventListener('click', () => {
        versementMensuelForm.reset();
        versementIdInput.value = '';
        cancelVersementEditButton.style.display = 'none';
    });


    // --- Logique Bilan et Conseils (Non API) ---

    genererBilanBtn.addEventListener('click', () => {
        bilanOutputDiv.innerHTML = '<p class="loading">Génération du bilan...</p>';
        setTimeout(() => {
            const mois = document.getElementById('bilanMois').value;
            const annee = document.getElementById('bilanAnnee').value;
            const entrepriseId = document.getElementById('bilanTypeEntreprise').value;

            bilanOutputDiv.innerHTML = `<h3>Bilan pour ${mois}/${annee}</h3><p>Contenu du bilan pour l'entreprise sélectionnée (ID: ${entrepriseId}) à implémenter ici.</p>`;
            document.getElementById('printBilanBtn').style.display = 'inline-block';
        }, 500);
    });

    genererConseilsBtn.addEventListener('click', () => {
        conseilsOutputDiv.innerHTML = '<p class="loading">Génération des conseils...</p>';
        setTimeout(() => {
            conseilsOutputDiv.innerHTML = `<h3>Conseils Personnalisés</h3><p>Analyse des performances et recommandations personnalisées à implémenter ici.</p>`;
            document.getElementById('printConseilsBtn').style.display = 'inline-block';
        }, 500);
    });


    // --- Lancement initial ---
    loadAllDataAndDisplay();
    showSection('dashboard'); // Affiche le tableau de bord au démarrage
});