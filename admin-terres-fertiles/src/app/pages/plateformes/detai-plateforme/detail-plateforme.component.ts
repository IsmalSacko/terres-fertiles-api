import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlateformeService } from '../../../services/plateforme.service';
import { Plateforme } from '../../../models/plateforme';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-detail-plateforme',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  
  templateUrl: './detail-plateforme.component.html',
  styleUrl: './detail-plateforme.component.css'
})
export class DetailPlateformeComponent implements AfterViewInit {
  plateforme: Plateforme | null = null;

  constructor(
    private route: ActivatedRoute,
    private plateformeService: PlateformeService,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      try {
        const plateformes = await this.plateformeService.getPlateformes();
        this.plateforme = plateformes.find((p: Plateforme) => p.id === id) || null;
      } catch (error) {
        this.plateforme = null;
      }
    }
  }

  ngAfterViewInit() {
    // Attendre que la plateforme soit chargée puis initialiser la carte
    const observer = new MutationObserver(() => {
      if (this.plateforme && document.getElementById('map-detail')) {
        this.initMap();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  initMap() {
    if (!this.plateforme || !this.plateforme.latitude || !this.plateforme.longitude) return;
    const mapElement = document.getElementById('map-detail');
    if (!mapElement) return;
    const map = new google.maps.Map(mapElement, {
      center: { lat: this.plateforme.latitude, lng: this.plateforme.longitude },
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: false
    });
    const marker = new google.maps.Marker({
      position: { lat: this.plateforme.latitude, lng: this.plateforme.longitude },
      map,
      title: this.plateforme.nom
    });

    // Ouvrir la page d'édition au clic sur le marqueur
    marker.addListener('click', () => {
      if (this.plateforme?.id) {
        this.editPlateforme(this.plateforme.id);
      }
    });

   
  }


  goBack() {
    this.router.navigate(['/plateformes']);
  }

  editPlateforme(id: number) {
    this.router.navigate(['/plateformes/edit', id]);
  }
}
