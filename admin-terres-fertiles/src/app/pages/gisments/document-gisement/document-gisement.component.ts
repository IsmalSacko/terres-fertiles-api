import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DocumentGisementService } from '../../../services/document-gisement.service';
import { ChantierService, Chantier } from '../../../services/chantier.service';
import { DocumentGisement, Gisement } from '../../../services/gisement.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-document-gisement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './document-gisement.component.html',
  styleUrls: ['./document-gisement.component.css']
})
export class DocumentGisementComponent implements OnInit {
  documents: DocumentGisement[] = [];
  loading = false;
  selectedFile: File | null = null;
  gisementId: number = 0;
  chantiers: Chantier[] = [];
  gisementForm: FormGroup;
  showGisementForm = false;

  readonly typesDeSol = [
    { value: 'naturel', label: 'Naturel' },
    { value: 'remanie', label: 'Remanié' },
    { value: 'anthropique', label: 'Anthropique' },
    { value: 'autre', label: 'Autre' }
  ];

  constructor(
    private documentService: DocumentGisementService,
    private chantierService: ChantierService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.route.params.subscribe(params => {
      this.gisementId = +params['id'];
    });

    this.gisementForm = this.fb.group({
      chantier: ['', Validators.required],
      commune: ['', [Validators.required, Validators.maxLength(100)]],
      periode_terrassement: ['', [Validators.required, Validators.maxLength(100)]],
      volume_terrasse: ['', [Validators.required, Validators.min(0)]],
      materiau: ['', [Validators.required, Validators.maxLength(255)]],
      localisation: ['', [Validators.required, Validators.maxLength(255)]],
      latitude: [null],
      longitude: [null],
      type_de_sol: ['naturel', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadDocuments(),
      this.loadChantiers()
    ]);
  }

  private async loadChantiers(): Promise<void> {
    try {
      this.chantiers = await this.chantierService.getAll();
    } catch (error) {
      console.error('Error loading chantiers:', error);
      this.showError('Erreur lors du chargement des chantiers');
    }
  }

  toggleGisementForm(): void {
    this.showGisementForm = !this.showGisementForm;
    if (!this.showGisementForm) {
      this.gisementForm.reset();
    }
  }

  async onSubmitGisement(): Promise<void> {
    if (this.gisementForm.valid) {
      this.loading = true;
      try {
        const gisementData = this.gisementForm.value;
        // Créer le gisement d'abord
        const gisement = await this.documentService.createGisement(gisementData);
        // Puis uploader le document si un fichier est sélectionné
        if (this.selectedFile) {
          await this.documentService.uploadDocument(gisement.id, this.selectedFile);
          this.showSuccess('Document et gisement ajoutés avec succès');
        } else {
          this.showSuccess('Gisement ajouté avec succès');
        }
        this.showGisementForm = false;
        this.gisementForm.reset();
        this.selectedFile = null;
        await this.loadDocuments();
      } catch (error) {
        this.showError('Erreur lors de l\'ajout du gisement');
      } finally {
        this.loading = false;
      }
    }
  }

  private async loadDocuments(): Promise<void> {
    this.loading = true;
    try {
      this.documents = await this.documentService.getAll();
      //this.documents = await this.documentService.getByGisementId(this.gisementId);
    } catch (error) {
      console.error('Error loading documents:', error);
      this.showError('Erreur lors du chargement des documents');
    } finally {
      this.loading = false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.uploadDocument();
    }
  }

  private async uploadDocument(): Promise<void> {
    if (!this.selectedFile) return;

    this.loading = true;
    try {
      await this.documentService.uploadDocument(this.gisementId, this.selectedFile);
      this.showSuccess('Document ajouté avec succès');
      this.loadDocuments();
    } catch (error) {
      this.showError('Erreur lors de l\'ajout du document');
    } finally {
      this.loading = false;
      this.selectedFile = null;
    }
  }

  async previewDocument(doc: DocumentGisement): Promise<void> {
    try {
      const blob = await this.documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      this.showError('Erreur lors de l\'aperçu du document');
    }
  }

  async downloadDocument(doc: DocumentGisement): Promise<void> {
    try {
      const blob = await this.documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nom_fichier;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      this.showError('Erreur lors du téléchargement du document');
    }
  }

  async deleteDocument(doc: DocumentGisement): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        await this.documentService.deleteDocument(doc.id);
        this.showSuccess('Document supprimé avec succès');
        this.loadDocuments();
      } catch (error) {
        this.showError('Erreur lors de la suppression du document');
      }
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 5000, panelClass: ['error-snackbar'] });
  }
} 