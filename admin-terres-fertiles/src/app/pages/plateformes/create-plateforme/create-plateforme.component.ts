import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlateformeService } from '../../../services/plateforme.service';
import { Router } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";


@Component({
  selector: 'app-create-plateforme',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule
],
  templateUrl: './create-plateforme.component.html',
  styleUrl: './create-plateforme.component.css'
})
export class CreatePlateformeComponent {
  pForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private plateformeService: PlateformeService,
    private router: Router
  ) {
    this.pForm = this.fb.group({
      nom: ['', Validators?.required],
      localisation: ['', Validators?.required],
      latitude: ['', Validators?.required],
      longitude: ['', Validators?.required],
      date_creation: [new Date().toISOString().slice(0, 10), Validators.required],

    });
  }
  async onSubmit() {
  if (this.pForm.valid) {
    const plateformeData = this.pForm.value;
    try {
      const created = await this.plateformeService.createPlateforme(plateformeData);
      this.router.navigate(['/plateformes', created.id]); // Redirige vers la page de détail
    } catch (error) {
      console.error('Erreur lors de la création de la plateforme:', error);
    }
  }
}

  goToPlateformes() {
    this.router.navigate(['/plateformes']);
  }

} 
