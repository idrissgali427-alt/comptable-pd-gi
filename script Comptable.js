document.addEventListener('DOMContentLoaded', () => {

    // --- Initialisation et variables globales ---
    const accountantNameInput = document.getElementById('accountantName');
    const currentDateTimeSpan = document.getElementById('current-datetime');
    const weatherInfoSpan = document.getElementById('weather-info');

    const sidebarNavLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    const resetAppButton = document.getElementById('resetAppButton');

    // Données stockées localement
    let entreprises = JSON.parse(localStorage.getItem('entreprises')) || [];
    let versements = JSON.parse(localStorage.getItem('versements')) || [];

    // Références aux formulaires et tableaux
    const formulaireEntrepriseForm = document.getElementById('formulaireEntrepriseForm');
    const tableEntreprisesBody = document.querySelector('#table-formulaire-entreprise tbody');
    const entrepriseIdInput = document.getElementById('entrepriseId');
    const comptableFormInput = document.getElementById('comptableForm');
    const cancelEntrepriseEditButton = document.getElementById('cancelEntrepriseEdit');

    const versementMensuelForm = document.getElementById('versementMensuelForm');
    const tableVersementMensuelBody = document.querySelector('#table-versement-mensuel tbody');
    const versementIdInput = document.getElementById('versementId');
    const typeEntrepriseVersementSelect = document.getElementById('typeEntrepriseVersement');
    const rapportEntrepriseInput = document.getElementById('rapportEntreprise');
    const dgVersementInput = document.getElementById('dgVersement');
    const comptableVersementInput = document.getElementById('comptableVersement');
    const cancelVersementEditButton = document.getElementById('cancelVersementEdit');

    // Références pour les bilans et conseils
    const bilanTypeEntrepriseSelect = document.getElementById('bilanTypeEntreprise');
    const conseilTypeEntrepriseSelect = document.getElementById('conseilTypeEntreprise');
    const printBilanBtn = document.getElementById('printBilanBtn');
    const printConseilsBtn = document.getElementById('printConseilsBtn');
    const genererConseilsBtn = document.getElementById('genererConseilsBtn');
    const genererBilanBtn = document.getElementById('genererBilanBtn');

    // --- Fonctions utilitaires ---

    

// La fonction qui met à jour la date et l'heure
function updateDateTime() {
    const currentDateTimeSpan = document.getElementById('current-date-time');
    if (currentDateTimeSpan) {
        const now = new Date();
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        currentDateTimeSpan.textContent = `${now.toLocaleDateString('fr-FR', optionsDate)} ${now.toLocaleTimeString('fr-FR', optionsTime)}`;
    }
}

// Appelle la fonction une seule fois pour afficher l'heure et la date
updateDateTime();


    function showSection(sectionId) {
        contentSections.forEach(section => section.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');

        sidebarNavLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
        if (sectionId === 'dashboard') {
            updateDashboardMetrics();
        }
    }
    
    // Ajout de l'écouteur de clic pour la navigation
    sidebarNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            showSection(sectionId);
        });
    });

    function saveData() {
        localStorage.setItem('entreprises', JSON.stringify(entreprises));
        localStorage.setItem('versements', JSON.stringify(versements));
        localStorage.setItem('accountantName', accountantNameInput.value);
    }

    function loadData() {
        const savedAccountantName = localStorage.getItem('accountantName');
        if (savedAccountantName) {
            accountantNameInput.value = savedAccountantName;
        } else {
            accountantNameInput.value = "Nom Non Défini";
        }
        updateComptableFormFields(accountantNameInput.value);
    }

    function updateComptableFormFields(name) {
        comptableFormInput.value = name;
        comptableVersementInput.value = name;
    }

    function updateEntrepriseSelects() {
        typeEntrepriseVersementSelect.innerHTML = '<option value="">Sélectionner un type</option>';
        bilanTypeEntrepriseSelect.innerHTML = '<option value="">Toutes les entreprises</option>';
        conseilTypeEntrepriseSelect.innerHTML = '<option value="">Toutes les entreprises</option>';

        entreprises.forEach(entreprise => {
            const option1 = document.createElement('option');
            option1.value = entreprise.id;
            option1.textContent = entreprise.typeEntreprise;
            typeEntrepriseVersementSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = entreprise.typeEntreprise;
            option2.textContent = entreprise.typeEntreprise;
            bilanTypeEntrepriseSelect.appendChild(option2);

            const option3 = document.createElement('option');
            option3.value = entreprise.typeEntreprise;
            option3.textContent = entreprise.typeEntreprise;
            conseilTypeEntrepriseSelect.appendChild(option3);
        });
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    // --- Gestion des Entreprises ---

    function displayEntreprises() {
        tableEntreprisesBody.innerHTML = '';
        entreprises.forEach((entreprise, index) => {
            const row = tableEntreprisesBody.insertRow();
            row.insertCell(0).textContent = index + 1;
            row.insertCell(1).textContent = entreprise.typeEntreprise;
            row.insertCell(2).textContent = entreprise.dg;
            row.insertCell(3).textContent = entreprise.date;
            row.insertCell(4).textContent = entreprise.comptable;

            const actionsCell = row.insertCell(5);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Modifier';
            editBtn.classList.add('btn', 'btn-edit');
            editBtn.onclick = () => editEntreprise(entreprise.id);
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.classList.add('btn', 'btn-delete');
            deleteBtn.onclick = () => deleteEntreprise(entreprise.id);
            actionsCell.appendChild(deleteBtn);
        });
        updateEntrepriseSelects();
    }

    formulaireEntrepriseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEntreprise = {
            id: entrepriseIdInput.value ? parseInt(entrepriseIdInput.value) : Date.now(),
            typeEntreprise: document.getElementById('typeEntrepriseForm').value,
            dg: document.getElementById('dgForm').value,
            date: document.getElementById('dateForm').value,
            comptable: comptableFormInput.value
        };

        if (entrepriseIdInput.value) {
            entreprises = entreprises.map(emp => emp.id === newEntreprise.id ? newEntreprise : emp);
            entrepriseIdInput.value = '';
            cancelEntrepriseEditButton.style.display = 'none';
        } else {
            entreprises.push(newEntreprise);
        }

        formulaireEntrepriseForm.reset();
        updateComptableFormFields(accountantNameInput.value);
        saveData();
        displayEntreprises();
    });

    function editEntreprise(id) {
        const entrepriseToEdit = entreprises.find(emp => emp.id === id);
        if (entrepriseToEdit) {
            document.getElementById('entrepriseId').value = entrepriseToEdit.id;
            document.getElementById('typeEntrepriseForm').value = entrepriseToEdit.typeEntreprise;
            document.getElementById('dgForm').value = entrepriseToEdit.dg;
            document.getElementById('dateForm').value = entrepriseToEdit.date;
            comptableFormInput.value = entrepriseToEdit.comptable;
            cancelEntrepriseEditButton.style.display = 'inline-block';
            showSection('formulaire-entreprise');
        }
    }

    cancelEntrepriseEditButton.addEventListener('click', () => {
        formulaireEntrepriseForm.reset();
        entrepriseIdInput.value = '';
        updateComptableFormFields(accountantNameInput.value);
        cancelEntrepriseEditButton.style.display = 'none';
    });

    function deleteEntreprise(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette entreprise et tous ses versements associés ?')) {
            entreprises = entreprises.filter(emp => emp.id !== id);
            versements = versements.filter(vers => vers.entrepriseId !== id);
            saveData();
            displayEntreprises();
            displayVersements();
        }
    }
    
    // --- Gestion des Versements Mensuels ---

    function displayVersements() {
        tableVersementMensuelBody.innerHTML = '';
        versements.forEach((versement) => {
            const row = tableVersementMensuelBody.insertRow();
            row.insertCell(0).textContent = `R${String(versement.entrepriseId).padStart(3, '0')}`;
            row.insertCell(1).textContent = versement.typeEntreprise;
            row.insertCell(2).textContent = versement.dg;
            row.insertCell(3).textContent = versement.comptable;
            row.insertCell(4).textContent = versement.dateVersement;
            row.insertCell(5).textContent = versement.caAchat.toLocaleString('fr-FR') + ' XAF';
            row.insertCell(6).textContent = versement.caProduction.toLocaleString('fr-FR') + ' XAF';
            row.insertCell(7).textContent = versement.montantDepot.toLocaleString('fr-FR') + ' XAF';
            row.insertCell(8).textContent = versement.montantPointsVente.toLocaleString('fr-FR') + ' XAF';
            row.insertCell(9).textContent = versement.caVente.toLocaleString('fr-FR') + ' XAF';
            row.insertCell(10).textContent = versement.montantDepenses.toLocaleString('fr-FR') + ' XAF';

            const actionsCell = row.insertCell(11);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Modifier';
            editBtn.classList.add('btn', 'btn-edit');
            editBtn.onclick = () => editVersement(versement.id);
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.classList.add('btn', 'btn-delete');
            deleteBtn.onclick = () => deleteVersement(versement.id);
            actionsCell.appendChild(deleteBtn);
        });
        updateDashboardMetrics();
    }

    typeEntrepriseVersementSelect.addEventListener('change', () => {
        const selectedEntrepriseId = parseInt(typeEntrepriseVersementSelect.value);
        const selectedEntreprise = entreprises.find(emp => emp.id === selectedEntrepriseId);

        if (selectedEntreprise) {
            dgVersementInput.value = selectedEntreprise.dg;
            rapportEntrepriseInput.value = `R${String(selectedEntreprise.id).padStart(3, '0')}`;
        } else {
            dgVersementInput.value = '';
            rapportEntrepriseInput.value = '';
        }
    });

    versementMensuelForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectedEntrepriseId = parseInt(typeEntrepriseVersementSelect.value);
        const selectedEntreprise = entreprises.find(emp => emp.id === selectedEntrepriseId);

        if (!selectedEntreprise) {
            alert("Veuillez sélectionner une entreprise valide.");
            return;
        }

        const newVersement = {
            id: versementIdInput.value ? parseInt(versementIdInput.value) : Date.now(),
            entrepriseId: selectedEntrepriseId,
            typeEntreprise: selectedEntreprise.typeEntreprise,
            dg: selectedEntreprise.dg,
            comptable: comptableVersementInput.value,
            dateVersement: document.getElementById('dateVersement').value,
            caAchat: parseFloat(document.getElementById('caAchat').value),
            caProduction: parseFloat(document.getElementById('caProduction').value),
            montantDepot: parseFloat(document.getElementById('montantDepot').value),
            montantPointsVente: parseFloat(document.getElementById('montantPointsVente').value),
            caVente: parseFloat(document.getElementById('caVente').value),
            montantDepenses: parseFloat(document.getElementById('montantDepenses').value)
        };

        if (versementIdInput.value) {
            versements = versements.map(vers => vers.id === newVersement.id ? newVersement : vers);
            versementIdInput.value = '';
            cancelVersementEditButton.style.display = 'none';
        } else {
            versements.push(newVersement);
        }

        versementMensuelForm.reset();
        updateComptableFormFields(accountantNameInput.value);
        saveData();
        displayVersements();
        typeEntrepriseVersementSelect.value = '';
        dgVersementInput.value = '';
        rapportEntrepriseInput.value = '';
    });

    function editVersement(id) {
        const versementToEdit = versements.find(vers => vers.id === id);
        if (versementToEdit) {
            versementIdInput.value = versementToEdit.id;
            typeEntrepriseVersementSelect.value = versementToEdit.entrepriseId;
            typeEntrepriseVersementSelect.dispatchEvent(new Event('change'));

            comptableVersementInput.value = versementToEdit.comptable;
            document.getElementById('dateVersement').value = versementToEdit.dateVersement;
            document.getElementById('caAchat').value = versementToEdit.caAchat;
            document.getElementById('caProduction').value = versementToEdit.caProduction;
            document.getElementById('montantDepot').value = versementToEdit.montantDepot;
            document.getElementById('montantPointsVente').value = versementToEdit.montantPointsVente;
            document.getElementById('caVente').value = versementToEdit.caVente;
            document.getElementById('montantDepenses').value = versementToEdit.montantDepenses;

            cancelVersementEditButton.style.display = 'inline-block';
            showSection('versement-mensuel');
        }
    }

    cancelVersementEditButton.addEventListener('click', () => {
        versementMensuelForm.reset();
        versementIdInput.value = '';
        cancelVersementEditButton.style.display = 'none';
        typeEntrepriseVersementSelect.value = '';
        dgVersementInput.value = '';
        rapportEntrepriseInput.value = '';
        updateComptableFormFields(accountantNameInput.value);
    });

    function deleteVersement(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce versement ?')) {
            versements = versements.filter(vers => vers.id !== id);
            saveData();
            displayVersements();
        }
    }
    
    // --- Tableaux de Bord et Graphiques (Chart.js) ---
    function updateDashboardMetrics() {
        const totalAchats = versements.reduce((sum, v) => sum + v.caAchat, 0);
        const totalProduction = versements.reduce((sum, v) => sum + v.caProduction, 0);
        const totalDepot = versements.reduce((sum, v) => sum + v.montantDepot, 0);
        const totalMontantsVersesPV = versements.reduce((sum, v) => sum + v.montantPointsVente, 0);

        document.getElementById('totalAchats').textContent = totalAchats.toLocaleString('fr-FR') + ' XAF';
        document.getElementById('totalProduction').textContent = totalProduction.toLocaleString('fr-FR') + ' XAF';
        document.getElementById('totalDepot').textContent = totalDepot.toLocaleString('fr-FR') + ' XAF';
        document.getElementById('totalMontantsVersesPV').textContent = totalMontantsVersesPV.toLocaleString('fr-FR') + ' XAF';

        updateMainDashboardChart();
        updateSummaryChart();
        updatePurchaseProductionChart();
        updateCompanyPerformanceChart();
        updateMonthlyProfitChart();
        updateProfitDistributionChart();
    }
    
    // Gère la création et la mise à jour des graphiques pour éviter les doublons
    function createChart(ctxId, type, data, options) {
        const ctx = document.getElementById(ctxId).getContext('2d');
        if (window[`${ctxId}Instance`]) {
            window[`${ctxId}Instance`].destroy();
        }
        window[`${ctxId}Instance`] = new Chart(ctx, { type, data, options });
    }

    function updateMainDashboardChart() {
        const labels = ['Achats', 'Production', 'Dépôt', 'Montants PV'];
        const data = [
            versements.reduce((sum, v) => sum + v.caAchat, 0),
            versements.reduce((sum, v) => sum + v.caProduction, 0),
            versements.reduce((sum, v) => sum + v.montantDepot, 0),
            versements.reduce((sum, v) => sum + v.montantPointsVente, 0)
        ];
        createChart('mainDashboardChart', 'bar', {
            labels: labels,
            datasets: [{
                label: 'Totaux Financiers',
                data: data,
                backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0'],
                borderColor: ['#388E3C', '#1976D2', '#FFA000', '#7B1FA2'],
                borderWidth: 1
            }]
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Vue d\'overview des Totaux Financiers' } }
        });
    }

    function updateSummaryChart() {
        const labels = Array.from(new Set(versements.map(v => v.dateVersement.substring(0, 7)))).sort();
        const caVenteData = labels.map(month =>
            versements.filter(v => v.dateVersement.startsWith(month))
                .reduce((sum, v) => sum + v.caVente, 0)
        );
        const depensesData = labels.map(month =>
            versements.filter(v => v.dateVersement.startsWith(month))
                .reduce((sum, v) => sum + v.montantDepenses, 0)
        );

        createChart('summaryChart', 'line', {
            labels: labels,
            datasets: [
                {
                    label: 'Chiffre d\'Affaire de Vente',
                    data: caVenteData,
                    borderColor: '#00BCD4',
                    tension: 0.1
                },
                {
                    label: 'Dépenses Totales',
                    data: depensesData,
                    borderColor: '#F44336',
                    tension: 0.1
                }
            ]
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Chiffre d\'Affaire de Vente vs Dépenses' } }
        });
    }

    function updatePurchaseProductionChart() {
        const labels = Array.from(new Set(entreprises.map(e => e.typeEntreprise))).sort();
        const purchaseData = labels.map(type =>
            versements.filter(v => v.typeEntreprise === type)
                .reduce((sum, v) => sum + v.caAchat, 0)
        );
        const productionData = labels.map(type =>
            versements.filter(v => v.typeEntreprise === type)
                .reduce((sum, v) => sum + v.caProduction, 0)
        );

        createChart('purchaseProductionChart', 'bar', {
            labels: labels,
            datasets: [
                {
                    label: 'Total Achats',
                    data: purchaseData,
                    backgroundColor: '#FF5722'
                },
                {
                    label: 'Total Production',
                    data: productionData,
                    backgroundColor: '#8BC34A'
                }
            ]
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Analyse Achat vs Production par Type d\'Entreprise' } }
        });

        const totalAchatsGlobal = versements.reduce((sum, v) => sum + v.caAchat, 0);
        const totalProductionGlobal = versements.reduce((sum, v) => sum + v.caProduction, 0);
        const percentage = totalAchatsGlobal > 0 ? ((totalProductionGlobal / totalAchatsGlobal) * 100).toFixed(2) : 0;
        document.getElementById('productionVsPurchasePercentage').textContent = `${percentage}%`;
    }

    function updateCompanyPerformanceChart() {
        const labels = Array.from(new Set(entreprises.map(e => e.typeEntreprise))).sort();
        const performanceData = labels.map(type =>
            versements.filter(v => v.typeEntreprise === type)
                .reduce((sum, v) => (v.caVente - v.montantDepenses), 0)
        );

        createChart('companyPerformanceChart', 'bar', {
            labels: labels,
            datasets: [{
                label: 'Performance Nette (CA Vente - Dépenses)',
                data: performanceData,
                backgroundColor: performanceData.map(val => val >= 0 ? '#4CAF50' : '#F44336')
            }]
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Performance Financière Globale par Entreprise' } }
        });
    }

    function updateMonthlyProfitChart() {
        const monthlyProfits = {};
        versements.forEach(v => {
            const month = v.dateVersement.substring(0, 7);
            if (!monthlyProfits[month]) {
                monthlyProfits[month] = {};
            }
            if (!monthlyProfits[month][v.typeEntreprise]) {
                monthlyProfits[month][v.typeEntreprise] = 0;
            }
            monthlyProfits[month][v.typeEntreprise] += (v.caVente - v.montantDepenses);
        });

        const months = Object.keys(monthlyProfits).sort();
        const uniqueEntrepriseTypes = Array.from(new Set(entreprises.map(e => e.typeEntreprise))).sort();

        const datasets = uniqueEntrepriseTypes.map(type => ({
            label: type,
            data: months.map(month => monthlyProfits[month][type] || 0),
            fill: false,
            tension: 0.1,
            borderColor: getRandomColor()
        }));

        createChart('monthlyProfitChart', 'line', {
            labels: months,
            datasets: datasets
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Bénéfices Mensuels par Entreprise' } }
        });
    }

    function updateProfitDistributionChart() {
        const profitBySource = {
            'Chiffre d\'Affaire Achat': versements.reduce((sum, v) => sum + v.caAchat, 0),
            'Chiffre d\'Affaire Production': versements.reduce((sum, v) => sum + v.caProduction, 0),
            'Montant Dépôt': versements.reduce((sum, v) => sum + v.montantDepot, 0),
            'Montant dans les PV': versements.reduce((sum, v) => sum + v.montantPointsVente, 0),
            'Chiffre d\'Affaire Vente': versements.reduce((sum, v) => sum + v.caVente, 0),
            'Montant Dépenses': versements.reduce((sum, v) => sum + v.montantDepenses, 0)
        };

        const labels = Object.keys(profitBySource);
        const data = Object.values(profitBySource);
        const backgroundColors = labels.map(() => getRandomColor());

        createChart('profitDistributionChart', 'doughnut', {
            labels: labels,
            datasets: [{
                label: 'Répartition des Flux Financiers',
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        }, {
            responsive: true,
            plugins: { title: { display: true, text: 'Répartition des Bénéfices et Flux Majeurs' } }
        });
    }
    
    // --- Bilan Mensuel ---
    genererBilanBtn.addEventListener('click', () => {
        const month = document.getElementById('bilanMois').value;
        const year = document.getElementById('bilanAnnee').value;
        const typeEntreprise = document.getElementById('bilanTypeEntreprise').value;
        const bilanOutput = document.getElementById('bilanOutput');
        bilanOutput.innerHTML = '';

        let filteredVersements = versements.filter(v => {
            const vDate = new Date(v.dateVersement);
            const vMonth = vDate.getMonth() + 1;
            const vYear = vDate.getFullYear();
            return vMonth == month && vYear == year && (typeEntreprise === '' || v.typeEntreprise === typeEntreprise);
        });

        if (filteredVersements.length === 0) {
            bilanOutput.innerHTML = '<p>Aucune donnée de versement trouvée pour la période et/ou le type d\'entreprise sélectionnés.</p>';
            printBilanBtn.style.display = 'none';
            return;
        }

        const bilanParEntreprise = {};
        filteredVersements.forEach(v => {
            if (!bilanParEntreprise[v.typeEntreprise]) {
                bilanParEntreprise[v.typeEntreprise] = {
                    totalCA_Achat: 0,
                    totalCA_Production: 0,
                    totalMontantDepot: 0,
                    totalMontantPV: 0,
                    totalCA_Vente: 0,
                    totalDepenses: 0
                };
            }
            bilanParEntreprise[v.typeEntreprise].totalCA_Achat += v.caAchat;
            bilanParEntreprise[v.typeEntreprise].totalCA_Production += v.caProduction;
            bilanParEntreprise[v.typeEntreprise].totalMontantDepot += v.montantDepot;
            bilanParEntreprise[v.typeEntreprise].totalMontantPV += v.montantPointsVente;
            bilanParEntreprise[v.typeEntreprise].totalCA_Vente += v.caVente;
            bilanParEntreprise[v.typeEntreprise].totalDepenses += v.montantDepenses;
        });

        for (const type in bilanParEntreprise) {
            const data = bilanParEntreprise[type];
            const beneficeNet = data.totalCA_Vente - data.totalDepenses;
            const margeBrute = data.totalCA_Vente - data.totalCA_Achat;

            const bilanHtml = `
                <div class="bilan-entry card">
                    <h3>Bilan pour ${type} - ${new Date(year, month - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
                    <ul>
                        <li><strong>Total Achats:</strong> ${data.totalCA_Achat.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Total Production:</strong> ${data.totalCA_Production.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Total Dépôt:</strong> ${data.totalMontantDepot.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Total Montants en Points de Vente:</strong> ${data.totalMontantPV.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Total Ventes:</strong> ${data.totalCA_Vente.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Total Dépenses:</strong> ${data.totalDepenses.toLocaleString('fr-FR')} XAF</li>
                        <li><strong>Marge Brute:</strong> <span class="${margeBrute >= 0 ? 'profit-positive' : 'profit-negative'}">${margeBrute.toLocaleString('fr-FR')} XAF</span></li>
                        <li><strong>Bénéfice Net:</strong> <span class="${beneficeNet >= 0 ? 'profit-positive' : 'profit-negative'}">${beneficeNet.toLocaleString('fr-FR')} XAF</span></li>
                    </ul>
                </div>
            `;
            bilanOutput.insertAdjacentHTML('beforeend', bilanHtml);
        }
        printBilanBtn.style.display = 'inline-block';
    });

    printBilanBtn.addEventListener('click', () => {
        const contentToPrint = document.getElementById('bilanOutput').innerHTML;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = contentToPrint;
        window.print();
        document.body.innerHTML = originalBody;
        location.reload();
    });
    
    // --- Conseils Financiers ---
    genererConseilsBtn.addEventListener('click', () => {
        const selectedType = document.getElementById('conseilTypeEntreprise').value;
        const selectedMonth = document.getElementById('conseilMois').value;
        const selectedYear = document.getElementById('conseilAnnee').value;
        const conseilsOutput = document.getElementById('conseilsOutput');
        conseilsOutput.innerHTML = '';

        let filteredVersements = versements;
        if (selectedType) {
            filteredVersements = filteredVersements.filter(v => v.typeEntreprise === selectedType);
        }
        if (selectedMonth && selectedYear) {
            filteredVersements = filteredVersements.filter(v => {
                const vDate = new Date(v.dateVersement);
                return vDate.getMonth() + 1 == selectedMonth && vDate.getFullYear() == selectedYear;
            });
        } else if (selectedYear) {
            filteredVersements = filteredVersements.filter(v => new Date(v.dateVersement).getFullYear() == selectedYear);
        }

        if (filteredVersements.length === 0) {
            conseilsOutput.innerHTML = '<p>Aucune donnée trouvée pour générer des conseils.</p>';
            printConseilsBtn.style.display = 'none';
            return;
        }

        const totalVentes = filteredVersements.reduce((sum, v) => sum + v.caVente, 0);
        const totalDepenses = filteredVersements.reduce((sum, v) => sum + v.montantDepenses, 0);
        const beneficeNet = totalVentes - totalDepenses;
        
        const conseils = [];
        if (beneficeNet > 0) {
            conseils.push('<p><strong>Félicitations !</strong> Votre entreprise est en bénéfice. Envisagez de réinvestir une partie des bénéfices pour agrandir ou moderniser vos activités.</p>');
        } else if (beneficeNet < 0) {
            conseils.push('<p><strong>Attention, l\'entreprise est en déficit.</strong> Analysez vos dépenses pour identifier les fuites et cherchez des moyens d\'augmenter vos ventes pour le mois prochain.</p>');
        } else {
            conseils.push('<p>Votre entreprise est à l\'équilibre. Concentrez-vous sur l\'optimisation des coûts pour générer des bénéfices.</p>');
        }
        
        const achatVsProduction = filteredVersements.reduce((sum, v) => sum + (v.caProduction - v.caAchat), 0);
        if (achatVsProduction > 0) {
             conseils.push('<p>Votre chiffre d\'affaires de production est supérieur à celui des achats, ce qui est un bon indicateur. Continuez à optimiser votre chaîne de production.</p>');
        } else {
            conseils.push('<p>Votre chiffre d\'affaires de production est inférieur à celui des achats. Il serait judicieux de revoir vos coûts d\'approvisionnement ou d\'améliorer votre efficacité de production.</p>');
        }
        
        const depotVsPV = filteredVersements.reduce((sum, v) => sum + (v.montantDepot - v.montantPointsVente), 0);
        if (depotVsPV > 0) {
            conseils.push('<p>Le montant de votre dépôt est supérieur à l\'argent circulant dans les points de vente, ce qui est un signe de bonne gestion de la trésorerie. Continuez à déposer vos fonds régulièrement pour des raisons de sécurité et de traçabilité.</p>');
        } else {
            conseils.push('<p>Le montant de votre dépôt est inférieur à l\'argent dans les points de vente. Il est conseillé de surveiller la trésorerie de vos points de vente et de les inciter à faire des dépôts plus réguliers.</p>');
        }
        
        const conseilHtml = conseils.map(c => `<div class="conseil-entry card">${c}</div>`).join('');
        conseilsOutput.innerHTML = conseilHtml;
        printConseilsBtn.style.display = 'inline-block';
    });
    
    printConseilsBtn.addEventListener('click', () => {
        const contentToPrint = document.getElementById('conseilsOutput').innerHTML;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = contentToPrint;
        window.print();
        document.body.innerHTML = originalBody;
        location.reload();
    });

    // --- Fonction de réinitialisation avec confirmation ---
    if (resetAppButton) {
        resetAppButton.addEventListener('click', () => {
            if (confirm("ATTENTION : Vous êtes sur le point d'effacer TOUTES les données de l'application (entreprises et versements). Cette action est irréversible. Voulez-vous continuer ?")) {
                localStorage.clear();
                alert("Toutes les données ont été effacées. L'application va se recharger.");
                location.reload();
            }
        });
    }

    // --- Démarrage de l'application ---
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadData();
    displayEntreprises();
    displayVersements();
    showSection('dashboard');
});



//CODE DE PROTECTION



// Définis le mot de passe requis
const motDePasseRequis = '001@';

// Demande à l'utilisateur d'entrer le mot de passe
let motDePasseSaisi = prompt('Veuillez entrer le mot de passe pour accéder à l\'application.');

// Vérifie si le mot de passe saisi est correct
if (motDePasseSaisi === motDePasseRequis) {
  // Le mot de passe est correct, tu peux continuer
  alert('Accès accordé !');
  // Ici, tu peux mettre tout le code de ton application
  // Par exemple, afficher le contenu de la page
} else {
  // Le mot de passe est incorrect
  alert('Mot de passe incorrect. Accès refusé !');
  // Tu peux rediriger l'utilisateur ou cacher le contenu
  window.location.href = ''; // Exemple de redirection
}
