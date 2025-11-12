export interface Plateforme {
  id: number;
  responsable?: string | null;  // Optionnel (ForeignKey nullable)
  nom?: string | null;          // Optionnel (généré automatiquement si vide)
  localisation: string;         // OBLIGATOIRE
  entreprise_gestionnaire: string; // OBLIGATOIRE maintenant
  latitude?: number | null;     // Optionnel
  longitude?: number | null;    // Optionnel
  date_creation?: string;       // Optionnel (valeur par défaut dans le backend)
}
