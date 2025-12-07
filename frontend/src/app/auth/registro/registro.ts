import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})

export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;
  nacionalidades: any[] = [];
  submitted = false;

  // Para mostrar mensajes de éxito o error en la UI
  successMsg: string = '';
  errorMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      genero: ['', Validators.required],
      nacionalidadId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/)
      ]],
      contrasenaConfirm: ['', Validators.required]
    }, { validators: this.passwordsMatch });

    this.cargarNacionalidades();
  }

  // Validación personalizada para que las contraseñas coincidan
  passwordsMatch(group: FormGroup) {
    const pass = group.get('contrasena')?.value;
    const confirm = group.get('contrasenaConfirm')?.value;
    return pass === confirm ? null : { notMatching: true };
  }

  cargarNacionalidades() {
    this.authService.getNacionalidades().subscribe({
      next: (data) => this.nacionalidades = data,
      error: (err) => console.error('Error cargando nacionalidades', err)
    });
  }

  onSubmit() {
    this.submitted = true;
    this.successMsg = ''; // Limpiar mensajes anteriores
    this.errorMsg = ''; // Limpiar mensajes anteriores

    if (this.registroForm.invalid) return;

    const nuevoUsuario = {
      ...this.registroForm.value,
      idTipoUsuario: 2 // 2 = Creador
    };

    this.authService.registrarUsuario(nuevoUsuario).subscribe({
      next: (res) => {
        // Mostrar mensaje de éxito en la UI
        this.successMsg = '¡Usuario registrado correctamente! Redirigiendo a inicio de sesión...';

        // Redirigir después de un breve delay
        setTimeout(() => {
          this.router.navigate(['/inicio-sesion']);
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        // Mostrar mensaje de error en la UI
        this.errorMsg = err.error?.message || 'Error al registrar usuario. Inténtelo de nuevo.';
      }
    });
  }
  
  loginWithGoogle() {
    this.authService.signInWithGoogle();
  }

  //Método para explorar como invitado
  explorarComoInvitado(): void {
    this.authService.activarModoInvitado(); 
    

  }
}