import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { SuiviStockPlateformeService } from '../../../services/suivi-stock-plateforme.service';
import { PlateformeService } from '../../../services/plateforme.service';
import { MelangeService } from '../../../services/melange.service';
import { ProduitVenteService } from '../../../services/produit-vente.service';
import { CreateSuiviStockPlateforme, STATUT_CHOICES } from '../../../models/suivi-stock-plateforme.model';
import { Plateforme } from '../../../models/plateforme';
import { Melange } from '../../../models/melange.model';

@Component({
  selector: 'app-suivistock-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    MatStepperModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './suivistock-create.component.html',
  styleUrls: ['./suivistock-create.component.css']
})
export class SuivistockCreateComponent implements OnInit {
  
  createForm!: FormGroup;
  plateformes: Plateforme[] = [];
  melanges: Melange[] = [];
  produitsVente: any[] = [];
  statutChoices = STATUT_CHOICES;
  
  loading = false;
  saving = false;
  andainDisponible = true;
  andainCheckMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private suiviStockService: SuiviStockPlateformeService,
    private plateformeService: PlateformeService,
    private melangeService: MelangeService,
    private produitVenteService: ProduitVenteService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadReferenceData();
  }

  /**
   * Initialiser le formulaire
   */
  initializeForm(): void {
    this.createForm = this.fb.group({
      // Étape 1 : Identification
      andain_numero: ['', [Validators.required, Validators.min(1)]],
      plateforme: ['', Validators.required],
      melange: [''],
      produit_vente: [''], // Ajout du champ produit de vente
      
      // Étape 2 : Volumes et statut
      volume_initial_m3: ['', [Validators.required, Validators.min(0.1)]],
      volume_restant_m3: ['', [Validators.required, Validators.min(0)]],
      statut: ['en_cours', Validators.required],
      
      // Étape 3 : Dates
      date_mise_en_andains: ['', Validators.required],
      date_mise_en_culture: [''],
      date_previsionnelle_vente: [''],
      date_ecoulement: [''],
      
      // Étape 4 : Informations techniques
      recette: [''],
      remarques: ['']
    });

    // Surveillance des changements pour validation dynamique
    this.setupFormWatchers();
  }

  /**
   * Configuration des surveillances du formulaire
   */
  setupFormWatchers(): void {
    // Vérifier la disponibilité de l'andain
    this.createForm.get('andain_numero')?.valueChanges.subscribe(() => {
      this.checkAndainDisponible();
    });

    this.createForm.get('plateforme')?.valueChanges.subscribe(() => {
      this.checkAndainDisponible();
    });

    // Ajuster le volume restant automatiquement
    this.createForm.get('volume_initial_m3')?.valueChanges.subscribe((value) => {
      if (value && !this.createForm.get('volume_restant_m3')?.value) {
        this.createForm.patchValue({ volume_restant_m3: value });
      }
    });

    // Validation logique des volumes
    this.createForm.get('volume_restant_m3')?.valueChanges.subscribe(() => {
      this.validateVolumes();
    });
  }

  /**
   * Vérifier l'unicité de l'andain pour une plateforme donnée
   */
  async checkAndainUnicity(plateformeId: number, andainNumero: number): Promise<boolean> {
    try {
      const existingSuivis = await this.suiviStockService.getSuiviStocksByPlateforme(plateformeId);
      return !existingSuivis.some((suivi: any) => suivi.andain_numero === andainNumero);
    } catch (error) {
      console.error('Erreur vérification unicité andain:', error);
      return true; // En cas d'erreur, autoriser la tentative
    }
  }

  /**
   * Suggérer le prochain numéro d'andain disponible
   */
  async suggestNextAndainNumber(plateformeId: number): Promise<number> {
    try {
      const existingSuivis = await this.suiviStockService.getSuiviStocksByPlateforme(plateformeId);
      const usedNumbers = existingSuivis.map((suivi: any) => suivi.andain_numero).sort((a: number, b: number) => a - b);
      
      // Trouver le premier numéro disponible
      let nextNumber = 1;
      for (const used of usedNumbers) {
        if (nextNumber === used) {
          nextNumber++;
        } else {
          break;
        }
      }
      
      return nextNumber;
    } catch (error) {
      console.error('Erreur suggestion numéro andain:', error);
      return 1; // Valeur par défaut
    }
  }

  /**
   * Gestionnaire de changement de plateforme
   */
  async onPlateformeChange(): Promise<void> {
    const plateformeId = this.createForm.get('plateforme')?.value;
    if (plateformeId) {
      // Suggérer automatiquement le prochain numéro d'andain
      const nextAndainNumber = await this.suggestNextAndainNumber(plateformeId);
      this.createForm.patchValue({ andain_numero: nextAndainNumber });
      
      console.log(`💡 Suggestion automatique: Andain numéro ${nextAndainNumber} pour la plateforme ${plateformeId}`);
    }
  }

  /**
   * Validation de l'unicité de l'andain
   */
  async validateAndainUnicity(): Promise<void> {
    const plateformeId = this.createForm.get('plateforme')?.value;
    const andainNumero = this.createForm.get('andain_numero')?.value;
    
    if (plateformeId && andainNumero) {
      const isUnique = await this.checkAndainUnicity(plateformeId, andainNumero);
      
      if (!isUnique) {
        // Marquer le champ comme invalide
        this.createForm.get('andain_numero')?.setErrors({ 'notUnique': true });
        
        // Suggérer un autre numéro
        const suggestedNumber = await this.suggestNextAndainNumber(plateformeId);
        console.warn(`⚠️ Andain ${andainNumero} déjà utilisé. Suggestion: ${suggestedNumber}`);
        
        this.snackBar.open(
          `Andain ${andainNumero} déjà utilisé sur cette plateforme. Suggestion: ${suggestedNumber}`, 
          'Utiliser', 
          {
            duration: 8000,
            panelClass: ['warning-snackbar']
          }
        ).onAction().subscribe(() => {
          this.createForm.patchValue({ andain_numero: suggestedNumber });
        });
      } else {
        // Supprimer l'erreur si elle existe
        const control = this.createForm.get('andain_numero');
        if (control?.hasError('notUnique')) {
          const errors = { ...control.errors };
          delete errors['notUnique'];
          control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      }
    }
  }

  /**
   * Charger les données de référence
   */
  async loadReferenceData(): Promise<void> {
    this.loading = true;
    
    try {
      this.plateformes = await this.plateformeService.getPlateformes();
    } catch (error) {
      console.error('Erreur chargement plateformes:', error);
      this.snackBar.open('Erreur lors du chargement des plateformes', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }

    // Charger les mélanges disponibles (non utilisés dans le stock)
    try {
      console.log('🔄 Chargement des mélanges disponibles (sans stock existant)...');
      this.melanges = await this.melangeService.getMelangesSansStock();
      console.log('✅ Mélanges disponibles chargés:', this.melanges.length, 'mélanges trouvés');
      console.log('📋 Détails des mélanges disponibles:', this.melanges);
    } catch (error: any) {
      console.error('❌ Erreur chargement mélanges disponibles:', error);
      if (error.response) {
        console.error('📄 Réponse du serveur:', error.response.status, error.response.data);
      }
      this.melanges = [];
    }

    // Charger les produits de vente
    try {
      console.log('🔄 Chargement des produits de vente...');
      this.produitsVente = await this.produitVenteService.getAll();
      console.log('✅ Produits de vente chargés:', this.produitsVente.length, 'produits trouvés');
    } catch (error: any) {
      console.error('❌ Erreur chargement produits de vente:', error);
      this.produitsVente = [];
    }

    this.loading = false;
  }

  /**
   * Vérifier la disponibilité du numéro d'andain
   */
  async checkAndainDisponible(): Promise<void> {
    const andainNumero = this.createForm.get('andain_numero')?.value;
    const plateformeId = this.createForm.get('plateforme')?.value;

    if (andainNumero && plateformeId) {
      try {
        const response = await this.suiviStockService.verifierAndainDisponible(plateformeId, andainNumero);
        this.andainDisponible = response.disponible;
        this.andainCheckMessage = response.message || '';
        
        if (!response.disponible) {
          this.createForm.get('andain_numero')?.setErrors({ 'andainExiste': true });
        } else {
          // Supprimer l'erreur personnalisée si elle existe
          const errors = this.createForm.get('andain_numero')?.errors;
          if (errors && errors['andainExiste']) {
            delete errors['andainExiste'];
            this.createForm.get('andain_numero')?.setErrors(
              Object.keys(errors).length ? errors : null
            );
            }
          }
        } catch (error) {
          console.error('Erreur vérification andain:', error);
        }
      }
    }

  /**
   * Valider la cohérence des volumes
   */
  validateVolumes(): void {
    const volumeInitial = this.createForm.get('volume_initial_m3')?.value;
    const volumeRestant = this.createForm.get('volume_restant_m3')?.value;

    if (volumeInitial && volumeRestant) {
      if (volumeRestant > volumeInitial) {
        this.createForm.get('volume_restant_m3')?.setErrors({ 'volumeIncohérent': true });
      } else {
        const errors = this.createForm.get('volume_restant_m3')?.errors;
        if (errors && errors['volumeIncohérent']) {
          delete errors['volumeIncohérent'];
          this.createForm.get('volume_restant_m3')?.setErrors(
            Object.keys(errors).length ? errors : null
          );
        }
      }
    }
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('min')) {
      return `La valeur doit être supérieure à ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('notUnique')) {
      return 'Ce numéro d\'andain existe déjà sur cette plateforme';
    }
    if (field?.hasError('andainExiste')) {
      return this.andainCheckMessage;
    }
    if (field?.hasError('volumeIncohérent')) {
      return 'Le volume restant ne peut pas être supérieur au volume initial';
    }
    return '';
  }

  /**
   * Calculer le volume écoulé
   */
  getVolumeEcoule(): number {
    const volumeInitial = this.createForm.get('volume_initial_m3')?.value || 0;
    const volumeRestant = this.createForm.get('volume_restant_m3')?.value || 0;
    return Math.max(0, volumeInitial - volumeRestant);
  }

  /**
   * Calculer le taux d'écoulement
   */
  getTauxEcoulement(): number {
    const volumeInitial = this.createForm.get('volume_initial_m3')?.value || 0;
    if (volumeInitial === 0) return 0;
    return Math.round((this.getVolumeEcoule() / volumeInitial) * 100);
  }

  /**
   * Soumettre le formulaire
   */
  async onSubmit(): Promise<void> {
    if (this.createForm.valid && this.andainDisponible) {
      this.saving = true;
      
      // Vérifier l'unicité avant soumission
      const isUnique = await this.checkAndainUniqueness();
      if (!isUnique) {
        this.saving = false;
        return;
      }
      
      const formData: CreateSuiviStockPlateforme = {
        ...this.createForm.value,
        // S'assurer que andain_numero est un nombre
        andain_numero: parseInt(this.createForm.value.andain_numero, 10),
        // S'assurer que les IDs sont des nombres
        plateforme: parseInt(this.createForm.value.plateforme, 10),
        melange: this.createForm.value.melange ? parseInt(this.createForm.value.melange, 10) : null,
        produit_vente: this.createForm.value.produit_vente ? parseInt(this.createForm.value.produit_vente, 10) : null,
        // S'assurer que les volumes sont des nombres
        volume_initial_m3: parseFloat(this.createForm.value.volume_initial_m3),
        volume_restant_m3: parseFloat(this.createForm.value.volume_restant_m3),
        // Convertir les dates en chaînes ISO (YYYY-MM-DD)
        date_mise_en_andains: this.convertDateToString(this.createForm.value.date_mise_en_andains),
        date_mise_en_culture: this.convertDateToString(this.createForm.value.date_mise_en_culture),
        date_previsionnelle_vente: this.convertDateToString(this.createForm.value.date_previsionnelle_vente),
        date_ecoulement: this.convertDateToString(this.createForm.value.date_ecoulement),
        // Gérer les champs optionnels
        recette: this.createForm.value.recette || null,
        remarques: this.createForm.value.remarques || null
      };

      console.log('Données envoyées à l\'API:', formData);
      
      // ✅ CORRECTION BUG: Conversion explicite des types pour éviter les erreurs 400
      // - andain_numero doit être un entier (pas string)
      // - statut doit être une valeur valide du modèle Django
      
      try {
        const response = await this.suiviStockService.createSuiviStock(formData);
        this.snackBar.open('Suivi de stock créé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Vérifier que la réponse contient un ID valide avant de naviguer
        if (response && response.id) {
          this.router.navigate(['/suivistock/detail', response.id]);
        } else {
          console.warn('Réponse sans ID valide:', response);
          // Rediriger vers la liste si pas d'ID
          this.router.navigate(['/suivistock/list']);
        }
      } catch (error: any) {
        console.error('Erreur création:', error);
        let errorMessage = 'Erreur lors de la création';
        
        // Analyser les erreurs de validation détaillées
        if (error?.response?.data) {
          const validationErrors = error.response.data;
          
          // Erreur d'unicité andain/plateforme
          if (validationErrors.non_field_errors) {
            const uniqueError = validationErrors.non_field_errors.find((err: string) => 
              err.includes('unique set') || err.includes('andain_numero')
            );
            if (uniqueError) {
              const andainNum = this.createForm.value.andain_numero;
              const plateformeName = this.getSelectedPlateforme()?.nom || 'cette plateforme';
              errorMessage = `⚠️ Un andain avec le numéro "${andainNum}" existe déjà sur ${plateformeName}. Veuillez choisir un autre numéro d'andain.`;
            }
          }
          
          // Erreurs sur des champs spécifiques
          if (validationErrors.andain_numero) {
            errorMessage = Array.isArray(validationErrors.andain_numero) 
              ? validationErrors.andain_numero[0] 
              : validationErrors.andain_numero;
          }
          
          if (validationErrors.volume_restant_m3) {
            errorMessage = Array.isArray(validationErrors.volume_restant_m3)
              ? validationErrors.volume_restant_m3[0]
              : validationErrors.volume_restant_m3;
          }
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.saving = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Convertir une date en chaîne de caractères au format ISO (YYYY-MM-DD)
   */
  private convertDateToString(date: any): string | null {
    if (!date) return null;
    
    // Si c'est déjà une chaîne, la retourner telle quelle
    if (typeof date === 'string') return date;
    
    // Si c'est un objet Date, le convertir en format ISO (YYYY-MM-DD)
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    
    return null;
  }

  /**
   * Vérifier l'unicité de la combinaison andain/plateforme
   */
  private async checkAndainUniqueness(): Promise<boolean> {
    const andainNumero = this.createForm.value.andain_numero;
    const plateformeId = this.createForm.value.plateforme;
    
    if (!andainNumero || !plateformeId) {
      return true; // Pas de vérification si les champs ne sont pas remplis
    }
    
    try {
      // Récupérer tous les suivis de stock existants pour cette plateforme
      const suivis = await this.suiviStockService.getAll();
      const conflict = suivis.find(suivi => 
        suivi.andain_numero === parseInt(andainNumero) && suivi.plateforme === parseInt(plateformeId)
      );
      
      if (conflict) {
        const plateformeName = this.getSelectedPlateforme()?.nom || 'cette plateforme';
        this.snackBar.open(
          `⚠️ Un andain avec le numéro "${andainNumero}" existe déjà sur ${plateformeName}. Veuillez choisir un autre numéro.`,
          'Fermer',
          {
            duration: 5000,
            panelClass: ['warning-snackbar']
          }
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('Impossible de vérifier l\'unicité:', error);
      return true; // En cas d'erreur, laisser passer (la validation se fera côté serveur)
    }
  }

  /**
   * Marquer tous les champs comme touchés pour afficher les erreurs
   */
  markFormGroupTouched(): void {
    Object.keys(this.createForm.controls).forEach(key => {
      const control = this.createForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Annuler et retourner à la liste
   */
  onCancel(): void {
    this.router.navigate(['/suivistock']);
  }

  /**
   * Obtenir le nom de la plateforme sélectionnée
   */
  getSelectedPlateforme(): Plateforme | undefined {
    const plateformeId = this.createForm.get('plateforme')?.value;
    return this.plateformes.find(p => p.id === plateformeId);
  }

  /**
   * Obtenir le nom du mélange sélectionné
   */
  getSelectedMelange(): Melange | undefined {
    const melangeId = this.createForm.get('melange')?.value;
    return this.melanges.find(m => m.id === melangeId);
  }

  /**
   * Obtenir le libellé du statut sélectionné
   */
  getStatutLabel(value: string | null): string {
    if (!value) return 'Non défini';
    const statut = this.statutChoices.find(s => s.value === value);
    return statut?.label || 'Inconnu';
  }
}