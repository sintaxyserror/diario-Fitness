import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SignUpComponent } from './components/forms/sign-up/sign-up.component';
import { SignInComponent } from './components/forms/sign-in/sign-in.component';
import { EjercicioFormComponent } from './components/forms/ejercicio-form/ejercicio-form.component';
import { CarrouselComponent } from './components/carrousel/carrousel.component';
import { JumbotronComponent } from './components/jumbotron/jumbotron.component';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DiarioFitness';
}
