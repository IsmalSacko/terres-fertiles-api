import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {Router, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isLoggedIn = false;
  userName: string | null = null;
  isSidenavOpen = false;

  constructor(private router: Router, private authService: AuthService) {
    this.updateAuthState();
  }

  ngOnInit() {
    this.updateAuthState();
  }

  openSidenav() {
    
    this.isSidenavOpen = true;
  }

  closeSidenav() {
    this.isSidenavOpen = false;
  }

  navigateAndClose(route: string) {
    this.router.navigate([route]);
    this.closeSidenav();
  }

  updateAuthState() {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      const user = localStorage.getItem('currentUser');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          const userData = Array.isArray(userObj) ? userObj[0] : userObj;
          this.userName = (userData.first_name && userData.last_name)
            ? userData.first_name + ' ' + userData.last_name
            : (userData.username || userData.email || null);
        } catch {
          this.userName = null;
        }
      } else {
        this.userName = null;
      }
    } else {
      this.userName = null;
    }
  }

  logout() {
    this.authService.logout();
    this.updateAuthState();
    this.router.navigate(['/']);
    this.closeSidenav();
    window.location.reload();
  }

  login() {
    this.router.navigate(['/login']);
    this.closeSidenav();
    
  }

  // Affiche la page d'inscription
  register() {
    this.router.navigate(['/register']);
    this.closeSidenav();
  }

  goToProfile(): void {
    this.router.navigate(['/profil']);
    this.closeSidenav();
  }
}
