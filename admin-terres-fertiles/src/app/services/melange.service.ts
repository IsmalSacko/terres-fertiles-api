import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';

export interface Plateforme {
  id: number;
  nom: string;
}

export interface Gisement {
  id: number;
  nom: string;
  commune: string;
  materiau: string;
  volume_terrasse: number;
}

// Utilisé pour créer un ingrédient
export interface MelangeIngredientInput {
  gisement: number;
  pourcentage: number;
}

// Utilisé pour lecture (GET)
export interface MelangeIngredient {
  id?: number;
  melange: number;
  gisement: number;
  pourcentage: number;
  gisement_details?: Gisement;
  // Propriétés ajoutées par l'API lors de la lecture
  nom?: string;
  type?: string;
}


export interface AmendementOrganique {
  id: number;
  nom: string;
  fournisseur: string;
  date_reception: string;
  date_semis: string;
  volume_disponible: number;
  localisation?: string;
  latitude?: number;
  longitude?: number;
  palteforme?: number;
  responsable?: number;
}

export interface MelangeAmendement {
  id?: number;
  melange: number;
  amendementOrganique?: number; // camelCase pour compatibilité Angular
  amendement_organique?: number; // snake_case pour compatibilité Django
  pourcentage: number;
  // Propriétés ajoutées par l'API lors de la lecture
  nom?: string;
  type?: string;
}

export enum MelangeEtat {
  COMPOSITION = 1,
  CONFORMITE = 2,
  CONSIGNE = 3,
  CONTROLE_1 = 4,
  CONTROLE_2 = 5,
  VALIDATION = 6
}

export interface Melange {
  id?: number;
  nom: string;
  utilisateur?: string
  nom_complet?: string
  date_creation: string;
  reference_produit: string;
  plateforme: number | null;
  plateforme_details?: Plateforme;
  plateforme_nom?: string;
  fournisseur: string;
  producteur: string;
  couverture_vegetale: string | null;
  periode_melange: string;
  date_semis: string;
  references_analyses: string | null;
  etat: MelangeEtat;
  etat_display?: string;
  ordre_conformite: string | null;
  consignes_melange: string | null;
  controle_1: string | null;
  controle_2: string | null;
  fiche_technique: string | null;
  ingredients: MelangeIngredient[];
  gisements: number[];
  amendements: MelangeAmendement [];
  // Nouveaux champs pour la gestion des brouillons
  is_draft?: boolean;
  draft_timestamp?: string;
}

// Pour POST uniquement (plateforme = ID, ingredients = tableau)
export interface PartialMelange {
  nom: string;
  fournisseur: string;
  couverture_vegetale?: string | null;
  periode_melange: string;
  date_semis: string;
  references_analyses?: string | null;
  plateforme?: number | null;
  ingredients?: MelangeIngredientInput[];
  
}

@Injectable({
  providedIn: 'root'
})
export class MelangeService {
  private apiUrl = 'http://127.0.0.1:8000/api/melanges/';
  private ingredientsApiUrl = 'http://127.0.0.1:8000/api/melanges/';
 
  private plateformesApiUrl = 'http://127.0.0.1:8000/api/plateformes/';
  private amendementsOrganiquesApiUrl = 'http://127.0.0.1:8000/api/amendements-organiques/';
  private melangeAmendementsApiUrl = 'http://127.0.0.1:8000/api/melange-amendements/';


