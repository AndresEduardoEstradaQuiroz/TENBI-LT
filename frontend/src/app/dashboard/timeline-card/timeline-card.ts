import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuOpcionesLineaComponent } from '../menu-opciones-linea/menu-opciones-linea';

@Component({
  selector: 'app-timeline-card',
  standalone: true,
  imports: [CommonModule, MenuOpcionesLineaComponent],
  templateUrl: './timeline-card.html',
  styleUrls: ['./timeline-card.scss']
})
export class TimelineCardComponent implements OnChanges {

  @Input() imagen: string = '';
  @Input() titulo: string = '';
  @Input() autor: string = '';
  @Input() fecha: string | null = null;
  @Input() tags: string[] = [];
  @Input() idLinea!: number;

  @Output() abrirLinea = new EventEmitter<number>();

  @Input() mostrarFavorito: boolean = false;
  @Input() esFavorita: 'S' | 'N' = 'N';

  @Output() marcarFavorito = new EventEmitter<number>();

  @Input() mostrarMeGusta: boolean = false;
  @Input() mostrarGuardado: boolean = false;

  @Input() estadoMeGusta: 'S' | 'N' = 'N';
  @Input() estadoGuardado: 'S' | 'N' = 'N';

  @Input() contadorMeGusta: number = 0;
  @Input() contadorGuardado: number = 0;

  @Output() clickMeGusta = new EventEmitter<number>();
  @Output() clickGuardado = new EventEmitter<number>();

  @Input() mostrarOpciones: boolean = true;

  @Output() compartirLinea = new EventEmitter<number>();
  @Output() eliminarLinea = new EventEmitter<number>();
  @Input() modoOpciones: 'normal' | 'eliminado' = 'normal';
  @Output() restaurar = new EventEmitter<number>();
  @Output() eliminarDefinitivo = new EventEmitter<number>();


  showLikeAnimation = false;

  triggerLikeAnimation() {
    this.showLikeAnimation = true;

    setTimeout(() => {
      this.showLikeAnimation = false;
    }, 900); // Animación más lenta y visible
  }

  // === VARIABLES INTERNAS SINCRONIZADAS ===
  likeActivo: 'S' | 'N' = 'N';
  saveActivo: 'S' | 'N' = 'N';
  likeCount: number = 0;
  saveCount: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['estadoMeGusta']) {
      this.likeActivo = this.estadoMeGusta;
    }

    if (changes['contadorMeGusta']) {
      this.likeCount = Number(this.contadorMeGusta) || 0;
    }

    if (changes['estadoGuardado']) {
      this.saveActivo = this.estadoGuardado;
    }

    if (changes['contadorGuardado']) {
      this.saveCount = Number(this.contadorGuardado) || 0;
    }
  }

  toggleMeGusta(event: Event) {
    event.stopPropagation();
    const quedabaActivo = this.likeActivo === 'S';
    // Actualiza visual inmediato
    this.likeActivo = this.likeActivo === 'S' ? 'N' : 'S';
    this.likeCount += this.likeActivo === 'S' ? 1 : -1;
    if (!quedabaActivo) {
      this.triggerLikeAnimation();
    }


    this.clickMeGusta.emit(this.idLinea);
  }

  toggleGuardado(event: Event) {
    event.stopPropagation();

    this.saveActivo = this.saveActivo === 'S' ? 'N' : 'S';
    this.saveCount += this.saveActivo === 'S' ? 1 : -1;

    this.clickGuardado.emit(this.idLinea);
  }



  clickFavorito(event: Event) {
    event.stopPropagation();
    this.marcarFavorito.emit(this.idLinea);

    // Cambia visualmente la estrella en la tarjeta
    this.esFavorita = this.esFavorita === 'S' ? 'N' : 'S';
  }
  clickCompartir(id: number) {
  console.log('TimelineCard: re-emitiendo compartir, id =', id);
  this.compartirLinea.emit(id);
}


  clickEliminar(id: number) {
    console.log('TimelineCard: re-emitiendo eliminar, id =', id);
    this.eliminarLinea.emit(id);
  }

  clickEliminarDefinitivo(id: number) {
  console.log('TimelineCard: re-emitiendo eliminar DEFINITIVO, id =', id);
  this.eliminarDefinitivo.emit(id);
}



}
