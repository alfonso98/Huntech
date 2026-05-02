// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', scrollY > 50), { passive: true });

// ── MOBILE NAV ──
const btn = document.getElementById('hamburger');
const mNav = document.getElementById('mobile-nav');
btn.addEventListener('click', () => {
  const open = mNav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

function closeMobileNav() {
  mNav.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// ── FADE-IN OBSERVER ──
const fadeObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ── COUNTERS ──
function animCounter(el, target, suffix, dur = 2000) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / dur, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + (suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterTargets = [
  { id: 'm1', v: 120 }, { id: 'm2', v: 85 }, { id: 'm3', v: 8 }, { id: 'm4', v: 40 },
  { id: 'c1', v: 120, s: '+' }, { id: 'c2', v: 85, s: '+' }, { id: 'c3', v: 8, s: '+' }, { id: 'c4', v: 40, s: '+' }
];
let countersStarted = false;
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !countersStarted) {
      countersStarted = true;
      counterTargets.forEach(t => {
        const el = document.getElementById(t.id);
        if (el) animCounter(el, t.v, t.s || '');
      });
    }
  });
}, { threshold: 0.3 }).observe(document.querySelector('.metrics-grid'));

// ── CONTACT FORM ──
document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  if (!name || !email || !message) return;
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  document.getElementById('contact-form').reset();
  setTimeout(() => toast.classList.remove('show'), 4000);
});

// ── I18N ──
const translationCache = {};

async function loadTranslations(lang) {
  if (translationCache[lang]) return translationCache[lang];
  const res = await fetch(`./langs/${lang}.json`);
  translationCache[lang] = await res.json();
  return translationCache[lang];
}

function applyTranslations(lang, strings) {
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const t = strings[el.getAttribute('data-i18n')];
    if (t !== undefined) el.textContent = t;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const t = strings[el.getAttribute('data-i18n-html')];
    if (t !== undefined) el.innerHTML = t;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const t = strings[el.getAttribute('data-i18n-placeholder')];
    if (t !== undefined) el.placeholder = t;
  });

  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}

async function setLanguage(lang) {
  const strings = await loadTranslations(lang);
  applyTranslations(lang, strings);
}

document.querySelectorAll('.lang-btn').forEach(b => {
  b.addEventListener('click', () => setLanguage(b.dataset.lang));
});

setLanguage(localStorage.getItem('lang') || 'en');
