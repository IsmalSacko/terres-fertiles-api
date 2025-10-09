

// Interface pour intervention utilisateur (contrôle +1 mois)
interface Intervention {
  date: string;
  objet: string;
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// Pas d'import nécessaire pour l'approche d'impression native
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
export class MelangeDetailComponent implements OnInit, OnDestroy {
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
    this.onFicheTechniqueFinalised();
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

    // Configuration de la sauvegarde automatique
    this.setupAutoSave();
  }

  // === SYSTÈME DE PERSISTANCE AUTOMATIQUE ===
  
  private readonly LOCAL_STORAGE_KEY = 'fiche_technique_brouillon_';
  private readonly DRAFTS_LIST_KEY = 'fiche_technique_brouillons_list';
  private autoSaveInterval?: number;
  public lastSaveTime?: Date;
  public isAutoSaving = false;
  
  // Gestion des versions de brouillons
  public availableDrafts: any[] = [];
  public showDraftsManager = false;

  private setupAutoSave(): void {
    // Sauvegarde automatique toutes les 30 secondes
    this.autoSaveInterval = window.setInterval(() => {
      this.autoSaveDraft();
    }, 30000);

    // Sauvegarde aussi lors des changements du formulaire
    this.melangeForm.valueChanges.subscribe(() => {
      // Debounce pour éviter trop de sauvegardes
      clearTimeout(this.autoSaveInterval);
      this.autoSaveInterval = window.setTimeout(() => {
        this.autoSaveDraft();
      }, 2000);
    });
  }

  private autoSaveDraft(): void {
    if (this.isAutoSaving) return;

    this.isAutoSaving = true;
    try {
      const draftData = this.prepareDraftData();
      this.saveDraftToLocalStorage(draftData);
      this.saveDraftToDatabase(draftData);
      this.lastSaveTime = new Date();
      console.log('📝 Brouillon sauvegardé automatiquement');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde automatique:', error);
    } finally {
      this.isAutoSaving = false;
    }
  }

