import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// 🔑 Importar ValidatorFn
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',

  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  standalone: true, 
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPasswordComponent implements OnInit {

  //  Inyección de dependencias
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  //  Propiedades de estado
  resetPasswordForm: FormGroup;
  token: string = '';
  message: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  resetSuccessful: boolean = false;

  private readonly regex = {
      hasUpper: /[A-Z]/,
      hasLower: /[a-z]/,
      hasNumber: /[0-9]/,
      hasSpecial: /[^A-Za-z0-9]/
  };

  constructor() {
    // Definición del formulario
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [
          Validators.required, 
          Validators.minLength(8), // Validación de longitud nativa de Angular
          this.passwordStrengthValidator() //  Validador de fortaleza personalizado
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      //  Custom validator para verificar que las contraseñas coincidan
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    //  Obtener el token de los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.errorMessage = 'Token de restablecimiento no encontrado. El enlace puede ser inválido o estar incompleto.';
      }
    });
  }

  /**
   *  Validador personalizado para verificar la fortaleza de la contraseña.
   */
  passwordStrengthValidator(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
          const value = control.value;
          if (!value) {
              return null; 
          }

          let errors: ValidationErrors = {};
          
          if (!this.regex.hasUpper.test(value)) {
              errors['hasUpper'] = true;
          }
          if (!this.regex.hasLower.test(value)) {
              errors['hasLower'] = true;
          }
          if (!this.regex.hasNumber.test(value)) {
              errors['hasNumber'] = true;
          }
          if (!this.regex.hasSpecial.test(value)) {
              errors['hasSpecial'] = true;
          }
          
          return Object.keys(errors).length ? errors : null;
      };
  }
  
  /**
   * Validador personalizado para asegurar que newPassword y confirmPassword coincidan.
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmPassword')?.value;
    // Retorna {mismatch: true} si no coinciden, o null si coinciden.
    return newPass && confirmPass && newPass !== confirmPass ? { mismatch: true } : null;
  }

  onSubmit(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.resetPasswordForm.invalid || !this.token) {
      this.errorMessage = 'Por favor, corrige los errores del formulario y verifica el enlace.';
      return;
    }

    this.isLoading = true;
    const { newPassword, confirmPassword } = this.resetPasswordForm.value;

    const payload = {
      token: this.token,
      newPassword: newPassword,
      confirmPassword: confirmPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: (response) => {
        this.message = response.message || 'Contraseña actualizada exitosamente.';
        this.isLoading = false;
        this.resetSuccessful = true;
        this.errorMessage = '';
        
        // Redirigir al login después de un breve tiempo para que el usuario vea el éxito
        setTimeout(() => this.router.navigate(['/inicio-sesion']), 3000);
      },
      error: (err) => {
        // Manejar errores de token inválido, caducado, o validación del backend
        console.error('Error al restablecer contraseña:', err);
        this.errorMessage = err.error?.error || 'Ocurrió un error inesperado al restablecer la contraseña.';
        this.message = '';
        this.isLoading = false;
      }
    });
  }
}
