import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar'; 
import { ModalCrearLineaTiempoComponent } from './lineas-tiempo/modal-crear-linea-tiempo/modal-crear-linea-tiempo';
import { ModalSeleccionarPlantillaComponent } from './lineas-tiempo/modal-seleccionar-plantilla/modal-seleccionar-plantilla';
import { LineaCacheService } from './lineas-tiempo/linea-cache.service';
import { ModalEventService } from './modal-event.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    ModalCrearLineaTiempoComponent,
    ModalSeleccionarPlantillaComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {

  abrirModal = false;
  mostrarModalPlantilla = false;

  constructor(
    private cacheService: LineaCacheService,
    private modalEventService: ModalEventService
  ) {
    // 🔥 Escuchar evento global del Header
    this.modalEventService.abrirModalLinea$.subscribe(() => {
      this.abrirCrearLinea();
    });
  }

  abrirCrearLinea() {
    this.abrirModal = true;
  }

  cerrarCrearLinea(limpiar: boolean) {
    this.abrirModal = false;

    if (limpiar) {
      this.cacheService.clearDatosLinea();
    }
  }

  abrirSeleccionPlantilla() {
    this.abrirModal = false;
    this.mostrarModalPlantilla = true;
  }

  cerrarSeleccionPlantilla() {
    this.mostrarModalPlantilla = false;
  }

  volverACrear() {
    this.mostrarModalPlantilla = false;
    this.abrirModal = true;
  }
}
