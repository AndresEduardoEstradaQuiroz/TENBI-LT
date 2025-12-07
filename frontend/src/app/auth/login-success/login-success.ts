import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.html',
  styleUrls: ['./login-success.scss']
})
export class LoginSuccessComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email']; // lo enviamos desde backend

      if (!token || !email) {
        this.router.navigate(['/']);
        return;
      }

      // Guardamos token temporalmente
      this.authService.saveAuthData(token, { email } as Usuario);

      // Consultamos backend /me para obtener el usuario real y flag
      this.authService.fetchCurrentUser().subscribe({
        next: (res) => {
          const usuario = res.usuario;
          const necesita = res.necesitaCompletarPerfil;
          // Guardamos la info completa
          this.authService.saveAuthData(token, usuario);

          if (necesita) {
            // ruta que tienes definida para completar perfil
            this.router.navigate(['/auth/complete-profile']);
          } else {
            this.router.navigate(['/dashboard/recientes']);
          }
        },
        error: (err) => {
          console.error('fetchCurrentUser error', err);
          // Si falla, borramos token y volvemos al login
          this.authService.logout();
        }
      });
    });
  }
}
