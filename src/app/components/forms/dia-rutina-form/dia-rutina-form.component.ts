import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../../services/api-service.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { DiaRutina } from '../../../models/user.interfaces';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dia-rutina-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './dia-rutina-form.component.html',
  styleUrl: './dia-rutina-form.component.css'
})
export class DiaRutinaFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);

  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarMensaje: boolean = false;
  nuevoRegistro: string = '';

  diaAddGroup: FormGroup = this.fb.group({
    diaSemana: ['', [Validators.required, Validators.minLength(3)]],
    rutina: ['', [Validators.required, this.rutinaValidaValidator()]],
    diaRutinas: [[]] // Array vacío inicialmente

  });

  public rutinaValidaValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return { rutinaInvalida: true };
      return null;
    };
  }


  rutinas: any[] = [];
  ngOnInit() {
    this.apiService.getRutinas().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response['member'])) {
          this.rutinas = response['member'].map((rutina: any) => ({
            value: rutina.id,
            label: rutina.nombre
          }));
        } else {
          this.rutinas = [];
          this.mostrarError('No se encontraron rutinas disponibles.');
          console.error('Respuesta inesperada al cargar rutinas:', response);
        }
      },
      error: (error) => {
        console.error('Error al cargar rutinas:', error);
        this.mostrarError('No se pudieron cargar las rutinas');
      }
    });
  }

  public agregarDia(): void {
    if (this.diaAddGroup.invalid) {
      this.diaAddGroup.markAllAsTouched();
      this.mostrarError('Por favor, complete todos los campos obligatorios correctamente.');
      return;
    }
    const dia: DiaRutina = this.diaAddGroup.value;
    // Corregir el valor de rutina para que sea la IRI
    dia.rutina = `/api/rutinas/${dia.rutina}`;
    this.apiService.agregarDia(dia).subscribe({
      next: (response) => {
        console.log('Día añadido correctamente:', response);
        this.mostrarExito('¡Dia añadido correctamente!');
        this.resetForm();
        setTimeout(() => {
          this.router.navigate(['/dia_rutinas']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al añadir dia:', error);
        this.mostrarError('Error al añadir el dia. Por favor, inténtelo de nuevo.');
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
    this.diaAddGroup.reset({
      diaRutina: '',
      rutina: '',
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
}


