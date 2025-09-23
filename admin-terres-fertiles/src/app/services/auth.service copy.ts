import axios from 'axios';
import { Injectable } from '@angular/core';
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
  private loginUrl = 'http://127.0.0.1:8000/api/auth/'; // à adapter si besoin
  private userProfileUrl = 'http://127.0.0.1:8000/api/user/me/';


  private getHeadres(){
    const token = localStorage.getItem('token');
    return {headers: { Authorization: `Token ${token}` }};
  }

  // Méthode d'authentification
  async login(username: string, password: string): Promise<any> {
    try {
      const response = await axios.post(`${this.loginUrl}token/login/`, { username, password });
      if (response.data.auth_token) {
        localStorage.setItem('token', response.data.auth_token);
        console.log('Connexion réussie ! 🎉');

        // Récupérer et sauvegarder les informations de l'utilisateur connecté
        try {
          const userResponse = await axios.get(this.userProfileUrl, {
            headers: { Authorization: `Token ${response.data.auth_token}` }
          });
          localStorage.setItem('currentUser', JSON.stringify(userResponse.data));
          console.log('Informations utilisateur sauvegardées:', userResponse.data);
        } catch (userError) {
          console.error('Erreur lors de la récupération des informations utilisateur:', userError);
        }

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
    return response.data; // Un seul objet User
  }

  logout(){
    localStorage.removeItem('token');

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
