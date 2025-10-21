import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

   // Méthode pour les token et entête
  getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }
}
