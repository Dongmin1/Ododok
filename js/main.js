const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');
const heroPhoto = document.querySelector('.hero-photo');
const newsletterForm = document.querySelector('.newsletter form');

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 36);
};

const closeMenu = () => {
  menuButton?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', '메뉴 열기');
  mobileMenu?.classList.remove('is-open');
  mobileMenu?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  mobileMenu?.classList.toggle('is-open', isOpen);
  mobileMenu?.setAttribute('aria-hidden', String(!isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    obs.unobserve(entry.target);
  });
}, { threshold: 0.16, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

let ticking = false;
const updateParallax = () => {
  if (heroPhoto && window.innerWidth > 900 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const y = Math.min(window.scrollY * 0.045, 16);
    const scale = 1 + Math.min(window.scrollY / 18000, 0.012);
    heroPhoto.style.transform = `translate3d(-10px, ${y}px, 0) scale(${scale})`;
  }
  ticking = false;
};
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
}, { passive: true });

newsletterForm?.addEventListener('submit', event => {
  event.preventDefault();
  alert('뉴스레터 구독 기능은 준비 중입니다.');
});

const diagnosisModal = document.querySelector('#diagnosis-modal');
const diagnosisForm = document.querySelector('#diagnosis-form');
const diagnosisSteps = [...document.querySelectorAll('.diagnosis-step')];
const diagnosisProgress = document.querySelector('.modal-progress span');
let diagnosisStep = 1;

const showDiagnosisStep = step => {
  diagnosisStep = step;
  diagnosisSteps.forEach(el => el.classList.toggle('active', Number(el.dataset.step) === step));
  if (diagnosisProgress) diagnosisProgress.style.width = `${Math.min(step, 3) * 33.333}%`;
};
const openDiagnosis = () => {
  diagnosisModal?.classList.add('open');
  diagnosisModal?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  showDiagnosisStep(1);
};
const closeDiagnosis = () => {
  diagnosisModal?.classList.remove('open');
  diagnosisModal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};
document.querySelectorAll('[data-open-diagnosis]').forEach(btn => btn.addEventListener('click', openDiagnosis));
document.querySelectorAll('[data-close-diagnosis]').forEach(btn => btn.addEventListener('click', closeDiagnosis));
document.querySelectorAll('.modal-next').forEach(btn => btn.addEventListener('click', () => {
  if (diagnosisStep === 1) {
    const field = diagnosisForm?.querySelector('[name="business"]');
    if (!field?.value.trim()) { field?.focus(); return; }
  }
  showDiagnosisStep(Math.min(diagnosisStep + 1, 3));
}));
document.querySelectorAll('.modal-prev').forEach(btn => btn.addEventListener('click', () => showDiagnosisStep(Math.max(diagnosisStep - 1, 1))));
diagnosisForm?.addEventListener('submit', event => { event.preventDefault(); showDiagnosisStep(4); });
window.addEventListener('keydown', event => { if (event.key === 'Escape') closeDiagnosis(); });
