import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineCardComponent } from '../../timeline-card/timeline-card';
import { LineaTiempoService } from '../../lineas-tiempo/linea-tiempo.service';
import { HeaderComponent } from '../../header/header';
import { AuthService } from '../../../auth/auth.service';
import { NotificacionModalComponent, NotificacionConfig } from '../../notificacion-modal/notificacion-modal';
import { ViewChild } from '@angular/core';


@Component({
  selector: 'app-eliminados',
  standalone: true,
  imports: [CommonModule, TimelineCardComponent, HeaderComponent, NotificacionModalComponent],
  templateUrl: './eliminados.html',
  styleUrls: ['./eliminados.scss']
})
export class EliminadosComponent implements OnInit {
  @ViewChild('notif') notif!: NotificacionModalComponent;

  lineasEliminadas: any[] = [];
  cargando = true;

  constructor(
    private lineaService: LineaTiempoService,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.esInvitado()) {
      this.lineasEliminadas = [];
      this.cargando = false;
      this.cd.detectChanges();
      return;
    }
    this.cargarEliminadas();
  }

  cargarEliminadas() {
    this.cargando = true;
    this.lineaService.listarEliminadas().subscribe({
      next: (data) => {
        this.lineasEliminadas = data || [];
        this.cargando = false;
        this.cd.detectChanges();           // importante
      },
      error: (err) => {
        console.error("Error al cargar eliminadas", err);
        this.lineasEliminadas = [];
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }
  restaurarLinea(idLinea: number) {
  this.lineaService.restaurarLinea(idLinea).subscribe({
    next: () => {
      // quitar de la lista sin recargar
      this.lineasEliminadas = this.lineasEliminadas.filter(
        l => l.idLineaTiempo !== idLinea
      );
      this.cd.detectChanges();
    },
    error: (err) => console.error("Error al restaurar línea", err)
  });
}

async eliminarDefinitiva(idLinea: number) {
  if (!this.notif) return;

  // Configuración de la notificación
  const config: NotificacionConfig = {
    type: 'warning',
    title: 'Confirmar eliminar',
    description: '¿Seguro que deseas eliminar esta línea de tiempo para siempre?',
    button: {
      left: 'Sí, eliminar',
      right: 'Cancelar',
      principal: 'left'
    }
  };

  // Mostramos el modal y esperamos la acción del usuario
  const result = await this.notif.show(config);

  if (result === 'confirm') {
    this.lineaService.eliminarDefinitivo(idLinea).subscribe({
      next: () => {
        this.lineasEliminadas = this.lineasEliminadas.filter(l => l.idLineaTiempo !== idLinea);
        this.cd.detectChanges();
      },
      error: (err) => console.error("Error al eliminar definitivamente", err)
    });
  }
  // Si el usuario cancela, simplemente no hacemos nada
}


}
