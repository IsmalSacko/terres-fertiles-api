import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { GisementService, Gisement, DocumentGisement } from '../../../services/gisement.service';
import { DocumentGisementService } from '../../../services/document-gisement.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ChantierService, Chantier } from '../../../services/chantier.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxDropzoneModule } from 'ngx-dropzone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gisement-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTableModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule,
    GoogleMapsModule,
    NgxDropzoneModule
  ],
  templateUrl: './gisement-detail.component.html',
  styleUrl: './gisement-detail.component.css'
})
export class GisementDetailComponent implements OnInit {
  gisement: Partial<Gisement> = {};
  loading = false;
  errorMsg = '';
  isEditMode = false;
  isViewOnly = false;
  chantiers: Chantier[] = [];
  originalGisement: Gisement | null = null;
  documents: DocumentGisement[] = [];
  selectedFiles: File[] = [];
  selectedDocumentType: string = 'autre';

  mapCenter: google.maps.LatLngLiteral = { lat: 48.8566, lng: 2.3522 };
  mapZoom = 14;
  markerOptions: google.maps.MarkerOptions = { 
    draggable: true,
    icon: {
      url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',
      scaledSize: new google.maps.Size(27, 43)
    }
  };
  markerIconOptions = {
    url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',
    scaledSize: new google.maps.Size(27, 43)
  };
  markerPosition?: google.maps.LatLngLiteral;

  environnementOptions = [
    { value: 'ouvert', viewValue: 'Ouvert' },
    { value: 'remanie', viewValue: 'Remanié' },
    { value: 'entropique', viewValue: 'Entropique' },
    { value: 'autre', viewValue: 'Autre' },
  ];

  documentTypeOptions = [
    { value: 'photo', label: 'Photo' },
    { value: 'geotechnique', label: 'Analyse géotechnique' },
    { value: 'pollution', label: 'Analyse pollution' },
    { value: 'agronomique', label: 'Analyse agronomique' },
    { value: 'autre', label: 'Autre document' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gisementService: GisementService,
    private documentGisementService: DocumentGisementService,
    private chantierService: ChantierService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state?.['viewOnly']) this.isViewOnly = true;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const mode = this.route.snapshot.paramMap.get('mode');
    
    if (id && id !== 'new') {
      this.loadGisement(Number(id));
      
      // Gérer le mode basé sur les paramètres de route
      if (mode === 'edit') {
        this.isEditMode = true;
        this.isViewOnly = false;
      } else {
        this.isEditMode = false;
        this.isViewOnly = true;
      }
    } else {
      this.gisement = {
        nom: '',
        commune: '',
        periode_terrassement: '',
        volume_terrasse: 0,
        materiau: '',
        localisation: '',
        latitude: 48.8566,
        longitude: 2.3522,
        type_de_sol: 'limon'
      };
      this.mapCenter = {
        lat: this.gisement.latitude!,
        lng: this.gisement.longitude!,
      };
      this.markerPosition = { ...this.mapCenter };
    }

    // Écouter les changements de paramètres de route
    this.route.params.subscribe(params => {
      if (params['mode'] === 'edit') {
        this.isEditMode = true;
        this.isViewOnly = false;
        if (this.chantiers.length === 0) {
          this.loadChantiers();
        }
      } else {
        this.isEditMode = false;
        this.isViewOnly = true;
      }
    });
  }

  async loadGisement(id: number): Promise<void> {
    this.loading = true;
    try {
      const loadedGisement = await this.gisementService.getById(id);
      this.gisement = loadedGisement;
      this.originalGisement = { ...loadedGisement };
      this.documents = loadedGisement.documents || [];

      if (this.gisement.latitude && this.gisement.longitude) {
        this.mapCenter = {
          lat: this.gisement.latitude,
          lng: this.gisement.longitude,
        };
        this.markerPosition = { ...this.mapCenter };
      }

      // Charger les chantiers si on est en mode édition
      if (this.isEditMode) {
        await this.loadChantiers();
      }
    } catch (err) {
      console.error('Erreur lors du chargement du gisement:', err);
      this.errorMsg = 'Erreur lors du chargement du gisement.';
    } finally {
      this.loading = false;
    }
  }

  private async loadChantiers(): Promise<void> {
    try {
      this.chantiers = await this.chantierService.getAll();
    } catch (err) {
      console.error('Erreur lors du chargement des chantiers:', err);
      this.errorMsg = 'Erreur lors du chargement des chantiers.';
    }
  }

  downloadDocument(doc: DocumentGisement): void {
    if (doc.fichier) {
      window.open(doc.fichier, '_blank');
    } else {
      this.errorMsg = 'URL du fichier non disponible';
    }
  }

  previewDocument(doc: DocumentGisement): void {
    if (doc.fichier) {
      window.open(doc.fichier, '_blank');
    } else {
      this.errorMsg = "URL du fichier non disponible";
    }
  }

