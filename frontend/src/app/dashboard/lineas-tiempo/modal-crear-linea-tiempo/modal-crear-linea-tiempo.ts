import { Component, EventEmitter, Output } from '@angular/core';
import { CrearLineaTiempoComponent } from '../crear-linea-tiempo/crear-linea-tiempo';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-crear-linea-tiempo',
  standalone: true,
  imports: [CommonModule, CrearLineaTiempoComponent],
  templateUrl: './modal-crear-linea-tiempo.html',
  styleUrls: ['./modal-crear-linea-tiempo.scss']
})
export class ModalCrearLineaTiempoComponent {
  @Output() cerrarModal = new EventEmitter<boolean>();
  @Output() abrirPlantilla = new EventEmitter<void>();


  cerrar(limpiar?: boolean) {
  this.cerrarModal.emit(limpiar ?? false);
  }

  onAbrirPlantilla() {
    this.abrirPlantilla.emit(); // se propaga hacia Dashboard
  }
}
