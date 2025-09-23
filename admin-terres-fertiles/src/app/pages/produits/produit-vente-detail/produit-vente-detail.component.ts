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
  providers: [ProduitVenteService],
  templateUrl: './produit-vente-detail.component.html',
  styleUrl: './produit-vente-detail.component.css'
})
export class ProduitVenteDetailComponent implements OnInit {
  produit: ProduitVente | null = null;
  loading = false;
  errorMsg = '';

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
    private produitService: ProduitVenteService
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

  contactVendeur(): void {
    const subject = encodeURIComponent(`Demande d'information - ${this.produit?.reference_produit}`);
    const body = encodeURIComponent(
      `Bonjour,\n\n` +
      `Je suis intéressé(e) par votre produit ${this.produit?.reference_produit}.\n\n` +
      `Détails du produit :\n` +
      `- Site : ${this.produit?.nom_site}\n` +
      `- Volume disponible : ${this.produit?.volume_disponible} m³\n` +
      `- Localisation : ${this.produit?.localisation_projet}\n\n` +
      `Pourriez-vous me donner plus d'informations ?\n\n` +
      `Cordialement,`
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
}
