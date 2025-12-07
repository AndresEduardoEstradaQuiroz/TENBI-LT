import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header';
import { TimelineCardComponent } from '../../timeline-card/timeline-card';
import { LineaTiempoService } from '../../lineas-tiempo/linea-tiempo.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, HeaderComponent, TimelineCardComponent],
  templateUrl: './favoritos.html',
  styleUrls: ['./favoritos.scss']
})
export class FavoritosComponent implements OnInit {

  favoritas: any[] = [];

  constructor(
    private lineaService: LineaTiempoService,
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.authService.esInvitado()) {
      this.favoritas = [];
      this.cd.detectChanges();
      return;
    }
    this.lineaService.obtenerFavoritas().subscribe({
      next: (resp) => {
        this.favoritas = resp;
        this.cd.detectChanges();      
      },
      error: (err) => console.error("Error al cargar favoritas", err)
    });
  }

  irALinea(id: number) {
    this.router.navigate(['/render-plantilla', id]);
  }

toggleFavorito(linea: any) {
  const nuevoEstado = linea.esFavorita === 'S' ? 'N' : 'S';

  this.lineaService.actualizarFavorito(linea.idLineaTiempo, nuevoEstado).subscribe({
    next: () => {
      if (nuevoEstado === 'N') {
        // Desmarcar → quitar de favoritos
        this.favoritas = this.favoritas.filter(f => f.idLineaTiempo !== linea.idLineaTiempo);
      } else {
        linea.esFavorita = 'S';
      }
      this.cd.detectChanges();
    },
    error: (err) => console.error("Error al actualizar favorito", err)
  });
}

}
