import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api-service.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiResponse, Usuarios } from '../../../models/user.interfaces';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../../services/language.service';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, RouterModule],
  styleUrls: ['./sign-in.component.css'],
  templateUrl: './sign-in.component.html'
})
export class SignInComponent {
  isSpanish: boolean = true;
  loginForm: FormGroup;
  showPassword = false;
  errorMessage: string = '';


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private languageService: LanguageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );

  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleLanguage(language: 'es' | 'en') {
    this.languageService.setLanguage(language);
    localStorage.setItem('language', language);
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';

      const credentials = {
        email: this.loginForm.value.email.trim(),
        password: this.loginForm.value.password.trim()
      };

      console.log("📤 Enviando credenciales:", credentials);

      this.apiService.getUsuarios().subscribe({
        next: (response: ApiResponse<Usuarios>) => {
          console.log("✅ Datos del usuario obtenidos:", response);


          // Verificar si la API devuelve usuarios en "member"
          if (response.member && response.member.length > 0) {
            // Buscar el usuario autenticado basado en el correo electrónico
            const usuarioAutenticado = response.member.find((user: Usuarios) => user.email === credentials.email /* && user.password === credentials.password*/);

            if (usuarioAutenticado) {
              console.log("✅ Usuario autenticado:", usuarioAutenticado);

              // Guardar el rol y los datos del usuario en el localStorage
              localStorage.setItem('userType', usuarioAutenticado.rol);
              localStorage.setItem('userData', JSON.stringify(usuarioAutenticado));
              // Guardar el ID del usuario autenticado
              localStorage.setItem('userId', usuarioAutenticado.id.toString());

              window.dispatchEvent(new Event("storage"));

              // Redirigir siempre a /home tras login
              this.router.navigate(['/home']);
            } else {
              this.errorMessage = "🚨 Error: No se encontró un usuario con ese correo.";
            }
          } else {
            this.errorMessage = "🚨 Error: No se pudo obtener el usuario correctamente.";
          }
        },
        error: (error) => {
          console.error('🚨 Error en el login:', error);
          this.errorMessage = error.error?.error || 'Contraseña o correo incorrecto, por favor inténtelo de nuevo';
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

}

