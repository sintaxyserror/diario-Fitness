import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api-service.service';
import { Usuarios } from '../../models/user.interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
  usuarios: Usuarios[] = [];
  loading = true;
  error = '';
  searchTerm: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.apiService.getUsuarios().subscribe({
      next: (res) => {
        let usuarios: Usuarios[] = [];
        if (res && typeof res === 'object') {
          if ('member' in res) {
            usuarios = (res as any)['member'] as Usuarios[];
          } else if ('hydra:member' in res) {
            usuarios = (res as any)['hydra:member'] as Usuarios[];
          }
        }
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  get usuariosFiltrados(): Usuarios[] {
    if (!this.searchTerm.trim()) return this.usuarios;
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(u =>
      (u.nombre && u.nombre.toLowerCase().includes(term)) ||
      (u.apellido && u.apellido.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  }

  eliminarUsuario(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    this.apiService.eliminarUsuario(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== id);
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        this.error = 'Error al eliminar el usuario: ' + (err?.message || '');
      }
    });
  }

  editarUsuario(usuario: Usuarios) {
    this.router.navigate(['/usuarios/editar', usuario.id]);
  }
}
