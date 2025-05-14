import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { Registro, Ejercicio, RegistroEjercicio } from '../../models/user.interfaces';
import { ModalRegistroDiarioComponent } from '../../components/modal-registro-diario/modal-registro-diario.component';

@Component({
  selector: 'app-registros-diarios',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalRegistroDiarioComponent],
  templateUrl: './registros-diarios.component.html',
  styleUrl: './registros-diarios.component.css'
})
export class RegistrosDiariosComponent {
  registros: Registro[] = [];
  loading = true;
  error = '';
  registroModal: Registro | null = null;
  ejerciciosModal: Ejercicio[] = [];
  registroEjerciciosModal: RegistroEjercicio[] = [];
  registroEditando: Registro | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    this.apiService.getRegistros().subscribe({
      next: (res) => {
        let registros: Registro[] = [];
        if ('member' in (res as any)) {
          registros = (res as any)['member'];
        } else if ('hydra:member' in res) {
          registros = res['hydra:member'];
        }
        // Filtrar solo los registros del usuario logueado
        this.registros = userId ? registros.filter(r => {
          // r.usuario puede ser IRI o id directo
          return r.usuario?.endsWith(`/usuarios/${userId}`) ||
                 r.usuario === `/api/usuarios/${userId}` ||
                 r.usuario === userId;
        }) : [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar registros diarios';
        this.loading = false;
      }
    });
  }

  onVerEjercicios(registro: Registro) {
    this.registroModal = registro;
    this.ejerciciosModal = [];
    this.registroEjerciciosModal = [];
    if (registro.registroEjercicios && registro.registroEjercicios.length > 0) {
      const ids = registro.registroEjercicios.map((iri: string) => {
        const match = iri.match(/\d+$/);
        return match ? +match[0] : null;
      }).filter((id: number | null) => id !== null);
      if (ids.length > 0) {
        // Cargar ambos: ejercicios y registros de ejercicio
        this.apiService.getEjercicios().subscribe({
          next: (resEj) => {
            let ejercicios: Ejercicio[] = [];
            if ('member' in (resEj as any)) {
              ejercicios = (resEj as any)['member'];
            } else if ('hydra:member' in resEj) {
              ejercicios = resEj['hydra:member'];
            }
            this.ejerciciosModal = ejercicios;
            this.apiService.getRegistroEjercicios().subscribe({
              next: (resReg) => {
                let registrosEj: RegistroEjercicio[] = [];
                if ('member' in (resReg as any)) {
                  registrosEj = (resReg as any)['member'];
                } else if ('hydra:member' in resReg) {
                  registrosEj = resReg['hydra:member'];
                }
                this.registroEjerciciosModal = registrosEj.filter(r => ids.includes(r.id));
              },
              error: () => {
                this.registroEjerciciosModal = [];
              }
            });
          },
          error: () => {
            this.ejerciciosModal = [];
          }
        });
      }
    }
  }

  onCerrarModalRegistro() {
    this.registroModal = null;
    this.ejerciciosModal = [];
    this.registroEjerciciosModal = [];
  }

  eliminarRegistro(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este registro diario?')) return;
    this.apiService.eliminarRegistro(id).subscribe({
      next: () => {
        this.registros = this.registros.filter(r => r.id !== id);
      },
      error: (err) => {
        console.error('Error al eliminar registro diario:', err);
        this.error = 'Error al eliminar el registro diario: ' + (err?.message || '');
      }
    });
  }

  editarRegistro(registro: Registro) {
    this.registroEditando = { ...registro };
    // Aquí podrías abrir un modal o navegar a un formulario de edición
    // Por ejemplo: this.router.navigate(['/editarRegistro', registro.id]);
    // O mostrar un formulario inline/modal
    alert('Funcionalidad de edición pendiente de implementar.');
  }
}
