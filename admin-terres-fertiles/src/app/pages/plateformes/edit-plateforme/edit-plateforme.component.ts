import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlateformeService } from '../../../services/plateforme.service';
import { Plateforme } from '../../../models/plateforme';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-edit-plateforme',
  imports: [ReactiveFormsModule, MatInputModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './edit-plateforme.component.html',
  styleUrl: './edit-plateforme.component.css'
})
export class EditPlateformeComponent implements OnInit{
    plateformeForm!: FormGroup;
    plateformId!: number;
    loading = false;
    

    constructor(
      private fb : FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private plateformeService: PlateformeService
    ){}
    // Méthode pour charger les données de la plateforme dès l'initialisation du composant
    async ngOnInit() {
        this.plateformId = Number(this.route.snapshot.paramMap.get('id'));
        this.plateformeForm = this.fb.group({
          nom: ['', Validators.required],
          localisation: ['', Validators.required],
          latitude: ['', Validators.required],
          longitude: ['', Validators.required],
          date_creation: ['', Validators.required],
      });

      this.loadPlateforme();
    }
    // Méthode pour charger les données de la plateforme via l'ID et les afficher dans le formulaire
    async loadPlateforme() {
      this.loading = true;
      this.plateformeService.getPlateformeById(this.plateformId).then(
        (p) => {
          this.plateformeForm.patchValue(p);
          console.log('Plateforme chargée pour édition:', p);
          this.loading = false;
        }
      )
    }

    // Méthode pour soummettre les modifications du formulaire

    async onSubmit() {
      if (this.plateformeForm.invalid) return;
      this.loading = true;
      this.plateformeService.updatePlateforme(this.plateformId, this.plateformeForm.value).then(
        async () => {
          // Laisse le spinner visible 1 seconde avant de rediriger
          await new Promise(resolve => setTimeout(resolve, 1000));
          this.loading = false;
          this.goBack();
        }
      )
    }

    goBack() {this.router.navigate(['/plateformes']);}
}