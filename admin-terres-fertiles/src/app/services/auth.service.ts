import axios from 'axios';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_name: string;
  siret_number: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone_number: string;
}
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly base = environment.apiUrl;
  private readonly loginUrl = `${this.base}auth/`;
  private readonly userProfileUrl = `${this.base}user/me/`
  
  // Reactive auth state and current user, to update UI without full reload
  private authStateSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  readonly authState$ = this.authStateSubject.asObservable();

  private userSubject = new BehaviorSubject<User | null>(readUserFromStorage());
  readonly user$ = this.userSubject.asObservable();


  private getHeadres(){
    const token = localStorage.getItem('token');
    return {headers: { Authorization: `Token ${token}` }};
  }

  // Méthode d'authentification
  async login(username: string, password: string): Promise<any> {
    try {
      const response = await axios.post(`${this.loginUrl}token/login/`, { username, password });
      // Accept multiple possible token field names returned by different auth backends
      const token = response.data?.auth_token || response.data?.token || response.data?.key;
      if (token) {
        localStorage.setItem('token', token);
        console.log('Connexion réussie ! 🎉');

        // Récupérer et sauvegarder les informations de l'utilisateur connecté
        try {
          const userResponse = await axios.get(this.userProfileUrl, {
            headers: { Authorization: `Token ${token}` }
          });
          localStorage.setItem('currentUser', JSON.stringify(userResponse.data));
          console.log('Informations utilisateur sauvegardées:', userResponse.data);
          this.userSubject.next(userResponse.data as User);
        } catch (userError) {
          console.error('Erreur lors de la récupération des informations utilisateur:', userError);
        }

        // Notify reactive auth state consumers
        this.authStateSubject.next(true);

        return response.data;
      } else {
        throw new Error('Échec de l\'authentification');
      }
    } catch (error: any) {
      console.error('Nom d\'utilisateur ou mot de passe incorrect ❌');
      throw error.response ? error.response.data.message : 'Erreur de connexion';
    }
  }

  // Méthode pour récupérer l'utilisateur connecté
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!this.getHeadres()) throw new Error('Aucun token trouvé');
    const response = await axios.get(this.userProfileUrl, this.getHeadres());
    localStorage.setItem('currentUser', JSON.stringify(response.data));
    this.userSubject.next(response.data as User);
    return response.data; // Un seul objet User
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
    this.authStateSubject.next(false);

  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  async updateUser(data: Partial<User>): Promise<User> {
    const response = await axios.patch<User>(
      this.userProfileUrl,
      data, this.getHeadres()
     
    );
    localStorage.setItem('currentUser', JSON.stringify(response.data));
    return response.data;
  }

  // Méthode pour supprimer l'utilisateur connecté
  async deleteUser(): Promise<void> {
    await axios.delete(this.userProfileUrl, this.getHeadres());
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
}

// Helper to read user from storage safely at service init
function readUserFromStorage(): User | null {
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed as User;
  } catch {
    return null;
  }
}
