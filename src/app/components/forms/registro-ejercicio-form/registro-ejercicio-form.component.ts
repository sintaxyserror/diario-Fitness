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
    registro: ['', Validators.required], 
    ejercicio: ['', Validators.required] 
  });

  ngOnInit() {
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
    // Soporte edición: si la ruta es /registroEjercicio/editar/:id, cargar datos
    this.route.paramMap.subscribe(params => {
      const editarId = params.get('id');
      const registroId = params.get('registroId');
      if (editarId) {
        this.apiService.getRegistroEjercicioById(+editarId).subscribe({
          next: (regE) => {
            // Si el backend devuelve IRI, extraer solo el id para el select
            let ejercicioId = regE.ejercicio;
            if (typeof ejercicioId === 'string' && ejercicioId.includes('/')) {
              const match = ejercicioId.match(/(\d+)$/);
              ejercicioId = match ? match[1] : ejercicioId;
            }
            this.registroEjercicioForm.patchValue({
              comentario: regE.comentario,
              dolor: regE.dolor,
              registro: regE.registro,
              ejercicio: ejercicioId
            });
          },
          error: () => {
            this.mostrarError('No se pudo cargar el registro de ejercicio para editar.');
          }
        });
      } else if (registroId) {
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
    const editarId = this.route.snapshot.paramMap.get('id');
    let registroEjercicio = { ...this.registroEjercicioForm.value };
    // Transformar a IRI
    if (registroEjercicio.registro && !registroEjercicio.registro.toString().startsWith('/api/registros/')) {
      registroEjercicio.registro = `/api/registros/${registroEjercicio.registro}`;
    }
    if (registroEjercicio.ejercicio && !registroEjercicio.ejercicio.toString().startsWith('/api/ejercicios/')) {
      registroEjercicio.ejercicio = `/api/ejercicios/${registroEjercicio.ejercicio}`;
    }
    if (editarId) {
      // PATCH para editar
      this.apiService.actualizarRegistroEjercicio(+editarId, registroEjercicio).subscribe({
        next: () => {
          this.mostrarExito('¡Registro de ejercicio actualizado correctamente!');
          setTimeout(() => this.router.navigate(['/registroDiario/editar', this.extraerIdDeIri(registroEjercicio.registro)]), 1200);
        },
        error: () => {
          this.mostrarError('No se pudo actualizar el registro de ejercicio.');
        }
      });
      return;
    }
    // POST para crear
    this.apiService.agregarRegistroEjercicio(registroEjercicio).subscribe({
      next: (res) => {
        this.mostrarExito('¡Registro de ejercicio añadido correctamente!');
        this.resetForm();
      },
      error: (err) => {
        this.mostrarError('No se pudo guardar el registro de ejercicio.');
      }
    });
  }

  extraerIdDeIri(iri: string): string | null {
    if (!iri) return null;
    const match = iri.match(/(\d+)$/);
    return match ? match[1] : null;
  }

  finalizarRegistro() {
    this.router.navigate(['/registros-diarios']);
  }
}
