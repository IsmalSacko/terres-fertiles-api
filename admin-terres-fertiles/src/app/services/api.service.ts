// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class ApiService {

//   constructor() { }

//    // Méthode pour les token et entête
//   getHeaders() {
//     const token = localStorage.getItem('token');
//     return { headers: { Authorization: `Token ${token}` } };
//   }
// }
// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders
} from 'axios';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: environment.apiUrl,
    });

    // Request interceptor typé correctement
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        const shortToken = token ? `${String(token).slice(0, 12)}...` : null;
        // Diagnostic: afficher token stocké et valeur du header Authorization (temporaire)
        console.debug('[ApiService] interceptor - localStorage token present:', !!token, 'token:', shortToken);
        if (token) {
          // Normalise headers en AxiosHeaders puis set la valeur
          config.headers = new AxiosHeaders(config.headers);
          const authValue = `Token ${token}`;
          (config.headers as AxiosHeaders).set('Authorization', authValue);
          // Lire et afficher l'en-tête qui vient d'être défini
          try {
            const currentAuth = (config.headers as AxiosHeaders).get('Authorization');
            console.debug('[ApiService] interceptor - Authorization header set:', currentAuth);
          } catch (e) {
            console.debug('[ApiService] interceptor - Authorization header set (read failed)');
          }
        } else {
          console.debug('[ApiService] interceptor - no token, Authorization header not set');
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error?.response?.status === 401) {
          // gestion globale (optionnelle)
        }
        return Promise.reject(error);
      }
    );
  }

  get instance(): AxiosInstance {
    return this.axiosInstance;
  }

  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<T>(url, config);
  }
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.post<T>(url, data, config);
  }
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.patch<T>(url, data, config);
  }
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<T>(url, data, config);
  }
  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config);
  }
}
