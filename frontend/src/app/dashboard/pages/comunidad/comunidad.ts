import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header';
import { TimelineCardComponent } from '../../timeline-card/timeline-card';
import { LineaTiempoService } from '../../lineas-tiempo/linea-tiempo.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { RenderPlantillaComponent } from '../../lineas-tiempo/render-plantilla/render-plantilla';


@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule, HeaderComponent, TimelineCardComponent, RenderPlantillaComponent],
  templateUrl: './comunidad.html',
  styleUrls: ['./comunidad.scss']
})
export class ComunidadComponent implements OnInit {

  lineas: any[] = [];
  lineaActiva: any = null;
  modalAbierto = false;
  lineaSeleccionada!: number;
  @Output() abrirModal = new EventEmitter<void>();

  constructor(private lineaService: LineaTiempoService, private router: Router, private cd: ChangeDetectorRef) { }

  ngOnInit() {

    this.lineaService.obtenerLineasTiempo().subscribe({
      next: (lineasBase: any[]) => {

        const peticiones = lineasBase.map(linea =>
          forkJoin({
            meGusta: this.lineaService.obtenerEstadoMeGusta(linea.idLineaTiempo),
            guardado: this.lineaService.obtenerEstadoGuardado(linea.idLineaTiempo)
          }).pipe(
            map(resp => ({
              ...linea,
              // --- ME GUSTA ---
              estadoMeGusta: resp.meGusta.activo ? 'S' : 'N',
              contadorMeGusta: resp.meGusta.contador ?? 0,

              // --- GUARDADO ---
              estadoGuardado: resp.guardado.activo ? 'S' : 'N',
              contadorGuardado: resp.guardado.contador ?? 0,
            }))
          )
        );

        forkJoin(peticiones).subscribe({
          next: (lineasCompletas) => {
            this.lineas = [...lineasCompletas];

            this.cd.markForCheck();
            setTimeout(() => this.cd.detectChanges(), 0);
          }
        });

      }
    });

  }

  irALinea(idLinea: number) {
  this.modalAbierto = true;
  this.lineaSeleccionada = idLinea;

  this.lineaActiva = this.lineas.find(l => l.idLineaTiempo === idLinea);
}


  cerrarModal() {
    this.modalAbierto = false;
  }

  toggleMeGusta(idLinea: number) {
  const linea = this.lineas.find(l => l.idLineaTiempo === idLinea);
  if (!linea) return;

  this.lineaService.toggleMeGusta(idLinea).subscribe({
    next: (resp: any) => {
      // Actualiza la tarjeta
      linea.estadoMeGusta = resp.estado;
      linea.contadorMeGusta = resp.contador;

      //Actualiza también el modal si está abierto
      if (this.modalAbierto && this.lineaActiva?.idLineaTiempo === idLinea) {
        this.lineaActiva.estadoMeGusta = resp.estado;
        this.lineaActiva.contadorMeGusta = resp.contador;
      }

      this.cd.detectChanges();
    }
  });
}


  toggleGuardado(idLinea: number) {
  const linea = this.lineas.find(l => l.idLineaTiempo === idLinea);
  if (!linea) return;

  this.lineaService.toggleGuardado(idLinea).subscribe({
    next: (resp: any) => {
      // Actualiza la tarjeta
      linea.estadoGuardado = resp.estado;
      linea.contadorGuardado = resp.contador;

      // Actualiza también el modal si está abierto
      if (this.modalAbierto && this.lineaActiva?.idLineaTiempo === idLinea) {
        this.lineaActiva.estadoGuardado = resp.estado;
        this.lineaActiva.contadorGuardado = resp.contador;
      }

      this.cd.detectChanges();
    }
  });
}


}
