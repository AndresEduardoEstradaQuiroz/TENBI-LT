import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LineaCacheService {
  private cacheKey = 'linea_tiempo_cache';
  // archivos en memoria RAM (no persistentes)
  imagenPortada: File | null = null;
  imagenesHitos: File[] = [];


  setDatosLinea(datos: any) {
    const copia = { ...datos };

    // NO guardar los archivos
    delete copia.imagenPortada;

    copia.hitos = copia.hitos.map((h: any) => {
      const copiaH = { ...h };
      delete copiaH.imagenHito;
      return copiaH;
    });

    localStorage.setItem(this.cacheKey, JSON.stringify(copia));
  }

  setArchivos(portada: File | null, hitos: File[]) {
    this.imagenPortada = portada;
    this.imagenesHitos = hitos;
  }

  getDatosLinea() {
    const data = localStorage.getItem(this.cacheKey);
    return data ? JSON.parse(data) : null;
  }

  getArchivos() {
    return {
      portada: this.imagenPortada,
      hitos: this.imagenesHitos
    };
  }

  clearDatosLinea() {
    localStorage.removeItem(this.cacheKey);
    this.imagenPortada = null;
    this.imagenesHitos = [];
  }
}