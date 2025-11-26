import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { MatTabsModule } from '@angular/material/tabs';
import { ChantierService, Chantier } from '../../../services/chantier.service';
import { GisementService, Gisement } from '../../../services/gisement.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chantier-detail',
  templateUrl: './chantier-detail.component.html',
  styleUrls: ['./chantier-detail.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    GoogleMapsModule,
    MatTabsModule
  ],
  standalone: true
})
export class ChantierDetailComponent implements OnInit, OnDestroy {
  /** Recharge les gisements du chantier après modification */
  async onGisementModified() {
    if (this.chantier.id) {
      await this.loadGisements(this.chantier.id);
    }
  }
  @ViewChild('googleMap') googleMap!: any; // GoogleMap type si importé
  /** Centre et ajuste le zoom de la carte sur tous les marqueurs (chantier + gisements) */
  fitMapToMarkers(): void {
    if (!window.google || !window.google.maps) return;
    const bounds = new window.google.maps.LatLngBounds();
    // Centrer uniquement sur les gisements du chantier
    if (this.gisements && this.gisements.length > 0) {
      this.gisements.forEach(gisement => {
        if (gisement.latitude && gisement.longitude) {
          bounds.extend(new window.google.maps.LatLng(gisement.latitude, gisement.longitude));
        }
      });
    }
    // Si au moins un point, centrer et ajuster le zoom
    if (!bounds.isEmpty() && this.googleMap) {
      this.googleMap.fitBounds(bounds);
    } else if (!bounds.isEmpty()) {
      // Fallback si pas de composant GoogleMap
      const center = bounds.getCenter();
      this.mapCenter = { lat: center.lat(), lng: center.lng() };
    }
  }
  chantier: Partial<Chantier> = {};
  loading = false;
  errorMsg = '';
  successMsg = '';
  isEditMode = false;
  isViewOnly = false;
  gisements: Gisement[] = [];
  google: any;
  mapCenter: google.maps.LatLngLiteral = { lat: 48.8566, lng: 2.3522 }; 
  mapZoom = 16;
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  markerPosition: google.maps.LatLngLiteral = { lat: 48.8566, lng: 2.3522 };

  mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    fullscreenControl: false,
    zoomControl: true,
    streetViewControl: true,
    gestureHandling: 'cooperative', // Améliore la gestion des gestes
    scrollwheel: true, // Active le scroll de la souris
    disableDoubleClickZoom: false
  };

  mapTypeId: google.maps.MapTypeId = google.maps.MapTypeId.ROADMAP; // Default to 'Plan'

  viewModeMarkerOptions: google.maps.MarkerOptions = {
    icon: {
      url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.pn',
      scaledSize: new google.maps.Size(27, 43)
    }
  };

  editModeMarkerOptions: google.maps.MarkerOptions = {
    draggable: false,
    icon: {
      url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.pn',
      scaledSize: new google.maps.Size(27, 43)
    }
  };

  gisementMarkerIcon: google.maps.Icon = {
    //url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',

    scaledSize: new google.maps.Size(27, 43)
  };

  @ViewChild('chantierInfoWindow') chantierInfoWindow!: MapInfoWindow;
  @ViewChild('chantierInfoWindowSatellite') chantierInfoWindowSatellite!: MapInfoWindow;
  @ViewChild('gisementInfoWindow') gisementInfoWindow!: MapInfoWindow;
  @ViewChild('gisementInfoWindowSatellite') gisementInfoWindowSatellite!: MapInfoWindow;

  // Variables pour gérer le survol des marqueurs
  currentHoverInfoWindow: MapInfoWindow | null = null;
  currentHoverMarker: MapMarker | null = null;
  hoverTimeout: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chantierService: ChantierService,
    private gisementService: GisementService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state?.['viewOnly']) this.isViewOnly = true;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.loadChantier(Number(id));
      this.isEditMode = !this.isViewOnly;
    } else {
      this.chantier = {
        nom: '',
        latitude: 48.8566,
        longitude: 2.3522,
      };
      this.mapCenter = {
        lat: this.chantier.latitude!,
        lng: this.chantier.longitude!,
      };
      this.markerPosition = { ...this.mapCenter };
    }
  }

  async loadChantier(id: number): Promise<void> {
    this.loading = true;
    try {
      this.chantier = await this.chantierService.getById(id);
      if (this.chantier.latitude && this.chantier.longitude) {
        this.mapCenter = {
          lat: this.chantier.latitude,
          lng: this.chantier.longitude,
        };
        this.markerPosition = { ...this.mapCenter };
      }
      await this.loadGisements(id);
      this.fitMapToMarkers();
    } catch (err) {
      this.errorMsg = 'Erreur lors du chargement du chantier.';
    } finally {
      this.loading = false;
    }
  }

 

  private async loadGisements(chantierId: number): Promise<void> {
    try {
      // Récupère tous les gisements liés à ce chantier uniquement
      const allGisements = await this.gisementService.getByChantierId(chantierId);
      // Filtre pour ne garder que ceux attribués à ce chantier (si doublons ou mauvaise association)
      this.gisements = allGisements.filter(g => 
        (typeof g.chantier === 'number' && g.chantier === chantierId) ||
        (typeof g.chantier === 'object' && g.chantier?.id === chantierId)
      );
      this.fitMapToMarkers();
    } catch (err) {
      console.error('Erreur lors du chargement des gisements:', err);
    }
  }

  getGisementsCount(): number {
    return this.gisements.length;
  }

  getTotalVolume(): number {
    if (!this.gisements || this.gisements.length === 0) {
      return 0;
    }
    return this.gisements.reduce((total, gisement) => {
      let volume = 0;
      if (gisement && typeof gisement === 'object' && 'volume_terrasse' in gisement) {
        const rawVolume = (gisement as Gisement).volume_terrasse;
        if (rawVolume !== null && rawVolume !== undefined) {
          const volumeAsString = String(rawVolume).trim().replace(',', '.');
          const parsedVolume = parseFloat(volumeAsString);
          if (!isNaN(parsedVolume)) {
            volume = parsedVolume;
          }
        }
      }
      return total + volume;
    }, 0);
  }

  openGisementDetails(gisement: Gisement): void {
    if (gisement.id) {
      this.router.navigate(['/gisements', gisement.id, { mode: 'view' }]);
    }
  }

  onTabChange(event: any): void {
    if (event.index === 0) {
      this.mapTypeId = google.maps.MapTypeId.ROADMAP; // Plan
    } else {
      this.mapTypeId = google.maps.MapTypeId.SATELLITE; // Satellite
    }
  }

  toggleFullscreen(): void {
    const mapElement = document.querySelector('google-map');
    if (mapElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapElement.requestFullscreen();
      }
    }
  }

  updatePosition(event: google.maps.MapMouseEvent): void {
    if (this.isViewOnly || !event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.chantier.latitude = lat;
    this.chantier.longitude = lng;
    this.markerPosition = { lat, lng };
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.chantier.latitude = lat;
    this.chantier.longitude = lng;
    this.markerPosition = { lat, lng };
  }

  openGoogleMaps(): void {
    if (this.chantier.latitude && this.chantier.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.chantier.latitude},${this.chantier.longitude}`;
      window.open(url, '_blank');
    }
  }

  async saveChantier(): Promise<void> {
    if (!this.chantier.maitre_ouvrage || !this.chantier.entreprise_terrassement || !this.chantier.localisation) {
      this.errorMsg = 'Tous les champs sont requis.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    try {
      if (this.isEditMode && this.chantier.id) {
        await this.chantierService.update(this.chantier.id, this.chantier as Chantier);
        this.successMsg = 'Chantier mis à jour avec succès.';
      } else {
        await this.chantierService.create(this.chantier as Chantier);
        this.successMsg = 'Chantier créé avec succès.';
      }
      setTimeout(() => {
        this.router.navigate(['/chantiers/' + (this.chantier.id || '')]);
      }, 1500);
    } catch (err) {
      this.errorMsg = 'Erreur lors de la sauvegarde.';
    } finally {
      this.loading = false;
    }
  }

  async deleteChantier(): Promise<void> {
    if (!this.chantier.id) return;

    // Confirmation via SweetAlert2
    const result = await Swal.fire({
      title: 'Supprimer le chantier ?',
      text: `Cette action est irréversible. Voulez-vous vraiment supprimer le chantier "${this.chantier.nom || ''}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      await this.chantierService.delete(this.chantier.id);
      this.router.navigate(['/chantiers']);
      await Swal.fire({
        title: 'Supprimé !',
        text: 'Le chantier a bien été supprimé.',
        icon: 'success',
        timer: 1600,
        showConfirmButton: false
      });
    } catch (err: any) {
      console.error('Erreur lors de la suppression du chantier:', err);
      this.errorMsg = err?.response?.data?.message || 'Erreur lors de la suppression du chantier.';
      await Swal.fire({
        title: 'Erreur',
        text: this.errorMsg,
        icon: 'error'
      });
    } finally {
      this.loading = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/chantiers']);
  }

  openChantierInfoWindow(infoWindow: MapInfoWindow, marker: MapMarker) {
    infoWindow.open(marker);
  }

  openGisementInfoWindow(infoWindow: MapInfoWindow, marker: MapMarker, gisement: Gisement) {
    infoWindow.open(marker);
  }

  // Nouvelle méthode pour obtenir la position actuelle
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.chantier.latitude = lat;
          this.chantier.longitude = lng;
          this.mapCenter = { lat, lng };
          this.markerPosition = { lat, lng };
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          this.errorMsg = 'Impossible d\'obtenir votre position actuelle.';
        }
      );
    } else {
      this.errorMsg = 'La géolocalisation n\'est pas supportée par votre navigateur.';
    }
  }

  // Méthode utilitaire pour le tooltip de survol
  getGisementTooltipInfo(gisement: Gisement): string {
    const volume = gisement.volume_terrasse ? `${gisement.volume_terrasse} m³` : 'Non spécifié';
    const materiau = gisement.materiau || 'Non spécifié';
    const commune = gisement.commune || 'Non spécifiée';
    const periode = gisement.periode_terrassement || 'Non spécifiée';
    
    return `${commune} | ${volume} | ${materiau} | Période: ${periode}`;
  }

  // Méthodes pour gérer le survol des marqueurs de gisements
  onGisementMouseOver(marker: MapMarker, infoWindow: MapInfoWindow): void {
    // Annuler le timeout de fermeture si il existe
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    // Fermer l'infoWindow précédente si elle existe et est différente
    if (this.currentHoverInfoWindow && this.currentHoverInfoWindow !== infoWindow) {
      this.currentHoverInfoWindow.close();
    }
    
    // Ouvrir la nouvelle infoWindow seulement si elle n'est pas déjà ouverte
    if (this.currentHoverInfoWindow !== infoWindow) {
      // Configurer les options pour un meilleur positionnement
      const infoWindowOptions = {
        disableAutoPan: false,
        pixelOffset: new google.maps.Size(0, -5), // Décalage pour éviter le chevauchement
        maxWidth: 250
      };
      
      infoWindow.open(marker);
      this.currentHoverInfoWindow = infoWindow;
      this.currentHoverMarker = marker;
    }
  }

  onGisementMouseOut(): void {
    // Utiliser un délai optimisé pour éviter les fermetures accidentelles
    this.hoverTimeout = setTimeout(() => {
      if (this.currentHoverInfoWindow) {
        this.currentHoverInfoWindow.close();
        this.currentHoverInfoWindow = null;
        this.currentHoverMarker = null;
      }
      this.hoverTimeout = null;
    }, 300); // Délai réduit à 300ms pour une meilleure réactivité
  }

  // Méthode pour garder l'info-bulle ouverte quand on survole l'info-bulle elle-même
  onInfoWindowMouseEnter(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  onInfoWindowMouseLeave(): void {
    this.onGisementMouseOut(); // Déclencher la fermeture avec délai
  }

  ngOnDestroy(): void {
    // Nettoyer les timeouts pour éviter les fuites mémoire
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    
    // Fermer l'info-bulle si elle est ouverte
    if (this.currentHoverInfoWindow) {
      this.currentHoverInfoWindow.close();
      this.currentHoverInfoWindow = null;
      this.currentHoverMarker = null;
    }
  }
}
