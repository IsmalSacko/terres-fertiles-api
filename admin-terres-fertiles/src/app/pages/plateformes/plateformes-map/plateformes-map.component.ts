import { Component, AfterViewInit } from '@angular/core';
import { PlateformeService } from '../../../services/plateforme.service';
import { Plateforme } from '../../../models/plateforme';
import { MatIconModule } from "@angular/material/icon";
import { Router } from '@angular/router';

@Component({
	selector: 'app-plateformes-map',
	standalone: true,
	templateUrl: './plateformes-map.component.html',
	styleUrls: ['./plateformes-map.component.css'],
	imports: [MatIconModule]
})
export class PlateformesMapComponent implements AfterViewInit {
	plateformes: Plateforme[] = [];
	map: google.maps.Map | undefined;

	constructor(private plateformeService: PlateformeService, private router: Router) {}

	async ngAfterViewInit() {
		await this.loadPlateformes();
		this.initMap();
	}

	async loadPlateformes() {
		try {
			this.plateformes = await this.plateformeService.getPlateformes();
		} catch (error) {
			console.error('Erreur lors du chargement des plateformes:', error);
		}
	}

		initMap() {
			const mapElement = document.getElementById('map');
			if (!mapElement) return;

			// Calculer les bounds pour englober tous les points
			const bounds = new google.maps.LatLngBounds();
			let hasMarkers = false;

			this.plateformes.forEach(p => {
				if (p.latitude && p.longitude) {
					bounds.extend(new google.maps.LatLng(p.latitude, p.longitude));
					hasMarkers = true;
				}
			});

			// Si aucun marqueur, centrer sur la France
			const defaultCenter = { lat: 46.603354, lng: 1.888334 }; // centre France

			this.map = new google.maps.Map(mapElement, {
				center: hasMarkers ? bounds.getCenter().toJSON() : defaultCenter,
				zoom: hasMarkers ? 8 : 6,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				streetViewControl: false,
				fullscreenControl: false
			});

			this.plateformes.forEach(p => {
				if (p.latitude && p.longitude) {
					const marker = new google.maps.Marker({
						position: { lat: p.latitude, lng: p.longitude },
						map: this.map!,
						title: p.nom
					});
					const infoWindow = new google.maps.InfoWindow({
						content: `<b>${p.nom}</b><br>${p.localisation}`
					});
                    marker.addListener('mouseover', () => {
                        infoWindow.open(this.map!, marker);
                    });
                    marker.addListener('mouseout', () => {
                        infoWindow.close();
                    });
					marker.addListener('click', () => {
					    this.editPlateforme(p.id);
					});
				}
			});

			// Adapter le zoom pour englober tous les marqueurs
			if (hasMarkers && this.plateformes.length > 1) {
				this.map.fitBounds(bounds, 60); // 60px de padding
			}
		}

    editPlateforme(id: number) {
    this.router.navigate(['/plateformes/edit', id]);
  }
}
