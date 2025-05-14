import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Rutina } from '../../models/user.interfaces';

@Component({
  selector: 'app-card-rutina',
  standalone: true,
  imports: [],
  templateUrl: './card-rutina.component.html',
  styleUrl: './card-rutina.component.css'
})
export class CardRutinaComponent {
  @Input() rutina!: Rutina;
  @Output() verDetalles = new EventEmitter<Rutina>();

  mostrarDetalles() {
    this.verDetalles.emit(this.rutina);
  }
}
