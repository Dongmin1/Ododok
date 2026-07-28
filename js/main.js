const header = document.getElementById('siteHeader');
const progress = document.getElementById('scrollProgress');
const menuButton = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');

function updateScroll() {
  const top = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (top / max) * 100 : 0}%`;
  header.classList.toggle('scrolled', top > 15);
}
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

menuButton.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'CLOSE' : 'MENU';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = 'MENU';
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
