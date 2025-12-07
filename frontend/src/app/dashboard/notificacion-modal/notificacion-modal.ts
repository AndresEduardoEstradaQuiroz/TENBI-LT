import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animateModalOpen, animateModalClose } from '../../../utils/animations';

export interface NotificacionConfig {
  type: 'success' | 'warning' | 'error';
  title: string;
  description?: string | null;
  button: {
    left: string;
    right?: string | null;
    principal: 'left' | 'right';
  };
}

@Component({
  selector: 'app-notificacion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-modal.html',
  styleUrls: ['./notificacion-modal.scss']
})
export class NotificacionModalComponent {
  open = false;
  title = '';
  description = '';
  btnLeft = 'Acción';
  btnRight = 'Acción';
  type: 'success' | 'warning' | 'error' = 'success';
  showRightBtn = true;

  @Output() action = new EventEmitter<'confirm' | 'cancel'>();

  private overlay: HTMLElement | null = null;

  constructor() {
    this.overlay = document.querySelector('.overlay-inner');
  }

  show(config: NotificacionConfig) {
    this.title = config.title;
    this.description = config.description || '';
    this.btnLeft = config.button.left;
    this.btnRight = config.button.right || '';
    this.type = config.type;
    this.showRightBtn = !!config.button.right;

    this.openModal();
    return new Promise<'confirm' | 'cancel'>((resolve) => {
      const confirm = () => {
        this.closeModal();
        resolve('confirm');
      };
      const cancel = () => {
        this.closeModal();
        resolve('cancel');
      };
      this.btnLeftClick = confirm;
      this.btnRightClick = cancel;
    });
  }

  btnLeftClick() { }
  btnRightClick() { }
  

  private openModal() {
  this.open = true;
  if (this.overlay) this.overlay.classList.add('show');
  const modal = document.querySelector('.notification-modal') as HTMLElement | null;
  if (modal) {
    modal.style.pointerEvents = 'auto'; // permitir clics
    animateModalOpen(modal);
  }
}

private closeModal() {
  this.open = false;
  if (this.overlay) this.overlay.classList.remove('show');
  const modal = document.querySelector('.notification-modal') as HTMLElement | null;
  if (modal) {
    animateModalClose(modal);
    modal.style.pointerEvents = 'none'; // bloquear clics al cerrar
  }
}


}
