import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../../services/api-service.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { RegistroEjercicio } from '../../../models/user.interfaces';
import { RouterModule } from '@angular/router';
import { Registro } from '../../../models/user.interfaces';

@Component({
  selector: 'app-registro-diario-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './registro-diario-form.component.html',
  styleUrl: './registro-diario-form.component.css'
})
export class RegistroDiarioFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarMensaje: boolean = false;
  nuevoRegistro: string = '';

  registroForm: FormGroup = this.fb.group({
    fecha: ['', Validators.required],
    sensaciones: ['', Validators.required],
    observaciones: [''],
    usuario: ['', Validators.required],
    registroEjercicios: [[]] 
  });

  public ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getRegistroById(+id).subscribe({
        next: (registro) => {
          this.registroForm.patchValue({
            fecha: registro.fecha,
            sensaciones: registro.sensaciones,
            observaciones: registro.observaciones,
            usuario: registro.usuario,
            registroEjercicios: registro.registroEjercicios || []
          });
        },
        error: () => {
          this.mostrarError('No se pudo cargar el registro para editar.');
        }
      });
    } else {
      this.apiService.getCurrentUser().subscribe({
        next: (usuario) => {
          this.registroForm.patchValue({
            usuario: usuario?.id
          });
        },
        error: (err) => {
          this.mostrarError('No se pudo obtener el usuario actual');
        }
      });
    }
  }

  public mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 3000);
  }

  public resetForm(): void {
    this.registroForm.reset({
      fecha: '',
      sensaciones: '',
      observaciones: '',
      usuario: '',
      registroEjercicios: []
    });
    this.nuevoRegistro = '';
  }

  public mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 3000);
  }
  
  public agregarRegistro() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    const registro = this.registroForm.value;
    if (id) {
      // Modo edición
      this.apiService.actualizarRegistro(+id, registro).subscribe({
        next: (res) => {
          this.mostrarExito('Registro diario actualizado correctamente');
          setTimeout(() => this.router.navigate(['/registros-diarios']), 1200);
        },
        error: (err) => {
          this.mostrarError('Error al actualizar el registro diario');
        }
      });
      return;
    }
    // Modo creación
    this.apiService.agregarRegistro(registro).subscribe({
      next: (res) => {
        this.mostrarExito('Registro diario añadido correctamente');
        this.router.navigate(['/registroEjercicio', res.id]);
      },
      error: (err) => {
        this.mostrarError('Error al añadir registro diario');
      }
    });
  }

}
