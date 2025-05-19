import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api-service.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Usuarios } from '../../../models/user.interfaces';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../../services/language.service';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,],
  styleUrls: ['./sign-up.component.css'],
  templateUrl: './sign-up.component.html'
})
export class SignUpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  roles = [
    { value: 'usuario', label: 'Usuario' },
    { value: 'administrador', label: 'Administrador' }
  ];

  mensajeExito: string = '';
  mensajeError: string = '';
  idUsuarioEditando: string | null = null;

  signUpForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: [
      '', 
      [Validators.required, Validators.email]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/),
      ],
    ],
    confirmPassword: ['', Validators.required],
    rol: ['usuario', Validators.required] // Valor predeterminado: 'usuario'
  },
  { validators: this.passwordsMatchValidator }
  );

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsDoNotMatch: true };
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.idUsuarioEditando = id;
    if (id) {
      this.apiService.getUsuarioById(+id).subscribe({
        next: (usuario) => {
          this.signUpForm.patchValue({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: usuario.rol
          });
          // No se rellena password ni confirmPassword por seguridad
        },
        error: () => {
          alert('No se pudo cargar el usuario para editar.');
        }
      });
    }
  }

  registrarUsuario(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    const usuario = { ...this.signUpForm.value };
    delete usuario.confirmPassword;

    if (id) {
      // Modo edición
      this.apiService.actualizarUsuario(+id, usuario).subscribe({
        next: (response) => {
          this.mensajeExito = 'Usuario actualizado correctamente';
          this.mensajeError = '';
          setTimeout(() => this.router.navigate(['/administrarUsuarios']), 1200);
        },
        error: (error) => {
          this.mensajeError = `Error al actualizar usuario: ${error.error?.message || 'Verifica los datos e intenta de nuevo'}`;
          this.mensajeExito = '';
        },
      });
      return;
    }

    // Modo creación
    this.apiService.registerUsuario(usuario).subscribe({
      next: (response) => {
        this.mensajeExito = 'Usuario registrado correctamente';
        this.mensajeError = '';
        setTimeout(() => this.router.navigate(['/signIn']), 1200);
      },
      error: (error) => {
        this.mensajeError = `Error en el registro: ${error.error?.message || 'Verifica los datos e intenta de nuevo'}`;
        this.mensajeExito = '';
      },
    });
  }

  getControl(controlName: string) {
    return this.signUpForm.get(controlName);
  }
}