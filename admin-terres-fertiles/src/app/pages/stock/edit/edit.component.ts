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

@Component({
  selector: 'app-edit',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSelect, MatOption],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  private stockageMelangeService = inject(StockageMelangeService);
  id!: number;
  stockForm!: FormGroup;
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router) {
    
  }
  async ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.stockForm = this.fb.group({
      melange: [null, Validators.required],
      volume: [0, [Validators.required, Validators.min(0)]],
      etat_stock: ['maturation', Validators.required],
      date_mise_en_stock: [''], // ISO date string
      nom_melange: [{value: '', disabled: true}],
    });

    this.loadMelange();
  }

  async loadMelange() {
    try {
      const melange: any = await this.stockageMelangeService.getStockageMelangeById(this.id);
   
      melange.nom_melange = melange.melange_nom ?? melange.melange?.nom ?? '';
      this.stockForm.patchValue({
        melange: melange.melange ?? null,
        volume: melange.volume ?? null,
        etat_stock: melange.etat_stock ?? null,
        date_mise_en_stock: melange.date_mise_en_stock ?? null,
        nom_melange: melange.nom_melange ??   '',
      });
      console.log('Mélange chargé pour édition:', melange);
    } catch (error) {
      console.error('Erreur lors du chargement du mélange:', error);
    }
  }


  async onSubmit() {
    if (this.stockForm.invalid) return;
    try {
      const updatedMelange = await this.stockageMelangeService.updateStockageMelange(this.id, this.stockForm.value);
      console.log('Mélange mis à jour avec succès:', updatedMelange);
      this.router.navigate(['/suivistock']); // Rediriger vers la liste des stocks après la mise à jour
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mélange:', error);
    }
  }

  goBack() {
    this.router.navigate(['/suivistock']);
  }

}
