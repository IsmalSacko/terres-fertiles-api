

// Interface pour intervention utilisateur (contrôle +1 mois)
interface Intervention {
  date: string;
  objet: string;
}
import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MelangeService, Melange, MelangeEtat, MelangeIngredient, MelangeIngredientInput, Plateforme } from '../../../services/melange.service';
import { GisementService, Gisement } from '../../../services/gisement.service';
import { ChantierService, Chantier } from '../../../services/chantier.service';
import { AuthService } from '../../../services/auth.service';
import { PlanningService } from '../../../services/planning/planning.service';

@Component({
  selector: 'app-melange-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DecimalPipe],
  templateUrl: 'melange-detail.component.html',
  styleUrl: './melange-detail.component.css'
})
export class MelangeDetailComponent implements OnInit {
  // Contrôle de l'affichage du formulaire de fiche technique
  showFicheTechniqueForm = true;

  // Liste des plannings existants pour ce mélange
  existingPlannings: any[] = [];
  selectedPlanningId: number | null = null;

  // --- Gestion interventions utilisateur (contrôle +1 mois) ---
  interventions: Intervention[] = [];
  nouvelleIntervention: Intervention = { date: '', objet: '' };

  ajouterIntervention() {
    if (this.nouvelleIntervention.date && this.nouvelleIntervention.objet) {
      // Création du planning lié à l'intervention
      if (!this.melange.id) {
        console.error('Impossible de créer un planning : mélange sans id');
        return;
      }
      const planning = {
        id: 0,
        titre: this.nouvelleIntervention.objet,
        responsable: this.currentUser?.nom || this.currentUser?.username || this.currentUser?.email || '',
        date_debut: this.nouvelleIntervention.date,
        duree_jours: 1,
        statut: 'planned',
        melange: Number(this.melange.id),
        melange_nom: this.melange.nom
      };
      this.planningService.createPlanning(planning)
        .then(() => {
          this.interventions.push({ ...this.nouvelleIntervention });
          this.nouvelleIntervention = { date: '', objet: '' };
          this.error = '';
        })
        .catch((err: any) => {
          console.error('Erreur lors de la création du planning:', err);
          this.error = 'Erreur lors de la création du planning : ' + (err?.response?.data?.detail || err.message || 'Erreur inconnue');
        });
    }
  }

  supprimerIntervention(inter: Intervention) {
    this.interventions = this.interventions.filter(i => i !== inter);
  }

  // Appelé lors du clic sur "Valider la fiche technique"
  onValiderFicheTechnique() {
    this.showFicheTechniqueForm = false;
  }
  // Expose enum values to template
  MelangeEtat = MelangeEtat;
  
  melange: Melange = {
    nom: '',
    utilisateur:'',
    nom_complet:'',
    date_creation: new Date().toISOString().split('T')[0],
    reference_produit: '',
    plateforme: null,
    fournisseur: '',
    producteur: '',
    couverture_vegetale: null,
    periode_melange: '',
    date_semis: new Date().toISOString().split('T')[0],
    references_analyses: null,
    etat: MelangeEtat.COMPOSITION,
    ordre_conformite: null,
    consignes_melange: null,
    controle_1: null,
    controle_2: null,
    fiche_technique: null,
    ingredients: [],
    gisements: [],
    amendements: []
  };
  loading = true;
  error = '';
  isNew = false;

  melangeForm: FormGroup;
  ingredientForm: FormGroup;

  gisements: Gisement[] = [];
  plateformes: Plateforme[] = [];
  availableGisements: Gisement[] = [];
  chantiers: Chantier[] = [];
  currentUser: any = null;

  showIngredientForm = false;
  editingIngredient: MelangeIngredient | null = null;
  selectedGisements: { gisementId: number, pourcentage: number }[] = [];

  // Ajout pour amendement
  showAmendementForm = false;
  // TODO: ajouter ici la logique de gestion du formulaire d'amendement si besoin

  // Formulaire d'ajout d'amendement
  amendementForm: FormGroup;
  selectedAmendements: { amendementId: number, pourcentage: number }[] = [];

  // Propriétés pour la gestion des fichiers
  uploadedFiles: { [key: string]: File } = {};
  fileErrors: { [key: string]: string } = {};

  // Propriété pour contrôler le mode d'édition
  isEditMode = true;

  // Liste des amendements organiques disponibles (chargée dynamiquement)
  availableAmendements: { id: number, nom: string }[] = [];

  editingAmendement: any = null;

