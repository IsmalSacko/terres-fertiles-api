import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn =  (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.isAuthenticated()) {
        return true;
    } 
    // Redirection vres /login avec l'URL de retour
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
}