import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './inicio-sesion.html',
  styleUrls: ['./inicio-sesion.scss']
})
export class InicioSesionComponent {
  loginForm: FormGroup;
  submitted = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.submitted = true;
    this.errorMsg = '';

    //  Marca todos los campos como tocados para mostrar errores de validación
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });

    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.authService.saveAuthData(res.token, res.usuario);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error de inicio de sesión:', err);
        this.errorMsg = err.error?.message || 'Usuario o contraseña incorrectos';
        this.cdr.detectChanges();
      }
    });
  }

  //  FUNCIÓN PARA EL BOTÓN DE GOOGLE
  /**
   * Llama al método centralizado en AuthService para iniciar el flujo de Google OAuth.
   */
  loginWithGoogle() {
    this.authService.signInWithGoogle();
  }

    explorarComoInvitado(): void {
    //  Llama al método del servicio para establecer el modo invitado.

    this.authService.activarModoInvitado(); 
    

  }
}