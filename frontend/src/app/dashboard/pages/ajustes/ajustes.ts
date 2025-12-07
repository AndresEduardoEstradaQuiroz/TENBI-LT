import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService, UsuarioDTO } from '../../usuario.service';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./ajustes.scss'],
  standalone: true,
})
export class AjustesComponent implements OnInit {
  usuario!: UsuarioDTO;
  form!: FormGroup;
  nacionalidades: any[] = [];
  previewFoto: string | ArrayBuffer | null = null;
  fileFoto?: File;

  toastVisible = false;
  toastMessage = '';


  readonly BACKEND_URL = 'http://localhost:8080';


  generos = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Prefiero no decir', value: 'P' }
  ];


  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    const usuarioLogueado = this.authService.getUsuario();
    if (usuarioLogueado?.idUsuario != null) {
      this.cargarUsuario(usuarioLogueado.idUsuario);
    }

    this.cargarNacionalidades();

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      genero: ['', Validators.required],
      nacionalidadId: ['', Validators.required],
    });
  }

  cargarUsuario(id: number) {
    this.usuarioService.obtenerUsuario(id).subscribe((res) => {
      this.usuario = res;
      this.form.patchValue({
        nombre: res.nombre,
        genero: res.genero,
        nacionalidadId: res.nacionalidad?.idNacionalidad,
      });

      // Manejo robusto de foto
    if (res.fotoPerfil) {
      // Si es URL externa (Google u otra)
      this.previewFoto = res.fotoPerfil.startsWith('http') 
        ? res.fotoPerfil 
        : `${this.BACKEND_URL}${res.fotoPerfil}`;
    } else {
      // Fallback: imagen por defecto
      this.previewFoto = '../../../../assets/img/profile3.jpg';
    }
  });
  }


  cargarNacionalidades() {
    this.usuarioService.obtenerNacionalidades().subscribe((res) => {
      this.nacionalidades = res;
    });
  }

  onFileChange(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    this.fileFoto = file;

    const reader = new FileReader();
    reader.onload = e => {
      this.previewFoto = e.target?.result ?? null;
      this.cd.detectChanges(); // <-- fuerza a Angular a actualizar la vista
    };
    reader.readAsDataURL(file);
  }
}

  guardarCambios() {
    if (!this.usuario) return;

    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token JWT. Redirigiendo a login.');
      window.location.href = 'http://localhost:4200/login';
      return;
    }

    const id = Number(this.usuario.idUsuario);

    this.usuarioService.actualizarUsuario(id, this.form.value)
      .subscribe({
        next: (res) => {
          this.usuario = res;
          console.log('Usuario actualizado', res);
          this.mostrarToast('Cambios guardados correctamente');

          // Foto
          if (this.fileFoto) {
            this.usuarioService.actualizarFotoPerfil(id, this.fileFoto).subscribe({
              next: (resFoto) => {
                this.usuario = resFoto;
                this.previewFoto = resFoto.fotoPerfil ? `${this.BACKEND_URL}${resFoto.fotoPerfil}` : null;
                this.fileFoto = undefined;
                console.log('Foto actualizada', resFoto);
              }
              ,
              error: (err) => console.error('Error al actualizar foto', err)
            });
          }
        },
        error: (err) => {
          console.error('Error al actualizar usuario', err);
          if (err.status === 401 || err.status === 302) {
            console.warn('Token inválido o no autenticado. Redirigiendo a login.');
            this.authService.logout(); // Limpia localStorage
          }
        }
      });
  }

  irARecuperarContrasena() {
    const url = this.usuarioService.obtenerUrlRestablecerContrasena();
    window.location.href = url;
  }
  mostrarToast(mensaje: string) {
  this.toastMessage = mensaje;
  this.toastVisible = true;
  this.cd.detectChanges(); // <-- fuerza a Angular a pintar el toast YA MISMO

  setTimeout(() => {
    this.toastVisible = false;
    this.cd.detectChanges(); // <-- asegura ocultarlo en el tiempo correcto
  }, 3000);
}


}
