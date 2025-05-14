import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  roles = [
    { value: 'usuario', label: 'Usuario' },
    { value: 'administrador', label: 'Administrador' }
  ];

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

  registrarUsuario(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const usuario = { ...this.signUpForm.value };
    delete usuario.confirmPassword;

    console.log('Registrando usuario:', usuario);

    this.apiService.registerUsuario(usuario).subscribe({
      next: (response) => {
        console.log('Usuario registrado:', response);
        this.router.navigate(['/signIn']); // Cambiado de '/login' a '/signIn'
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        alert(`Error en el registro: ${error.error?.message || 'Verifica los datos e intenta de nuevo'}`);
      },
    });
  }

  getControl(controlName: string) {
    return this.signUpForm.get(controlName);
  }
}