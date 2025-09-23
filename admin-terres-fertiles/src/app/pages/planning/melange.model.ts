export interface MelangeModel {
  id: number;
  titre: string;
  responsable: string;
  date_debut: string;
  duree_jours: number;
  statut: string;
  melange: number;           // l’ID du mélange
  melange_nom: string;       // 👈 le nom du mélange (doit être envoyé par l’API)
}


