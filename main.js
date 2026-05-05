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

// ── COUNTERS ── (metrics-grid: m1–m4 | hero-stats: c1–c4)
// function animCounter(el, target, suffix, dur = 2000) {
//   let start = null;
//   const step = ts => {
//     if (!start) start = ts;
//     const progress = Math.min((ts - start) / dur, 1);
//     const eased = 1 - Math.pow(1 - progress, 3);
//     el.textContent = Math.floor(eased * target) + (suffix || '');
//     if (progress < 1) requestAnimationFrame(step);
//   };
//   requestAnimationFrame(step);
// }
//
// const counterTargets = [
//   { id: 'm1', v: 120 }, { id: 'm2', v: 85 }, { id: 'm3', v: 8 }, { id: 'm4', v: 40 },
//   { id: 'c1', v: 120, s: '+' }, { id: 'c2', v: 85, s: '+' }, { id: 'c3', v: 8, s: '+' }, { id: 'c4', v: 40, s: '+' }
// ];
// let countersStarted = false;
// new IntersectionObserver(entries => {
//   entries.forEach(e => {
//     if (e.isIntersecting && !countersStarted) {
//       countersStarted = true;
//       counterTargets.forEach(t => {
//         const el = document.getElementById(t.id);
//         if (el) animCounter(el, t.v, t.s || '');
//       });
//     }
//   });
// }, { threshold: 0.3 }).observe(document.querySelector('.metrics-grid'));

// ── CONTACT METHOD TOGGLE ──
const contactValueLabel = document.getElementById('contact-value-label');
const contactValueInput = document.getElementById('contact-value');

function updateContactField(method) {
  const isWhatsapp = method === 'whatsapp';
  const strings = translationCache[localStorage.getItem('lang') || 'es'] || {};
  const labelKey = isWhatsapp ? 'form.phone.label' : 'form.email.label';
  const placeholderKey = isWhatsapp ? 'form.phone.placeholder' : 'form.email.placeholder';
  contactValueLabel.setAttribute('data-i18n', labelKey);
  contactValueLabel.textContent = strings[labelKey] || (isWhatsapp ? 'Cellphone Number' : 'Email Address');
  contactValueInput.type = isWhatsapp ? 'tel' : 'email';
  contactValueInput.setAttribute('data-i18n-placeholder', placeholderKey);
  contactValueInput.placeholder = strings[placeholderKey] || (isWhatsapp ? '+52 55 1234 5678' : 'john@company.com');
  contactValueInput.value = '';
  contactValueInput.classList.remove('invalid');
  document.getElementById('contact-value-error').textContent = '';
}

document.querySelectorAll('input[name="contact-method"]').forEach(radio => {
  radio.addEventListener('change', () => updateContactField(radio.value));
});

// ── CONTACT VALIDATION ──
function validatePhone(val) {
  return /^\+\d{7,15}$/.test(val.replace(/\s/g, ''));
}

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function checkContactValue() {
  const value = contactValueInput.value.trim();
  const isWhatsapp = document.querySelector('input[name="contact-method"]:checked')?.value === 'whatsapp';
  const strings = translationCache[localStorage.getItem('lang') || 'es'] || {};
  let error = '';
  if (value) {
    if (isWhatsapp && !validatePhone(value)) {
      error = strings['form.error.phone'] || 'Include country code (e.g. +52 55 1234 5678)';
    } else if (!isWhatsapp && !validateEmail(value)) {
      error = strings['form.error.email'] || 'Enter a valid email address';
    }
  }
  contactValueInput.classList.toggle('invalid', !!error);
  document.getElementById('contact-value-error').textContent = error;
  return !error && value !== '';
}

contactValueInput.addEventListener('blur', checkContactValue);
contactValueInput.addEventListener('input', () => {
  if (contactValueInput.classList.contains('invalid')) checkContactValue();
});

// ── CONTACT FORM ──
const SUBMIT_COOLDOWN_MS = 3 * 60 * 1000;
const submitBtn = document.querySelector('#contact-form button[type="submit"]');
let cooldownTimer = null;

function getRemainingCooldown() {
  const last = parseInt(localStorage.getItem('lastContactSubmit') || '0', 10);
  return Math.max(0, SUBMIT_COOLDOWN_MS - (Date.now() - last));
}

function startCooldownUI() {
  submitBtn.disabled = true;
  clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    const left = getRemainingCooldown();
    const mins = Math.floor(left / 60000);
    const secs = Math.floor((left % 60000) / 1000);
    submitBtn.querySelector('span').textContent = `Wait ${mins}:${String(secs).padStart(2, '0')}`;
    if (left <= 0) {
      clearInterval(cooldownTimer);
      submitBtn.disabled = false;
      submitBtn.querySelector('span').setAttribute('data-i18n', 'form.submit');
      const lang = localStorage.getItem('lang') || 'es';
      submitBtn.querySelector('span').textContent = (translationCache[lang] || {})['form.submit'] || 'Send Message';
    }
  }, 1000);
}

function parseContactNumber(number){
  if(!number.includes('+')) return '+52'+number;

  return number;
}

// Resume cooldown if page is reloaded mid-cooldown
const remainingOnLoad = getRemainingCooldown();
if (remainingOnLoad > 0) startCooldownUI();

document.getElementById('contact-form').addEventListener('submit', async e => {
  e.preventDefault();
  if (getRemainingCooldown() > 0) return;

  const name = document.getElementById('name').value.trim();
  const contactMethod = document.querySelector('input[name="contact-method"]:checked').value;
  const contactValue = contactValueInput.value.trim();
  const message = document.getElementById('message').value.trim();
  const company = document.getElementById('company').value.trim();
  const service = document.getElementById('service').value.trim();

  if (!name || !contactValue || !message) return;
  if (!checkContactValue()) return;
  const isWhatsapp = contactMethod === 'whatsapp';

  const payload = {
    lead_name: name,
    lead_preferred_medium: isWhatsapp ? 'WhatsApp' : 'Email',
    lead_email: isWhatsapp ? '' : contactValue,
    lead_celphone_number: isWhatsapp ? parseContactNumber(contactValue) : '',
    lead_company: company,
    lead_needed_service: service,
    lead_message: message,
  };

  try {
    await fetch('https://hook.us2.make.com/fna5ckvp2rap81sqn7iyytzjk3sk4ytx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (_) { /* silently continue — webhook errors shouldn't block UX */ }

  localStorage.setItem('lastContactSubmit', Date.now().toString());
  startCooldownUI();

  const toast = document.getElementById('toast');
  toast.classList.add('show');
  document.getElementById('contact-form').reset();
  updateContactField('whatsapp');
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

setLanguage(localStorage.getItem('lang') || 'es');
