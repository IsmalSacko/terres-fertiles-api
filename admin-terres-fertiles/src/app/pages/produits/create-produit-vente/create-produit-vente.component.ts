import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MelangeService, Melange } from '../../../services/melange.service';
import { ProduitVenteService } from '../../../services/produit-vente.service';
import { CreateProduitVente } from '../../../models/produit-vente.model';

@Component({
  selector: 'app-create-produit-vente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  templateUrl: './create-produit-vente.component.html',
  styleUrls: ['./create-produit-vente.component.css']
})
export class CreateProduitVenteComponent implements OnInit {
  produitForm: FormGroup;
  isLoading = false;
  isCreating = false;
  melanges: Melange[] = [];
  // Auto-remplissage basé sur la plateforme du mélange sélectionné
  autoFilledFromPlateforme = false;
  currentPlateformeId: number | null = null;
  plateformeTotals = { initial: 0, vendu: 0, count: 0 };

  constructor(
    private fb: FormBuilder,
    private melangeService: MelangeService,
    private produitVenteService: ProduitVenteService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.produitForm = this.fb.group({
      melange: ['', [Validators.required]],
      fournisseur: ['', [Validators.required, Validators.minLength(2)]],
      nom_site: [''],
      volume_initial: ['', [Validators.required, Validators.min(0.1)]],
      date_disponibilite: [new Date(), [Validators.required]],
      commentaires_analyses: [''],
      volume_vendu: ['', [Validators.min(0)]],
      acheteur: [''],
      date_achat: [''],
      periode_destockage: [''],
      localisation_projet: [''],
      pret_pour_vente: [false]
    });
  }

  async ngOnInit() {
    await this.loadMelanges();
    // Surveille le changement de mélange pour auto-remplir volumes selon la plateforme
    this.produitForm.get('melange')?.valueChanges.subscribe((melangeId: number) => {
      this.handleMelangeChange(melangeId);
    });
  }

