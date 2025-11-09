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
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import * as L from 'leaflet';
import { ProduitVenteService, ProduitVente } from '../../../services/produit-vente.service';
import { ChantierService } from '../../../services/chantier.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-produit-vente-detail',
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
    MatDividerModule,
    MatChipsModule,
  ],
  providers: [ProduitVenteService, ChantierService],
  templateUrl: './produit-vente-detail.component.html',
  styleUrl: './produit-vente-detail.component.css'
})
export class ProduitVenteDetailComponent implements OnInit {
  produit: ProduitVente | null = null;
  loading = false;
  errorMsg = '';
  editChantierMode = false;
  editLocalisation: string | null = null;
  editLatitude: number | null = null;
  editLongitude: number | null = null;

  // Configuration de la carte
  mapOptions: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 13,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 13,
    center: [48.8566, 2.3522],
    zoomControl: true,
    attributionControl: true
  };

  private map?: L.Map;
  private produitMarker?: L.Marker;
  mapLayers: L.Layer[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitVenteService,
    private chantierService: ChantierService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.loadProduit(Number(id));
    }
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    setTimeout(() => {
      if (this.map && this.produit?.chantier_info?.latitude && this.produit?.chantier_info?.longitude) {
        this.map.invalidateSize();
        this.map.setView([this.produit.chantier_info.latitude, this.produit.chantier_info.longitude], 13);
      }
    }, 0);
  }

  private async loadProduit(id: number): Promise<void> {
    this.loading = true;
    this.errorMsg = '';
    try {
      this.produit = await this.produitService.getProduitById(id);
      console.log('Produit chargé:', this.produit);
      console.log('Propriétés disponibles:', Object.keys(this.produit || {}));
      console.log('Volume initial:', this.produit?.volume_initial);
      console.log('Volume vendu:', this.produit?.volume_vendu);
      console.log('Volume calculé:', this.getVolumeDisponibleCalcule());
      
      if (this.produit?.chantier_info?.latitude && this.produit?.chantier_info?.longitude) {
        const latLng: L.LatLngExpression = [this.produit.chantier_info.latitude, this.produit.chantier_info.longitude];
        
        this.produitMarker = L.marker(latLng, {
          title: this.produit.nom_site || 'Site'
        });

        this.produitMarker.bindPopup(`
          <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 5px 8px;">
            <strong style="display: block; margin-bottom: 4px;">
              ${this.produit?.nom_site || 'Site'}
            </strong>
            <div style="margin-bottom: 4px;">
              ${this.produit?.volume_disponible} m³ disponible
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${this.produit.chantier_info?.latitude},${this.produit.chantier_info?.longitude}" 
               target="_blank" 
               style="display: inline-block; color: #1976d2; text-decoration: none; font-weight: 500; margin-top: 4px;">
              🗺️ Obtenir l'itinéraire
            </a>
          </div>
        `);

        this.produitMarker.on('mouseover', () => {
          this.produitMarker?.openPopup();
        });

        this.produitMarker.on('mouseout', () => {
          this.produitMarker?.closePopup();
        });

        this.mapLayers.push(this.produitMarker);
      }
    } catch (err) {
      console.error('Erreur lors du chargement du produit:', err);
      this.errorMsg = 'Erreur lors du chargement du produit.';
    } finally {
      this.loading = false;
    }
  }

  partagerAvecAcheteur(): void {
    if (!this.produit) return;
    const subject = encodeURIComponent(`Demande d'information - ${this.produit.reference_produit}`);
    const body = encodeURIComponent(
      `Bonjour,\n\n` +
      `Nous vous informons de la disponibilité du produit suivant :\n\n` +
      `- Référence : ${this.produit.reference_produit}\n` +
      `- Site d'origine : ${this.produit.chantier_info?.nom } (${this.produit.chantier_info?.localisation})\n` +
      `- Volume disponible : ${this.produit.volume_disponible} m³\n` +
      `- Localisation : ${this.produit.localisation_projet}\n\n` +
      `Pour toute demande complémentaire, vous pouvez nous contacter à l'adresse suivante : contact@terres-fertiles.fr\n\n` +
      `Cordialement,\n` +
      `L'équipe Terres Fertiles`
    );
    window.location.href = `mailto:contact@terres-fertiles.fr?subject=${subject}&body=${body}`;
  }

  getStatutProduit(): string {
    if (this.produit?.volume_vendu && this.produit?.volume_initial && 
        parseFloat(this.produit.volume_vendu) >= parseFloat(this.produit.volume_initial)) {
      return 'Vendu';
    } else if (this.produit?.volume_vendu && parseFloat(this.produit.volume_vendu) > 0) {
      return 'Partiellement vendu';
    } else {
      return 'Disponible';
    }
  }

  getStatutColor(): string {
    const statut = this.getStatutProduit();
    switch (statut) {
      case 'Vendu':
        return '#f44336';
      case 'Partiellement vendu':
        return '#ff9800';
      default:
        return '#4caf50';
    }
  }

  getVolumeDisponibleCalcule(): number {
    if (!this.produit) return 0;
    const volumeInitial = parseFloat(this.produit.volume_initial || '0');
    const volumeVendu = parseFloat(this.produit.volume_vendu || '0');
    return Math.max(0, volumeInitial - volumeVendu);
  }

  getTempsPlateformeCalcule(): number {
    if (!this.produit?.melange?.date_creation) return 0;
    const dateCreation = new Date(this.produit.melange.date_creation);
    const maintenant = new Date();
    const diffTime = Math.abs(maintenant.getTime() - dateCreation.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDelaiDisponibiliteCalcule(): number {
    if (!this.produit?.date_disponibilite) return 0;
    const dateDisponibilite = new Date(this.produit.date_disponibilite);
    const maintenant = new Date();
    const diffTime = dateDisponibilite.getTime() - maintenant.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  async editChantier(): Promise<void> {
    if (!this.produit?.chantier_info?.id) {
      window.alert("Aucun chantier n'est associé à ce produit. Ajoutez au moins un gisement au mélange pour définir un chantier d'origine.");
      return;
    }
    this.editChantierMode = true;
    this.editLocalisation = this.produit.chantier_info.localisation || '';
    this.editLatitude = this.produit.chantier_info.latitude || null;
    this.editLongitude = this.produit.chantier_info.longitude || null;
  }

  async cancelEditChantier(): Promise<void> {
    this.editChantierMode = false;
  }

  async saveChantier(): Promise<void> {
    if (!this.produit?.chantier_info?.id) return;
    try {
      await this.chantierService.update(this.produit.chantier_info.id, {
        localisation: this.editLocalisation || '',
        latitude: this.editLatitude,
        longitude: this.editLongitude,
      });
      if (this.produit?.id) {
        await this.loadProduit(this.produit.id);
      }
    } catch (e) {
      console.error('Erreur de mise à jour du chantier', e);
    } finally {
      this.editChantierMode = false;
    }
  }

  // Ouvre la page d'édition du produit
  goToEdit(): void {
    if (!this.produit?.id) return;
    this.router.navigate(['/produits/edit', this.produit.id]);
  }

    async pVenteDelete(): Promise<void> {
    const id = this.produit?.id;
    if (!id) return;

    const { isConfirmed } = await Swal.fire({
      title: 'Supprimer le produit ?',
      text: `Cette action est irréversible. Supprimer « ${this.produit?.nom_site || 'Produit'} » ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    });
    if (!isConfirmed) return;

    try {
      await this.produitService.deleteProduitVente(id);
      await Swal.fire('Supprimé', 'Le produit a été supprimé.', 'success');
      this.router.navigate(['/produits']);
    } catch (e) {
      console.error('Erreur lors de la suppression du produit', e);
      Swal.fire('Erreur', 'La suppression a échoué.', 'error');
    }
  }
}
