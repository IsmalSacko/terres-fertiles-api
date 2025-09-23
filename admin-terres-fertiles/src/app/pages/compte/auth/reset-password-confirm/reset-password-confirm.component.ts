import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import axios from 'axios';

@Component({
  standalone: true,
  selector: 'app-reset-password-confirm',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password-confirm.component.html',
  styleUrls: ['./reset-password-confirm.component.css'],
})
export class ResetPasswordConfirmComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  uid = this.route.snapshot.paramMap.get('uid')!;
  token = this.route.snapshot.paramMap.get('token')!;

  form = this.fb.group({
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', [Validators.required]]
  });

  successMessage = '';
  errorMessage = '';
  loading = false;

  hideNewPassword = true;
  hideConfirmPassword = true;

  toggleNewPasswordVisibility() {
    this.hideNewPassword = !this.hideNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  async onSubmit() {
    const { new_password, confirm_password } = this.form.value;

    if (new_password !== confirm_password) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await axios.post('http://127.0.0.1:8000/api/auth/users/reset_password_confirm/', {
        uid: this.uid,
        token: this.token,
        new_password
      });
      this.successMessage = 'Votre mot de passe a été modifié.';
      this.loading = false;
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } catch (err: any) {
      this.errorMessage = err.response?.data?.detail || "Lien expiré ou invalide.";
      this.loading = false;
    }
  }
}
