import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LineaTiempoService } from '../linea-tiempo.service';
import { Router } from '@angular/router';
import { LineaCacheService } from '../linea-cache.service';

@Component({
  selector: 'app-crear-linea-tiempo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-linea-tiempo.html',
  styleUrls: ['./crear-linea-tiempo.scss']
})
export class CrearLineaTiempoComponent implements OnInit {
  lineaTiempoForm: FormGroup;
  mensaje: string | null = null;
  temas: any[] = [];
  previewPortada: string | ArrayBuffer | null = null;
  portadaFile: File | null = null;

  hitoExpansions: boolean[] = [];

  constructor(private fb: FormBuilder, private lineaService: LineaTiempoService, private cacheService: LineaCacheService, private router: Router) {
    this.lineaTiempoForm = this.fb.group({
      titulo: ['', Validators.required],
      idTema: [null, Validators.required],
      descripcion: [''],
      url: [''],
      palabrasClave: [''],
      imagenPortada: [null],
      hitos: this.fb.array([])
    }, {
      validators: [this.minimoTresHitosValidator.bind(this)]
    });
  }


  ngOnInit() {
    this.lineaService.obtenerTemas().subscribe({
      next: (data) => this.temas = data,
      error: (err) => console.error('Error al cargar temas', err)
    });

    const cached = this.cacheService.getDatosLinea();

    if (cached) {
      this.lineaTiempoForm.patchValue({
        titulo: cached.titulo || '',
        idTema: cached.idTema || null,
        descripcion: cached.descripcion || '',
        url: cached.url || '',
        palabrasClave: cached.palabrasClave || '',
      });

      if (cached.hitos && cached.hitos.length > 0) {
        this.hitos.clear();

        cached.hitos.forEach((h: any) => {
          const hitoForm = this.fb.group({
            tituloHito: [h.tituloHito || '', Validators.required],
            descripcionHito: [h.descripcionHito || ''],
            anio: [h.anio || '', Validators.required],
            mes: [h.mes ?? null],
            dia: [h.dia ?? null],
            relevancia: [h.relevancia ?? null],
            imagenHito: [h.imagenHito || null],
            preview: [h.preview || ''],
            url: [h.url || '']
          });

          this.hitos.push(hitoForm);
          this.hitoExpansions.push(true);
        });
      }
    } else {
      if (this.hitos.length === 0) this.agregarHito();
    }

    // Aquí se normaliza TODO: si mes o dia es '' lo convierte a null
    this.lineaTiempoForm.valueChanges.subscribe(raw => {
      const normalizado = {
        ...raw,
        hitos: raw.hitos.map((h: any) => ({
          ...h,
          mes: h.mes === '' ? null : h.mes,
          dia: h.dia === '' ? null : h.dia,
          relevancia: h.relevancia === '' ? null : h.relevancia
        }))
      };

      this.cacheService.setDatosLinea(normalizado);
    });
  }

  get hitos(): FormArray {
    return this.lineaTiempoForm.get('hitos') as FormArray;
  }

  mensajeLimite: string | null = null;
  agregarHito() {

    // Máximo 15 hitos
    if (this.hitos.length >= 15) {
      this.mensajeLimite = "Has alcanzado el límite máximo de 15 hitos.";
      setTimeout(() => this.mensajeLimite = null, 3000);
      return;
    }

    const hitoForm = this.fb.group({
      tituloHito: ['', Validators.required],
      descripcionHito: [''],
      anio: ['', Validators.required],
      mes: [null],
      dia: [null],
      relevancia: [null],
      imagenHito: [null],
      preview: [''],
      url: ['']
    });

    this.hitos.push(hitoForm);

    // Manejo de expansiones
    this.hitoExpansions.fill(false);
    this.hitoExpansions.push(true);
  }


  eliminarHito(index: number) {
    this.hitos.removeAt(index);
    this.hitoExpansions.splice(index, 1);

    if (this.hitos.length > 0) {
      if (!this.hitoExpansions.some(e => e === true)) {
        this.hitoExpansions[this.hitos.length - 1] = true;
      }
    }
  }

  toggleHitoExpansion(index: number, event: Event) {
    const target = event.target as HTMLElement;
    if (target.closest('input') || target.closest('textarea') || target.closest('select') || target.closest('button')) {
      return;
    }

    const isExpanded = this.hitoExpansions[index];

    if (isExpanded) {
      this.hitoExpansions[index] = false;
    } else {
      this.hitoExpansions.fill(false);
      this.hitoExpansions[index] = true;
    }
  }

  onPortadaSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.portadaFile = file;
    this.cacheService.setArchivos(file, this.cacheService.imagenesHitos);
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) return;

    this.hitos.at(index).patchValue({ imagenHito: null });

    const currentHitos = this.cacheService.imagenesHitos;
    currentHitos[index] = file;
    this.cacheService.setArchivos(this.portadaFile, currentHitos);
  }

  onSubmit() {
    if (this.lineaTiempoForm.invalid) {
      this.mensaje = 'Por favor, completa los campos requeridos y asegúrate de que haya al menos un hito válido.';
      setTimeout(() => this.mensaje = null, 3000);
      return;
    }

    this.cacheService.setDatosLinea(this.lineaTiempoForm.value);

    this.cerrarModal.emit(false);
    this.abrirPlantilla.emit();
  }

  @Output() cerrarModal = new EventEmitter<boolean>();

  cerrar() {
    this.cerrarModal.emit(true);
  }

  @Output() abrirPlantilla = new EventEmitter<void>();

  mostrarConfirmacion: boolean = false;

  onCancelarClick() {
    this.mostrarConfirmacion = true;
  }

  cancelarAccion() {
    this.mostrarConfirmacion = false;
  }

  confirmarCancelacion() {
    this.cacheService.clearDatosLinea();
    this.cerrarModal.emit(true);
    this.mostrarConfirmacion = false;
  }
  // Validador personalizado: requiere mínimo 3 hitos válidos
  minimoTresHitosValidator(form: FormGroup) {
    const hitos = form.get('hitos') as FormArray;
    if (!hitos) return null;

    // Contar SOLO hitos válidos que tienen tituloHito y el año 
    const hitosValidos = hitos.controls.filter(h =>
      h.get('tituloHito')?.valid && h.get('anio')?.valid
    );

    return hitosValidos.length >= 3 ? null : { minimoTresHitos: true };
  }

}
