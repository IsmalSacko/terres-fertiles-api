import { Injectable } from '@angular/core';
import axios from 'axios';
import { DocumentGisement, Gisement } from './gisement.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentGisementService {
  private readonly base = environment.apiUrl;
  private readonly apiUrl = `${this.base}documents-gisements/`;
  private readonly gisementApiUrl = `${this.base}gisements/`;

  constructor() {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  private async enrichDocumentsWithGisementDetails(documents: DocumentGisement[]): Promise<DocumentGisement[]> {
    const enrichedDocuments = await Promise.all(
      documents.map(async (doc) => {
        if (typeof doc.gisement === 'number') {
          const gisementResponse = await axios.get<Gisement>(
            `${this.gisementApiUrl}${doc.gisement}/`,
            this.getHeaders()
          );
          return {
            ...doc,
            gisement: gisementResponse.data
          };
        }
        return doc;
      })
    );
    return enrichedDocuments;
  }

  async getAll(): Promise<DocumentGisement[]> {
    const response = await axios.get<DocumentGisement[]>(
      this.apiUrl,
      this.getHeaders()
    );
    return this.enrichDocumentsWithGisementDetails(response.data);
  }

  async getById(id: number): Promise<DocumentGisement> {
    const response = await axios.get<DocumentGisement[]>(
      `${this.apiUrl}?gisement=${id}`,
      this.getHeaders()
    );
    if (response.data && response.data.length > 0) {
      const doc = response.data[0];
      if (typeof doc.gisement === 'number') {
        const gisementResponse = await axios.get<Gisement>(
          `${this.gisementApiUrl}${doc.gisement}/`,
          this.getHeaders()
        );
        return {
          ...doc,
          gisement: gisementResponse.data
        };
      }
      return doc;
    }
    throw new Error('Document non trouvé');
  }

  async getByGisementId(gisementId: number): Promise<DocumentGisement[]> {
    const response = await axios.get<DocumentGisement[]>(
      `${this.apiUrl}?gisement=${gisementId}`,
      this.getHeaders()
    );
    return this.enrichDocumentsWithGisementDetails(response.data);
  }

  async uploadDocument(gisementId: number, file: File, typeDocument: string = 'autre'): Promise<DocumentGisement> {
    const formData = new FormData();
    formData.append('nom_fichier', file.name);
    formData.append('fichier', file)
    formData.append('gisement', gisementId.toString());
    formData.append('type_document', typeDocument);
    formData.append('description', `Document uploadé: ${file.name}`);

    const token = localStorage.getItem('token');
    const response = await axios.post<DocumentGisement>(
      this.apiUrl,
      formData,
      {
        headers: {
          'Authorization': `Token ${token}`,
          // Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
        }
      }
    );
    return response.data;
  }

  async deleteDocument(id: number): Promise<void> {
    await axios.delete(
      `${this.apiUrl}${id}/`,
      this.getHeaders()
    );
  }

  async downloadDocument(id: number): Promise<Blob> {
    // Récupérer le document spécifique par son ID
    const docResponse = await axios.get<DocumentGisement>(
      `${this.apiUrl}${id}/`,
      this.getHeaders()
    );
    
    if (!docResponse.data) {
      throw new Error('Document non trouvé');
    }

    // Télécharger le fichier depuis l'URL stockée
    const response = await axios.get(
      docResponse.data.fichier,
      {
        ...this.getHeaders(),
        responseType: 'blob'
      }
    );
    return response.data;
  }

  async createGisement(gisementData: Partial<Gisement>): Promise<Gisement> {
    const response = await axios.post<Gisement>(
      this.gisementApiUrl,
      gisementData,
      this.getHeaders()
    );
    return response.data;
  }
} 