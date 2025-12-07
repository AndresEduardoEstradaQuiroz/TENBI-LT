import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-opciones-linea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-opciones-linea.html',
  styleUrls: ['./menu-opciones-linea.scss']
})
export class MenuOpcionesLineaComponent {

  @Input() idLinea!: number;

  @Output() compartir = new EventEmitter<number>();
  @Output() eliminar = new EventEmitter<number>();
  @Input() modo: 'normal' | 'eliminado' = 'normal';
  @Output() restaurar = new EventEmitter<number>();
  @Output() eliminarDefinitivo = new EventEmitter<number>();


  menuAbierto = false;

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuAbierto = !this.menuAbierto;
  }

  clickCompartir(event: Event) {
  event.stopPropagation();
  console.log('MenuOpciones: clickCompartir() -> idLinea =', this.idLinea);
  this.compartir.emit(this.idLinea);
  this.menuAbierto = false;
}


  clickEliminar(event: Event) {
  event.stopPropagation();
  console.log('MenuOpciones: clickEliminar() -> idLinea =', this.idLinea);
  this.eliminar.emit(this.idLinea);
}
clickRestaurar(event: Event) {
  event.stopPropagation();
  console.log("MENU → idLinea =", this.idLinea);
  this.restaurar.emit(this.idLinea); 
}
clickEliminarDefinitivo(event: Event) {
  event.stopPropagation();
  console.log("MenuOpciones: eliminar definitivamente -> id =", this.idLinea);
  this.eliminarDefinitivo.emit(this.idLinea);
  this.menuAbierto = false;
}


}
