import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rutina, Ejercicio } from '../../models/user.interfaces';

@Component({
  selector: 'app-modal-rutina',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-rutina.component.html',
  styleUrl: './modal-rutina.component.css'
})
export class ModalRutinaComponent {
  @Input() rutina: Rutina | null = null;
  @Input() ejercicios: Ejercicio[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Rutina>();
  @Output() eliminar = new EventEmitter<Rutina>();

  onEditar() {
    if (this.rutina) this.editar.emit(this.rutina);
  }

  onEliminar() {
    if (this.rutina) this.eliminar.emit(this.rutina);
  }
}