  constructor(
    private melangeService: MelangeService,
    private gisementService: GisementService,
    private chantierService: ChantierService,
    private authService: AuthService,
    private planningService: PlanningService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.melangeForm = this.fb.group({
      nom: [''],
      plateforme: [null],
      fournisseur: ['', Validators.required],
      producteur: ['', Validators.required],
      couverture_vegetale: [''],
      periode_melange: ['', Validators.required],
      date_semis: ['', Validators.required],
      references_analyses: [''],
      ordre_conformite: [''],
      consignes_melange: [''],
      controle_1: [''],
      controle_2: [''],
      fiche_technique: ['']
    });

    this.ingredientForm = this.fb.group({
      gisement: [null, Validators.required],
      pourcentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    // Formulaire d'amendement
    this.amendementForm = this.fb.group({
      amendementOrganique: [null, Validators.required],
      pourcentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  

  async ngOnInit(): Promise<void> {

    await this.loadData();
    await this.loadExistingPlannings();
    try {
      this.availableAmendements = await this.melangeService.getAmendementsOrganiques();
    } catch (e) {
      console.error('Erreur lors du chargement des amendements organiques:', e);
      this.availableAmendements = [];
    }
  }

  // Charger les plannings existants pour ce mélange
  async loadExistingPlannings(): Promise<void> {
    if (!this.melange?.id) {
      this.existingPlannings = [];
      return;
    }
    try {
      const allPlannings = await this.planningService.getPlannings();
      this.existingPlannings = allPlannings.filter((p: any) => p.melange === this.melange.id);
    } catch (err) {
      console.error('Erreur lors du chargement des plannings existants:', err);
      this.existingPlannings = [];
    }
  }

  async loadData(): Promise<void> {
    try {
      this.loading = true;
      await Promise.all([
        this.loadGisements(),
        this.loadPlateformes(),
        this.loadChantiers(),
        this.loadCurrentUser()
      ]);
      this.availableGisements = this.gisements;
      const id = this.route.snapshot.paramMap.get('id');
      if (id === 'new') {
        this.isNew = true;
        this.initializeNewMelange();
      } else if (id) {
        await this.loadMelange(parseInt(id));
      }
    } catch (err) {
      this.error = 'Erreur lors du chargement des données';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async loadGisements(): Promise<void> {
    try {
      this.gisements = await this.gisementService.getAll();
    } catch (error) {
      console.error('Erreur lors du chargement des gisements:', error);
      throw error;
    }
  }

  async loadPlateformes(): Promise<void> {
    try {
      this.plateformes = await this.melangeService.getPlateformes();
    } catch (error) {
      console.error('Erreur lors du chargement des plateformes:', error);
      throw error;
    }
  }

  async loadChantiers(): Promise<void> {
    try {
      this.chantiers = await this.chantierService.getAll();
    } catch (error) {
      console.error('Erreur lors du chargement des chantiers:', error);
      throw error;
    }
  }

  async loadCurrentUser(): Promise<void> {
    try {
      console.log('Chargement de l\'utilisateur connecté...');
      const userResponse = await this.authService.getCurrentUser();
      console.log('Réponse API utilisateur:', userResponse);
      
      // L'API retourne un tableau, prendre le premier utilisateur
      if (Array.isArray(userResponse) && userResponse.length > 0) {
        this.currentUser = userResponse[0];
        console.log('Utilisateur chargé avec succès:', this.currentUser);
      } else if (typeof userResponse === 'object' && userResponse !== null) {
        // Si c'est déjà un objet (pas un tableau)
        this.currentUser = userResponse;
        console.log('Utilisateur chargé avec succès:', this.currentUser);
      } else {
        console.log('Aucun utilisateur trouvé dans la réponse');
        this.currentUser = null;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur connecté:', error);
      // Fallback: essayer de récupérer depuis le localStorage
      this.currentUser = this.getUserFromLocalStorage();
      if (this.currentUser) {
        console.log('Utilisateur récupéré depuis localStorage:', this.currentUser);
      } else {
        console.log('Aucun utilisateur trouvé');
        this.currentUser = null;
      }
    }
  }

  private getUserFromLocalStorage(): any {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération depuis localStorage:', error);
      return null;
    }
  }

  async loadMelange(id: number): Promise<void> {
    this.melange = await this.melangeService.getById(id);
    this.updateAvailableGisements();
    this.patchForm();
  }

  initializeNewMelange(): void {
    this.melange = {
      nom: '',
      date_creation: new Date().toISOString().split('T')[0],
      reference_produit: '',
      plateforme: null,
      fournisseur: '',
      producteur: '',
      couverture_vegetale: null,
      periode_melange: '',
      date_semis: new Date().toISOString().split('T')[0],
      references_analyses: null,
      etat: MelangeEtat.COMPOSITION,
      ordre_conformite: null,
      consignes_melange: null,
      controle_1: null,
      controle_2: null,
      fiche_technique: null,
      ingredients: [],
      gisements: [],
      amendements:  []
     
    };
    this.updateAvailableGisements();
    this.patchForm();
  }

  updateAvailableGisements(): void {
    if (!this.melange) return;
    const usedGisementIds = this.melange.ingredients?.map(i => i.gisement) || [];
    this.availableGisements = this.gisements.filter(g => !usedGisementIds.includes(g.id));
  }

  patchForm(): void {
    if (!this.melange) return;
    this.melangeForm.patchValue({
      nom: this.melange.nom,
      plateforme: this.melange.plateforme,
      fournisseur: this.melange.fournisseur,
      producteur: this.melange.producteur,
      couverture_vegetale: this.melange.couverture_vegetale,
      periode_melange: this.melange.periode_melange,
      date_semis: this.melange.date_semis,
      references_analyses: this.melange.references_analyses,
      ordre_conformite: this.melange.ordre_conformite,
      consignes_melange: this.melange.consignes_melange,
      controle_1: this.melange.controle_1,
      controle_2: this.melange.controle_2,
      fiche_technique: this.melange.fiche_technique
    });
  }

  getVisibleFieldName(): string | null {
    switch (this.melange.etat) {
      case MelangeEtat.CONFORMITE:
        return 'ordre_conformite';
      case MelangeEtat.CONSIGNE:
        return 'consignes_melange';
      case MelangeEtat.CONTROLE_1:
        return 'controle_1';
      // case MelangeEtat.CONTROLE_2:
      //   return 'controle_2';
      case MelangeEtat.VALIDATION:
        return 'fiche_technique';
      default:
        return null;
    }
  }

  isFieldVisible(fieldName: string): boolean {
    return this.getVisibleFieldName() === fieldName;
  }

  getTacheMessage(): string {
    switch (this.melange.etat) {
      case MelangeEtat.COMPOSITION:
        return 'Veuillez composer le mélange avec les gisements.';
      case MelangeEtat.CONFORMITE:
        return 'Veuillez renseigner un ordre de fabrication.';
      case MelangeEtat.CONSIGNE:
        return 'Veuillez fournir les consignes de mélange et stockage.';
      case MelangeEtat.CONTROLE_1:
        return 'Un contrôle de réduction +1 et +2 mois est requis.';
      case MelangeEtat.CONTROLE_2:
        return 'Fiche produit obligatoire.';
      case MelangeEtat.VALIDATION:
        return 'Fiche technique obligatoire.';
      default:
        return '';
    }
  }

  // Helper methods
  getEtatLabel(etat: MelangeEtat): string {
    return this.melangeService.getEtatLabel(etat);
  }

  getEtatColor(etat: MelangeEtat): string {
    return this.melangeService.getEtatColor(etat);
  }

  getTacheActuelle(etat: MelangeEtat): string {
    return this.melangeService.getTacheActuelle(etat);
  }

  getProgressPercentage(etat: MelangeEtat): number {
    return (etat / 6) * 100;
  }

  generateFicheTechnique(): string {
    const formData = this.melangeForm.value;
    let ficheTechnique = '';
    
    // Ajouter les spécifications techniques (étape 6) - seulement si c'est du nouveau contenu
    if (formData.fiche_technique && formData.fiche_technique.trim() !== '') {
      // Vérifier que ce n'est pas déjà le résumé complet
      if (!formData.fiche_technique.includes('SPÉCIFICATIONS TECHNIQUES:') && 
          !formData.fiche_technique.includes('NORMES DE CONFORMITÉ:') &&
          !formData.fiche_technique.includes('CONDITIONS D\'UTILISATION:') &&
          !formData.fiche_technique.includes('CONTRÔLE QUALITÉ')) {
        ficheTechnique += `SPÉCIFICATIONS TECHNIQUES:\n${formData.fiche_technique}\n\n`;
      }
    }
    
    // Ajouter les normes de conformité (étape 2)
    if (formData.ordre_conformite && formData.ordre_conformite.trim() !== '') {
      ficheTechnique += `NORMES DE CONFORMITÉ:\n${formData.ordre_conformite}\n\n`;
    }
    
    // Ajouter les conditions d'utilisation (étape 3)
    if (formData.consignes_melange && formData.consignes_melange.trim() !== '') {
      ficheTechnique += `CONDITIONS D'UTILISATION:\n${formData.consignes_melange}\n\n`;
    }
    
    // Ajouter les contrôles qualité (étapes 4 et 5)
    if (formData.controle_1 && formData.controle_1.trim() !== '') {
      ficheTechnique += `CONTRÔLE QUALITÉ +1 à 8MOIS:\n${formData.controle_1}\n\n`;
    }
    
    if (formData.controle_2 && formData.controle_2.trim() !== '') {
      ficheTechnique += `CONTRÔLE QUALITÉ Établissement de la fiche produit:\n${formData.controle_2}\n\n`;
    }
    
    // Ajouter la conclusion (étape 6 finale) - seulement le contenu de conclusion, pas le résumé complet
    const conclusionElement = document.getElementById('conclusion_validation') as HTMLTextAreaElement;
    if (conclusionElement && conclusionElement.value.trim() !== '') {
      // Vérifier que le contenu de conclusion ne contient pas déjà le résumé complet
      const conclusionValue = conclusionElement.value.trim();
      if (!conclusionValue.includes('SPÉCIFICATIONS TECHNIQUES:') && 
          !conclusionValue.includes('NORMES DE CONFORMITÉ:') &&
          !conclusionValue.includes('CONDITIONS D\'UTILISATION:') &&
          !conclusionValue.includes('CONTRÔLE QUALITÉ')) {
        ficheTechnique += `CONCLUSION ET VALIDATION:\n${conclusionValue}\n\n`;
      }
    }
    
    return ficheTechnique.trim();
  }

  getGisementName(gisementId: number): string {
    const gisement = this.gisements.find(g => g.id === gisementId);
    return gisement?.nom || 'Gisement inconnu';
  }

  getPlateformeName(plateformeId: number | null | undefined): string {
    if (!plateformeId) return 'Non spécifiée';
    const plateforme = this.plateformes.find(p => p.id === plateformeId);
    return plateforme?.nom || 'Plateforme inconnue';
  }

  getChantierName(chantierId: number | null | undefined): string {
    if (!chantierId) return 'Non spécifié';
    const chantier = this.chantiers.find(c => c.id === chantierId);
    return chantier?.nom || 'Chantier inconnu';
  }

  getCurrentUserName(): string {
    console.log('getCurrentUserName appelé, currentUser:', this.currentUser);
    if (!this.currentUser) return 'Utilisateur non connecté';
    // L'utilisateur a username, email, role mais pas first_name/last_name
    return this.currentUser.username || this.currentUser.email || 'Utilisateur inconnu';
  }

  getCurrentUserCompany(): string {
    if (!this.currentUser) return 'Non spécifiée';
    return this.currentUser.company_name || 'Non spécifiée';
  }

  getCurrentUserRole(): string {
    if (!this.currentUser) return 'Non spécifié';
    return this.currentUser.role || 'Non spécifié';
  }

  getDisplayName(): string {
    // Priorité à la valeur du formulaire si elle a été modifiée
    const formName = this.melangeForm.get('nom')?.value;
    if (formName && formName.trim() !== '') {
      return formName.trim();
    }
    
    // Sinon utiliser le nom du mélange
    return this.melange?.nom || 'Mélange sans nom';
  }

  getTotalPercentage(): number {
    if (!this.melange?.ingredients) return 0;
    return this.melange.ingredients.reduce((sum, ing) => sum + (Number(ing.pourcentage) || 0), 0);
  }

  getTotalSelectedPercentage(): number {
    return this.selectedGisements.reduce((sum, s) => sum + (Number(s.pourcentage) || 0), 0);
  }

  // Retourne le total global (gisements + amendements)
  getTotalCompositionPercentage(): number {
    const totalGisement = (this.melange.ingredients || []).reduce((sum, ing) => sum + (Number(ing.pourcentage) || 0), 0);
    const totalAmendement = (this.melange.amendements || []).reduce((sum, am) => sum + (Number(am.pourcentage) || 0), 0);
    return totalGisement + totalAmendement;
  }

  // Retourne le nom d'un amendement à partir de son id
  getAmendementName(amendementId: number): string {
    const amend = this.availableAmendements.find(a => a.id === amendementId);
    return amend ? amend.nom : 'Amendement #' + amendementId;
  }

  // Navigation methods
  async nextStep(): Promise<void> {
    if (!this.melange?.id || this.melange.etat >= 6) return;
    try {
      // Si une intervention utilisateur a été saisie, créer un planning
      if (this.nouvelleIntervention.date && this.nouvelleIntervention.objet) {
        // Construction du planning à partir de l'intervention
        const planning = {
          id: 0,
          titre: this.nouvelleIntervention.objet,
          responsable: this.currentUser?.nom || '',
          date_debut: this.nouvelleIntervention.date,
          duree_jours: 1,
          statut: 'planned',
          melange: this.melange.id,
          melange_nom: this.melange.nom
        };
        try {
          await this.planningService.createPlanning(planning);
          // Ajouter à la liste locale si besoin
          this.interventions.push({ ...this.nouvelleIntervention });
          this.nouvelleIntervention = { date: '', objet: '' };
        } catch (err) {
          console.error('Erreur lors de la création du planning:', err);
        }
      }
      await this.melangeService.updateEtat(this.melange.id, this.melange.etat + 1);
      await this.loadMelange(this.melange.id);
    } catch (err) {
      console.error('Erreur lors du passage à l\'étape suivante:', err);
    }
  }

  async previousStep(): Promise<void> {
    if (!this.melange?.id || this.melange.etat <= 1) return;
    try {
      await this.melangeService.updateEtat(this.melange.id, this.melange.etat - 1);
      await this.loadMelange(this.melange.id);
    } catch (err) {
      console.error('Erreur lors du retour à l\'étape précédente:', err);
    }
  }

  async saveMelange(): Promise<void> {
    try {
      if (this.melangeForm.invalid) {
        console.error('Formulaire invalide');
        console.error('Erreurs de validation:', this.melangeForm.errors);
        console.error('Statut des champs:', {
          fournisseur: this.melangeForm.get('fournisseur')?.errors,
          periode_melange: this.melangeForm.get('periode_melange')?.errors,
          date_semis: this.melangeForm.get('date_semis')?.errors
        });
        return;
      }

      const formData = this.melangeForm.value;
      console.log('Données du formulaire à sauvegarder:', formData);
      
      // Vérifier que les champs requis ne sont pas vides
      if (!formData.fournisseur || formData.fournisseur.trim() === '') {
        console.error('Le fournisseur est requis');
        this.error = 'Le fournisseur est requis';
        return;
      }
      
      if (!formData.periode_melange || formData.periode_melange.trim() === '') {
        console.error('La période de mélange est requise');
        this.error = 'La période de mélange est requise';
        return;
      }
      
      if (!formData.date_semis) {
        console.error('La date de semis est requise');
        this.error = 'La date de semis est requise';
        return;
      }

      console.log('Valeurs spécifiques:');
      console.log('- fournisseur:', formData.fournisseur);
      console.log('- periode_melange:', formData.periode_melange);
      console.log('- date_semis:', formData.date_semis);

      // Préparer les données pour l'API
      let melangeData: any = {
        ...formData,
        plateforme: formData.plateforme ? parseInt(formData.plateforme) : null
      };

      // Pour les mélanges existants, ne pas envoyer les champs vides
      if (this.melange.id) {
        melangeData = {};
        
        // Ajouter seulement les champs non vides
        if (formData.nom && formData.nom.trim() !== '') {
          melangeData.nom = formData.nom;
        }
        if (formData.plateforme) {
          melangeData.plateforme = parseInt(formData.plateforme);
        }
        if (formData.fournisseur && formData.fournisseur.trim() !== '') {
          melangeData.fournisseur = formData.fournisseur;
        }
        if (formData.couverture_vegetale && formData.couverture_vegetale.trim() !== '') {
          melangeData.couverture_vegetale = formData.couverture_vegetale;
        }
        if (formData.periode_melange && formData.periode_melange.trim() !== '') {
          melangeData.periode_melange = formData.periode_melange;
        }
        if (formData.date_semis && formData.date_semis.trim() !== '') {
          melangeData.date_semis = formData.date_semis;
        }
        if (formData.references_analyses && formData.references_analyses.trim() !== '') {
          melangeData.references_analyses = formData.references_analyses;
        }
        // Ne pas inclure les champs de fichiers ici - ils sont gérés séparément
        // ordre_conformite, consignes_melange, controle_1, controle_2 sont des FileField
        // fiche_technique est généré automatiquement
      } else {
        // Pour les nouveaux mélanges, inclure seulement les champs nécessaires pour la création
        melangeData = {
          // Ne pas envoyer de nom par défaut, laisser Django le générer automatiquement
          plateforme: formData.plateforme ? parseInt(formData.plateforme) : null,
          fournisseur: formData.fournisseur,
          producteur: formData.producteur,
          couverture_vegetale: formData.couverture_vegetale || null,
          periode_melange: formData.periode_melange,
          date_semis: formData.date_semis,
          references_analyses: formData.references_analyses || null,
          ingredients: this.melange.ingredients || [] // Toujours inclure ingredients, même vide
        };
        
        // Ajouter le nom seulement s'il a été explicitement saisi par l'utilisateur
        if (formData.nom && formData.nom.trim() !== '') {
          melangeData.nom = formData.nom.trim();
        }
        // Si le nom est vide, ne pas l'envoyer du tout pour que Django le génère
      }

      console.log('Données finales envoyées à l\'API:', melangeData);

      // Déterminer si c'est une création ou une mise à jour
      const isCreating = !this.melange.id || this.isNew;
      console.log('Mode création:', isCreating, 'melange.id:', this.melange.id, 'isNew:', this.isNew);

      if (isCreating) {
        // Créer un nouveau mélange
        console.log('Création d\'un nouveau mélange:', melangeData);
        console.log('Avant création - this.melange:', this.melange);
        this.melange = await this.melangeService.create(melangeData);
        this.isNew = false;
        console.log('Mélange créé avec succès:', this.melange);
        console.log('État du mélange créé:', this.melange.etat);
        console.log('ID du mélange créé:', this.melange.id);
        
        // Rediriger vers la page de détail du mélange créé
        if (this.melange.id) {
        this.router.navigate(['/melanges', this.melange.id]);
        }
      } else {
        // Mettre à jour un mélange existant
        if (this.melange.id) {
        console.log('Mise à jour du mélange:', this.melange.id, melangeData);
        this.melange = await this.melangeService.update(this.melange.id, melangeData);
        console.log('Mélange mis à jour avec succès:', this.melange);
        console.log('État du mélange mis à jour:', this.melange.etat);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.error = 'Erreur lors de la sauvegarde du mélange';
    }
  }

  async saveCurrentStepData(): Promise<any> {
    const updateData: any = {};
    
    // Traiter les fichiers uploadés selon l'étape actuelle
    switch (this.melange.etat) {
      case MelangeEtat.CONFORMITE:
        if (this.uploadedFiles['ordre_conformite']) {
          // Envoyer le fichier directement au backend Django
          updateData.ordre_conformite = this.uploadedFiles['ordre_conformite'];
        }
        break;
        
      case MelangeEtat.CONSIGNE:
        if (this.uploadedFiles['consignes_melange']) {
          // Envoyer le fichier directement au backend Django
          updateData.consignes_melange = this.uploadedFiles['consignes_melange'];
        }
        break;
        
      case MelangeEtat.CONTROLE_1:
        if (this.uploadedFiles['controle_1']) {
          // Envoyer le fichier directement au backend Django
          updateData.controle_1 = this.uploadedFiles['controle_1'];
        }
        break;
        
      case MelangeEtat.CONTROLE_2:
        if (this.uploadedFiles['controle_2']) {
          // Envoyer le fichier directement au backend Django
          updateData.controle_2 = this.uploadedFiles['controle_2'];
        }
        break;
        
      case MelangeEtat.VALIDATION:
        // Pour l'étape de validation, on traite fiche_technique comme un fichier uploadé
        if (this.uploadedFiles['fiche_technique']) {
          // Envoyer le fichier directement au backend Django
          updateData.fiche_technique = this.uploadedFiles['fiche_technique'];
        }
        break;
    }
    
    return updateData;
  }

  async saveAndNextStep(): Promise<void> {
    try {
      // --- CONTRÔLE FICHIER REQUIS PAR ÉTAPE ---
      let docField = '';
      let docLabel = '';
      switch (this.melange.etat) {
        case 2:
          docField = 'ordre_conformite';
          docLabel = 'ordre de fabrication';
          break;
        case 3:
          docField = 'consignes_melange';
          docLabel = 'consignes de mélange';
          break;
        case 4:
          docField = 'controle_1';
          docLabel = 'contrôle qualité +1 mois';
          break;
        case 5:
          docField = 'controle_2';
          docLabel = 'contrôle qualité +2 mois';
          break;
        case 6:
          docField = 'fiche_technique';
          docLabel = 'fiche technique';
          break;
      }
      if (docField) {
        const fileUploaded = !!this.uploadedFiles[docField];
        const fileInBase = !!(this.melange as any)[docField];
        if (!fileUploaded && !fileInBase) {
          this.error = 'Vous devez ajouter un fichier pour valider cette étape.';
          return;
        }
      }

      // --- FIN CONTRÔLE FICHIER REQUIS ---

      // Upload des fichiers si présents
      const updateData: any = {};
      switch (this.melange.etat) {
        case 2:
          if (this.uploadedFiles['ordre_conformite']) {
            const fileUrl = await this.uploadFile(this.uploadedFiles['ordre_conformite'], 'ordre_conformite');
            if (fileUrl) {
              updateData.ordre_conformite = fileUrl;
              (this.melange as any)['ordre_conformite'] = fileUrl;
            }
          }
          break;
        case 3:
          if (this.uploadedFiles['consignes_melange']) {
            const fileUrl = await this.uploadFile(this.uploadedFiles['consignes_melange'], 'consignes_melange');
            if (fileUrl) {
              updateData.consignes_melange = fileUrl;
              (this.melange as any)['consignes_melange'] = fileUrl;
            }
          }
          break;
        case 4:
          if (this.uploadedFiles['controle_1']) {
            const fileUrl = await this.uploadFile(this.uploadedFiles['controle_1'], 'controle_1');
            if (fileUrl) {
              updateData.controle_1 = fileUrl;
              (this.melange as any)['controle_1'] = fileUrl;
            }
          }
          break;
        case 5:
          if (this.uploadedFiles['controle_2']) {
            const fileUrl = await this.uploadFile(this.uploadedFiles['controle_2'], 'controle_2');
            if (fileUrl) {
              updateData.controle_2 = fileUrl;
              (this.melange as any)['controle_2'] = fileUrl;
            }
          }
          break;
        case 6:
          if (this.uploadedFiles['fiche_technique']) {
            const fileUrl = await this.uploadFile(this.uploadedFiles['fiche_technique'], 'fiche_technique');
            if (fileUrl) {
              updateData.fiche_technique = fileUrl;
              (this.melange as any)['fiche_technique'] = fileUrl;
            }
          }
          break;
      }

      // D'abord sauvegarder le mélange avec les données actuelles
      await this.saveMelange();

      // Ensuite sauvegarder les données spécifiques de l'étape actuelle
      if (this.melange?.id && !this.isNew) {
        try {
          const updateDataStep = await this.saveCurrentStepData();
          if (Object.keys(updateDataStep).length > 0) {
            const hasFiles = Object.values(updateDataStep).some(value => value instanceof File);
            if (hasFiles) {
              this.melange = await this.melangeService.patchWithFiles(this.melange.id, updateDataStep);
            } else {
              this.melange = await this.melangeService.patch(this.melange.id, updateDataStep);
            }
          }
        } catch (stepError: any) {
          this.error = 'Erreur lors de la sauvegarde de l\'étape. Veuillez réessayer.';
          throw stepError;
        }
      }

      // Passage à l'étape suivante
      if (this.melange?.id && this.melange.etat === 1) {
        await this.melangeService.updateEtat(this.melange.id, 2);
        if (this.melange.id) {
          await this.loadMelange(this.melange.id);
        }
      } else if (this.melange?.id) {
        await this.nextStep();
      }

      if (this.isWorkflowCompleted()) {
        this.disableEditMode();
        this.updateFormControlsState();
      }
    } catch (error) {
      this.error = 'Erreur lors de la sauvegarde et passage à l\'étape suivante';
    }
  }

  // Ingredient management methods
  editIngredient(ingredient: MelangeIngredient): void {
    this.editingIngredient = ingredient;
    this.ingredientForm.patchValue({
      gisement: ingredient.gisement,
      pourcentage: ingredient.pourcentage
    });
    this.showIngredientForm = true;
  }

  async deleteIngredient(ingredientId: number): Promise<void> {
    if (!ingredientId || ingredientId === undefined) {
      console.error('ID d\'ingrédient invalide:', ingredientId);
      return;
    }
    
    if (!this.melange?.id) {
      console.error('Aucun mélange chargé');
      return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ingrédient ?')) return;
    
    try {
      // Supprimer l'ingrédient de la liste locale
      const updatedIngredients = this.melange.ingredients.filter(
        ing => ing.id !== ingredientId
      );
      
      // Mettre à jour le mélange via l'API
      await this.melangeService.patch(this.melange.id, {
        ingredients: updatedIngredients
      });
      
      // Recharger le mélange pour avoir les données à jour
        await this.loadMelange(this.melange.id);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  }

  resetIngredientForm(): void {
    this.ingredientForm.reset();
    this.editingIngredient = null;
    this.showIngredientForm = false;
  }

  // Multi-selection methods
  isGisementSelected(gisementId: number): boolean {
    return this.selectedGisements.some(s => s.gisementId === gisementId);
  }

  onGisementCheckboxChange(gisementId: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedGisements.push({ gisementId, pourcentage: 0 });
    } else {
      this.selectedGisements = this.selectedGisements.filter(s => s.gisementId !== gisementId);
    }
  }

  getSelectedGisementName(gisementId: number): string {
    const gisement = this.gisements.find(g => g.id === gisementId);
    return gisement?.nom || 'Gisement inconnu';
  }

  onPercentageChange(gisementId: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const selection = this.selectedGisements.find(s => s.gisementId === gisementId);
    if (selection) {
      const value = parseFloat(target.value);
      selection.pourcentage = isNaN(value) ? 0 : value;
    }
  }

  removeGisementFromSelection(gisementId: number): void {
    this.selectedGisements = this.selectedGisements.filter(s => s.gisementId !== gisementId);
  }

  async saveMultipleIngredients(): Promise<void> {
    if (this.selectedGisements.length === 0) return;
    
    try {
      // Convertir selectedGisements en format ingredients
      const ingredients: MelangeIngredientInput[] = this.selectedGisements.map(selection => ({
          gisement: selection.gisementId,
          pourcentage: selection.pourcentage
      }));
      
      if (this.melange?.id) {
        // Pour un mélange existant, utiliser l'API
        await this.melangeService.patch(this.melange.id, {
          ingredients: ingredients
        } as any);
        
        await this.loadMelange(this.melange.id);
      } else {
        // Pour un nouveau mélange, ajouter localement
        // Utiliser le type MelangeIngredientInput pour les nouveaux mélanges
        this.melange.ingredients = [...(this.melange.ingredients || []), ...ingredients] as any;
        this.updateAvailableGisements();
      }
      
      this.selectedGisements = [];
      this.showIngredientForm = false;
    } catch (err) {
      console.error('Erreur lors de l\'ajout des ingrédients:', err);
    }
  }

  // Gestion sélection amendements
  isAmendementSelected(amendementId: number): boolean {
    return this.selectedAmendements.some(s => s.amendementId === amendementId);
  }
  onAmendementCheckboxChange(amendementId: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedAmendements.push({ amendementId, pourcentage: 0 });
    } else {
      this.selectedAmendements = this.selectedAmendements.filter(s => s.amendementId !== amendementId);
    }
  }
  removeAmendementFromSelection(amendementId: number): void {
    this.selectedAmendements = this.selectedAmendements.filter(s => s.amendementId !== amendementId);
  }
  onAmendementPercentageChange(amendementId: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const selection = this.selectedAmendements.find(s => s.amendementId === amendementId);
    if (selection) {
      const value = parseFloat(target.value);
      selection.pourcentage = isNaN(value) ? 0 : value;
    }
  }
  getTotalSelectedAmendementPercentage(): number {
    return this.selectedAmendements.reduce((sum, s) => sum + (s.pourcentage || 0), 0);
  }
  async saveMultipleAmendements(): Promise<void> {
    if (this.selectedAmendements.length === 0) return;
    try {
      // Format pour l'API (conforme au serializer Django)
      const amendements = this.selectedAmendements.map(selection => ({
        amendementOrganique: selection.amendementId, // camelCase attendu par l'API
        pourcentage: selection.pourcentage,
        melange: this.melange.id
      }));
      if (this.melange?.id) {
        // Utiliser addAmendement pour chaque amendement sélectionné
        await Promise.all(amendements
          .filter(a => typeof a.melange === 'number')
          .map(a => this.melangeService.addAmendement({
            amendementOrganique: a.amendementOrganique,
            pourcentage: a.pourcentage,
            melange: a.melange as number
          })));
        await this.loadMelange(this.melange.id);
      } else {
        this.melange.amendements = [...(this.melange.amendements || []), ...amendements] as any;
      }
      this.selectedAmendements = [];
      this.showAmendementForm = false;
    } catch (err) {
      console.error('Erreur lors de l\'ajout des amendements:', err);
    }
  }

  async deleteAmendement(am: any): Promise<void> {
    if (!am || !am.id) return;
    if (!confirm('Supprimer cet amendement ?')) return;
    try {
      await this.melangeService.deleteAmendement(am.id);
      if (this.melange?.id) {
        await this.loadMelange(this.melange.id);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'amendement:', err);
    }
  }

  isWorkflowCompleted(): boolean {
    return this.melange?.etat === 6;
  }

  // Méthodes pour contrôler le mode d'édition
  enableEditMode(): void {
    this.isEditMode = true;
    this.updateFormControlsState();
  }

  disableEditMode(): void {
    this.isEditMode = false;
    this.updateFormControlsState();
  }

  isFormDisabled(): boolean {
    // Désactiver les formulaires si le workflow est terminé ET qu'on n'est pas en mode édition
    return this.isWorkflowCompleted() && !this.isEditMode;
  }

  // Méthode pour activer/désactiver les contrôles de formulaire
  updateFormControlsState(): void {
    const shouldDisable = this.isFormDisabled();
    
    if (shouldDisable) {
      this.melangeForm.disable();
    } else {
      this.melangeForm.enable();
    }
  }

  // Méthodes pour la gestion des fichiers
  onFileSelected(event: Event, fieldName: string): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // Validation du fichier
      const error = this.validateFile(file);
      if (error) {
        this.fileErrors[fieldName] = error;
        target.value = '';
        return;
      }
      
      // Supprimer l'erreur précédente
      delete this.fileErrors[fieldName];
      
      // Ajouter le fichier
      this.uploadedFiles[fieldName] = file;
      
      console.log(`Fichier sélectionné pour ${fieldName}:`, file.name);
    }
  }

  validateFile(file: File): string | null {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (file.size > maxSize) {
      return 'Le fichier est trop volumineux. Taille maximale: 10MB';
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Type de fichier non autorisé. Formats acceptés: PDF, DOC, DOCX, TXT, XLS, XLSX';
    }
    
    return null;
  }

  removeFile(fieldName: string): void {
    delete this.uploadedFiles[fieldName];
    delete this.fileErrors[fieldName];
    
    // Réinitialiser l'input file
    const fileInput = document.getElementById(`${fieldName}_file`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'bi-file-pdf';
      case 'doc':
      case 'docx': return 'bi-file-word';
      case 'txt': return 'bi-file-text';
      case 'xls':
      case 'xlsx': return 'bi-file-excel';
      default: return 'bi-file-earmark';
    }
  }

  async uploadFile(file: File, fieldName: string): Promise<string | null> {
    try {
      // Ici, vous devrez implémenter la logique d'upload vers votre backend
      // Pour l'instant, on simule un upload réussi
      console.log(`Upload du fichier ${file.name} pour ${fieldName}`);
      
      // Simuler un délai d'upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Retourner l'URL du fichier uploadé (à adapter selon votre backend)
      return `uploads/${fieldName}/${file.name}`;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      return null;
    }
  }

  async deleteIngredientByGisement(gisementId: number): Promise<void> {
    if (!gisementId || gisementId === undefined) {
      console.error('ID de gisement invalide:', gisementId);
      return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ingrédient ?')) return;
    
    try {
      if (this.melange?.id) {
        // Pour un mélange existant, utiliser l'API
        const updatedIngredients = this.melange.ingredients.filter(
          ing => ing.gisement !== gisementId
        );
        
        await this.melangeService.patch(this.melange.id, {
          ingredients: updatedIngredients
        });
        
        await this.loadMelange(this.melange.id);
      } else {
        // Pour un nouveau mélange, supprimer localement
        this.melange.ingredients = this.melange.ingredients.filter(
          ing => ing.gisement !== gisementId
        );
        this.updateAvailableGisements();
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  }

  getFicheTechniqueResume(): string {
    // Génère le résumé complet avec toutes les informations du mélange
    const lines: string[] = [];
    
    // === INFORMATIONS DU MÉLANGE ===
    lines.push('=== FICHE TECHNIQUE DU MÉLANGE ===');
    lines.push('');
    
    // Informations de base
    lines.push(`Référence: ${this.melange.reference_produit || 'Non définie'}`);
    lines.push(`Nom: ${this.melange.nom || 'Non défini'}`);
    lines.push(`Plateforme: ${this.getPlateformeName(this.melange.plateforme)}`);
    lines.push(`Fournisseur: ${this.melange.fournisseur || 'Non défini'}`);
    lines.push(`Période de mélange: ${this.melange.periode_melange || 'Non définie'}`);
    lines.push(`Date de semis: ${this.melange.date_semis || 'Non définie'}`);
    lines.push(`Couverture végétale: ${this.melange.couverture_vegetale || 'Non définie'}`);
    lines.push(`Références d'analyses: ${this.melange.references_analyses || 'Non définies'}`);
    lines.push('');
    
    // Composition du mélange
    lines.push('=== COMPOSITION DU MÉLANGE ===');
    if (this.melange.ingredients && this.melange.ingredients.length > 0) {
      this.melange.ingredients.forEach(ingredient => {
        const gisementName = this.getGisementName(ingredient.gisement);
        lines.push(`${gisementName}: ${ingredient.pourcentage}%`);
      });
      lines.push(`Total: ${this.getTotalPercentage()}%`);
    } else {
      lines.push('Aucun ingrédient défini');
    }
    lines.push('');
    
    // === DOCUMENTS UPLOADÉS ===
    lines.push('=== DOCUMENTS UPLOADÉS ===');
    lines.push('');
    
    lines.push('NORMES DE CONFORMITÉ:');
    if (this.melange.ordre_conformite) {
      lines.push(this.getFileUrl(this.melange.ordre_conformite));
    } else {
      lines.push('Non renseigné');
    }
    lines.push('');
    
    lines.push("CONDITIONS D'UTILISATION:");
    if (this.melange.consignes_melange) {
      lines.push(this.getFileUrl(this.melange.consignes_melange));
    } else {
      lines.push('Non renseigné');
    }
    lines.push('');
    
    lines.push('CONTRÔLE QUALITÉ +1 MOIS:');
    if (this.melange.controle_1) {
      lines.push(this.getFileUrl(this.melange.controle_1));
    } else {
      lines.push('Non renseigné');
    }
    lines.push('');
    
    lines.push('CONTRÔLE QUALITÉ +2 MOIS:');
    if (this.melange.controle_2) {
      lines.push(this.getFileUrl(this.melange.controle_2));
    } else {
      lines.push('Non renseigné');
    }
    lines.push('');
    
    lines.push('FICHE TECHNIQUE FINALE:');
    if (this.melange.fiche_technique) {
      lines.push(this.getFileUrl(this.melange.fiche_technique));
    } else {
      lines.push('Non renseigné');
    }
    
    return lines.join('\n');
  }

  getFileUrl(file: string): string {
    // Si le champ est déjà une URL absolue, retourne tel quel
    if (file.startsWith('http')) return file;
    // Sinon, construit l'URL complète
    return `${window.location.origin}/media/${file}`;
  }

  getFicheTechniqueResumeHtml(): string {
    // Génère le résumé complet avec du HTML formaté et des liens cliquables
    const lines: string[] = [];
    
    // === INFORMATIONS DU MÉLANGE ===
    lines.push('<div class="fiche-section">');
    lines.push('<h4 class="fiche-title text-primary mb-3"><i class="bi bi-info-circle"></i> FICHE TECHNIQUE DU MÉLANGE</h4>');
    
    // Informations de base
    lines.push('<div class="row mb-3">');
    lines.push('<div class="col-md-6">');
    lines.push(`<strong>Référence:</strong> <span class="text-muted">${this.melange.reference_produit || 'Non définie'}</span><br>`);
    lines.push(`<strong>Nom:</strong> <span class="text-muted">${this.melange.nom || 'Non défini'}</span><br>`);
    lines.push(`<strong>Plateforme:</strong> <span class="text-muted">${this.getPlateformeName(this.melange.plateforme)}</span><br>`);
    lines.push(`<strong>Fournisseur:</strong> <span class="text-muted">${this.melange.fournisseur || 'Non défini'}</span>`);
    lines.push('</div>');
    lines.push('<div class="col-md-6">');
    lines.push(`<strong>Période de mélange:</strong> <span class="text-muted">${this.melange.periode_melange || 'Non définie'}</span><br>`);
    lines.push(`<strong>Date de semis:</strong> <span class="text-muted">${this.melange.date_semis || 'Non définie'}</span><br>`);
    lines.push(`<strong>Couverture végétale:</strong> <span class="text-muted">${this.melange.couverture_vegetale || 'Non définie'}</span><br>`);
    lines.push(`<strong>Références d'analyses:</strong> <span class="text-muted">${this.melange.references_analyses || 'Non définies'}</span>`);
    lines.push('</div>');
    lines.push('</div>');
    lines.push('</div>');
    
    // === RESPONSABLE DE LA PLATEFORME ===
    lines.push('<div class="fiche-section">');
    lines.push('<h5 class="fiche-subtitle text-warning mb-3"><i class="bi bi-person-badge"></i> RESPONSABLE DE LA PLATEFORME</h5>');
    lines.push('<div class="row mb-3">');
    lines.push('<div class="col-md-6">');
    lines.push(`<strong>Responsable:</strong> <span class="text-muted">${this.getCurrentUserName()}</span><br>`);
    lines.push(`<strong>Entreprise:</strong> <span class="text-muted">${this.getCurrentUserCompany()}</span><br>`);
    lines.push(`<strong>Rôle:</strong> <span class="badge bg-info">${this.getCurrentUserRole()}</span>`);
    lines.push('</div>');
    lines.push('<div class="col-md-6">');
    lines.push(`<strong>Email:</strong> <span class="text-muted">${this.currentUser?.email || 'Non spécifié'}</span><br>`);
    lines.push(`<strong>Date de validation:</strong> <span class="text-muted">${new Date().toLocaleDateString('fr-FR')}</span><br>`);
    lines.push(`<strong>Statut:</strong> <span class="badge bg-success">Validé</span>`);
    lines.push('</div>');
    lines.push('</div>');
    lines.push('</div>');
    
    // Composition du mélange
    lines.push('<div class="fiche-section">');
    lines.push('<h5 class="fiche-subtitle text-success mb-3"><i class="bi bi-list-ul"></i> COMPOSITION DU MÉLANGE</h5>');
    // Gisements
    if (this.melange.ingredients && this.melange.ingredients.length > 0) {
      lines.push('<div class="table-responsive">');
      lines.push('<table class="table table-sm table-bordered">');
      lines.push('<thead class="table-light">');
      lines.push('<tr><th>Gisement</th><th>Chantier d\'origine</th><th>Pourcentage</th></tr>');
      lines.push('</thead>');
      lines.push('<tbody>');
      this.melange.ingredients.forEach(ingredient => {
        const gisementName = this.getGisementName(ingredient.gisement);
        const gisement = this.gisements.find(g => g.id === ingredient.gisement);
        const chantierName = gisement ? this.getChantierName(gisement.chantier) : 'Chantier inconnu';
        lines.push(`<tr><td>${gisementName}</td><td>${chantierName}</td><td><span class="badge bg-primary">${ingredient.pourcentage}%</span></td></tr>`);
      });
      lines.push('</tbody>');
      lines.push('</table>');
      lines.push('</div>');
      lines.push(`<div class="alert alert-info"><strong>Total gisements: ${this.getTotalPercentage()}%</strong></div>`);
    } else {
      lines.push('<div class="alert alert-warning">Aucun ingrédient défini</div>');
    }
    // Amendements
    if (this.melange.amendements && this.melange.amendements.length > 0) {
      lines.push('<h6 class="mt-4 mb-2"><i class="bi bi-plus-circle"></i> Amendements organiques</h6>');
      lines.push('<div class="table-responsive">');
      lines.push('<table class="table table-sm table-bordered">');
      lines.push('<thead class="table-light">');
      lines.push('<tr><th>Amendement</th><th>Pourcentage</th></tr>');
      lines.push('</thead>');
      lines.push('<tbody>');
      this.melange.amendements.forEach(am => {
  const amendementName = this.getAmendementName((am.amendementOrganique ?? am.id ?? 0));
        lines.push(`<tr><td>${amendementName}</td><td><span class="badge bg-success">${am.pourcentage}%</span></td></tr>`);
      });
      lines.push('</tbody>');
      lines.push('</table>');
      lines.push('</div>');
      lines.push(`<div class="alert alert-info"><strong>Total amendements: ${this.melange.amendements.reduce((sum, am) => sum + (Number(am.pourcentage) || 0), 0)}%</strong></div>`);
    }
    // Total global
    lines.push(`<div class="alert alert-primary mt-2"><strong>Total global (gisements + amendements): ${this.getTotalCompositionPercentage()}%</strong></div>`);
    lines.push('</div>');
    
    // === DOCUMENTS UPLOADÉS ===
    lines.push('<div class="fiche-section">');
    lines.push('<h5 class="fiche-subtitle text-info mb-3"><i class="bi bi-file-earmark-text"></i> DOCUMENTS UPLOADÉS</h5>');
    
    const documents = [
      { title: 'NORMES DE CONFORMITÉ', field: 'ordre_conformite', icon: 'bi-file-pdf' },
      { title: "CONDITIONS D'UTILISATION", field: 'consignes_melange', icon: 'bi-file-word' },
      { title: 'CONTRÔLE QUALITÉ +1 à 8 MOIS', field: 'controle_1', icon: 'bi-file-excel' },
      { title: 'CONTRÔLE QUALITÉ Établissement de la fiche produit', field: 'controle_2', icon: 'bi-file-excel' },
      { title: 'FICHE TECHNIQUE FINALE', field: 'fiche_technique', icon: 'bi-file-text' }
    ];
    
    documents.forEach(doc => {
      const fileUrl = this.melange[doc.field as keyof typeof this.melange] as string;
      lines.push('<div class="document-item mb-2">');
      lines.push(`<strong><i class="bi ${doc.icon}"></i> ${doc.title}:</strong> `);
      if (fileUrl) {
        const fullUrl = this.getFileUrl(fileUrl);
        lines.push(`<a href="${fullUrl}" target="_blank" class="btn btn-sm btn-outline-primary">`);
        lines.push(`<i class="bi bi-download"></i> Voir le document</a>`);
      } else {
        lines.push('<span class="text-muted">Non renseigné</span>');
      }
      lines.push('</div>');
    });
    
    lines.push('</div>');
    
    return lines.join('');
  }

  getSelectedAmendementName(amendementId: number): string {
    const am = this.availableAmendements.find(a => a.id === amendementId);
    return am ? am.nom : 'Amendement inconnu';
  }

  editAmendement(am: any): void {
    this.editingAmendement = { ...am };
    this.showAmendementForm = true;
    this.amendementForm.patchValue({
      amendementOrganique: am.amendementOrganique,
      pourcentage: am.pourcentage
    });
  }

  async saveEditAmendement(): Promise<void> {
    if (!this.editingAmendement) return;
    const id = this.editingAmendement.id;
    const data = {
      pourcentage: this.amendementForm.value.pourcentage
    };
    try {
      await this.melangeService.updateAmendement(id, data);
      await this.loadMelange(this.melange.id!);
      this.editingAmendement = null;
      this.showAmendementForm = false;
    } catch (err) {
      console.error('Erreur lors de la modification de l\'amendement:', err);
    }
  }
}
