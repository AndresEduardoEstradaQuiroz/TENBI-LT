import gsap from "gsap"; //Nuevo
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip); //..

export function setupModalHandlers(): void {
  const settingsBtn = document.getElementById('settings');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const settingsModal = document.getElementById('settings-modal');
  const closeBtn = settingsModal?.querySelector('#settings-modal-close') as HTMLElement | null;

  const openSettingsModal = () => {
    if (!modalBackdrop || !settingsModal) return;

    modalBackdrop.classList.add('backdrop-active');
    settingsModal.style.display = 'block';
    settingsModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    settingsModal.focus();
  };

  const closeSettingsModal = () => {
    if (!modalBackdrop || !settingsModal) return;

    modalBackdrop.classList.remove('backdrop-active');
    settingsModal.style.display = 'none';
    settingsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  settingsBtn?.addEventListener('click', openSettingsModal);
  closeBtn?.addEventListener('click', closeSettingsModal);

  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeSettingsModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop?.classList.contains('backdrop-active')) {
      closeSettingsModal();
    }
  });

  
}
