import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineaTiempoService } from '../linea-tiempo.service';

@Component({
  selector: 'app-compartir-linea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compartir-linea.html',
  styleUrls: ['./compartir-linea.scss']
})
export class CompartirLineaComponent implements OnInit {

  @Input() lineaId!: number;
  @Output() cerrado = new EventEmitter<void>();

  // Referencia al input para actualizar el DOM manualmente
  @ViewChild('inputLink') inputLink!: ElementRef<HTMLInputElement>;

  linkGenerado = '';
  toastVisible = false;
  toastMessage = '';

  constructor(
    private lineaTiempoService: LineaTiempoService
  ) {}

  ngOnInit(): void {
    this.generarLinkAutomatico();
  }

  generarLinkAutomatico() {
    if (!this.lineaId) return;

    this.lineaTiempoService.generarLinkPublico(this.lineaId).subscribe({
      next: (resp) => {
        this.linkGenerado = resp.url;
        setTimeout(() => {
          if (this.inputLink?.nativeElement) {
            this.inputLink.nativeElement.value = this.linkGenerado;
          }
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  copiar() {
    if (!this.linkGenerado) return;

    navigator.clipboard.writeText(this.linkGenerado);
    this.mostrarToast("Enlace copiado en el portapaples");
  }

  mostrarToast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = false;

    setTimeout(() => {
      this.toastVisible = true;
    }, 20);

    setTimeout(() => {
      this.toastVisible = false;
    }, 2500);
  }

  cerrar() {
    this.cerrado.emit();
  }
  shareWhatsApp() {
  if (!this.linkGenerado) return;

  const url = `https://wa.me/?text=${encodeURIComponent(this.linkGenerado)}`;
  window.open(url, '_blank');
}

shareInstagram() {
  if (!this.linkGenerado) return;

  const url = `https://www.instagram.com/?url=${encodeURIComponent(this.linkGenerado)}`;
  window.open(url, '_blank');
}

shareMessenger() {
  if (!this.linkGenerado) return;

  const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(this.linkGenerado)}&app_id=123456789&redirect_uri=${encodeURIComponent(this.linkGenerado)}`;
  window.open(url, '_blank');
}

shareFacebook() {
  if (!this.linkGenerado) return;

  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.linkGenerado)}`;
  window.open(url, '_blank');
}

}
