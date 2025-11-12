import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProduitVenteService, ProduitVente } from '../../../services/produit-vente.service';

@Component({
  selector: 'app-produit-vente-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatButtonToggleModule,
    MatTooltipModule
  ],
  templateUrl: './produit-vente-list.component.html',
  styleUrls: ['./produit-vente-list.component.css']
})
export class ProduitVenteListComponent implements OnInit {
  produits: ProduitVente[] = [];
  filteredProduits: ProduitVente[] = [];
  displayedColumns: string[] = [
    'reference_produit',
    'nom_site',
    'volume_disponible',
    'statut',
    'plateforme',
    'actions'
  ];

  // Pagination
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;
  loading = false;
  Math = Math; // Pour utiliser Math dans le template

  // Vue et affichage
  viewMode: 'cards' | 'table' = 'cards';

  // Filtres
  searchTerm = '';
  selectedStatut = '';
  selectedPlateforme = '';
  plateformes: string[] = [];

  // Tri
  sortBy = 'date_creation';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Statistiques
  stats = {
    disponible: 0,
    partiel: 0,
    vendu: 0
  };

  constructor(private produitService: ProduitVenteService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    await this.loadProduits();
    this.extractPlateformes();
    this.calculateStats();
  }

  private async loadProduits(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.produitService.getProduits(this.currentPage + 1, this.pageSize);
      this.produits = response.results || [];
      this.totalItems = response.count;
      this.filteredProduits = [...this.produits];
      this.applySorting();
      this.extractPlateformes();
      this.calculateStats();
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des produits:', error);
      this.produits = [];
      this.filteredProduits = [];
    } finally {
      this.loading = false;
    }
  }

  async applyFilter(): Promise<void> {
    if (this.searchTerm) {
      try {
        const response = await this.produitService.searchProduits(this.searchTerm);
        this.produits = response.results || [];
      } catch (error: unknown) {
        console.error('Erreur lors de la recherche:', error);
        this.produits = [];
      }
    } else {
      await this.loadProduits();
      return;
    }

    this.filterAndSort();
  }

  private filterAndSort(): void {
    if (!this.produits) {
      this.filteredProduits = [];
      return;
    }

    let filtered = [...this.produits];

    // Filtre par statut
    if (this.selectedStatut) {
      filtered = filtered.filter(produit => {
        const statut = this.getStatutProduit(produit).toLowerCase();
        return statut.includes(this.selectedStatut);
      });
    }

    // Filtre par plateforme
    if (this.selectedPlateforme) {
      filtered = filtered.filter(produit => {
        return produit.plateforme?.nom === this.selectedPlateforme;
      });
    }

    this.filteredProduits = filtered;
    this.applySorting();
    this.calculateStats();
  }

  applySorting(): void {
    if (!this.filteredProduits.length) return;

    this.filteredProduits.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'reference_produit':
          valueA = a.reference_produit || '';
          valueB = b.reference_produit || '';
          break;
        case 'nom_site':
          valueA = a.nom_site || '';
          valueB = b.nom_site || '';
          break;
        case 'date_creation':
          valueA = a.date_creation ? new Date(a.date_creation) : new Date(0);
          valueB = b.date_creation ? new Date(b.date_creation) : new Date(0);
          break;
        case 'statut':
          valueA = this.getStatutProduit(a);
          valueB = this.getStatutProduit(b);
          break;
        default:
          return 0;
      }

      const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  sortTable(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';
    this.applySorting();
  }

  onViewModeChange(): void {
    // La vue se met à jour automatiquement
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatut = '';
    this.selectedPlateforme = '';
    this.sortBy = 'date_creation';
    this.sortDirection = 'desc';
    this.loadProduits();
  }

  private extractPlateformes(): void {
    const plateformesSet = new Set<string>();
    this.produits.forEach(produit => {
      if (produit.plateforme?.nom) {
        plateformesSet.add(produit.plateforme.nom);
      }
    });
    this.plateformes = Array.from(plateformesSet).sort();
  }

  private calculateStats(): void {
    this.stats = {
      disponible: 0,
      partiel: 0,
      vendu: 0
    };

    this.filteredProduits.forEach(produit => {
      const statut = this.getStatutProduit(produit).toLowerCase();
      if (statut === 'disponible') {
        this.stats.disponible++;
      } else if (statut.includes('partiellement')) {
        this.stats.partiel++;
      } else if (statut === 'vendu') {
        this.stats.vendu++;
      }
    });
  }

  getStatsCount(type: 'disponible' | 'partiel' | 'vendu'): number {
    return this.stats[type];
  }

  getStatutProduit(produit: ProduitVente): string {
    if (produit.volume_vendu && produit.volume_initial && 
        parseFloat(produit.volume_vendu.toString()) >= parseFloat(produit.volume_initial)) {
      return 'Vendu';
    } else if (produit.volume_vendu && parseFloat(produit.volume_vendu.toString()) > 0) {
      return 'Partiellement vendu';
    } else {
      return 'Disponible';
    }
  }

  getStatutColor(produit: ProduitVente): string {
    const statut = this.getStatutProduit(produit);
    switch (statut) {
      case 'Vendu':
        return '#f44336';
      case 'Partiellement vendu':
        return '#ff9800';
      default:
        return '#4caf50';
    }
  }

  getVolumePercentage(produit: ProduitVente): number {
    if (!produit.volume_initial || !produit.volume_disponible) return 100;
    
    const initial = parseFloat(produit.volume_initial);
    const disponible = parseFloat(produit.volume_disponible);
    
    return (disponible / initial) * 100;
  }

  openEmailForQuote(produit: ProduitVente): void {
    // Email du destinataire (par défaut, à personnaliser si besoin)
    const destinataire = '';
    // Sujet de l'email
    const subject = `Partage d'opportunité : Produit disponible à la vente - ${produit.reference_produit || produit.nom_site}`;
    // Corps de l'email
    const body = this.generateShareEmailBody(produit);
    // Lien mailto prêt à être partagé
    const mailtoLink = `mailto:${destinataire}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  }

  private generateShareEmailBody(produit: ProduitVente): string {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    return `Bonjour,

Je souhaite vous informer d'une opportunité d'achat sur le catalogue Terres Fertiles :

=== PRODUIT DISPONIBLE ===
Référence : ${produit.reference_produit || 'Non spécifiée'}
Site : ${produit.nom_site || 'Non spécifié'}
Volume disponible : ${( +produit.volume_disponible).toLocaleString()} m³
Date de disponibilité : ${new Date(produit.date_disponibilite).toLocaleDateString('fr-FR')}
Fournisseur : ${produit.fournisseur || 'Non spécifié'}
${produit.chantier_info ? `Chantier source : ${produit.chantier_info.nom} (${produit.chantier_info.localisation})` : ''}
${produit.plateforme ? `Plateforme : ${produit.plateforme.nom} (${produit.plateforme.localisation})` : ''}

N'hésitez pas à me contacter si ce produit vous intéresse ou pour toute question complémentaire.

Cordialement,

---
Partage généré automatiquement le ${currentDate} depuis le catalogue Terres Fertiles`;
  }

  // Méthodes de pagination améliorée
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getVisiblePages(): number[] {
    const totalPages = this.getTotalPages();
    const currentPageNumber = this.currentPage + 1;
    const pages: number[] = [];
    
    // Logique pour afficher 5 pages maximum autour de la page actuelle
    let startPage = Math.max(1, currentPageNumber - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Ajuster le début si on est proche de la fin
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  async goToPage(page: number): Promise<void> {
    if (page >= 0 && page < this.getTotalPages() && page !== this.currentPage) {
      this.currentPage = page;
      await this.loadProduits();
    }
  }

  async onPageSizeChange(): Promise<void> {
    this.currentPage = 0; // Reset à la première page
    await this.loadProduits();
  }

  // Navigue vers la page de création d'un nouveau produit
  addNewProduct(): void {
    this.router.navigate(['/produits/nouveau']);
  }
}
