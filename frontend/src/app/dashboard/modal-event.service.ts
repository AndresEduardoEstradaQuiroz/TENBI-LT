import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalEventService {

  private abrirModalLineaSubject = new Subject<void>();
  abrirModalLinea$ = this.abrirModalLineaSubject.asObservable();

  emitirAbrirModalLinea() {
    this.abrirModalLineaSubject.next();
  }
}
