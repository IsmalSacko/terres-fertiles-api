export interface Plateforme {
  id: number;
  responsable: string
  nom: string;
  localisation: string;
  entreprise_gestionnaire: string;
  latitude: number | null;
  longitude: number | null;
  date_creation: string | null;
}
