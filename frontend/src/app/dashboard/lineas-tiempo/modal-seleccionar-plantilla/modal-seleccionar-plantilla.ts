import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeleccionarPlantillaComponent } from '../seleccionar-plantilla/seleccionar-plantilla';


@Component({
  selector: 'app-modal-seleccionar-plantilla',
  standalone: true,
  imports: [CommonModule, SeleccionarPlantillaComponent],
  templateUrl: './modal-seleccionar-plantilla.html',
  styleUrl: './modal-seleccionar-plantilla.scss'
})
export class ModalSeleccionarPlantillaComponent {
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() volverFormulario = new EventEmitter<void>();

  cerrar() {
    this.cerrarModal.emit();
  }

  volver() {
    this.volverFormulario.emit();
  }
}
