import { Routes } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./views/home/home.component').then(m => m.HomeComponent)
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'header', component: HeaderComponent },
    { path: 'footer', component: FooterComponent },
    {
        path: 'signUp',
        loadComponent: () => import('./components/forms/sign-up/sign-up.component').then(m => m.SignUpComponent)
    },
    {
        path: 'signIn',
        loadComponent: () => import('./components/forms/sign-in/sign-in.component').then(m => m.SignInComponent)
    },
    {
        path: 'ejercicios',
        loadComponent: () => import('./components/forms/ejercicio-form/ejercicio-form.component').then(m => m.EjercicioFormComponent)
    },
    {
        path: 'rutinas',
        loadComponent: () => import('./components/forms/rutina-form/rutina-form.component').then(m => m.RutinaFormComponent)
    },
    {
        path: 'diaRutina',
        loadComponent: () => import('./components/forms/dia-rutina-form/dia-rutina-form.component').then(m => m.DiaRutinaFormComponent)
    },
    {
        path: 'registroDiario',
        loadComponent: () => import('./components/forms/registro-diario-form/registro-diario-form.component').then(m => m.RegistroDiarioFormComponent)
    },
    {
        path: 'registroEjercicio/:registroId',
        loadComponent: () => import('./components/forms/registro-ejercicio-form/registro-ejercicio-form.component').then(m => m.RegistroEjercicioFormComponent)
    },
    {
        path: 'registroEjercicio',
        loadComponent: () => import('./components/forms/ejercicio-form/ejercicio-form.component').then(m => m.EjercicioFormComponent)
    },
    {
        path: 'editarEjercicio/:id',
        loadComponent: () => import('./components/forms/ejercicio-form/ejercicio-form.component').then(m => m.EjercicioFormComponent)
    },
    {
        path: 'rutinas/editar/:id',
        loadComponent: () => import('./components/forms/rutina-form/rutina-form.component').then(m => m.RutinaFormComponent)
    },
    {
        path: 'registroDiario/editar/:id',
        loadComponent: () => import('./components/forms/registro-diario-form/registro-diario-form.component').then(m => m.RegistroDiarioFormComponent)
    },
    {
        path: 'ejercicios/editar/:id',
        loadComponent: () => import('./components/forms/ejercicio-form/ejercicio-form.component').then(m => m.EjercicioFormComponent)
    },
    {
        path: 'ejercicios-lista',
        loadComponent: () => import('./views/ejercicios/ejercicios.component').then(m => m.EjerciciosComponent)
    },
    {
        path: 'dias-semana',
        loadComponent: () => import('./views/dias-semana/dias-semana.component').then(m => m.DiasSemanaComponent)
    },
    {
        path: 'aviso-legal',
        loadComponent: () => import('./components/forms/aviso-legal/aviso-legal.component').then(m => m.AvisoLegalComponent)
    },
    {
        path: 'contacto',
        loadComponent: () => import('./components/forms/contact/contact.component').then(m => m.ContactComponent)
    },
    {
        path: 'politica-privacidad',
        loadComponent: () => import('./components/forms/politica-privacidad/politica-privacidad.component').then(m => m.PoliticaPrivacidadComponent)
    },
    {
        path: 'terminos-y-condiciones',
        loadComponent: () => import('./components/forms/terminosy-condiciones/terminosy-condiciones.component').then(m => m.TerminosyCondicionesComponent)
    },
    {
        path: 'registros-diarios',
        loadComponent: () => import('./views/registros-diarios/registros-diarios.component').then(m => m.RegistrosDiariosComponent)
    },
    {
        path: 'administrarUsuarios',
        loadComponent: () => import('./views/usuarios/usuarios.component').then(m => m.UsuariosComponent)
    },
    {
        path: 'usuarios/editar/:id',
        loadComponent: () => import('./components/forms/sign-up/sign-up.component').then(m => m.SignUpComponent)
    },
    {
        path: 'registroEjercicio/editar/:id',
        loadComponent: () => import('./components/forms/registro-ejercicio-form/registro-ejercicio-form.component').then(m => m.RegistroEjercicioFormComponent)
    },
];