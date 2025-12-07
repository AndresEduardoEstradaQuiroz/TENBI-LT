import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineaCacheService } from '../linea-cache.service';
import { LineaTiempoService } from '../linea-tiempo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seleccionar-plantilla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccionar-plantilla.html',
  styleUrls: ['./seleccionar-plantilla.scss']
})
export class SeleccionarPlantillaComponent implements OnInit {
  @Output() cerrarPlantilla = new EventEmitter<void>();
  @Output() volverFormulario = new EventEmitter<void>();
  @Input() lineaId!: number;
  @Input() modo: 'crear' | 'editar' = 'crear';


  plantillas = [
  {
    nombre: 'Clásica',
    descripcion: 'Diseño tradicional y elegante',
    color: 'linear-gradient(135deg, #6b73ff, #000dff)',
    id: 1
  },
  {
    nombre: 'Minimalista',
    descripcion: 'Simplicidad y claridad',
    color: 'linear-gradient(135deg, #eef1f5, #d8dee5)',
    id: 2
  },
  {
    nombre: 'Moderna',
    descripcion: 'Tendencias actuales',
    color: 'linear-gradient(135deg, #004f92, #1b6cb1)',
    id: 3
  }
];

  plantillaSeleccionada: any = null;
  datosLinea: any;

  constructor(
    private cache: LineaCacheService,
    private lineaService: LineaTiempoService,
    private router: Router
  ) {}

  @Output() cerrar = new EventEmitter<void>();

  ngOnInit() {
    if (this.modo === 'editar') {
    this.lineaService.obtenerLineaPorId(this.lineaId).subscribe(data => {
      const plantillaActual = this.plantillas.find(p => p.id === data.plantilla);
      this.plantillaSeleccionada = plantillaActual;
    });
    return;
  }
    this.datosLinea = this.cache.getDatosLinea();
  }

  seleccionar(plantilla: any) {
    this.plantillaSeleccionada = plantilla;
  }

  volver() {
    this.volverFormulario.emit();
  }

  generar() {
    if (!this.plantillaSeleccionada) return;

  // ----- MODO EDITAR -----
  if (this.modo === 'editar') {
  this.lineaService.actualizarPlantilla(this.lineaId, this.plantillaSeleccionada.id)
    .subscribe(() => {
      this.cerrarPlantilla.emit();
      // Aquí podrías refrescar datos sin recargar la página si deseas
      window.location.reload();
    });
  return;
}


  // ----- MODO CREAR -----
  const datos = {
    ...this.datosLinea,
    plantilla: this.plantillaSeleccionada.id
  };

  const formData = new FormData();

  // Campos principales
  formData.append("titulo", datos.titulo);
  formData.append("idTema", datos.idTema ?? '');
  formData.append("descripcion", datos.descripcion || '');
  formData.append("url", datos.url || '');
  formData.append("palabrasClave", datos.palabrasClave || '');
  formData.append("plantilla", datos.plantilla);

  const archivos = this.cache.getArchivos();

  if (archivos.portada) {
    formData.append("imagenPortada", archivos.portada);
  }

  // Para cada hito: datos en JSON + archivos en paralelo
datos.hitos.forEach((h: any, i: number) => {
  // Convertir cada hito a JSON
  const jsonHito = JSON.stringify({
    tituloHito: h.tituloHito,
    descripcionHito: h.descripcionHito || '',
    anio: h.anio,
    mes: h.mes ?? null,
    dia: h.dia ?? null,
    relevancia: h.relevancia ?? null,
    url: h.url || ''
  });
  formData.append("hitos", jsonHito);

  // Obtener archivo real si existe
  const archivo = archivos.hitos[i];

  if (archivo) {
    // Imagen real
    formData.append("imagenesHitos", archivo, archivo.name);
  } else {
    // Placeholder vacío para mantener el índice correcto
    const placeholder = new Blob([''], { type: 'application/octet-stream' });
    formData.append("imagenesHitos", placeholder as any, `empty_${i}.bin`);
  }
});


  this.lineaService.crearLineaTiempo(formData).subscribe({
    next: (data) => {
      this.cache.clearDatosLinea();
      this.cerrarPlantilla.emit();
      this.router.navigate(['/linea', data.idLineaTiempo]);
    },
    error: (err) => console.error('Error al guardar en BD', err)
  });
}

}