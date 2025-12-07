import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service'; 
import { Router, RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  standalone: true, 
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPasswordComponent {
  
  //  Inyección de dependencias
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  //  Propiedades de estado
  forgotPasswordForm: FormGroup;
  message: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor() {
    //  Inicialización del formulario
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.forgotPasswordForm.invalid) {
      this.errorMessage = 'Por favor, introduce un correo electrónico válido.';
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        // El backend devuelve 200 OK con un mensaje genérico por seguridad 
        this.message = response.message || 'Se ha enviado un enlace de recuperación a tu correo electrónico.';
        this.errorMessage = ''; // Limpiar cualquier error anterior
        this.isLoading = false;
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        // En caso de error (ej. el backend retorna 400 por error interno o validación)
        // El backend en caso de email no encontrado devuelve 200 OK con mensaje.
        // Solo llegamos aquí por errores de red o errores internos del servidor (500).
        console.error('Error en forgotPassword:', err);
        this.errorMessage = err.error?.error || 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.';
        this.message = ''; // Limpiar cualquier mensaje de éxito
        this.isLoading = false;
      }
    });
  }
}