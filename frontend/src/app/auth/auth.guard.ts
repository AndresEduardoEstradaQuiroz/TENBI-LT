import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Permitir acceso si es invitado
  if (authService.esInvitado()) {
    return true;
  }

  // Requiere token si NO es invitado
  const token = authService.getToken();
  if (!token) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