  private prepareDraftData(): any {
    return {
      id: this.melange?.id || null,
      formData: this.melangeForm.value,
      etat: this.melange?.etat || MelangeEtat.COMPOSITION,
      ingredients: this.melange?.ingredients || [],
      amendements: this.melange?.amendements || [],
      selectedGisements: this.selectedGisements,
      selectedAmendements: this.selectedAmendements,
      uploadedFiles: Object.keys(this.uploadedFiles).reduce((acc, key) => {
        acc[key] = this.uploadedFiles[key].name; // Stocker seulement le nom, pas le fichier
        return acc;
      }, {} as any),
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }

  private saveDraftToLocalStorage(draftData: any): void {
    const key = this.getDraftKey();
    try {
      localStorage.setItem(key, JSON.stringify(draftData));
      this.updateDraftsList(draftData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en localStorage:', error);
    }
  }

  private updateDraftsList(draftData: any): void {
    try {
      let draftsList = this.getDraftsList();
      const key = this.getDraftKey();
      const draftIndex = draftsList.findIndex(d => 
        d.melangeId === (this.melange?.id || 'nouveau') && 
        d.nom === (draftData.formData?.nom || 'Sans nom')
      );

      const draftInfo = {
        melangeId: this.melange?.id || 'nouveau',
        nom: draftData.formData?.nom || 'Sans nom',
        timestamp: draftData.timestamp,
        etat: draftData.etat,
        key: key
      };

      if (draftIndex >= 0) {
        draftsList[draftIndex] = draftInfo;
      } else {
        draftsList.push(draftInfo);
      }

      // Garder seulement les 10 derniers brouillons par mélange
      draftsList = draftsList
        .filter(d => d.melangeId === (this.melange?.id || 'nouveau'))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      localStorage.setItem(this.DRAFTS_LIST_KEY, JSON.stringify(draftsList));
      this.availableDrafts = draftsList;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la liste des brouillons:', error);
    }
  }

  private getDraftsList(): any[] {
    try {
      const draftsStr = localStorage.getItem(this.DRAFTS_LIST_KEY);
      return draftsStr ? JSON.parse(draftsStr) : [];
    } catch (error) {
      console.error('Erreur lors du chargement de la liste des brouillons:', error);
      return [];
    }
  }

  private async saveDraftToDatabase(draftData: any): Promise<void> {
    try {
      if (this.melange?.id && this.melange.etat !== MelangeEtat.VALIDATION) {
        // Sauvegarder en tant que brouillon en base de données
        const updateData = {
          ...draftData.formData,
          is_draft: true,
          draft_timestamp: draftData.timestamp
        };
        await this.melangeService.update(this.melange.id, updateData);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon en BDD:', error);
    }
  }

  private loadDraftFromLocalStorage(): any | null {
    const key = this.getDraftKey();
    try {
      const draftStr = localStorage.getItem(key);
      if (draftStr) {
        return JSON.parse(draftStr);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du brouillon:', error);
    }
    return null;
  }

  private getDraftKey(): string {
    return `${this.LOCAL_STORAGE_KEY}${this.melange?.id || 'nouveau'}`;
  }

  private clearDraft(): void {
    const key = this.getDraftKey();
    localStorage.removeItem(key);
  }

  public getLastSaveInfo(): string {
    if (!this.lastSaveTime) return '';
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - this.lastSaveTime.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Sauvegardé à l\'instant';
    if (diffMinutes === 1) return 'Sauvegardé il y a 1 minute';
    if (diffMinutes < 60) return `Sauvegardé il y a ${diffMinutes} minutes`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return 'Sauvegardé il y a 1 heure';
    return `Sauvegardé il y a ${diffHours} heures`;
  }

  public forceSaveDraft(): void {
    this.autoSaveDraft();
  }

  // === GESTION DES VERSIONS DE BROUILLONS ===

  public loadDraftsForCurrentMelange(): void {
    const allDrafts = this.getDraftsList();
    this.availableDrafts = allDrafts.filter(d => 
      d.melangeId === (this.melange?.id || 'nouveau')
    );
  }

  public toggleDraftsManager(): void {
    this.showDraftsManager = !this.showDraftsManager;
    if (this.showDraftsManager) {
      this.loadDraftsForCurrentMelange();
    }
  }

  public loadSpecificDraft(draftInfo: any): void {
    try {
      const draftData = localStorage.getItem(draftInfo.key);
      if (draftData) {
        const draft = JSON.parse(draftData);
        this.restoreDraft(draft);
        this.showDraftsManager = false;
        console.log('✅ Brouillon spécifique restauré:', draftInfo.timestamp);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du brouillon spécifique:', error);
    }
  }

  public deleteDraft(draftInfo: any, event: Event): void {
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce brouillon ?')) {
      try {
        localStorage.removeItem(draftInfo.key);
        this.loadDraftsForCurrentMelange();
        console.log('🗑️ Brouillon supprimé');
      } catch (error) {
        console.error('Erreur lors de la suppression du brouillon:', error);
      }
    }
  }

  public formatDraftDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // === MÉTHODES POUR LA FICHE TECHNIQUE FINALISÉE ===

  public getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  public getFicheTechniqueUrl(): string {
    // Pour l'instant, ouvrir dans une nouvelle fenêtre avec le contenu HTML
    const content = this.generateFicheTechniqueForPdf();
    const blob = new Blob([content], { type: 'text/html' });
    return window.URL.createObjectURL(blob);
  }

  public openFicheTechniqueInNewTab(): void {
    const content = this.generateFicheTechniqueForPdf();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    }
  }

  public downloadFicheTechniquePdf(): void {
    try {
      // Ouvrir la fiche technique dans une nouvelle fenêtre optimisée pour l'impression
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Veuillez autoriser les pop-ups pour télécharger le PDF');
        return;
      }

      // Injecter le contenu avec des styles optimisés pour l'impression
      const content = this.generatePrintOptimizedContent();
      printWindow.document.write(content);
      printWindow.document.close();

      // Attendre que le contenu soit chargé puis lancer l'impression
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          // Instructions pour l'utilisateur
          setTimeout(() => {
            if (confirm('PDF généré avec succès!\n\nPour sauvegarder:\n1. Cliquez sur "Enregistrer au format PDF" dans la boîte de dialogue d\'impression\n2. Choisissez votre dossier de destination\n\nVoulez-vous fermer cette fenêtre ?')) {
              printWindow.close();
            }
          }, 1000);
        }, 500);
      };

    } catch (error) {
      console.error('❌ Erreur lors de la génération PDF:', error);
      // Fallback: téléchargement HTML
      this.downloadFicheTechniqueHtml();
      alert('Erreur lors de la génération PDF. Téléchargement HTML effectué à la place.');
    }
  }

  private generatePrintOptimizedContent(): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fiche Technique - ${this.melange?.nom || this.melange?.reference_produit}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
        <style>
          /* Styles optimisés pour l'impression PDF */
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              background: white !important;
              color: black !important;
              font-size: 12pt;
              line-height: 1.4;
            }
            .fiche-container {
              box-shadow: none !important;
              border: none !important;
            }
            .fiche-header {
              background: #3b82f6 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: white !important;
            }
            .info-section, .responsable-section, .documents-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .composition-table {
              break-inside: avoid;
            }
            .percentage-badge, .btn-document {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          /* Styles pour l'écran (identiques à l'original) */
          ${this.getOriginalStyles()}
        </style>
      </head>
      <body>
        <div class="fiche-container">
          <div class="fiche-header">
            <i class="bi bi-file-earmark-text" style="font-size: 3rem; margin-bottom: 15px;"></i>
            <h1 class="fiche-title">FICHE TECHNIQUE DU MÉLANGE</h1>
          </div>
          <div class="fiche-content">
            ${this.getFicheTechniqueResumeHtml()}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getOriginalStyles(): string {
    // Retourner les styles CSS complets pour maintenir l'apparence
    return `
      body { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 20px;
      }
      .fiche-container {
        background: white;
        border-radius: 15px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        max-width: 1000px;
        margin: 0 auto;
      }
      .fiche-header {
        background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .fiche-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 10px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      .fiche-content {
        padding: 40px;
      }
      .info-section {
        background: #f8fafc;
        border-radius: 10px;
        padding: 25px;
        margin-bottom: 30px;
        border-left: 5px solid #3b82f6;
      }
      .section-title {
        color: #1e40af;
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
      }
      .info-item {
        display: flex;
        flex-direction: column;
      }
      .info-label {
        font-weight: 600;
        color: #374151;
        font-size: 0.9rem;
        margin-bottom: 5px;
      }
      .info-value {
        color: #1f2937;
        font-size: 1rem;
        background: white;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }
      .composition-table {
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      }
      .table {
        margin-bottom: 0;
      }
      .table thead th {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        padding: 15px;
        font-weight: 600;
      }
      .table tbody td {
        padding: 12px 15px;
        border-color: #e5e7eb;
      }
      .percentage-badge {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .total-row {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        font-weight: 600;
      }
      .documents-section {
        background: #f1f5f9;
        border-radius: 10px;
        padding: 25px;
        border-left: 5px solid #06b6d4;
      }
      .document-item {
        background: white;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
      .btn-document {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .responsable-section {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-radius: 10px;
        padding: 25px;
        border-left: 5px solid #f59e0b;
      }
    `;
  }

  private downloadFicheTechniqueHtml(): void {
    // Méthode de fallback pour télécharger en HTML
    try {
      const ficheTechniqueContent = this.generateFicheTechniqueForPdf();
      const blob = new Blob([ficheTechniqueContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fiche-technique-${this.melange?.nom || 'melange'}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement HTML:', error);
      alert('Erreur lors du téléchargement de la fiche technique');
    }
  }

  private generateFicheTechniqueForPdf(): string {
    // Générer le contenu HTML complet avec le même style que l'original
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fiche Technique - ${this.melange?.nom}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
        <style>
          body { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
          }
          
          .fiche-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 1000px;
            margin: 0 auto;
          }
          
          .fiche-header {
            background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .fiche-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .fiche-content {
            padding: 40px;
          }
          
          .info-section {
            background: #f8fafc;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 5px solid #3b82f6;
          }
          
          .section-title {
            color: #1e40af;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          }
          
          .info-item {
            display: flex;
            flex-direction: column;
          }
          
          .info-label {
            font-weight: 600;
            color: #374151;
            font-size: 0.9rem;
            margin-bottom: 5px;
          }
          
          .info-value {
            color: #1f2937;
            font-size: 1rem;
            background: white;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          
          .composition-table {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          
          .table {
            margin-bottom: 0;
          }
          
          .table thead th {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border: none;
            padding: 15px;
            font-weight: 600;
          }
          
          .table tbody td {
            padding: 12px 15px;
            border-color: #e5e7eb;
          }
          
          .percentage-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
          }
          
          .total-row {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            font-weight: 600;
          }
          
          .documents-section {
            background: #f1f5f9;
            border-radius: 10px;
            padding: 25px;
            border-left: 5px solid #06b6d4;
          }
          
          .document-item {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          
          .btn-document {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.3s ease;
          }
          
          .btn-document:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            color: white;
            text-decoration: none;
          }
          
          .responsable-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 10px;
            padding: 25px;
            border-left: 5px solid #f59e0b;
          }
          
          @media print {
            body { background: white; }
            .fiche-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="fiche-container">
          <div class="fiche-header">
            <i class="bi bi-file-earmark-text" style="font-size: 3rem; margin-bottom: 15px;"></i>
            <h1 class="fiche-title">FICHE TECHNIQUE DU MÉLANGE</h1>
          </div>
          <div class="fiche-content">
            ${this.getFicheTechniqueResumeHtml()}
          </div>
        </div>
      </body>
      </html>
    `;
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
    
    // Charger la liste des brouillons disponibles
    this.loadDraftsForCurrentMelange();
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
    
    // Restaurer le brouillon local s'il existe et est plus récent
    await this.restoreDraftIfNewer();
    
    this.updateAvailableGisements();
    this.patchForm();
  }

  private async restoreDraftIfNewer(): Promise<void> {
    try {
      const draft = this.loadDraftFromLocalStorage();
      if (!draft) return;

      // Vérifier si le brouillon est plus récent que la dernière sauvegarde en base
      const draftTime = new Date(draft.timestamp);
      const dbTime = this.melange?.date_creation ? new Date(this.melange.date_creation) : new Date(0);
      
      if (draftTime > dbTime && this.melange && this.melange.etat !== MelangeEtat.VALIDATION) {
        console.log('🔄 Brouillon local plus récent détecté, restauration...');
        
        // Demander confirmation à l'utilisateur
        if (confirm('Un brouillon plus récent a été trouvé. Voulez-vous le restaurer ?')) {
          this.restoreDraft(draft);
        } else {
          // Supprimer le brouillon si l'utilisateur refuse
          this.clearDraft();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la restauration du brouillon:', error);
    }
  }

  private restoreDraft(draft: any): void {
    try {
      // Restaurer les données du formulaire
      this.melangeForm.patchValue(draft.formData);
      
      // Restaurer l'état
      if (draft.etat && this.melange) {
        this.melange.etat = draft.etat;
      }
      
      // Restaurer les sélections
      if (draft.selectedGisements) {
        this.selectedGisements = draft.selectedGisements;
      }
      
      if (draft.selectedAmendements) {
        this.selectedAmendements = draft.selectedAmendements;
      }
      
      console.log('✅ Brouillon restauré avec succès');
      this.lastSaveTime = new Date(draft.timestamp);
    } catch (error) {
      console.error('Erreur lors de la restauration du brouillon:', error);
    }
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
    
    // Essayer de restaurer un brouillon pour un nouveau mélange
    this.restoreNewMelangeDraft();
    
    this.updateAvailableGisements();
    this.patchForm();
  }

  private restoreNewMelangeDraft(): void {
    try {
      const draft = this.loadDraftFromLocalStorage();
      if (draft) {
        console.log('🔄 Brouillon trouvé pour un nouveau mélange');
        if (confirm('Un brouillon de nouveau mélange a été trouvé. Voulez-vous le restaurer ?')) {
          this.restoreDraft(draft);
        } else {
          this.clearDraft();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la restauration du brouillon pour nouveau mélange:', error);
    }
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
    // Génère le résumé complet avec le nouveau style
    const lines: string[] = [];
    
    // === INFORMATIONS DU MÉLANGE ===
    lines.push('<div class="info-section">');
    lines.push('<h2 class="section-title"><i class="bi bi-info-circle"></i> INFORMATIONS GÉNÉRALES</h2>');
    lines.push('<div class="info-grid">');
    
    // Première colonne
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Référence</div>');
    lines.push(`<div class="info-value">${this.melange.reference_produit || 'Mélange inconnu'}</div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Nom</div>');
    lines.push(`<div class="info-value">${this.melange.nom || 'Mélange inconnu'}</div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Plateforme</div>');
    lines.push(`<div class="info-value">${this.getPlateformeName(this.melange.plateforme)}</div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Fournisseur</div>');
    lines.push(`<div class="info-value">${this.melange.fournisseur || 'PHV'}</div>`);
    lines.push('</div>');
    
    // Deuxième colonne
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Période de mélange</div>');
    lines.push(`<div class="info-value">${this.melange.periode_melange || 'oct-déc-2025'}</div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Date de semis</div>');
    lines.push(`<div class="info-value">${this.melange.date_semis || '2025-10-02'}</div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Couverture végétale</div>');
    lines.push(`<div class="info-value">${this.melange.couverture_vegetale || 'Trèfles'}</div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Références d\'analyses</div>');
    lines.push(`<div class="info-value">${this.melange.references_analyses || 'Non définies'}</div>`);
    lines.push('</div>');
    
    lines.push('</div>'); // fin info-grid
    lines.push('</div>'); // fin info-section
    
    // === RESPONSABLE DE LA PLATEFORME ===
    lines.push('<div class="responsable-section">');
    lines.push('<h2 class="section-title"><i class="bi bi-person-badge"></i> RESPONSABLE DE LA PLATEFORME</h2>');
    lines.push('<div class="info-grid">');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Responsable</div>');
    lines.push(`<div class="info-value">${this.getCurrentUserName()}</div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Entreprise</div>');
    lines.push(`<div class="info-value">${this.getCurrentUserCompany()}</div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Email</div>');
    lines.push(`<div class="info-value">${this.currentUser?.email || 'terres fertiles@gmail.com'}</div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Date de validation</div>');
    lines.push(`<div class="info-value">${new Date().toLocaleDateString('fr-FR')}</div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Rôle</div>');
    lines.push(`<div class="info-value"><span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.85rem;">${this.getCurrentUserRole()}</span></div>`);
    lines.push('</div>');
    
    lines.push('<div class="info-item">');
    lines.push('<div class="info-label">Statut</div>');
    lines.push(`<div class="info-value"><span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.85rem;">Validé</span></div>`);
    lines.push('</div>');
    
    lines.push('</div>'); // fin info-grid
    lines.push('</div>'); // fin responsable-section
    
    // === COMPOSITION DU MÉLANGE ===
    lines.push('<div class="info-section">');
    lines.push('<h2 class="section-title"><i class="bi bi-list-ul"></i> COMPOSITION DU MÉLANGE</h2>');
    
    // Gisements
    if (this.melange.ingredients && this.melange.ingredients.length > 0) {
      lines.push('<div class="composition-table">');
      lines.push('<table class="table">');
      lines.push('<thead>');
      lines.push('<tr><th>Gisement</th><th>Chantier d\'origine</th><th>Pourcentage</th></tr>');
      lines.push('</thead>');
      lines.push('<tbody>');
      this.melange.ingredients.forEach(ingredient => {
        const gisementName = this.getGisementName(ingredient.gisement);
        const gisement = this.gisements.find(g => g.id === ingredient.gisement);
        const chantierName = gisement ? this.getChantierName(gisement.chantier) : 'Chantier inconnu';
        lines.push(`<tr><td>${gisementName}</td><td>${chantierName}</td><td><span class="percentage-badge">${ingredient.pourcentage}%</span></td></tr>`);
      });
      // Ligne total gisements
      lines.push(`<tr class="total-row"><td colspan="2"><strong>Total gisements</strong></td><td><strong>${this.getTotalPercentage()}%</strong></td></tr>`);
      lines.push('</tbody>');
      lines.push('</table>');
      lines.push('</div>');
    } else {
      lines.push('<p style="color: #6b7280; font-style: italic; text-align: center; padding: 20px;">Aucun gisement défini</p>');
    }
    
    // Amendements (si présents)
    if (this.melange.amendements && this.melange.amendements.length > 0) {
      lines.push('<div style="margin-top: 25px;">');
      lines.push('<h3 style="color: #059669; font-size: 1.25rem; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">');
      lines.push('<i class="bi bi-plus-circle"></i> Amendements organiques</h3>');
      lines.push('<div class="composition-table">');
      lines.push('<table class="table">');
      lines.push('<thead>');
      lines.push('<tr><th>Amendement</th><th>Pourcentage</th></tr>');
      lines.push('</thead>');
      lines.push('<tbody>');
      this.melange.amendements.forEach(am => {
        const amendementName = this.getAmendementName((am.amendementOrganique ?? am.id ?? 0));
        lines.push(`<tr><td>${amendementName}</td><td><span class="percentage-badge">${am.pourcentage}%</span></td></tr>`);
      });
      // Ligne total amendements
      const totalAmendements = this.melange.amendements.reduce((sum, am) => sum + (Number(am.pourcentage) || 0), 0);
      lines.push(`<tr class="total-row"><td><strong>Total amendements</strong></td><td><strong>${totalAmendements}%</strong></td></tr>`);
      lines.push('</tbody>');
      lines.push('</table>');
      lines.push('</div>');
      lines.push('</div>');
    }
    
    // Total global avec style amélioré
    lines.push('<div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 10px; padding: 20px; margin-top: 25px; text-align: center; border-left: 5px solid #3b82f6;">');
    lines.push(`<h3 style="color: #1e40af; margin: 0; font-size: 1.5rem;"><strong>Total global (gisements + amendements): ${this.getTotalCompositionPercentage()}%</strong></h3>`);
    lines.push('</div>');
    lines.push('</div>'); // fin info-section
    
    // === DOCUMENTS UPLOADÉS ===
    lines.push('<div class="documents-section">');
    lines.push('<h2 class="section-title"><i class="bi bi-file-earmark-text"></i> DOCUMENTS UPLOADÉS</h2>');
    
    const documents = [
      { title: 'NORMES DE CONFORMITÉ', field: 'ordre_conformite', icon: 'bi-file-pdf' },
      { title: "CONDITIONS D'UTILISATION", field: 'consignes_melange', icon: 'bi-file-word' },
      { title: 'CONTRÔLE QUALITÉ +1 à 8 MOIS', field: 'controle_1', icon: 'bi-file-excel' },
      { title: 'CONTRÔLE QUALITÉ Établissement de la fiche produit', field: 'controle_2', icon: 'bi-file-excel' },
      { title: 'FICHE TECHNIQUE FINALE', field: 'fiche_technique', icon: 'bi-file-text' }
    ];
    
    documents.forEach(doc => {
      const fileUrl = this.melange[doc.field as keyof typeof this.melange] as string;
      lines.push('<div class="document-item">');
      lines.push(`<div style="display: flex; align-items: center; gap: 10px;">`);
      lines.push(`<i class="bi ${doc.icon}" style="font-size: 1.2rem; color: #3b82f6;"></i>`);
      lines.push(`<strong style="color: #374151;">${doc.title}:</strong>`);
      lines.push('</div>');
      if (fileUrl) {
        const fullUrl = this.getFileUrl(fileUrl);
        lines.push(`<a href="${fullUrl}" target="_blank" class="btn-document">`);
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

  // === NETTOYAGE ===
  
  ngOnDestroy(): void {
    // Sauvegarder une dernière fois avant de quitter
    if (!this.isAutoSaving) {
      this.autoSaveDraft();
    }
    
    // Nettoyer l'intervalle de sauvegarde automatique
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  // Méthode à appeler lors de la finalisation de la fiche technique
  onFicheTechniqueFinalised(): void {
    // Supprimer le brouillon car la fiche technique est finalisée
    this.clearDraft();
    console.log('✅ Fiche technique finalisée - brouillon supprimé');
  }
}
