import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { SuiviStockPlateformeService } from '../../../services/suivi-stock-plateforme.service';
import { SuiviStockPlateforme, CreateSuiviStockPlateforme, UpdateSuiviStockPlateforme } from '../../../models/suivi-stock-plateforme.model';

@Component({
  selector: 'app-suivistock-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatDialogModule
  ],
  templateUrl: './suivistock-edit.component.html',
  styleUrl: './suivistock-edit.component.css'
})
export class SuivistockEditComponent implements OnInit {
  private suiviStockService = inject(SuiviStockPlateformeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Propriétés du composant
  suiviStockId: number | null = null;
  suiviStock: SuiviStockPlateforme | null = null;
  loading = false;
  saving = false;

  // Formulaires groupés par étapes
  identificationForm!: FormGroup;
  volumesForm!: FormGroup;
  datesForm!: FormGroup;
  informationsForm!: FormGroup;

  // Options pour les select
  plateformeOptions: any[] = [];
  melangeOptions: any[] = [];
  utilisateurOptions: any[] = [];
  statutOptions = [
    { value: 'en_stock', label: 'En Stock' },
    { value: 'en_cours_ecoulement', label: 'En Cours d\'Écoulement' },
    { value: 'ecoule', label: 'Écoulé' },
    { value: 'suspendu', label: 'Suspendu' }
  ];

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.suiviStockId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.suiviStockId) {
      this.loadSuiviStock();
      this.loadOptions();
    } else {
      this.router.navigate(['/suivistock']);
    }
  }

  private initializeForms(): void {
    // Formulaire d'identification
    this.identificationForm = this.fb.group({
      reference_suivi: ['', [Validators.required, Validators.maxLength(100)]],
      andain_numero: ['', [Validators.required, Validators.min(1)]],
      plateforme: ['', Validators.required],
      melange: [''],
      statut: ['en_stock', Validators.required]
    });

    // Formulaire des volumes
    this.volumesForm = this.fb.group({
      volume_initial_m3: ['', [Validators.required, Validators.min(0.01)]],
      volume_restant_m3: ['', [Validators.required, Validators.min(0)]]
    });

    // Formulaire des dates
    this.datesForm = this.fb.group({
      date_mise_en_andains: [''],
      date_mise_en_culture: [''],
      date_previsionnelle_vente: [''],
      date_ecoulement: ['']
    });

    // Formulaire des informations complémentaires
    this.informationsForm = this.fb.group({
      recette: ['', Validators.maxLength(1000)],
      remarques: ['', Validators.maxLength(1000)],
      utilisateur: ['']
    });

    // Validation croisée volume restant <= volume initial
    this.volumesForm.get('volume_restant_m3')?.valueChanges.subscribe(() => {
      this.validateVolumeRestant();
    });

    this.volumesForm.get('volume_initial_m3')?.valueChanges.subscribe(() => {
      this.validateVolumeRestant();
    });
  }

  private validateVolumeRestant(): void {
    const volumeInitial = this.volumesForm.get('volume_initial_m3')?.value;
    const volumeRestant = this.volumesForm.get('volume_restant_m3')?.value;
    
    if (volumeInitial && volumeRestant && parseFloat(volumeRestant) > parseFloat(volumeInitial)) {
      this.volumesForm.get('volume_restant_m3')?.setErrors({ volumeRestantTropGrand: true });
    }
  }

  private async loadSuiviStock(): Promise<void> {
    if (!this.suiviStockId) return;

    this.loading = true;
    try {
      this.suiviStock = await this.suiviStockService.getSuiviStock(this.suiviStockId);
      this.populateForms();
    } catch (error) {
      console.error('Erreur lors du chargement du suivi de stock:', error);
      this.snackBar.open('Erreur lors du chargement des données', 'Fermer', { duration: 5000 });
      this.router.navigate(['/suivistock']);
    } finally {
      this.loading = false;
    }
  }

  private populateForms(): void {
    if (!this.suiviStock) return;

    // Remplir le formulaire d'identification
    this.identificationForm.patchValue({
      reference_suivi: this.suiviStock.reference_suivi,
      andain_numero: this.suiviStock.andain_numero,
      plateforme: this.suiviStock.plateforme,
      melange: this.suiviStock.melange || '',
      statut: this.suiviStock.statut || 'en_stock'
    });

    // Remplir le formulaire des volumes
    this.volumesForm.patchValue({
      volume_initial_m3: this.suiviStock.volume_initial_m3,
      volume_restant_m3: this.suiviStock.volume_restant_m3
    });

    // Remplir le formulaire des dates
    this.datesForm.patchValue({
      date_mise_en_andains: this.suiviStock.date_mise_en_andains ? new Date(this.suiviStock.date_mise_en_andains) : null,
      date_mise_en_culture: this.suiviStock.date_mise_en_culture ? new Date(this.suiviStock.date_mise_en_culture) : null,
      date_previsionnelle_vente: this.suiviStock.date_previsionnelle_vente ? new Date(this.suiviStock.date_previsionnelle_vente) : null,
      date_ecoulement: this.suiviStock.date_ecoulement ? new Date(this.suiviStock.date_ecoulement) : null
    });

    // Remplir le formulaire des informations
    this.informationsForm.patchValue({
      recette: this.suiviStock.recette || '',
      remarques: this.suiviStock.remarques || '',
      utilisateur: this.suiviStock.utilisateur || ''
    });
  }

  private async loadOptions(): Promise<void> {
    try {
      // Pour l'instant, utilisons des options statiques
      // TODO: Implémenter les endpoints pour les listes de référence
      this.plateformeOptions = [
        { value: 1, label: 'Plateforme 1 - Localisation A' },
        { value: 2, label: 'Plateforme 2 - Localisation B' }
      ];

      this.melangeOptions = [
        { value: 1, label: 'Mélange A (REF-001)' },
        { value: 2, label: 'Mélange B (REF-002)' }
      ];

      this.utilisateurOptions = [
        { value: 1, label: 'admin' },
        { value: 2, label: 'utilisateur1' }
      ];
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error);
      this.snackBar.open('Erreur lors du chargement des listes', 'Fermer', { duration: 5000 });
    }
  }

  isFormValid(): boolean {
    return this.identificationForm.valid && 
           this.volumesForm.valid && 
           this.datesForm.valid && 
           this.informationsForm.valid;
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid() || !this.suiviStockId) {
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 5000 });
      return;
    }

    this.saving = true;

    try {
      // Préparer les données de mise à jour
      const updateData: Partial<CreateSuiviStockPlateforme> = {
        ...this.identificationForm.value,
        ...this.volumesForm.value,
        ...this.datesForm.value,
        ...this.informationsForm.value
      };

      // Formater les dates
      Object.keys(updateData).forEach(key => {
        if (key.includes('date_') && updateData[key as keyof CreateSuiviStockPlateforme]) {
          const dateValue: any = updateData[key as keyof CreateSuiviStockPlateforme];
          if (dateValue && typeof dateValue === 'object' && dateValue instanceof Date) {
            (updateData as any)[key] = dateValue.toISOString().split('T')[0];
          }
        }
      });

      // Nettoyer les champs vides
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof CreateSuiviStockPlateforme] === '' || 
            updateData[key as keyof CreateSuiviStockPlateforme] === null) {
          delete updateData[key as keyof CreateSuiviStockPlateforme];
        }
      });

      console.log('📝 Données avant envoi:', updateData);
      
      await this.suiviStockService.updateSuiviStock(this.suiviStockId, updateData as UpdateSuiviStockPlateforme);

      this.snackBar.open('Suivi de stock mis à jour avec succès', 'Fermer', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Rediriger vers les détails
      this.router.navigate(['/suivistock', this.suiviStockId]);

    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      
      let errorMessage = 'Erreur lors de la mise à jour du suivi de stock';
      
      if (error?.response?.data) {
        console.error('📝 Détails de l\'erreur serveur:', error.response.data);
        
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else {
          // Si c'est un objet avec des erreurs de validation
          const errors = Object.values(error.response.data).flat();
          if (errors.length > 0) {
            errorMessage = `Erreurs de validation: ${errors.join(', ')}`;
          }
        }
      }

      this.snackBar.open(errorMessage, 'Fermer', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.saving = false;
    }
  }

  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Modifications non sauvegardées',
          message: 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?',
          confirmText: 'Quitter',
          cancelText: 'Continuer l\'édition'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.navigateBack();
        }
      });
    } else {
      this.navigateBack();
    }
  }

  private navigateBack(): void {
    if (this.suiviStockId) {
      this.router.navigate(['/suivistock', this.suiviStockId]);
    } else {
      this.router.navigate(['/suivistock']);
    }
  }

  private hasUnsavedChanges(): boolean {
    if (!this.suiviStock) return false;

    // Vérifier si les formulaires ont été modifiés
    return this.identificationForm.dirty || 
           this.volumesForm.dirty || 
           this.datesForm.dirty || 
           this.informationsForm.dirty;
  }

  // Méthodes utilitaires pour les templates
  getVolumeEcoule(): number {
    const initial = this.volumesForm.get('volume_initial_m3')?.value || 0;
    const restant = this.volumesForm.get('volume_restant_m3')?.value || 0;
    return Math.max(0, parseFloat(initial) - parseFloat(restant));
  }

  getTauxEcoulement(): number {
    const initial = this.volumesForm.get('volume_initial_m3')?.value || 0;
    const ecoule = this.getVolumeEcoule();
    return initial > 0 ? Math.round((ecoule / parseFloat(initial)) * 100) : 0;
  }

  // Gestion des erreurs de formulaire
  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (field?.hasError('min')) {
      return `La valeur doit être supérieure à ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('maxlength')) {
      return `Maximum ${field.errors?.['maxlength'].requiredLength} caractères`;
    }
    if (field?.hasError('volumeRestantTropGrand')) {
      return 'Le volume restant ne peut pas être supérieur au volume initial';
    }
    return '';
  }
}

// Composant de dialogue de confirmation
@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h1 mat-dialog-title>{{data.title}}</h1>
    <div mat-dialog-content>
      <p>{{data.message}}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{data.cancelText}}</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">{{data.confirmText}}</button>
    </div>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

// Import nécessaire pour le dialogue
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';