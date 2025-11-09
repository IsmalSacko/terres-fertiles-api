import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule, ErrorStateMatcher } from '@angular/material/core';
import { MelangeService, Melange, AmendementOrganique, MelangeAmendement } from '../../../services/melange.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

/** Error when invalid control is dirty, touched, or submitted. */
export class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-melange-amendement-list',
  templateUrl: './melange-amendement-list.component.ts.component.html',
  styleUrl: './melange-amendement-list.component.ts.component.css',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    MatIconModule
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ]
})
export class MelangeAmendementListComponent implements OnInit, AfterViewInit {
  melanges: Melange[] = [];
  amendementsOrganiques: AmendementOrganique[] = [];
  forms: { [melangeId: number]: FormGroup } = {};
  loading = false;
  successMessages: { [melangeId: number]: string } = {};
  errorMessages: { [melangeId: number]: string } = {};
  selectedMelangeId: string | null = null;
  @ViewChildren('pourcentageInput') pourcentageInputs!: QueryList<ElementRef>;

  constructor(
    private melangeService: MelangeService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedMelangeId = params['melangeId'];
    });

    this.loading = true;
    try {
      this.melanges = await this.melangeService.getAll();
      this.amendementsOrganiques = await this.melangeService.getAmendementsOrganiques();
      this.melanges.forEach(melange => {
        if (melange.id) {
          this.forms[melange.id] = this.fb.group({
            amendementOrganique: [null, Validators.required],
            pourcentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
          });
        }
      });
      // Pré-remplir le formulaire du mélange sélectionné
      if (this.selectedMelangeId && this.forms[+this.selectedMelangeId]) {
        this.forms[+this.selectedMelangeId].patchValue({
          amendementOrganique: this.amendementsOrganiques.length > 0 ? this.amendementsOrganiques[0].id : null,
          pourcentage: null
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    if (this.selectedMelangeId) {
      setTimeout(() => {
        const element = document.getElementById(`melange-card-${this.selectedMelangeId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight');
        }
        // Focus sur le champ pourcentage du bon formulaire
        const input = this.pourcentageInputs.find(inputRef => {
          return inputRef.nativeElement.closest('.melange-card').id === `melange-card-${this.selectedMelangeId}`;
        });
        if (input) {
          input.nativeElement.focus();
        }
      }, 500);
    }
  }

  async onSubmit(melangeId: number) {
    const form = this.forms[melangeId];
    if (!form || form.invalid) return;

    this.successMessages[melangeId] = '';
    this.errorMessages[melangeId] = '';

    const data = {
      melange: melangeId,
      amendementOrganique: Number(form.value.amendementOrganique),
      pourcentage: Number(form.value.pourcentage)
    };
    console.log('Payload envoyé:', data);

    try {
      await this.melangeService.addAmendement(data as any);
      // Redirection pour rafraîchir la page
      this.router.navigate(['/melanges-amendements']).then(() => {
        window.location.reload();
      });

    } catch (error: any) {
      this.errorMessages[melangeId] = "Erreur lors de l'ajout de l'amendement.";
      if (error && error.response && error.response.data) {
        console.error('Erreur détaillée:', error.response.data);
      } else {
        console.error('Erreur détaillée:', error);
      }
    }
  }
} 