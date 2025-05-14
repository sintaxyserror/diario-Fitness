import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Registro, Ejercicio, RegistroEjercicio } from '../../models/user.interfaces';

@Component({
  selector: 'app-modal-registro-diario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-registro-diario.component.html',
  styleUrl: './modal-registro-diario.component.css'
})
export class ModalRegistroDiarioComponent {
  @Input() registro: Registro | null = null;
  @Input() ejercicios: Ejercicio[] = [];
  @Input() registroEjercicios: RegistroEjercicio[] = [];
  @Output() cerrar = new EventEmitter<void>();

  // Devuelve el nombre del ejercicio dado el id o IRI
  getNombreEjercicio(ejercicioRef: string | number): string {
    if (!this.ejercicios || this.ejercicios.length === 0) return ejercicioRef + '';
    let id = null;
    if (typeof ejercicioRef === 'number') {
      id = ejercicioRef;
    } else if (typeof ejercicioRef === 'string') {
      // Si es IRI tipo '/api/ejercicios/2' o '/ejercicios/2'
      const match = ejercicioRef.match(/(\d+)$/);
      id = match ? parseInt(match[1], 10) : null;
    }
    if (id !== null) {
      const ejercicio = this.ejercicios.find(e => e.id == id);
      return ejercicio ? ejercicio.nombre : ejercicioRef + '';
    }
    return ejercicioRef + '';
  }
}
