import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FicheAgroService } from '../../../services/ficheAgroPedoServcices/fiche-agro-pedo.service';
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field";

@Component({
  selector: 'app-fiche-agro-pedo-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fiche-agro-pedo-edit.component.html',
  styleUrls: ['./fiche-agro-pedo-edit.component.css'] // correct
})
export class FicheAgroPedoEditComponent implements OnInit {
  form: FormGroup;
  saving = false;
  isEdit = false;
  ficheId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ficheAgroService: FicheAgroService
  ) {
    this.form = this.fb.group({
      EAP: [{value:'', disabled:true}],
      ville: [''],
      projet: [''],
      date: [''],
      commanditaire: [''],
      observateur: [''],
      nom_sondage: ['', Validators.required],
      coord_x: [null],
      coord_y: [null],
      indication_lieu: [''],
      antecedent_climatique: [''],
      etat_surface: [''],
      couvert_vegetal: [''],
      synthese: ['']
 
    });
  }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.ficheId = idParam ? Number(idParam) : null;
    if (this.ficheId) {
      this.isEdit = true;
      try {
        const fiche = await this.ficheAgroService.get(this.ficheId);
        console.log('Fiche chargée', fiche);
        this.form.patchValue(fiche);
        console.log('Form après patch', this.form.value);
      } catch (err) {
        console.error('Erreur chargement fiche', err);
      }
    }
  }

  async save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    try {
      const payload = this.form.value;
      if (this.isEdit && this.ficheId) {
        const updated = await this.ficheAgroService.update(this.ficheId, payload);
        await this.router.navigate(['/fiches-agro-pedologiques', updated.id]);
      } else {
        const created = await this.ficheAgroService.create(payload);
        await this.router.navigate(['/fiches-agro-pedologiques/new', created.id]);
      }
    } finally { this.saving = false; }
  }

  cancel() { this.router.navigate(['/fiches-agro-pedologiques']); }
}
