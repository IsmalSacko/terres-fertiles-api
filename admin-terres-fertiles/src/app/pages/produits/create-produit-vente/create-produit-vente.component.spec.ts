import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CreateProduitVenteComponent } from './create-produit-vente.component';
import { MelangeService } from '../../../services/melange.service';
import { ProduitVenteService } from '../../../services/produit-vente.service';

describe('CreateProduitVenteComponent', () => {
  let component: CreateProduitVenteComponent;
  let fixture: ComponentFixture<CreateProduitVenteComponent>;
  let mockMelangeService: jasmine.SpyObj<MelangeService>;
  let mockProduitVenteService: jasmine.SpyObj<ProduitVenteService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const melangeServiceSpy = jasmine.createSpyObj('MelangeService', ['getMelangesSansProduitsVente']);
    const produitVenteServiceSpy = jasmine.createSpyObj('ProduitVenteService', ['createProduitVente']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CreateProduitVenteComponent,
        ReactiveFormsModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MelangeService, useValue: melangeServiceSpy },
        { provide: ProduitVenteService, useValue: produitVenteServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProduitVenteComponent);
    component = fixture.componentInstance;
    mockMelangeService = TestBed.inject(MelangeService) as jasmine.SpyObj<MelangeService>;
    mockProduitVenteService = TestBed.inject(ProduitVenteService) as jasmine.SpyObj<ProduitVenteService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.produitForm.get('melange')?.value).toBeNull();
    expect(component.produitForm.get('fournisseur')?.value).toBe('');
    expect(component.produitForm.get('pret_pour_vente')?.value).toBe(false);
  });

  it('should validate required fields', () => {
    component.produitForm.patchValue({
      melange: null,
      fournisseur: '',
      volume_initial: null,
      date_disponibilite: null
    });

    expect(component.produitForm.valid).toBeFalsy();
    expect(component.produitForm.get('melange')?.hasError('required')).toBeTruthy();
    expect(component.produitForm.get('fournisseur')?.hasError('required')).toBeTruthy();
    expect(component.produitForm.get('volume_initial')?.hasError('required')).toBeTruthy();
    expect(component.produitForm.get('date_disponibilite')?.hasError('required')).toBeTruthy();
  });

  it('should format date correctly', () => {
    const testDate = new Date('2024-12-15');
    const formattedDate = component.formatDate(testDate);
    expect(formattedDate).toBe('2024-12-15');
  });

  it('should navigate to cancel', () => {
    component.onCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/produits']);
  });
});