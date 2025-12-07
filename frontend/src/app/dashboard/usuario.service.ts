import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioDTO {
  idUsuario: number;
  nombre: string;
  email: string;
  fotoPerfil: string;
  genero: string;
  nacionalidad: { idNacionalidad: number; nombre: string };
  tipoUsuario: { idTipoUsuario: number; nombreTipo: string };
}

export interface ActualizarUsuarioRequest {
  nombre?: string;
  genero?: string;
  nacionalidadId?: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/usuarios';

  // eliminar getHeaders() y pasar headers en cada request
obtenerUsuario(id: number): Observable<UsuarioDTO> {
  return this.http.get<UsuarioDTO>(`${this.apiUrl}/${id}`);
}

actualizarUsuario(id: number, data: ActualizarUsuarioRequest): Observable<UsuarioDTO> {
  return this.http.put<UsuarioDTO>(`${this.apiUrl}/${id}`, data);
}

actualizarFotoPerfil(id: number, file: File): Observable<UsuarioDTO> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<UsuarioDTO>(`${this.apiUrl}/${id}/foto`, formData);
}

obtenerNacionalidades(): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:8080/catalogos/nacionalidades`);
}

  // Enlace de restablecer contraseña
  obtenerUrlRestablecerContrasena(): string {
    return '/reset-password'; // URL de tu página de recuperación en el frontend
  }
}
