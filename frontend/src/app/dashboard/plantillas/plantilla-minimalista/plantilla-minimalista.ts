import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plantilla-minimalista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plantilla-minimalista.html',
  styleUrls: ['./plantilla-minimalista.scss']
})
export class PlantillaMinimalistaComponent {
  @Input() linea: any;
  showFullDesc = false;

  colores = [
    '#6c63ff', // púrpura
    '#00bcd4', // celeste
    '#8bc34a', // verde
    '#ffeb3b', // amarillo
    '#ff9800', // naranja
    '#e91e63', // rosa
    '#ba68c8'  // lila
  ];

  ngOnChanges() {
    if (this.linea?.hitos) {
      this.linea.hitosOrdenados = [...this.linea.hitos].sort((a, b) => {
        const fa = new Date(a.anio, a.mes - 1, a.dia);
        const fb = new Date(b.anio, b.mes - 1, b.dia);
        return fa.getTime() - fb.getTime();
      });
    }
  }

  obtenerColor(i: number) {
    return this.colores[i % this.colores.length];
  }

  toggleDesc() {
    this.showFullDesc = !this.showFullDesc;
  }
}
