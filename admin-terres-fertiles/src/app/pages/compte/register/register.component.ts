import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import axios from 'axios';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm : FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private router: Router, private cdr: ChangeDetectorRef) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: [''],
      role: ['', Validators.required],
      company_name: ['', Validators.required],
      siret_number: [''],
    })
  }

  async onSubmit(){
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.successMessage = null;
      this.errorMessage = null;
      try{
        const data = { ...this.registerForm.value };
        if (!data.siret_number) {
          delete data.siret_number;
        }
        const response = await axios.post('http://127.0.0.1:8000/api/auth/users/', data);
        this.successMessage = "Inscription réussie ! Redirection vers la connexion...";
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      }catch (error: any) {
        if (error.response && error.response.data) {
          this.errorMessage = 'Erreur : ' + Object.values(error.response.data).join(' ');
        } else {
          this.errorMessage = "Erreur lors de l'inscription";
        }
        this.cdr.detectChanges();
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
