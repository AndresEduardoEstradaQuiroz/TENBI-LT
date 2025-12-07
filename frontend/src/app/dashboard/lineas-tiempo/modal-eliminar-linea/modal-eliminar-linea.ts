import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-eliminar-linea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-eliminar-linea.html',
  styleUrls: ['./modal-eliminar-linea.scss']
})
export class ModalEliminarLineaComponent {
  
  @Input() visible: boolean = false;
  @Input() titulo: string = "Mover línea a eliminados";

  @Output() onCerrar = new EventEmitter<void>();
  @Output() onConfirmar = new EventEmitter<void>();

  cerrar() {
    this.onCerrar.emit();
  }

  confirmar() {
    this.onConfirmar.emit();
  }
}
