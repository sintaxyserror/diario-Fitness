import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { Ejercicio } from '../../models/user.interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ejercicios.component.html',
  styleUrl: './ejercicios.component.css'
})
export class EjerciciosComponent {
  ejercicios: Ejercicio[] = [];
  loading = true;
  error = '';
  ejercicioEditando: Ejercicio | null = null;
  searchTerm: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.apiService.getEjercicios().subscribe({
      next: (res) => {
        let ejercicios: Ejercicio[] = [];
        if ('member' in (res as any)) {
          ejercicios = (res as any)['member'];
        } else if ('hydra:member' in res) {
          ejercicios = res['hydra:member'];
        }
        this.ejercicios = ejercicios;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar ejercicios';
        this.loading = false;
      }
    });
  }

  get ejerciciosFiltrados(): Ejercicio[] {
    if (!this.searchTerm.trim()) return this.ejercicios;
    const term = this.searchTerm.toLowerCase();
    return this.ejercicios.filter(e =>
      (e.nombre && e.nombre.toLowerCase().includes(term))
    );
  }

  editarEjercicio(ejercicio: Ejercicio) {
    this.ejercicioEditando = { ...ejercicio };
    alert('Funcionalidad de edición pendiente de implementar.');
  }

  eliminarEjercicio(ejercicio: Ejercicio) {
    if (!confirm('¿Seguro que deseas eliminar este ejercicio?')) return;
    this.apiService.eliminarEjercicio(ejercicio.id).subscribe({
      next: () => {
        this.ejercicios = this.ejercicios.filter(e => e.id !== ejercicio.id);
      },
      error: (err) => {
        console.error('Error al eliminar ejercicio:', err);
        this.error = 'Error al eliminar el ejercicio: ' + (err?.message || '');
      }
    });
  }
}
