import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  isSpanish: boolean = true;
  userRole: string = localStorage.getItem('userType') || 'invitado';
  userName: string = '';

  constructor(private languageService: LanguageService, private cdr: ChangeDetectorRef) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );
    window.addEventListener('storage', () => this.actualizarUsuarioHeader(true));
  }

  ngOnInit() {
    this.actualizarUsuarioHeader();
  }



 

  actualizarUsuarioHeader(forceDetect: boolean = false) {
    const storedRole = localStorage.getItem('userType');
    this.userRole = storedRole ? storedRole : 'invitado';

    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userName = user.nombre || '';
      } catch {
        this.userName = '';
      }
    } else {
      this.userName = '';
    }

    if (forceDetect) {
      this.cdr.markForCheck();
    }
  }

  toggleLanguage(language: 'es' | 'en') {
    this.languageService.setLanguage(language);
    localStorage.setItem('language', language);
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }

  logout() {
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    window.location.href = '/'; // Recarga la página y fuerza Home de invitado
  }
}