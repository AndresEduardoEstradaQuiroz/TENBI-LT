import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { LineaTiempoService } from '../linea-tiempo.service';
import { RenderPlantillaComponent } from '../render-plantilla/render-plantilla';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-ver-linea-publica',
  standalone: true,
  imports: [
    CommonModule,
    RenderPlantillaComponent
  ],
  templateUrl: './ver-linea-publica.html'
})
export class VerLineaPublicaComponent implements OnInit {

  linea: any;
  cargando = true;
  error = false;
  routeToken!: string;

  constructor(
    private route: ActivatedRoute,
    private lineaService: LineaTiempoService,
    private authService: AuthService
  ) {}
plantilla: number = 0;
titulo: string = '';
descripcion: string = '';
hitos: any[] = [];
imagenPortada: string = '';


 ngOnInit() {
  this.routeToken = this.route.snapshot.paramMap.get('token')!;
  this.lineaService.obtenerPublico(this.routeToken).subscribe({
    next: (data) => {
      this.linea = data;
      this.plantilla = data.plantilla;
      this.titulo = data.titulo;
      this.descripcion = data.descripcion;
      this.hitos = data.hitos;
      this.imagenPortada = data.imagenPortada;

      const usuarioActual = this.authService.getUsuario();

      this.cargando = false;
    },
    error: () => {
      this.error = true;
      this.cargando = false;
    }
  });
 }
}