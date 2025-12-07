import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineaTiempoService } from '../linea-tiempo.service';

@Component({
  selector: 'app-listar-linea-tiempo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-linea-tiempo.html',
  styleUrls: ['./listar-linea-tiempo.scss']
})
export class ListarLineaTiempoComponent implements OnInit {
  lineas: any[] = [];

  constructor(private lineaService: LineaTiempoService) {}

  ngOnInit() {
    this.lineaService.obtenerLineasTiempo().subscribe({
      next: (data) => {
        console.log('Líneas de tiempo:', data);
        this.lineas = data;
      },
      error: (err) => console.error('Error al cargar líneas de tiempo:', err)
    });
  }
}
