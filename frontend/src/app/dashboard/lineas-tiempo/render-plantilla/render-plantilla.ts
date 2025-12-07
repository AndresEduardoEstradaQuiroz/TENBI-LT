import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantillaClasicaComponent } from '../../plantillas/plantilla-clasica/plantilla-clasica';
import { PlantillaMinimalistaComponent } from '../../plantillas/plantilla-minimalista/plantilla-minimalista';
import { PlantillaModernaComponent } from '../../plantillas/plantilla-moderna/plantilla-moderna';
import { LineaTiempoService } from '../linea-tiempo.service';

@Component({
  selector: 'app-render-plantilla',
  standalone: true,
  imports: [
    CommonModule,
    PlantillaClasicaComponent,
    PlantillaMinimalistaComponent,
    PlantillaModernaComponent
  ],
  templateUrl: './render-plantilla.html',
  styleUrls: ['./render-plantilla.scss']
})
export class RenderPlantillaComponent implements OnInit {

  @Input() linea: any = null;           // <-- si viene desde la vista pública
  @Input() plantillaId!: number;
  @Input() lineaId!: number | null;     // <-- solo la vista privada lo envía
  
  cargando = true;

  constructor(
    private lineaService: LineaTiempoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    // Si viene desde la vista pública → YA TENGO LA LÍNEA
    if (this.linea && !this.lineaId) {
      this.cargando = false;
      return;
    }

    // Si viene desde la vista del usuario → SÍ CARGAMOS POR ID
    if (this.lineaId) {
      this.lineaService.obtenerLineaPorId(this.lineaId).subscribe({
        next: (data) => {
          this.linea = data;
          this.plantillaId = Number(data.plantilla);
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargando = false;
        }
      });
    }
  }
}
