import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header';
import { TimelineCardComponent } from '../../timeline-card/timeline-card';
import { LineaTiempoService } from '../../lineas-tiempo/linea-tiempo.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-guardados',
  standalone: true,
  imports: [CommonModule, HeaderComponent, TimelineCardComponent],
  templateUrl: './guardados.html',
  styleUrls: ['./guardados.scss']
})
export class GuardadosComponent implements OnInit {

  guardados: any[] = [];

  constructor(
    private lineaService: LineaTiempoService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {

    this.lineaService.obtenerGuardados().subscribe({
      next: (itemsBase: any[]) => {

        const peticiones = itemsBase.map(item =>
          forkJoin({
            meGusta: this.lineaService.obtenerEstadoMeGusta(item.idLineaTiempo),
            guardado: this.lineaService.obtenerEstadoGuardado(item.idLineaTiempo)
          }).pipe(
            map(resp => ({
              ...item,

              // ME GUSTA
              estadoMeGusta: resp.meGusta.activo ? 'S' : 'N',
              contadorMeGusta: resp.meGusta.contador ?? 0,

              // GUARDADO
              estadoGuardado: resp.guardado.activo ? 'S' : 'N',
              contadorGuardado: resp.guardado.contador ?? 0,
            }))
          )
        );

        forkJoin(peticiones).subscribe({
          next: (itemsCompletos) => {
            this.guardados = [...itemsCompletos];

            this.cd.markForCheck();
            setTimeout(() => this.cd.detectChanges(), 0);
          }
        });

      }
    });
  }

  irALinea(idLinea: number) {
    this.router.navigate(['/render-plantilla', idLinea]);
  }

  toggleMeGusta(idLinea: number) {
    const item = this.guardados.find(l => l.idLineaTiempo === idLinea);
    if (!item) return;

    this.lineaService.toggleMeGusta(idLinea).subscribe({
      next: (resp: any) => {
        item.estadoMeGusta = resp.estado;
        item.contadorMeGusta = resp.contador;

        this.cd.detectChanges();
      }
    });
  }

  toggleGuardado(idLinea: number) {
    const item = this.guardados.find(l => l.idLineaTiempo === idLinea);
    if (!item) return;

    this.lineaService.toggleGuardado(idLinea).subscribe({
      next: (resp: any) => {
        item.estadoGuardado = resp.estado;
        item.contadorGuardado = resp.contador;

        // Si se desmarca, lo removemos de la lista
        if (resp.estado === 'N') {
          this.guardados = this.guardados.filter(g => g.idLineaTiempo !== idLinea);
        }

        this.cd.detectChanges();
      }
    });
  }

}
