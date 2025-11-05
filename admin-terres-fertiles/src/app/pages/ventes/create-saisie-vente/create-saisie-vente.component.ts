import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import axios from 'axios';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { from, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { CreateSaisieVenteService } from '../../../services/create-saisie-vente.service'
import { CreateSaisieVente, SaisieVenteResponse } from '../../../models/create-saisie-vente.model';
import { ProduitVenteService, ProduitVente } from '../../../services/produit-vente.service';
import { PlateformeService } from '../../../services/plateforme.service';

@Component({
  selector: 'app-create-saisie-vente',
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
  MatAutocompleteModule,
  
  ],
  templateUrl: './create-saisie-vente.component.html',
  styleUrls: ['./create-saisie-vente.component.css']
})
export class CreateSaisieVenteComponent implements OnInit {
  plateformes: any[] = [];
  produitsFiltres: ProduitVente[] = [];
  saisieVenteForm: FormGroup;
  isLoading = false;
  isCreating = false;
  isSuccess = false;
  produits: ProduitVente[] = [];

 
  filteredAdresses: string[] = [];

  constructor(
    private fb: FormBuilder,
    private createSaisieVenteService: CreateSaisieVenteService,
    private produitVenteService: ProduitVenteService,
    private plateformeService: PlateformeService,
    private router: Router,
    private snackBar: MatSnackBar,
    
  ) {
    this.saisieVenteForm = this.fb.group({
      nom_client: ['', [Validators.required, Validators.minLength(2)]],
      volume_tonne: ['', [Validators.required, Validators.min(0.01)]],
      date_vente: [new Date().toISOString().slice(0, 10), Validators.required],
      nom_chantier_recepteur: ['', [Validators.required, Validators.minLength(2)]],
      adresse_chantier: ['', [Validators.required, Validators.minLength(5)]],
      produit: ['', [Validators.required]],
      plateforme: ['', [Validators.required]],
      est_validee: [false]
    });
  }

  // Conversion simple: tonnes -> m³ en supposant densité ~1.3 t/m³ (cohérent avec l'affichage ~34615.38 m³ pour 45000 t)
  private tonnesToM3(tonnes: number): number {
    const DENSITE_T_PAR_M3 = 1.3;
    if (!tonnes || tonnes <= 0) return 0;
    return tonnes / DENSITE_T_PAR_M3;
  }

