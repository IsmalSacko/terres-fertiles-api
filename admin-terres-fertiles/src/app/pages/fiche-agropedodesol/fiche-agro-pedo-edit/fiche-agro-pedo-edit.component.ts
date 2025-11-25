import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-fiche-agro-pedo-edit',
  imports: [],
  templateUrl: './fiche-agro-pedo-edit.component.html',
  styleUrl: './fiche-agro-pedo-edit.component.css'
})
export class FicheAgroPedoEditComponent {

  formFicheAgroPedoEdit : FormGroup;

  fb = inject(FormBuilder);

   constructor() {
    this.formFicheAgroPedoEdit = this.fb.group({
      nom : ['', Validators.required],
    });
  }

}
