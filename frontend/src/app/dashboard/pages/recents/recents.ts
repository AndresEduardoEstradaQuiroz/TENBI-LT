import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header';
import { TimelineCardComponent } from '../../timeline-card/timeline-card';
import { LineaTiempoService } from '../../lineas-tiempo/linea-tiempo.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { RenderPlantillaComponent } from '../../lineas-tiempo/render-plantilla/render-plantilla';
import { CompartirLineaComponent } from '../../lineas-tiempo/compartir-linea/compartir-linea';

@Component({
  selector: 'app-recents',
  standalone: true,
  imports: [CommonModule, HeaderComponent, TimelineCardComponent, FormsModule, RenderPlantillaComponent, CompartirLineaComponent],
  templateUrl: './recents.html',
  styleUrls: ['./recents.scss']
})
export class RecentsComponent implements OnInit {

  lineas: any[] = [];
  lineasFiltradas: any[] = [];

  textoBusqueda: string = '';
  temaSeleccionado: string = '';
  ordenSeleccionado: string = '';

  temasDisponibles: string[] = [];
  recomendados: any[] = [];

  lineaActiva: any = null;
  modalAbierto = false;
  lineaSeleccionada!: number;

  compartirModalAbierto = false;
  lineaCompartir!: any;

  
  mostrarCompartir = false;
  mostrarEliminar = false;

  constructor(
    private lineaService: LineaTiempoService,
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.authService.esInvitado()) {
      this.lineas = [];
      this.lineasFiltradas = [];
      return;
    }

    this.lineaService.obtenerMisLineas().subscribe({
      next: (resp) => {
        this.lineas = resp;

        this.temasDisponibles = [
          ...new Set(
            this.lineas
              .map(l => l.tema?.nombreTema || "")
              .filter(t => t.trim() !== "")
          )
        ];

        this.lineasFiltradas = [...this.lineas];
        this.cd.detectChanges();

      },

      error: (err) => console.error('Error cargando líneas', err)
    });
    this.lineaService.obtenerTop3MasMegusta().subscribe({
      next: (resp: any[]) => {

        const peticiones = resp.map(linea =>
          forkJoin({
            meGusta: this.lineaService.obtenerEstadoMeGusta(linea.idLineaTiempo),
            guardado: this.lineaService.obtenerEstadoGuardado(linea.idLineaTiempo)
          }).pipe(
            map(estados => ({
              ...linea,

              // ME GUSTA
              estadoMeGusta: estados.meGusta.activo ? 'S' : 'N',
              contadorMeGusta: estados.meGusta.contador ?? 0,

              // GUARDADO
              estadoGuardado: estados.guardado.activo ? 'S' : 'N',
              contadorGuardado: estados.guardado.contador ?? 0
            }))
          )
        );

        forkJoin(peticiones).subscribe({
          next: (listo) => {
            this.recomendados = listo;
            this.cd.detectChanges();
          }
        });

      },
      error: err => console.log("Error cargando recomendados", err)
    });
  }

  irALineaReciente(idLinea: number) {
  this.router.navigate(['//linea', idLinea]);
}

irALineaRecomendada(idLinea: number) {
  this.modalAbierto = true;
  this.lineaSeleccionada = idLinea;

  this.lineaActiva = this.lineas.find(l => l.idLineaTiempo === idLinea);
}
cerrarModal() {
    this.modalAbierto = false;
  }

  aplicarFiltros() {
    let filtrado = [...this.lineas];

    if (this.textoBusqueda.trim() !== "") {
      const texto = this.textoBusqueda.toLowerCase();
      filtrado = filtrado.filter(l =>
        l.titulo.toLowerCase().includes(texto) ||
        (l.palabrasClave && l.palabrasClave.toLowerCase().includes(texto))
      );
    }

    if (this.temaSeleccionado !== "") {
      filtrado = filtrado.filter(
        l => l.tema?.nombreTema === this.temaSeleccionado
      );
    }

    if (this.ordenSeleccionado === "recientes") {
      filtrado.sort((a, b) =>
        new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      );
    } else if (this.ordenSeleccionado === "antiguos") {
      filtrado.sort((a, b) =>
        new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
      );
    }

    this.lineasFiltradas = filtrado;
    this.cd.detectChanges();
  }

  limpiarFiltros() {
    this.textoBusqueda = "";
    this.temaSeleccionado = "";
    this.ordenSeleccionado = "";
    this.lineasFiltradas = [...this.lineas];
    this.cd.detectChanges();
  }

  obtenerEstadoActualizado(id: number): 'S' | 'N' {
    const linea = this.lineas.find(l => l.idLineaTiempo === id);
    if (!linea) return 'N';

    const nuevoEstado = linea.esFavorita === 'S' ? 'N' : 'S';
    linea.esFavorita = nuevoEstado;
    this.cd.detectChanges();
    return nuevoEstado;
  }


  marcarFavorito(id: number) {
    const linea = this.lineas.find(l => l.idLineaTiempo === id);
    if (!linea) return;

    const nuevoEstado = linea.esFavorita === 'S' ? 'N' : 'S';
    linea.esFavorita = nuevoEstado; // cambio visual inmediato


    this.lineaService.actualizarFavorito(id, nuevoEstado).subscribe({
      next: () => {
        console.log("Favorito actualizado desde recientes");
      },
      error: (err) => console.error("Error al actualizar favorito", err)
    });
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

  irAComunidad() {
    this.router.navigate(['/dashboard/comunidad']);
  }
  abrirCompartirModal(idLinea: number) {
  this.lineaCompartir = this.lineas.find(l => l.idLineaTiempo === idLinea);
  if (!this.lineaCompartir) return;
  this.compartirModalAbierto = true;
}
cerrarCompartirModal() {
  this.compartirModalAbierto = false;
  this.lineaCompartir = undefined;
}

}
