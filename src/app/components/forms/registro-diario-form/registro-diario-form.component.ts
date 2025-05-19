import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../../services/api-service.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { RegistroEjercicio, Ejercicio } from '../../../models/user.interfaces';
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

  registroEjerciciosAsociados: RegistroEjercicio[] = [];
  ejerciciosDisponibles: Ejercicio[] = [];

  public registroDiarioId: string | null = null;

  public ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.registroDiarioId = id;
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
          // Cargar los registros de ejercicio asociados
          this.cargarRegistrosEjercicioAsociados(registro.registroEjercicios || []);
        },
        error: () => {
          this.mostrarError('No se pudo cargar el registro para editar.');
        }
      });
      // Cargar ejercicios disponibles para mostrar nombres
      this.apiService.getEjercicios().subscribe({
        next: (resp) => {
          if ('hydra:member' in resp) {
            this.ejerciciosDisponibles = resp['hydra:member'];
          } else if ('member' in resp) {
            this.ejerciciosDisponibles = resp['member'];
          } else {
            this.ejerciciosDisponibles = [];
          }
        },
        error: () => {
          this.ejerciciosDisponibles = [];
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

  cargarRegistrosEjercicioAsociados(registroEjercicios: string[]) {
    if (!registroEjercicios || registroEjercicios.length === 0) {
      this.registroEjerciciosAsociados = [];
      return;
    }
    // Extraer ids de los IRIs
    const ids = registroEjercicios.map((iri: string) => {
      const match = iri.match(/\d+$/);
      return match ? +match[0] : null;
    }).filter((id: number | null) => id !== null);
    if (ids.length === 0) {
      this.registroEjerciciosAsociados = [];
      return;
    }
    this.apiService.getRegistroEjercicios().subscribe({
      next: (res) => {
        let registrosEj: RegistroEjercicio[] = [];
        if ('hydra:member' in res) {
          registrosEj = res['hydra:member'];
        } else if ('member' in res) {
          registrosEj = res['member'];
        }
        this.registroEjerciciosAsociados = registrosEj.filter(r => ids.includes(r.id));
      },
      error: () => {
        this.registroEjerciciosAsociados = [];
      }
    });
  }

  getNombreEjercicio(ejercicioRef: string | number): string {
    if (!this.ejerciciosDisponibles || this.ejerciciosDisponibles.length === 0) return ejercicioRef + '';
    let id = null;
    if (typeof ejercicioRef === 'number') {
      id = ejercicioRef;
    } else if (typeof ejercicioRef === 'string') {
      const match = ejercicioRef.match(/(\d+)$/);
      id = match ? parseInt(match[1], 10) : null;
    }
    if (id !== null) {
      const ejercicio = this.ejerciciosDisponibles.find(e => e.id == id);
      return ejercicio ? ejercicio.nombre : ejercicioRef + '';
    }
    return ejercicioRef + '';
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
    const registro = { ...this.registroForm.value };
    // Normalizar registroEjercicios a IRIs
    registro.registroEjercicios = (registro.registroEjercicios || [])
      .filter((v: any) => !!v)
      .map((v: any) => {
        if (typeof v === 'string' && v.startsWith('/api/registro_ejercicios/')) return v;
        if (typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v))) return `/api/registro_ejercicios/${v}`;
        // Si es un objeto con id
        if (typeof v === 'object' && v.id) return `/api/registro_ejercicios/${v.id}`;
        return null;
      })
      .filter((v: any) => !!v);
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

  editarRegistroEjercicio(id: number) {
    this.router.navigate(['/registroEjercicio/editar', id]);
  }

  eliminarRegistroEjercicio(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este ejercicio del registro?')) return;
    this.apiService.eliminarRegistroEjercicio(id).subscribe({
      next: () => {
        // Refrescar la lista tras eliminar
        const registroEjercicios = this.registroForm.get('registroEjercicios')?.value || [];
        this.cargarRegistrosEjercicioAsociados(registroEjercicios);
      },
      error: () => {
        this.mostrarError('Error al eliminar el ejercicio del registro.');
      }
    });
  }

}
