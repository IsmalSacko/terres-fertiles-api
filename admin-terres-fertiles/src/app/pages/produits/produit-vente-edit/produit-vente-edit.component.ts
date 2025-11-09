import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ProduitVenteService, ProduitVente } from '../../../services/produit-vente.service';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import axios from 'axios';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-produit-vente-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  providers: [ProduitVenteService],
  templateUrl: './produit-vente-edit.component.html',
  styleUrl: './produit-vente-edit.component.css'
})
export class ProduitVenteEditComponent implements OnInit {
  loading = false;
  errorMsg = '';
  produit: ProduitVente | null = null;
  melanges: { id: number; nom: string; }[] = [];
  private readonly base = environment.apiUrl;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitVenteService
  ) {}
  // Modèle simple pour le formulaire (cohérent avec le backend et les infos disponibles)
  form = {
    utilisateur: '',
    fournisseur: '',
    melange_id: null as number | null,
    nom_site: '',
    date_disponibilite: '',
    volume_initial: '',
    volume_vendu: '',
    localisation_projet: '',
    commentaires_analyses: '',
    acheteur: '',
    date_achat: '',
    periode_destockage: '',
    pret_pour_vente: false,
  };


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduit(Number(id));
      this.loadMelanges();
    }
  }

  private async loadProduit(id: number): Promise<void> {
    this.loading = true;
    this.errorMsg = '';
    try {
      this.produit = await this.produitService.getProduitById(id);
      // Pré-remplir le formulaire
  this.form.utilisateur = this.produit.utilisateur || '';
  this.form.fournisseur = this.produit.fournisseur || '';
  this.form.melange_id = this.produit.melange?.id || null;
      this.form.nom_site = this.produit.nom_site || '';
      this.form.date_disponibilite = this.produit.date_disponibilite || '';
      this.form.volume_initial = this.produit.volume_initial || '';
      this.form.volume_vendu = this.produit.volume_vendu || '';
      this.form.localisation_projet = this.produit.localisation_projet || '';
      this.form.commentaires_analyses = this.produit.commentaires_analyses || '';
  this.form.acheteur = this.produit.acheteur || '';
  this.form.date_achat = this.produit.date_achat || '';
  this.form.periode_destockage = this.produit.periode_destockage || '';
  this.form.pret_pour_vente = !!this.produit.pret_pour_vente;
    } catch (e) {
      console.error('Erreur lors du chargement du produit à éditer', e);
      this.errorMsg = "Impossible de charger le produit.";
    } finally {
      this.loading = false;
    }
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  private async loadMelanges(): Promise<void> {
    try {
      const resp = await axios.get<{ id: number; nom: string; }[]>(
        `${this.base}api/melanges/`,
        this.getHeaders()
      );
      this.melanges = resp.data || [];
    } catch (e) {
      console.error('Erreur lors du chargement des mélanges', e);
    }
  }

  cancel(): void {
    if (this.produit?.id) {
      this.router.navigate(['/produits', this.produit.id]);
    } else {
      this.router.navigate(['/produits']);
    }
  }

  async save(): Promise<void> {
    if (!this.produit?.id) return;
    try {
      // Mise à jour minimale via PATCH: alignée sur des champs existants côté backend
      const payload: Partial<ProduitVente> = {
        fournisseur: this.form.fournisseur,
        melange: this.form.melange_id as any,
        nom_site: this.form.nom_site,
        date_disponibilite: this.form.date_disponibilite,
        volume_initial: this.form.volume_initial,
        volume_vendu: this.form.volume_vendu,
        localisation_projet: this.form.localisation_projet,
        commentaires_analyses: this.form.commentaires_analyses,
        acheteur: this.form.acheteur,
        date_achat: this.form.date_achat,
        periode_destockage: this.form.periode_destockage,
        pret_pour_vente: this.form.pret_pour_vente,
      } as any;

      // Appel à update (sera ajouté dans le service)
      // @ts-ignore - méthode ajoutée ci-dessous côté service
      await this.produitService.updateProduitVente(this.produit.id, payload);
      this.router.navigate(['/produits', this.produit.id]);
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du produit', e);
      this.errorMsg = "Échec de la sauvegarde.";
    }
  }

  isValid(): boolean {
    return !!(
      this.form.fournisseur &&
      this.form.melange_id &&
      this.form.volume_initial &&
      this.form.date_disponibilite
    );
  }


}