  constructor() {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  // 🔄 Récupérer tous les amendements organiques
async getAmendementsOrganiques(): Promise<AmendementOrganique[]>{
  const response = await axios.get<AmendementOrganique[]>(this.amendementsOrganiquesApiUrl, this.getHeaders());
  return response.data;
}

// 🔄 Récupérer les amendements d'un mélange
async getAmendementsByMelange(melangeId: number): Promise<MelangeAmendement[]> {
  const response = await axios.get<MelangeAmendement[]>(
    `${this.melangeAmendementsApiUrl}?melange=${melangeId}`,
    this.getHeaders()
  );
  return response.data;
}

// ➕ Ajouter un amendement à un mélange
async addAmendement(amendement: MelangeAmendement): Promise<MelangeAmendement> {
  const response = await axios.post<MelangeAmendement>(
    this.melangeAmendementsApiUrl,
    amendement,
    this.getHeaders()
  );
  return response.data;
}

  async getAll(): Promise<Melange[]> {
    try {
      console.log('🌐 Appel API mélanges:', this.apiUrl);
      const response = await axios.get<Melange[]>(this.apiUrl, this.getHeaders());
      console.log('✅ Réponse API mélanges:', response.status, response.data.length, 'mélanges');
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur API mélanges:', error);
      if (error.response) {
        console.error('📄 Détails erreur:', error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async getById(id: number): Promise<Melange> {
    const response = await axios.get<Melange>(`${this.apiUrl}${id}/`, this.getHeaders());
    return response.data;
  }

  async create(melange: PartialMelange): Promise<Melange> {
    try {
      console.log('Données envoyées pour création :', melange);
      const response = await axios.post<Melange>(this.apiUrl, melange, this.getHeaders());
      console.log('Réponse de création reçue:', response.data);
      console.log('ID du mélange créé:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la création du mélange :', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        response: error.response?.data
      });
      throw error;
    }
  }

  async update(id: number, melange: PartialMelange): Promise<Melange> {
    const response = await axios.patch<Melange>(`${this.apiUrl}${id}/`, melange, this.getHeaders());
    return response.data;
  }

  async patch(id: number, melange: Partial<PartialMelange>): Promise<Melange> {
    const response = await axios.patch<Melange>(`${this.apiUrl}${id}/`, melange, this.getHeaders());
    return response.data;
  }

  async patchWithFiles(id: number, data: any): Promise<Melange> {
    const formData = new FormData();
    
    // Ajouter les champs de données au FormData
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value instanceof File) {
        // Si c'est un fichier, l'ajouter directement
        formData.append(key, value);
      } else if (typeof value === 'object' && value !== null) {
        // Si c'est un objet (comme ingredients), le convertir en JSON
        formData.append(key, JSON.stringify(value));
      } else {
        // Sinon, ajouter comme string
        formData.append(key, String(value));
      }
    });
    
    // Headers spéciaux pour FormData (sans Content-Type pour que le navigateur le définisse automatiquement)
    const token = localStorage.getItem('token');
    const headers = { 
      headers: { 
        Authorization: `Token ${token}` 
      } 
    };
    
    const response = await axios.patch<Melange>(`${this.apiUrl}${id}/`, formData, headers);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${this.apiUrl}${id}/`, this.getHeaders());
  }

  async updateEtat(id: number, etat: MelangeEtat): Promise<Melange> {
    const response = await axios.patch<Melange>(`${this.apiUrl}${id}/`, { etat }, this.getHeaders());
    return response.data;
  }

  async getIngredients(melangeId: number): Promise<MelangeIngredient[]> {
    const response = await axios.get<MelangeIngredient[]>(
      `${this.ingredientsApiUrl}?melange=${melangeId}`,
      this.getHeaders()
    );
    return response.data;
  }

  async addIngredient(ingredient: MelangeIngredientInput & { melange: number }): Promise<MelangeIngredient> {
    // Utiliser l'endpoint des mélanges pour ajouter un ingrédient
    const response = await axios.patch<Melange>(
      `${this.apiUrl}${ingredient.melange}/`,
      {
        ingredients: [{
          gisement: ingredient.gisement,
          pourcentage: ingredient.pourcentage
        }]
      },
      this.getHeaders()
    );
    
    // Retourner le premier ingrédient ajouté
    const addedIngredient = response.data.ingredients?.find(ing => 
      ing.gisement === ingredient.gisement && ing.pourcentage === ingredient.pourcentage
    );
    
    if (!addedIngredient) {
      throw new Error('Ingrédient non trouvé après ajout');
    }
    
    return addedIngredient;
  }

  async updateIngredient(id: number, ingredient: Partial<MelangeIngredient>): Promise<MelangeIngredient> {
    const response = await axios.put<MelangeIngredient>(
      `${this.ingredientsApiUrl}${id}/`,
      ingredient,
      this.getHeaders()
    );
    return response.data;
  }

  async deleteIngredient(ingredientId: number): Promise<void> {
    // Pour supprimer un ingrédient, nous devons d'abord récupérer le mélange
    // puis supprimer l'ingrédient de la liste et mettre à jour le mélange
    try {
      // Récupérer tous les mélanges pour trouver celui qui contient l'ingrédient
      const melanges = await this.getAll();
      const melangeWithIngredient = melanges.find(m => 
        m.ingredients?.some(ing => ing.id === ingredientId)
      );
      
      if (!melangeWithIngredient) {
        throw new Error(`Aucun mélange trouvé pour l'ingrédient ${ingredientId}`);
      }
      
      // Filtrer l'ingrédient à supprimer
      const updatedIngredients = melangeWithIngredient.ingredients.filter(
        ing => ing.id !== ingredientId
      );
      
      // Mettre à jour le mélange sans l'ingrédient
      await this.patch(melangeWithIngredient.id!, {
        ingredients: updatedIngredients
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ingrédient:', error);
      throw error;
    }
  }

  async deleteAmendement(amendementId: number): Promise<void> {
    await axios.delete(`${this.melangeAmendementsApiUrl}${amendementId}/`, this.getHeaders());
  }

  async updateAmendement(id: number, data: any): Promise<any> {
    return axios.patch(`${this.melangeAmendementsApiUrl}${id}/`, data, this.getHeaders());
  }

  async getPlateformes(): Promise<Plateforme[]> {
    const response = await axios.get<Plateforme[]>(this.plateformesApiUrl, this.getHeaders());
    return response.data;
  }

  getEtatLabel(etat: MelangeEtat): string {
    const labels = {
      [MelangeEtat.COMPOSITION]: 'Composition',
      [MelangeEtat.CONFORMITE]: 'Ordre fabrication',
      [MelangeEtat.CONSIGNE]: 'Consignes de brassage et stockage',
      [MelangeEtat.CONTROLE_1]: 'Suivi des étapes de stockage et maturation (de 30 jours à 8 mois)',
      [MelangeEtat.CONTROLE_2]: 'Établissement de fiche produit',
      [MelangeEtat.VALIDATION]: 'Validation finale'
    };
    return labels[etat] || 'Inconnu';
  }

  getTacheActuelle(etat: MelangeEtat): string {
    const taches = {
      [MelangeEtat.COMPOSITION]: 'Veuillez composer le mélange avec les gisements.',
      [MelangeEtat.CONFORMITE]: 'Veuillez renseigner un ordre de conformité.',
      [MelangeEtat.CONSIGNE]: 'Veuillez fournir les consignes de mélange.',
      [MelangeEtat.CONTROLE_1]: 'Un contrôle de réduction +1 mois est requis.',
      [MelangeEtat.CONTROLE_2]: 'Établissement de fiche produit requis.',
      [MelangeEtat.VALIDATION]: 'Fiche technique obligatoire.'
    };
    return taches[etat] || '';
  }

  getEtatColor(etat: MelangeEtat): string {
    const colors = {
      [MelangeEtat.COMPOSITION]: 'primary',
      [MelangeEtat.CONFORMITE]: 'warning',
      [MelangeEtat.CONSIGNE]: 'info',
      [MelangeEtat.CONTROLE_1]: 'secondary',
      [MelangeEtat.CONTROLE_2]: 'secondary',
      [MelangeEtat.VALIDATION]: 'success'
    };
    return colors[etat] || 'light';
  }

  async getMelangeCount(): Promise<number> {
    const melanges = await this.getAll();
    return melanges.length;
  }

  async getMelangesSansProduitsVente(): Promise<Melange[]> {
    try {
      console.log('🔍 Récupération des mélanges disponibles (sans produits de vente)...');
      
      // Récupérer tous les mélanges
      const tousMelanges = await this.getAll();
      console.log(`📊 Total mélanges: ${tousMelanges.length}`);
      
      // Récupérer tous les produits de vente pour voir quels mélanges sont déjà utilisés
      const produitsResponse = await axios.get(
        'http://127.0.0.1:8000/api/produits/',
        this.getHeaders()
      );
      
      const produitsVente = produitsResponse.data;
      console.log(`📦 Total produits de vente: ${produitsVente.length}`);
      
      // Extraire les IDs des mélanges déjà utilisés
      const melangesUtilises = new Set(
        produitsVente.map((produit: any) => produit.melange?.id || produit.melange).filter(Boolean)
      );
      
      console.log(`🚫 Mélanges déjà utilisés: ${Array.from(melangesUtilises).join(', ')}`);
      
      // Filtrer les mélanges disponibles (non utilisés)
      const melangesDisponibles = tousMelanges.filter(melange => 
        melange.id && !melangesUtilises.has(melange.id)
      );
      
      console.log(`✅ Mélanges disponibles: ${melangesDisponibles.length}`);
      melangesDisponibles.forEach(melange => {
        console.log(`   - ${melange.nom} (ID: ${melange.id})`);
      });
      
      return melangesDisponibles;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des mélanges sans produits de vente:', error);
      // Fallback : récupérer tous les mélanges si l'API produits échoue
      console.log('🔄 Fallback: récupération de tous les mélanges');
      return this.getAll();
    }
  }

  async getMelangesSansStock(): Promise<Melange[]> {
    try {
      console.log('🔍 Récupération des mélanges disponibles (sans suivi de stock)...');
      
      // Récupérer tous les mélanges
      const tousMelanges = await this.getAll();
      console.log(`📊 Total mélanges: ${tousMelanges.length}`);
      
      // Récupérer tous les suivis de stock pour voir quels mélanges sont déjà utilisés
      const stockResponse = await axios.get(
        'http://127.0.0.1:8000/api/suivi-stock-plateforme/',
        this.getHeaders()
      );
      
      const suivis = stockResponse.data.results || stockResponse.data;
      console.log(`📦 Total suivis de stock: ${suivis.length}`);
      
      // Extraire les IDs des mélanges déjà utilisés dans les suivis de stock
      const melangesUtilises = new Set(
        suivis.map((suivi: any) => suivi.melange?.id || suivi.melange).filter(Boolean)
      );
      
      console.log(`🚫 Mélanges déjà utilisés dans le stock: ${Array.from(melangesUtilises).join(', ')}`);
      
      // Filtrer les mélanges disponibles (non utilisés dans le stock)
      const melangesDisponibles = tousMelanges.filter(melange => 
        melange.id && !melangesUtilises.has(melange.id)
      );
      
      console.log(`✅ Mélanges disponibles pour le stock: ${melangesDisponibles.length}`);
      melangesDisponibles.forEach(melange => {
        console.log(`   - ${melange.nom} (ID: ${melange.id})`);
      });
      
      return melangesDisponibles;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des mélanges sans stock:', error);
      // Fallback : récupérer tous les mélanges si l'API stock échoue
      console.log('🔄 Fallback: récupération de tous les mélanges');
      return this.getAll();
    }
  }
}
