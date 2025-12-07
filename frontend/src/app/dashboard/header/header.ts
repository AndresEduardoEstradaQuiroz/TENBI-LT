import { Component, ElementRef, AfterViewInit, Renderer2, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { setupModalHandlers } from '../../../utils/modal-handler';
import { AuthService } from '../../auth/auth.service';
import { Usuario } from '../../models/usuario.model';
import { Router, RouterModule } from '@angular/router';
import { ModalEventService } from '../modal-event.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements AfterViewInit, OnInit {

  usuarioActual: Usuario | null = null;
  isAuthenticated = false;
  esInvitado = false;
  readonly BACKEND_URL = 'http://localhost:8080';


  @Input() titulo: string = 'Recientes';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    public authService: AuthService,
    private router: Router,
    private modalEventService: ModalEventService
  ) { }

  ngOnInit(): void {
    this.esInvitado = this.authService.esInvitado();
    this.isAuthenticated = this.authService.isAuthenticated();

    if (this.isAuthenticated && !this.esInvitado) {
      this.usuarioActual = this.authService.getUsuario();

      this.authService.fetchCurrentUser().subscribe({
        next: (resp) => {
          if (resp.usuario) {
            let foto = resp.usuario.fotoPerfil;
            // Solo anteponer BACKEND_URL si es ruta relativa
            if (foto && !foto.startsWith('http')) {
              foto = `${this.BACKEND_URL}${foto}`;
            }

            this.usuarioActual = {
              ...resp.usuario,
              fotoPerfil: foto
            };
          }
        },
        error: (err) => console.error('Error al obtener usuario actual:', err)
      });


    }
  }

  ngAfterViewInit() {
    if (this.isAuthenticated && !this.esInvitado) {
      const profileTrigger = this.el.nativeElement.querySelector('#profile-trigger');
      const profileMenu = this.el.nativeElement.querySelector('#profile-menu');

      if (profileTrigger && profileMenu) {
        this.renderer.listen(profileTrigger, 'click', (e: Event) => {
          e.stopPropagation();
          if (profileMenu.classList.contains('open')) {
            this.closeProfileMenu(profileMenu, profileTrigger);
          } else {
            this.openProfileMenu(profileMenu, profileTrigger);
          }
        });

        this.renderer.listen(document, 'click', (e: Event) => {
          const target = e.target as HTMLElement;
          if (this.isClickOutside(target, profileMenu, profileTrigger) && profileMenu.classList.contains('open')) {
            this.closeProfileMenu(profileMenu, profileTrigger);
          }
        });
      }
    }

    setupModalHandlers();
  }

  openProfileMenu(menu: HTMLElement, trigger: HTMLElement) {
    menu.classList.add('open');
    gsap.to(trigger, { scale: 0.9, duration: 0.15 });
  }

  closeProfileMenu(menu: HTMLElement, trigger: HTMLElement) {
    menu.classList.remove('open');
    gsap.to(trigger, { scale: 1, duration: 0.15 });
  }

  isClickOutside(target: HTMLElement, menu: HTMLElement, trigger: HTMLElement): boolean {
    return !(menu.contains(target) || trigger.contains(target));
  }

  logout(): void {
    if (this.esInvitado) {
      localStorage.removeItem('modo_invitado');
    } else {
      this.authService.logout();
    }

    this.usuarioActual = null;
    this.isAuthenticated = false;
    this.esInvitado = false;
    this.router.navigate(['/login']);
  }

  private openLoginAlertModal(): void {
    const modal = this.el.nativeElement.querySelector('#login-alert-modal');
    const backdrop = this.el.nativeElement.querySelector('#login-alert-backdrop');

    if (modal && backdrop) {
      this.renderer.setStyle(modal, 'display', 'flex');
      backdrop.classList.add('backdrop-active');
    }
  }

  cerrarModalAvisoAcceso(): void {
    const modal = this.el.nativeElement.querySelector('#login-alert-modal');
    const backdrop = this.el.nativeElement.querySelector('#login-alert-backdrop');

    if (modal && backdrop) {
      this.renderer.setStyle(modal, 'display', 'none');
      backdrop.classList.remove('backdrop-active');
    }
  }

  onNuevaLineaClick(): void {
    if (this.esInvitado || !this.isAuthenticated) {
      this.openLoginAlertModal();
      return;
    }

    this.modalEventService.emitirAbrirModalLinea();
  }
}
