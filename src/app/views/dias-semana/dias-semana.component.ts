import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api-service.service';
import { DiaRutina, Rutina, Ejercicio } from '../../models/user.interfaces';
import { ModalRutinaComponent } from '../../components/modal-rutina/modal-rutina.component';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-dias-semana',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalRutinaComponent],
  templateUrl: './dias-semana.component.html',
  styleUrl: './dias-semana.component.css'
})
export class DiasSemanaComponent {
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  diasRutina: DiaRutina[] = [];
  rutinas: { [id: string]: Rutina } = {};
  loading = true;
  error = '';

  // Nuevo: estructura para la vista
  calendarioSemana: { dia: string, rutina: Rutina | null }[] = [];

  // Estado para edición interactiva
  editandoDia: number | null = null;
  rutinaSeleccionada: Rutina | null = null;
  listaRutinas: Rutina[] = [];

  rutinaModal: Rutina | null = null;
  ejerciciosModal: Ejercicio[] = [];

  // Estado para el modal de edición de semana
  showEditWeekModal = false;
  editWeekRoutines: (Rutina | null)[] = [];
  editWeekLoading = false;
  editWeekError: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    this.apiService.getDiaRutinas().subscribe({
      next: (res) => {
        let dias: DiaRutina[] = [];
        if ('member' in (res as any)) {
          dias = (res as any)['member'];
        } else if ('hydra:member' in res) {
          dias = res['hydra:member'];
        }
        // Obtener todas las rutinas asociadas primero
        const rutinaIds = Array.from(new Set(dias.map(d => {
          const partes = d.rutina.split('/');
          return partes[partes.length - 1];
        })));
        Promise.all(rutinaIds.map(id => this.apiService.getRutinaById(+id).toPromise()))
          .then(rutinas => {
            const rutinasMap: { [id: string]: Rutina } = {};
            rutinas.forEach(r => { if (r) rutinasMap[r.id] = r; });
            this.rutinas = rutinasMap;
            // Filtrar solo los días de rutina del usuario logueado
            this.diasRutina = userId ? dias.filter(d => {
              const rutinaId = d.rutina.split('/').pop();
              const rutina = rutinaId ? rutinasMap[rutinaId] : undefined;
              return rutina && (
                rutina.usuario?.endsWith(`/usuarios/${userId}`) ||
                rutina.usuario === `/api/usuarios/${userId}` ||
                rutina.usuario === userId
              );
            }) : [];
            // Cargar todas las rutinas para el selector
            this.apiService.getRutinas().subscribe({
              next: (resp) => {
                let todas: Rutina[] = [];
                if ('member' in (resp as any)) {
                  todas = (resp as any)['member'];
                } else if ('hydra:member' in resp) {
                  todas = resp['hydra:member'];
                }
                this.listaRutinas = todas;
                this.prepararCalendario();
                this.loading = false;
              },
              error: () => {
                this.listaRutinas = [];
                this.prepararCalendario();
                this.loading = false;
              }
            });
          });
      },
      error: (err) => {
        this.error = 'Error al cargar los días de rutina';
        this.loading = false;
      }
    });
  }

  editarDia(indice: number, rutina: Rutina | null) {
    this.editandoDia = indice;
    this.rutinaSeleccionada = rutina;
  }

  cancelarEdicion() {
    this.editandoDia = null;
    this.rutinaSeleccionada = null;
  }

  guardarCambioDia(diaSemana: string, rutina: Rutina | null, indice: number) {
    // Buscar si ya existe un DiaRutina para ese día
    const diaR = this.diasRutina.find(d => this.normalizarDia(d.diaSemana) === this.normalizarDia(diaSemana));
    if (rutina) {
      // Si existe, actualizar; si no, crear
      if (diaR && diaR.id !== undefined) {
        this.apiService.actualizarDiaRutina(diaR.id, { rutina: `/api/rutinas/${rutina.id}` }).subscribe({
          next: () => this.refrescarDias(),
          error: () => this.error = 'Error al actualizar el día de rutina'
        });
      } else {
        this.apiService.agregarDia({ diaSemana, rutina: `/api/rutinas/${rutina.id}` }).subscribe({
          next: () => this.refrescarDias(),
          error: () => this.error = 'Error al asignar rutina al día'
        });
      }
    } else {
      // Si se selecciona "Sin rutina", eliminar el DiaRutina si existe
      if (diaR && diaR.id !== undefined) {
        this.apiService.eliminarDiaRutina(diaR.id).subscribe({
          next: () => this.refrescarDias(),
          error: () => this.error = 'Error al eliminar la rutina del día'
        });
      }
    }
    this.editandoDia = null;
    this.rutinaSeleccionada = null;
  }

  refrescarDias() {
    this.loading = true;
    this.apiService.getDiaRutinas().subscribe({
      next: (res) => {
        let dias: DiaRutina[] = [];
        if ('member' in (res as any)) {
          dias = (res as any)['member'];
        } else if ('hydra:member' in res) {
          dias = res['hydra:member'];
        }
        this.diasRutina = dias;
        // Volver a cargar rutinas asociadas
        const rutinaIds = Array.from(new Set(dias.map(d => {
          const partes = d.rutina.split('/');
          return partes[partes.length - 1];
        })));
        Promise.all(rutinaIds.map(id => this.apiService.getRutinaById(+id).toPromise()))
          .then(rutinas => {
            rutinas.forEach(r => { if (r) this.rutinas[r.id] = r; });
            this.prepararCalendario();
            this.loading = false;
          });
      },
      error: () => {
        this.error = 'Error al refrescar los días de rutina';
        this.loading = false;
      }
    });
  }

  abrirModalRutina(rutina: Rutina | null) {
    if (!rutina) return;
    this.rutinaModal = rutina;
    this.ejerciciosModal = [];
    if (rutina.ejercicios && rutina.ejercicios.length > 0) {
      const ids = rutina.ejercicios.map(ej => {
        const partes = ej.split('/');
        return partes[partes.length - 1];
      });
      Promise.all(ids.map(id => this.apiService.getEjercicioById(+id).toPromise()))
        .then(ejercicios => {
          this.ejerciciosModal = ejercicios.filter(e => !!e) as Ejercicio[];
        });
    }
  }

  cerrarModalRutina() {
    this.rutinaModal = null;
    this.ejerciciosModal = [];
  }

  activarEdicionSemana() {
    this.onEditWeek();
  }

  onEditWeek() {
    // Prepara el array de rutinas actuales para el formulario de edición
    this.editWeekRoutines = this.diasSemana.map((diaSemana, i) => {
      const diaR = this.diasRutina.find(d => this.normalizarDia(d.diaSemana) === this.normalizarDia(diaSemana));
      if (diaR) {
        const rutinaId = diaR.rutina.split('/').pop();
        return this.rutinas[rutinaId!];
      }
      return null;
    });
    this.showEditWeekModal = true;
    this.editWeekError = null;
  }

  onCloseEditWeekModal() {
    this.showEditWeekModal = false;
    this.editWeekError = null;
  }

  onSaveEditWeek() {
    this.editWeekLoading = true;
    this.editWeekError = null;
    // Llama a la API para actualizar las rutinas de la semana (puede ser un batch o varias llamadas)
    const updateCalls: Observable<any>[] = this.editWeekRoutines.map((rutina, i) => {
      const diaSemana = this.diasSemana[i];
      if (rutina) {
        // Asigna la rutina al día correspondiente
        return this.apiService.agregarDia({ diaSemana, rutina: `/api/rutinas/${rutina.id}` });
      } else {
        // Elimina la rutina del día si es null
        const diaR = this.diasRutina.find(d => this.normalizarDia(d.diaSemana) === this.normalizarDia(diaSemana));
        if (diaR && diaR.id !== undefined) {
          return this.apiService.eliminarDiaRutina(diaR.id);
        }
        return new Observable(observer => observer.complete());
      }
    });
    forkJoin(updateCalls).subscribe({
      next: () => {
        this.editWeekLoading = false;
        this.showEditWeekModal = false;
        this.refrescarDias(); // Recarga la semana
      },
      error: (err) => {
        this.editWeekLoading = false;
        this.editWeekError = 'Error al guardar los cambios. Intenta de nuevo.';
      }
    });
  }

  onChangeRoutineForDay(index: number, rutina: Rutina | null) {
    this.editWeekRoutines[index] = rutina;
  }

  // Normaliza un string para comparación robusta de días
  private normalizarDia(dia: string): string {
    return dia.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  // Prepara el array para la vista
  prepararCalendario() {
    this.calendarioSemana = this.diasSemana.map(diaSemana => {
      // Buscar si hay rutina para este día (normalizando)
      const diaR = this.diasRutina.find(d =>
        this.normalizarDia(d.diaSemana) === this.normalizarDia(diaSemana)
      );
      let rutina: Rutina | null = null;
      if (diaR) {
        const rutinaId = diaR.rutina.split('/').pop();
        rutina = this.rutinas[rutinaId!];
      }
      return { dia: diaSemana, rutina };
    });
  }
}
