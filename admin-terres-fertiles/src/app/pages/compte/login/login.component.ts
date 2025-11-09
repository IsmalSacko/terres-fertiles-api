import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule,CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMsg = '';
  loading = false;
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  async login() {
    this.errorMsg = '';
    this.loading = true;
    try {
      await this.authService.login(this.username, this.password);
      this.router.navigate(['/dashboard']); // Redirige vers la page d'accueil ou celle de votre choix
     setTimeout(() => {
      window.location.reload();
     }, 100);
     
    } catch (err: any) {
      this.errorMsg = err;
    } finally {
      this.loading = false;
    }
  }
}
