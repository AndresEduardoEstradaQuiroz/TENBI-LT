import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile.html',
  styleUrls: ['./complete-profile.scss']
})
export class CompleteProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  nacionalidades: { idNacionalidad: number; nacionalidad: string }[] = [];
  generos = ['M', 'F', 'P',]; // P = Prefiero no decirlo, 
  usuario: Usuario | null = null;

  ngOnInit() {
    this.usuario = this.authService.getUsuario();

    if (!this.usuario) {
      this.router.navigate(['/']);
      return;
    }

    this.profileForm = this.fb.group({
      genero: [this.usuario.genero || '', Validators.required],
      nacionalidadId: [this.usuario.nacionalidad?.idNacionalidad || '', Validators.required]
    });

    this.authService.getNacionalidades().subscribe({
      next: (data) => this.nacionalidades = data,
      error: (err) => console.error('Error cargando nacionalidades', err)
    });
  }
  // --- FUNCIONES AUXILIARES PARA EL HTML ---
  getGenderIcon(code: string): string {
    if (code === 'F') return '♀️'; // Femenino
    if (code === 'M') return '♂️'; // Masculino
    if (code === 'P') return '🤫'; // Prefiero no decirlo
    return '👤';
  }

  getGenderLabel(code: string): string {
    if (code === 'F') return 'Femenino';
    if (code === 'M') return 'Masculino';
    if (code === 'P') return 'Prefiero no decirlo';
    return 'Género';
  }
  // --- FIN DE FUNCIONES AUXILIARES ---


  submit() {
    if (!this.profileForm.valid || !this.usuario) return;

    const updatedUser: Usuario = {
      ...this.usuario,
      genero: this.profileForm.value.genero,
      nacionalidad: this.nacionalidades.find(
        n => n.idNacionalidad === +this.profileForm.value.nacionalidadId
      ) || this.usuario.nacionalidad!
    };

    this.authService.completarPerfil(updatedUser).subscribe({
      next: (res) => {
        //  Ahora accedemos correctamente al usuario
        const usuarioActualizado = res.usuario;

        this.authService.saveAuthData(this.authService.getToken()!, usuarioActualizado);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => console.error('Error actualizando perfil', err)
    });
  }
}
