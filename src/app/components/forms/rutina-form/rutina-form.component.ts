import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../../services/api-service.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { Rutina } from '../../../models/user.interfaces';
import { RouterModule } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-rutina-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './rutina-form.component.html',
  styleUrl: './rutina-form.component.css'
})


export class RutinaFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);


  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarMensaje: boolean = false;
  nuevoRegistro: string = '';
  ejerciciosDisponibles: any[] = [];

  rutinaAddGroup: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required, Validators.minLength(1)]], // Corregido
    usuario: ['', [Validators.required, Validators.minLength(1)]],
    ejercicios: [[]],
    diaRutinas: [[]]
  });


  //verificamos si hay existen rutinas
  public verificarYCrearRutinas() {
    this.apiService.getRutinas().subscribe({
      next: (respuesta) => {
        if (respuesta['hydra:totalItems'] === 0) {
          this.inicializarRutinasBasicas().subscribe({
            next: (rutinas) => console.log(`${rutinas.length} rutinas creadas`),
            error: (error) => console.error('Error:', error)
          });
        } else {
          console.log('Rutinas ya existentes');
        }
      }
    });
  }

   // Inicializar rutinas básicas
   public inicializarRutinasBasicas(): Observable<Rutina[]> {
    const rutinasBasicas = [
      { nombre: 'fullbody', descripcion: 'Entrenamiento de cuerpo completo' },
      { nombre: 'tren_superior', descripcion: 'Entrenamiento de la parte superior del cuerpo' },
      { nombre: 'tren_inferior', descripcion: 'Entrenamiento de la parte inferior del cuerpo' },
      { nombre: 'push', descripcion: 'Ejercicios de empuje' },
      { nombre: 'pull', descripcion: 'Ejercicios de tirón' },
      { nombre: 'core', descripcion: 'Ejercicios para el core' },
      { nombre: 'pierna', descripcion: 'Ejercicios para piernas' },
      { nombre: 'hombro', descripcion: 'Ejercicios para hombros' },
      { nombre: 'pecho', descripcion: 'Ejercicios para pecho' },
      { nombre: 'espalda', descripcion: 'Ejercicios para espalda' },
      { nombre: 'brazos', descripcion: 'Ejercicios para brazos' }
    ];

    // Crear cada rutina y recoger sus observables
    const creacionObservables = rutinasBasicas.map(rutina => 
      this.apiService.agregarRutina({ 
        nombre: rutina.nombre, 
        descripcion: rutina.descripcion 
      } as Rutina).pipe(
        catchError(error => {
          console.error(`Error al crear rutina ${rutina.nombre}:`, error);
          return of(null); // Continuar con las siguientes aunque haya error
        })
      )
    );

    // Ejecutar todas las creaciones en paralelo
    return forkJoin(creacionObservables).pipe(
      finalize(() => console.log('Proceso de inicialización de rutinas completado')),
      map(results => results.filter(result => result !== null) as Rutina[])
    );
  }

  public onSubmit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Modo edición
      if (this.rutinaAddGroup.invalid) {
        this.rutinaAddGroup.markAllAsTouched();
        this.mensajeError = 'Por favor, complete todos los campos requeridos';
        this.mostrarMensaje = true;
        return;
      }
      const datos = this.rutinaAddGroup.value;
      this.apiService.actualizarRutina(+id, datos).subscribe({
        next: () => {
          this.mensajeExito = '¡Rutina actualizada correctamente!';
          this.mostrarMensaje = true;
          setTimeout(() => {
            this.mostrarMensaje = false;
            this.mensajeExito = '';
            this.mensajeError = '';
            this.router.navigate(['/rutinas/lista']);
            this.resetForm();
          }, 1200);
        },
        error: (err) => {
          console.error('Error al actualizar rutina:', err);
          this.mensajeError = 'Error al actualizar rutina: ' + 
            (err.message || 'Inténtelo de nuevo');
          this.mostrarMensaje = true;
        }
      });
      return;
    }
  
    // Modo creación (nuevo registro)
    if (this.rutinaAddGroup.invalid) {
      this.rutinaAddGroup.markAllAsTouched();
      this.mensajeError = 'Por favor, complete todos los campos requeridos';
      this.mostrarMensaje = true;
      return;
    }
  
    const rutinaData = this.rutinaAddGroup.value;
    console.log('Enviando rutina:', rutinaData); // Para depuración
    
    this.apiService.agregarRutina(rutinaData).subscribe({
      next: (rutina) => {
        this.mensajeExito = 'Rutina creada correctamente';
        this.mostrarMensaje = true;
        this.nuevoRegistro = rutina.id?.toString() || '';
        setTimeout(() => {
          this.mostrarMensaje = false;
          this.mensajeExito = '';
          this.mensajeError = '';
          this.router.navigate(['/diaRutina']);
          this.resetForm();
        }, 2000);
      },
      error: (err) => {
        this.mensajeError = 'Error al crear rutina: ' + 
          (err.message || 'Inténtelo de nuevo');
        this.mostrarMensaje = true;
      }
    });
  }
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getRutinaById(+id).subscribe({
        next: (rutina) => {
          this.rutinaAddGroup.patchValue({
            nombre: rutina.nombre,
            descripcion: rutina.descripcion,
            usuario: rutina.usuario,
            ejercicios: rutina.ejercicios,
            diaRutinas: rutina.diaRutinas
          });
        },
        error: () => {
          this.mensajeError = 'No se pudo cargar la rutina para editar.';
          this.mostrarMensaje = true;
        }
      });
    }
    // Primero verificamos si las rutinas básicas existen
    this.verificarYCrearRutinas();
    // Obtener usuario actual
    this.apiService.getCurrentUser().subscribe({
      next: (usuario) => {
        this.rutinaAddGroup.patchValue({
          usuario: usuario?.id ? `/api/usuarios/${usuario.id}` : ''
        });
      },
      error: (err) => console.error('Error al obtener usuario actual:', err)
    });
    // Cargar ejercicios disponibles para selección múltiple
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
      error: (err) => {
        this.ejerciciosDisponibles = [];
        console.error('Error al cargar ejercicios:', err);
      }
    });
  }

  public resetForm() {
    this.rutinaAddGroup.reset({
      nombre: '',
      descripcion: '',
      ejercicios: [],
      diaRutinas: []
    });
    
    // Mantener el usuario actual
    this.apiService.getCurrentUser().subscribe({
      next: (usuario) => {
        this.rutinaAddGroup.patchValue({
          usuario: usuario?.id ? `/api/usuarios/${usuario.id}` : ''
        });
      }
    });
  }

  public getControl(controlName: string) {
    return this.rutinaAddGroup.get(controlName);
  }
  
  // Maneja la selección múltiple de ejercicios
  onEjercicioCheckboxChange(event: any) {
    const ejerciciosControl = this.getControl('ejercicios');
    const value = event.target.value;
    let selected = ejerciciosControl?.value || [];
    if (event.target.checked) {
      if (!selected.includes(value)) {
        selected = [...selected, value];
      }
    } else {
      selected = selected.filter((v: string) => v !== value);
    }
    ejerciciosControl?.setValue(selected);
    ejerciciosControl?.markAsTouched();
  }

}
