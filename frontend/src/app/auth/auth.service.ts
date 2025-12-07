import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';
import { EMPTY, Observable } from 'rxjs';


interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080/auth';
  private usuarioApiUrl = 'http://localhost:8080/api/usuarios';

  //  propiedad para manejar el estado del invitado
  private invitadoKey = 'modo_invitado';

 
  signInWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }


  completarPerfil(datos: Usuario): Observable<{ usuario: Usuario; necesitaCompletarPerfil: boolean }> {
    return this.http.post<{ usuario: Usuario; necesitaCompletarPerfil: boolean }>(`${this.apiUrl}/completar-perfil`, datos);
  }

  getNacionalidades() {
    return this.http.get<{ idNacionalidad: number; nacionalidad: string }[]>(`${this.apiUrl}/nacionalidades`);
  }

  fetchCurrentUser(): Observable<{ usuario: Usuario; necesitaCompletarPerfil: boolean }> {
    const token = this.getToken();
    if (!token) {
      console.warn('fetchCurrentUser llamado sin token disponible. Se omite la solicitud.');
      return EMPTY;
    }

    return this.http.get<{ usuario: Usuario; necesitaCompletarPerfil: boolean }>(`${this.apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  saveAuthData(token: string, usuario: Usuario) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jwt', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.removeItem(this.invitadoKey); //  Quita modo invitado si inicia sesión real
    }
  }

  getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt');
}


  getUsuario(): Usuario | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('usuario');
  return data ? JSON.parse(data) : null;
}

logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
    localStorage.removeItem('usuario');
    localStorage.removeItem(this.invitadoKey);
  }

  this.router.navigate(['/']);
}


  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ACTIVAR MODO INVITADO
  activarModoInvitado() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('jwt');
  localStorage.removeItem('usuario');
  localStorage.setItem(this.invitadoKey, 'true');

  this.router.navigate(['/dashboard/recientes']);
}



  //  VERIFICAR SI ES INVITADO
  esInvitado(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(this.invitadoKey) === 'true';
}

  registrarUsuario(usuario: any) {
    return this.http.post(`${this.usuarioApiUrl}/registro`, usuario, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  login(credentials: { email: string; contrasena: string }) {
    return this.http.post('http://localhost:8080/api/usuarios/login-tradicional', credentials, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  
  //  NUEVOS MÉTODOS PARA RESTABLECIMIENTO DE CONTRASEÑA


  /**
   * Llama a POST /auth/forgot-password para iniciar la recuperación.
   * @param email El correo del usuario.
   */
  forgotPassword(email: string): Observable<any> {
    const payload: ForgotPasswordPayload = { email: email };

    return this.http.post<any>(`${this.apiUrl}/forgot-password`, payload);
  }

  /**
   * Llama a POST /auth/reset-password para actualizar la contraseña.
   * @param data Datos que incluyen token, nueva contraseña y confirmación.
   */
  resetPassword(data: ResetPasswordPayload): Observable<any> {
    // Tu backend usa /auth/reset-password
    return this.http.post<any>(`${this.apiUrl}/reset-password`, data);
  }

  
}