  async deleteDocument(doc: DocumentGisement): Promise<void> {

    // SweetAlert2 pour confirmation
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: 'Supprimer le document ?',
      text: `Cette action est irréversible. Voulez-vous vraiment supprimer le document "${doc.nom_fichier}" ?`,
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
      await this.documentGisementService.deleteDocument(doc.id);
      // Retirer le document de la liste locale
      if (this.gisement.documents) {
        this.gisement.documents = this.gisement.documents.filter(d => d.id !== doc.id);
      }
      console.log('Document supprimé avec succès');
      await Swal.fire({
        title: 'Supprimé !',
        text: 'Le document a bien été supprimé.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      this.errorMsg = 'Erreur lors de la suppression du document';
      await Swal.fire({
        title: 'Erreur',
        text: 'La suppression a échoué.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      this.loading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/gisements']);
  }

  editGisement() {
    if (this.gisement.id) {
      this.router.navigate(['/gisements', this.gisement.id, { mode: 'edit' }]);
    }
  }
  

  async saveGisement(): Promise<void> {
    if (!this.gisement || !this.gisement.chantier) {
      this.errorMsg = 'Veuillez remplir les champs requis.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    try {
      if (this.isEditMode && this.gisement.id) {
        await this.gisementService.update(this.gisement.id, this.gisement);
      } else if (this.gisement) {
        await this.gisementService.create(this.gisement);
      }
      this.router.navigate(['/gisements']);
    } catch (err: any) {
      this.errorMsg = err.response?.data?.message || 'Erreur lors de la sauvegarde du gisement.';
    } finally {
      this.loading = false;
    }
  }

  cancelEdit(): void {
    if (this.isEditMode && this.originalGisement) {
      this.gisement = { ...this.originalGisement };
    }
    if (this.gisement && this.gisement.id) {
      this.router.navigate(['/gisements', this.gisement.id, { mode: 'view' }]);
    } else {
      this.router.navigate(['/gisements']);
    }
  }

  async deleteGisement(): Promise<void> {
    if (this.gisement && this.gisement.id) {
      const result = await Swal.fire({
        title: 'Supprimer le gisement ?',
        text: 'Cette action est irréversible. Voulez-vous vraiment supprimer ce gisement ?',
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
      try {
        await this.gisementService.delete(this.gisement.id);
        this.router.navigate(['/gisements']);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'Le gisement a bien été supprimé.',
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        });
      } catch (err: any) {
        await Swal.fire({
          title: 'Erreur',
          text: err.response?.data?.message || 'Erreur lors de la suppression du gisement.',
          icon: 'error'
        });
      } finally {
        this.loading = false;
      }
    }
  }

  getChantierNom(chantierId: number | null): string {
    if (chantierId === null) {
      return 'N/A';
    }
    const chantier = this.chantiers.find(c => c.id === chantierId);
    return chantier ? chantier.nom : 'Chantier inconnu';
  }

  getSolTypeName(typeDeSolValue: string): string {
    const option = this.environnementOptions.find(opt => opt.value === typeDeSolValue);
    return option ? option.viewValue : typeDeSolValue;
  }

  // Méthodes pour la carte Google Maps
  updatePosition(event: google.maps.MapMouseEvent): void {
    if (this.isViewOnly || !event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.gisement.latitude = lat;
    this.gisement.longitude = lng;
    this.markerPosition = { lat, lng };
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.gisement.latitude = lat;
    this.gisement.longitude = lng;
    this.markerPosition = { lat, lng };
  }

  openGoogleMaps(): void {
    if (this.gisement.latitude && this.gisement.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.gisement.latitude},${this.gisement.longitude}`;
      window.open(url, '_blank');
    }
  }

  onSelect(event: any): void {
    if (event.addedFiles && event.addedFiles.length > 0) {
      // Ajouter les nouveaux fichiers à la liste existante
      this.selectedFiles = [...this.selectedFiles, ...event.addedFiles];
      console.log('Fichiers sélectionnés:', this.selectedFiles.map(f => f.name));
    }
  }

  onRemove(event: any): void {
    if (event.file) {
      // Supprimer le fichier spécifique de la liste
      this.selectedFiles = this.selectedFiles.filter(f => f !== event.file);
      console.log('Fichier supprimé:', event.file.name);
    }
  }

  async uploadAllDocuments(): Promise<void> {
    if (this.selectedFiles.length === 0 || !this.gisement.id) return;

    this.loading = true;
    this.errorMsg = '';
    
    try {
      console.log(`Uploading ${this.selectedFiles.length} files to gisement:`, this.gisement.id, 'type:', this.selectedDocumentType);
      
      // Uploader tous les fichiers en parallèle
      const uploadPromises = this.selectedFiles.map(file => 
        this.documentGisementService.uploadDocument(this.gisement.id!, file, this.selectedDocumentType)
      );
      
      await Promise.all(uploadPromises);
      
      console.log('Tous les fichiers ont été uploadés avec succès');
      this.selectedFiles = []; // Vider la liste des fichiers sélectionnés
      
      // Recharger le gisement pour afficher les nouveaux documents
      await this.loadGisement(this.gisement.id);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      if (error.response?.data?.message) {
        this.errorMsg = `Erreur lors de l'upload: ${error.response.data.message}`;
      } else if (error.response?.data?.detail) {
        this.errorMsg = `Erreur lors de l'upload: ${error.response.data.detail}`;
      } else {
        this.errorMsg = 'Erreur lors de l\'upload des documents';
      }
    } finally {
      this.loading = false;
    }
  }

  // Méthode pour uploader un seul fichier (gardée pour compatibilité)
  private async uploadDocument(): Promise<void> {
    if (this.selectedFiles.length === 0 || !this.gisement.id) return;
    
    // Si un seul fichier, utiliser la nouvelle méthode
    if (this.selectedFiles.length === 1) {
      await this.uploadAllDocuments();
    } else {
      // Si plusieurs fichiers, uploader tous
      await this.uploadAllDocuments();
    }
  }

  // Méthode pour gérer les changements de mode
  private handleModeChange(): void {
    const mode = this.route.snapshot.paramMap.get('mode');
    if (mode === 'edit') {
      this.isEditMode = true;
      this.isViewOnly = false;
      // Charger les chantiers si pas encore fait
      if (this.chantiers.length === 0) {
        this.loadChantiers();
      }
    } else {
      this.isEditMode = false;
      this.isViewOnly = true;
    }
  }
}
