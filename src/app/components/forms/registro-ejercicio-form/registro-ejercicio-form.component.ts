import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api-service.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { RegistroEjercicio } from '../../../models/user.interfaces';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro-ejercicio-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './registro-ejercicio-form.component.html',
  styleUrl: './registro-ejercicio-form.component.css'
})
export class RegistroEjercicioFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarMensaje: boolean = false;
  ejercicios: any[] = [];

  registroEjercicioForm: FormGroup = this.fb.group({
    comentario: [''],
    dolor: [0, Validators.required],
    registro: ['', Validators.required], // ID del registro diario
    ejercicio: ['', Validators.required] // ID del ejercicio
  });

  ngOnInit() {
    // Cargar ejercicios disponibles
    this.apiService.getEjercicios().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response['hydra:member'])) {
          this.ejercicios = response['hydra:member'];
        } else if (response && Array.isArray(response['member'])) {
          this.ejercicios = response['member'];
        } else {
          this.ejercicios = [];
          this.mostrarError('No se encontraron ejercicios disponibles.');
        }
      },
      error: (error) => {
        this.mostrarError('Error al cargar ejercicios');
      }
    });

    // Obtener el ID del registro diario desde la ruta y asignarlo automáticamente
    this.route.paramMap.subscribe(params => {
      const registroId = params.get('registroId');
      if (registroId) {
        this.registroEjercicioForm.patchValue({ registro: registroId });
      }
    });
  }

  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 3000);
  }

  resetForm(): void {
    this.registroEjercicioForm.reset({
      comentario: '',
      dolor: 0,
      registro: this.registroEjercicioForm.get('registro')?.value || '',
      ejercicio: ''
    });
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 3000);
  }

  agregarRegistroEjercicio() {
    if (this.registroEjercicioForm.invalid) {
      this.registroEjercicioForm.markAllAsTouched();
      return;
    }
    const registroEjercicio = this.registroEjercicioForm.value;
    this.apiService.agregarRegistroEjercicio(registroEjercicio).subscribe({
      next: (res) => {
        // Ya no se asocia manualmente, la relación se maneja en el backend
        this.mostrarExito('¡Registro de ejercicio añadido correctamente!');
        this.resetForm();
      },
      error: (err) => {
        this.mostrarError('No se pudo guardar el registro de ejercicio.');
      }
    });
  }
}