  async ngOnInit() {
    // Charger d'abord les produits, puis les plateformes (car on filtre les plateformes selon les produits)
    await this.loadProduits();
    await this.loadPlateformes();

    this.saisieVenteForm.get('plateforme')?.valueChanges.subscribe(plateformeId => {
      this.produitsFiltres = this.produits.filter(p => p.melange && (p.melange as any).plateforme === plateformeId);
      this.saisieVenteForm.get('produit')?.setValue(null);
    });

    this.saisieVenteForm.get('adresse_chantier')?.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: string) => {
        if (!value || value.length < 3) {
          return of([]);
        }
        // Axios retourne une Promise, il faut la convertir en Observable avec from()
        return from(
          axios.get('https://api-adresse.data.gouv.fr/search/', {
            params: { q: value, limit: '5' }
          })
        ).pipe(
          map(res => res.data.features.map((f: any) => f.properties.label)),
          catchError(() => of([]))
        );
      })
  )
  .subscribe((results: string[]) => {
    this.filteredAdresses = results;
  });
  }

  // plus besoin de _filterAdresse


  async loadPlateformes() {
    try {
      console.log('🔍 Chargement des plateformes avec produits de vente...');
      
      // Récupérer toutes les plateformes
      const toutesPlateformes = await this.plateformeService.getPlateformes();
      console.log(`📊 Total plateformes: ${toutesPlateformes.length}`);
      
      // Récupérer tous les produits de vente pour identifier les plateformes utilisées
      const produits = await this.produitVenteService.getAll();
      console.log(`📦 Total produits de vente: ${produits.length}`);
      
      // Extraire les IDs des plateformes qui ont des mélanges avec des produits de vente
      const plateformesAvecProduits = new Set<number>();
      
      produits.forEach(produit => {
        if (produit.melange && (produit.melange as any).plateforme) {
          const plateformeId = (produit.melange as any).plateforme;
          plateformesAvecProduits.add(plateformeId);
        }
      });
      
      console.log(`✅ Plateformes avec produits: ${Array.from(plateformesAvecProduits).join(', ')}`);
      
      // Filtrer les plateformes qui ont au moins un produit de vente
      this.plateformes = toutesPlateformes.filter(plateforme => 
        plateforme.id && plateformesAvecProduits.has(plateforme.id)
      );
      
      console.log(`📋 Plateformes disponibles pour saisie: ${this.plateformes.length}`);
      this.plateformes.forEach(plateforme => {
        console.log(`   - ${plateforme.nom} (ID: ${plateforme.id})`);
      });
      
      if (this.plateformes.length === 0) {
        console.log('⚠️ Aucune plateforme avec produits de vente disponibles');
        this.snackBar.open(
          'Aucune plateforme avec des produits de vente disponibles',
          'Fermer',
          { duration: 5000, panelClass: ['warning-snackbar'] }
        );
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des plateformes:', error);
      this.snackBar.open(
        'Erreur lors du chargement des plateformes',
        'Fermer',
        { duration: 3000, panelClass: ['error-snackbar'] }
      );
    }
  }

  async loadProduits() {
    try {
      this.isLoading = true;
      // Désactiver le contrôle pendant le chargement
      this.saisieVenteForm.get('produit')?.disable();
      
      this.produits = await this.produitVenteService.getAll();
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      this.snackBar.open(
        'Erreur lors du chargement des produits',
        'Fermer',
        { duration: 3000, panelClass: ['error-snackbar'] }
      );
    } finally {
      this.isLoading = false;
      // Réactiver le contrôle après le chargement
      this.saisieVenteForm.get('produit')?.enable();
    }
  }

  async onSubmit() {
    if (this.saisieVenteForm.valid && !this.isCreating && !this.isSuccess) {
      this.isCreating = true;
      
      try {
        // Préparer les données selon le format attendu
        const formData = this.saisieVenteForm.value;
        const saisieVenteData: CreateSaisieVente = {
          nom_client: formData.nom_client.trim(),
          volume_tonne: formData.volume_tonne.toString(),
          date_vente: formData.date_vente,
          nom_chantier_recepteur: formData.nom_chantier_recepteur.trim(),
          adresse_chantier: formData.adresse_chantier.trim(),
          est_validee: formData.est_validee,
          produit: Number(formData.produit)
        };

        console.log('Données à créer:', saisieVenteData);

        // Vérifier la disponibilité du produit avant création
        const volumeDemande = parseFloat(saisieVenteData.volume_tonne);
        const isAvailable = await this.createSaisieVenteService.checkProductAvailability(
          saisieVenteData.produit, 
          volumeDemande
        );

        if (!isAvailable) {
          this.snackBar.open(
            'Volume insuffisant pour ce produit !', 
            'Fermer', 
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
          this.isCreating = false;
          return;
        }

        // Créer la saisie de vente
        const createdSaisie: SaisieVenteResponse = await this.createSaisieVenteService.createSaisieVente(saisieVenteData);

        // La mise à jour du volume vendu est désormais gérée côté backend via un signal Django.
        
        this.snackBar.open(
          'Saisie de vente créée avec succès !', 
          'Fermer', 
          { duration: 3000, panelClass: ['success-snackbar'] }
        );

        // Marquer comme succès pour éviter les re-soumissions
        this.isSuccess = true;

        // Reset du formulaire ET réinitialiser l'état
        this.resetForm();
        
        // Optionnellement rediriger vers la liste des saisies après un délai
        setTimeout(() => {
          this.router.navigate(['/saisies-vente']);
        }, 1500); // Rediriger après 1.5 secondes

      } catch (error) {
        console.error('Erreur lors de la création:', error);
        this.snackBar.open(
          'Erreur lors de la création de la saisie de vente', 
          'Fermer', 
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
      } finally {
        this.isCreating = false;
      }
    } else if (!this.isCreating && !this.isSuccess) {
      // Marquer les champs comme touchés seulement si on n'est pas en train de créer et pas en succès
      this.markFormGroupTouched();
    }
  }



  private markFormGroupTouched() {
    Object.keys(this.saisieVenteForm.controls).forEach(key => {
      this.saisieVenteForm.get(key)?.markAsTouched();
    });
  }

  resetForm() {
    this.isSuccess = false; // Réinitialiser l'état de succès
    this.saisieVenteForm.reset();
    this.saisieVenteForm.patchValue({
      est_validee: false
    });
    // Réinitialiser l'état pristine et untouched
    this.saisieVenteForm.markAsUntouched();
    this.saisieVenteForm.markAsPristine();
    
    // Réinitialiser l'état de chaque contrôle
    Object.keys(this.saisieVenteForm.controls).forEach(key => {
      const control = this.saisieVenteForm.get(key);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
        control.setErrors(null);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/saisie-vente']);
  }



  // Getters pour faciliter l'accès aux contrôles dans le template
  get nom_client() { return this.saisieVenteForm.get('nom_client'); }
  get volume_tonne() { return this.saisieVenteForm.get('volume_tonne'); }
  get date_vente() { return this.saisieVenteForm.get('date_vente'); }
  get nom_chantier_recepteur() { return this.saisieVenteForm.get('nom_chantier_recepteur'); }
  get adresse_chantier() { return this.saisieVenteForm.get('adresse_chantier'); }
  get produit() { return this.saisieVenteForm.get('produit'); }
  get est_validee() { return this.saisieVenteForm.get('est_validee'); }
  get plateforme() { return this.saisieVenteForm.get('plateforme'); }
}
