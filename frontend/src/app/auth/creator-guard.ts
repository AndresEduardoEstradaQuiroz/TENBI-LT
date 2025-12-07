import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';


export const creatorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si es invitado, sí puede entrar al dashboard
  if (authService.esInvitado()) {
    return true;
  }

  // Si no es invitado, requiere token
  if (!authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
