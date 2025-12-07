import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plantilla-clasica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plantilla-clasica.html',
  styleUrls: ['./plantilla-clasica.scss']
})
export class PlantillaClasicaComponent {
  @Input() linea: any; 

  ngOnChanges() {
    if (this.linea?.hitos) {
      this.linea.hitosOrdenados = [...this.linea.hitos].sort((a, b) => {
        const fechaA = new Date(a.anio, a.mes - 1, a.dia);
        const fechaB = new Date(b.anio, b.mes - 1, b.dia);
        return fechaA.getTime() - fechaB.getTime();
      });
    }
  }

  formatearFecha(dia: number | null, mes: number | null, anio: number | null): string {
  if (!anio) return ''; // Sin año no tiene sentido mostrar fecha

  // Solo año
  if (!mes && !dia) return `${anio}`;

  // Mes y año
  if (mes && !dia) {
    const mm = mes.toString().padStart(2, '0');
    return `${mm}/${anio}`;
  }

  // Día, mes y año
  if (dia && mes) {
    const dd = dia.toString().padStart(2, '0');
    const mm = mes.toString().padStart(2, '0');
    return `${dd}/${mm}/${anio}`;
  }

  return `${anio}`;
}

}
