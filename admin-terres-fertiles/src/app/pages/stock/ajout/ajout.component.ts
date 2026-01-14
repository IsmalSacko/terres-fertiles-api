import { Component, inject, OnInit } from '@angular/core';
import { StockageMelangeService } from '../../../services/stock.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSelect, MatOption } from "@angular/material/select";
import { MelangeService } from '../../../services/melange.service';

@Component({
  selector: 'app-ajout',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSelect, MatOption],
  templateUrl: './ajout.component.html',
  styleUrls: ['./ajout.component.css']
})
export class AjoutComponent implements OnInit {

  private stockageMelangeService = inject(StockageMelangeService);
  private melangeService = inject(MelangeService);
  id!: number;
  melanges: any[] = [];
  stockForm!: FormGroup;
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router) {

  }
  async ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    // Keep a single control for the selected mélange (use `nom_melange` in template)
    // Having both `melange` and `nom_melange` required made the form always invalid.
    this.stockForm = this.fb.group({
      volume: [1, [Validators.required, Validators.min(0)]],
      etat_stock: ['maturation', Validators.required],
      nom_melange: ['', Validators.required],
    });

    this.loadMelanges();
  }

  async loadMelanges() {
    try {
      const melanges: any = await this.melangeService.getAll();
      console.log('Mélanges chargés pour ajout:', melanges);
      this.melanges = melanges;
    } catch (error) {
      console.error('Erreur lors du chargement des mélanges:', error);
    }
   
  }


  async onSubmit() {
    if (this.stockForm.invalid) return;
    try {
      const formValue = this.stockForm.getRawValue();
      const newStock = {
        melange: formValue.nom_melange,
        volume: formValue.volume,
        etat_stock: formValue.etat_stock,
      };
      const createdStock = await this.stockageMelangeService.create(newStock);
      console.log('Nouveau stock créé:', createdStock);
      this.router.navigate(['/suivistock']);
    } catch (error) {
      console.error('Erreur lors de la création du stock:', error);
    }
   
  }

  goBack() {
    this.router.navigate(['/suivistock']);
  }

}
