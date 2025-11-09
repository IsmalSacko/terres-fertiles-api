import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AmendementOrganiqueServiceTsService } from '../../../services/amendement-organique.service.ts.service';
import { PlateformeServiceTsService, Plateforme } from '../../../services/plateforme.service.ts.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-amendement-organique-create',
  imports: [CommonModule, ReactiveFormsModule, ],
  templateUrl: './amendement-organique-create.component.html',
  styleUrl: './amendement-organique-create.component.css'
})
export class AmendementOrganiqueCreateComponent implements OnInit {
  form: FormGroup;
  plateformes: Plateforme[]=[];
  loading =false;
  success = false;
  error = false
constructor(
  private fb: FormBuilder,
  private amendementService: AmendementOrganiqueServiceTsService,
  private plateformeService: PlateformeServiceTsService
){
  this.form = this.fb.group({
    nom: ['', Validators.required],
    fournisseur: ['', Validators.required],
    date_reception: ['', Validators.required],
    date_semis: ['', Validators.required],
    volume_disponible: ['', [Validators.required, Validators.min(0)]],
    localisation: ['', Validators.required],
    latitude: [null],
    longitude: [null],
    plateforme: ['', Validators.required],
    responsable: [null],
  });
}

async ngOnInit() {
  this.plateformes = await this.plateformeService.getAll();
}

async onSubmit(){
  if (this.form.invalid) return;
  this.loading = true;
  this.success = false;
  this.error = false
  try{
    const data = { ...this.form.value, plateforme: Number(this.form.value.palteforme)};
    await this.amendementService.create(data);
    this.success = true;
    this.form.reset();
  } catch (e){
    this.error = true;
  }
  this.loading = false
}
}
