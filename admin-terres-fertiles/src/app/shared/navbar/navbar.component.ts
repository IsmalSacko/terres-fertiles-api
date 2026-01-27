import { Component, OnDestroy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import {Router, RouterModule} from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import {AuthService, User} from '../../services/auth.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
  CommonModule,
  NgIf,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnDestroy {
  isLoggedIn = false;
  userName: string | null = null;
  isSidenavOpen = false;
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private authService: AuthService) {
    // Initial state
    this.updateAuthState();

    // React to auth state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isLoggedIn = isAuth;
        this.updateUserFromStream();
      });

    // React to user info changes
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateUserFromStream());

    // Also update on route navigation end (useful after redirects)
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((e:any) => e?.constructor?.name === 'NavigationEnd')
      )
      .subscribe(() => this.updateAuthState());
  }

  ngOnInit() {
    this.updateAuthState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.updateUserFromStream();
  }

  private updateUserFromStream() {
    if (!this.isLoggedIn) {
      this.userName = null;
      return;
    }
    const userRaw = localStorage.getItem('currentUser');
    if (!userRaw) { this.userName = null; return; }
    try {
      const u = JSON.parse(userRaw) as User | any;
      const userData: any = Array.isArray(u) ? u[0] : u;
      this.userName = (userData.first_name && userData.last_name)
        ? `${userData.first_name} ${userData.last_name}`
        : (userData.username || userData.email || null);
    } catch {
      this.userName = null;
    }
  }

  logout() {
    this.authService.logout();
    this.updateAuthState();
    this.router.navigate(['/login'], { replaceUrl: true });
    this.closeSidenav();
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

  // Navigue vers la page de réinitialisation de mot de passe (pour utilisateur connecté)
  goToResetPassword(): void {
    this.router.navigate(['/reset-password']);
    this.closeSidenav();
  }

  // Navigue vers la page mot de passe oublié (pour utilisateur non connecté)
  goToForgotPassword(): void {
    this.router.navigate(['/reset-password']);
    this.closeSidenav();
  }

  // Navigue vers la page d'ajout de produit
  goToAddProduct(): void {
    this.router.navigate(['/produits/nouveau']);
    this.closeSidenav();
  }

  // Navigue vers la page admin
  goToAdmin(): void {
    window.location.href = 'https://api.terres-fertiles.com/admin/';
  }
}
