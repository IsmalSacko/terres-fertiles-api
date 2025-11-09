import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AnalyseLaboratoireService, AnalyseLaboratoire } from '../../../services/analyse-laboratoire.service';
import { ProduitVenteService, ProduitVente } from '../../../services/produit-vente.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-analyse-laboratoire-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    HttpClientModule
  ],
  templateUrl: './analyse-laboratoire-detail.component.html',
  styleUrl: './analyse-laboratoire-detail.component.css'
})
export class AnalyseLaboratoireDetailComponent implements OnInit {
  analyse: Partial<AnalyseLaboratoire> = {};
  produitsVente: ProduitVente[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';
  isEditMode = false;
  selectedFile: File | null = null;

  private readonly base = environment.apiUrl;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyseService: AnalyseLaboratoireService,
    private produitVenteService: ProduitVenteService,
    private http: HttpClient
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      await this.loadAnalyse(Number(id));
    } else {
      this.isEditMode = false;
      this.analyse = {
        date_reception: new Date().toISOString().split('T')[0],
        date_analyse: new Date().toISOString().split('T')[0]
      };
    }
    await this.loadProduitsVente();
  }

  async loadAnalyse(id: number): Promise<void> {
    this.loading = true;
    this.errorMsg = '';
    try {
      this.analyse = await this.analyseService.getById(id);
    } catch (err) {
      console.error('Erreur chargement analyse', err);
      this.errorMsg = 'Erreur lors du chargement de l\'analyse.';
    } finally {
      this.loading = false;
    }
  }

  async loadProduitsVente(): Promise<void> {
    try {
      this.produitsVente = await this.produitVenteService.getAll(); // Fetch all produits vente
    } catch (err) {
      console.error('Erreur chargement produits vente', err);
      this.errorMsg = 'Erreur lors du chargement des produits de vente.';
    }
  }

  async saveAnalyse(): Promise<void> {
    if (!this.analyse.produit || !this.analyse.laboratoire || !this.analyse.code_rapport) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      if (this.isEditMode && this.analyse.id) {
        await this.analyseService.update(this.analyse.id, this.analyse);
      } else {
        await this.analyseService.create(this.analyse);
      }
      this.router.navigate(['/analyses-laboratoire']);
    } catch (err: any) {
      console.error('Erreur sauvegarde analyse:', err);
      this.errorMsg = err.error?.message || 'Erreur lors de la sauvegarde.';
    } finally {
      this.loading = false;
    }
  }

  async deleteAnalyse(): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?') && this.analyse.id) {
      this.loading = true;
      this.errorMsg = '';
      try {
        await this.analyseService.delete(this.analyse.id);
        this.router.navigate(['/analyses-laboratoire']);
      } catch (err) {
        console.error('Erreur suppression analyse', err);
        this.errorMsg = 'Erreur lors de la suppression de l\'analyse.';
      } finally {
        this.loading = false;
      }
    }
  }

  cancel() {
    this.router.navigate(['/analyses-laboratoire']);
  }

  // Helper to format date for display if needed
  formatDate(dateString: string | undefined): string | null {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      if (this.selectedFile.type !== 'application/pdf') {
        this.errorMsg = 'Veuillez sélectionner un fichier PDF.';
        this.selectedFile = null;
        element.value = '';
      }
    } else {
      this.selectedFile = null;
    }
  }

  async uploadAndAnalyzeFile(): Promise<void> {
    if (!this.selectedFile) {
      this.errorMsg = 'Veuillez sélectionner un fichier PDF.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const formData = new FormData();
    formData.append('fichier_pdf', this.selectedFile);

    try {
      const response = await this.http.post(`${this.base}analyse-pdf-parse/`, formData).toPromise();
      
      if (response) {
        this.analyse = {
          ...this.analyse,
          ...response
        };
        this.errorMsg = '';
        this.successMsg = 'Données extraites avec succès.';
      }
    } catch (err: any) {
      console.error('Erreur analyse PDF:', err);
      this.errorMsg = err.error?.message || 'Erreur lors de l\'analyse du PDF.';
      this.successMsg = '';
    } finally {
      this.loading = false;
      this.selectedFile = null;
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }
}