  async loadMelanges() {
    try {
      this.isLoading = true;
      console.log('🔄 Chargement des mélanges disponibles...');
      
      // Utiliser la méthode spécialisée pour les mélanges sans produits de vente
      this.melanges = await this.melangeService.getMelangesSansProduitsVente();
      console.log(`✅ ${this.melanges.length} mélanges disponibles chargés:`, this.melanges);
      
      if (this.melanges.length === 0) {
        console.log('⚠️ Aucun mélange disponible');
        this.snackBar.open(
          'Aucun mélange disponible pour créer un produit de vente',
          'Fermer',
          { duration: 5000, panelClass: ['warning-snackbar'] }
        );
      } else {
        // Vérifier que chaque mélange a un ID valide
        this.melanges.forEach((melange, index) => {
          if (!melange.id || melange.id <= 0) {
            console.error(`❌ Mélange ${index} a un ID invalide:`, melange);
          } else {
            console.log(`✅ Mélange ${melange.nom} (ID: ${melange.id}) disponible`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des mélanges:', error);
      this.snackBar.open(
        'Erreur lors du chargement des mélanges: ' + (error as any)?.message || 'Erreur inconnue',
        'Fermer',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
      this.melanges = [];
    } finally {
      this.isLoading = false;
    }
  }

  private async handleMelangeChange(melangeId: number) {
    try {
      const selected = this.melanges.find(m => m.id === Number(melangeId));
      const plateformeId = selected?.plateforme ?? null;
      this.currentPlateformeId = plateformeId ?? null;

      if (!plateformeId) {
        // Pas de plateforme renseignée => activer champs et nettoyer
        this.autoFilledFromPlateforme = false;
        this.plateformeTotals = { initial: 0, vendu: 0, count: 0 };
        this.volume_initial?.enable({ emitEvent: false });
        this.volume_vendu?.enable({ emitEvent: false });
        return;
      }

      // Récupérer tous les produits pour agréger par plateforme
      const produits = await this.produitVenteService.getAll();
      const produitsPlateforme = produits.filter((p: any) => {
        const pid = p?.melange?.plateforme ?? p?.plateforme?.id ?? p?.melange?.plateforme_details?.id;
        return Number(pid) === Number(plateformeId);
      });

      const totalInitial = produitsPlateforme.reduce((acc, p) => acc + (Number(p.volume_initial) || 0), 0);
      const totalVendu = produitsPlateforme.reduce((acc, p) => acc + (Number(p.volume_vendu) || 0), 0);

      this.plateformeTotals = { initial: totalInitial, vendu: totalVendu, count: produitsPlateforme.length };

      if (produitsPlateforme.length > 0) {
        // Plateforme déjà utilisée: auto-remplir et désactiver
        this.autoFilledFromPlateforme = true;
        this.volume_initial?.setValue(totalInitial, { emitEvent: false });
        this.volume_vendu?.setValue(totalVendu, { emitEvent: false });
        this.volume_initial?.disable({ emitEvent: false });
        this.volume_vendu?.disable({ emitEvent: false });
      } else {
        // Nouvelle plateforme: activer pour saisie manuelle
        this.autoFilledFromPlateforme = false;
        this.volume_initial?.enable({ emitEvent: false });
        this.volume_vendu?.enable({ emitEvent: false });
        // Ne pas forcer de valeur ici, laisser l'utilisateur saisir si première fois
      }
    } catch (error) {
      console.error('Erreur lors du calcul des totaux plateforme:', error);
      // En cas d'erreur, laisser l'édition manuelle possible
      this.autoFilledFromPlateforme = false;
      this.volume_initial?.enable({ emitEvent: false });
      this.volume_vendu?.enable({ emitEvent: false });
    }
  }

  async onSubmit() {
    if (this.produitForm.valid && !this.isCreating) {
      this.isCreating = true;
      
      try {
        // Inclure les champs désactivés (auto-remplis) dans la lecture
        const formData = this.produitForm.getRawValue();
        
        // Validation des données critiques
        if (!formData.melange || Number(formData.melange) <= 0) {
          console.error('❌ Erreur: ID du mélange invalide:', formData.melange);
          this.snackBar.open(
            'Erreur: Veuillez sélectionner un mélange valide',
            'Fermer',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
          return;
        }

        // Préparer les données selon le modèle Django
        const produitData: CreateProduitVente = {
          melange: Number(formData.melange),
          fournisseur: formData.fournisseur?.trim() || '',
          volume_initial: Number(formData.volume_initial),
          date_disponibilite: this.formatDate(formData.date_disponibilite),
          pret_pour_vente: Boolean(formData.pret_pour_vente),
        };

        // Ajouter les champs optionnels
        if (formData.nom_site?.trim()) {
          produitData.nom_site = formData.nom_site.trim();
        }
        if (formData.commentaires_analyses?.trim()) {
          produitData.commentaires_analyses = formData.commentaires_analyses.trim();
        }
        if (formData.volume_vendu != null && formData.volume_vendu !== '' && Number(formData.volume_vendu) >= 0) {
          produitData.volume_vendu = Number(formData.volume_vendu);
        }
        if (formData.acheteur?.trim()) {
          produitData.acheteur = formData.acheteur.trim();
        }
        if (formData.date_achat) {
          produitData.date_achat = this.formatDate(formData.date_achat);
        }
        if (formData.periode_destockage?.trim()) {
          produitData.periode_destockage = formData.periode_destockage.trim();
        }
        if (formData.localisation_projet?.trim()) {
          produitData.localisation_projet = formData.localisation_projet.trim();
        }

        console.log('📤 Données à envoyer:', produitData);
        
        const result = await this.produitVenteService.createProduitVente(produitData);
        console.log('✅ Produit créé avec succès:', result);
        
        this.snackBar.open(
          'Produit de vente créé avec succès !',
          'Fermer',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        
        this.router.navigate(['/produits']);
        
      } catch (error: any) {
        console.error('❌ Erreur lors de la création:', error);
        
        // Gestion des erreurs spécifiques du backend
        let errorMessage = 'Erreur lors de la création du produit de vente';
        
        if (error.response?.data) {
          const errorData = error.response.data;
          
          // Erreurs de validation par champ
          if (errorData.melange) {
            errorMessage = `Erreur mélange: ${errorData.melange[0]}`;
          } else if (errorData.volume_initial) {
            errorMessage = `Erreur volume: ${errorData.volume_initial[0]}`;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
        
        this.snackBar.open(
          errorMessage,
          'Fermer',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      } finally {
        this.isCreating = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        console.error('❌ Date invalide:', date);
        return '';
      }
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.error('❌ Erreur lors du formatage de la date:', date, error);
      return '';
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.produitForm.controls).forEach(key => {
      this.produitForm.get(key)?.markAsTouched();
    });
  }

  resetForm() {
    this.produitForm.reset({
      melange: '',
      fournisseur: '',
      nom_site: '',
      volume_initial: '',
      date_disponibilite: new Date(),
      commentaires_analyses: '',
      volume_vendu: '',
      acheteur: '',
      date_achat: '',
      periode_destockage: '',
      localisation_projet: '',
      pret_pour_vente: false
    });
    this.autoFilledFromPlateforme = false;
    this.currentPlateformeId = null;
    this.plateformeTotals = { initial: 0, vendu: 0, count: 0 };
    this.volume_initial?.enable({ emitEvent: false });
    this.volume_vendu?.enable({ emitEvent: false });
  }

  onCancel() {
    this.router.navigate(['/produits']);
  }

  // Getters pour faciliter l'accès aux contrôles dans le template
  get melange() { return this.produitForm.get('melange'); }
  get fournisseur() { return this.produitForm.get('fournisseur'); }
  get nom_site() { return this.produitForm.get('nom_site'); }
  get volume_initial() { return this.produitForm.get('volume_initial'); }
  get date_disponibilite() { return this.produitForm.get('date_disponibilite'); }
  get commentaires_analyses() { return this.produitForm.get('commentaires_analyses'); }
  get volume_vendu() { return this.produitForm.get('volume_vendu'); }
  get acheteur() { return this.produitForm.get('acheteur'); }
  get date_achat() { return this.produitForm.get('date_achat'); }
  get periode_destockage() { return this.produitForm.get('periode_destockage'); }
  get localisation_projet() { return this.produitForm.get('localisation_projet'); }
  get pret_pour_vente() { return this.produitForm.get('pret_pour_vente'); }

  // Helpers d'affichage
  get selectedMelange(): Melange | undefined {
    const id = Number(this.produitForm.get('melange')?.value);
    return this.melanges.find(m => m.id === id);
  }
  get selectedPlateformeNom(): string {
    const m = this.selectedMelange;
    return m?.plateforme_nom || m?.plateforme_details?.nom || '';
  }

  debugForm(): void {
    console.log('=== DEBUG FORM ===');
    console.log('Form valid:', this.produitForm.valid);
    console.log('Form value:', this.produitForm.value);
    console.log('Form errors:', this.getFormErrors());
    console.log('Mélanges disponibles:', this.melanges);
    console.log('Mélange sélectionné ID:', this.produitForm.get('melange')?.value);
    console.log('Mélange sélectionné type:', typeof this.produitForm.get('melange')?.value);
    console.log('Number(melange):', Number(this.produitForm.get('melange')?.value));
    console.log('Loading state:', this.isLoading);
    console.log('Creating state:', this.isCreating);
    
    // Tester la préparation des données
    const formData = this.produitForm.value;
    console.log('--- TEST PREPARATION DONNEES ---');
    try {
      const testData = {
        melange: Number(formData.melange),
        fournisseur: formData.fournisseur?.trim() || '',
        volume_initial: Number(formData.volume_initial),
        date_disponibilite: this.formatDate(formData.date_disponibilite),
        pret_pour_vente: Boolean(formData.pret_pour_vente),
      };
      console.log('Données de test preparées:', testData);
    } catch (error) {
      console.error('Erreur lors de la préparation des données de test:', error);
    }
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.produitForm.controls).forEach(key => {
      const controlErrors = this.produitForm.get(key)?.errors;
      if (controlErrors) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

}
