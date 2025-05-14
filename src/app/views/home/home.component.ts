import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { HeaderComponent } from "../../components/header/header.component";
import { CarrouselComponent } from "../../components/carrousel/carrousel.component";
import { JumbotronComponent } from "../../components/jumbotron/jumbotron.component";
import { ApiService } from '../../services/api-service.service';
import { Rutina, Ejercicio } from '../../models/user.interfaces';
import { CardRutinaComponent } from "../../components/card-rutina/card-rutina.component";
import { ModalRutinaComponent } from "../../components/modal-rutina/modal-rutina.component";
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CarrouselComponent, CardRutinaComponent, ModalRutinaComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isSpanish: boolean = true;
  userRole: string = localStorage.getItem('userType') || 'invitado';
  rutinasUsuario: Rutina[] = [];
  rutinaSeleccionada: Rutina | null = null;
  ejerciciosSeleccionados: Ejercicio[] = [];
  searchRutina: string = '';

  constructor(private languageService: LanguageService, private apiService: ApiService) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );
    window.addEventListener('storage', () => {
      this.userRole = localStorage.getItem('userType') || 'invitado';
      this.actualizarHome();
    });
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }

  ngOnInit() {
    this.actualizarHome();
  }

  actualizarHome() {
  console.log('Entrando a actualizarHome');
  const storedRole = localStorage.getItem('userType');
  const userId = localStorage.getItem('userId');
  this.userRole = storedRole ? storedRole : 'invitado';

  if ((this.userRole === 'administrador' || this.userRole === 'usuario') && userId) {
    this.apiService.getRutinas().subscribe({
      next: (response) => {
        console.log('Respuesta completa:', response);
        let todas: Rutina[] = [];
        if ('member' in (response as any)) {
          todas = (response as any)['member'];
        } else if ('hydra:member' in response) {
          todas = response['hydra:member'];
        }
        console.log('Todas las rutinas:', todas);

        this.rutinasUsuario = todas.filter((rutina: Rutina) => {
          const match = rutina.usuario?.endsWith(`/usuarios/${userId}`) ||
                        rutina.usuario === `/api/usuarios/${userId}` ||
                        rutina.usuario === userId;

          if (!match) {
            console.log('Rutina descartada:', rutina.nombre, 'usuario:', rutina.usuario, 'userId:', userId);
          }

          return match;
        });

        console.log('Rutinas del usuario:', this.rutinasUsuario);
      },
      error: (err) => {
        console.error('Error al obtener rutinas:', err);
        this.rutinasUsuario = [];
      }
    });
  } else {
    this.rutinasUsuario = [];
  }
}

  get rutinasFiltradas(): Rutina[] {
    if (!this.searchRutina.trim()) return this.rutinasUsuario;
    const term = this.searchRutina.toLowerCase();
    return this.rutinasUsuario.filter(r =>
      (r.nombre && r.nombre.toLowerCase().includes(term)) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(term))
    );
  }

  onVerDetalles(rutina: Rutina) {
    this.rutinaSeleccionada = rutina;
    this.ejerciciosSeleccionados = [];
    if (rutina.ejercicios && rutina.ejercicios.length > 0) {
      const ids = rutina.ejercicios.map(ej => {
        const partes = ej.split('/');
        return partes[partes.length - 1];
      });
      Promise.all(ids.map(id => this.apiService.getEjercicioById(+id).toPromise()))
        .then(ejercicios => {
          this.ejerciciosSeleccionados = ejercicios.filter(e => !!e) as Ejercicio[];
        });
    }
  }

  cerrarDetalles() {
    this.rutinaSeleccionada = null;
    this.ejerciciosSeleccionados = [];
  }

  editarRutina(rutina: Rutina) {
    alert('Funcionalidad de edición no implementada. Rutina: ' + rutina.nombre);
  }

  eliminarRutina(rutina: Rutina) {
    if (confirm('¿Seguro que quieres eliminar la rutina "' + rutina.nombre + '"?')) {
      this.apiService.eliminarRutina(rutina.id).subscribe({
        next: () => {
          this.rutinasUsuario = this.rutinasUsuario.filter(r => r.id !== rutina.id);
          this.cerrarDetalles();
        },
        error: (err) => {
          alert('Error al eliminar la rutina: ' + (err.message || err));
        }
      });
    }
  }
}
