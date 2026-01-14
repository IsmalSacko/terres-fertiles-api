import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    MatSnackBarModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  userForm: FormGroup;
  user: User | null = null;
  private _showDeleteConfirm = false;
  get showDeleteConfirm() {
    return this._showDeleteConfirm;
  }
  set showDeleteConfirm(value: boolean) {
    this._showDeleteConfirm = value;
    if (value) {
      this.userForm.disable();
    } else {
      this.userForm.enable();
    }
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: [''],
      first_name: [''],
      last_name: [''],
      role: [{ value: '', disabled: true }],
      company_name: [''],
      address: [''],
      city: [''],
      postal_code: [''],
      country: [''],
      phone_number: ['']
    });
  }

  async ngOnInit() {
    this.user = await this.authService.getCurrentUser();
    if (this.user) {
      this.userForm.patchValue(this.user);
    }
  }

  async onUpdate() {
    if (this.userForm.valid && this.user) {
      await this.authService.updateUser(this.userForm.getRawValue());
      this.snackBar.open('✅ Profil mis à jour avec succès !', '', {
        duration: 2500,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar']
      });
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }
  }

  async onDelete() {
    await this.authService.deleteUser();
    this.snackBar.open('✅ Compte supprimé avec succès !', '', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
    setTimeout(() => {
      // Redirige vers la page de connexion ou d'accueil après suppression
      window.location.href = '/login';
    }, 2500);
  }
}
