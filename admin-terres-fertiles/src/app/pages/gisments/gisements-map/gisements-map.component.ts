import { Component, OnInit } from '@angular/core';
import { GisementService, Gisement } from '../../../services/gisement.service';
import { Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-gisements-map',
  imports: [],
  templateUrl: './gisements-map.component.html',
  styleUrl: './gisements-map.component.css'
})
export class GisementsMapComponent implements OnInit{
  gisements: Gisement[] = [];
  
  // Centre par défaut sur Lyon pour visualiser directement les gisements locaux
  mapCenter = { lat: 45.764043, lng: 4.835659 }; 
  // Zoom plus large par défaut pour ressembler à la capture (plus petit = plus éloigné)
  mapZoom = 10;
constructor(private gisementService: GisementService,private router: Router){}

async ngOnInit() {
  this.gisements = await this.gisementService.getAllGisementCart()
  //console.log('Gisements chargés:', this.gisements);
  setTimeout(() => this.initMap(), 0);
}

initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: this.mapCenter,
    zoom: this.mapZoom,
    styles: [/* tu peux ajouter un style custom ici */]
  });

  // Ne créer des marqueurs que pour les gisements avec coordonnées valides
  const validGisements = this.gisements.filter(g => typeof g.latitude === 'number' && typeof g.longitude === 'number');
  const bounds = new google.maps.LatLngBounds();

  validGisements.forEach(gis => {
    const position = { lat: gis.latitude, lng: gis.longitude };
    const marker = new google.maps.Marker({ position, map, title: gis.nom });
    bounds.extend(position);

    const info = new google.maps.InfoWindow({
      content: `
        <div style="font-family: Roboto, Arial, sans-serif; min-width: 220px; max-width: 300px;">
          <div style="display: flex; align-items: center; font-size: 1.1em; font-weight: 500; margin-bottom: 6px;">
            <span>${gis.nom}</span> (${gis.chantier_nom})
          </div>
          <div style="color: #666; font-size: 0.97em; margin-bottom: 2px;">
            <span class="material-icons" style="font-size: 16px; vertical-align: middle; color: #888;">place</span>
            ${gis.commune} - ${gis.localisation}
          </div>
          <div style="color: #666; font-size: 0.97em; margin-bottom: 2px;">
            <span class="material-icons" style="font-size: 16px; vertical-align: middle; color: #888;">straighten</span>
            Volume : <b>${gis.volume_terrasse} m³</b>
          </div>
          <div style="color: #666; font-size: 0.97em;">
            <span class="material-icons" style="font-size: 16px; vertical-align: middle; color: #888;">category</span>
            Matériau : <b>${gis.materiau}</b>
          </div>
        </div>
      `
    });

    marker.addListener('mouseover', () => info.open(map, marker));
    marker.addListener('mouseout', () => info.close());
    marker.addListener('click', () => {
    this.router.navigate(['/gisements', gis.id, { mode: 'view' }]);
    });
  });

  // Si des marqueurs existent, ajuster la vue pour les inclure
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds);
    // Limiter un zoom trop proche après fitBounds pour garder une vue large
    google.maps.event.addListenerOnce(map, 'idle', () => {
      if (map.getZoom() > 11) map.setZoom(11);
    });
  }
}
}
