import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../../services/api-service.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { Ejercicio } from '../../../models/user.interfaces';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ejercicio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  styleUrls: ['./ejercicio-form.component.css'],
  templateUrl: './ejercicio-form.component.html'
})
export class EjercicioFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  
  // Para mensajes de feedback al usuario
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarMensaje: boolean = false;
  nuevoRegistro: string = '';

  EjercicioAddGroup: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    series: [1, [Validators.required, Validators.min(1)]],
    repeticiones: [10, [Validators.required, Validators.min(1)]],
    descanso: [30, [Validators.required, Validators.min(0)]],
    rutinas: [[]], // Nuevo: array de rutinas (opcional)
    registroEjercicios: [[]] // Array vacío inicialmente
  });

  rutinas: any[] = [];
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getEjercicioById(+id).subscribe({
        next: (ejercicio) => {
          this.EjercicioAddGroup.patchValue({
            nombre: ejercicio.nombre,
            series: ejercicio.series,
            repeticiones: ejercicio.repeticiones,
            descanso: ejercicio.descanso,
            rutinas: ejercicio.rutinas || [],
            registroEjercicios: ejercicio.registroEjercicios || []
          });
        },
        error: () => {
          this.mostrarError('No se pudo cargar el ejercicio para editar.');
        }
      });
    }
  }

  public agregarEjercicio(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Modo edición
      if (this.EjercicioAddGroup.invalid) {
        this.EjercicioAddGroup.markAllAsTouched();
        this.mostrarError('Por favor, complete todos los campos obligatorios correctamente.');
        return;
      }
      const datos = this.EjercicioAddGroup.value;
      this.apiService.actualizarEjercicio(+id, datos).subscribe({
        next: () => {
          this.mostrarExito('¡Ejercicio actualizado correctamente!');
          setTimeout(() => {
            this.router.navigate(['/ejercicios-lista']);
          }, 1500);
        },
        error: (error) => {
          this.mostrarError('Error al actualizar el ejercicio.');
        }
      });
      return;
    }

    if (this.EjercicioAddGroup.invalid) {
      this.EjercicioAddGroup.markAllAsTouched();
      this.mostrarError('Por favor, complete todos los campos obligatorios correctamente.');
      return;
    }

    const ejercicio: Ejercicio = this.EjercicioAddGroup.value;
    
    this.apiService.agregarEjercicio(ejercicio).subscribe({
      next: (response) => {
        console.log('Ejercicio añadido correctamente:', response);
        this.mostrarExito('¡Ejercicio añadido correctamente!');
        this.resetForm();
        setTimeout(() => {
          this.router.navigate(['/ejercicios']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al añadir ejercicio:', error);
        this.mostrarError('Error al añadir el ejercicio. Por favor, inténtelo de nuevo.');
      }
    });
  }

  public resetForm(): void {
    this.EjercicioAddGroup.reset({
      nombre: '',
      series: 1,
      repeticiones: 10,
      descanso: 30,
      rutinas: [],
      registroEjercicios: []
    });
    this.nuevoRegistro = '';
  }

  public getControl(controlName: string) {
    return this.EjercicioAddGroup.get(controlName);
  }

  public agregarRegistro(): void {
    if (this.nuevoRegistro.trim()) {
      const registros = this.EjercicioAddGroup.get('registroEjercicios')?.value || [];
      registros.push(this.nuevoRegistro);
      this.EjercicioAddGroup.patchValue({ registroEjercicios: registros });
      this.nuevoRegistro = '';
    }
  }

  public eliminarRegistro(index: number): void {
    const registros = this.EjercicioAddGroup.get('registroEjercicios')?.value || [];
    registros.splice(index, 1);
    this.EjercicioAddGroup.patchValue({ registroEjercicios: registros });
  }

  // Métodos para feedback al usuario
  public mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 3000);
  }

  public mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 3000);
  }
}