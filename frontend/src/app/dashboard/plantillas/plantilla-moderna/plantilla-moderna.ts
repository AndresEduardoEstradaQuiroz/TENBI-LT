import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plantilla-moderna',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plantilla-moderna.html',
  styleUrls: ['./plantilla-moderna.scss']
})
export class PlantillaModernaComponent {
  @Input() linea: any;
}
