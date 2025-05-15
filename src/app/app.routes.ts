import { Routes } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SignUpComponent } from './components/forms/sign-up/sign-up.component';
import { SignInComponent } from './components/forms/sign-in/sign-in.component';
import { EjercicioFormComponent } from './components/forms/ejercicio-form/ejercicio-form.component';
import { RutinaFormComponent } from './components/forms/rutina-form/rutina-form.component';
import { DiaRutinaFormComponent } from './components/forms/dia-rutina-form/dia-rutina-form.component';
import { RegistroDiarioFormComponent } from './components/forms/registro-diario-form/registro-diario-form.component';
import { RegistroEjercicioFormComponent } from './components/forms/registro-ejercicio-form/registro-ejercicio-form.component';
import { HomeComponent } from './views/home/home.component';
import { EjerciciosComponent } from './views/ejercicios/ejercicios.component';
import { DiasSemanaComponent } from './views/dias-semana/dias-semana.component';
import { AvisoLegalComponent} from './components/forms/aviso-legal/aviso-legal.component';
import { ContactComponent } from './components/forms/contact/contact.component';
import { PoliticaPrivacidadComponent } from './components/forms/politica-privacidad/politica-privacidad.component';
import { TerminosyCondicionesComponent } from './components/forms/terminosy-condiciones/terminosy-condiciones.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },	
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'header', component: HeaderComponent },
    { path: 'footer', component: FooterComponent },
    { path: 'signUp', component: SignUpComponent },
    { path: 'signIn', component: SignInComponent }, 
    { path: 'ejercicios', component: EjercicioFormComponent},
    { path: 'rutinas', component: RutinaFormComponent},
    { path: 'diaRutina', component: DiaRutinaFormComponent},
    { path: 'registroDiario', component: RegistroDiarioFormComponent},
    { path: 'registroEjercicio/:registroId', component: RegistroEjercicioFormComponent },
    { path: 'registroEjercicio', component: EjercicioFormComponent },
    { path: 'editarEjercicio/:id', component: EjercicioFormComponent },
    { path: 'ejercicios-lista', component: EjerciciosComponent },
    { path: 'dias-semana', component: DiasSemanaComponent },
    { path: 'aviso-legal', component: AvisoLegalComponent },
    { path: 'contacto', component: ContactComponent },
    { path: 'politica-privacidad', component: PoliticaPrivacidadComponent },
    { path: 'terminos-y-condiciones', component: TerminosyCondicionesComponent },
    {
        path: 'registros-diarios',
        loadComponent: () => import('./views/registros-diarios/registros-diarios.component').then(m => m.RegistrosDiariosComponent)
    },
    {
        path: 'administrarUsuarios',
        loadComponent: () => import('./views/usuarios/usuarios.component').then(m => m.UsuariosComponent)
    },
];