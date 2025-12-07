import { gsap } from 'gsap';

export function animateModalOpen(element: HTMLElement) {
  gsap.fromTo(element, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.3 });
}

export function animateModalClose(element: HTMLElement) {
  gsap.to(element, { opacity: 0, y: -50, duration: 0.3 });
}
export function animateProfileTrigger(scale: number, duration: number = 0.15): void {
  const trigger = document.getElementById('profile-trigger');
  if (trigger) {
    gsap.to(trigger, { scale, duration });
  }
}