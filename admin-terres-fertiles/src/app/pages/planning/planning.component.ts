import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanningService } from '../../services/planning/planning.service';
import { MelangeModel } from './melange.model';
import { PlanningFormComponent } from '../planning-form/planning-form.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PlanningComponent implements OnInit {
  constructor(private planningService: PlanningService, private dialog: MatDialog) {}

  melanges: MelangeModel[] = [];
  selectedMelanges: MelangeModel[] = [];
  loading = true;
  error: string | null = null;
  currentYear: number = new Date().getUTCFullYear();
  allMelanges: MelangeModel[] = [];
  allMelangesDisponibles: any[] = []; // Tous les mélanges disponibles (avec et sans planning)
  months: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  weeksInMonth: { [month: string]: number[] } = {}; //Nombre de semaines par mois
  // Interventions pour chaque mélange, semaine et mois
  interventions: {
    responsable: string;
    melange: string;
    week: number;
    month: string;
    note: string;
    date: string;
    statut: string; // Ajoutons le statut
  }[] = [];

  years: number[] = []; // Années disponibles pour le planning
  hoveredNote: string | null = null;
  hoveredIntervention: any | null = null;

  async ngOnInit() {
    const currentYear = new Date().getUTCFullYear();
    for (let i = currentYear - 3; i <= currentYear + 5; i++) {
      this.years.push(i);
    }

    this.buildWeeksInMonth();

    try {
      // Récupérer tous les mélanges disponibles
      this.allMelangesDisponibles = await this.planningService.getMelanges();
      
      // Récupérer les plannings existants
      this.allMelanges = await this.planningService.getPlannings();
      this.melanges = this.allMelanges.filter(m => new Date(m.date_debut).getUTCFullYear() === this.currentYear); // Filtrer par année actuelle    
      this.updateInterventions();
    } catch (err) {
      console.error(err);
      this.error = 'Erreur lors du chargement des plannings';
    } finally {
      this.loading = false;
    }
  }

  onYearChange() {
    // forcer la conversion en number avec + ou parseInt
    const yearNum = +this.currentYear; // OU parseInt(this.currentYear, 10)

    this.melanges = this.allMelanges.filter(m => {
      const d = new Date(m.date_debut);
      console.log('Date:', m.date_debut, 'Local year:', d.getFullYear(), 'UTC year:', d.getUTCFullYear());
      return d.getUTCFullYear() === yearNum;
    });
    console.log(`Année changée: ${yearNum}, nombre de plannings filtrés: ${this.melanges.length}`);
    this.buildWeeksInMonth();
    this.updateInterventions();
  }

  daysInWeekMonth: { [month: string]: { [week: number]: string[] } } = {};

  buildWeeksInMonth() {
    this.weeksInMonth = {};
    this.daysInWeekMonth = {};

    this.months.forEach((month, index) => {
      const firstDay = new Date(this.currentYear, index, 1);
      const lastDay = new Date(this.currentYear, index + 1, 0);

      const weeks = new Set<number>();
      const daysByWeek: { [week: number]: string[] } = {};

      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const [_, week] = this.getWeekNumber(new Date(d));
        weeks.add(week);

        if (!daysByWeek[week]) {
          daysByWeek[week] = [];
        }
        // Format jour en "01", "02", etc.
        daysByWeek[week].push(d.getDate().toString().padStart(2, '0'));
      }

      this.weeksInMonth[month] = Array.from(weeks);
      this.daysInWeekMonth[month] = daysByWeek;
    });
  }

  updateInterventions() {
    this.interventions = this.melanges
      .filter(m => {
      const year = new Date(m.date_debut).getUTCFullYear();
      return year === this.currentYear;
      })
      .map(m => {
      const date = new Date(m.date_debut);
      const [_, week] = this.getWeekNumber(date);
      const month = this.months[date.getMonth()];
      let note = m.titre;
      // Ajout d'un emoji selon le statut
      let emoji = '';
      switch (m.statut) {
        case 'planned':
        emoji = '🗓️';
        break;
        case 'active':
        emoji = '⏳';
        break;
        case 'done':
        emoji = '✅';
        break;
        default:
        emoji = '';
        break;
      }
      note += emoji ? ` ${emoji}` : '';
      return {
        melange: m.melange_nom,
        responsable: m.responsable || 'N/A',
        week,
        month,
        note,
        date: m.date_debut,
        statut: m.statut // Ajoutons le statut directement dans les interventions
      };
      });
    // on met à jour les interventions

    console.log('Interventions mises à jour:', this.interventions.length);
    console.log('Exemple d\'intervention:', this.interventions[0]); // Debug
  }

  getWeekNumber(date: Date): [number, number] {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((+d - +yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
  }

  getPlateformesFromInterventions(): string[] {
    const nomsUniques = new Set(this.melanges.map(m => m.melange_nom));
    return Array.from(nomsUniques);
  }

  // Nouvelle méthode pour obtenir TOUS les mélanges disponibles
  getAllMelangesDisponibles(): string[] {
    return this.allMelangesDisponibles.map(m => m.nom);
  }

  hasAnyIntervention(melange: string): boolean {
    return this.interventions.some(i => i.melange === melange);
  }



  getNote(melange: string, week: number, month: string): string | null {
    const found = this.interventions.find(i =>
        i.melange === melange && i.week === week && i.month === month
    );
    return found ? found.note : null;
  }

  // Nouvelle méthode pour obtenir le statut d'une intervention
  getStatut(melange: string, week: number, month: string): string | null {
    // Chercher dans les interventions qui ont déjà le statut
    const found = this.interventions.find(i =>
        i.melange === melange && i.week === week && i.month === month
    );
    
    if (found) {
      console.log(`getStatut found: melange=${found.melange}, statut=${found.statut}`);
      return found.statut;
    }
    
    console.log(`getStatut NOT found for: melange=${melange}, week=${week}, month=${month}`);
    return null;
  }

  // Méthode pour obtenir la classe CSS selon le statut
  getNoteClass(melange: string, week: number, month: string): string {
    const statut = this.getStatut(melange, week, month);
    console.log(`getNoteClass: melange=${melange}, week=${week}, month=${month}, statut=${statut}`);
    
    if (!statut) {
      console.log('Aucun statut trouvé, utilisation de la classe par défaut');
      return 'note';
    }
    
    let cssClass = '';
    switch (statut) {
      case 'planned': 
        cssClass = 'note note-planned';
        break;
      case 'active': 
        cssClass = 'note note-active';
        break;
      case 'done': 
        cssClass = 'note note-done';
        break;
      default: 
        cssClass = 'note';
        break;
    }
    
    console.log(`CSS class appliquée: ${cssClass}`);
    return cssClass;
  }

  // Méthode pour obtenir le libellé du statut en français
  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'planned': return 'Planifié';
      case 'active': return 'En cours';
      case 'done': return 'Terminé';
      default: return statut;
    }
  }

  onCellHover(plateforme: string, week: number, month: string): void {
    const intervention = this.interventions.find(i =>
        i.melange === plateforme &&
        i.week === week &&
        i.month === month
    );
    
    if (intervention) {
      // Ajouter le statut à l'objet intervention pour l'affichage
      const statut = this.getStatut(plateforme, week, month);
      this.hoveredIntervention = {
        ...intervention,
        statut: statut,
        statutLabel: this.getStatutLabel(statut || '')
      };
    } else {
      this.hoveredIntervention = null;
    }
  }

  onCellLeave(): void {
    this.hoveredIntervention = null;
  }


  onCellClick(melangeNom: string, week: number, month: string) {
    // D'abord essayer de trouver le mélange dans les plannings existants
    const melangeObj = this.melanges.find(m => m.melange_nom === melangeNom);
    let melangeId: number;
    
    if (melangeObj) {
      melangeId = melangeObj.melange;
    } else {
      // Si pas trouvé dans les plannings, chercher dans tous les mélanges disponibles
      const melangeDisponible = this.allMelangesDisponibles.find(m => m.nom === melangeNom);
      if (!melangeDisponible) {
        console.error('Mélange introuvable pour le nom:', melangeNom);
        return;
      }
      melangeId = melangeDisponible.id;
    }

    // Trouver l'intervention existante sur cette cellule
    const existingIntervention = this.melanges.find(m => {
      const date = new Date(m.date_debut);
      const [_, w] = this.getWeekNumber(date);
      const mth = this.months[date.getMonth()];
      return m.melange === melangeId && w === week && mth === month;
    });

    // Calcul date début de la semaine/mois sélectionné pour création si nécessaire
    const monthIndex = this.months.indexOf(month);
    const firstDayOfMonth = new Date(Date.UTC(this.currentYear, monthIndex, 1));
    const dayOffset = (week - this.getWeekNumber(firstDayOfMonth)[1]) * 7;
    const dateDebut = new Date(firstDayOfMonth);
    dateDebut.setUTCDate(firstDayOfMonth.getUTCDate() + dayOffset);

    // Ouvrir la modale avec les données existantes ou nouvelle intervention
    const dialogRef = this.dialog.open(PlanningFormComponent, {
      width: '500px',
      data: {
        melange: existingIntervention ? {...existingIntervention} : {
          id: 0,
          titre: '',
          date_debut: dateDebut.toISOString().substring(0, 10),
          duree_jours: 1,
          statut: 'pending',
          melange: melangeId,
          melange_nom: melangeNom
        }
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (!result) return;

      if (result === 'deleted') {
        // Simplement rafraîchir la liste, pas de suppression côté front
        await this.refreshPlanningList();
        return;
      }

      try {
        if (result.id && result.id !== 0) {
          // Mise à jour du planning
          await this.planningService.updatePlanning(result);
        } else {
          // Création d'un nouveau planning
          await this.planningService.createPlanning(result);
        }
        await this.refreshPlanningList();
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du planning:', err);
      }
    });


  }
// Extraire la logique de rafraîchissement dans une méthode pour éviter répétition
  private async refreshPlanningList() {
    // Rafraîchir aussi la liste des mélanges disponibles
    this.allMelangesDisponibles = await this.planningService.getMelanges();
    
    this.allMelanges = await this.planningService.getPlannings();
    this.melanges = this.allMelanges.filter(m => {
      const d = new Date(m.date_debut);
      return d.getUTCFullYear() === this.currentYear;
    });
    this.updateInterventions();
  }






  getNomMelangeById(id: number): string {
    const found = this.melanges.find(m => m.melange === id);
    return found ? found.melange_nom || '' : '';
  }

  hasIntervention(melange: string, week: number, month: string): boolean {
    return this.interventions.some(i =>
        i.melange === melange && i.week === week && i.month === month
    );
  }
}
