import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CreateSaisieVenteService } from '../../services/create-saisie-vente.service';
import { CreateSaisieVente, SaisieVenteResponse } from '../../models/create-saisie-vente.model';
import { ProduitVenteService, ProduitVente } from '../../services/produit-vente.service';

@Component({
  selector: 'app-edit-saisie-vente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-saisie-vente.component.html',
  styleUrls: ['./edit-saisie-vente.component.css']
})
export class EditSaisieVenteComponent implements OnInit {
  saisieVenteForm: FormGroup;
  isLoading = false;
  isUpdating = false;
  produits: ProduitVente[] = [];
  saisieVenteId: number;
  originalSaisie: SaisieVenteResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private createSaisieVenteService: CreateSaisieVenteService,
    private produitVenteService: ProduitVenteService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.saisieVenteForm = this.fb.group({
      nom_client: ['', [Validators.required, Validators.minLength(2)]],
      volume_tonne: ['', [Validators.required, Validators.min(0.01)]],
      date_vente: ['', Validators.required],
      nom_chantier_recepteur: ['', [Validators.required, Validators.minLength(2)]],
      adresse_chantier: ['', [Validators.required, Validators.minLength(5)]],
      produit: ['', [Validators.required]],
      est_validee: [false]
    });

    // Récupérer l'ID depuis l'URL
    this.saisieVenteId = Number(this.route.snapshot.paramMap.get('id'));
  }

  async ngOnInit() {
    if (!this.saisieVenteId) {
      this.snackBar.open('ID de saisie invalide', 'Fermer', { 
        duration: 3000, 
        panelClass: ['error-snackbar'] 
      });
      this.router.navigate(['/saisies-vente']);
      return;
    }

    await this.loadProduits();
    await this.loadSaisieVente();
  }

  async loadProduits() {
    try {
      this.produits = await this.produitVenteService.getAll();
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      this.snackBar.open(
        'Erreur lors du chargement des produits',
        'Fermer',
        { duration: 3000, panelClass: ['error-snackbar'] }
      );
    }
  }

  async loadSaisieVente() {
    try {
      this.isLoading = true;
      this.originalSaisie = await this.createSaisieVenteService.getSaisieVenteById(this.saisieVenteId);
      
      // Pré-remplir le formulaire avec les données existantes
      if (this.originalSaisie) {
        const produitId = this.originalSaisie.produit?.id;
        console.log('Produit sélectionné:', produitId, this.originalSaisie.produit);
        
        this.saisieVenteForm.patchValue({
          nom_client: this.originalSaisie.nom_client,
          volume_tonne: this.originalSaisie.volume_tonne,
          date_vente: this.originalSaisie.date_vente,
          nom_chantier_recepteur: this.originalSaisie.nom_chantier_recepteur,
          adresse_chantier: this.originalSaisie.adresse_chantier,
          produit: produitId, // Utiliser l'ID du produit
          est_validee: this.originalSaisie.est_validee
        });
        
        console.log('Formulaire après patch:', this.saisieVenteForm.value);
      }

    } catch (error) {
      console.error('Erreur lors du chargement de la saisie:', error);
      this.snackBar.open(
        'Erreur lors du chargement de la saisie de vente',
        'Fermer',
        { duration: 3000, panelClass: ['error-snackbar'] }
      );
      this.router.navigate(['/saisies-vente']);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.saisieVenteForm.valid && !this.isUpdating) {
      this.isUpdating = true;
      
      try {
        const formData = this.saisieVenteForm.value;
        const saisieVenteData: CreateSaisieVente = {
          nom_client: formData.nom_client.trim(),
          volume_tonne: formData.volume_tonne.toString(),
          date_vente: formData.date_vente,
          nom_chantier_recepteur: formData.nom_chantier_recepteur.trim(),
          adresse_chantier: formData.adresse_chantier.trim(),
          est_validee: formData.est_validee,
          produit: Number(formData.produit),
        
        };

        // Vérifier la disponibilité du produit seulement si le produit ou le volume a changé
        const produitChanged = this.originalSaisie?.produit?.id !== saisieVenteData.produit;
        const volumeChanged = this.originalSaisie?.volume_tonne !== saisieVenteData.volume_tonne;
        
        if (produitChanged || volumeChanged) {
          const volumeDemande = parseFloat(saisieVenteData.volume_tonne);
          const volumeOriginal = this.originalSaisie ? parseFloat(this.originalSaisie.volume_tonne) : 0;
          const volumeSupplementaire = volumeChanged ? volumeDemande - volumeOriginal : volumeDemande;

          const isAvailable = await this.createSaisieVenteService.checkProductAvailability(
            saisieVenteData.produit, 
            volumeSupplementaire
          );

          if (!isAvailable) {
            this.snackBar.open(
              'Volume insuffisant pour ce produit !', 
              'Fermer', 
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
            this.isUpdating = false;
            return;
          }
        }

        // Mettre à jour la saisie de vente
        await this.createSaisieVenteService.updateSaisieVente(this.saisieVenteId, saisieVenteData);
        
        this.snackBar.open(
          'Saisie de vente modifiée avec succès !', 
          'Fermer', 
          { duration: 3000, panelClass: ['success-snackbar'] }
        );

        // Rediriger vers la liste
        setTimeout(() => {
          this.router.navigate(['/saisies-vente']);
        }, 1500);

      } catch (error) {
        console.error('Erreur lors de la modification:', error);
        this.snackBar.open(
          'Erreur lors de la modification de la saisie de vente', 
          'Fermer', 
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
      } finally {
        this.isUpdating = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.saisieVenteForm.controls).forEach(key => {
      this.saisieVenteForm.get(key)?.markAsTouched();
    });
  }

  onCancel() {
    this.router.navigate(['/saisies-vente']);
  }

  // Getters pour faciliter l'accès aux contrôles dans le template
  get nom_client() { return this.saisieVenteForm.get('nom_client'); }
  get volume_tonne() { return this.saisieVenteForm.get('volume_tonne'); }
  get date_vente() { return this.saisieVenteForm.get('date_vente'); }
  get nom_chantier_recepteur() { return this.saisieVenteForm.get('nom_chantier_recepteur'); }
  get adresse_chantier() { return this.saisieVenteForm.get('adresse_chantier'); }
  get produit() { return this.saisieVenteForm.get('produit'); }
  get est_validee() { return this.saisieVenteForm.get('est_validee'); }
}
