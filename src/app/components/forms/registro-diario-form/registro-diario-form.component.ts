import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
    const registro = this.registroForm.value;
    this.apiService.agregarRegistro(registro).subscribe({
      next: (res) => {
        console.log('Registro diario añadido:', res);
        this.router.navigate(['/registroEjercicio', res.id]);
      },
      error: (err) => {
        console.error('Error al añadir registro diario:', err);
      }
    });
  }

}
