import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LineaTiempoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/lineas-tiempo';

  crearLineaTiempo(formData: FormData): Observable<any> {
    const token = localStorage.getItem('jwt');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post(this.apiUrl, formData, { headers });
  }

  obtenerTemas(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/temas');
  }

  obtenerLineasTiempo() {
    return this.http.get<any[]>(this.apiUrl);
  }

  obtenerMisLineas() {
    const esInvitado = localStorage.getItem('modo_invitado') === 'true';
    const token = localStorage.getItem('jwt');

    // Si es invitado, NO debe pedir nada al backend
    if (esInvitado || !token) {
      return new Observable<any[]>(observer => {
        observer.next([]); // Devolver vacío
        observer.complete();
      });
    }

    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any[]>(`${this.apiUrl}/mis-lineas`, { headers });
  }



  obtenerLineaPorId(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  actualizarFavorito(id: number, estado: 'S' | 'N'): Observable<any> {
    const token = localStorage.getItem('jwt');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.put(
      `http://localhost:8080/api/lineas-tiempo/${id}/favorita?estado=${estado}`,
      {},
      { headers }
    );
  }


  toggleFavorito(id: number): Observable<any> {
    const token = localStorage.getItem('jwt');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.patch(`${this.apiUrl}/${id}/favorito`, {}, { headers });
  }
  obtenerFavoritas(): Observable<any[]> {
    const esInvitado = localStorage.getItem('modo_invitado') === 'true';
    const token = localStorage.getItem('jwt');

    if (esInvitado || !token) {
      return new Observable<any[]>(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/favoritas`, { headers });
  }

  // ==== Para comunidad (me gusta y guardad) ====
  // Obtener estado de me gusta
  obtenerEstadoMeGusta(id: number): Observable<any> {
    const token = localStorage.getItem('jwt');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.get(`http://localhost:8080/api/megustas/estado/${id}`, { headers });
  }

  // Obtener estado de guardado
  obtenerEstadoGuardado(id: number): Observable<any> {
    const token = localStorage.getItem('jwt');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.get(`http://localhost:8080/api/guardados/estado/${id}`, { headers });
  }


  toggleMeGusta(id: number): Observable<any> {
    const token = localStorage.getItem('jwt');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.post(`http://localhost:8080/api/megustas/toggle/${id}`, {}, { headers });
  }

  toggleGuardado(id: number): Observable<any> {
    const token = localStorage.getItem('jwt');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.post(`http://localhost:8080/api/guardados/toggle/${id}`, {}, { headers });
  }

  obtenerGuardados(): Observable<any[]> {
    const token = localStorage.getItem('jwt');
    const esInvitado = localStorage.getItem('modo_invitado') === 'true';

    if (esInvitado || !token) {
      return new Observable<any[]>(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`http://localhost:8080/api/guardados/mis-guardados`, { headers });
  }
  actualizarPlantilla(id: number, plantillaId: number) {
    return this.http.put(`${this.apiUrl}/${id}/cambiar-plantilla`, {
      plantillaId: plantillaId
    });
  }
  // Generar link público
  generarLinkPublico(id: number) {
    return this.http.post<any>(`${this.apiUrl}/${id}/generar-link`, {});
  }

  // Revocar link público
  revocarLinkPublico(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}/revocar-link`);
  }

  // Obtener línea pública por token
  obtenerPublico(token: string) {
    // Simplemente hacemos la petición; interceptor la ignorará automáticamente
    return this.http.get<any>(`${this.apiUrl}/publico/${token}`);
  }

  obtenerTop3MasMegusta(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top/me-gusta`);
  }
  eliminarLinea(id: number): Observable<any> {
    const token = localStorage.getItem('jwt');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.put(
      `${this.apiUrl}/${id}/eliminar`,
      {},
      {
        headers,
        responseType: 'text' as 'json'
      }
    );
  }

  obtenerEliminadas(): Observable<any[]> {
    const token = localStorage.getItem('jwt');
    const esInvitado = localStorage.getItem('modo_invitado') === 'true';

    if (!token || esInvitado) {
      return new Observable<any[]>(obs => {
        obs.next([]);
        obs.complete();
      });
    }

    let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

    return this.http.get<any[]>(`${this.apiUrl}/eliminadas`, { headers });
  }
  listarEliminadas(): Observable<any[]> {
    return this.obtenerEliminadas();
  }
  restaurarLinea(id: number) {
    return this.http.put(
      `${this.apiUrl}/${id}/restaurar`,
      {},
      { responseType: 'text' }
    );
  }
  eliminarDefinitivo(id: number) {
    return this.http.delete(
      `${this.apiUrl}/${id}/eliminar-definitivo`,
      { responseType: 'text' }
    );
  }

}
