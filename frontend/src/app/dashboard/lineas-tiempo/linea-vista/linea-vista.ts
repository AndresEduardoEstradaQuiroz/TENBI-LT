import { Component, ElementRef, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RenderPlantillaComponent } from '../render-plantilla/render-plantilla';
import { SeleccionarPlantillaComponent } from '../seleccionar-plantilla/seleccionar-plantilla';
import { LineaTiempoService } from '../linea-tiempo.service';
import { CompartirLineaComponent } from '../compartir-linea/compartir-linea';
import { ModalEliminarLineaComponent } from '../modal-eliminar-linea/modal-eliminar-linea';

@Component({
  selector: 'app-linea-vista',
  standalone: true,
  imports: [CommonModule, RenderPlantillaComponent, SeleccionarPlantillaComponent, CompartirLineaComponent, ModalEliminarLineaComponent],
  providers: [LineaTiempoService],
  templateUrl: './linea-vista.html',
  styleUrls: ['./linea-vista.scss']
})
export class LineaVistaComponent {

  lineaId!: number;
  menuAbierto = false;
  mostrarModalPlantilla = false;
  modoPlantilla: 'crear' | 'editar' = 'crear';
  idLineaAEditar!: number;
  linkGenerado: string = '';
  toastVisible = false;
  toastMessage = "";

  exportModal = false;
  exportFormat: 'pdf' | 'png' | 'jpg' | null = null;
  descargando = false;

  mostrarCompartir = false;
  mostrarEliminar = false;


  @ViewChild('contenedorPlantilla') contenedorPlantilla!: ElementRef;

  constructor(private router: Router, private route: ActivatedRoute, private lineaTiempoService: LineaTiempoService) {
   }

  ngOnInit() {
    this.lineaId = Number(this.route.snapshot.paramMap.get('id'));
  }

  regresar() {
    this.router.navigate(['/dashboard/recientes']);
  }

  editar() {
    this.router.navigate(['/editar-linea', this.lineaId]);
  }

  abrirModalSeleccionarPlantilla() {
    this.modoPlantilla = 'crear';
    this.mostrarModalPlantilla = true;
  }

  cambiarPlantilla() {
  this.idLineaAEditar = this.lineaId;
  this.modoPlantilla = 'editar';
  this.mostrarModalPlantilla = true;
  }

  cerrarModal() {
    this.mostrarModalPlantilla = false;
  }

  presentando = false;
  presentar() {
    this.presentando = true;

    // Activar ESC
    document.addEventListener("keydown", this.escListener);
  }

  cerrarPresentacion() {
    this.presentando = false;

    document.removeEventListener("keydown", this.escListener);
  }

  escListener = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      this.cerrarPresentacion();
    }
  };


  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  exportar() {
    this.menuAbierto = true;
    this.exportModal = true;
    this.exportFormat = null;
  }

  seleccionarFormato(formato: 'pdf' | 'png' | 'jpg') {
    this.exportFormat = formato;
  }

  cerrarExportModal() {
    this.exportModal = false;
    this.exportFormat = null;
  }

  async descargar() {
  if (!this.exportFormat || this.descargando) return;

  this.descargando = true;

  const original = this.contenedorPlantilla.nativeElement;

  // 1Clonar el contenido completo sin scroll
  const clon = original.cloneNode(true) as HTMLElement;

  clon.style.width = original.scrollWidth + "px";
  clon.style.height = original.scrollHeight + "px";
  clon.style.overflow = "visible";

  document.body.appendChild(clon);

  try {
    // 2️Capturar todo el clon
    const canvas = await html2canvas(clon, {
      scale: 2,
      useCORS: true
    });

    /* ===== PDF ===== */
    if (this.exportFormat === "pdf") {
      const imgData = canvas.toDataURL("image/png"); 
      const pdf = new jsPDF("landscape", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

      pdf.save(`linea-${this.lineaId}.pdf`);
    }

    /* ===== PNG ===== */
    else if (this.exportFormat === 'png') {
      const link = document.createElement("a");
      link.download = "linea.png";
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    }

    /* ===== JPG ===== */
    else if (this.exportFormat === 'jpg') {
      const link = document.createElement("a");
      link.download = "linea.jpg";
      link.href = canvas.toDataURL("image/jpeg", 1.0);
      link.click();
    }

  } catch (e) {
    console.error("Error al exportar", e);
  }

  // ELIMINAR el clon temporal
  document.body.removeChild(clon);

  this.descargando = false;
  this.exportModal = false;

  // Toast bonito
  this.toastMessage = "Archivo descargado";
  this.toastVisible = true;
  setTimeout(() => (this.toastVisible = false), 4000);
}

  compartir() {
    this.compartirLinea(this.lineaId);
  }

  compartirLinea(id: number) {
  this.lineaTiempoService.generarLinkPublico(id).subscribe({
    next: (resp) => {
      this.linkGenerado = resp.url;
      navigator.clipboard.writeText(this.linkGenerado);
      this.menuAbierto = !this.menuAbierto;

      this.toastVisible = false;
      setTimeout(() => {
        this.toastMessage = "Enlace copiado al portapapeles";
        this.toastVisible = true;
      }, 10);

      // Ocultar después
      setTimeout(() => {
        this.toastVisible = false;
      }, 4000);
    },
    error: (err) => console.error(err)
  });
}


  eliminarLinea() {
  this.lineaTiempoService.eliminarLinea(this.lineaId).subscribe({
    next: () => {
      this.mostrarEliminar = false;   // cerrar modal

      // Mostrar toast bonito
      
      this.toastMessage = "Línea movida a eliminados";
      this.toastVisible = true;
      // Ocultar el toast después de 4s
      setTimeout(() => {
        this.toastVisible = false;
      }, 4000);

      setTimeout(() => {
        this.router.navigate(['/dashboard/recientes']);
      }, 600);
    },
    error: (err) => {
      console.error(err);
      this.toastMessage = "Error al eliminar la línea";
      this.toastVisible = true;
    }
  });
}

  
}
